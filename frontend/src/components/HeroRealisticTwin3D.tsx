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
  Flame,
  Play,
  Pause,
  Sparkles,
  Compass,
  ArrowUpRight
} from "lucide-react";

type SkinMode = "ecorche" | "cyber" | "realistic";

interface JointPinProps {
  position: [number, number, number];
  title: string;
  metric: string;
  status: "critical" | "warning" | "optimal";
  detail: string;
  isOpen: boolean;
  onToggle: () => void;
}

function FloatingJointPin({ position, title, metric, status, detail, isOpen, onToggle }: JointPinProps) {
  const colorMap = {
    critical: "bg-red-500 border-red-400 text-red-400 shadow-red-500/40",
    warning: "bg-amber-500 border-amber-400 text-amber-400 shadow-amber-500/40",
    optimal: "bg-emerald-500 border-emerald-400 text-emerald-400 shadow-emerald-500/40",
  };

  const badgeColor = {
    critical: "bg-red-950/90 border-red-500/50 text-red-200",
    warning: "bg-amber-950/90 border-amber-500/50 text-amber-200",
    optimal: "bg-emerald-950/90 border-emerald-500/50 text-emerald-200",
  };

  return (
    <Html position={position} center distanceFactor={4.5} zIndexRange={[100, 0]}>
      <div className="relative group cursor-pointer select-none">
        {/* Pulsing 3D Target Reticle */}
        <button
          onClick={onToggle}
          className="relative flex items-center justify-center w-6 h-6 rounded-full bg-black/80 border border-white/20 backdrop-blur-md hover:scale-125 transition-transform"
        >
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${colorMap[status].split(" ")[0]}`} />
          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${colorMap[status].split(" ")[0]}`} />
        </button>

        {/* Hover / Active Telemetry Callout */}
        <div
          className={`absolute left-7 top-1/2 -translate-y-1/2 w-48 pointer-events-auto rounded-xl border p-2.5 shadow-2xl backdrop-blur-xl transition-all duration-300 ${badgeColor[status]} ${
            isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto"
          }`}
        >
          <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider mb-1">
            <span>{title}</span>
            <span className="font-extrabold">{metric}</span>
          </div>
          <p className="text-[10px] text-zinc-300 leading-tight">{detail}</p>
        </div>
      </div>
    </Html>
  );
}

