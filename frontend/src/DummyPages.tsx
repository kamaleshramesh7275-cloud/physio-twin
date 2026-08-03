import { Link } from "wouter";
import { useState, useEffect } from "react";
import { Activity, Camera, History, Clock, Brain, Settings } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { api } from "./api";
import { auth } from "./firebase";

function NavItem({ icon, label, href, active }: { icon: React.ReactNode; label: string; href: string; active?: boolean }) {
  return (
    <Link href={href} className={`nav-link flex-col md:flex-row items-center justify-center min-w-[72px] md:min-w-0 px-1 md:px-3 py-2 ${active ? 'active' : ''}`}>
      <span className={`mb-1 md:mb-0 ${active ? 'text-primary' : 'text-muted-foreground'}`}>{icon}</span>
      <span className="text-[10px] md:text-sm whitespace-nowrap">{label}</span>
    </Link>
  );
}

function Sidebar({ activeTab }: { activeTab: string }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md md:relative md:w-60 flex md:flex-col border-t md:border-t-0 md:border-r border-border p-2 md:p-4 shrink-0 shadow-[0_-4px_10px_-2px_rgba(0,0,0,0.05)] md:shadow-none h-[72px] md:h-auto overflow-x-auto md:overflow-visible">
      <div className="hidden md:flex items-center gap-2 px-2 mb-8 mt-2">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-xs font-black text-white shadow-md">PT</div>
        <span className="font-black text-lg tracking-tight">PhysioTwin</span>
      </div>
      <div className="flex justify-between md:justify-start md:flex-col w-full md:w-auto md:space-y-1 flex-1">
        <NavItem icon={<Activity className="w-5 h-5 md:w-5 md:h-5" />} label="Dashboard" href="/dashboard" active={activeTab === 'dashboard'} />
        <NavItem icon={<Camera className="w-5 h-5 md:w-5 md:h-5" />} label="Capture" href="/capture" active={activeTab === 'capture'} />
        <NavItem icon={<History className="w-5 h-5 md:w-5 md:h-5" />} label="History" href="/history" active={activeTab === 'history'} />
        <NavItem icon={<Clock className="w-5 h-5 md:w-5 md:h-5" />} label="Timeline" href="/timeline" active={activeTab === 'timeline'} />
        <NavItem icon={<Brain className="w-5 h-5 md:w-5 md:h-5" />} label="Insights" href="/insights" active={activeTab === 'insights'} />
        <NavItem icon={<Settings className="w-5 h-5 md:w-5 md:h-5" />} label="Settings" href="/settings" active={activeTab === 'settings'} />
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
  );
}

