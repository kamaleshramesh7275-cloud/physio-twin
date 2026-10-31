import React, { useState } from "react";
import { 
  AlertTriangle, ShieldAlert, Activity, CheckCircle2, 
  Clock, ArrowRight, Printer, X, Sparkles, AlertOctagon, HeartHandshake, Gauge
} from "lucide-react";
import type { ForensicAutopsyReport, TelemetryFlightFrame } from "../lib/flightRecorder";

interface BiomechanicalAutopsyModalProps {
  report: ForensicAutopsyReport | null;
  buffer: TelemetryFlightFrame[];
  onClose: () => void;
}

export const BiomechanicalAutopsyModal: React.FC<BiomechanicalAutopsyModalProps> = ({
  report,
  buffer,
  onClose
}) => {
  const [selectedPhaseIdx, setSelectedPhaseIdx] = useState<number>(2);

  if (!report) return null;

  const activePhase = report.causalChain[selectedPhaseIdx] || report.causalChain[2];

  // ACL Strain Severity Color
  const aclColor = report.peakAclStrainPercent >= 10.5 
    ? "text-red-500" 
    : report.peakAclStrainPercent >= 6.0 
    ? "text-amber-400" 
    : "text-emerald-400";

  // Lumbar Shear Severity Color (NIOSH limit is 500 N)
  const lumbarColor = report.peakLumbarShearNewtons > 500 ? "text-red-400" : "text-emerald-400";

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-card border border-red-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Header Bar */}
        <div className="px-6 py-4 border-b border-border bg-red-950/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold tracking-widest uppercase text-red-400">
                  Forensic Biomechanical Autopsy
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-300 border border-red-500/30 uppercase">
                  {report.severity.replace("-", " ")}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  120 Hz Sub-Frame Resolution
                </span>
              </div>
              <h2 className="text-xl font-black text-foreground tracking-tight">
                Incident Root-Cause Diagnostic: <span className="text-red-400">{report.affectedStructure}</span>
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* 1. Quantitative Multi-Axial Stress Tensor Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            
            {/* ACL Strain Tensor */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-border">
              <div className="flex justify-between items-center text-[11px] font-mono text-muted-foreground uppercase">
                <span>ACL Tri-Axial Strain</span>
                <span className="text-[10px] text-muted-foreground">Yield: 10.5%</span>
              </div>
              <div className={`text-2xl font-black font-mono-numbers mt-1 ${aclColor}`}>
                {report.peakAclStrainPercent}%
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    report.peakAclStrainPercent >= 10.5 ? "bg-red-500" : report.peakAclStrainPercent >= 6.0 ? "bg-amber-400" : "bg-emerald-400"
                  }`}
                  style={{ width: `${Math.min(100, (report.peakAclStrainPercent / 12) * 100)}%` }}
                />
              </div>
            </div>

            {/* Lumbar Disc Shear (NIOSH 500 N limit) */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-border">
              <div className="flex justify-between items-center text-[11px] font-mono text-muted-foreground uppercase">
                <span>L4-L5 Disc Shear</span>
                <span className="text-[10px] text-muted-foreground">NIOSH: 500N</span>
              </div>
              <div className={`text-2xl font-black font-mono-numbers mt-1 ${lumbarColor}`}>
                {report.peakLumbarShearNewtons} N
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    report.peakLumbarShearNewtons > 500 ? "bg-red-500" : "bg-emerald-400"
                  }`}
                  style={{ width: `${Math.min(100, (report.peakLumbarShearNewtons / 800) * 100)}%` }}
                />
              </div>
            </div>

            {/* Lumbar Compression (NIOSH 3400 N limit) */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-border">
              <div className="flex justify-between items-center text-[11px] font-mono text-muted-foreground uppercase">
                <span>Disc Compression</span>
                <span className="text-[10px] text-muted-foreground">Limit: 3400N</span>
              </div>
              <div className="text-2xl font-black font-mono-numbers text-cyan-400 mt-1">
                {report.peakLumbarCompNewtons} N
              </div>
              <div className="text-[10px] text-muted-foreground mt-2">
                Axial spinal load
              </div>
            </div>

            {/* Patellofemoral Contact Stress */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-border">
              <div className="flex justify-between items-center text-[11px] font-mono text-muted-foreground uppercase">
                <span>Patellar Stress</span>
                <span className="text-[10px] text-muted-foreground">Max: 7.0 MPa</span>
              </div>
              <div className="text-2xl font-black font-mono-numbers text-purple-400 mt-1">
                {report.peakPatellofemoralStressMpa} MPa
              </div>
              <div className="text-[10px] text-purple-300/80 mt-2">
                Cartilage contact pressure
              </div>
            </div>
          </div>

          {/* 2. Interactive Millisecond Forensic Timeline Scrubber */}
          <div className="p-5 rounded-xl bg-slate-900/80 border border-border space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-primary" />
                Bayesian Empirical Change-Point Cascade
              </span>
              <span className="text-xs font-mono text-cyan-400 font-semibold">
                120 Hz Sub-Frame Stepper
              </span>
            </div>

            {/* Stepper Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {report.causalChain.map((step, idx) => {
                const isActive = selectedPhaseIdx === idx;
                return (
                  <button
                    key={step.phase}
                    onClick={() => setSelectedPhaseIdx(idx)}
                    className={`p-4 rounded-xl text-left border transition-all ${
                      isActive 
                        ? idx === 2 
                          ? "bg-red-500/20 border-red-500/60 shadow-lg shadow-red-500/10" 
                          : "bg-amber-500/20 border-amber-500/60 shadow-lg shadow-amber-500/10"
                        : "bg-card/50 border-border hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[10px] font-mono font-bold uppercase ${isActive ? "text-foreground font-black" : "text-muted-foreground"}`}>
                        Stage {idx + 1}: {step.phase}
                      </span>
                      <span className="text-xs font-mono font-bold text-muted-foreground">
                        {step.relativeTimeMs > 0 ? `+${step.relativeTimeMs}` : step.relativeTimeMs} ms
                      </span>
                    </div>
                    <div className="text-xs font-medium text-foreground line-clamp-2">
                      {step.description}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Telemetry Detail for Active Phase */}
            {activePhase && (
              <div className="p-4 rounded-lg bg-black/40 border border-border/80 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div>
                  <div className="text-[10px] font-mono text-muted-foreground uppercase">Kinematic Telemetry & Disc Stress</div>
                  <div className="text-xs font-bold font-mono text-cyan-300 mt-0.5">{activePhase.jointTelemetry}</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-muted-foreground uppercase">Virtual sEMG Fiber Recruitment</div>
                  <div className="text-xs font-bold font-mono text-purple-300 mt-0.5">{activePhase.muscleActivationTelemetry}</div>
                </div>
              </div>
            )}
          </div>

          {/* 3. Two-Column Diagnostic & Acute Rehab Prescription */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Clinician Diagnosis */}
            <div className="p-5 rounded-xl bg-card border border-border space-y-3">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <AlertOctagon className="w-4 h-4 text-red-400" />
                Orthopedic Clinical Findings
              </div>
              <div className="text-base font-bold text-foreground">
                {report.clinicalDiagnosis}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Biomechanical Root Cause: </strong>
                {report.mechanisticRootCause}
              </p>
            </div>

            {/* Immediate 48-Hour Rehab Plan */}
            <div className="p-5 rounded-xl bg-card border border-emerald-500/30 space-y-3">
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4 text-emerald-400" />
                Physician Recovery Prescription
              </div>

              {report.acutePrescription.map(rx => (
                <div key={rx.phase} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-foreground">
                    <span>{rx.phase}</span>
                    <span className="text-emerald-400 font-mono text-[11px]">{rx.timeline}</span>
                  </div>
                  <ul className="space-y-1">
                    {rx.protocol.map((item, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="text-[11px] text-red-400 font-semibold pt-1">
                    ⚠️ Avoid: {rx.contraindications.join("; ")}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-border bg-slate-900/40 flex items-center justify-between">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            120 Hz Hermite spline upsampled telemetry verified with non-linear Zajac-Thelen dynamics.
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-border bg-card hover:bg-muted/50 text-foreground flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              Export Clinician PDF
            </button>
            <button
              onClick={onClose}
              className="btn-primary px-5 py-2 text-xs font-bold"
            >
              Resume Session
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
