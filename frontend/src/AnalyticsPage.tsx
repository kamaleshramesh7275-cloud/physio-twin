import React from "react";
import { Sidebar } from "./components/Sidebar";
import { LineChart as LineChartIcon, TrendingUp, TrendingDown, Activity, Download } from "lucide-react";
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, ComposedChart, Bar
} from 'recharts';

const ROM_DATA = [
  { date: 'Oct 01', leftKnee: 110, rightKnee: 135 },
  { date: 'Oct 08', leftKnee: 115, rightKnee: 135 },
  { date: 'Oct 15', leftKnee: 122, rightKnee: 135 },
  { date: 'Oct 22', leftKnee: 128, rightKnee: 135 },
  { date: 'Oct 29', leftKnee: 134, rightKnee: 135 },
];

const FORCE_DATA = [
  { date: 'Oct 01', asymmetry: 24, hevyVolume: 2000 },
  { date: 'Oct 08', asymmetry: 20, hevyVolume: 2500 },
  { date: 'Oct 15', asymmetry: 15, hevyVolume: 3200 },
  { date: 'Oct 22', asymmetry: 11, hevyVolume: 4500 },
  { date: 'Oct 29', asymmetry: 4, hevyVolume: 4800 },
];

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen text-foreground md:overflow-hidden pb-[72px] md:pb-0 bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2 text-slate-900">
              <LineChartIcon className="w-6 h-6 text-blue-600" /> Longitudinal Analytics
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Multi-session biometric trend modeling.</p>
          </div>
          <button className="btn btn-secondary flex items-center gap-2 px-4 py-2 text-xs font-bold">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* ROM Chart */}
          <div className="card space-y-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-bold text-lg text-slate-900">Range of Motion (Flexion)</h3>
                <p className="text-xs text-slate-500">Left vs Right Knee (degrees)</p>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-emerald-600 flex items-center gap-1 justify-end font-mono-numbers">
                  <TrendingUp className="w-4 h-4" /> +24°
                </div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Past Month</div>
              </div>
            </div>
            
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ROM_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                    itemStyle={{ color: '#0f172a' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Line type="monotone" dataKey="leftKnee" name="Left Knee" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#2563eb' }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="rightKnee" name="Right Knee" stroke="#94a3b8" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4, fill: '#94a3b8' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="text-xs text-slate-700 bg-blue-50/50 p-3.5 rounded-xl border border-blue-200/70 leading-relaxed">
              <strong className="text-blue-700 block mb-1">Clinical Reasoning:</strong>
              Achieving symmetrical flexion (Range of Motion) within the first 6 weeks post-operation is critical to prevent arthrofibrosis (excessive scar tissue formation). Your left knee is progressing steadily towards the 135° baseline.
            </div>
          </div>

          {/* Force Asymmetry Chart */}
          <div className="card space-y-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-bold text-lg text-slate-900">Force Output Asymmetry</h3>
                <p className="text-xs text-slate-500">Jump take-off phase difference (%)</p>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-emerald-600 flex items-center gap-1 justify-end font-mono-numbers">
                  <TrendingDown className="w-4 h-4" /> -20%
                </div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Past Month</div>
              </div>
            </div>
            
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={FORCE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAsym" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d97706" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} domain={[0, 30]} />
                  <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: '12px',
                      color: '#0f172a',
                      boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.08)'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar yAxisId="right" dataKey="hevyVolume" name="Hevy Training Vol (kg)" fill="#8b5cf6" opacity={0.35} radius={[4, 4, 0, 0]} />
                  <Area yAxisId="left" type="monotone" dataKey="asymmetry" name="Asymmetry (%)" stroke="#d97706" fillOpacity={1} fill="url(#colorAsym)" strokeWidth={3} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="text-xs text-slate-700 bg-blue-50/50 p-3.5 rounded-xl border border-blue-200/70 leading-relaxed mt-4">
              <strong className="text-blue-700 block mb-1">Cross-Platform Training Intelligence:</strong>
              By overlaying your <strong className="text-purple-700">Hevy App</strong> training volume against force asymmetry, we ensure that increased loading is actually driving symmetric adaptation rather than compensatory overload. Force Output Asymmetry under 10% is the gold standard threshold for return-to-sport clearance.
            </div>
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs p-3.5 rounded-xl flex items-start gap-2.5 mt-4">
              <Activity className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <p>Asymmetry has dropped below the critical 10% threshold. You are cleared for return to moderate impact activities.</p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
