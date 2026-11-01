import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { 
  Building, User, Calendar, Activity, Zap, ShieldAlert, CheckCircle2, 
  Printer, ArrowLeft, Send, Sparkles, AlertTriangle, AlertOctagon, HeartHandshake, Eye
} from "lucide-react";
import { 
  getShareableSession, 
  appendClinicianNote, 
  getAllSessions, 
  type ShareableSessionPayload 
} from "./lib/shareableSessionStore";
import { LiveTwinMirrorCanvas } from "./components/LiveTwinMirrorCanvas";

export default function PublicReviewPage() {
  const [, setLocation] = useLocation();
  const [session, setSession] = useState<ShareableSessionPayload | null>(null);
  const [newNote, setNewNote] = useState("");
  const [selectedClearance, setSelectedClearance] = useState<"cleared" | "restricted" | "pending">("pending");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Extract ?id=... from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id") || "PT-84920";
    const found = getShareableSession(id);
    if (found) {
      setSession(found);
      setSelectedClearance(found.clearanceStatus || "pending");
    }
  }, []);

  if (!session) {
    const all = getAllSessions();
    return (
      <div className="min-h-screen bg-slate-950 text-foreground flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mb-4 text-primary">
          <Activity className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black mb-2">Patient Session Not Found</h1>
        <p className="text-sm text-muted-foreground max-w-sm mb-6">
          The requested clinical session link could not be decoded. Select a demo patient review below:
        </p>
        <div className="flex flex-col gap-2 w-full max-w-xs">
          {Object.values(all).map(s => (
            <button
              key={s.id}
              onClick={() => {
                setSession(s);
                setSelectedClearance(s.clearanceStatus || "pending");
              }}
              className="p-3 rounded-xl border border-border bg-card hover:border-primary/40 text-left text-xs transition-all flex items-center justify-between"
            >
              <span className="font-bold">{s.patientName}</span>
              <span className="text-muted-foreground font-mono">{s.id}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    appendClinicianNote(session.id, newNote.trim(), selectedClearance);
    setSession(prev => prev ? {
      ...prev,
      clinicianNotes: [...(prev.clinicianNotes || []), newNote.trim()],
      clearanceStatus: selectedClearance
    } : null);
    setNewNote("");
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const autopsy = session.autopsyReport;

  return (
    <div className="min-h-screen bg-slate-950 text-foreground flex flex-col">
      
      {/* Clinician Public Viewer Header */}
      <header className="sticky top-0 z-30 px-6 py-4 border-b border-border bg-slate-950/90 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/20 text-primary border border-primary/30 flex items-center justify-center font-black">
            PT
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-wider uppercase text-primary">
                PhysioTwin Clinical Telemetry Viewer
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Zero-Login Doctor Link
              </span>
            </div>
            <h1 className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
              {session.patientName} <span className="text-xs font-normal text-muted-foreground">({session.patientAge}y, {session.sportOrActivity})</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Clearance Badge */}
          <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border flex items-center gap-1.5 ${
            session.clearanceStatus === "cleared" 
              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" 
              : session.clearanceStatus === "restricted"
              ? "bg-red-500/20 text-red-400 border-red-500/40"
              : "bg-amber-500/20 text-amber-400 border-amber-500/40"
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              session.clearanceStatus === "cleared" ? "bg-emerald-400" : session.clearanceStatus === "restricted" ? "bg-red-400" : "bg-amber-400"
            }`} />
            Status: {session.clearanceStatus?.toUpperCase()}
          </span>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-border bg-card hover:bg-muted/50 text-foreground flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Report
          </button>
        </div>
      </header>

      {/* Main Review Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* 1. Metric Callout Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="text-[11px] font-mono text-muted-foreground uppercase">Form Quality Score</div>
            <div className={`text-2xl font-black font-mono-numbers mt-1 ${session.overallFormScore >= 85 ? "text-emerald-400" : "text-amber-400"}`}>
              {session.overallFormScore}%
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{session.repsCompleted} reps completed ({session.durationSeconds}s)</div>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="text-[11px] font-mono text-muted-foreground uppercase">Peak KAM Torque</div>
            <div className={`text-2xl font-black font-mono-numbers mt-1 ${session.peakKamNmKg > 0.45 ? "text-red-400" : "text-emerald-400"}`}>
              {session.peakKamNmKg} <span className="text-xs">N·m/kg</span>
            </div>
            <div className={`text-[10px] mt-0.5 ${session.peakKamNmKg > 0.45 ? "text-red-400" : "text-emerald-400"}`}>
              {session.peakKamNmKg > 0.45 ? "High ACL Shear" : "Optimal Alignment"}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="text-[11px] font-mono text-muted-foreground uppercase">Glute/Spine Ratio</div>
            <div className={`text-2xl font-black font-mono-numbers mt-1 ${session.semgSnapshot.ratios.gluteToLumbarRatio >= 0.8 ? "text-emerald-400" : "text-amber-400"}`}>
              {session.semgSnapshot.ratios.gluteToLumbarRatio}x
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Target: &gt; 0.80x</div>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="text-[11px] font-mono text-muted-foreground uppercase">VMO/VL Quad Ratio</div>
            <div className={`text-2xl font-black font-mono-numbers mt-1 ${session.semgSnapshot.ratios.vmoToVlRatio >= 0.85 ? "text-emerald-400" : "text-amber-400"}`}>
              {session.semgSnapshot.ratios.vmoToVlRatio}x
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Target: &gt; 0.85x</div>
          </div>
        </div>

        {/* 2. Visualizers: 3D Twin & Virtual sEMG */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Interactive 3D Digital Twin Canvas */}
          <div className="card space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-primary" />
                Kinematic 3D Digital Twin Replay
              </span>
              <span className="text-xs font-mono text-cyan-400 font-semibold">
                🖱️ Rotate & Inspect 360°
              </span>
            </div>

            <div className="h-[360px] rounded-xl overflow-hidden border border-border">
              <LiveTwinMirrorCanvas
                kneeAngle={session.maxKneeFlexionDeg}
                normalizedKamNmKg={session.peakKamNmKg}
                showGhost={true}
                className="w-full h-full"
              />
            </div>
          </div>

          {/* Virtual sEMG Neural Muscle Firing Map */}
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-purple-400" />
                Virtual sEMG Muscle Activation Breakdown
              </span>
              <span className="text-[11px] font-mono text-muted-foreground">
                Zajac-Thelen Physics
              </span>
            </div>

            <div className="space-y-3">
              {/* Gluteus Maximus */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground font-medium">Gluteus Maximus</span>
                  <span className={`font-mono font-bold ${session.semgSnapshot.activations.gluteusMaximus >= 60 ? "text-emerald-400" : "text-amber-400"}`}>
                    {session.semgSnapshot.activations.gluteusMaximus}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${session.semgSnapshot.activations.gluteusMaximus >= 60 ? "bg-emerald-400" : "bg-amber-400"}`}
                    style={{ width: `${session.semgSnapshot.activations.gluteusMaximus}%` }}
                  />
                </div>
              </div>

              {/* VMO (Medial Quad) */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground font-medium">Vastus Medialis Oblique (VMO)</span>
                  <span className={`font-mono font-bold ${session.semgSnapshot.ratios.vmoToVlRatio >= 0.85 ? "text-emerald-400" : "text-amber-400"}`}>
                    {session.semgSnapshot.activations.vastusMedialis}% ({session.semgSnapshot.ratios.vmoToVlRatio}x VL)
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${session.semgSnapshot.ratios.vmoToVlRatio >= 0.85 ? "bg-cyan-400" : "bg-amber-400"}`}
                    style={{ width: `${session.semgSnapshot.activations.vastusMedialis}%` }}
                  />
                </div>
              </div>

              {/* Lumbar Erector Spinae */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground font-medium">Lumbar Erector Spinae</span>
                  <span className={`font-mono font-bold ${session.semgSnapshot.activations.erectorSpinae > 75 ? "text-red-400" : "text-emerald-400"}`}>
                    {session.semgSnapshot.activations.erectorSpinae}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${session.semgSnapshot.activations.erectorSpinae > 75 ? "bg-red-400" : "bg-emerald-400"}`}
                    style={{ width: `${session.semgSnapshot.activations.erectorSpinae}%` }}
                  />
                </div>
              </div>

              {/* Hamstrings */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground font-medium">Biceps Femoris (Hamstrings)</span>
                  <span className="font-mono font-bold text-cyan-400">
                    {session.semgSnapshot.activations.bicepsFemoris}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-cyan-400"
                    style={{ width: `${session.semgSnapshot.activations.bicepsFemoris}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Diagnostic Alert Box */}
            {session.semgSnapshot.diagnosticAlerts.length > 0 && (
              <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/30 space-y-1 mt-4">
                {session.semgSnapshot.diagnosticAlerts.map(alert => (
                  <div key={alert.id} className="text-xs text-red-300 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span><strong>{alert.title}:</strong> {alert.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 3. Forensic Biomechanical Autopsy (If incident logged) */}
        {autopsy && (
          <div className="card border-red-500/30 bg-red-950/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-400" />
                <h3 className="font-bold text-base text-foreground">
                  Logged Incident Autopsy: <span className="text-red-400">{autopsy.affectedStructure}</span>
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                120 Hz Sub-Frame Resolution
              </span>
            </div>

            {/* 3-Step Causal Cascade */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {autopsy.causalChain.map((step, i) => (
                <div key={step.phase} className="p-4 rounded-xl bg-slate-900/80 border border-border space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground uppercase">
                    <span>Stage {i + 1}: {step.phase}</span>
                    <span className="text-xs font-bold text-red-400">{step.relativeTimeMs} ms</span>
                  </div>
                  <div className="text-xs font-medium text-foreground">{step.description}</div>
                  <div className="text-[11px] font-mono text-cyan-300 pt-1">{step.jointTelemetry}</div>
                </div>
              ))}
            </div>

            {/* Acute Prescription Box */}
            <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/30 space-y-2">
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4 text-emerald-400" />
                Prescribed Clinical De-escalation Protocol
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                {autopsy.acutePrescription[0]?.protocol.map((pt, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* 4. Clinician Feedback & Clearance Sign-Off */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-foreground flex items-center gap-2">
              <Building className="w-4 h-4 text-primary" /> Physical Therapist &amp; Doctor Sign-Off
            </h3>
            <span className="text-xs text-muted-foreground">Direct Patient Feedback</span>
          </div>

          {/* Existing Notes */}
          {session.clinicianNotes && session.clinicianNotes.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Clinician Notes Log</div>
              <div className="space-y-1.5">
                {session.clinicianNotes.map((note, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-muted/40 text-xs text-foreground border border-border flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{note}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Feedback Form */}
          <form onSubmit={handleSaveNote} className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">
                Update Return-to-Play Clearance
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedClearance("cleared")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    selectedClearance === "cleared" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/60 shadow" : "bg-card border-border text-muted-foreground"
                  }`}
                >
                  🟢 Cleared for Full Activity
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedClearance("restricted")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    selectedClearance === "restricted" ? "bg-red-500/20 text-red-300 border-red-500/60 shadow" : "bg-card border-border text-muted-foreground"
                  }`}
                >
                  🔴 Restricted (Deload)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedClearance("pending")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    selectedClearance === "pending" ? "bg-amber-500/20 text-amber-300 border-amber-500/60 shadow" : "bg-card border-border text-muted-foreground"
                  }`}
                >
                  🟡 Further Evaluation Needed
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">
                Add Clinical Recommendation / Directive
              </label>
              <textarea
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                placeholder="Enter physical therapy recommendations, cueing instructions, or restrictions..."
                rows={3}
                className="w-full p-3 rounded-xl border border-border bg-slate-900 text-foreground text-xs focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div className="flex items-center justify-between">
              {saveSuccess ? (
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  ✓ Clinical notes saved and synced to patient's twin!
                </span>
              ) : <div />}

              <button
                type="submit"
                disabled={!newNote.trim()}
                className="btn-primary px-5 py-2 text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                Submit Sign-Off
              </button>
            </div>
          </form>
        </div>

      </main>

      {/* Footer */}
      <footer className="py-6 px-6 border-t border-border text-center text-xs text-muted-foreground">
        PhysioTwin Biomechanical Telemetry Engine • Zero-Login Clinical Access Gateway
      </footer>

    </div>
  );
}

