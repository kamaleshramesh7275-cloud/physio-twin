import React, { useState, useEffect, useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { OBJLoader } from "three-stdlib";
import {
  Activity,
  Zap,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sliders,
  Layers,
  Play,
  Pause,
  Compass,
  ArrowRight,
  Maximize2
} from "lucide-react";

type SkinMode = "ecorche" | "cyber" | "realistic";

// ── Minimalist 3D Joint Marker (Sleek Beacon, No Giant Blocking Cards) ─────────
function SleekJointBeacon({
  position,
  label,
  value,
  status,
  isSelected,
  onClick,
}: {
  position: [number, number, number];
  label: string;
  value: string;
  status: "critical" | "warning" | "optimal";
  isSelected: boolean;
  onClick: () => void;
}) {
  const dotColor = {
    critical: "bg-red-500",
    warning: "bg-amber-500",
    optimal: "bg-emerald-500",
  }[status];

  const ringBorder = {
    critical: "border-red-400 text-red-300",
    warning: "border-amber-400 text-amber-300",
    optimal: "border-emerald-400 text-emerald-300",
  }[status];

  return (
    <Html position={position} center distanceFactor={5} zIndexRange={[50, 0]}>
      <div 
        onClick={onClick}
        className="flex items-center gap-1.5 cursor-pointer group select-none pointer-events-auto"
      >
        {/* Pulsing Beacon Dot */}
        <div className="relative flex items-center justify-center w-5 h-5 rounded-full bg-black/80 border border-white/20 backdrop-blur-md group-hover:scale-125 transition-transform">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-70 ${dotColor}`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColor}`} />
        </div>

        {/* Compact Micro-Tag (Only shows compact text, never blocks body) */}
        <div className={`px-2 py-0.5 rounded-md bg-black/80 border backdrop-blur-md text-[10px] font-mono whitespace-nowrap shadow-lg transition-all ${
          isSelected ? `${ringBorder} bg-black/95 scale-105` : "border-zinc-800 text-zinc-400 opacity-80 group-hover:opacity-100"
        }`}>
          <span className="font-semibold">{label}: </span>
          <span className="font-bold text-white">{value}</span>
        </div>
      </div>
    </Html>
  );
}

// ── 3D Anatomical Humanoid Mesh with Correct Vertical Centering ──────────────
function FullHumanoidRig({
  skinMode,
  squatDepth,
  selectedJoint,
  setSelectedJoint,
}: {
  skinMode: SkinMode;
  squatDepth: number;
  selectedJoint: string;
  setSelectedJoint: (joint: string) => void;
}) {
  const obj = useLoader(OBJLoader, "/models/FinalBaseMesh.obj");
  const meshRef = useRef<THREE.Group>(null);

  // Dynamic Joint Coordinates (anatomically accurate to OBJ proportions)
  const kneeY = 0.48 - squatDepth * 0.07;
  const leftKneeX = 0.12 - squatDepth * 0.035; // Inward valgus drift
  const lumbarY = 1.12 - squatDepth * 0.08;
  const lumbarZ = 0.05 + squatDepth * 0.05;

  const { cloned } = useMemo(() => {
    const c = obj.clone(true);
    const finalScale = 0.0858;
    c.scale.set(finalScale, finalScale, finalScale);
    c.position.set(0, 0, 0);

    let baseColor = 0xd89b8a;
    let roughness = 0.68;
    let metalness = 0.05;
    let emissive = 0x221310;
    let emissiveIntensity = 0.06;

    if (skinMode === "cyber") {
      baseColor = 0x18181b;
      roughness = 0.25;
      metalness = 0.85;
      emissive = 0x09090b;
      emissiveIntensity = 0.2;
    } else if (skinMode === "realistic") {
      baseColor = 0xc68642;
      roughness = 0.58;
      metalness = 0.02;
      emissive = 0x2a1506;
      emissiveIntensity = 0.08;
    }

    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(baseColor),
      roughness,
      metalness,
      emissive: new THREE.Color(emissive),
      emissiveIntensity,
      side: THREE.FrontSide,
    });

    c.traverse((node: any) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
        node.material = mat;
      }
    });

    return { cloned: c };
  }, [obj, skinMode]);

  useFrame((state) => {
    if (meshRef.current) {
      // Subtle natural breathing motion
      const breath = Math.sin(state.clock.getElapsedTime() * 1.5) * 0.0015;
      meshRef.current.position.y = -squatDepth * 0.04 + breath;
    }
  });

  return (
    <group ref={meshRef}>
      <primitive object={cloned} />

      {/* Sleek Non-Blocking 3D Beacons */}
      <SleekJointBeacon
        position={[leftKneeX, kneeY, 0.08]}
        label="L. Patella"
        value={`+${(squatDepth * 3.8).toFixed(1)}cm`}
        status={squatDepth > 0.5 ? "critical" : "warning"}
        isSelected={selectedJoint === "knee"}
        onClick={() => setSelectedJoint("knee")}
      />

      <SleekJointBeacon
        position={[0, lumbarY, lumbarZ]}
        label="L4-L5"
        value={`${Math.round(280 + squatDepth * 240)}N`}
        status={squatDepth > 0.65 ? "warning" : "optimal"}
        isSelected={selectedJoint === "lumbar"}
        onClick={() => setSelectedJoint("lumbar")}
      />

      <SleekJointBeacon
        position={[0.16, 0.62 - squatDepth * 0.04, 0.08]}
        label="VMO"
        value={`${Math.round(42 + squatDepth * 36)}%`}
        status="optimal"
        isSelected={selectedJoint === "vmo"}
        onClick={() => setSelectedJoint("vmo")}
      />
    </group>
  );
}

