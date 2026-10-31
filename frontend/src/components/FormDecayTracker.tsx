import React from "react";
import { TrendingDown } from "lucide-react";

export type RepDecayData = {
  repNumber: number;
  symmetryScore: number; // 0-100
  valgusAngle: number;   // deg
  repTempoSec: number;
};

const DEFAULT_REPS: RepDecayData[] = [
  { repNumber: 1, symmetryScore: 94, valgusAngle: 2.1, repTempoSec: 1.8 },
  { repNumber: 2, symmetryScore: 92, valgusAngle: 2.4, repTempoSec: 1.9 },
  { repNumber: 3, symmetryScore: 90, valgusAngle: 2.8, repTempoSec: 2.0 },
  { repNumber: 4, symmetryScore: 88, valgusAngle: 3.2, repTempoSec: 2.1 },
  { repNumber: 5, symmetryScore: 85, valgusAngle: 4.1, repTempoSec: 2.3 },
  { repNumber: 6, symmetryScore: 81, valgusAngle: 5.0, repTempoSec: 2.5 },
  { repNumber: 7, symmetryScore: 74, valgusAngle: 6.8, repTempoSec: 2.9 },
  { repNumber: 8, symmetryScore: 65, valgusAngle: 8.5, repTempoSec: 3.4 },
];

export function FormDecayTracker({ reps = DEFAULT_REPS }: { reps?: RepDecayData[] }) {
  const breakdownRep = reps.find(r => r.symmetryScore < 75) || reps[reps.length - 1];

  return (
    <div className="bg-white/95 border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-amber-600" />
          <span className="text-xs font-bold text-slate-900 tracking-wide">Fatigue-Induced Form Decay Tracker</span>
        </div>
        <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
          Breakdown on Rep {breakdownRep.repNumber}
        </span>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed">
        Tracks rep-by-rep stability decay across multi-rep sets to pinpoint exact neuromuscular fatigue thresholds.
      </p>

      {/* Rep-by-Rep Decay Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {reps.map((r) => {
          const isFailing = r.symmetryScore < 75;

          return (
            <div 
              key={r.repNumber} 
              className={`p-2.5 rounded-xl text-center border font-mono transition-all ${
                isFailing 
                  ? "bg-rose-50 border-rose-300 text-rose-700 shadow-2xs" 
                  : "bg-slate-50 border-slate-200 text-slate-800"
              }`}
            >
              <div className="text-[10px] text-slate-500 font-sans font-medium">Rep {r.repNumber}</div>
              <div className="text-xs font-black mt-0.5">{r.symmetryScore}%</div>
              <div className="text-[10px] text-slate-500">{r.valgusAngle}°</div>
            </div>
          );
        })}
      </div>

      <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl flex items-center justify-between text-xs text-slate-700">
        <span className="font-medium">Form Decay Limit:</span>
        <span className="font-mono text-amber-800 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
          Recommended Set Stop at Rep {breakdownRep.repNumber - 1}
        </span>
      </div>
    </div>
  );
}
