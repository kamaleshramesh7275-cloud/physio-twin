import React, { useState, useEffect } from "react";
import { Activity, Zap, ShieldAlert, CheckCircle2, AlertTriangle, Eye, Sliders, ArrowUpRight } from "lucide-react";

export const HeroTelemetryPreview: React.FC = () => {
  const [kneeAngle, setKneeAngle] = useState(82);
  const [isSimulating, setIsSimulating] = useState(true);

  // Smooth periodic squat depth oscillation for hero demo
  useEffect(() => {
    if (!isSimulating) return;
    const interval = setInterval(() => {
      const time = Date.now() / 1200;
      const angle = Math.round(90 + Math.sin(time) * 45); // 45° (deep squat) to 135° (standing)
      setKneeAngle(angle);
    }, 50);
    return () => clearInterval(interval);
  }, [isSimulating]);

  // Derived biomechanical telemetry
  const squatFraction = Math.max(0, Math.min(1, (135 - kneeAngle) / 90));
  const valgusDevCm = (squatFraction * 3.8).toFixed(1);
  const aclStrain = (4.2 + squatFraction * 4.6).toFixed(1);
  const lumbarShear = Math.round(280 + squatFraction * 260);
  const vmoActivation = Math.round(35 + (1 - squatFraction * 0.4) * 45);
  const vlActivation = Math.round(40 + squatFraction * 48);
  const gluteActivation = Math.round(20 + squatFraction * 65);

  return (
    <div className="relative w-full max-w-2xl mx-auto rounded-3xl p-1 bg-gradient-to-b from-red-500/30 via-slate-800/40 to-slate-950/80 shadow-2xl shadow-red-950/30">
      <div className="rounded-[22px] bg-[#0c101d]/95 backdrop-blur-2xl border border-slate-800 p-5 md:p-6 space-y-5">
        
        {/* Top Header of Simulated Device */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            <span className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
              Live Edge Biomechanical Rig
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 font-bold">
              120 Hz Sub-Frame
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              {isSimulating ? "Pause Motion" : "Auto Play"}
            </button>
            <span className="text-xs font-mono font-bold text-emerald-400">60 FPS</span>
          </div>
        </div>

        {/* 3D Skeletal Wireframe Canvas Mockup */}
        <div className="relative h-64 md:h-72 w-full rounded-2xl bg-[#060913] border border-slate-800/80 overflow-hidden flex items-center justify-center">
          {/* Subtle 3D Floor Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:2rem_2rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

          {/* SVG Animated Humanoid Skeletal Vector Rig */}
          <svg className="w-56 h-full overflow-visible z-10" viewBox="0 0 200 240">
            {/* Center Pelvic Anchor */}
            <circle cx="100" cy="110" r="4" fill="#38bdf8" />
            
            {/* Spine & Head */}
            <line x1="100" y1="110" x2="100" y2="60" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
            <circle cx="100" cy="40" r="14" fill="none" stroke="#38bdf8" strokeWidth="2.5" />
            <line x1="75" y1="65" x2="125" y2="65" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />

            {/* Left Leg with Dynamic Knee Valgus Shift */}
            <line
              x1="90" y1="110"
              x2={80 + Number(valgusDevCm) * 3}
              y2={110 + (kneeAngle / 135) * 60}
              stroke="#ef4444"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <line
              x1={80 + Number(valgusDevCm) * 3}
              y1={110 + (kneeAngle / 135) * 60}
              x2="72"
              y2="215"
              stroke="#ef4444"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle
              cx={80 + Number(valgusDevCm) * 3}
              cy={110 + (kneeAngle / 135) * 60}
              r="6"
              fill="#ef4444"
              className="animate-pulse"
            />

            {/* Valgus Tension Vector Indicator */}
            <line
              x1="76"
              y1={110 + (kneeAngle / 135) * 60}
              x2={80 + Number(valgusDevCm) * 3}
              y2={110 + (kneeAngle / 135) * 60}
              stroke="#f59e0b"
              strokeWidth="2"
              strokeDasharray="2 2"
            />

            {/* Right Leg (Normative tracking) */}
            <line
              x1="110" y1="110"
              x2="122"
              y2={110 + (kneeAngle / 135) * 60}
              stroke="#10b981"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <line
              x1="122"
              y1={110 + (kneeAngle / 135) * 60}
              x2="128"
              y2="215"
              stroke="#10b981"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle
              cx="122"
              cy={110 + (kneeAngle / 135) * 60}
              r="4.5"
              fill="#10b981"
            />
          </svg>

          {/* Floating Pill Overlays */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
            <div className="flex items-center gap-2 bg-[#090d16]/90 backdrop-blur px-2.5 py-1 rounded-lg border border-red-500/40 text-[11px] font-mono text-red-300">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>Valgus Drift: +{valgusDevCm} cm</span>
            </div>
            <div className="flex items-center gap-2 bg-[#090d16]/90 backdrop-blur px-2.5 py-1 rounded-lg border border-emerald-500/40 text-[11px] font-mono text-emerald-300">
              <span>Knee Flexion: {kneeAngle}°</span>
            </div>
          </div>

          <div className="absolute top-3 right-3 flex flex-col gap-1.5 pointer-events-none text-right">
            <div className="bg-[#090d16]/90 backdrop-blur px-2.5 py-1 rounded-lg border border-slate-700 text-[11px] font-mono text-slate-300">
              ACL Strain: <strong className={Number(aclStrain) > 7 ? "text-red-400" : "text-amber-400"}>{aclStrain}%</strong>
            </div>
            <div className="bg-[#090d16]/90 backdrop-blur px-2.5 py-1 rounded-lg border border-slate-700 text-[11px] font-mono text-slate-300">
              L4-L5 Shear: <strong>{lumbarShear} N</strong>
            </div>
          </div>
        </div>

        {/* Live Virtual sEMG Activation Gauges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400 font-mono">VMO (Inner Quad)</span>
              <span className={`font-mono font-bold ${vmoActivation < 45 ? "text-amber-400" : "text-emerald-400"}`}>
                {vmoActivation}%
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-150 ${
                  vmoActivation < 45 ? "bg-amber-400" : "bg-emerald-400"
                }`}
                style={{ width: `${vmoActivation}%` }}
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400 font-mono">VL (Outer Quad)</span>
              <span className="font-mono font-bold text-red-400">{vlActivation}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full rounded-full bg-red-400 transition-all duration-150"
                style={{ width: `${vlActivation}%` }}
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400 font-mono">Gluteus Medius</span>
              <span className={`font-mono font-bold ${gluteActivation > 50 ? "text-emerald-400" : "text-amber-400"}`}>
                {gluteActivation}%
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-150 ${
                  gluteActivation > 50 ? "bg-emerald-400" : "bg-amber-400"
                }`}
                style={{ width: `${gluteActivation}%` }}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