// ── Realistic 3D Human Body Model Component ──────────────────────────────────
function AnatomicalHumanoidMesh({
  skinMode,
  squatDepth,
  selectedPin,
  setSelectedPin,
}: {
  skinMode: SkinMode;
  squatDepth: number; // 0 (standing) to 1 (deep squat)
  selectedPin: string | null;
  setSelectedPin: (pin: string | null) => void;
}) {
  const obj = useLoader(OBJLoader, "/models/FinalBaseMesh.obj");

  const meshRef = useRef<THREE.Group>(null);
  const uniformsRef = useRef({
    uTime: { value: 0 },
    uHeatValgus: { value: 0.8 },
    uHeatLumbar: { value: 0.5 },
  });

  // Calculate dynamic joint coordinates based on squatDepth
  const kneeY = 0.48 - squatDepth * 0.08;
  const leftKneeX = 0.12 - squatDepth * 0.04; // Inward valgus collapse in 3D
  const lumbarY = 1.12 - squatDepth * 0.09;
  const lumbarZ = 0.05 + squatDepth * 0.06; // Forward pitch

  const { cloned } = useMemo(() => {
    const c = obj.clone(true);
    const finalScale = 0.0858;
    c.scale.set(finalScale, finalScale, finalScale);
    c.position.set(0, 0, 0);

    // Material setup based on skin mode
    let baseColor = 0xd89b8a;
    let roughness = 0.7;
    let metalness = 0.05;
    let emissive = 0x221310;
    let emissiveIntensity = 0.05;

    if (skinMode === "cyber") {
      baseColor = 0x18181b;
      roughness = 0.25;
      metalness = 0.85;
      emissive = 0x09090b;
      emissiveIntensity = 0.2;
    } else if (skinMode === "realistic") {
      baseColor = 0xc68642;
      roughness = 0.6;
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
    uniformsRef.current.uTime.value = state.clock.getElapsedTime();
    if (meshRef.current) {
      // Subtle rhythmic breathing animation
      const breath = Math.sin(state.clock.getElapsedTime() * 1.5) * 0.002;
      meshRef.current.position.y = -squatDepth * 0.05 + breath;
    }
  });

  return (
    <group ref={meshRef}>
      <primitive object={cloned} />

      {/* Floating 3D Telemetry Pins Anchored in Real World Coordinates */}
      <FloatingJointPin
        position={[leftKneeX, kneeY, 0.08]}
        title="Left Patellofemoral"
        metric={`+${(squatDepth * 3.8).toFixed(1)} cm`}
        status={squatDepth > 0.5 ? "critical" : "warning"}
        detail="Medial knee collapse. Peak valgus torque across ACL ligament."
        isOpen={selectedPin === "knee"}
        onToggle={() => setSelectedPin(selectedPin === "knee" ? null : "knee")}
      />

      <FloatingJointPin
        position={[0, lumbarY, lumbarZ]}
        title="L4-L5 Lumbar Spine"
        metric={`${Math.round(280 + squatDepth * 240)} N`}
        status={squatDepth > 0.6 ? "warning" : "optimal"}
        detail="Trunk forward pitch generates vertebral compressive moment arm."
        isOpen={selectedPin === "lumbar"}
        onToggle={() => setSelectedPin(selectedPin === "lumbar" ? null : "lumbar")}
      />

      <FloatingJointPin
        position={[0.16, 0.62 - squatDepth * 0.05, 0.07]}
        title="Vastus Medialis (VMO)"
        metric={`${Math.round(45 + squatDepth * 35)}%`}
        status="optimal"
        detail="Hill muscle fiber activation. Quadriceps co-contraction ratio."
        isOpen={selectedPin === "vmo"}
        onToggle={() => setSelectedPin(selectedPin === "vmo" ? null : "vmo")}
      />
    </group>
  );
}

// ── Fallback 3D Holographic Loader ───────────────────────────────────────────
function ModelLoaderFallback() {
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-black/90 border border-zinc-800 backdrop-blur-xl shadow-2xl text-center">
        <div className="w-10 h-10 border-2 border-red-500 border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-xs font-mono font-bold tracking-wider text-white uppercase">
          Streaming 3D Human Mesh
        </span>
        <span className="text-[10px] font-mono text-zinc-500 mt-0.5">
          Loading High-Res Anatomical Rig (2.5 MB)
        </span>
      </div>
    </Html>
  );
}

