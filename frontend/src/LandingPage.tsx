import React, { useState } from "react";
import { Link } from "wouter";
import {
  Camera,
  Activity,
  Shield,
  ArrowRight,
  Play,
  RotateCcw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  Users,
  Eye,
  FileText,
  BarChart2,
  ExternalLink,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Download
} from "lucide-react";
import { HeroRealisticTwin3D } from "./components/HeroRealisticTwin3D";

export default function LandingPage() {
  const [activeScreenTab, setActiveScreenTab] = useState<"valgus" | "acwr" | "clinical">("valgus");

  return (
    <div className="relative min-h-screen flex flex-col bg-[#09090b] text-zinc-100 antialiased selection:bg-red-500/20 selection:text-red-200">
      
      {/* Precision Top Grid Border (Subtle 1px line, no blurry neon circles) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-25 pointer-events-none" />

      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-[#09090b]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Clinical System Label */}
          <Link href="/" className="flex items-center gap-3 cursor-pointer group">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700/80 flex items-center justify-center font-mono font-bold text-xs text-white group-hover:border-red-500 transition-colors">
              PT
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-white group-hover:text-red-400 transition-colors">
                  PhysioTwin
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 font-semibold">
                  v2.4 Clinical
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono tracking-wider">
                Computer Vision Biomechanics
              </span>
            </div>
          </Link>

          {/* Core Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-mono text-zinc-400">
            <Link href="/capture" className="hover:text-white transition-colors flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-zinc-400" />
              <span>Camera Mocap</span>
            </Link>
            <Link href="/twin" className="hover:text-white transition-colors flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-red-400" />
              <span>3D Digital Twin</span>
            </Link>
            <Link href="/simulator" className="hover:text-white transition-colors flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-zinc-400" />
              <span>Workload Simulator</span>
            </Link>
            <Link href="/coach" className="hover:text-white transition-colors flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-zinc-400" />
              <span>Squad Triage</span>
            </Link>
            <Link href="/review?id=PT-84920" className="hover:text-white transition-colors flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-zinc-400" />
              <span>Clinical Clearance</span>
            </Link>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-mono text-zinc-400 hover:text-white px-3 py-1.5 rounded-md hover:bg-zinc-800/60 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/capture"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-semibold shadow-sm transition-all"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Start Screen</span>
            </Link>
          </div>

        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1">
        <section className="pt-16 pb-12 md:pt-24 md:pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Clinical Specification Pill */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span>Markerless 3D Joint Tracking</span>
              <span className="text-zinc-600">/</span>
              <span className="text-zinc-300">Zero Wearables Required</span>
            </div>
          </div>

          {/* Clear, High-Conviction Headline */}
          <div className="text-center max-w-4xl mx-auto space-y-5">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
              Clinical movement screening <br className="hidden sm:inline" />
              from any standard 60fps camera.
            </h1>

            <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              PhysioTwin captures sub-millimeter joint kinematics directly in your browser. 
              Screen for knee valgus, calculate lumbar shear moments, and monitor training 
              workloads before micro-tears turn into season-ending injuries.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2 font-mono">
              <Link
                href="/capture"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Launch Live Camera Mocap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <Link
                href="/twin"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 hover:text-white text-xs font-medium transition-all cursor-pointer"
              >
                <Activity className="w-4 h-4 text-red-400" />
                <span>Explore 3D Digital Twin</span>
              </Link>

              <Link
                href="/review?id=PT-84920"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-medium transition-all cursor-pointer"
              >
                <FileText className="w-4 h-4 text-zinc-500" />
                <span>View Sample Patient Report</span>
              </Link>
            </div>
          </div>

          {/* Real Workstation Container: 3D Twin & Diagnostic Studio */}
          <div className="mt-12 md:mt-16">
            <HeroRealisticTwin3D />
          </div>

        </section>

        {/* Diagnostic Spec Bar (Authentic Engineering Specs) */}
        <section className="border-y border-zinc-800/80 bg-zinc-950/60 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-zinc-400 font-mono text-xs">
              
              <div className="border-l border-zinc-800 pl-4 space-y-1">
                <div className="text-white font-bold text-sm flex items-center gap-1.5">
                  <span>60–120 FPS</span>
                  <span className="text-[10px] text-zinc-500 font-normal">SAMPLING</span>
                </div>
                <p className="text-zinc-500 text-[11px] leading-snug">
                  1€ Filter jitter suppression minimizes velocity noise across rapid deceleration.
                </p>
              </div>

              <div className="border-l border-zinc-800 pl-4 space-y-1">
                <div className="text-white font-bold text-sm flex items-center gap-1.5">
                  <span>33 Landmarks</span>
                  <span className="text-[10px] text-zinc-500 font-normal">3D RIG</span>
                </div>
                <p className="text-zinc-500 text-[11px] leading-snug">
                  Sub-millimeter spatial tracking across sagittal, frontal, and transverse planes.
                </p>
              </div>

              <div className="border-l border-zinc-800 pl-4 space-y-1">
                <div className="text-white font-bold text-sm flex items-center gap-1.5">
                  <span>Hill MTU Model</span>
                  <span className="text-[10px] text-zinc-500 font-normal">sEMG</span>
                </div>
                <p className="text-zinc-500 text-[11px] leading-snug">
                  Estimates vastus medialis vs lateralis co-contraction without surface electrodes.
                </p>
              </div>

              <div className="border-l border-zinc-800 pl-4 space-y-1">
                <div className="text-white font-bold text-sm flex items-center gap-1.5">
                  <span>Gabbett ACWR</span>
                  <span className="text-[10px] text-zinc-500 font-normal">WORKLOAD</span>
                </div>
                <p className="text-zinc-500 text-[11px] leading-snug">
                  Calculates 7-day acute fatigue vs 28-day chronic capacity to preempt injury spikes.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* Clinical Workflow Sections (Real Software Capabilities, Not AI Bento Cards) */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          <div className="max-w-2xl space-y-2">
            <h2 className="text-xs font-mono uppercase tracking-widest text-red-400 font-bold">
              Complete Assessment Workflow
            </h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              From webcam capture to orthopedic sign-off.
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Designed for collegiate athletic training rooms, physical therapy practices, and high-performance teams.
            </p>
          </div>

          {/* Workflow Step 1: Real Movement Assessment Screen */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-t border-zinc-800/80 pt-12">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                01 / Real-Time Screening
              </span>
              <h4 className="text-xl font-bold text-white">
                Live Joint Telemetry & Valgus Drift Detection
              </h4>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Step back from your laptop or tablet webcam. PhysioTwin benchmarks your movement pattern 
                against established orthopedic norms in real time. If your knee collapses inward during 
                squat descent or jump landing, the system flags the exact millimeter deviation and angular velocity.
              </p>
              <div className="space-y-2 pt-2 text-xs font-mono text-zinc-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Knee Abduction Moment (KAM) calculated at 120Hz</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Sub-frame audio feedback when form breaks threshold</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Zero lag: 100% computed on device via WebAssembly</span>
                </div>
              </div>
            </div>

            {/* Realistic UI Mockup: Live Camera Analysis Window */}
            <div className="lg:col-span-7 rounded-2xl bg-zinc-950 border border-zinc-800 p-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 mb-4 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-white font-bold">Live Assessment Stream</span>
                  <span className="text-zinc-500">60 FPS · 1080p</span>
                </div>
                <span className="text-emerald-400 font-bold">Calibration Verified</span>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase">L. Knee Valgus</div>
                  <div className="text-base font-mono font-bold text-red-400">+4.2 cm (Inward)</div>
                  <div className="text-[10px] font-mono text-red-400/80 mt-0.5">Threshold: 2.0 cm</div>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase">Trunk Angle</div>
                  <div className="text-base font-mono font-bold text-white">24° Inclination</div>
                  <div className="text-[10px] font-mono text-emerald-400 mt-0.5">Within Normal ROM</div>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase">ACL Strain Est.</div>
                  <div className="text-base font-mono font-bold text-amber-400">7.8% (Elevated)</div>
                  <div className="text-[10px] font-mono text-zinc-400 mt-0.5">Peak at 82° Flexion</div>
                </div>
              </div>

              {/* Progress bar and timeline */}
              <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/60 flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-400">Movement Phase: Deceleration / Bottom Reversal</span>
                <Link href="/capture" className="text-red-400 hover:text-red-300 font-bold flex items-center gap-1 cursor-pointer">
                  <span>Open Vision Scanner</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Workflow Step 2: Squad ACWR & Injury Risk Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-t border-zinc-800/80 pt-12">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                02 / Athletic Training Room
              </span>
              <h4 className="text-xl font-bold text-white">
                Squad Workload & Gabbett ACWR Triage
              </h4>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Head coaches and athletic trainers can monitor an entire team on a unified dashboard. 
                PhysioTwin tracks acute 7-day training strain relative to 28-day chronic adaptation, 
                immediately flagging athletes whose workload spikes past the 1.5 danger threshold.
              </p>
              <div className="space-y-2 pt-2 text-xs font-mono text-zinc-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Automated 2D Gabbett Workload Matrix plotting</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>One-click bulk deload and corrective exercise prescriptions</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Comparative twin overlays for bilateral asymmetry</span>
                </div>
              </div>
            </div>

            {/* Realistic UI Mockup: Squad Roster Table */}
            <div className="lg:col-span-7 rounded-2xl bg-zinc-950 border border-zinc-800 p-4 shadow-xl overflow-x-auto">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 mb-3 text-xs font-mono">
                <div className="flex items-center gap-2 text-white font-bold">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span>Varsity Track & Field — Triage Matrix</span>
                </div>
                <span className="text-zinc-500">18 Athletes Active</span>
              </div>

              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="text-zinc-500 border-b border-zinc-800 text-[10px] uppercase">
                    <th className="pb-2">Athlete</th>
                    <th className="pb-2">Position</th>
                    <th className="pb-2">7D Load</th>
                    <th className="pb-2">ACWR</th>
                    <th className="pb-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  <tr>
                    <td className="py-2.5 font-bold text-white">Kamalesh R.</td>
                    <td className="py-2.5 text-zinc-400">Sprinter (100m)</td>
                    <td className="py-2.5 text-zinc-300">740 AU</td>
                    <td className="py-2.5 font-bold text-red-400">1.68 (Spike)</td>
                    <td className="py-2.5 text-right">
                      <span className="px-2 py-0.5 rounded bg-red-950/60 text-red-300 border border-red-500/30 text-[10px]">
                        Deload Advised
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold text-white">Elena Vance</td>
                    <td className="py-2.5 text-zinc-400">Mid-Distance</td>
                    <td className="py-2.5 text-zinc-300">510 AU</td>
                    <td className="py-2.5 font-bold text-emerald-400">1.08 (Sweet Spot)</td>
                    <td className="py-2.5 text-right">
                      <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 text-[10px]">
                        Cleared Full Load
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold text-white">Marcus Thorne</td>
                    <td className="py-2.5 text-zinc-400">Hurdles (400m)</td>
                    <td className="py-2.5 text-zinc-300">620 AU</td>
                    <td className="py-2.5 font-bold text-amber-400">1.34 (Caution)</td>
                    <td className="py-2.5 text-right">
                      <span className="px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-500/30 text-[10px]">
                        Watch L. Hamstring
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-500">Updated 4 minutes ago via wearable sync</span>
                <Link href="/coach" className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer">
                  <span>Open Squad Portal</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Workflow Step 3: Orthopedic Clearance & Remote Review */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-t border-zinc-800/80 pt-12">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                03 / Clinical Clearance
              </span>
              <h4 className="text-xl font-bold text-white">
                Zero-Login Doctor Review & Return-To-Play
              </h4>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                When an athlete sustains an incident or is completing post-operative rehabilitation, 
                share a secure, tokenized review URL directly with the team physician or orthopedic surgeon. 
                Doctors scrub the exact 60-frame flight window without needing an account or login.
              </p>
              <div className="space-y-2 pt-2 text-xs font-mono text-zinc-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Frame-by-frame joint angle scrubber with kinetic overlays</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Digital sign-off with timestamped clinical clearance notes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Exportable PDF summary for electronic health records (EHR)</span>
                </div>
              </div>
            </div>

            {/* Realistic UI Mockup: Doctor Review Card */}
            <div className="lg:col-span-7 rounded-2xl bg-zinc-950 border border-zinc-800 p-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 mb-4 text-xs font-mono">
                <div>
                  <div className="text-white font-bold">Case #PT-84920 — Post-Op ACL Clearance</div>
                  <div className="text-zinc-500 text-[11px]">Subject: Male, 22y · 6 Months Post-Reconstruction</div>
                </div>
                <span className="px-2.5 py-1 rounded bg-purple-950/60 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                  Review Requested
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2 mb-4">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400">Return-to-Play Criteria Benchmark:</span>
                  <span className="text-emerald-400 font-bold">4 of 5 Criteria Met</span>
                </div>
                <div className="space-y-1.5 text-xs font-mono text-zinc-300">
                  <div className="flex items-center justify-between">
                    <span>Bilateral Quad Symmetry Index (&gt;90%)</span>
                    <span className="text-emerald-400 font-bold">92.4% (Pass)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Single-Leg Hop Test Distance Symmetry</span>
                    <span className="text-emerald-400 font-bold">94.1% (Pass)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Dynamic Knee Valgus under 15° at peak landing</span>
                    <span className="text-amber-400 font-bold">13.8° (Borderline)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 text-xs font-mono">
                <span className="text-zinc-500">Sign-off: Dr. S. K. Henderson, MD (Orthopedics)</span>
                <Link href="/review?id=PT-84920" className="text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 cursor-pointer">
                  <span>View Review Portal</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

        </section>

        {/* Privacy & Compliance Section (Clinical Grade, Non-AI) */}
        <section className="border-t border-zinc-800/80 bg-zinc-950/80 py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-zinc-800 bg-[#09090b] p-6 md:p-8 space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>On-Device Privacy & Zero Cloud Video Storage</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Camera video stays on your machine. We only save coordinate metadata.
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Traditional motion capture systems require massive cloud server uploads of uncompressed video files. 
                PhysioTwin runs entirely inside your browser using client-side WebAssembly. Video frames are processed 
                in volatile memory on your GPU and immediately discarded. No video is ever stored, streamed, or uploaded 
                to external servers.
              </p>
              <div className="flex flex-wrap gap-4 pt-2 text-xs font-mono text-zinc-300">
                <span className="px-3 py-1 rounded bg-zinc-900 border border-zinc-800">
                  100% In-Browser Inference
                </span>
                <span className="px-3 py-1 rounded bg-zinc-900 border border-zinc-800">
                  HIPAA-Aligned Architecture
                </span>
                <span className="px-3 py-1 rounded bg-zinc-900 border border-zinc-800">
                  Zero Video Server Ingestion
                </span>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Clean Engineering Footer */}
      <footer className="w-full border-t border-zinc-800/80 bg-[#09090b] py-12 text-zinc-500 text-xs font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            
            <div className="col-span-2 space-y-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <span className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-300">PT</span>
                <span>PhysioTwin Biomechanics</span>
              </div>
              <p className="text-zinc-400 text-xs max-w-sm leading-relaxed">
                Computer vision motion analysis and digital twin modeling for athletic training, 
                orthopedics, and clinical physical therapy.
              </p>
              <div className="text-[11px] text-zinc-500">
                System Status: <span className="text-emerald-400 font-bold">Operational (60–120Hz Engine Active)</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-white font-bold uppercase text-[11px] tracking-wider">Platform</div>
              <ul className="space-y-1.5 text-zinc-400">
                <li><Link href="/capture" className="hover:text-white transition-colors">Vision Capture</Link></li>
                <li><Link href="/twin" className="hover:text-white transition-colors">3D Digital Twin</Link></li>
                <li><Link href="/simulator" className="hover:text-white transition-colors">What-If Simulator</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Telemetry Dashboard</Link></li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="text-white font-bold uppercase text-[11px] tracking-wider">Clinical & Squad</div>
              <ul className="space-y-1.5 text-zinc-400">
                <li><Link href="/coach" className="hover:text-white transition-colors">Coach Squad Triage</Link></li>
                <li><Link href="/review?id=PT-84920" className="hover:text-white transition-colors">Doctor Review Portal</Link></li>
                <li><Link href="/wiki" className="hover:text-white transition-colors">Kinematic Documentation</Link></li>
                <li><Link href="/demo" className="hover:text-white transition-colors">Sample Athlete File</Link></li>
              </ul>
            </div>

          </div>

          <div className="pt-6 border-t border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-500">
            <div>
              &copy; {new Date().getFullYear()} PhysioTwin Technologies. All rights reserved.
            </div>
            <div className="flex items-center gap-6">
              <span>Security Protocols</span>
              <span>Data Privacy</span>
              <span>EHR Integration</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
