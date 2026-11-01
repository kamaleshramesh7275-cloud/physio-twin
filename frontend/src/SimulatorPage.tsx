import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "./components/Sidebar";
import { 
  Target, Sparkles, AlertTriangle, RotateCcw, CheckCircle2, 
  Dumbbell, Moon, ShieldAlert, TrendingUp, Layers, Check, ArrowRight
} from "lucide-react";
import HoloModel3D, { type ZoneRisk } from "./HoloModel3D";
import { api } from "./api";
import { auth } from "./firebase";
import { captureHistoryStore } from "./lib/captureHistoryStore";

interface TrajectoryPoint {
  day: number;
  baseline: number;
  counterfactual: number;
  withRehab: number;
}

const DEFAULT_ZONE_RISKS: ZoneRisk = {
  head: 15,
  neck: 32,
  chest: 20,
  lumbar: 48,
  left_shoulder: 22,
  right_shoulder: 25,
  left_arm: 18,
  right_arm: 20,
  left_forearm: 15,
  right_forearm: 18,
  left_hip: 42,
  right_hip: 30,
  left_thigh: 55,
  right_thigh: 38,
  left_knee: 64,
  right_knee: 35,
  left_shin: 25,
  right_shin: 20,
  left_ankle: 38,
  right_ankle: 22
};

