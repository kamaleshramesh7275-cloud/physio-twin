import React from "react";
import { Sidebar } from "./components/Sidebar";
import { Trophy, Medal, Award, Star, Zap, Activity } from "lucide-react";

export default function AchievementsPage() {
  const achievements = [
    { id: 1, title: "100 Rehab Sessions", desc: "Completed 100 logged sessions in the app.", icon: <Award className="w-8 h-8 text-amber-500" />, unlocked: true },
    { id: 2, title: "Perfect Symmetry", desc: "Achieved <5% force asymmetry in jump testing.", icon: <Activity className="w-8 h-8 text-emerald-600" />, unlocked: true },
    { id: 3, title: "Iron Consistency", desc: "Logged in and completed tasks for 30 consecutive days.", icon: <Zap className="w-8 h-8 text-orange-500" />, unlocked: true },
    { id: 4, title: "Full Range of Motion", desc: "Hit 140° knee flexion.", icon: <Star className="w-8 h-8 text-slate-400" />, unlocked: false },
    { id: 5, title: "Cleared for Sport", desc: "Passed all clinical return-to-sport metrics.", icon: <Trophy className="w-8 h-8 text-slate-400" />, unlocked: false },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen text-foreground md:overflow-hidden pb-[72px] md:pb-0 bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2 text-slate-900">
              <Trophy className="w-6 h-6 text-blue-600" /> Trophy Room
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Track your major recovery milestones and clinical achievements.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((badge) => (
            <div key={badge.id} className={`card border ${badge.unlocked ? 'border-blue-200 bg-blue-50/40 shadow-sm ring-1 ring-blue-500/10' : 'border-slate-200 bg-white/70 opacity-60'} flex flex-col items-center text-center p-6 transition-all hover:scale-[1.02]`}>
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${badge.unlocked ? 'bg-white shadow-md shadow-blue-500/10 border border-blue-100' : 'bg-slate-100 border border-slate-200'}`}>
                {badge.icon}
              </div>
              <h3 className={`font-bold text-lg mb-2 ${badge.unlocked ? 'text-slate-900' : 'text-slate-500'}`}>{badge.title}</h3>
              <p className="text-xs text-slate-600 max-w-[220px]">{badge.desc}</p>
              
              {badge.unlocked ? (
                <div className="mt-4 text-[10px] uppercase font-bold text-blue-700 tracking-widest bg-blue-100/80 px-3 py-1 rounded-full border border-blue-200">
                  Unlocked
                </div>
              ) : (
                <div className="mt-4 text-[10px] uppercase font-bold text-slate-500 tracking-widest bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                  Locked
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