export function HistoryPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const uid = auth.currentUser?.uid || "test-user";
        const data = await api.getSessionHistory(uid);
        setSessions(data);
      } catch (err) {
        console.error("Error fetching history", err);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  return (
    <div className="flex flex-col md:flex-row min-h-screen h-auto md:h-screen bg-background text-foreground md:overflow-hidden pb-[72px] md:pb-0">
      <Sidebar activeTab="history" />
      <main className="flex-1 md:overflow-y-auto p-4 md:p-6 space-y-6">
        <header>
          <h1 className="text-2xl font-black flex items-center gap-2"><History className="w-6 h-6 text-primary" /> Session History</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Your past physical capability logs</p>
        </header>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4 card bg-card/50">
            <History className="w-12 h-12 text-muted-foreground opacity-30" />
            <div className="text-muted-foreground">No sessions recorded yet.</div>
            <Link href="/capture" className="btn-primary mt-2">Start a Session</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sessions.map((session, i) => (
              <div key={session.id} className="card hover:border-primary/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="font-bold text-lg">{session.task_type}</div>
                    <div className="text-xs text-muted-foreground">{new Date(session.timestamp).toLocaleString()}</div>
                  </div>
                  <div className="badge badge-cyan">Session #{sessions.length - i}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Range of Motion</div>
                    <div className="font-mono-numbers font-bold text-xl">{session.rom.toFixed(1)}°</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Symmetry</div>
                    <div className="font-mono-numbers font-bold text-xl">{(session.symmetry * 100).toFixed(0)}%</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Speed (Reps/Min)</div>
                    <div className="font-mono-numbers font-bold text-xl">{session.movement_speed.toFixed(1)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Stability</div>
                    <div className="font-mono-numbers font-bold text-xl">{(session.stability * 100).toFixed(0)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export function TimelinePage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const uid = auth.currentUser?.uid || "test-user";
        const data = await api.getSessionHistory(uid);
        
        // Reverse data so oldest is first on the chart
        const chartData = data.reverse().map((s: any, idx: number) => ({
          name: `S${idx + 1}`,
          date: new Date(s.timestamp).toLocaleDateString(),
          rom: parseFloat(s.rom.toFixed(1)),
          symmetry: parseFloat((s.symmetry * 100).toFixed(0)),
          speed: parseFloat(s.movement_speed.toFixed(1))
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

  return (
    <div className="flex flex-col md:flex-row min-h-screen h-auto md:h-screen bg-background text-foreground md:overflow-hidden pb-[72px] md:pb-0">
      <Sidebar activeTab="timeline" />
      <main className="flex-1 md:overflow-y-auto p-4 md:p-6 space-y-6">
        <header>
          <h1 className="text-2xl font-black flex items-center gap-2"><Clock className="w-6 h-6 text-primary" /> Twin Timeline</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Visualize your capability progression</p>
        </header>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : sessions.length < 2 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4 card bg-card/50">
            <Clock className="w-12 h-12 text-muted-foreground opacity-30" />
            <div className="text-muted-foreground">Record at least 2 sessions to see your timeline.</div>
            <Link href="/capture" className="btn-primary mt-2">Start a Session</Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="card">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Range of Motion (° degrees)</div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sessions}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#94a3b8" domain={['auto', 'auto']} tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <Line type="monotone" dataKey="rom" name="Range of Motion" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Kinematic Symmetry (%)</div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sessions}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#94a3b8" domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <Line type="monotone" dataKey="symmetry" name="Symmetry" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
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

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const uid = auth.currentUser?.uid || "test-user";
      const res = await api.getDeepInsights(uid);
      setInsights(res.insights);
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
      
      // Basic bold parsing
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
    <div className="flex flex-col md:flex-row min-h-screen h-auto md:h-screen bg-background text-foreground md:overflow-hidden pb-[72px] md:pb-0">
      <Sidebar activeTab="insights" />
      <main className="flex-1 md:overflow-y-auto p-4 md:p-6 space-y-6">
        <header>
          <h1 className="text-2xl font-black flex items-center gap-2"><Brain className="w-6 h-6 text-primary" /> AI Biomechanics Analysis</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Deep insights generated from your motion data</p>
        </header>

        {!insights && !loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4 card bg-card/50 text-center max-w-2xl mx-auto mt-12">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold">Ready for Analysis</h2>
            <p className="text-muted-foreground text-sm">PhysioTwin will analyze your historical Sit-to-Stand sessions to identify Kinematic Trends and provide actionable focus areas for your next workout.</p>
            
            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
            
            <button onClick={handleGenerate} className="btn-primary mt-4 px-8 py-3">
              Generate Deep Insights
            </button>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <Brain className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <div className="text-muted-foreground font-mono-numbers">Analyzing biomechanical history...</div>
          </div>
        ) : (
          <div className="card max-w-4xl mx-auto anim-fade">
            <div className="flex justify-between items-center border-b border-border pb-4 mb-6">
              <div className="badge badge-cyan">AI Generated Report</div>
              <button onClick={handleGenerate} className="text-xs text-primary hover:underline">Regenerate</button>
            </div>
            <div className="prose prose-sm md:prose-base dark:prose-invert">
              {renderMarkdownText(insights!)}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export function SettingsPage() {
  return (
    <div className="flex flex-col md:flex-row h-screen bg-background text-foreground overflow-hidden">
      <Sidebar activeTab="settings" />
      <main className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center gap-4">
        <Settings className="w-16 h-16 text-muted-foreground opacity-50" />
        <h1 className="text-3xl font-black">Settings</h1>
        <p className="text-muted-foreground">User preferences and hardware configuration.</p>
      </main>
    </div>
  );
}
