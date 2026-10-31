import React from "react";
import { Activity } from "lucide-react";

export type SpinalSegmentData = {
  region: "Cervical (Neck)" | "Thoracic (Upper Back)" | "Lumbar (Lower Back)";
  currentAngle: number;
  optimalRange: string;
  status: "Optimal" | "Watch" | "Warning";
  description: string;
};

const DEFAULT_SEGMENTS: SpinalSegmentData[] = [
  { region: "Cervical (Neck)", currentAngle: 14, optimalRange: "0° - 15°", status: "Optimal", description: "Minimal forward head shift detected." },
  { region: "Thoracic (Upper Back)", currentAngle: 38, optimalRange: "20° - 40°", status: "Watch", description: "Slight upper kyphotic curvature under load." },
  { region: "Lumbar (Lower Back)", currentAngle: 28, optimalRange: "15° - 25°", status: "Warning", description: "Lumbar flexion deviation exceeding safe threshold." },
];

export function SpinalSegmentationView({ segments = DEFAULT_SEGMENTS }: { segments?: SpinalSegmentData[] }) {
  return (
    <div className="bg-white/95 border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold text-slate-900 tracking-wide">Spinal Segmental Articulation</span>
        </div>
        <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 font-semibold">
          3-Zone Articulation
        </span>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed">
        Breaks the spinal column into 3 distinct anatomical regions (Cervical, Thoracic, Lumbar) to pinpoint specific disc stress.
      </p>

      <div className="space-y-2.5">
        {segments.map((s) => {
          const isWarn = s.status === "Warning";
          const isWatch = s.status === "Watch";

          return (
            <div key={s.region} className="bg-slate-50/80 border border-slate-200/80 p-3.5 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{s.region}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                  isWarn ? "bg-rose-50 text-rose-700 border-rose-200" : isWatch ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}>
                  {s.status}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-slate-600">
                <span>Current Angle: <strong className="text-slate-900">{s.currentAngle}°</strong></span>
                <span className="text-slate-500">Optimal: {s.optimalRange}</span>
              </div>

              <p className="text-[11px] text-slate-500 leading-snug">{s.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
