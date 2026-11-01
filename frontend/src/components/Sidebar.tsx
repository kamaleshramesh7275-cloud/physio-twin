import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Activity, Camera, History, Brain, User, BarChart2, 
  LineChart, Users, Building, Pill, HeartPulse, BrainCircuit, 
  Trophy, Apple, Dumbbell, Share2, Stethoscope, FileText, Search, 
  Sparkles, Target, LogOut, ChevronRight
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { auth } from "../firebase";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
  tag?: string;
}

function NavItem({ icon, label, href, active, tag }: NavItemProps) {
  return (
    <Link 
      href={href} 
      className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
        active 
          ? 'bg-[#0e2730] text-[#38bdf8] border border-[#155e75]/60 shadow-sm' 
          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className={`shrink-0 transition-colors ${active ? 'text-[#38bdf8]' : 'text-slate-400 group-hover:text-slate-200'}`}>
          {icon}
        </span>
        <span className="truncate">{label}</span>
      </div>

      {tag && (
        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
          {tag}
        </span>
      )}
    </Link>
  );
}

function NavSection({ title }: { title: string }) {
  return (
    <div className="pt-5 pb-2 px-3">
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{title}</span>
    </div>
  );
}

export function Sidebar() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSignOut = async () => {
    try {
      if (auth.currentUser) {
        await auth.signOut();
      }
      setLocation("/login");
    } catch {
      setLocation("/login");
    }
  };

  const navItems = [
    // CORE
    { section: "CORE", label: "Dashboard", href: "/dashboard", icon: <Activity className="w-4 h-4" /> },
    { section: "CORE", label: "3D Digital Twin", href: "/twin", icon: <User className="w-4 h-4" /> },
    { section: "CORE", label: "What-If Simulator", href: "/simulator", icon: <Target className="w-4 h-4 text-emerald-400" />, tag: "NEW" },
    { section: "CORE", label: "Live Vision Mocap", href: "/capture", icon: <Camera className="w-4 h-4 text-cyan-400" /> },

    // HEALTH & TRAINING
    { section: "HEALTH & TRAINING", label: "Nutrition & Recovery", href: "/nutrition-recovery", icon: <Apple className="w-4 h-4" /> },
    { section: "HEALTH & TRAINING", label: "Muscular Strain", href: "/muscular-strain", icon: <Dumbbell className="w-4 h-4" /> },
    { section: "HEALTH & TRAINING", label: "Exercise Library", href: "/programs", icon: <Dumbbell className="w-4 h-4 text-emerald-400" /> },
    { section: "HEALTH & TRAINING", label: "Meds & Supplements", href: "/meds", icon: <Pill className="w-4 h-4" /> },
    { section: "HEALTH & TRAINING", label: "Mental Readiness", href: "/readiness", icon: <BrainCircuit className="w-4 h-4" /> },

    // RECORDS & ANALYSIS
    { section: "RECORDS & ANALYSIS", label: "Medical History", href: "/timeline", icon: <FileText className="w-4 h-4" />, tag: "OCR" },
    { section: "RECORDS & ANALYSIS", label: "Coach Portal", href: "/coach", icon: <Users className="w-4 h-4 text-purple-400" /> },
    { section: "RECORDS & ANALYSIS", label: "Doctor Review", href: "/review", icon: <Stethoscope className="w-4 h-4 text-emerald-400" /> },
    { section: "RECORDS & ANALYSIS", label: "Global Leaderboard", href: "/leaderboard", icon: <BarChart2 className="w-4 h-4" /> },
    { section: "RECORDS & ANALYSIS", label: "Clinic System", href: "/clinic", icon: <Building className="w-4 h-4" /> },
  ];

  const filteredItems = searchQuery.trim() 
    ? navItems.filter(item => item.label.toLowerCase().includes(searchQuery.toLowerCase()) || item.section.toLowerCase().includes(searchQuery.toLowerCase()))
    : navItems;

  const sections = Array.from(new Set(filteredItems.map(i => i.section)));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#090d16] md:relative md:w-64 flex md:flex-col border-t md:border-t-0 md:border-r border-slate-800/80 p-2 md:p-3 shrink-0 h-[72px] md:h-full overflow-x-auto md:overflow-y-auto pointer-events-auto scrollbar-hide shadow-2xl">
      
      {/* ── Brand Header (as in screenshot) ── */}
      <div className="hidden md:flex items-center gap-3 px-2 mb-3 mt-1 shrink-0">
        <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-sm font-black text-slate-950 shadow-md shadow-emerald-500/20">
          PT
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-black text-base tracking-tight text-white leading-none">PhysioTwin</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              V2.0
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium mt-1">Digital Biomechanics</span>
        </div>
      </div>

      {/* ── Search Input (as in screenshot) ── */}
      <div className="hidden md:block px-2 mb-2 shrink-0">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search features..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>
      </div>

      {/* ── Nav Links Container ── */}
      <div className="flex justify-between md:justify-start md:flex-col w-full md:w-auto flex-1 overflow-x-auto md:overflow-y-auto scrollbar-hide space-y-0.5 pb-2">
        {sections.map(sectionName => (
          <div key={sectionName}>
            <NavSection title={sectionName} />
            <div className="space-y-0.5">
              {filteredItems
                .filter(item => item.section === sectionName)
                .map(item => (
                  <NavItem
                    key={item.href}
                    icon={item.icon}
                    label={item.label}
                    href={item.href}
                    active={location === item.href}
                    tag={item.tag}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── User Profile Footer (as in screenshot) ── */}
      <div className="hidden md:flex items-center justify-between p-2 mt-auto pt-3 border-t border-slate-800/80 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-white truncate">
              {user?.displayName || "Kamalesh kumar R"}
            </div>
            <div className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
              CLIENT
            </div>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

    </nav>
  );
}
