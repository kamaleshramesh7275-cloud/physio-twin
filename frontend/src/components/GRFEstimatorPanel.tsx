import React from "react";
import { Zap } from "lucide-react";

interface Props {
  userWeightKg?: number;
  peakAccelerationY?: number; // m/s^2
}

export function GRFEstimatorPanel({ userWeightKg = 74, peakAccelerationY = 18.2 }: Props) {
  // F = m * (g + a_y)
  const g = 9.81;
  const totalAcc = g + peakAccelerationY;
  const forceNewtons = Math.round(userWeightKg * totalAcc);
  const bwMultiple = parseFloat((totalAcc / g).toFixed(2));

  return (
    <div className="bg-white/95 border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold text-slate-900 tracking-wide">Ground Reaction Force (GRF) Estimator</span>
        </div>
        <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
          Camera-Derived Force
        </span>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed">
        Estimates vertical ground reaction force (F_v = m · (g + a_y)) directly from camera landmark acceleration without physical force plates.
      </p>

      {/* Force Metric Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-50/80 border border-slate-200/80 p-3.5 rounded-xl">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Peak Vertical Force</div>
          <div className="font-mono text-2xl font-black text-slate-900">
            {forceNewtons} <span className="text-xs font-medium text-slate-500">N</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Impact load at landing</div>
        </div>

        <div className="bg-slate-50/80 border border-slate-200/80 p-3.5 rounded-xl">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Bodyweight Multiple</div>
          <div className={`font-mono text-2xl font-black ${bwMultiple > 2.5 ? "text-amber-700" : "text-emerald-700"}`}>
            {bwMultiple}x <span className="text-xs font-medium text-slate-500">BW</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Relative joint load</div>
        </div>
      </div>

      {/* Real-time Acceleration Bar */}
      <div className="bg-slate-50/80 border border-slate-200/80 p-3.5 rounded-xl space-y-1.5">
        <div className="flex justify-between text-[11px] font-mono">
          <span className="text-slate-600 font-medium">Vertical Acceleration (a_y)</span>
          <span className="text-blue-700 font-bold">{peakAccelerationY.toFixed(1)} m/s²</span>
        </div>
        <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-blue-600 h-full transition-all duration-300"
            style={{ width: `${Math.min(100, (peakAccelerationY / 30) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
