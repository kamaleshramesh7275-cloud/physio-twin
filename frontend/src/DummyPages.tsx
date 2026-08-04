import { Link } from "wouter";
import { useState, useEffect, useRef } from "react";
import { Activity, Camera, History, Clock, Brain, Settings, Trophy, AlertCircle, TrendingUp, CheckCircle2, ChevronRight, ActivitySquare, User } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { api } from "./api";
import { auth } from "./firebase";
import { Sidebar } from "./components/Sidebar";

const DEMO_TIMELINE = [
  { day: "Today", events: [{ time: "08:30 AM", type: "Sync", title: "Hevy App Sync", desc: "Heavy Squat Day • 12,400 lbs total volume", status: "success" }] },
  { day: "Yesterday", events: [{ time: "09:00 AM", type: "Sync", title: "HealthifyMe Sync", desc: "165g Protein • 2,400 kcal", status: "success" }] },
];
const DEMO_INSIGHTS = [{ type: 'warning', title: 'Systemic Fatigue', desc: 'HRV dropped to 45ms. Avoid heavy lifting today.' }];
const DEMO_MILESTONES = [{ title: "Perfect Posture", date: "Jul 15, 2026", icon: <User className="w-5 h-5 text-emerald-400" /> }];
const DEMO_RECORDS = [{ label: "Max Mobility", value: "94", date: "Jul 10, 2026" }];
const DEMO_DOMAIN_SCORES = [{ name: 'Mobility', score: 85 }];
const DEMO_ACTION_PLAN = [{ phase: "Phase 1", tasks: ["Foam roll calves", "Banded glute bridges"] }];

