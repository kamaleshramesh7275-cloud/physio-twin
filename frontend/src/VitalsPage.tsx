import React from "react";
import { Sidebar } from "./components/Sidebar";
import { HeartPulse, TrendingUp, TrendingDown, Activity, Battery, Moon, RefreshCcw } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';

const HRV_DATA = [
  { date: 'Mon', hrv: 45 },
  { date: 'Tue', hrv: 42 },
  { date: 'Wed', hrv: 55 },
  { date: 'Thu', hrv: 60 },
  { date: 'Fri', hrv: 58 },
  { date: 'Sat', hrv: 65 },
  { date: 'Sun', hrv: 62 },
];

export default function VitalsPage() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen text-foreground md:overflow-hidden pb-[72px] md:pb-0 bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2 text-slate-900">
              <HeartPulse className="w-6 h-6 text-blue-600" /> Vitals &amp; Recovery
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Systemic fatigue and baseline health metrics synced from your connected wearables.</p>
          </div>
          <button className="btn btn-secondary flex items-center gap-2 px-4 py-2 text-xs font-bold">
            <RefreshCcw className="w-4 h-4" /> Force Sync
          </button>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <HeartPulse className="w-5 h-5 text-rose-600" />
              <span className="badge badge-red text-[10px]">Resting HR</span>
            </div>
            <div className="text-3xl font-black font-mono-numbers text-rose-600">52 <span className="text-sm font-medium text-slate-500">bpm</span></div>
            <div className="text-xs text-slate-500 mt-2 flex items-center gap-1"><TrendingDown className="w-3.5 h-3.5 text-emerald-600" /> -2 bpm this week</div>
          </div>
          
          <div className="card shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <span className="badge badge-blue text-[10px]">HRV</span>
            </div>
            <div className="text-3xl font-black font-mono-numbers text-blue-600">62 <span className="text-sm font-medium text-slate-500">ms</span></div>
            <div className="text-xs text-slate-500 mt-2 flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> +12% this week</div>
          </div>

          <div className="card shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Moon className="w-5 h-5 text-indigo-600" />
              <span className="badge badge-purple text-[10px]">Sleep Score</span>
            </div>
            <div className="text-3xl font-black font-mono-numbers text-indigo-600">88 <span className="text-sm font-medium text-slate-500">/ 100</span></div>
            <div className="text-xs text-slate-500 mt-2">7h 45m total sleep</div>
          </div>

          <div className="card shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Battery className="w-5 h-5 text-emerald-600" />
              <span className="badge badge-green text-[10px]">Readiness</span>
            </div>
            <div className="text-3xl font-black font-mono-numbers text-emerald-700">Optimal</div>
            <div className="text-xs text-slate-500 mt-2">Cleared for heavy load</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card space-y-4 shadow-sm">
            <h3 className="font-bold text-lg text-slate-900">Heart Rate Variability (HRV) Trend</h3>
            <p className="text-sm text-slate-500 mb-4">A rising HRV indicates your autonomic nervous system is recovering well from surgical trauma and training loads.</p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={HRV_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: '12px',
                      color: '#0f172a',
                      boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.08)'
                    }}
                    itemStyle={{ color: '#2563eb', fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="hrv" name="HRV (ms)" stroke="#2563eb" strokeWidth={3.5} dot={{ r: 4, fill: '#2563eb' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card bg-blue-50/50 border-blue-200/80 shadow-xs">
              <h3 className="font-bold text-blue-700 text-sm uppercase tracking-wider mb-2">Connected Integration Sources</h3>
              <div className="space-y-3 mt-4">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-medium text-slate-800"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Google Fit</div>
                  <span className="text-slate-500">Synced 2m ago</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-medium text-slate-800"><span className="w-2 h-2 rounded-full bg-emerald-500" /> HealthifyMe (Nutrition)</div>
                  <span className="text-slate-500">Synced 1h ago</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-medium text-slate-800"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Hevy (Workouts)</div>
                  <span className="text-slate-500">Synced 4h ago</span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-blue-200/50">
                  <div className="flex items-center gap-2 font-medium text-slate-600"><span className="w-2 h-2 rounded-full bg-slate-300" /> Oura Ring</div>
                  <span className="font-bold text-blue-600 cursor-pointer hover:underline">Connect</span>
                </div>
              </div>
            </div>

            <div className="card space-y-3 shadow-sm">
              <h3 className="font-bold border-b border-border pb-2 text-slate-900 text-sm">Biometric Telemetry Glossary</h3>
              <div>
                <strong className="text-xs block text-slate-800">Heart Rate Variability (HRV)</strong>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">Measures the balance between sympathetic and parasympathetic systems. A higher HRV indicates superior neuromuscular recovery.</p>
              </div>
              <div>
                <strong className="text-xs block text-slate-800">Resting HR</strong>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">An elevated resting heart rate can indicate systemic fatigue or impending overtraining, signaling you to reduce volume.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
