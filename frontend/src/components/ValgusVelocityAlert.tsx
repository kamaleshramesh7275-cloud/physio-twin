import React from "react";
import { AlertTriangle, ShieldAlert } from "lucide-react";

interface Props {
  angularVelocityDegSec?: number;
  angularAccelDegSec2?: number;
  normalizedKamNmKg?: number;
}

export function ValgusVelocityAlert({ 
  angularVelocityDegSec = 142, 
  angularAccelDegSec2 = 820,
  normalizedKamNmKg = 0.85
}: Props) {
  const isDangerousVelocity = angularVelocityDegSec > 120;
  const isHighKam = normalizedKamNmKg > 1.2;

  return (
    <div className="bg-white/95 border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span className="text-xs font-bold text-slate-900 tracking-wide">Valgus Kinetics &amp; Joint Moments</span>
        </div>
        <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
          isDangerousVelocity || isHighKam ? "bg-rose-50 text-rose-700 border-rose-200 animate-pulse" : "bg-emerald-50 text-emerald-700 border-emerald-200"
        }`}>
          {isDangerousVelocity || isHighKam ? "High Collapse Risk" : "Safe Speed"}
        </span>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed">
        Measures the <em>rotational acceleration</em> and <em>Knee Abduction Moment (KAM)</em> — the gold standard clinical predictor of non-contact ACL tears and cartilage breakdown.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-50/80 border border-slate-200/80 p-3.5 rounded-xl">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Angular Velocity</div>
          <div className={`font-mono text-2xl font-black ${angularVelocityDegSec > 120 ? "text-rose-700" : "text-slate-900"}`}>
            {angularVelocityDegSec} <span className="text-xs font-normal text-slate-500">°/s</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Threshold: &gt; 120°/s</div>
        </div>

        <div className="bg-slate-50/80 border border-slate-200/80 p-3.5 rounded-xl">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Angular Accel</div>
          <div className="font-mono text-2xl font-black text-slate-900">
            {angularAccelDegSec2} <span className="text-xs font-normal text-slate-500">°/s²</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Rotational joint force</div>
        </div>

        {/* Knee Abduction Moment (KAM) Metric Card */}
        <div className="col-span-2 bg-slate-50/80 border border-slate-200/80 p-3.5 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">Knee Abduction Moment (KAM)</div>
            <div className="text-[10px] text-slate-400">Frontal plane ACL shear torque</div>
          </div>
          <div className="text-right">
            <div className={`font-mono text-xl font-black ${normalizedKamNmKg > 1.2 ? "text-rose-700" : "text-emerald-700"}`}>
              {normalizedKamNmKg.toFixed(2)} <span className="text-xs font-normal text-slate-500">Nm/kg</span>
            </div>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${normalizedKamNmKg > 1.2 ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
              {normalizedKamNmKg > 1.8 ? "Critical ACL Risk" : normalizedKamNmKg > 1.2 ? "Moderate Shear" : "Optimal"}
            </span>
          </div>
        </div>
      </div>

      {(isDangerousVelocity || isHighKam) && (
        <div className="bg-rose-50/90 border border-rose-200 text-rose-950 text-xs p-3.5 rounded-xl flex items-start gap-2.5 shadow-2xs">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <span><strong>ACL Risk Alert:</strong> Inward knee collapse moment exceeded {normalizedKamNmKg > 1.2 ? "safe KAM limits (>1.2 Nm/kg)" : "120°/s"}. Activate gluteus medius to brace knee tracking.</span>
        </div>
      )}
    </div>
  );
}