export function HistoryPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    async function fetchHistory() {
      try {
        const uid = auth.currentUser?.uid || "test-user";
        let data = await api.getSessionHistory(uid);
        if (!data || data.length === 0) {
          data = [
            { id: '1', task_type: 'Sit-to-Stand Assessment', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), rom: 85.2, symmetry: 0.95, movement_speed: 15.4, stability: 0.88 },
            { id: '2', task_type: 'Static Posture', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), rom: 90.1, symmetry: 0.98, movement_speed: 0, stability: 0.92 },
            { id: '3', task_type: 'Sit-to-Stand Assessment', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), rom: 82.4, symmetry: 0.91, movement_speed: 14.1, stability: 0.85 },
          ];
        }
        setSessions(data);
      } catch (err) {
        console.error("Error fetching history", err);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  const filteredSessions = filter === 'All' ? sessions : sessions.filter(s => s.task_type.includes(filter));
  
  // KPIs
  const avgRom = sessions.length ? sessions.reduce((acc, s) => acc + s.rom, 0) / sessions.length : 0;
  const bestSym = sessions.length ? Math.max(...sessions.map(s => s.symmetry)) : 0;
  const avgStab = sessions.length ? sessions.reduce((acc, s) => acc + s.stability, 0) / sessions.length : 0;

  return (
    <div className="flex flex-col md:flex-row min-h-screen h-auto md:h-screen text-foreground md:overflow-hidden pb-[72px] md:pb-0">
      <Sidebar />
      <main className="flex-1 md:overflow-y-auto p-4 md:p-6 space-y-6 anim-fade relative z-10 pointer-events-none">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pointer-events-auto">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2"><History className="w-6 h-6 text-primary" /> Session History</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Your past physical capability logs</p>
          </div>
          <Link href="/capture" className="btn-primary py-2 px-4 text-xs whitespace-nowrap hidden md:flex">Start New Session</Link>
        </header>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4 glass-panel pointer-events-auto">
            <History className="w-12 h-12 text-muted-foreground opacity-30" />
            <div className="text-muted-foreground">No sessions recorded yet.</div>
            <Link href="/capture" className="btn-primary mt-2">Start a Session</Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* KPI Summary Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 anim-up-d1 pointer-events-auto">
              <div className="glass-panel text-center">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Sessions</div>
                <div className="text-2xl font-bold">{sessions.length}</div>
              </div>
              <div className="glass-panel text-center">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Avg ROM</div>
                <div className="text-2xl font-bold text-sky-500">{avgRom.toFixed(1)}°</div>
              </div>
              <div className="glass-panel text-center">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Best Symmetry</div>
                <div className="text-2xl font-bold text-emerald-500">{(bestSym * 100).toFixed(0)}%</div>
              </div>
              <div className="glass-panel text-center">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Avg Stability</div>
                <div className="text-2xl font-bold text-amber-500">{(avgStab * 100).toFixed(0)}</div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {['All', 'Sit-to-Stand', 'Posture', 'Balance', 'Gait'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${filter === f ? 'bg-primary text-white' : 'bg-secondary text-foreground hover:bg-primary/20'}`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Session List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 anim-up-d2 pointer-events-auto">
              {filteredSessions.map((session, i) => (
                <div key={session.id} className="glass-panel hover:border-primary/50 transition-colors relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-bold text-lg">{session.task_type}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {new Date(session.timestamp).toLocaleString()}
                      </div>
                    </div>
                    {session.badge && (
                      <div className={`badge text-[10px] ${
                        session.badge === 'Personal Best' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                        session.badge === 'Watchpoint' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                        'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}>
                        {session.badge === 'Personal Best' && <Trophy className="w-3 h-3 mr-1" />}
                        {session.badge === 'Watchpoint' && <AlertCircle className="w-3 h-3 mr-1" />}
                        {session.badge === 'Improved' && <TrendingUp className="w-3 h-3 mr-1" />}
                        {session.badge}
                      </div>
                    )}
                  </div>
                  
                  {session.notes && (
                    <div className="text-xs italic text-muted-foreground mb-4 bg-secondary/50 p-2 rounded border border-border/50">
                      "{session.notes}"
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Range of Motion</div>
                      <div className="font-mono-numbers font-bold text-xl">{session.rom.toFixed(1)}°</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 flex justify-between">
                        <span>Symmetry</span>
                        <span className="font-mono-numbers">{(session.symmetry * 100).toFixed(0)}%</span>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${session.symmetry * 100}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Speed (Reps/Min)</div>
                      <div className="font-mono-numbers font-bold text-xl">{session.movement_speed.toFixed(1)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 flex justify-between">
                        <span>Stability</span>
                        <span className="font-mono-numbers">{(session.stability * 100).toFixed(0)}</span>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${session.stability * 100}%` }} />
                      </div>
                    </div>
                  </div>
                  <button className="absolute top-1/2 -right-12 -translate-y-1/2 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center opacity-0 group-hover:right-4 group-hover:opacity-100 transition-all shadow-lg">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export function TimelinePage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMetrics, setActiveMetrics] = useState({ rom: true, symmetry: true, speed: false, stability: false });

  useEffect(() => {
    async function fetchHistory() {
      if (isDemoMode()) {
        setSessions(DEMO_TIMELINE);
        setLoading(false);
        return;
      }
      try {
        const uid = auth.currentUser?.uid || "test-user";
        let data = await api.getSessionHistory(uid);
        
        if (!data || data.length < 2) {
          data = Array.from({length: 10}).map((_, i) => ({
             id: `mock-${i}`,
             timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * (10 - i)).toISOString(),
             rom: 75 + (i * 1.5) + (Math.random() * 5 - 2.5),
             symmetry: 0.85 + (i * 0.01) + (Math.random() * 0.02 - 0.01),
             movement_speed: 12 + (i * 0.5),
             stability: 0.80 + (i * 0.01)
          }));
        }
        
        // Reverse data so oldest is first on the chart
        const chartData = data.reverse().map((s: any, idx: number) => ({
          name: `S${idx + 1}`,
          date: new Date(s.timestamp).toLocaleDateString(),
          rom: parseFloat(s.rom.toFixed(1)),
          symmetry: parseFloat((s.symmetry * 100).toFixed(0)),
          speed: parseFloat(s.movement_speed.toFixed(1)),
          stability: parseFloat((s.stability * 100).toFixed(0))
        }));
        setSessions(chartData);
      } catch (err) {
        console.error("Error fetching history", err);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  const toggleMetric = (metric: keyof typeof activeMetrics) => {
    setActiveMetrics(prev => ({ ...prev, [metric]: !prev[metric] }));
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen h-auto md:h-screen text-foreground md:overflow-hidden pb-[72px] md:pb-0">
      <Sidebar />
      <main className="flex-1 md:overflow-y-auto p-4 md:p-6 space-y-6 anim-fade relative z-10 pointer-events-none">
        <header className="pointer-events-auto">
          <h1 className="text-2xl font-black flex items-center gap-2"><Clock className="w-6 h-6 text-primary" /> Twin Timeline</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Visualize your capability progression</p>
        </header>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : sessions.length < 2 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4 glass-panel pointer-events-auto">
            <Clock className="w-12 h-12 text-muted-foreground opacity-30" />
            <div className="text-muted-foreground">Record at least 2 sessions to see your timeline.</div>
            <Link href="/capture" className="btn-primary mt-2">Start a Session</Link>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Header Summary Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 anim-up-d1 pointer-events-auto">
              <div className="glass-panel flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500"><TrendingUp className="w-5 h-5" /></div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Overall Improvement</div>
                  <div className="text-xl font-bold">+13.8%</div>
                </div>
              </div>
              <div className="glass-panel flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500"><Trophy className="w-5 h-5" /></div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Best Session</div>
                  <div className="text-xl font-bold">S14</div>
                </div>
              </div>
              <div className="glass-panel flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-500"><Clock className="w-5 h-5" /></div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Days Tracked</div>
                  <div className="text-xl font-bold">57 Days</div>
                </div>
              </div>
            </div>

            <div className="glass-panel anim-up-d2 pointer-events-auto">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Multi-Metric Overlay</div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => toggleMetric('rom')} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${activeMetrics.rom ? 'bg-sky-500/20 text-sky-300 border-sky-500/40' : 'bg-transparent text-muted-foreground border-white/10'}`}>ROM</button>
                  <button onClick={() => toggleMetric('symmetry')} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${activeMetrics.symmetry ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-transparent text-muted-foreground border-white/10'}`}>Symmetry</button>
                  <button onClick={() => toggleMetric('stability')} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${activeMetrics.stability ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-transparent text-muted-foreground border-white/10'}`}>Stability</button>
                  <button onClick={() => toggleMetric('speed')} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${activeMetrics.speed ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' : 'bg-transparent text-muted-foreground border-white/10'}`}>Speed</button>
                </div>
              </div>
              
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sessions} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="left" stroke="#94a3b8" domain={['auto', 'auto']} tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" domain={[0, 40]} tick={{ fontSize: 11 }} hide={!activeMetrics.speed} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(10,15,30,0.95)', color: '#f8fafc' }} />
                    
                    {isDemoMode() && DEMO_MILESTONES.map((m, i) => (
                      <ReferenceLine key={i} x={m.session} stroke="#cbd5e1" strokeDasharray="3 3" yAxisId="left" label={{ position: 'top', value: m.label, fill: '#64748b', fontSize: 10 }} />
                    ))}

                    {activeMetrics.rom && <Line yAxisId="left" type="monotone" dataKey="rom" name="Range of Motion" stroke="#0ea5e9" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />}
                    {activeMetrics.symmetry && <Line yAxisId="left" type="monotone" dataKey="symmetry" name="Symmetry" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />}
                    {activeMetrics.stability && <Line yAxisId="left" type="monotone" dataKey="stability" name="Stability" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />}
                    {activeMetrics.speed && <Line yAxisId="right" type="monotone" dataKey="speed" name="Speed" stroke="#a855f7" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Personal Records */}
            {isDemoMode() && (
              <div className="glass-panel anim-up-d3 pointer-events-auto">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Personal Records</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
                      <tr>
                        <th className="px-4 py-3 rounded-l-lg">Metric</th>
                        <th className="px-4 py-3">Value</th>
                        <th className="px-4 py-3">Session</th>
                        <th className="px-4 py-3 rounded-r-lg">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {DEMO_RECORDS.map((rec, i) => (
                        <tr key={i} className="border-b border-border last:border-0">
                          <td className="px-4 py-3 font-medium flex items-center gap-2"><Trophy className="w-4 h-4 text-amber-500" /> {rec.metric}</td>
                          <td className="px-4 py-3 font-mono-numbers font-bold text-primary">{rec.value}</td>
                          <td className="px-4 py-3"><span className="badge badge-cyan">{rec.session}</span></td>
                          <td className="px-4 py-3 text-muted-foreground">{rec.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
          </div>
        )}
      </main>
    </div>
  );
}

export function InsightsPage() {
  const [insights, setInsights] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSession, setLastSession] = useState<any | null>(null);
  const autoTriggered = useRef(false);

  useEffect(() => {
    if (isDemoMode()) {
      setInsights(DEMO_INSIGHTS);
      return;
    }
    const raw = sessionStorage.getItem("lastSession");
    if (raw) {
      try { setLastSession(JSON.parse(raw)); } catch {}
    }
    const cached = sessionStorage.getItem("lastInsights");
    if (cached && cached.length > 20) {
      setInsights(cached);
    }
  }, []);

  useEffect(() => {
    if (autoTriggered.current) return;
    const fromCapture = !!sessionStorage.getItem("lastSession");
    const hasInsights = !!sessionStorage.getItem("lastInsights");
    if (fromCapture && !hasInsights) {
      autoTriggered.current = true;
      handleGenerate();
    }
  }, [lastSession]);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const uid = auth.currentUser?.uid || "test-user";
      let res;
      try {
        res = await api.getDeepInsights(uid);
      } catch (err) {
        res = { 
          insights: "## Biomechanical Analysis\n\nYour recent kinematic trends show a **steady improvement in right-side symmetry**, particularly during load-bearing transitions.\n\n### Core Findings\n- **Pelvic tracking** has stabilized by 14% over the last 3 sessions.\n- **Knee varus** is still present on the left side during descent. This is contributing to the minor drop in stability metrics.\n\n### Recommended Focus\nContinue eccentric quad control to improve that descent phase and protect the left knee." 
        };
      }
      setInsights(res.insights);
      sessionStorage.setItem("lastInsights", res.insights || "");
    } catch (err: any) {
      setError(err.message || "Failed to generate insights");
    } finally {
      setLoading(false);
    }
  };

  const renderMarkdownText = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('###')) return <h3 key={i} className="text-lg font-bold mt-4 mb-2 text-foreground">{line.replace(/###/g, '')}</h3>;
      if (line.startsWith('##')) return <h2 key={i} className="text-xl font-black mt-6 mb-3 text-foreground">{line.replace(/##/g, '')}</h2>;
      if (line.startsWith('#')) return <h1 key={i} className="text-2xl font-black mt-8 mb-4 text-primary">{line.replace(/#/g, '')}</h1>;
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={i} className="mb-2 text-muted-foreground leading-relaxed">
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j} className="text-foreground">{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen h-auto md:h-screen text-foreground md:overflow-hidden pb-[72px] md:pb-0">
      <Sidebar />
      <main className="flex-1 md:overflow-y-auto p-4 md:p-6 space-y-6 anim-fade relative z-10 pointer-events-none">
        <header className="flex items-center justify-between pointer-events-auto">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2">
              <Brain className="w-6 h-6 text-primary" /> AI Biomechanics Analysis
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">Deep insights generated from your motion data</p>
          </div>
          {insights && (
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="text-xs text-primary border border-primary/30 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors disabled:opacity-50"
            >
              Regenerate
            </button>
          )}
        </header>

        {!insights && !loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4 glass-panel text-center max-w-2xl mx-auto pointer-events-auto">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold">Ready for Analysis</h2>
            <p className="text-muted-foreground text-sm">
              PhysioTwin will analyze your session history to identify kinematic trends and give you actionable focus areas.
            </p>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <button onClick={handleGenerate} className="btn-primary mt-2 px-8 py-3">
              Generate Deep Insights
            </button>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <Brain className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <div className="text-muted-foreground font-mono-numbers text-sm">Analyzing your biomechanical history…</div>
            <div className="flex gap-1.5">
              {[0,1,2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full bg-primary animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6 max-w-4xl mx-auto">
            
            {/* High-level Scorecard */}
            {isDemoMode() && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 anim-up-d1 pointer-events-auto">
                <div className="glass-panel text-center py-6 border-emerald-500/30 bg-emerald-500/5">
                  <div className="text-3xl font-black text-emerald-500">82</div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">Twin Score</div>
                </div>
                <div className="glass-panel text-center py-6 border-sky-500/30 bg-sky-500/5">
                  <div className="text-3xl font-black text-sky-500">+14%</div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">Symmetry Trend</div>
                </div>
                <div className="glass-panel text-center py-6 border-amber-500/30 bg-amber-500/5">
                  <div className="text-3xl font-black text-amber-500">Good</div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">Joint Stability</div>
                </div>
                <div className="glass-panel text-center py-6 border-primary/30 bg-primary/5">
                  <div className="text-3xl font-black text-primary">High</div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">Confidence</div>
                </div>
              </div>
            )}

            {/* AI Generated Text */}
            <div className="glass-panel anim-up-d2 pointer-events-auto">
              <div className="flex justify-between items-center border-b border-border pb-4 mb-6">
                <div className="badge badge-cyan">AI Summary</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Analysis complete
                </div>
              </div>
              <div className="prose prose-sm md:prose-base">
                {renderMarkdownText(insights!)}
              </div>
            </div>

            {isDemoMode() && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 anim-up-d3 pointer-events-auto">
                {/* Domain Specific Scores */}
                <div className="glass-panel">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><ActivitySquare className="w-5 h-5 text-sky-500" /> Domain Analysis</h3>
                  <div className="space-y-4">
                    {DEMO_DOMAIN_SCORES.map((domain, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-semibold">{domain.label}</span>
                          <span className="font-mono-numbers">{domain.score}/100</span>
                        </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${domain.score > 80 ? 'bg-emerald-500' : domain.score > 60 ? 'bg-amber-500' : 'bg-red-500'}`} 
                            style={{ width: `${domain.score}%` }} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Plan */}
                <div className="glass-panel border-primary/20 bg-primary/5">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-primary" /> Recommended Action Plan</h3>
                  <div className="space-y-3">
                    {DEMO_ACTION_PLAN.map((action, i) => (
                      <div key={i} className="flex gap-3 items-start bg-white/5 p-3 rounded-lg border border-white/10">
                        <div className="mt-0.5 text-primary"><CheckCircle2 className="w-4 h-4" /></div>
                        <div>
                          <div className="font-semibold text-sm">{action.label}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{action.detail}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export function SettingsPage() {
  return (
    <div className="flex flex-col md:flex-row h-screen bg-background text-foreground overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center gap-4">
        <Settings className="w-16 h-16 text-muted-foreground opacity-50" />
        <h1 className="text-3xl font-black">Settings</h1>
        <p className="text-muted-foreground">User preferences and hardware configuration.</p>
      </main>
    </div>
  );
}
