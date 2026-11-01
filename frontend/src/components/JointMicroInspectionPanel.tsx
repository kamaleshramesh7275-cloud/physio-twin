import React from "react";
import { AlertTriangle, CheckCircle2, ShieldAlert, ArrowLeft, Activity, Zap } from "lucide-react";

export type InspectionStation = "none" | "knee" | "lumbar" | "shoulder";

export interface JointMicroInspectionPanelProps {
  station: InspectionStation;
  onClose: () => void;
  // Kinematic parameters for selected joint
  kneeAngle: number;
  valgusDevCm: number;
  aclStrainPct: number;
  lumbarShearN: number;
  trunkInclination: number;
  vmoActivation: number;
  vlActivation: number;
}

export const JointMicroInspectionPanel: React.FC<JointMicroInspectionPanelProps> = ({
  station,
  onClose,
  kneeAngle,
  valgusDevCm,
  aclStrainPct,
  lumbarShearN,
  trunkInclination,
  vmoActivation,
  vlActivation,
}) => {
  if (station === "none") return null;

  return (
    <div className="absolute top-4 right-4 z-30 w-80 max-w-[calc(100vw-2rem)] rounded-2xl bg-[#09090b]/95 border border-zinc-700/80 shadow-2xl backdrop-blur-xl p-4 text-zinc-100 font-mono text-xs space-y-3.5">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="font-bold text-sm text-white uppercase tracking-wider">
            {station === "knee" && "Patellofemoral & ACL Station"}
            {station === "lumbar" && "L4–L5 Lumbar Spine Station"}
            {station === "shoulder" && "Glenohumeral Joint Station"}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          title="Exit Micro-Inspection"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── 1. KNEE INSPECTION STATION ───────────────────────────────── */}
      {station === "knee" && (
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">ACL Ligament Strain</span>
              <span className={`font-bold ${aclStrainPct > 6.0 ? "text-red-400" : "text-emerald-400"}`}>
                {aclStrainPct}% {aclStrainPct > 6.0 ? "(Elevated)" : "(Normal)"}
              </span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-150 ${
                  aclStrainPct > 6.0 ? "bg-red-500" : "bg-emerald-500"
                }`}
                style={{ width: `${Math.min(100, (aclStrainPct / 10) * 100)}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
              <div className="text-[10px] text-zinc-500 uppercase">Valgus Drift</div>
              <div className="text-base font-bold text-red-400">+{valgusDevCm} cm</div>
              <div className="text-[10px] text-zinc-400">Max limit: 2.0 cm</div>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
              <div className="text-[10px] text-zinc-500 uppercase">Flexion Angle</div>
              <div className="text-base font-bold text-white">{kneeAngle}°</div>
              <div className="text-[10px] text-zinc-400">Target: 80°–90°</div>
            </div>
          </div>

          {/* VMO:VL Balance Dial */}
          <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-zinc-400">VMO : VL Quadriceps Balance</span>
              <span className="font-bold text-amber-400">
                {(vmoActivation / Math.max(1, vlActivation)).toFixed(2)} Ratio
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 leading-tight">
              Optimal ratio &gt; 0.90. Deficits trigger lateral patellar tracking syndrome.
            </p>
          </div>
        </div>
      )}

      {/* ── 2. LUMBAR INSPECTION STATION ─────────────────────────────── */}
      {station === "lumbar" && (
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">L4–L5 Shear Force</span>
              <span className={`font-bold ${lumbarShearN > 450 ? "text-red-400" : "text-amber-400"}`}>
                {lumbarShearN} N / 500 N
              </span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-150 ${
                  lumbarShearN > 450 ? "bg-red-500" : "bg-amber-500"
                }`}
                style={{ width: `${Math.min(100, (lumbarShearN / 650) * 100)}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
              <div className="text-[10px] text-zinc-500 uppercase">Trunk Inclination</div>
              <div className="text-base font-bold text-white">{trunkInclination}°</div>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
              <div className="text-[10px] text-zinc-500 uppercase">NIOSH Safety</div>
              <div className="text-base font-bold text-emerald-400">Controlled</div>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. SHOULDER INSPECTION STATION ───────────────────────────── */}
      {station === "shoulder" && (
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
            <div className="text-[10px] text-zinc-500 uppercase">Subacromial Clearance</div>
            <div className="text-base font-bold text-emerald-400">8.4 mm (Normal)</div>
            <div className="text-[10px] text-zinc-400 mt-1">Impingement boundary &lt; 6.0 mm</div>
          </div>
          <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
            <div className="text-[10px] text-zinc-500 uppercase">Scapular Rhythm</div>
            <div className="text-xs font-bold text-white">2:1 Glenohumeral Ratio verified</div>
          </div>
        </div>
      )}

      {/* Exit Button */}
      <button
        onClick={onClose}
        className="w-full py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold transition-all text-xs cursor-pointer"
      >
        Return to Full Body View
      </button>

    </div>
  );
};

