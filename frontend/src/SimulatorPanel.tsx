import { useState } from "react";
import { Play, Target } from "lucide-react";
import { api } from "./api";
import { auth } from "./firebase";

export default function SimulatorPanel({ 
  currentReserve, 
  currentRecovery,
  onSimulate
}: { 
  currentReserve: number, 
  currentRecovery: number,
  onSimulate?: (data: { reserve: number, recovery: number } | null) => void
}) {
  const [activity, setActivity] = useState("Running");
  const [duration, setDuration] = useState(30);
  const [intensity, setIntensity] = useState("Moderate");
  
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSimulate = async () => {
    setLoading(true);
    let simResult;
    try {
      const uid = auth.currentUser?.uid || "test-user";
      const res = await api.simulateActivity(uid, {
        activity_type: activity,
        duration_mins: duration,
        intensity
      });
      simResult = res;
    } catch {
      // Fallback if no network
      const cost = duration * 0.8;
      simResult = {
        original: { reserve: currentReserve, recovery: currentRecovery },
        simulated: { 
          reserve: Math.max(0, currentReserve - cost),
          recovery: Math.max(0, currentRecovery - (cost * 0.5))
        },
        cost
      };
    }
    setResult(simResult);
    if (onSimulate) {
      onSimulate(simResult.simulated);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
        <Target className="w-5 h-5 text-blue-600" />
        <div>
          <div className="text-sm font-bold text-slate-900">What-If Fatigue Simulator</div>
          <div className="text-xs text-slate-500">Test physical demands against your twin</div>
        </div>
      </div>

      <div className="space-y-4 flex-1">
        {/* Controls */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1.5 block">Activity</label>
            <select 
              value={activity}
              onChange={e => setActivity(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 cursor-pointer"
            >
              <option>Running</option>
              <option>Weightlifting</option>
              <option>Yoga</option>
              <option>Cycling</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1.5 block">Intensity</label>
            <select 
              value={intensity}
              onChange={e => setIntensity(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 cursor-pointer"
            >
              <option>Light</option>
              <option>Moderate</option>
              <option>Hard</option>
            </select>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Duration</label>
            <span className="text-xs font-mono-numbers font-bold text-slate-900">{duration} mins</span>
          </div>
          <input 
            type="range" 
            min="5" max="120" step="5"
            value={duration}
            onChange={e => setDuration(parseInt(e.target.value))}
            className="w-full cursor-pointer"
          />
        </div>

        <button 
          onClick={handleSimulate}
          disabled={loading}
          className="btn btn-primary w-full py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 disabled:opacity-50"
        >
          {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          Run Biomechanical Simulation
        </button>

        {/* Results */}
        {result && (
          <div className="mt-4 pt-4 border-t border-slate-100 animate-fade-in space-y-3">
            <div className="text-xs font-bold text-slate-800 text-center mb-2">Projected Impact on Twin</div>
            
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex justify-between text-[10px] uppercase text-slate-500 font-bold mb-1">
                <span>Reserve Depletion</span>
                <span className="text-rose-600 font-mono font-bold">-{result.cost.toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono-numbers">
                <span className="text-slate-400 line-through">{result.original.reserve.toFixed(1)}%</span>
                <span className="text-slate-400">→</span>
                <span className="font-bold text-slate-900">{result.simulated.reserve.toFixed(1)}%</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex justify-between text-[10px] uppercase text-slate-500 font-bold mb-1">
                <span>Recovery Score Impact</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono-numbers">
                <span className="text-slate-400 line-through">{result.original.recovery.toFixed(1)}%</span>
                <span className="text-slate-400">→</span>
                <span className={`font-bold ${result.simulated.recovery < 50 ? 'text-rose-600' : 'text-amber-600'}`}>
                  {result.simulated.recovery.toFixed(1)}%
                </span>
              </div>
            </div>
            
            {result.simulated.reserve < 20 && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium leading-relaxed">
                ⚠️ <strong>Overreach Warning:</strong> This activity will critically deplete your reserve capacity below 20%. Elevated tendon strain risk.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
