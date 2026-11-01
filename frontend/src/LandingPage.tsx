import React, { useState } from "react";
import { Link } from "wouter";
import {
  Activity,
  Zap,
  Shield,
  ShieldAlert,
  ArrowRight,
  Play,
  RotateCcw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Flame,
  Stethoscope,
  Users,
  Layers,
  ChevronRight,
  ExternalLink,
  Lock,
  Sparkles,
  BarChart3,
  Eye,
  GitBranch
} from "lucide-react";
import { HeroTelemetryPreview } from "./components/HeroTelemetryPreview";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<"valgus" | "lumbar" | "acwr">("valgus");

  return (
    <div className="relative min-h-screen flex flex-col bg-[#09090b] text-zinc-100 overflow-x-hidden selection:bg-red-500/30 selection:text-red-200">
      
      {/* Background ambient radial glow accents */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[850px] h-[500px] bg-red-600/10 blur-[140px] rounded-full" />
        <div className="absolute top-[40%] -right-40 w-[600px] h-[600px] bg-emerald-600/5 blur-[160px] rounded-full" />
        <div className="absolute top-[75%] -left-40 w-[600px] h-[600px] bg-red-600/5 blur-[160px] rounded-full" />
      </div>

      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-[#09090b]/85 backdrop-blur-xl transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Version Pill */}
          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-xs font-black text-black shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              PT
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white group-hover:text-red-400 transition-colors">
                  PhysioTwin
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                  V2.0
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono tracking-wider uppercase">
                Digital Biomechanics
              </span>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <div className="hidden md:flex items-center gap-1 font-mono text-xs text-zinc-300">
            <Link 
              href="/twin" 
              className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-zinc-800/60 transition-all flex items-center gap-1.5"
            >
              <Cpu className="w-3.5 h-3.5 text-red-400" />
              <span>3D Digital Twin</span>
            </Link>
            <Link 
              href="/simulator" 
              className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-zinc-800/60 transition-all flex items-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span>What-If Simulator</span>
            </Link>
            <Link 
              href="/coach" 
              className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-zinc-800/60 transition-all flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>Coach Squad Matrix</span>
            </Link>
            <Link 
              href="/review?id=PT-84920" 
              className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-zinc-800/60 transition-all flex items-center gap-1.5"
            >
              <Stethoscope className="w-3.5 h-3.5 text-purple-400" />
              <span>Doctor Review</span>
            </Link>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <Link 
              href="/login" 
              className="text-xs font-mono font-medium text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-zinc-800/50 transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/demo" 
              className="relative inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-lg shadow-red-900/40 hover:shadow-red-800/60 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Play className="w-3 h-3 fill-white" />
              <span>Launch Demo</span>
            </Link>
          </div>

        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-20 md:pt-24 md:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Announcement Pill */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 shadow-xl backdrop-blur-md hover:border-red-500/40 transition-colors">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-300">
              Edge-Computed Musculoskeletal Twin
            </span>
            <span className="text-[10px] font-mono bg-red-500/20 text-red-400 px-2 py-0.5 rounded font-bold border border-red-500/30">
              120Hz Mocap
            </span>
          </div>
        </div>

        {/* Main Headline */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] text-white">
            Your Musculoskeletal System,{" "}
            <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-400 to-amber-300">
              Digitized in Real-Time 3D.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-zinc-400 max-w-2xl mx-auto font-sans leading-relaxed">
            Sub-frame 120Hz kinematics, non-linear Virtual sEMG, and counterfactual load forecasting—powered 
            entirely by client-side edge AI without a single physical wearable sensor.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3.5 justify-center items-center pt-4">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold text-sm shadow-xl shadow-red-900/50 hover:shadow-red-700/60 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>Initialize Your Twin</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>

            <Link
              href="/twin"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/60 text-zinc-200 hover:text-white font-medium text-sm transition-all cursor-pointer"
            >
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>Explore 3D Twin Viewer</span>
            </Link>

            <Link
              href="/simulator"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/60 text-zinc-200 hover:text-white font-medium text-sm transition-all cursor-pointer"
            >
              <Sliders className="w-4 h-4 text-red-400" />
              <span>What-If Simulator</span>
            </Link>
          </div>
        </div>

        {/* Embedded Interactive Telemetry Hardware Simulation */}
        <div className="mt-14 md:mt-18">
          <HeroTelemetryPreview />
        </div>

      </section>

      {/* Quantitative Proof Strip */}
      <section className="relative z-10 border-y border-zinc-800/80 bg-zinc-950/70 py-10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            
            <div className="space-y-1 border-l-2 border-red-500 pl-4">
              <div className="text-3xl md:text-4xl font-mono font-black text-white tracking-tight flex items-baseline gap-1">
                120 <span className="text-sm font-normal text-red-400 uppercase">Hz</span>
              </div>
              <p className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                Sub-Frame Kinematics
              </p>
              <p className="text-[11px] text-zinc-500 leading-snug">
                EuroFilter jitter suppression with sub-millimeter joint reconstruction.
              </p>
            </div>

            <div className="space-y-1 border-l-2 border-emerald-500 pl-4">
              <div className="text-3xl md:text-4xl font-mono font-black text-white tracking-tight">
                0 <span className="text-sm font-normal text-emerald-400 uppercase">Sensors</span>
              </div>
              <p className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                Zero Wearables Needed
              </p>
              <p className="text-[11px] text-zinc-500 leading-snug">
                Runs on standard 1080p webcam at 60-120fps with zero latency.
              </p>
            </div>

            <div className="space-y-1 border-l-2 border-blue-500 pl-4">
              <div className="text-3xl md:text-4xl font-mono font-black text-white tracking-tight">
                10 <span className="text-sm font-normal text-blue-400 uppercase">MTUs</span>
              </div>
              <p className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                Virtual sEMG Channels
              </p>
              <p className="text-[11px] text-zinc-500 leading-snug">
                Hill muscle-tendon models computing real-time fiber activation without electrodes.
              </p>
            </div>

            <div className="space-y-1 border-l-2 border-purple-500 pl-4">
              <div className="text-3xl md:text-4xl font-mono font-black text-white tracking-tight">
                1-Click
              </div>
              <p className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                Doctor Review Portal
              </p>
              <p className="text-[11px] text-zinc-500 leading-snug">
                Instant tokenized medical review with full scrubbable telemetry flights.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Bento Grid: 6 Flagship Engines */}
      <section className="relative z-10 py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 font-mono text-xs uppercase tracking-wider">
            Flagship Architecture
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Six Engines. One Living Bio-Digital Twin.
          </h2>
          <p className="text-sm sm:text-base text-zinc-400">
            Engineered for high-performance collegiate and professional athletics, orthopedic clinics, and biomechanics researchers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Engine 1: 3D Twin Mirroring & Ghost Superposition */}
          <div className="group rounded-3xl bg-zinc-900/60 border border-zinc-800/80 p-6 md:p-8 hover:border-red-500/50 hover:bg-zinc-900/90 transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest font-bold">
                  Engine 01
                </span>
                <h3 className="text-xl font-bold text-white tracking-tight mt-1">
                  Live 3D Twin & Ghost Superposition
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Superimpose ideal biomechanical baseline movement vectors over live webcam capture. 
                Color-coded kinetic heatmaps immediately flag valgus drift and posture asymmetry in real-time.
              </p>
            </div>

            <div className="pt-4 border-t border-zinc-800/60 flex items-center justify-between">
              <Link 
                href="/twin" 
                className="text-xs font-mono text-red-400 hover:text-red-300 font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>Launch 3D Twin Viewer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <span className="text-[10px] font-mono text-zinc-500">Three.js + EuroFilter</span>
            </div>
          </div>

          {/* Engine 2: Virtual sEMG Engine */}
          <div className="group rounded-3xl bg-zinc-900/60 border border-zinc-800/80 p-6 md:p-8 hover:border-emerald-500/50 hover:bg-zinc-900/90 transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold">
                  Engine 02
                </span>
                <h3 className="text-xl font-bold text-white tracking-tight mt-1">
                  Non-Linear Virtual sEMG
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Computes muscle fiber activation, tendon excursion, and co-contraction ratios using Hill-type 
                musculotendon dynamics. Monitor VMO:VL imbalance and hamstring-to-quadriceps fatigue.
              </p>
            </div>

            <div className="pt-4 border-t border-zinc-800/60 flex items-center justify-between">
              <span className="text-xs font-mono text-emerald-400 font-bold">
                10 Hill MTUs Active
              </span>
              <span className="text-[10px] font-mono text-zinc-500">Zero Electrodes</span>
            </div>
          </div>

          {/* Engine 3: Forensic Autopsy Flight Recorder */}
          <div className="group rounded-3xl bg-zinc-900/60 border border-zinc-800/80 p-6 md:p-8 hover:border-purple-500/50 hover:bg-zinc-900/90 transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest font-bold">
                  Engine 03
                </span>
                <h3 className="text-xl font-bold text-white tracking-tight mt-1">
                  120Hz Forensic Incident Autopsy
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Ring-buffer flight recorder capturing the exact ±30 frames surrounding an acute strain event. 
                Step through frame-by-frame kinematics to identify root-cause mechanical failure.
              </p>
            </div>

            <div className="pt-4 border-t border-zinc-800/60 flex items-center justify-between">
              <Link 
                href="/review?id=PT-84920" 
                className="text-xs font-mono text-purple-400 hover:text-purple-300 font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>Scrub Incident Flight</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <span className="text-[10px] font-mono text-zinc-500">60-Frame Window</span>
            </div>
          </div>

          {/* Engine 4: What-If Counterfactual Simulator */}
          <div className="group rounded-3xl bg-zinc-900/60 border border-zinc-800/80 p-6 md:p-8 hover:border-red-500/50 hover:bg-zinc-900/90 transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
                <Sliders className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest font-bold">
                  Engine 04
                </span>
                <h3 className="text-xl font-bold text-white tracking-tight mt-1">
                  What-If Counterfactual Simulator
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Stress-test upcoming training sessions before touching a barbell. Adjust volume, intensity, sleep, 
                and hydration to model ACL strain, L4-L5 shear, and next-day recovery penalties.
              </p>
            </div>

            <div className="pt-4 border-t border-zinc-800/60 flex items-center justify-between">
              <Link 
                href="/simulator" 
                className="text-xs font-mono text-red-400 hover:text-red-300 font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>Run Simulation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <span className="text-[10px] font-mono text-zinc-500">Banister + Hill Model</span>
            </div>
          </div>

          {/* Engine 5: Squad Triage & Gabbett ACWR */}
          <div className="group rounded-3xl bg-zinc-900/60 border border-zinc-800/80 p-6 md:p-8 hover:border-blue-500/50 hover:bg-zinc-900/90 transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest font-bold">
                  Engine 05
                </span>
                <h3 className="text-xl font-bold text-white tracking-tight mt-1">
                  Coach Portal & ACWR Squad Triage
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Monitor entire rosters on a 2D Gabbett Acute:Chronic Workload Matrix. Identify over-trained 
                athletes in the danger zone (&gt;1.5 ratio) and issue bulk corrective prescriptions with 1 click.
              </p>
            </div>

            <div className="pt-4 border-t border-zinc-800/60 flex items-center justify-between">
              <Link 
                href="/coach" 
                className="text-xs font-mono text-blue-400 hover:text-blue-300 font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>Open Coach Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <span className="text-[10px] font-mono text-zinc-500">Comparative Twin View</span>
            </div>
          </div>

          {/* Engine 6: 1-Click Clinical Clearance */}
          <div className="group rounded-3xl bg-zinc-900/60 border border-zinc-800/80 p-6 md:p-8 hover:border-amber-500/50 hover:bg-zinc-900/90 transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold">
                  Engine 06
                </span>
                <h3 className="text-xl font-bold text-white tracking-tight mt-1">
                  Remote Clinical Clearance
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Zero-login tokenized portal links allowing orthopedic surgeons and team physicians to verify 
                post-op return-to-play criteria with digital signature and protocol clearance.
              </p>
            </div>

            <div className="pt-4 border-t border-zinc-800/60 flex items-center justify-between">
              <Link 
                href="/review?id=PT-84920" 
                className="text-xs font-mono text-amber-400 hover:text-amber-300 font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>View Clinical Sign-Off</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <span className="text-[10px] font-mono text-zinc-500">Zero-Auth Sharing</span>
            </div>
          </div>

        </div>
      </section>

      {/* Interactive "See It In Action" Tabbed Demo Section */}
      <section className="relative z-10 py-16 md:py-24 border-t border-zinc-800/80 bg-zinc-950/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              See the Telemetry In Action
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Select a biomechanical movement failure below to see how PhysioTwin flags and isolates pathology.
            </p>

            {/* Tab Selectors */}
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              <button
                onClick={() => setActiveTab("valgus")}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeTab === "valgus"
                    ? "bg-red-500/20 text-red-400 border border-red-500/40 shadow-lg shadow-red-950/50"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                01. Squat Knee Valgus Collapse
              </button>

              <button
                onClick={() => setActiveTab("lumbar")}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeTab === "lumbar"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-lg shadow-emerald-950/50"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                02. Olympic Clean Lumbar Shear
              </button>

              <button
                onClick={() => setActiveTab("acwr")}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeTab === "acwr"
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/40 shadow-lg shadow-blue-950/50"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                03. Acute Workload Spike (ACWR)
              </button>
            </div>
          </div>

          {/* Dynamic Tab Content Card */}
          <div className="rounded-3xl bg-[#0c101d] border border-zinc-800 p-6 md:p-8 space-y-6">
            {activeTab === "valgus" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/30 text-xs font-mono font-bold">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>ACL Strain Spike: 8.8% (Critical)</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    Inward Medial Knee Collapse
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    At 82° of knee flexion, the left patella drifts 4.2cm inward beyond the second toe ray. 
                    The Virtual sEMG engine detects severe Gluteus Medius inhibition (28% activation) coupled 
                    with Vastus Lateralis dominance (88%).
                  </p>
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                      <div className="text-[10px] font-mono text-zinc-500 uppercase">Valgus Dev</div>
                      <div className="text-lg font-mono font-bold text-red-400">+4.2 cm</div>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                      <div className="text-[10px] font-mono text-zinc-500 uppercase">KAM Moment</div>
                      <div className="text-lg font-mono font-bold text-amber-400">48.2 Nm</div>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                      <div className="text-[10px] font-mono text-zinc-500 uppercase">Glute Medius</div>
                      <div className="text-lg font-mono font-bold text-red-400">28% (Deficit)</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5 space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-400">Kinematic Flight Window</span>
                    <span className="text-emerald-400 font-bold">Autopsy Locked</span>
                  </div>
                  <div className="h-32 w-full bg-zinc-950 rounded-xl border border-zinc-800/80 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-around px-4 opacity-40">
                      <div className="w-1 h-12 bg-zinc-700 rounded-full" />
                      <div className="w-1 h-16 bg-zinc-700 rounded-full" />
                      <div className="w-1 h-20 bg-amber-500 rounded-full" />
                      <div className="w-1.5 h-28 bg-red-500 rounded-full animate-pulse" />
                      <div className="w-1 h-20 bg-amber-500 rounded-full" />
                      <div className="w-1 h-14 bg-zinc-700 rounded-full" />
                    </div>
                    <div className="relative text-center z-10">
                      <div className="text-xs font-mono font-bold text-red-400">PEAK COLLAPSE AT T=1.42s</div>
                      <div className="text-[11px] text-zinc-400">Auto-flagged as Grade-2 Valgus Anomaly</div>
                    </div>
                  </div>
                  <Link 
                    href="/twin"
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600/20 border border-red-500/40 text-red-300 hover:text-white text-xs font-mono font-bold hover:bg-red-600/30 transition-all cursor-pointer"
                  >
                    <span>View Ghost Skeleton Overlay</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {activeTab === "lumbar" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-mono font-bold">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Lumbar Shear: 620N (High)</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    Excessive Torso Forward Inclination
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    During the catch phase of the clean, the torso pitches forward to 42° inclination. 
                    This amplifies the moment arm about the L4-L5 vertebrae, exceeding the 500N safety threshold 
                    and inducing severe erector spinae over-firing.
                  </p>
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                      <div className="text-[10px] font-mono text-zinc-500 uppercase">Torso Pitch</div>
                      <div className="text-lg font-mono font-bold text-amber-400">42°</div>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                      <div className="text-[10px] font-mono text-zinc-500 uppercase">L4-L5 Shear</div>
                      <div className="text-lg font-mono font-bold text-red-400">620 N</div>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                      <div className="text-[10px] font-mono text-zinc-500 uppercase">Erector Spinae</div>
                      <div className="text-lg font-mono font-bold text-amber-400">92%</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5 space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-400">What-If Recommendation</span>
                    <span className="text-emerald-400 font-bold">+15% Ankle Dorsiflexion</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Counterfactual simulation demonstrates that increasing ankle dorsiflexion by 5° restores an 
                    upright chest angle (24° pitch), instantly dropping lumbar shear from 620N down to 340N.
                  </p>
                  <Link 
                    href="/simulator"
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-mono font-bold hover:bg-emerald-600/30 transition-all cursor-pointer"
                  >
                    <span>Simulate Olympic Lift Load</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {activeTab === "acwr" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-mono font-bold">
                    <Activity className="w-3.5 h-3.5" />
                    <span>ACWR Ratio: 1.68 (Danger Zone)</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    Gabbett Workload Spike Detection
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    When 7-day acute workload rises abruptly relative to the 28-day chronic baseline, injury 
                    probability triples. PhysioTwin places the athlete in the high-risk quadrant of the squad matrix 
                    and triggers an automated deload recommendation.
                  </p>
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                      <div className="text-[10px] font-mono text-zinc-500 uppercase">Acute (7D)</div>
                      <div className="text-lg font-mono font-bold text-white">740 AU</div>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                      <div className="text-[10px] font-mono text-zinc-500 uppercase">Chronic (28D)</div>
                      <div className="text-lg font-mono font-bold text-zinc-400">440 AU</div>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                      <div className="text-[10px] font-mono text-zinc-500 uppercase">Injury Risk</div>
                      <div className="text-lg font-mono font-bold text-red-400">+280%</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5 space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-400">Coach Bulk Intervention</span>
                    <span className="text-blue-400 font-bold">Deload Queued</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Head athletic trainers can instantly prescribe a 30% volume reduction and corrective glute medius 
                    activation drill across all flagged athletes with a single click.
                  </p>
                  <Link 
                    href="/coach"
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-300 hover:text-white text-xs font-mono font-bold hover:bg-blue-600/30 transition-all cursor-pointer"
                  >
                    <span>Inspect Squad Triage Matrix</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* Zero Cloud Video / Privacy First Section */}
      <section className="relative z-10 py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800 p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-red-600/10 blur-[90px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" />
              <span>Edge AI & Zero Cloud Storage Architecture</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Your Video Never Leaves Your Device. Ever.
            </h2>

            <p className="text-xs sm:text-base text-zinc-400 leading-relaxed">
              Every single frame of webcam video is analyzed directly inside your browser via client-side WebAssembly 
              and WebGL shaders. No video or biometric image files are ever uploaded or stored on external cloud servers. 
              Only anonymized biomechanical joint telemetry (angles, velocities, and derived muscle activations) is 
              persisted to your digital twin.
            </p>

            <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono text-zinc-300">
              <div className="flex items-center gap-2 bg-zinc-900/90 px-3 py-1.5 rounded-lg border border-zinc-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>100% In-Browser Inference</span>
              </div>
              <div className="flex items-center gap-2 bg-zinc-900/90 px-3 py-1.5 rounded-lg border border-zinc-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>HIPAA-Aligned Zero Video Ingestion</span>
              </div>
              <div className="flex items-center gap-2 bg-zinc-900/90 px-3 py-1.5 rounded-lg border border-zinc-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>$0 Cloud Compute Cost</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modernized Stealth Footer */}
      <footer className="w-full border-t border-zinc-800/80 bg-[#070709] py-14 text-zinc-400 text-xs relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            
            {/* Col 1: Brand Info */}
            <div className="col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-xs font-black text-black">
                  PT
                </div>
                <span className="font-bold text-base text-white tracking-tight">
                  PhysioTwin
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 font-bold">
                  V2.0
                </span>
              </div>
              <p className="text-zinc-400 text-xs leading-relaxed max-w-sm">
                Advanced edge-computed musculoskeletal digital twin. Real-time sub-frame 3D joint tracking, 
                virtual sEMG modeling, and counterfactual simulation for elite athletes and clinicians.
              </p>
              <div className="text-[11px] font-mono text-zinc-500">
                Status: <span className="text-emerald-400">All 6 Biomechanical Engines Operational (120Hz)</span>
              </div>
            </div>

            {/* Col 2: Core Platform */}
            <div className="space-y-3">
              <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                Core Engines
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/twin" className="hover:text-red-400 transition-colors">
                    3D Digital Twin
                  </Link>
                </li>
                <li>
                  <Link href="/simulator" className="hover:text-red-400 transition-colors">
                    What-If Simulator
                  </Link>
                </li>
                <li>
                  <Link href="/capture" className="hover:text-red-400 transition-colors">
                    Live Vision Mocap
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-red-400 transition-colors">
                    Telemetry Dashboard
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Clinical & Teams */}
            <div className="space-y-3">
              <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                Clinical & Squad
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/coach" className="hover:text-red-400 transition-colors">
                    Coach Squad Matrix
                  </Link>
                </li>
                <li>
                  <Link href="/review?id=PT-84920" className="hover:text-red-400 transition-colors">
                    Doctor Review Portal
                  </Link>
                </li>
                <li>
                  <Link href="/demo" className="hover:text-red-400 transition-colors">
                    Sample Athlete File
                  </Link>
                </li>
                <li>
                  <Link href="/wiki" className="hover:text-red-400 transition-colors">
                    Biomechanics Documentation
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 4: Architecture */}
            <div className="space-y-3">
              <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                Biomechanics Specs
              </h4>
              <ul className="space-y-2 font-mono text-[11px] text-zinc-500">
                <li>EuroFilter Smoothing</li>
                <li>Hill Muscle-Tendon Model</li>
                <li>120Hz Autopsy Flight Ring</li>
                <li>Gabbett ACWR Matrix</li>
                <li>Zero-Cloud Video Privacy</li>
              </ul>
            </div>

          </div>

          <div className="pt-8 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
            <div>
              &copy; {new Date().getFullYear()} PhysioTwin Digital Biomechanics Inc. All rights reserved.
            </div>
            <div className="flex items-center gap-6">
              <span className="hover:text-zinc-300 cursor-pointer">Privacy Architecture</span>
              <span className="hover:text-zinc-300 cursor-pointer">Clinical Protocols</span>
              <span className="hover:text-zinc-300 cursor-pointer">Security Whitepaper</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
