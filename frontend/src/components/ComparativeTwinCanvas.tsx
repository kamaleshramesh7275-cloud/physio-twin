import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Sliders, Eye, SplitSquareVertical, Layers, CheckCircle2, AlertTriangle, ShieldAlert } from "lucide-react";

export interface ComparativeAthleteProfile {
  id: string;
  name: string;
  sport: string;
  valgusAngleDeg: number;       // degrees of knee inward collapse
  kneeFlexionDeg: number;       // squat depth / flexion
  hipRotationDeg: number;       // internal/external rotation
  trunkLeanDeg: number;         // torso forward tilt
  vmoVlRatio: number;           // VMO to VL virtual sEMG balance
  kamNmKg: number;              // Knee Abduction Moment
}

interface ComparativeTwinCanvasProps {
  athleteA: ComparativeAthleteProfile;
  athleteB: ComparativeAthleteProfile;
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

export const ComparativeTwinCanvas: React.FC<ComparativeTwinCanvasProps> = ({
  athleteA,
  athleteB,
  className = "w-full h-full min-h-[420px]"
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [viewMode, setViewMode] = useState<"side-by-side" | "superimposed">("superimposed");
  const [motionScrub, setMotionScrub] = useState<number>(100); // 0 (standing) to 100 (deep squat)

  // Three.js instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Mesh registries for Skeleton A and Skeleton B
  const skeletonAGroupRef = useRef<THREE.Group | null>(null);
  const skeletonBGroupRef = useRef<THREE.Group | null>(null);
  const discrepancyLinesRef = useRef<THREE.LineSegments | null>(null);

  // Mouse orbit
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({ y: 0, x: 0.1 });

  // Generate 3D joint landmarks from athlete parameters and scrub factor
  const generateAthleteLandmarks = (profile: ComparativeAthleteProfile, scrubFraction: number): Record<number, THREE.Vector3> => {
    const depth = (profile.kneeFlexionDeg * scrubFraction) * (Math.PI / 180);
    const trunkRad = (profile.trunkLeanDeg * scrubFraction) * (Math.PI / 180);
    const valgusShift = (profile.valgusAngleDeg / 15) * 0.08 * scrubFraction;

    const hipY = 0.0 - Math.sin(depth * 0.5) * 0.28;
    const hipZ = -Math.sin(depth * 0.4) * 0.12;

    const shoulderY = hipY + 0.48 * Math.cos(trunkRad);
    const shoulderZ = hipZ + 0.48 * Math.sin(trunkRad);

    const kneeY = hipY - 0.38 * Math.cos(depth * 0.6);
    const kneeZ = hipZ + 0.38 * Math.sin(depth * 0.6);

    const ankleY = -0.65;
    const ankleZ = 0.0;

    return {
      // Shoulders
      11: new THREE.Vector3(-0.19, shoulderY, shoulderZ),
      12: new THREE.Vector3(0.19, shoulderY, shoulderZ),
      // Elbows
      13: new THREE.Vector3(-0.25, shoulderY - 0.22, shoulderZ + 0.08),
      14: new THREE.Vector3(0.25, shoulderY - 0.22, shoulderZ + 0.08),
      // Wrists
      15: new THREE.Vector3(-0.24, shoulderY - 0.42, shoulderZ + 0.18),
      16: new THREE.Vector3(0.24, shoulderY - 0.42, shoulderZ + 0.18),
      // Hips
      23: new THREE.Vector3(-0.14, hipY, hipZ),
      24: new THREE.Vector3(0.14, hipY, hipZ),
      // Knees (with Valgus displacement)
      25: new THREE.Vector3(-0.15 + valgusShift, kneeY, kneeZ),
      26: new THREE.Vector3(0.15 - valgusShift, kneeY, kneeZ),
      // Ankles
      27: new THREE.Vector3(-0.16, ankleY, ankleZ),
      28: new THREE.Vector3(0.16, ankleY, ankleZ)
    };
  };

  // Helper to create or update skeletal rig
  const buildSkeletonGroup = (
    landmarks: Record<number, THREE.Vector3>,
    jointColor: number,
    boneColor: number,
    opacity: number = 0.95
  ): THREE.Group => {
    const group = new THREE.Group();
    const sphereGeo = new THREE.SphereGeometry(0.024, 16, 16);
    const jointMat = new THREE.MeshStandardMaterial({
      color: jointColor,
      emissive: jointColor,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.8,
      transparent: opacity < 1.0,
      opacity
    });

    const cylinderGeo = new THREE.CylinderGeometry(0.012, 0.012, 1, 8);
    const boneMat = new THREE.MeshStandardMaterial({
      color: boneColor,
      emissive: boneColor,
      emissiveIntensity: 0.3,
      roughness: 0.3,
      transparent: opacity < 1.0,
      opacity
    });

    // Add Joints
    Object.entries(landmarks).forEach(([idStr, pos]) => {
      const id = Number(idStr);
      if (id >= 11 && id <= 28) {
        const jointMesh = new THREE.Mesh(sphereGeo, jointMat);
        jointMesh.position.copy(pos);
        group.add(jointMesh);
      }
    });

    // Add Bones
    BONE_CONNECTIONS.forEach(([startId, endId]) => {
      const p1 = landmarks[startId];
      const p2 = landmarks[endId];
      if (!p1 || !p2) return;

      const boneMesh = new THREE.Mesh(cylinderGeo, boneMat);
      const v = new THREE.Vector3().subVectors(p2, p1);
      const len = v.length();
      boneMesh.scale.set(1, len, 1);
      boneMesh.position.copy(p1).addScaledVector(v, 0.5);
      boneMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v.normalize());
      group.add(boneMesh);
    });

    return group;
  };

  // 1. Initialize Scene
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x09090b);
    scene.fog = new THREE.FogExp2(0x09090b, 0.3);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 20);
    camera.position.set(0, 0.1, 2.5);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x0ea5e9, 2.2); // Cyan
    dirLight1.position.set(3, 4, 3);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x10b981, 1.8); // Emerald
    dirLight2.position.set(-3, -2, -2);
    scene.add(dirLight2);

    // Floor Grid
    const grid = new THREE.GridHelper(3.5, 20, 0x0ea5e9, 0x1e293b);
    grid.position.y = -0.66;
    scene.add(grid);

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
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

  // 2. Update Skeletons when profiles, scrub, or viewMode changes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Remove existing skeleton groups & discrepancy lines
    if (skeletonAGroupRef.current) scene.remove(skeletonAGroupRef.current);
    if (skeletonBGroupRef.current) scene.remove(skeletonBGroupRef.current);
    if (discrepancyLinesRef.current) scene.remove(discrepancyLinesRef.current);

    const scrubFraction = motionScrub / 100;
    const lmA = generateAthleteLandmarks(athleteA, scrubFraction);
    const lmB = generateAthleteLandmarks(athleteB, scrubFraction);

    // Build Athlete A skeleton (Cyan: 0x00f2fe)
    const groupA = buildSkeletonGroup(lmA, 0x00f2fe, 0x0284c7, 0.95);
    // Build Athlete B skeleton (Emerald/Amber: 0x10b981)
    const bColor = athleteB.valgusAngleDeg > 10 ? 0xf59e0b : 0x10b981;
    const groupB = buildSkeletonGroup(lmB, bColor, bColor, 0.9);

    if (viewMode === "side-by-side") {
      groupA.position.x = -0.6;
      groupB.position.x = 0.6;
    } else {
      groupA.position.x = 0;
      groupB.position.x = 0;

      // Draw Discrepancy Vector Lines connecting corresponding joints
      const linePositions: number[] = [];
      const lineColors: number[] = [];

      [25, 26, 23, 24, 11, 12].forEach(jointId => {
        const posA = lmA[jointId];
        const posB = lmB[jointId];
        if (posA && posB) {
          const dist = posA.distanceTo(posB);
          if (dist > 0.02) {
            linePositions.push(posA.x, posA.y, posA.z);
            linePositions.push(posB.x, posB.y, posB.z);

            // Red line if critical discrepancy, yellow if moderate
            const isRed = dist > 0.05;
            const r = isRed ? 1.0 : 0.95;
            const g = isRed ? 0.2 : 0.75;
            const b = 0.1;
            lineColors.push(r, g, b, r, g, b);
          }
        }
      });

      if (linePositions.length > 0) {
        const lineGeo = new THREE.BufferGeometry();
        lineGeo.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));
        lineGeo.setAttribute("color", new THREE.Float32BufferAttribute(lineColors, 3));
        const lineMat = new THREE.LineBasicMaterial({ vertexColors: true, linewidth: 2 });
        const linesMesh = new THREE.LineSegments(lineGeo, lineMat);
        scene.add(linesMesh);
        discrepancyLinesRef.current = linesMesh;
      }
    }

    scene.add(groupA);
    scene.add(groupB);
    skeletonAGroupRef.current = groupA;
    skeletonBGroupRef.current = groupB;
  }, [athleteA, athleteB, motionScrub, viewMode]);

  // Mouse Orbit controls
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !cameraRef.current) return;
    const deltaX = e.clientX - prevMouseRef.current.x;
    const deltaY = e.clientY - prevMouseRef.current.y;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };

    rotationRef.current.y += deltaX * 0.008;
    rotationRef.current.x = Math.max(-0.4, Math.min(0.6, rotationRef.current.x + deltaY * 0.008));

    const radius = 2.5;
    cameraRef.current.position.x = radius * Math.sin(rotationRef.current.y) * Math.cos(rotationRef.current.x);
    cameraRef.current.position.z = radius * Math.cos(rotationRef.current.y) * Math.cos(rotationRef.current.x);
    cameraRef.current.position.y = radius * Math.sin(rotationRef.current.x) + 0.1;
    cameraRef.current.lookAt(0, 0, 0);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Telemetry deltas
  const valgusDelta = Math.abs(athleteA.valgusAngleDeg - athleteB.valgusAngleDeg);
  const kneeFlexDelta = Math.abs(athleteA.kneeFlexionDeg - athleteB.kneeFlexionDeg);
  const trunkDelta = Math.abs(athleteA.trunkLeanDeg - athleteB.trunkLeanDeg);
  const kamDelta = Math.abs(athleteA.kamNmKg - athleteB.kamNmKg);
  const rmsDiscrepancy = Math.sqrt(
    (Math.pow(valgusDelta, 2) + Math.pow(kneeFlexDelta, 2) + Math.pow(trunkDelta, 2)) / 3
  ).toFixed(1);

  return (
    <div className={`card p-5 space-y-4 border border-border bg-card/60 backdrop-blur-md flex flex-col ${className}`}>
      {/* Header & Mode Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-foreground flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              Comparative 3D Dual-Athlete Duel
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              60 FPS Superposition
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Compare kinetic alignment and joint divergence vectors between athletes.
          </p>
        </div>

        {/* View Mode Buttons */}
        <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-xl border border-border">
          <button
            onClick={() => setViewMode("superimposed")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === "superimposed"
                ? "bg-primary text-primary-foreground shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Ghost Duel (Superimposed)
          </button>
          <button
            onClick={() => setViewMode("side-by-side")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === "side-by-side"
                ? "bg-primary text-primary-foreground shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            Side-by-Side
          </button>
        </div>
      </div>

      {/* 3D Canvas Box */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="relative w-full h-[360px] rounded-xl overflow-hidden border border-border cursor-grab active:cursor-grabbing bg-slate-950"
      >
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Overlay Athlete Legend */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
          <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-lg border border-cyan-500/40 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow shadow-cyan-400" />
            <strong className="text-cyan-200">{athleteA.name}</strong>
            <span className="text-[10px] text-muted-foreground">({athleteA.sport})</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-lg border border-emerald-500/40 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow shadow-emerald-400" />
            <strong className="text-emerald-200">{athleteB.name}</strong>
            <span className="text-[10px] text-muted-foreground">({athleteB.sport})</span>
          </div>
        </div>

        {/* Discrepancy Score Pill */}
        <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-lg border border-border text-xs pointer-events-none text-right">
          <div className="text-[10px] font-mono text-muted-foreground uppercase">RMS Discrepancy</div>
          <div className={`font-mono font-black text-sm ${Number(rmsDiscrepancy) > 8 ? "text-amber-400" : "text-emerald-400"}`}>
            {rmsDiscrepancy}° Delta
          </div>
        </div>

        {/* Orbit hint */}
        <div className="absolute bottom-2 right-3 text-[10px] font-mono text-muted-foreground/60 pointer-events-none">
          Drag to 3D Orbit Rotate
        </div>
      </div>

      {/* Scrub Slider */}
      <div className="p-3 rounded-xl bg-muted/20 border border-border flex items-center gap-3">
        <Sliders className="w-4 h-4 text-primary shrink-0" />
        <span className="text-xs font-semibold text-muted-foreground shrink-0">Scrub Squat Depth:</span>
        <input
          type="range"
          min={0}
          max={100}
          value={motionScrub}
          onChange={e => setMotionScrub(Number(e.target.value))}
          className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
        />
        <span className="text-xs font-mono font-bold text-foreground shrink-0">{motionScrub}% Depth</span>
      </div>

      {/* Comparative Biomechanical Telemetry Table */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/40 font-mono uppercase text-[10px] text-muted-foreground border-b border-border">
            <tr>
              <th className="p-2.5">Kinematic Metric</th>
              <th className="p-2.5 text-cyan-400">{athleteA.name}</th>
              <th className="p-2.5 text-emerald-400">{athleteB.name}</th>
              <th className="p-2.5">Variance / Delta</th>
              <th className="p-2.5">Clinical Implication</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40 font-mono">
            <tr>
              <td className="p-2.5 font-sans font-semibold text-foreground">Knee Dynamic Valgus</td>
              <td className="p-2.5 text-cyan-300">{athleteA.valgusAngleDeg}°</td>
              <td className="p-2.5 text-emerald-300">{athleteB.valgusAngleDeg}°</td>
              <td className={`p-2.5 font-bold ${valgusDelta > 5 ? "text-red-400" : "text-emerald-400"}`}>
                {valgusDelta.toFixed(1)}°
              </td>
              <td className="p-2.5 font-sans text-muted-foreground">
                {valgusDelta > 5 ? "Asymmetric ACL shear stress on medial collateral ligament" : "Symmetric coronal plane tracking"}
              </td>
            </tr>

            <tr>
              <td className="p-2.5 font-sans font-semibold text-foreground">Knee Flexion Depth</td>
              <td className="p-2.5 text-cyan-300">{athleteA.kneeFlexionDeg}°</td>
              <td className="p-2.5 text-emerald-300">{athleteB.kneeFlexionDeg}°</td>
              <td className="p-2.5 text-muted-foreground">{kneeFlexDelta.toFixed(1)}°</td>
              <td className="p-2.5 font-sans text-muted-foreground">
                {kneeFlexDelta > 15 ? "Divergent squat depth affects patellofemoral pressure profile" : "Comparable depth profile"}
              </td>
            </tr>

            <tr>
              <td className="p-2.5 font-sans font-semibold text-foreground">Trunk Forward Lean</td>
              <td className="p-2.5 text-cyan-300">{athleteA.trunkLeanDeg}°</td>
              <td className="p-2.5 text-emerald-300">{athleteB.trunkLeanDeg}°</td>
              <td className={`p-2.5 font-bold ${trunkDelta > 8 ? "text-amber-400" : "text-emerald-400"}`}>
                {trunkDelta.toFixed(1)}°
              </td>
              <td className="p-2.5 font-sans text-muted-foreground">
                {trunkDelta > 8 ? "Elevated L4-L5 anterior disc shear moment" : "Optimal spinal neutrality"}
              </td>
            </tr>

            <tr>
              <td className="p-2.5 font-sans font-semibold text-foreground">Normalized KAM (Nm/kg)</td>
              <td className="p-2.5 text-cyan-300">{athleteA.kamNmKg} Nm/kg</td>
              <td className="p-2.5 text-emerald-300">{athleteB.kamNmKg} Nm/kg</td>
              <td className={`p-2.5 font-bold ${kamDelta > 0.2 ? "text-red-400" : "text-emerald-400"}`}>
                {kamDelta.toFixed(2)}
              </td>
              <td className="p-2.5 font-sans text-muted-foreground">
                {kamDelta > 0.2 ? "High torque spike on knee joint capsule" : "Uniform load dissipation"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

