import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend
} from "recharts";
import {
  Activity, Camera, History, Clock, Brain, Settings, AlertTriangle, User,
  Dna, Scale, Sparkles, HeartPulse, Battery, Search, MessageSquare, Target, BarChart2,
  Smartphone, Apple, Dumbbell, Stethoscope
} from 'lucide-react';
import { api } from "./api";
import { useAuth } from "./context/AuthContext";
import ChatInterface from "./ChatInterface";
import SimulatorPanel from "./SimulatorPanel";
import { useAvatar } from "./AvatarContext";
import { Sidebar } from "./components/Sidebar";

function MetricRow({ label, value, delta, unit = '' }: { label: string; value: number; delta?: number; unit?: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm text-slate-600">{label}</span>
      <div className="flex items-center gap-3">
        {delta !== undefined && (
          <span className={`text-xs font-mono-numbers font-semibold ${delta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {delta >= 0 ? '+' : ''}{delta.toFixed(1)}%
          </span>
        )}
        <span className="text-sm font-bold font-mono-numbers text-slate-900">{value.toFixed(1)}{unit}</span>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="card p-3 text-xs shadow-xl" style={{ background: '#ffffff', border: '1px solid #e2e8f0', color: '#0f172a' }}>
        <p className="font-bold mb-1 text-slate-500">{label}</p>
        {payload.map((p: any) => (
          <div key={p.name} className="flex justify-between gap-4">
            <span style={{ color: p.color }} className="font-medium">{p.name}</span>
            <span className="font-mono-numbers font-bold text-slate-900">{p.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { user } = useAuth();
  const { setHighlightMode } = useAvatar();
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [externalData, setExternalData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timelineIndex, setTimelineIndex] = useState(100);
  const [simulationOverride, setSimulationOverride] = useState<{ reserve: number, recovery: number } | null>(null);
  const [rightRailTab, setRightRailTab] = useState<'chat' | 'simulate' | 'inspect'>('chat');
  const [, setLocation] = useLocation();

  // Sync selectedMetric into the global Avatar context
  const handleSelectMetric = (key: string) => {
    setSelectedMetric(key);
    setHighlightMode(key);
    setRightRailTab('inspect');
  };

  // Clear simulation override if tab changes or timeline moves
  useEffect(() => {
    if (rightRailTab !== 'simulate' || timelineIndex < 100) {
      setSimulationOverride(null);
    }
  }, [rightRailTab, timelineIndex]);

  useEffect(() => {
    async function loadData() {
      try {
        const uid = user?.uid || "test-user";
        const [dashRes, extRes] = await Promise.all([
          api.getDashboard(uid),
          api.getExternalApps(uid)
        ]);
        setData(dashRes);
        setExternalData(extRes);
      } catch (e) {
        // fallback mock
        setData({ mobility: 85, stability: 55, quality: 92, cardio: 78, recovery: 88, reserve: 55, confidence: 'Low' });
        setExternalData([]);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading || !data) {
    return (
      <div className="h-screen flex items-center justify-center flex-col gap-4 bg-background">
        <div className="w-12 h-12 rounded-full border-3 border-blue-600 border-t-transparent animate-spin" />
        <p className="text-muted-foreground text-sm font-mono-numbers font-medium">Calibrating twin biometrics...</p>
      </div>
    );
  }

  const activeTrendData = data.trend_data || [];
  let displayData = { ...data };
  
  if (activeTrendData.length > 0 && timelineIndex < 100) {
    const historicalIndex = Math.floor((timelineIndex / 100) * (activeTrendData.length - 1));
    const hist = activeTrendData[historicalIndex];
    if (hist) {
      displayData.mobility = hist.mobility;
      displayData.stability = hist.stability;
      displayData.recovery = hist.recovery;
      displayData.reserve = hist.reserve;
    }
  }

  if (simulationOverride && timelineIndex === 100) {
    displayData.reserve = simulationOverride.reserve;
    displayData.recovery = simulationOverride.recovery;
  }

  const overallScore = ((displayData.mobility + displayData.stability + displayData.quality + displayData.cardio + displayData.recovery) / 5).toFixed(1);
  const fingerprintData = [
    { subject: 'Mobility', A: displayData.mobility, fullMark: 100 },
    { subject: 'Stability', A: displayData.stability, fullMark: 100 },
    { subject: 'Quality', A: displayData.quality, fullMark: 100 },
    { subject: 'Cardio', A: displayData.cardio, fullMark: 100 },
    { subject: 'Recovery', A: displayData.recovery, fullMark: 100 },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen h-auto md:h-screen text-foreground bg-background md:overflow-hidden pb-[72px] md:pb-0">
      <Sidebar />

      {/* ── Main Content ── */}
      <main className="flex-1 md:overflow-y-auto p-4 md:p-6 space-y-6 anim-fade z-10 relative pointer-events-none">

        {/* Header */}
        <header className="flex items-center justify-between pointer-events-auto">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Digital Twin Overview</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Biometric sync active · Updated just now</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge badge-purple">Human Kinetic Mode</span>
            <span className="badge badge-cyan">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              Live Telemetry
            </span>
            <button
              onClick={() => setLocation('/capture')}
              className="btn btn-primary text-xs py-2 px-4 ml-2"
            >
              + New Session
            </button>
          </div>
        </header>

        {/* Alert Banner */}
        {data.change_point_alert && (
          <div className="glow-border-destructive rounded-xl p-4 bg-rose-50/80 border border-rose-200 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in shadow-xs">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-rose-600 w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-rose-700 text-xs uppercase tracking-widest">Kinematic Alert</div>
                <div className="text-sm mt-0.5 text-rose-950 font-medium">{data.change_point_alert}</div>
              </div>
            </div>
            <button
              onClick={() => setSelectedMetric('Stability')}
              className="text-xs font-bold text-rose-700 border border-rose-300 bg-white px-3 py-1.5 rounded-lg hover:bg-rose-100/50 transition-colors shrink-0 md:ml-4 w-full md:w-auto text-center cursor-pointer shadow-2xs"
            >
              Investigate →
            </button>
          </div>
        )}

        {/* Score Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 anim-up-d1">
          {[
            { key: 'Mobility', val: displayData.mobility, delta: 2.3, color: '#2563eb', icon: <Dna className="w-5 h-5" />, spark: [{v:75},{v:76},{v:77},{v:78},{v:displayData.mobility}] },
            { key: 'Stability', val: displayData.stability, delta: -14.5, color: '#d97706', icon: <Scale className="w-5 h-5" />, spark: [{v:70},{v:68},{v:65},{v:60},{v:displayData.stability}] },
            { key: 'Quality', val: displayData.quality, delta: 0.8, color: '#059669', icon: <Sparkles className="w-5 h-5" />, spark: [{v:85},{v:85},{v:86},{v:86},{v:displayData.quality}] },
            { key: 'Cardio', val: displayData.cardio, delta: 1.2, color: '#e11d48', icon: <HeartPulse className="w-5 h-5" />, spark: [{v:75},{v:76},{v:76},{v:77},{v:displayData.cardio}] },
            { key: 'Recovery', val: displayData.recovery, delta: 3.1, color: '#7c3aed', icon: <Battery className="w-5 h-5" />, spark: [{v:80},{v:82},{v:85},{v:88},{v:displayData.recovery}] },
          ].map(m => (
            <button
              key={m.key}
              onClick={() => {
                handleSelectMetric(m.key);
              }}
              className={`metric-card pointer-events-auto text-left transition-all overflow-hidden relative cursor-pointer ${selectedMetric === m.key ? 'border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-600/20' : ''}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-slate-500">{m.icon}</div>
                <div className={`text-[10px] font-bold font-mono-numbers px-1.5 py-0.5 rounded ${m.delta >= 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                  {m.delta >= 0 ? '↑' : '↓'}{Math.abs(m.delta).toFixed(1)}%
                </div>
              </div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{m.key}</div>
              <div className="text-2xl font-black font-mono-numbers mt-0.5 text-slate-900">{m.val.toFixed(0)}</div>
              
              <div className="h-8 w-full mt-3 -mx-2 -mb-2 opacity-75">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={m.spark}>
                    <Line type="monotone" dataKey="v" stroke={m.color} strokeWidth={2.5} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </button>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 anim-up-d2">

          {/* Left Column (Radar + Activity Feed) */}
          <div className="flex flex-col gap-4">
            {/* Radar */}
            <div className="metric-card glass-panel pointer-events-auto cursor-pointer" onClick={() => setSelectedMetric('Fingerprint')}>
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Capability Fingerprint</div>
                <span className={`badge text-[10px] ${data.confidence === 'High' ? 'badge-green' : 'badge-yellow'}`}>{data.confidence} Conf</span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <div className="text-4xl font-black font-mono-numbers text-blue-600">{overallScore}</div>
                <div className="text-xs text-slate-500 font-medium">Overall Score / 100</div>
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={fingerprintData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="You" dataKey="A" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2.5} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Synced Data Feed */}
            <div className="metric-card glass-panel pointer-events-auto flex-1">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Connected Telemetry</div>
              <div className="space-y-4">
                {externalData.length === 0 ? (
                  <div className="text-sm text-muted-foreground italic">No external data synced yet.</div>
                ) : (
                  externalData.map((item, i) => {
                    if (item.app_name === "Hevy" && item.session_data?.workouts?.[0]) {
                      const w = item.session_data.workouts[0];
                      return (
                        <div key={i} className="flex flex-col gap-2 border-b border-border pb-3">
                          <div className="flex items-center gap-2">
                            <Dumbbell className="w-4 h-4 text-purple-600" />
                            <span className="font-semibold text-sm text-slate-900">Hevy App</span>
                          </div>
                          <div className="text-xs text-slate-600">{w.name} • Load: {w.load}</div>
                          <div className="text-[10px] text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md inline-block w-fit font-medium">
                            Affected: {w.affectedZones.join(', ')}
                          </div>
                        </div>
                      );
                    }
                    if (item.app_name === "HealthifyMe" && item.session_data?.nutrition) {
                      const n = item.session_data.nutrition;
                      return (
                        <div key={i} className="flex flex-col gap-2 border-b border-border pb-3">
                          <div className="flex items-center gap-2">
                            <Apple className="w-4 h-4 text-emerald-600" />
                            <span className="font-semibold text-sm text-slate-900">HealthifyMe</span>
                          </div>
                          <div className="text-xs text-slate-600">{n.status} • {n.protein}</div>
                          <div className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md inline-block w-fit font-medium">
                            Hydration: {n.hydration}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })
                )}
              </div>
            </div>

            {/* Clinical Summary */}
            <div className="metric-card glass-panel pointer-events-auto bg-blue-50/50 border-blue-200/80">
              <div className="flex items-center gap-2 mb-2 text-blue-700">
                <Stethoscope className="w-4 h-4" />
                <div className="text-xs font-bold uppercase tracking-widest">Clinical Kinetic Summary</div>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                Your recovery is trending positively, but your <span className="text-slate-900 font-semibold">Google Fit</span> telemetry flags a reduced HRV (45ms). Combined with a <span className="text-slate-900 font-semibold">+15% load spike</span> from yesterday's <span className="text-slate-900 font-semibold">Hevy</span> workout, your central nervous system is fatigued. <span className="text-emerald-700 font-semibold">Protein intake is optimal</span> for tissue repair. <br/><br/><strong>Recommendation:</strong> Prioritize active mobility and foam rolling today. Avoid heavy loads to prevent knee/lumbar strain.
              </p>
            </div>
          </div>

          {/* Right Column (Trend) */}
          <div className="metric-card glass-panel pointer-events-auto cursor-pointer flex flex-col" onClick={() => setSelectedMetric('Trend')}>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Longitudinal Biometrics</div>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activeTrendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" domain={[40, 100]} tick={{ fontSize: 11 }} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Line type="monotone" dataKey="mobility" stroke="#2563eb" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#2563eb' }} />
                  <Line type="monotone" dataKey="stability" stroke="#d97706" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#d97706' }} />
                  <Line type="monotone" dataKey="quality" stroke="#059669" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#059669' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Reserve + Timeline Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 anim-up-d3 pointer-events-auto">
          <div className="metric-card glass-panel cursor-pointer" onClick={() => setSelectedMetric('Reserve')}>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Capability Reserve</div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-600 font-medium">Current Demand</span>
                  <span className="font-mono-numbers font-semibold text-slate-800">{(100 - displayData.reserve).toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div className="h-full rounded-full bg-slate-400 transition-all duration-700"
                    style={{ width: `${100 - displayData.reserve}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-600 font-medium">Reserve Remaining</span>
                  <span className="font-mono-numbers font-bold text-blue-600">{data.reserve.toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div className="h-full rounded-full bg-blue-600 transition-all duration-700"
                    style={{ width: `${data.reserve}%` }} />
                </div>
              </div>
              <div className="pt-2 border-t border-border">
                <div className="text-3xl font-black font-mono-numbers text-slate-900">{data.reserve.toFixed(0)}<span className="text-base font-bold text-slate-500">%</span></div>
                <div className="text-xs text-slate-500 font-medium">reserve capacity available</div>
              </div>
            </div>
          </div>

          {/* Twin Timeline */}
          <div className="metric-card glass-panel md:col-span-2">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Twin Timeline</div>
            <p className="text-xs text-slate-600 mb-4">Drag to rewind your biomechanical capability profile through history</p>
            <input
              type="range"
              min="0" max="100"
              value={timelineIndex}
              onChange={(e) => setTimelineIndex(parseInt(e.target.value))}
              className="w-full cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-2 font-mono-numbers font-medium">
              <span>3 months ago</span>
              <span className="badge badge-purple">{timelineIndex === 100 ? 'Present Session' : `${100 - timelineIndex} days ago`}</span>
              <span>Today</span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {['Jul 1', 'Jul 15', 'Aug 3'].map((d, i) => (
                <div key={d} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <div className="text-xs font-medium text-slate-500">{d}</div>
                  <div className="text-lg font-black font-mono-numbers text-blue-600 mt-0.5">{[76.2, 80.1, parseFloat(overallScore)][i]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* ── Right Rail ── */}
      <aside className="w-full md:w-[320px] border-t md:border-t-0 md:border-l border-slate-200 flex flex-col md:overflow-hidden shrink-0 bg-white/95 backdrop-blur-xl z-20 pointer-events-auto shadow-xs">
        
        {/* Tabs */}
        <div className="flex border-b border-border p-2 gap-2 bg-slate-50">
          <button 
            onClick={() => setRightRailTab('chat')}
            className={`flex-1 py-2 text-xs font-bold flex items-center justify-center gap-1.5 rounded-lg transition-colors cursor-pointer ${rightRailTab === 'chat' ? 'bg-white shadow-xs text-blue-600 border border-slate-200' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Chat
          </button>
          <button 
            onClick={() => setRightRailTab('simulate')}
            className={`flex-1 py-2 text-xs font-bold flex items-center justify-center gap-1.5 rounded-lg transition-colors cursor-pointer ${rightRailTab === 'simulate' ? 'bg-white shadow-xs text-blue-600 border border-slate-200' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <Target className="w-3.5 h-3.5" />
            Simulate
          </button>
          <button 
            onClick={() => setRightRailTab('inspect')}
            className={`flex-1 py-2 text-xs font-bold flex items-center justify-center gap-1.5 rounded-lg transition-colors cursor-pointer ${rightRailTab === 'inspect' ? 'bg-white shadow-xs text-blue-600 border border-slate-200' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <Search className="w-3.5 h-3.5" />
            Inspect
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4">
          
          {rightRailTab === 'chat' && (
            <div className="h-full min-h-[400px]">
              <ChatInterface />
            </div>
          )}

          {rightRailTab === 'simulate' && (
            <div className="h-full min-h-[400px]">
              <SimulatorPanel 
                currentReserve={displayData.reserve} 
                currentRecovery={displayData.recovery} 
                onSimulate={setSimulationOverride}
              />
            </div>
          )}

          {rightRailTab === 'inspect' && (
            <div className="h-full flex flex-col">
              <div className="font-bold text-sm mb-1 text-slate-900">Explainability Engine</div>
              <div className="text-xs text-slate-500 mb-4">Click any metric or chart to inspect contributing factors</div>

              {!selectedMetric ? (
                <div className="flex flex-col items-center justify-center h-40 text-center flex-1">
                  <Search className="text-slate-400 w-8 h-8 mb-3 opacity-60" />
                  <div className="text-xs text-slate-500">No metric selected.<br />Click a card or chart on the dashboard.</div>
                </div>
              ) : (
                <div className="space-y-4 animate-slide-right">
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                    <div className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-1">Analysis: {selectedMetric}</div>
                    <p className="text-xs text-slate-700 leading-relaxed font-normal">
                      {selectedMetric === 'Stability'
                        ? 'Your twin flags a persistent decline in stability across 3+ sessions. Primary driver is elevated postural sway detected on the Z-axis during Single-Leg Balance. Likely compounded by ankle strategy jitter.'
                        : `Your ${selectedMetric} metric is within expected bounds. Your twin is continuing to build a baseline over the next few sessions.`}
                    </p>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Contributing Factors</div>
                    <div className="space-y-2">
                      <MetricRow label="Postural Sway (Z)" value={14.2} delta={14.2} />
                      <MetricRow label="Ankle Jitter" value={8.5} delta={8.5} />
                      <MetricRow label="Simulated HR Cost" value={72} />
                      <MetricRow label="Symmetry Index" value={94.1} delta={1.2} />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Brain className="w-4 h-4 text-emerald-600" />
                      <div className="text-xs font-bold text-emerald-700">Twin Suggestion</div>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">Focus on ankle mobility drills in your next session. Consider adding a Single-Leg Balance test to build a stronger baseline.</p>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </aside>
    </div>
  );
}
