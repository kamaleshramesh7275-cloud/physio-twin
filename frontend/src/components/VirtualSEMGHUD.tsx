import React from "react";
import { Zap, AlertTriangle, ShieldCheck, Activity, Stethoscope } from "lucide-react";
import type { VirtualSEMGResult } from "../lib/virtualSEMGEngine";

interface VirtualSEMGHUDProps {
  semg: VirtualSEMGResult | null;
  onTriggerAutopsy: () => void;
  className?: string;
}

export const VirtualSEMGHUD: React.FC<VirtualSEMGHUDProps> = ({
  semg,
  onTriggerAutopsy,
  className = ""
}) => {
  if (!semg) return null;

  const { activations, ratios, diagnosticAlerts } = semg;

  return (
    <div className={`space-y-3.5 p-4 rounded-xl border border-border bg-slate-950/60 backdrop-blur-md ${className}`}>
      
      {/* Title & Diagnose Twinge Action */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-bold font-mono uppercase tracking-wider text-purple-300">
            Virtual sEMG Activation
          </span>
        </div>

        <button
          onClick={onTriggerAutopsy}
          className="px-2.5 py-1 rounded-lg text-[11px] font-bold font-mono bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/40 flex items-center gap-1.5 transition-all animate-pulse"
        >
          <Stethoscope className="w-3.5 h-3.5" />
          Diagnose Twinge
        </button>
      </div>

      {/* Live Muscle Activation Mini-Bars */}
      <div className="space-y-2.5">
        {/* Gluteus Maximus vs Erector Spinae */}
        <div>
          <div className="flex justify-between text-[11px] mb-1">
            <span className="text-muted-foreground flex items-center gap-1">
              Gluteus Maximus
            </span>
            <span className={`font-mono font-bold ${activations.gluteusMaximus > 60 ? "text-emerald-400" : "text-amber-400"}`}>
              {activations.gluteusMaximus}%
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-200 ${
                activations.gluteusMaximus > 60 ? "bg-emerald-400" : "bg-amber-400"
              }`}
              style={{ width: `${activations.gluteusMaximus}%` }}
            />
          </div>
        </div>

        {/* Vastus Medialis (VMO) vs Lateralis (VL) */}
        <div>
          <div className="flex justify-between text-[11px] mb-1">
            <span className="text-muted-foreground flex items-center gap-1">
              VMO (Medial Quad)
            </span>
            <span className={`font-mono font-bold ${ratios.vmoToVlRatio >= 0.85 ? "text-emerald-400" : "text-amber-400"}`}>
              {activations.vastusMedialis}% <span className="text-[10px] text-muted-foreground">({ratios.vmoToVlRatio}x VL)</span>
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-200 ${
                ratios.vmoToVlRatio >= 0.85 ? "bg-cyan-400" : "bg-amber-400"
              }`}
              style={{ width: `${activations.vastusMedialis}%` }}
            />
          </div>
        </div>

        {/* Erector Spinae (Lumbar Spine) */}
        <div>
          <div className="flex justify-between text-[11px] mb-1">
            <span className="text-muted-foreground">Lumbar Erector Spinae</span>
            <span className={`font-mono font-bold ${activations.erectorSpinae > 75 ? "text-red-400" : "text-emerald-400"}`}>
              {activations.erectorSpinae}%
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-200 ${
                activations.erectorSpinae > 75 ? "bg-red-400" : "bg-emerald-400"
              }`}
              style={{ width: `${activations.erectorSpinae}%` }}
            />
          </div>
        </div>
      </div>

      {/* Real-time Diagnostic Alerts */}
      {diagnosticAlerts.length > 0 && (
        <div className="p-2.5 rounded-lg bg-red-950/30 border border-red-500/30 space-y-1">
          {diagnosticAlerts.map(alert => (
            <div key={alert.id} className="text-[11px] text-red-300 flex items-start gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
              <span>
                <strong>{alert.title}:</strong> {alert.message}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

