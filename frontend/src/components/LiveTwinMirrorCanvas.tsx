import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import type { LandmarkPoint, StandingCalibrationProfile, RepPhase } from "../lib/kinematicFilters";
import { normalizeToPelvicFrame, generateCanonicalSquatPose, calculateFormDiscrepancy, type FormDiscrepancyResult } from "../lib/ghostKinematics";

interface LiveTwinMirrorCanvasProps {
  worldLandmarks?: LandmarkPoint[];
  calibrationProfile?: StandingCalibrationProfile | null;
  kneeAngle?: number;
  fsmPhase?: RepPhase;
  normalizedKamNmKg?: number;
  showGhost?: boolean;
  onDiscrepancyUpdate?: (res: FormDiscrepancyResult) => void;
  className?: string;
}

// MediaPipe anatomical connections for humanoid skeletal rig
const BONE_CONNECTIONS: [number, number][] = [
  // Torso & Hips
  [11, 12], // Shoulder to shoulder
  [23, 24], // Hip to hip
  [11, 23], // Left torso
  [12, 24], // Right torso
  // Left Arm
  [11, 13], // Left upper arm
  [13, 15], // Left forearm
  // Right Arm
  [12, 14], // Right upper arm
  [14, 16], // Right forearm
  // Left Leg
  [23, 25], // Left femur
  [25, 27], // Left tibia
  // Right Leg
  [24, 26], // Right femur
  [26, 28], // Right tibia
];