// ── Fallback Spinner while OBJ Streams ──────────────────────────────────────
function ModelLoaderFallback() {
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-black/80 border border-zinc-800 backdrop-blur-xl shadow-2xl text-center">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mb-2" />
        <span className="text-[11px] font-mono font-bold tracking-wider text-white uppercase">
          Streaming 3D Human Rig
        </span>
      </div>
    </Html>
  );
}

// ── Main Hero Section Component (Spacious 2-Column Split Layout) ─────────────
export function HeroRealisticTwin3D() {
  const [skinMode, setSkinMode] = useState<SkinMode>("ecorche");
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const [isPlayingMotion, setIsPlayingMotion] = useState(true);
  const [squatDepth, setSquatDepth] = useState(0.65);
  const [selectedJoint, setSelectedJoint] = useState<string>("knee");

  // Dynamic Squat Motion Oscillation
  useEffect(() => {
    if (!isPlayingMotion) return;
    const interval = setInterval(() => {
      const t = Date.now() / 1400;
      const depth = (Math.sin(t) + 1) / 2; // Smooth 0 to 1 wave
      setSquatDepth(depth);
    }, 40);
    return () => clearInterval(interval);
  }, [isPlayingMotion]);

  // Derived Kinematic Telemetry
  const kneeFlexionDeg = Math.round(165 - squatDepth * 85);
  const valgusDevCm = (squatDepth * 3.8).toFixed(1);
  const aclStrainPct = (3.5 + squatDepth * 5.2).toFixed(1);
  const lumbarShearN = Math.round(280 + squatDepth * 240);
  const vmoPct = Math.round(42 + squatDepth * 36);
  const vlPct = Math.round(45 + squatDepth * 44);
  const gluteMediusPct = Math.round(25 + (1 - squatDepth * 0.45) * 35);
  const kamMomentNm = (24 + squatDepth * 24.2).toFixed(1);

  return (
    <div className="w-full max-w-6xl mx-auto rounded-3xl p-1 bg-gradient-to-b from-red-500/25 via-zinc-800/40 to-zinc-950/90 shadow-2xl shadow-red-950/40">
      <div className="rounded-[22px] bg-[#0c101d] border border-zinc-800 overflow-hidden">
        
        {/* Top Header Bar */}
        <div className="px-5 py-3 border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 bg-[#09090b]/90">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            <span className="text-xs font-mono font-bold tracking-wider text-white uppercase">
              3D Musculoskeletal Digital Twin
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 font-bold">
              120 Hz Sub-Frame
            </span>
          </div>

          {/* Quick Toolbar */}
          <div className="flex items-center gap-2 text-xs font-mono">
            {/* Skin Selector */}
            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
              <button
                onClick={() => setSkinMode("ecorche")}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                  skinMode === "ecorche" ? "bg-red-600 text-white shadow" : "text-zinc-400 hover:text-white"
                }`}
              >
                Muscle
              </button>
              <button
                onClick={() => setSkinMode("cyber")}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                  skinMode === "cyber" ? "bg-cyan-600 text-white shadow" : "text-zinc-400 hover:text-white"
                }`}
              >
                Cyber
              </button>
              <button
                onClick={() => setSkinMode("realistic")}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                  skinMode === "realistic" ? "bg-amber-600 text-white shadow" : "text-zinc-400 hover:text-white"
                }`}
              >
                Skin
              </button>
            </div>

            {/* Orbit Turntable Toggle */}
            <button
              onClick={() => setIsAutoRotate(!isAutoRotate)}
              className={`px-2.5 py-1 rounded-lg border text-[11px] flex items-center gap-1.5 transition-all cursor-pointer ${
                isAutoRotate
                  ? "bg-zinc-800 border-zinc-700 text-white"
                  : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Compass className={`w-3.5 h-3.5 ${isAutoRotate ? "animate-spin text-red-400" : ""}`} />
              <span className="hidden sm:inline">360° Orbit</span>
            </button>

            {/* Simulate Motion Toggle */}
            <button
              onClick={() => setIsPlayingMotion(!isPlayingMotion)}
              className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white text-[11px] flex items-center gap-1 cursor-pointer"
            >
              {isPlayingMotion ? <Pause className="w-3 h-3 text-amber-400" /> : <Play className="w-3 h-3 text-emerald-400" />}
              <span className="hidden sm:inline">{isPlayingMotion ? "Pause" : "Simulate"}</span>
            </button>
          </div>
        </div>

        {/* Spacious 2-Column Split Stage (No Overlapping Boxes!) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[520px]">
          
          {/* Column 1: Unobstructed, Centered 3D Viewport (Full Head-To-Toe Body Visible) */}
          <div className="relative lg:col-span-7 h-[460px] sm:h-[520px] lg:h-[600px] bg-gradient-to-b from-[#09090b] via-[#0c101d] to-[#070912] border-b lg:border-b-0 lg:border-r border-zinc-800/80 overflow-hidden">
            
            {/* Minimal Corner Status */}
            <div className="absolute top-3 left-3 z-10 pointer-events-none">
              <span className="text-[10px] font-mono px-2 py-1 rounded bg-black/60 border border-zinc-800/80 text-zinc-400 backdrop-blur-md">
                Left-Click + Drag to Rotate 360°
              </span>
            </div>

            <Canvas
              shadows
              camera={{ position: [0, 0.90, 3.4], fov: 38 }}
              gl={{
                antialias: true,
                powerPreference: "high-performance",
                toneMapping: THREE.ACESFilmicToneMapping,
                toneMappingExposure: 1.25,
              }}
            >
              {/* Studio Rim Lighting */}
              <ambientLight intensity={0.9} color="#ffffff" />
              <directionalLight position={[2.5, 3.5, 3]} intensity={3.0} color="#ffffff" castShadow />
              <directionalLight position={[-3, 2, -2]} intensity={2.5} color="#ef4444" />
              <directionalLight position={[3, 1.5, -2]} intensity={2.2} color="#06b6d4" />
              <pointLight position={[0, 0.4, 1.8]} intensity={1.2} color="#f59e0b" />

              {/* Floor Studio Grid (Positioned cleanly under the feet) */}
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
                <planeGeometry args={[8, 8]} />
                <shadowMaterial opacity={0.3} />
              </mesh>

              <Suspense fallback={<ModelLoaderFallback />}>
                <FullHumanoidRig
                  skinMode={skinMode}
                  squatDepth={squatDepth}
                  selectedJoint={selectedJoint}
                  setSelectedJoint={setSelectedJoint}
                />
              </Suspense>

              {/* Orbit Controls target centered at torso/midpoint [0, 0.88, 0] */}
              <OrbitControls
                target={[0, 0.88, 0]}
                enableZoom={false}
                enablePan={false}
                autoRotate={isAutoRotate}
                autoRotateSpeed={1.0}
                minPolarAngle={Math.PI / 4}
                maxPolarAngle={Math.PI / 1.7}
                dampingFactor={0.05}
                enableDamping
              />
            </Canvas>

            {/* Bottom Sub-label */}
            <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between text-[10px] font-mono text-zinc-500 pointer-events-none">
              <span>Model: High-Resolution Anatomical Rig</span>
              <span>10 MTU Virtual Channels Active</span>
            </div>
          </div>

          {/* Column 2: Dedicated Biomechanical Telemetry Rail (Completely Off-Canvas, 0 Overlap) */}
          <div className="lg:col-span-5 p-5 md:p-6 flex flex-col justify-between space-y-4 bg-[#09090b]/80">
            
            {/* Block 1: Valgus Anomaly & Knee Tracking */}
            <div className={`p-4 rounded-2xl border transition-all ${
              selectedJoint === "knee"
                ? "bg-red-950/20 border-red-500/40 shadow-lg shadow-red-950/30"
                : "bg-zinc-900/60 border-zinc-800/80"
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    Patellar Tracking & Valgus
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 font-bold">
                  {squatDepth > 0.5 ? "Critical Drift" : "Watch"}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 py-1">
                <div>
                  <div className="text-[10px] font-mono text-zinc-500 uppercase">Valgus Dev</div>
                  <div className="text-lg font-mono font-black text-red-400">+{valgusDevCm} cm</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-zinc-500 uppercase">Knee Flexion</div>
                  <div className="text-lg font-mono font-black text-white">{kneeFlexionDeg}°</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-zinc-500 uppercase">KAM Moment</div>
                  <div className="text-lg font-mono font-black text-amber-400">{kamMomentNm} Nm</div>
                </div>
              </div>

              <p className="text-[11px] text-zinc-400 mt-2 leading-relaxed">
                Medial knee displacement exceeding the second toe ray triggers dynamic ACL shear warning.
              </p>
            </div>

            {/* Block 2: Spinal Load & Ligament Stress */}
            <div className={`p-4 rounded-2xl border transition-all ${
              selectedJoint === "lumbar"
                ? "bg-amber-950/20 border-amber-500/40 shadow-lg shadow-amber-950/30"
                : "bg-zinc-900/60 border-zinc-800/80"
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    Spine & Ligament Load
                  </span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400">
                  ACL: <span className="text-amber-400 font-bold">{aclStrainPct}%</span>
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <div>
                  <div className="text-[10px] font-mono text-zinc-500 uppercase">L4-L5 Lumbar Shear</div>
                  <div className="text-xl font-mono font-black text-amber-400">{lumbarShearN} N</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase">Safety Threshold</div>
                  <div className="text-xs font-mono text-zinc-300 font-bold">Max 500 N</div>
                </div>
              </div>

              {/* Progress Bar for Shear Force */}
              <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden mt-1">
                <div
                  className={`h-full rounded-full transition-all duration-100 ${
                    lumbarShearN > 450 ? "bg-red-500" : "bg-amber-500"
                  }`}
                  style={{ width: `${Math.min(100, (lumbarShearN / 550) * 100)}%` }}
                />
              </div>
            </div>

            {/* Block 3: Virtual sEMG Muscle Activation */}
            <div className={`p-4 rounded-2xl border transition-all ${
              selectedJoint === "vmo"
                ? "bg-emerald-950/20 border-emerald-500/40"
                : "bg-zinc-900/60 border-zinc-800/80"
            } space-y-2.5`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Virtual sEMG Activation
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">Hill MTU</span>
              </div>

              <div className="space-y-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-zinc-400">VMO (Inner Quad)</span>
                    <span className="text-emerald-400 font-bold">{vmoPct}%</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-100" style={{ width: `${vmoPct}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-zinc-400">VL (Outer Quad)</span>
                    <span className="text-red-400 font-bold">{vlPct}%</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-red-500 h-full rounded-full transition-all duration-100" style={{ width: `${vlPct}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-zinc-400">Gluteus Medius</span>
                    <span className={`font-bold ${gluteMediusPct < 30 ? "text-red-400" : "text-amber-400"}`}>
                      {gluteMediusPct}% {gluteMediusPct < 30 ? "(Inhibited)" : ""}
                    </span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-100 ${
                        gluteMediusPct < 30 ? "bg-red-500" : "bg-amber-500"
                      }`}
                      style={{ width: `${gluteMediusPct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Block 4: Interactive Depth Scrubber */}
            <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-red-400" />
                  <span>Manual Form Scrubber</span>
                </span>
                <span className="text-red-400 font-black">{Math.round(squatDepth * 100)}%</span>
              </div>

              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={squatDepth}
                onChange={(e) => {
                  setIsPlayingMotion(false);
                  setSquatDepth(parseFloat(e.target.value));
                }}
                className="w-full accent-red-500 cursor-pointer h-2 bg-zinc-800 rounded-lg appearance-none"
              />

              <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                <span>Standing (165°)</span>
                <span>Parallel (90°)</span>
                <span>Deep Squat (80°)</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