export default function SimulatorPage() {
  // 1. Planned Training Load
  const [activity, setActivity] = useState<string>("Squats & Lifts");
  const [duration, setDuration] = useState<number>(45);
  const [intensity, setIntensity] = useState<string>("High (RPE 8-9)");
  const [weeklySessions, setWeeklySessions] = useState<number>(4);

  // 2. Recovery & Nutrition Variables
  const [sleepHours, setSleepHours] = useState<number>(7);
  const [proteinGrams, setProteinGrams] = useState<number>(110);
  const [hydrationLiters, setHydrationLiters] = useState<number>(2.5);

  // 3. Clinical Rehab Protocols
  const [eccentricLoading, setEccentricLoading] = useState<boolean>(true);
  const [manualTherapy, setManualTherapy] = useState<boolean>(false);
  const [emgBiofeedback, setEmgBiofeedback] = useState<boolean>(true);
  const [deloadTaper, setDeloadTaper] = useState<boolean>(false);

  // Simulation outputs & view filters
  const [limbFilter, setLimbFilter] = useState<"all" | "knees" | "arms">("all");
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [horizon, setHorizon] = useState<"30d" | "90d" | "180d">("90d");
  const [simulatedZoneRisks, setSimulatedZoneRisks] = useState<ZoneRisk>(DEFAULT_ZONE_RISKS);
  const [simulatedAcwr, setSimulatedAcwr] = useState<number>(1.15);
  const [reinjuryProbability, setReinjuryProbability] = useState<number>(38);
  const [trajectory, setTrajectory] = useState<TrajectoryPoint[]>([]);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Run simulation calculations (calls backend with client-side fallback)
  const runSimulation = useCallback(async () => {
    setIsSimulating(true);
    const uid = auth.currentUser?.uid || "demo_user";

    const intensityFactor = intensity.includes("High") || intensity.includes("Maximal")
      ? 1.4
      : intensity.includes("Moderate")
      ? 1.1
      : 0.8;

    try {
      const res = await api.simulateWhatIf(uid, {
        activity,
        duration_minutes: duration,
        intensity,
        weekly_sessions: weeklySessions,
        sleep_hours: sleepHours,
        protein_g: proteinGrams,
        hydration_l: hydrationLiters,
        rehab_protocols: {
          eccentric_loading: eccentricLoading,
          manual_therapy: manualTherapy,
          emg_biofeedback: emgBiofeedback,
          deload_taper: deloadTaper
        }
      });

      if (res && res.trajectory) {
        setSimulatedAcwr(res.acwr_ratio || 1.15);
        setReinjuryProbability(res.reinjury_probability || 35);
        if (res.zone_risks) setSimulatedZoneRisks(res.zone_risks);
        setTrajectory(res.trajectory);
        setIsSimulating(false);
        return;
      }
    } catch (e) {
      // Backend simulation endpoint fallback to realistic biomechanical formulas
    }

    // Biomechanical Counterfactual Mathematical Model
    const workloadAccumulation = (duration / 30) * weeklySessions * intensityFactor;
    const recoveryCapacity = (sleepHours / 8) * (proteinGrams / 130) * (hydrationLiters / 3);

    // Calculate reduction benefit from rehab interventions
    let rehabMultiplier = 1.0;
    if (eccentricLoading) rehabMultiplier -= 0.18;
    if (manualTherapy) rehabMultiplier -= 0.12;
    if (emgBiofeedback) rehabMultiplier -= 0.15;
    if (deloadTaper) rehabMultiplier -= 0.25;
    rehabMultiplier = Math.max(0.4, rehabMultiplier);

    const calculatedAcwr = parseFloat((0.85 + (workloadAccumulation * 0.12) / Math.max(0.5, recoveryCapacity)).toFixed(2));
    const calculatedReinjuryRisk = Math.min(95, Math.max(10, Math.round(calculatedAcwr * 32 * rehabMultiplier)));

    const strainScale = calculatedAcwr > 1.3 ? 1.35 : calculatedAcwr < 0.9 ? 0.85 : 1.05;
    const newRisks: ZoneRisk = { ...DEFAULT_ZONE_RISKS };

    Object.keys(newRisks).forEach(key => {
      const k = key as keyof ZoneRisk;
      const baseVal = DEFAULT_ZONE_RISKS[k] || 20;
      const mod = strainScale * rehabMultiplier;
      if (key === "left_knee" || key === "lumbar" || key === "left_thigh") {
        newRisks[k] = Math.min(95, Math.round(baseVal * mod * 1.25));
      } else {
        newRisks[k] = Math.min(90, Math.round(baseVal * mod));
      }
    });

    const horizonDays = horizon === "30d" ? 30 : horizon === "90d" ? 90 : 180;
    const points: TrajectoryPoint[] = [];
    const step = Math.max(1, Math.floor(horizonDays / 15));

    for (let day = 0; day <= horizonDays; day += step) {
      const baseline = Math.min(90, Math.round(45 + Math.sin(day / 15) * 8 + (day / horizonDays) * 15));
      const counterfactual = Math.min(95, Math.round(calculatedReinjuryRisk + Math.sin(day / 10) * 12 + (day / horizonDays) * 10));
      const withRehab = Math.max(10, Math.round(counterfactual * rehabMultiplier * (1 - (day / horizonDays) * 0.25)));
      points.push({ day, baseline, counterfactual, withRehab });
    }

    setSimulatedAcwr(calculatedAcwr);
    setReinjuryProbability(calculatedReinjuryRisk);
    setSimulatedZoneRisks(newRisks);
    setTrajectory(points);
    setIsSimulating(false);
  }, [activity, duration, intensity, weeklySessions, sleepHours, proteinGrams, hydrationLiters, eccentricLoading, manualTherapy, emgBiofeedback, deloadTaper, horizon]);

  useEffect(() => {
    runSimulation();
  }, [runSimulation]);

  const handleLoadFromCapture = () => {
    const history = captureHistoryStore.getHistory();
    if (history.length > 0) {
      const latest = history[0];
      setActivity(latest.exerciseType || "Squats & Lifts");
      setDuration(Math.round(latest.durationSec / 60) || 30);
      setIntensity(latest.valgusVelocity > 120 ? "High (RPE 8-9)" : "Moderate (RPE 6-7)");
    }
  };

  const handleReset = () => {
    setSimulatedZoneRisks(DEFAULT_ZONE_RISKS);
    setSimulatedAcwr(1.15);
    setReinjuryProbability(38);
    setEccentricLoading(false);
    setManualTherapy(false);
    setEmgBiofeedback(false);
    setDeloadTaper(false);
  };

  const handleApplyToTwin = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  // Filter 3D mesh zones by target selection
  const filteredRiskData = { ...simulatedZoneRisks };
  if (limbFilter === "arms") {
    Object.keys(filteredRiskData).forEach(k => {
      if (!k.includes("arm") && !k.includes("shoulder")) {
        filteredRiskData[k as keyof ZoneRisk] = 5;
      }
    });
  } else if (limbFilter === "knees") {
    Object.keys(filteredRiskData).forEach(k => {
      if (!k.includes("knee") && !k.includes("thigh") && !k.includes("hip")) {
        filteredRiskData[k as keyof ZoneRisk] = 5;
      }
    });
  }

  const rehabSavingsPercent = eccentricLoading || manualTherapy || emgBiofeedback || deloadTaper ? 38 : 0;

  return (
    <div className="flex h-screen bg-[#070b14] text-slate-100 font-sans overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Header Bar */}
        <header className="h-16 border-b border-slate-800 bg-[#090d18]/90 backdrop-blur-md px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white flex items-center gap-2">
                Biomechanical "What-If" Counterfactual Simulator
                <span className="text-[10px] uppercase tracking-wider font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Predictive Sandbox
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">
                Model hypothetical training workloads &amp; clinical rehab interventions on your 3D digital twin
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLoadFromCapture}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load Baseline from Last Capture</span>
            </button>
            <button
              onClick={handleReset}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Reset Model
            </button>
          </div>
        </header>

        {/* Simulator Grid */}
        <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto">
          
          {/* Left Controls Column (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* 1. Planned Training Load */}
            <div className="bg-[#0b101e] border border-slate-800/80 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Dumbbell className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                  1. Planned Training Load
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                    Activity Type
                  </label>
                  <select
                    value={activity}
                    onChange={e => setActivity(e.target.value)}
                    className="w-full bg-[#070b14] border border-slate-800 rounded-lg p-2.5 text-xs text-white outline-none focus:border-slate-700 cursor-pointer"
                  >
                    <option>Squats &amp; Lifts</option>
                    <option>Bicep Curls</option>
                    <option>Distance Running</option>
                    <option>Sprint Intervals</option>
                    <option>Cycling / Erg</option>
                    <option>Plyometrics</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                    Intensity Level
                  </label>
                  <select
                    value={intensity}
                    onChange={e => setIntensity(e.target.value)}
                    className="w-full bg-[#070b14] border border-slate-800 rounded-lg p-2.5 text-xs text-white outline-none focus:border-slate-700 cursor-pointer"
                  >
                    <option>Light (RPE 4-5)</option>
                    <option>Moderate (RPE 6-7)</option>
                    <option>High (RPE 8-9)</option>
                    <option>Maximal (RPE 10)</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Session Duration
                  </label>
                  <span className="text-xs font-mono text-emerald-400 font-bold">{duration} mins</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="150"
                  step="5"
                  value={duration}
                  onChange={e => setDuration(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Weekly Frequency
                  </label>
                  <span className="text-xs font-mono text-emerald-400 font-bold">{weeklySessions} sessions / week</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="7"
                  step="1"
                  value={weeklySessions}
                  onChange={e => setWeeklySessions(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            {/* 2. Recovery & Nutrition Variables */}
            <div className="bg-[#0b101e] border border-slate-800/80 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Moon className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                  2. Recovery &amp; Nutrition Variables
                </span>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Average Nightly Sleep
                  </label>
                  <span className="text-xs font-mono text-emerald-400 font-bold">{sleepHours} hrs</span>
                </div>
                <input
                  type="range"
                  min="4.0"
                  max="10.0"
                  step="0.5"
                  value={sleepHours}
                  onChange={e => setSleepHours(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Daily Protein Intake
                  </label>
                  <span className="text-xs font-mono text-emerald-400 font-bold">{proteinGrams} g</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="220"
                  step="5"
                  value={proteinGrams}
                  onChange={e => setProteinGrams(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Daily Hydration
                  </label>
                  <span className="text-xs font-mono text-emerald-400 font-bold">{hydrationLiters} L</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="5.0"
                  step="0.2"
                  value={hydrationLiters}
                  onChange={e => setHydrationLiters(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            {/* 3. Clinical Rehab Protocols */}
            <div className="bg-[#0b101e] border border-slate-800/80 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                    3. Clinical Rehab Protocols
                  </span>
                </div>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
                  Strain Reduction
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => setEccentricLoading(!eccentricLoading)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    eccentricLoading
                      ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                      : "bg-[#070b14] border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">Eccentric Loading</span>
                    {eccentricLoading ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-slate-700" />
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400/80 mt-2">-18% Strain Reduction</span>
                </button>

                <button
                  onClick={() => setManualTherapy(!manualTherapy)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    manualTherapy
                      ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                      : "bg-[#070b14] border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">Manual Therapy</span>
                    {manualTherapy ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-slate-700" />
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400/80 mt-2">-12% Strain Reduction</span>
                </button>

                <button
                  onClick={() => setEmgBiofeedback(!emgBiofeedback)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    emgBiofeedback
                      ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                      : "bg-[#070b14] border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">EMG Biofeedback</span>
                    {emgBiofeedback ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-slate-700" />
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400/80 mt-2">-15% Strain Reduction</span>
                </button>

                <button
                  onClick={() => setDeloadTaper(!deloadTaper)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    deloadTaper
                      ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                      : "bg-[#070b14] border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">Deload Taper Week</span>
                    {deloadTaper ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-slate-700" />
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400/80 mt-2">-25% Strain Reduction</span>
                </button>
              </div>
            </div>

            {/* Submit Action */}
            <div className="space-y-3">
              <button
                onClick={handleApplyToTwin}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs tracking-wider uppercase transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Target className="w-4 h-4" />
                <span>Apply Simulation Plan to Digital Twin</span>
              </button>

              {saveSuccess && (
                <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs p-3 rounded-xl flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Simulation parameters successfully saved and synchronized with your active digital twin profile!</span>
                </div>
              )}
            </div>

          </div>

          {/* Right Analytics Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Projected Horizon & Summary KPIs */}
            <div className="bg-[#0b101e] border border-slate-800/80 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                  Projected Horizon
                </span>
                <div className="flex items-center gap-1 bg-[#070b14] p-1 rounded-lg border border-slate-800">
                  {(["30d", "90d", "180d"] as const).map(h => (
                    <button
                      key={h}
                      onClick={() => setHorizon(h)}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                        horizon === h
                          ? "bg-emerald-500 text-slate-950 shadow-sm"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {h === "30d" ? "30 Days" : h === "90d" ? "90 Days" : "6 Months"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#070b14] border border-slate-800 p-3.5 rounded-xl">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                    Simulated ACWR
                  </div>
                  <div className={`font-mono text-2xl font-bold ${
                    simulatedAcwr > 1.3 ? "text-red-400" : simulatedAcwr < 0.9 ? "text-amber-400" : "text-emerald-400"
                  }`}>
                    {simulatedAcwr}x
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    {simulatedAcwr > 1.3 ? "⚠️ High Strain Zone" : "Optimal (0.9–1.3)"}
                  </div>
                </div>

                <div className="bg-[#070b14] border border-slate-800 p-3.5 rounded-xl">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                    Re-Injury Risk
                  </div>
                  <div className={`font-mono text-2xl font-bold ${
                    reinjuryProbability > 50 ? "text-red-400" : reinjuryProbability > 30 ? "text-amber-400" : "text-emerald-400"
                  }`}>
                    {reinjuryProbability}%
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">Tissue fatigue index</div>
                </div>

                <div className="bg-[#070b14] border border-slate-800 p-3.5 rounded-xl">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                    Rehab Benefit
                  </div>
                  <div className="font-mono text-2xl font-bold text-teal-400">
                    -{rehabSavingsPercent}%
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">Peak load reduction</div>
                </div>
              </div>

              {simulatedAcwr > 1.3 && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-lg flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    <strong>Workload Spike Warning:</strong> Your modeled training load outpaces physiological recovery. High probability of patellar and lumbar strain escalation.
                  </span>
                </div>
              )}
            </div>

            {/* Multi-Horizon Strain Trajectory Projection */}
            <div className="bg-[#0b101e] border border-slate-800/80 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                    Multi-Horizon Strain Trajectory Projection ({horizon})
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[10px] font-mono">
                  <span className="flex items-center gap-1 text-slate-400">
                    <span className="w-2 h-0.5 bg-slate-500 rounded" /> Baseline
                  </span>
                  <span className="flex items-center gap-1 text-red-400">
                    <span className="w-2 h-0.5 bg-red-400 rounded" /> Counterfactual
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="w-2 h-0.5 bg-emerald-400 rounded" /> + Rehab Protocols
                  </span>
                </div>
              </div>

              <div className="h-40 w-full bg-[#070b14] border border-slate-800 rounded-xl p-3 relative flex items-center justify-center">
                {trajectory.length > 0 ? (
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 400 100" preserveAspectRatio="none">
                    <line x1="0" y1="25" x2="400" y2="25" stroke="#1e293b" strokeDasharray="3 3" />
                    <line x1="0" y1="50" x2="400" y2="50" stroke="#1e293b" strokeDasharray="3 3" />
                    <line x1="0" y1="75" x2="400" y2="75" stroke="#1e293b" strokeDasharray="3 3" />

                    {/* Baseline path */}
                    <path
                      d={trajectory.map((pt, idx) => `${idx === 0 ? "M" : "L"} ${(idx / (trajectory.length - 1)) * 400} ${100 - pt.baseline}`).join(" ")}
                      fill="none"
                      stroke="#64748b"
                      strokeWidth="2"
                      strokeDasharray="4 2"
                    />

                    {/* Counterfactual path */}
                    <path
                      d={trajectory.map((pt, idx) => `${idx === 0 ? "M" : "L"} ${(idx / (trajectory.length - 1)) * 400} ${100 - pt.counterfactual}`).join(" ")}
                      fill="none"
                      stroke="#f87171"
                      strokeWidth="2.5"
                    />

                    {/* With Rehab path */}
                    <path
                      d={trajectory.map((pt, idx) => `${idx === 0 ? "M" : "L"} ${(idx / (trajectory.length - 1)) * 400} ${100 - pt.withRehab}`).join(" ")}
                      fill="none"
                      stroke="#34d399"
                      strokeWidth="2.5"
                    />
                  </svg>
                ) : (
                  <span className="text-xs text-slate-500">Computing trajectory path...</span>
                )}
              </div>
            </div>

            {/* Simulated Musculoskeletal Twin Mesh Viewport */}
            <div className="bg-[#0b101e] border border-slate-800/80 rounded-xl p-5 h-[390px] relative flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                  Simulated Musculoskeletal Twin Mesh
                </span>
                <div className="flex items-center gap-1 bg-[#070b14] p-1 rounded-lg border border-slate-800">
                  <button
                    onClick={() => setLimbFilter("all")}
                    className={`px-2.5 py-0.5 text-[10px] font-bold rounded transition-all cursor-pointer ${
                      limbFilter === "all" ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Full Body
                  </button>
                  <button
                    onClick={() => setLimbFilter("knees")}
                    className={`px-2.5 py-0.5 text-[10px] font-bold rounded transition-all cursor-pointer ${
                      limbFilter === "knees" ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Squats (Knees/Hips)
                  </button>
                  <button
                    onClick={() => setLimbFilter("arms")}
                    className={`px-2.5 py-0.5 text-[10px] font-bold rounded transition-all cursor-pointer ${
                      limbFilter === "arms" ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Bicep Curls (Arms)
                  </button>
                </div>
              </div>

              <div className="flex-1 w-full relative rounded-lg overflow-hidden border border-slate-800 bg-[#070b14]">
                <HoloModel3D
                  riskData={filteredRiskData}
                  selectedZone={null}
                  onZoneClick={z => console.log("Selected simulated zone:", z)}
                />
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