// ── Main Hero Realistic Twin Component ───────────────────────────────────────
export function HeroRealisticTwin3D() {
  const [skinMode, setSkinMode] = useState<SkinMode>("ecorche");
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const [isPlayingMotion, setIsPlayingMotion] = useState(true);
  const [squatDepth, setSquatDepth] = useState(0.65); // 0 (standing) to 1 (deep)
  const [selectedPin, setSelectedPin] = useState<string | null>("knee");

  // Dynamic Squat Motion Loop
  useEffect(() => {
    if (!isPlayingMotion) return;
    const interval = setInterval(() => {
      const t = Date.now() / 1500;
      const depth = (Math.sin(t) + 1) / 2; // Oscillate 0 to 1
      setSquatDepth(depth);
    }, 40);
    return () => clearInterval(interval);
  }, [isPlayingMotion]);

  // Derived Biomechanical Telemetry
  const kneeFlexionDeg = Math.round(165 - squatDepth * 85); // 165° standing down to 80° squat
  const valgusDevCm = (squatDepth * 3.8).toFixed(1);
  const aclStrainPct = (3.5 + squatDepth * 5.2).toFixed(1);
  const lumbarShearN = Math.round(280 + squatDepth * 240);
  const vmoPct = Math.round(40 + squatDepth * 38);
  const vlPct = Math.round(45 + squatDepth * 44);
  const gluteMediusPct = Math.round(25 + (1 - squatDepth * 0.45) * 35);

  return (
    <div className="relative w-full max-w-5xl mx-auto rounded-3xl p-1 bg-gradient-to-b from-red-500/30 via-zinc-800/40 to-zinc-950/90 shadow-2xl shadow-red-950/40">
      <div className="rounded-[22px] bg-[#0c101d]/95 backdrop-blur-2xl border border-zinc-800 overflow-hidden flex flex-col">
        
        {/* Top Control Bar */}
        <div className="px-5 py-3.5 border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 bg-[#09090b]/80">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            <span className="text-xs font-mono font-bold tracking-wider text-white uppercase">
              3D Musculoskeletal Digital Twin
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 font-bold">
              120 Hz Sub-Frame
            </span>
          </div>

          {/* Quick Toolbar */}
          <div className="flex items-center gap-2 text-xs font-mono">
            {/* Skin Material Switcher */}
            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
              <button
                onClick={() => setSkinMode("ecorche")}
                className={`px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                  skinMode === "ecorche" ? "bg-red-600 text-white shadow" : "text-zinc-400 hover:text-white"
                }`}
                title="Écorché Muscular Anatomy"
              >
                Muscle
              </button>
              <button
                onClick={() => setSkinMode("cyber")}
                className={`px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                  skinMode === "cyber" ? "bg-cyan-600 text-white shadow" : "text-zinc-400 hover:text-white"
                }`}
                title="Cyber Biomechanics Scan"
              >
                Cyber
              </button>
              <button
                onClick={() => setSkinMode("realistic")}
                className={`px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                  skinMode === "realistic" ? "bg-amber-600 text-white shadow" : "text-zinc-400 hover:text-white"
                }`}
                title="PBR Realistic Skin"
              >
                Skin
              </button>
            </div>

            {/* Orbit Auto-Rotate Toggle */}
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

            {/* Play/Pause Motion */}
            <button
              onClick={() => setIsPlayingMotion(!isPlayingMotion)}
              className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white text-[11px] flex items-center gap-1 cursor-pointer"
            >
              {isPlayingMotion ? <Pause className="w-3 h-3 text-amber-400" /> : <Play className="w-3 h-3 text-emerald-400" />}
              <span className="hidden sm:inline">{isPlayingMotion ? "Pause" : "Simulate"}</span>
            </button>
          </div>
        </div>

        {/* Center Stage: Interactive 3D WebGL Canvas with HUD Overlays */}
        <div className="relative w-full h-[460px] md:h-[520px] bg-gradient-to-b from-[#09090b] via-[#0c101d] to-[#080b14] overflow-hidden">
          
          {/* Top Left Floating Telemetry Badge */}
          <div className="absolute top-4 left-4 z-10 space-y-2 pointer-events-none">
            <div className="p-3 rounded-xl bg-black/70 border border-zinc-800/80 backdrop-blur-md shadow-xl text-left pointer-events-auto">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
                <AlertTriangle className="w-3 h-3 text-red-400" />
                <span>Patellar Tracking</span>
              </div>
              <div className="text-xl font-mono font-black text-red-400">
                +{valgusDevCm} cm <span className="text-xs font-normal text-zinc-400">Valgus</span>
              </div>
              <div className="text-[10px] font-mono text-zinc-400 mt-1">
                Knee Flexion: <span className="text-white font-bold">{kneeFlexionDeg}°</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-black/70 border border-zinc-800/80 backdrop-blur-md shadow-xl text-left pointer-events-auto">
              <div className="text-[10px] font-mono text-zinc-400 uppercase">ACL Strain Vector</div>
              <div className="text-sm font-mono font-bold text-amber-400 flex items-center gap-1.5">
                <span>{aclStrainPct}%</span>
                <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Elevated
                </span>
              </div>
            </div>
          </div>

          {/* Top Right Floating Telemetry Badge */}
          <div className="absolute top-4 right-4 z-10 space-y-2 text-right pointer-events-none">
            <div className="p-3 rounded-xl bg-black/70 border border-zinc-800/80 backdrop-blur-md shadow-xl pointer-events-auto">
              <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
                L4-L5 Lumbar Shear
              </div>
              <div className="text-xl font-mono font-black text-amber-400">
                {lumbarShearN} <span className="text-xs font-normal text-zinc-400">N</span>
              </div>
              <div className="text-[10px] font-mono text-zinc-400 mt-1">
                Vertebral Safety Threshold: 500 N
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-black/70 border border-zinc-800/80 backdrop-blur-md shadow-xl pointer-events-auto text-left">
              <div className="text-[10px] font-mono text-zinc-400 uppercase">3D Interaction</div>
              <div className="text-[11px] font-mono text-zinc-300 flex items-center gap-1 mt-0.5">
                <span className="text-emerald-400 font-bold">Drag</span> to orbit 360°
              </div>
            </div>
          </div>

          {/* Three.js 3D WebGL Canvas */}
          <Canvas
            shadows
            camera={{ position: [0, 0.45, 2.7], fov: 38 }}
            gl={{
              antialias: true,
              powerPreference: "high-performance",
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.25,
            }}
          >
            {/* Dramatic Studio Rim Lighting for Anatomical Depth */}
            <ambientLight intensity={0.8} color="#ffffff" />
            <directionalLight position={[2.5, 3.5, 3]} intensity={3.2} color="#ffffff" castShadow />
            <directionalLight position={[-3, 2, -2]} intensity={2.6} color="#ef4444" /> {/* Crimson Backlight */}
            <directionalLight position={[3, 1.5, -2]} intensity={2.2} color="#06b6d4" /> {/* Cyan Backlight */}
            <pointLight position={[0, -0.2, 1.5]} intensity={1.2} color="#f59e0b" />

            {/* Circular Grid Studio Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.92, 0]} receiveShadow>
              <planeGeometry args={[10, 10]} />
              <shadowMaterial opacity={0.3} />
            </mesh>

            <Suspense fallback={<ModelLoaderFallback />}>
              <AnatomicalHumanoidMesh
                skinMode={skinMode}
                squatDepth={squatDepth}
                selectedPin={selectedPin}
                setSelectedPin={setSelectedPin}
              />
            </Suspense>

            {/* 360° Free Drag Orbit Controls */}
            <OrbitControls
              target={[0, 0.38, 0]}
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

          {/* Bottom Hint */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
            <div className="px-3 py-1 rounded-full bg-black/60 border border-zinc-800 text-[10px] font-mono text-zinc-400 backdrop-blur-md">
              ● Click & drag anywhere on the 3D model to inspect joint kinetics from any angle
            </div>
          </div>

        </div>

        {/* Bottom Interactive Virtual sEMG & Form Scrubbing Deck */}
        <div className="p-4 md:p-5 border-t border-zinc-800/80 bg-[#09090b]/90 space-y-4">
          
          {/* Depth / Form Interactive Scrub Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-zinc-950/80 p-3 rounded-2xl border border-zinc-800/70">
            <div className="flex items-center gap-2 min-w-[150px]">
              <Sliders className="w-4 h-4 text-red-400" />
              <span className="text-xs font-mono font-bold text-white uppercase">Form Depth</span>
              <span className="text-xs font-mono font-bold text-red-400">
                {Math.round(squatDepth * 100)}%
              </span>
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

            <span className="text-[11px] font-mono text-zinc-400 whitespace-nowrap">
              {squatDepth < 0.3 ? "Standing Prep" : squatDepth < 0.7 ? "Deceleration" : "Peak Depth"}
            </span>
          </div>

          {/* 3 Virtual sEMG Muscle Channels */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/70 space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-zinc-400">VMO (Inner Quad)</span>
                <span className="font-bold text-emerald-400">{vmoPct}%</span>
              </div>
              <div className="w-full bg-zinc-800/80 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-100"
                  style={{ width: `${vmoPct}%` }}
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/70 space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-zinc-400">VL (Outer Quad)</span>
                <span className="font-bold text-red-400">{vlPct}%</span>
              </div>
              <div className="w-full bg-zinc-800/80 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-red-500 h-full rounded-full transition-all duration-100"
                  style={{ width: `${vlPct}%` }}
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/70 space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-zinc-400">Gluteus Medius</span>
                <span className={`font-bold ${gluteMediusPct < 30 ? "text-red-400" : "text-amber-400"}`}>
                  {gluteMediusPct}% {gluteMediusPct < 30 ? "(Inhibited)" : ""}
                </span>
              </div>
              <div className="w-full bg-zinc-800/80 rounded-full h-2 overflow-hidden">
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

      </div>
    </div>
  );
}
