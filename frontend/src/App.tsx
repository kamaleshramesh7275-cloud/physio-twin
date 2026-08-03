import { useState, useEffect } from 'react'
import { Link, Route, Switch, useLocation } from "wouter";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { AuthPage } from "./Auth";
import Onboarding from "./Onboarding";
import CaptureEngine from "./CaptureEngine";
import Dashboard from "./Dashboard";

function LandingPage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-grid" />

      {/* Top nav */}
      <nav className="absolute top-0 left-0 right-0 flex items-center justify-between px-8 py-5 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-xs font-black text-white shadow-md">PT</div>
          <span className="font-bold text-lg text-foreground">PhysioTwin</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Log In</Link>
          <Link href="/register" className="btn btn-primary text-xs py-2 px-5">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-6 anim-up">
        <div className="inline-flex items-center gap-2 mb-8">
          <span className="badge badge-cyan">
            <span className="pulse-dot" style={{width:'6px',height:'6px', background: 'currentColor'}} />
            AI-Powered Digital Twin
          </span>
        </div>

        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none mb-6 text-foreground">
          <span className="text-gradient">Know Your</span>
          <br />Physical Twin
        </h1>

        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-12">
          PhysioTwin builds a living digital model of your physical capability —
          detecting the moment something meaningfully changes.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/register" className="btn btn-primary py-4 px-10 text-base">Initialize Your Twin →</Link>
          <Link href="/dashboard" className="btn btn-secondary py-4 px-10 text-base">View Demo Dashboard</Link>
        </div>

        {/* Stats */}
        <div className="mt-16 md:mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-lg mx-auto anim-up-d3">
          {[
            { value: '5', label: 'Metrics Tracked', sub: 'capability domains' },
            { value: '< 5s', label: 'Analysis Time', sub: 'per session' },
            { value: '100%', label: 'Private', sub: 'on-device AI' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-black font-mono-numbers text-gradient">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">{s.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5 opacity-70">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating metric cards */}
      <div className="hidden lg:block absolute left-8 anim-up-d4" style={{top:'33%'}}>
        <div className="card p-4 w-48 bg-white/90">
          <div className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Stability</div>
          <div className="text-2xl font-black font-mono-numbers text-gradient">87.4</div>
          <div className="flex items-center gap-1 mt-2">
            <span className="text-xs text-green-600">↑ 2.3%</span>
            <span className="text-xs text-muted-foreground">vs last week</span>
          </div>
        </div>
      </div>
      <div className="hidden lg:block absolute right-8 anim-up-d4" style={{top:'45%'}}>
        <div className="card p-4 w-48 bg-white/90">
          <div className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Recovery</div>
          <div className="text-2xl font-black font-mono-numbers text-gradient">92.1</div>
          <div className="mt-2"><span className="badge badge-green">Optimal</span></div>
        </div>
      </div>
    </div>
  );
}

import { HistoryPage, TimelinePage, InsightsPage, SettingsPage } from "./DummyPages";

function App() {
  const [_user, setUser] = useState(null);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u as any));
    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/register"><AuthPage isRegister={true} /></Route>
        <Route path="/login"><AuthPage isRegister={false} /></Route>
        <Route path="/onboarding" component={Onboarding} />
        <Route path="/capture" component={CaptureEngine} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/history" component={HistoryPage} />
        <Route path="/timeline" component={TimelinePage} />
        <Route path="/insights" component={InsightsPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route>
          <div className="min-h-screen flex items-center justify-center flex-col gap-4">
            <div className="text-6xl font-black text-gradient">404</div>
            <div className="text-muted-foreground">Page not found</div>
            <Link href="/" className="btn btn-primary mt-4">Go Home</Link>
          </div>
        </Route>
      </Switch>
    </div>
  )
}

export default App
