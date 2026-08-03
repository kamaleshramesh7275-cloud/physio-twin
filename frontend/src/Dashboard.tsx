import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend
} from "recharts";
import {
  Activity, Camera, History, Clock, Brain, Settings, AlertTriangle, 
  Dna, Scale, Sparkles, HeartPulse, Battery, Mail, Search
} from 'lucide-react';
import { api } from "./api";
import { auth } from "./firebase";

const trendData = [
  { name: 'W1', mobility: 78, stability: 65, quality: 85 },
  { name: 'W2', mobility: 80, stability: 62, quality: 86 },
  { name: 'W3', mobility: 83, stability: 58, quality: 89 },
  { name: 'W4', mobility: 85, stability: 55, quality: 92 },
  { name: 'W5', mobility: 85, stability: 70, quality: 92 },
];

function NavItem({ icon, label, href, active }: { icon: React.ReactNode; label: string; href: string; active?: boolean }) {
  return (
    <Link href={href} className={`nav-link ${active ? 'active' : ''}`}>
      <span className="text-muted-foreground">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

function MetricRow({ label, value, delta, unit = '' }: { label: string; value: number; delta?: number; unit?: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-3">
        {delta !== undefined && (
          <span className={`text-xs font-mono-numbers ${delta >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {delta >= 0 ? '+' : ''}{delta.toFixed(1)}%
          </span>
        )}
        <span className="text-sm font-bold font-mono-numbers">{value.toFixed(1)}{unit}</span>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="card p-3 text-xs">
        <p className="font-bold mb-1 text-muted-foreground">{label}</p>
        {payload.map((p: any) => (
          <div key={p.name} className="flex justify-between gap-4">
            <span style={{ color: p.color }}>{p.name}</span>
            <span className="font-mono-numbers font-bold">{p.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timelineIndex, setTimelineIndex] = useState(100);
  const [weeklyLetter, setWeeklyLetter] = useState<string | null>(null);
  const [loadingLetter, setLoadingLetter] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    async function loadData() {
      try {
        const uid = auth.currentUser?.uid || "test-user";
        const res = await api.getDashboard(uid);
        setData(res);
      } catch (e) {
        // fallback mock
        setData({ mobility: 85, stability: 55, quality: 92, cardio: 78, recovery: 88, reserve: 55, confidence: 'Low', change_point_alert: 'Deterioration detected in stability over last 3 sessions.' });
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const handleGenerateLetter = async () => {
    setLoadingLetter(true);
    try {
      const uid = auth.currentUser?.uid || "test-user";
      const key = "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";
      const res = await api.getWeeklyLetter(uid, key);
      setWeeklyLetter(res.letter);
    } catch (e) {
      setWeeklyLetter("Your twin is still learning. Add more sessions to generate insights.");
    }
    setLoadingLetter(false);
  };

  if (loading || !data) {
    return (
      <div className="h-screen flex items-center justify-center flex-col gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
        <p className="text-muted-foreground text-sm font-mono-numbers">Loading twin data...</p>
      </div>
    );
  }

  const overallScore = ((data.mobility + data.stability + data.quality + data.cardio + data.recovery) / 5).toFixed(1);
  const fingerprintData = [
    { subject: 'Mobility', A: data.mobility, fullMark: 100 },
    { subject: 'Stability', A: data.stability, fullMark: 100 },
    { subject: 'Quality', A: data.quality, fullMark: 100 },
    { subject: 'Cardio', A: data.cardio, fullMark: 100 },
    { subject: 'Recovery', A: data.recovery, fullMark: 100 },
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen bg-background text-foreground overflow-hidden">

      {/* ── Left Sidebar (Bottom Nav on Mobile) ── */}
      <nav className="w-full md:w-60 flex md:flex-col border-b md:border-b-0 md:border-r border-white/6 p-2 md:p-4 shrink-0 overflow-x-auto md:overflow-x-visible">
        <div className="hidden md:flex items-center gap-2 px-2 mb-8 mt-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-xs font-black text-white shadow-md">PT</div>
          <span className="font-black text-lg tracking-tight">PhysioTwin</span>
        </div>

        <div className="flex md:flex-col gap-1 md:space-y-1 flex-1">
          <NavItem icon={<Activity className="w-5 h-5" />} label="Dashboard" href="/dashboard" active />
          <NavItem icon={<Camera className="w-5 h-5" />} label="Capture" href="/capture" />
          <NavItem icon={<History className="w-5 h-5" />} label="History" href="/coming-soon" />
          <NavItem icon={<Clock className="w-5 h-5" />} label="Twin Timeline" href="/coming-soon" />
          <NavItem icon={<Brain className="w-5 h-5" />} label="Insights" href="/coming-soon" />
          <NavItem icon={<Settings className="w-5 h-5" />} label="Settings" href="/coming-soon" />
        </div>

        <div className="hidden md:block mt-auto pt-4 border-t border-border">
          <div className="flex items-center gap-2 px-2 py-2">
            <div className="pulse-dot" />
            <div>
              <div className="text-xs font-semibold">Twin Active</div>
              <div className="text-xs text-muted-foreground">Simulated data</div>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Main Canvas ── */}
      <main className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black">Digital Twin Overview</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Last updated just now</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge badge-purple">General Human Mode</span>
            <span className="badge badge-cyan">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Simulated
            </span>
            <button
              onClick={() => setLocation('/capture')}
              className="btn-primary text-xs py-2 px-4 ml-2"
            >
              + New Session
            </button>
          </div>
        </header>

        {/* Alert Banner */}
        {data.change_point_alert && (
          <div className="glow-border-destructive rounded-xl p-4 bg-red-500/8 border border-red-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-red-400 w-6 h-6 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-red-400 text-sm uppercase tracking-widest">System Alert</div>
                <div className="text-sm mt-0.5">{data.change_point_alert}</div>
              </div>
            </div>
            <button
              onClick={() => setSelectedMetric('Stability')}
              className="text-xs font-bold text-red-400 border border-red-500/40 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors shrink-0 md:ml-4 w-full md:w-auto text-center"
            >
              Investigate →
            </button>
          </div>
        )}

        {/* Score Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { key: 'Mobility', val: data.mobility, delta: 2.3, color: '#0ea5e9', icon: <Dna className="w-5 h-5 mb-2" /> },
            { key: 'Stability', val: data.stability, delta: -14.5, color: '#f59e0b', icon: <Scale className="w-5 h-5 mb-2" /> },
            { key: 'Quality', val: data.quality, delta: 0.8, color: '#10b981', icon: <Sparkles className="w-5 h-5 mb-2" /> },
            { key: 'Cardio', val: data.cardio, delta: 1.2, color: '#ec4899', icon: <HeartPulse className="w-5 h-5 mb-2" /> },
            { key: 'Recovery', val: data.recovery, delta: 3.1, color: '#8b5cf6', icon: <Battery className="w-5 h-5 mb-2" /> },
          ].map(m => (
            <button
              key={m.key}
              onClick={() => setSelectedMetric(m.key)}
              className={`metric-card text-left transition-all ${selectedMetric === m.key ? 'border-primary bg-primary/5 shadow-sm' : ''}`}
            >
              <div className="text-muted-foreground">{m.icon}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">{m.key}</div>
              <div className="text-2xl font-black font-mono-numbers" style={{ color: m.color }}>{m.val.toFixed(0)}</div>
              <div className={`text-xs font-mono-numbers mt-1 ${m.delta >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {m.delta >= 0 ? '↑' : '↓'} {Math.abs(m.delta).toFixed(1)}%
              </div>
            </button>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Radar */}
          <div className="metric-card cursor-pointer" onClick={() => setSelectedMetric('Fingerprint')}>
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Capability Fingerprint</div>
              <span className={`badge text-[10px] ${data.confidence === 'High' ? 'badge-green' : 'badge-yellow'}`}>{data.confidence} Conf</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-4xl font-black font-mono-numbers text-gradient-primary">{overallScore}</div>
              <div className="text-xs text-muted-foreground">Overall Score</div>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={fingerprintData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="You" dataKey="A" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.25} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Trend */}
          <div className="metric-card col-span-2 cursor-pointer" onClick={() => setSelectedMetric('Trend')}>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Longitudinal Trend</div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" domain={[40, 100]} tick={{ fontSize: 11 }} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Line type="monotone" dataKey="mobility" stroke="#0ea5e9" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#0ea5e9' }} />
                  <Line type="monotone" dataKey="stability" stroke="#f59e0b" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#f59e0b' }} />
                  <Line type="monotone" dataKey="quality" stroke="#10b981" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#10b981' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Reserve + Timeline Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="metric-card cursor-pointer" onClick={() => setSelectedMetric('Reserve')}>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Capability Reserve</div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Current Demand</span>
                  <span className="font-mono-numbers">{(100 - data.reserve).toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-border rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-slate-300 transition-all duration-700"
                    style={{ width: `${100 - data.reserve}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Reserve Remaining</span>
                  <span className="font-mono-numbers text-primary">{data.reserve.toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-border rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all duration-700"
                    style={{ width: `${data.reserve}%` }} />
                </div>
              </div>
              <div className="pt-2 border-t border-border">
                <div className="text-3xl font-black font-mono-numbers text-gradient-primary">{data.reserve.toFixed(0)}<span className="text-base font-medium text-muted-foreground">%</span></div>
                <div className="text-xs text-muted-foreground">reserve capacity</div>
              </div>
            </div>
          </div>

          {/* Twin Timeline */}
          <div className="metric-card md:col-span-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Twin Timeline</div>
            <p className="text-xs text-muted-foreground mb-4">Drag to rewind your capability profile through history</p>
            <input
              type="range"
              min="0" max="100"
              value={timelineIndex}
              onChange={(e) => setTimelineIndex(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2 font-mono-numbers">
              <span>3 months ago</span>
              <span className="badge badge-purple">{timelineIndex === 100 ? 'Present' : `${100 - timelineIndex} days ago`}</span>
              <span>Now</span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {['Jul 1', 'Jul 15', 'Aug 3'].map((d, i) => (
                <div key={d} className="p-2 rounded-lg bg-card border border-border text-center shadow-sm">
                  <div className="text-xs text-muted-foreground">{d}</div>
                  <div className="text-lg font-black font-mono-numbers text-gradient-primary mt-0.5">{[76.2, 80.1, parseFloat(overallScore)][i]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* ── Right Rail ── */}
      <aside className="w-full md:w-72 border-t md:border-t-0 md:border-l border-border flex flex-col overflow-y-auto shrink-0 bg-background z-20">
        {/* Weekly Letter */}
        <div className="p-5 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="font-bold text-sm">Twin's Letter</div>
              <div className="text-xs text-muted-foreground">AI-generated weekly insight</div>
            </div>
            <Mail className="text-muted-foreground w-5 h-5" />
          </div>
          {!weeklyLetter ? (
            <button
              onClick={handleGenerateLetter}
              disabled={loadingLetter}
              className="w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loadingLetter ? (
                <>
                  <div className="w-3 h-3 border border-purple-400 border-t-transparent rounded-full animate-spin" />
                  Analyzing twin...
                </>
              ) : (
                '⚡ Generate Insights'
              )}
            </button>
          ) : (
            <div className="text-xs text-muted-foreground leading-relaxed bg-card rounded-xl p-3 border border-border shadow-sm max-h-40 overflow-y-auto">
              {weeklyLetter}
            </div>
          )}
        </div>

        {/* Explainability Engine */}
        <div className="p-5 flex-1">
          <div className="font-bold text-sm mb-1">Explainability Engine</div>
          <div className="text-xs text-muted-foreground mb-4">Click any metric or chart to inspect it</div>

          {!selectedMetric ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <Search className="text-muted-foreground w-8 h-8 mb-3 opacity-50" />
              <div className="text-xs text-muted-foreground">No metric selected.<br />Click a card or chart above.</div>
            </div>
          ) : (
            <div className="space-y-4 animate-slide-right">
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                <div className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-1">Analysis: {selectedMetric}</div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {selectedMetric === 'Stability'
                    ? 'Your twin flags a persistent decline in stability across 3+ sessions. Primary driver is elevated postural sway detected on the Z-axis during Single-Leg Balance. Likely compounded by ankle strategy jitter.'
                    : `Your ${selectedMetric} metric is within expected bounds. Your twin is continuing to build a baseline over the next few sessions.`}
                </p>
              </div>

              <div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Contributing Factors</div>
                <div className="space-y-2">
                  <MetricRow label="Postural Sway (Z)" value={14.2} delta={14.2} />
                  <MetricRow label="Ankle Jitter" value={8.5} delta={8.5} />
                  <MetricRow label="Simulated HR Cost" value={72} />
                  <MetricRow label="Symmetry Index" value={94.1} delta={1.2} />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                <div className="flex items-center gap-2 mb-1">
                  <Brain className="w-4 h-4 text-emerald-600" />
                  <div className="text-xs font-bold text-emerald-700">Twin Suggestion</div>
                </div>
                <p className="text-xs text-muted-foreground">Focus on ankle mobility drills in your next session. Consider adding a Single-Leg Balance test to build a stronger baseline.</p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
