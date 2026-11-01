import React, { useState, useEffect, useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { OBJLoader } from "three-stdlib";
import HoloOverlay from "./HoloOverlay";
import {
  AlertTriangle,
  Flame,
  Layers,
  Sparkles,
  Play,
  Pause,
  Compass,
  Sliders,
  Eye,
  CheckCircle2,
  Maximize2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAvatar } from "./AvatarContext";
import type { GroupedRegionalInsight } from "./context/ClinicInsightsContext";
import { AnatomicalLayers } from "./components/AnatomicalLayers";
import { BiomechanicalCalipers3D } from "./components/BiomechanicalCalipers3D";
import type { MovementFrame } from "./lib/movementLibrary";
import type { InspectionStation } from "./components/JointMicroInspectionPanel";

export type ZoneId =
  | "head" | "neck" | "chest" | "lumbar"
  | "left_shoulder" | "right_shoulder"
  | "left_arm"      | "right_arm"
  | "left_forearm"  | "right_forearm"
  | "left_hip"      | "right_hip"
  | "left_thigh"    | "right_thigh"
  | "left_knee"     | "right_knee"
  | "left_shin"     | "right_shin"
  | "left_ankle"    | "right_ankle";

export type ZoneRisk = Partial<Record<ZoneId, number>>;
export type ZoneConfidence = Partial<Record<ZoneId, string>>;

export interface HoloModel3DProps {
  riskData: ZoneRisk;
  confidenceData?: ZoneConfidence;
  selectedZone: ZoneId | null;
  onZoneClick: (zone: ZoneId) => void;
  onLogPainClick?: (zone: ZoneId) => void;
  viewMode?: "scan" | "3d";
  onViewModeChange?: (mode: "scan" | "3d") => void;
  regionalInsights?: GroupedRegionalInsight[];
  scanFilter?: "biceps-curls" | "squats" | "all";
  sessionMetrics?: Record<string, string>;

  // ── Enhanced 3D Digital Twin Props ──
  layerStep?: number; // 0 = Skin, 1 = Muscle, 2 = Bone, 3 = Force/Ligament
  currentFrame?: MovementFrame | null;
  showGhost?: boolean;
  cameraFocusStation?: InspectionStation;
  cameraPreset?: "front" | "side" | "top" | "orbit";
  onStationSelect?: (station: InspectionStation) => void;
}

const HEAT_ZONES: ZoneId[] = [
  "head", "neck", "chest", "lumbar",
  "left_shoulder", "right_shoulder",
  "left_arm", "right_arm",
  "left_forearm", "right_forearm",
  "left_hip", "right_hip",
  "left_thigh", "right_thigh",
  "left_knee", "right_knee",
  "left_shin", "right_shin",
  "left_ankle", "right_ankle"
];

const HEAT_RADII: Record<ZoneId, number> = {
  head: 0.22, neck: 0.16, chest: 0.32, lumbar: 0.30,
  left_shoulder: 0.22, right_shoulder: 0.22,
  left_arm: 0.22, right_arm: 0.22,
  left_forearm: 0.18, right_forearm: 0.18,
  left_hip: 0.25, right_hip: 0.25,
  left_thigh: 0.28, right_thigh: 0.28,
  left_knee: 0.20, right_knee: 0.20,
  left_shin: 0.22, right_shin: 0.22,
  left_ankle: 0.16, right_ankle: 0.16,
};

type SkinPreset = "ecorche" | "clay" | "realistic" | "anatomy" | "thermal";
const SKIN_PRESETS: Record<SkinPreset, { label: string; baseHex: string; roughness: number; metalness: number; opacity: number; emissiveHex: string; emissiveIntensity: number }> = {
  ecorche: { label: "Écorché Muscle", baseHex: "#d89b8a", roughness: 0.72, metalness: 0.02, opacity: 1.0, emissiveHex: "#221310", emissiveIntensity: 0.04 },
  clay: { label: "Anatomical Clay", baseHex: "#dbe0e6", roughness: 0.82, metalness: 0.0, opacity: 1.0, emissiveHex: "#1c2026", emissiveIntensity: 0.06 },
  realistic: { label: "PBR Skin", baseHex: "#c68642", roughness: 0.62, metalness: 0.0, opacity: 1.0, emissiveHex: "#2a1506", emissiveIntensity: 0.08 },
  anatomy: { label: "Anatomy Cyan", baseHex: "#0e3b6b", roughness: 0.15, metalness: 0.2, opacity: 0.78, emissiveHex: "#062040", emissiveIntensity: 0.5 },
  thermal: { label: "Thermal Scan", baseHex: "#1a1a1a", roughness: 0.80, metalness: 0.0, opacity: 1.0, emissiveHex: "#000000", emissiveIntensity: 0.0 },
};

// ── Smooth Camera Director with Cinematic Focal Lerping ──────────────────────
function CinematicCameraController({
  cameraFocusStation = "none",
  cameraPreset = "front",
  orbitControlsRef,
}: {
  cameraFocusStation?: InspectionStation;
  cameraPreset?: "front" | "side" | "top" | "orbit";
  orbitControlsRef: React.RefObject<any>;
}) {
  const { camera } = useThree();

  useFrame(() => {
    let targetPos = new THREE.Vector3(0, 0.90, 3.2);
    let targetLook = new THREE.Vector3(0, 0.88, 0);

    if (cameraFocusStation === "knee") {
      targetPos = new THREE.Vector3(0.20, 0.52, 1.2);
      targetLook = new THREE.Vector3(0.12, 0.48, 0.06);
    } else if (cameraFocusStation === "lumbar") {
      targetPos = new THREE.Vector3(0, 1.16, 1.3);
      targetLook = new THREE.Vector3(0, 1.12, 0.05);
    } else if (cameraFocusStation === "shoulder") {
      targetPos = new THREE.Vector3(0.28, 1.48, 1.1);
      targetLook = new THREE.Vector3(0.21, 1.42, 0.0);
    } else if (cameraPreset === "side") {
      targetPos = new THREE.Vector3(3.2, 0.90, 0);
      targetLook = new THREE.Vector3(0, 0.88, 0);
    } else if (cameraPreset === "top") {
      targetPos = new THREE.Vector3(0, 3.2, 0.1);
      targetLook = new THREE.Vector3(0, 0.88, 0);
    }

    // Smooth camera glide
    camera.position.lerp(targetPos, 0.08);
    if (orbitControlsRef.current) {
      orbitControlsRef.current.target.lerp(targetLook, 0.08);
      orbitControlsRef.current.update();
    }
  });

  return null;
}

// ── Realistic 3D Humanoid Body Model Component ────────────────────────────────
function RealHumanoid3D({
  riskData,
  selectedZone,
  onZoneClick,
  preset = "ecorche",
  heatMapEnabled = true,
  layerStep = 0,
  currentFrame,
  showGhost = true,
}: HoloModel3DProps & { heatMapEnabled?: boolean; preset?: SkinPreset }) {
  const { userHeight } = useAvatar();
  const obj = useLoader(OBJLoader, "/models/FinalBaseMesh.obj");
  const cfg = SKIN_PRESETS[preset];

  // Derive skin mesh opacity from layerStep (fades as layerStep increases towards muscle/bones)
  const skinOpacity = Math.max(0.05, Math.min(1.0, 1.0 - layerStep * 0.45));

  const uniformsRef = useRef({
    uHeatCenters: { value: Array.from({ length: 20 }, () => new THREE.Vector3()) },
    uHeatRisks: { value: new Float32Array(20) },
    uHeatRadii: { value: new Float32Array(20) },
    uSelectedZoneIdx: { value: -1 },
    uHeatOpacity: { value: heatMapEnabled ? 1.0 : 0.0 },
    uTime: { value: 0 },
    uSkinMode: { value: preset === "thermal" ? 1.0 : 0.0 },
  });

  const { cloned, jointPositions } = useMemo(() => {
    const c = obj.clone(true);
    const baseScale = userHeight ? (userHeight / 100) / 1.78 : 1.0;
    const finalScale = baseScale * 0.0858;
    c.scale.set(finalScale, finalScale, finalScale);
    c.position.set(0, 0, 0);
    c.updateMatrixWorld(true);

    const basePositions: Record<ZoneId, [number, number, number]> = {
      head: [0, 1.72, 0.02],
      neck: [0, 1.55, 0.02],
      chest: [0, 1.36, 0.08],
      lumbar: [0, 1.12, 0.05],
      left_shoulder: [0.21, 1.42, 0.0],
      right_shoulder: [-0.21, 1.42, 0.0],
      left_arm: [0.28, 1.22, -0.02],
      right_arm: [-0.28, 1.22, -0.02],
      left_forearm: [0.34, 1.02, -0.03],
      right_forearm: [-0.34, 1.02, -0.03],
      left_hip: [0.12, 0.95, 0.03],
      right_hip: [-0.12, 0.95, 0.03],
      left_thigh: [0.12, 0.72, 0.04],
      right_thigh: [-0.12, 0.72, 0.04],
      left_knee: [0.12, 0.48, 0.06],
      right_knee: [-0.12, 0.48, 0.06],
      left_shin: [0.11, 0.28, 0.05],
      right_shin: [-0.11, 0.28, 0.05],
      left_ankle: [0.10, 0.08, 0.03],
      right_ankle: [-0.10, 0.08, 0.03],
    };

    const positions: Partial<Record<ZoneId, [number, number, number]>> = {};
    for (const [zone, pos] of Object.entries(basePositions) as [ZoneId, typeof basePositions[ZoneId]][]) {
      positions[zone] = [pos[0] * baseScale, pos[1] * baseScale, pos[2] * baseScale];
    }

    const skinMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(cfg.baseHex),
      emissive: new THREE.Color(cfg.emissiveHex),
      emissiveIntensity: cfg.emissiveIntensity,
      roughness: cfg.roughness,
      metalness: cfg.metalness,
      transparent: skinOpacity < 0.99,
      opacity: skinOpacity,
      side: THREE.FrontSide,
    });

    c.traverse((node: any) => {
      if (!node.isMesh) return;
      node.castShadow = true;
      node.receiveShadow = true;
      node.material = skinMat;
    });

    return { cloned: c, jointPositions: positions };
  }, [obj, userHeight, preset, skinOpacity]);

  useFrame((state) => {
    const u = uniformsRef.current;
    u.uTime.value = state.clock.getElapsedTime();
    u.uHeatOpacity.value = heatMapEnabled ? 1.0 : 0.0;
    u.uSkinMode.value = preset === "thermal" ? 1.0 : 0.0;

    let selIdx = -1;
    HEAT_ZONES.forEach((zone, idx) => {
      const pos = currentFrame?.patientJoints?.[zone] || jointPositions[zone];
      if (pos) u.uHeatCenters.value[idx].set(...pos);

      const isSel = selectedZone === zone;
      const rawRisk = riskData[zone] ?? 0;
      const effectiveRisk = isSel ? Math.max(rawRisk, 50) : rawRisk;

      u.uHeatRisks.value[idx] = effectiveRisk;
      u.uHeatRadii.value[idx] = HEAT_RADII[zone] ?? 0.14;
      if (isSel) selIdx = idx;
    });
    u.uSelectedZoneIdx.value = selIdx;
  });

  // Effective joint positions from current movement trajectory or standing baseline
  const activeJoints = currentFrame?.patientJoints || jointPositions;

  return (
    <group>
      {/* ── TIER 1: PBR SKIN MESH ──────────────────────────────────────── */}
      {skinOpacity > 0.05 && <primitive object={cloned} />}

      {/* ── TIER 2, 3, 4: ANATOMICAL MULTI-LAYER CUTAWAY ───────────────── */}
      {activeJoints && (
        <AnatomicalLayers
          joints={activeJoints as any}
          layerStep={layerStep}
          muscleActivations={currentFrame?.muscles || { vmo: 60, vl: 65, gluteMax: 50, gluteMed: 45, hamstrings: 40, erectorSpinae: 55 }}
          grfMultiplier={currentFrame?.forces.grfMultiplierBW || 1.0}
          aclStrainPct={currentFrame?.forces.aclStrainPct || 4.2}
        />
      )}

      {/* ── 3D CALIPERS, PLUMB LINE & GHOST FORM ────────────────────────── */}
      {activeJoints && (
        <BiomechanicalCalipers3D
          patientJoints={activeJoints as any}
          ghostJoints={currentFrame?.ghostJoints}
          kneeAngle={currentFrame?.angles.kneeFlexion || 165}
          valgusDevCm={currentFrame?.angles.valgusDevCm || 1.2}
          qAngleDeg={currentFrame?.angles.qAngleDeg || 14.0}
          showGhost={showGhost}
        />
      )}

      {/* ── INTERACTIVE JOINT HIT SPHERES ──────────────────────────────── */}
      {HEAT_ZONES.map((zone) => {
        const pos = activeJoints?.[zone] || jointPositions[zone];
        if (!pos) return null;
        const hitRadius = zone.includes("chest") || zone.includes("lumbar") ? 0.22 : 0.15;

        return (
          <group key={zone} position={pos}>
            <mesh
              visible={false}
              onClick={(e) => {
                e.stopPropagation();
                onZoneClick(zone);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                document.body.style.cursor = "pointer";
              }}
              onPointerOut={() => {
                document.body.style.cursor = "auto";
              }}
            >
              <sphereGeometry args={[hitRadius, 10, 10]} />
              <meshBasicMaterial />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function ModelLoadingOverlay() {
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-zinc-950/90 border border-zinc-800 backdrop-blur-xl shadow-2xl text-center">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mb-2" />
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-white">
          Loading 3D Twin Rig
        </span>
      </div>
    </Html>
  );
}

export default function HoloModel3D(props: HoloModel3DProps) {
  const {
    viewMode = "3d",
    layerStep = 0,
    currentFrame,
    showGhost = true,
    cameraFocusStation = "none",
    cameraPreset = "front",
  } = props;

  const [heatMapEnabled, setHeatMapEnabled] = useState(true);
  const [preset, setPreset] = useState<SkinPreset>("ecorche");
  const orbitControlsRef = useRef<any>(null);

  const cyclePreset = () =>
    setPreset((p) =>
      p === "ecorche" ? "clay" : p === "clay" ? "realistic" : p === "realistic" ? "anatomy" : p === "anatomy" ? "thermal" : "ecorche"
    );

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#09090b]">
      {viewMode === "scan" ? (
        <HoloOverlay {...props} />
      ) : (
        <>
          <Canvas
            shadows
            camera={{ position: [0, 0.90, 3.2], fov: 38 }}
            gl={{
              antialias: true,
              powerPreference: "high-performance",
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.25,
            }}
          >
            {/* Studio Rim Lighting */}
            <ambientLight intensity={0.8} color="#ffffff" />
            <directionalLight position={[2.5, 3.5, 3]} intensity={3.2} color="#ffffff" castShadow />
            <directionalLight position={[-3, 2, -2]} intensity={2.6} color="#ef4444" />
            <directionalLight position={[3, 1.5, -2]} intensity={2.2} color="#06b6d4" />
            <pointLight position={[0, 0.4, 1.8]} intensity={1.1} color="#f59e0b" />

            {/* Dark Studio Circular Platform Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
              <planeGeometry args={[10, 10]} />
              <shadowMaterial opacity={0.35} />
            </mesh>

            {/* Concentric Stance Rings */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.015, 0]}>
              <ringGeometry args={[0.3, 0.31, 32]} />
              <meshBasicMaterial color={0x06b6d4} transparent opacity={0.25} side={THREE.DoubleSide} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.015, 0]}>
              <ringGeometry args={[0.55, 0.56, 32]} />
              <meshBasicMaterial color={0xef4444} transparent opacity={0.25} side={THREE.DoubleSide} />
            </mesh>

            {/* Smooth Camera Transitions */}
            <CinematicCameraController
              cameraFocusStation={cameraFocusStation}
              cameraPreset={cameraPreset}
              orbitControlsRef={orbitControlsRef}
            />

            <Suspense fallback={<ModelLoadingOverlay />}>
              <RealHumanoid3D
                {...props}
                heatMapEnabled={heatMapEnabled}
                preset={preset}
                layerStep={layerStep}
                currentFrame={currentFrame}
                showGhost={showGhost}
              />
            </Suspense>

            <OrbitControls
              ref={orbitControlsRef}
              target={[0, 0.88, 0]}
              enablePan={false}
              minPolarAngle={Math.PI / 6}
              maxPolarAngle={Math.PI / 1.7}
              minDistance={1.0}
              maxDistance={5.0}
              dampingFactor={0.05}
              enableDamping
            />
          </Canvas>

          {/* Quick Toolbar (Heatmap, Material) */}
          <div className="absolute top-16 md:top-20 left-4 md:left-[272px] z-20 flex flex-wrap gap-2 pointer-events-auto">
            <button
              onClick={() => setHeatMapEnabled((p) => !p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 backdrop-blur-xl border transition-all cursor-pointer ${
                heatMapEnabled
                  ? "bg-amber-950/40 border-amber-500/40 text-amber-300"
                  : "bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              <Flame className={`w-3.5 h-3.5 ${heatMapEnabled ? "text-amber-400 animate-pulse" : "text-zinc-500"}`} />
              <span>Heatmap {heatMapEnabled ? "ON" : "OFF"}</span>
            </button>

            <button
              onClick={cyclePreset}
              className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 bg-zinc-900/80 border border-zinc-800 text-zinc-300 hover:text-white backdrop-blur-xl transition-all cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-zinc-400" />
              <span>{SKIN_PRESETS[preset].label}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
