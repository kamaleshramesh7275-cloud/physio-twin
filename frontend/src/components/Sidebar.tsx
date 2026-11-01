import React from "react";
import { Link, useLocation } from "wouter";
import { 
  Activity, Camera, History, Clock, Brain, Settings, 
  User, BarChart2, ClipboardList, LineChart, Users, Building,
  Pill, HeartPulse, BrainCircuit, BookOpen, Trophy, Apple, Dumbbell, Share2, Stethoscope
} from "lucide-react";

function NavItem({ icon, label, href, active }: { icon: React.ReactNode; label: string; href: string; active?: boolean }) {
  return (
    <Link 
      href={href} 
      className={`nav-link flex-col md:flex-row items-center justify-center min-w-[72px] md:min-w-0 px-1 md:px-3 py-2 transition-all duration-150 rounded-xl ${
        active 
          ? 'active bg-red-950/50 text-red-400 border border-red-500/40 font-semibold shadow-xs shadow-red-950/30' 
          : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/70'
      }`}
    >
      <span className="mb-1 md:mb-0">{icon}</span>
      <span className="text-[10px] md:text-sm whitespace-nowrap">{label}</span>
    </Link>
  );
}

function NavSection({ title }: { title: string }) {
  return (
    <div className="hidden md:block mt-6 mb-2 px-3">
      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{title}</span>
    </div>
  );
}

export function Sidebar() {
  const [location] = useLocation();
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#09090b]/95 backdrop-blur-xl md:relative md:w-64 flex md:flex-col border-t md:border-t-0 md:border-r border-[#27272a] p-2 md:p-4 shrink-0 h-[72px] md:h-full overflow-x-auto md:overflow-y-auto pointer-events-auto scrollbar-hide shadow-2xl">
      <div className="hidden md:flex items-center gap-2.5 px-2 mb-4 mt-2 sticky top-0 bg-[#09090b]/95 backdrop-blur z-10 py-2 border-b border-[#27272a]">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-xs font-black text-white shadow-lg shadow-red-950/50 border border-red-500/40">
          PT
        </div>
        <div className="flex flex-col">
          <span className="font-black text-lg tracking-tight text-white leading-none">PhysioTwin</span>
          <span className="text-[9px] font-mono text-red-400 tracking-wider uppercase font-bold mt-0.5">Biometrics</span>
        </div>
      </div>

      <div className="flex justify-between md:justify-start md:flex-col w-full md:w-auto md:space-y-1 flex-1 pb-4">
        
        <NavSection title="Core" />
        <NavItem icon={<Activity className="w-5 h-5 md:w-5 md:h-5" />} label="Dashboard" href="/dashboard" active={location === '/dashboard'} />
        <NavItem icon={<User className="w-5 h-5 md:w-5 md:h-5" />} label="Twin" href="/twin" active={location === '/twin'} />
        <NavItem icon={<Camera className="w-5 h-5 md:w-5 md:h-5" />} label="Capture" href="/capture" active={location === '/capture'} />
        
        <NavSection title="Health Metrics" />
        <NavItem icon={<HeartPulse className="w-5 h-5 md:w-5 md:h-5" />} label="Vitals" href="/vitals" active={location === '/vitals'} />
        <NavItem icon={<Apple className="w-5 h-5 md:w-5 md:h-5" />} label="Nutrition" href="/nutrition-recovery" active={location === '/nutrition-recovery'} />
        <NavItem icon={<Dumbbell className="w-5 h-5 md:w-5 md:h-5" />} label="Strain" href="/muscular-strain" active={location === '/muscular-strain'} />
        <NavItem icon={<Pill className="w-5 h-5 md:w-5 md:h-5" />} label="Meds" href="/meds" active={location === '/meds'} />
        <NavItem icon={<BrainCircuit className="w-5 h-5 md:w-5 md:h-5" />} label="Readiness" href="/readiness" active={location === '/readiness'} />
        
        <NavSection title="Data & Analysis" />
        <NavItem icon={<LineChart className="w-5 h-5 md:w-5 md:h-5" />} label="Analytics" href="/analytics" active={location === '/analytics'} />
        <NavItem icon={<History className="w-5 h-5 md:w-5 md:h-5" />} label="History" href="/history" active={location === '/history'} />
        <NavItem icon={<Clock className="w-5 h-5 md:w-5 md:h-5" />} label="Timeline" href="/timeline" active={location === '/timeline'} />
        <NavItem icon={<Brain className="w-5 h-5 md:w-5 md:h-5" />} label="Insights" href="/insights" active={location === '/insights'} />
        
        <NavSection title="Clinical & Community" />
        <NavItem icon={<ClipboardList className="w-5 h-5 md:w-5 md:h-5" />} label="Programs" href="/programs" active={location === '/programs'} />
        <NavItem icon={<Users className="w-5 h-5 md:w-5 md:h-5 text-red-400" />} label="Coach Portal" href="/coach" active={location === '/coach'} />
        <NavItem icon={<Share2 className="w-5 h-5 md:w-5 md:h-5 text-emerald-400" />} label="Public Review" href="/review" active={location === '/review'} />
        <NavItem icon={<Building className="w-5 h-5 md:w-5 md:h-5" />} label="Clinic" href="/clinic" active={location === '/clinic'} />
        <NavItem icon={<BarChart2 className="w-5 h-5 md:w-5 md:h-5" />} label="Benchmark" href="/leaderboard" active={location === '/leaderboard'} />
        <NavItem icon={<Users className="w-5 h-5 md:w-5 md:h-5" />} label="Community" href="/community" active={location === '/community'} />
        <NavItem icon={<Trophy className="w-5 h-5 md:w-5 md:h-5" />} label="Trophies" href="/achievements" active={location === '/achievements'} />
        
        <NavSection title="System" />
        <NavItem icon={<BookOpen className="w-5 h-5 md:w-5 md:h-5" />} label="Wiki" href="/wiki" active={location === '/wiki'} />
        <NavItem icon={<Settings className="w-5 h-5 md:w-5 md:h-5" />} label="Settings" href="/settings" active={location === '/settings'} />
      </div>
    </nav>
  );
}