export const LiveTwinMirrorCanvas: React.FC<LiveTwinMirrorCanvasProps> = ({
  worldLandmarks,
  calibrationProfile,
  kneeAngle = 175,
  fsmPhase = "IDLE",
  normalizedKamNmKg = 0.2,
  showGhost = true,
  onDiscrepancyUpdate,
  className = "w-full h-full min-h-[380px]"
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // References to keep Three.js scene instances without re-creating on every prop change
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Mesh registries for live twin & ghost
  const liveJointsRef = useRef<THREE.Mesh[]>([]);
  const liveBonesRef = useRef<THREE.Mesh[]>([]);
  const ghostJointsRef = useRef<THREE.Mesh[]>([]);
  const ghostBonesRef = useRef<THREE.Mesh[]>([]);
  const tensionLinesRef = useRef<{ left: THREE.Line; right: THREE.Line } | null>(null);

  // Mouse orbit state
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({ y: 0, x: 0.1 });

  // 1. Initialize Three.js Scene
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x09090b);
    scene.fog = new THREE.FogExp2(0x09090b, 0.35);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 20);
    camera.position.set(0, 0.2, 2.3);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x0ea5e9, 2.0); // Cyan rim
    dirLight1.position.set(2, 3, 2);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x8b5cf6, 1.8); // Violet rim
    dirLight2.position.set(-2, 2, -2);
    scene.add(dirLight2);

    // Holographic Grid Floor
    const grid = new THREE.GridHelper(4, 20, 0x0ea5e9, 0x1e293b);
    grid.position.y = -0.95;
    scene.add(grid);

    // Concentric Stance Rings
    const ringGeo1 = new THREE.RingGeometry(0.25, 0.26, 32);
    const ringGeo2 = new THREE.RingGeometry(0.50, 0.51, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x0284c7, side: THREE.DoubleSide, transparent: true, opacity: 0.3 });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat);
    const ring2 = new THREE.Mesh(ringGeo2, ringMat);
    ring1.rotation.x = Math.PI / 2;
    ring2.rotation.x = Math.PI / 2;
    ring1.position.y = -0.948;
    ring2.position.y = -0.948;
    scene.add(ring1);
    scene.add(ring2);

    // ── Build Live Twin Rig ──────────────────────────────────────────
    const liveJointMat = new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      emissive: 0x0284c7,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.8
    });
    const jointGeo = new THREE.SphereGeometry(0.025, 16, 16);
    const liveJoints: THREE.Mesh[] = [];
    for (let i = 0; i < 33; i++) {
      const mesh = new THREE.Mesh(jointGeo, liveJointMat.clone());
      mesh.visible = false;
      scene.add(mesh);
      liveJoints.push(mesh);
    }
    liveJointsRef.current = liveJoints;

    const liveBoneMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0369a1,
      emissiveIntensity: 0.4,
      roughness: 0.3,
      metalness: 0.7
    });
    const cylinderGeo = new THREE.CylinderGeometry(0.012, 0.012, 1, 8);
    cylinderGeo.translate(0, 0.5, 0); // Origin at base for easy orientation
    cylinderGeo.rotateX(Math.PI / 2);
    const liveBones: THREE.Mesh[] = [];
    for (let i = 0; i < BONE_CONNECTIONS.length; i++) {
      const mesh = new THREE.Mesh(cylinderGeo, liveBoneMat.clone());
      mesh.visible = false;
      scene.add(mesh);
      liveBones.push(mesh);
    }
    liveBonesRef.current = liveBones;

    // ── Build Holographic Ghost Rig ──────────────────────────────────
    const ghostMat = new THREE.MeshStandardMaterial({
      color: 0x818cf8,
      emissive: 0x6366f1,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      wireframe: false
    });
    const ghostJointGeo = new THREE.SphereGeometry(0.028, 12, 12);
    const ghostJoints: THREE.Mesh[] = [];
    for (let i = 0; i < 33; i++) {
      const mesh = new THREE.Mesh(ghostJointGeo, ghostMat);
      mesh.visible = false;
      scene.add(mesh);
      ghostJoints.push(mesh);
    }
    ghostJointsRef.current = ghostJoints;

    const ghostBoneGeo = new THREE.CylinderGeometry(0.014, 0.014, 1, 8);
    ghostBoneGeo.translate(0, 0.5, 0);
    ghostBoneGeo.rotateX(Math.PI / 2);
    const ghostBones: THREE.Mesh[] = [];
    for (let i = 0; i < BONE_CONNECTIONS.length; i++) {
      const mesh = new THREE.Mesh(ghostBoneGeo, ghostMat);
      mesh.visible = false;
      scene.add(mesh);
      ghostBones.push(mesh);
    }
    ghostBonesRef.current = ghostBones;

    // ── Tension Vectors (Tension Spring indicator if valgus collapse) ─
    const tensionLineMat = new THREE.LineBasicMaterial({ color: 0xef4444, linewidth: 2, transparent: true, opacity: 0.85 });
    const lineGeoLeft = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    const lineGeoRight = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    const lineLeft = new THREE.Line(lineGeoLeft, tensionLineMat);
    const lineRight = new THREE.Line(lineGeoRight, tensionLineMat);
    lineLeft.visible = false;
    lineRight.visible = false;
    scene.add(lineLeft);
    scene.add(lineRight);
    tensionLinesRef.current = { left: lineLeft, right: lineRight };

    // Animation & Render Loop
    let animId: number;
    const render = () => {
      animId = requestAnimationFrame(render);
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        // Orbit camera around root based on mouse drag
        const r = 2.3;
        camera.position.x = r * Math.sin(rotationRef.current.y) * Math.cos(rotationRef.current.x);
        camera.position.z = r * Math.cos(rotationRef.current.y) * Math.cos(rotationRef.current.x);
        camera.position.y = 0.2 + r * Math.sin(rotationRef.current.x);
        camera.lookAt(0, -0.1, 0);

        renderer.render(scene, camera);
      }
    };
    render();

    // Resize Handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, []);

  // 2. Mouse Orbit Controls (Rotate 3D Avatar)
  const onMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - prevMouseRef.current.x;
    const dy = e.clientY - prevMouseRef.current.y;
    rotationRef.current.y += dx * 0.008;
    rotationRef.current.x = Math.max(-0.4, Math.min(0.6, rotationRef.current.x - dy * 0.008));
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };
  const onMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Helper to align a cylinder between two points in Three.js
  const orientBone = (bone: THREE.Mesh, pA: THREE.Vector3, pB: THREE.Vector3) => {
    const dist = pA.distanceTo(pB);
    if (dist < 1e-4) {
      bone.visible = false;
      return;
    }
    bone.visible = true;
    bone.position.copy(pA);
    bone.scale.set(1, 1, dist);
    bone.lookAt(pB);
  };

  // 3. Update Rigs on Every Animation/Frame Prop Tick
  useEffect(() => {
    if (!sceneRef.current) return;

    // Convert Live Landmarks to Pelvic Centric Root
    const liveNorm = worldLandmarks && worldLandmarks.length >= 29 ? normalizeToPelvicFrame(worldLandmarks) : null;

    // Generate Canonical 3D Ghost
    const ghostPose = showGhost ? generateCanonicalSquatPose(kneeAngle, calibrationProfile) : null;

    // Form Discrepancy Calculation
    if (liveNorm && ghostPose && onDiscrepancyUpdate) {
      const disc = calculateFormDiscrepancy(liveNorm, ghostPose);
      onDiscrepancyUpdate(disc);
    }

    // Dynamic Joint Strain Color:
    // Green = Safe (<0.3 Nm/kg), Amber = Moderate (0.3-0.5), Red = Critical (>0.5 Nm/kg)
    let kneeEmissive = 0x0284c7;
    let kneeColor = 0x22d3ee;
    if (normalizedKamNmKg > 0.5) {
      kneeColor = 0xef4444;
      kneeEmissive = 0xdc2626;
    } else if (normalizedKamNmKg > 0.3) {
      kneeColor = 0xf59e0b;
      kneeEmissive = 0xd97706;
    }

    // A. Update Live Twin
    const liveVecs: THREE.Vector3[] = [];
    if (liveNorm) {
      for (let i = 0; i < liveNorm.length && i < liveJointsRef.current.length; i++) {
        const pt = liveNorm[i];
        const mesh = liveJointsRef.current[i];
        if (!pt || pt.visibility! < 0.45) {
          mesh.visible = false;
          liveVecs.push(new THREE.Vector3());
          continue;
        }
        // Invert Y because Three.js Y goes UP while MediaPipe Y goes DOWN
        const vec = new THREE.Vector3(pt.x, -pt.y, -(pt.z ?? 0));
        liveVecs.push(vec);
        mesh.position.copy(vec);
        mesh.visible = true;

        // Apply dynamic strain colors to knees
        if (i === 25 || i === 26) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.color.setHex(kneeColor);
          mat.emissive.setHex(kneeEmissive);
        }
      }

      // Orient Live Bones
      BONE_CONNECTIONS.forEach(([startIdx, endIdx], boneIdx) => {
        const boneMesh = liveBonesRef.current[boneIdx];
        const vA = liveVecs[startIdx];
        const vB = liveVecs[endIdx];
        if (vA && vB && liveJointsRef.current[startIdx].visible && liveJointsRef.current[endIdx].visible) {
          orientBone(boneMesh, vA, vB);
        } else {
          boneMesh.visible = false;
        }
      });
    } else {
      liveJointsRef.current.forEach(m => (m.visible = false));
      liveBonesRef.current.forEach(m => (m.visible = false));
    }

    // B. Update Holographic Ghost
    const ghostVecs: THREE.Vector3[] = [];
    if (ghostPose && showGhost) {
      for (let i = 0; i < ghostPose.length && i < ghostJointsRef.current.length; i++) {
        const pt = ghostPose[i];
        const mesh = ghostJointsRef.current[i];
        if (!pt) {
          mesh.visible = false;
          ghostVecs.push(new THREE.Vector3());
          continue;
        }
        const vec = new THREE.Vector3(pt.x, -pt.y, -(pt.z ?? 0));
        ghostVecs.push(vec);
        mesh.position.copy(vec);
        mesh.visible = true;
      }

      BONE_CONNECTIONS.forEach(([startIdx, endIdx], boneIdx) => {
        const boneMesh = ghostBonesRef.current[boneIdx];
        const vA = ghostVecs[startIdx];
        const vB = ghostVecs[endIdx];
        if (vA && vB) {
          orientBone(boneMesh, vA, vB);
        } else {
          boneMesh.visible = false;
        }
      });
    } else {
      ghostJointsRef.current.forEach(m => (m.visible = false));
      ghostBonesRef.current.forEach(m => (m.visible = false));
    }

    // C. Update Tension Lines (Knee Valgus Deviation Vector)
    if (tensionLinesRef.current && liveNorm && ghostPose && showGhost) {
      const { left, right } = tensionLinesRef.current;
      const liveLK = liveVecs[25], ghostLK = ghostVecs[25];
      const liveRK = liveVecs[26], ghostRK = ghostVecs[26];

      if (liveLK && ghostLK && liveLK.distanceTo(ghostLK) > 0.035) {
        left.visible = true;
        (left.geometry as THREE.BufferGeometry).setFromPoints([liveLK, ghostLK]);
      } else {
        left.visible = false;
      }

      if (liveRK && ghostRK && liveRK.distanceTo(ghostRK) > 0.035) {
        right.visible = true;
        (right.geometry as THREE.BufferGeometry).setFromPoints([liveRK, ghostRK]);
      } else {
        right.visible = false;
      }
    }
  }, [worldLandmarks, calibrationProfile, kneeAngle, fsmPhase, normalizedKamNmKg, showGhost, onDiscrepancyUpdate]);

  return (
    <div
      ref={containerRef}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      className={`relative select-none cursor-grab active:cursor-grabbing rounded-xl overflow-hidden border border-border bg-slate-950/80 backdrop-blur-md ${className}`}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Orbit Hint & Legend Badge */}
      <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 pointer-events-none">
        <span className="text-[10px] font-mono text-muted-foreground/80 bg-slate-900/80 px-2 py-0.5 rounded border border-border">
          🖱️ Drag to rotate 3D view
        </span>
      </div>

      <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-1.5 pointer-events-none">
        <div className="flex items-center gap-2 bg-slate-900/90 border border-cyan-500/30 px-2.5 py-1 rounded-lg text-xs font-semibold text-cyan-300">
          <div className="w-2 h-2 rounded-full bg-cyan-400" />
          Live 3D Twin
        </div>
        {showGhost && (
          <div className="flex items-center gap-2 bg-slate-900/90 border border-indigo-500/30 px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-300">
            <div className="w-2 h-2 rounded-full bg-indigo-400" />
            Holographic Ghost
          </div>
        )}
      </div>
    </div>
  );
};

