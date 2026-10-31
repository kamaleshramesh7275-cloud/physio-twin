import React, { useEffect, useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { Activity, Target, BarChart2, Trophy, Medal } from "lucide-react";
import { api } from "./api";
import { useAuth } from "./context/AuthContext";

interface LeaderboardEntry {
  username: string;
  score: number;
  rank_change: number;
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [capabilityMark, setCapabilityMark] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [lbData, dashboardData] = await Promise.all([
          api.getLeaderboard(),
          api.getDashboard(user?.uid || "demo_user")
        ]);
        setLeaderboardData(lbData);
        setCapabilityMark(Math.round(dashboardData.reserve * 10) || 712);
      } catch (e) {
        console.error("Failed to load leaderboard data", e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen h-auto md:h-screen text-foreground md:overflow-hidden pb-[72px] md:pb-0 bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 max-w-4xl mx-auto w-full pt-8 md:pt-10">
        <header className="mb-6">
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-blue-600" /> Peer Benchmarking &amp; Rankings
          </h1>
          <p className="text-slate-500 text-sm mt-1">Compare your physical capability mark with peers in your demographic category.</p>
        </header>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 rounded-full border-3 border-blue-600 border-t-transparent animate-spin"></div>
              <div className="text-slate-500 text-xs font-mono font-medium">Calibrating global cohort rankings...</div>
            </div>
          </div>
        ) : (
          <>
            <div className="card bg-white border border-slate-200/90 rounded-3xl p-8 mb-6 text-center relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 p-4 opacity-5 text-slate-900 pointer-events-none"><BarChart2 className="w-32 h-32" /></div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 relative z-10">Your Physical Capability Mark</div>
              <div className="text-6xl font-black text-slate-900 font-mono tracking-tight relative z-10">{capabilityMark}</div>
              <div className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full inline-block mt-4 relative z-10">
                Age 30 Baseline: 650 (Top 24% Percentile)
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Leaderboard Column */}
              <div className="space-y-3">
                <h2 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <Medal className="w-4 h-4 text-amber-500" /> Global Athlete Rankings
                </h2>
                {leaderboardData.map((u, i) => (
                  <div key={i} className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                    i === 0 ? "bg-amber-50/60 border-amber-200 shadow-2xs" :
                    i === 1 ? "bg-slate-50 border-slate-200 shadow-2xs" :
                    i === 2 ? "bg-orange-50/40 border-orange-200 shadow-2xs" :
                    "bg-white border-slate-200/80 shadow-2xs"
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-7 text-center font-black text-sm ${
                        i === 0 ? 'text-amber-700 font-mono' :
                        i === 1 ? 'text-slate-700 font-mono' :
                        i === 2 ? 'text-orange-700 font-mono' :
                        'text-slate-400 font-mono'
                      }`}>#{i + 1}</div>
                      <div className="text-sm font-bold text-slate-900">{u.username}</div>
                    </div>
                    <div className="font-mono text-sm font-black text-blue-700">{u.score}</div>
                  </div>
                ))}
                
                {/* Current User */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-blue-50 border border-blue-300 mt-4 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-7 text-center font-black text-blue-700 text-sm font-mono">#49</div>
                    <div className="text-sm font-bold text-blue-900 flex items-center gap-1.5">
                      <span>You</span>
                      <span className="text-[10px] bg-blue-600 text-white px-2 py-0.2 rounded-full font-bold uppercase">Active</span>
                    </div>
                  </div>
                  <div className="font-mono text-base font-black text-blue-700">{capabilityMark}</div>
                </div>
              </div>

              {/* Insights Column */}
              <div className="space-y-3">
                <h2 className="text-base font-bold text-slate-900 mb-2">Performance Directives</h2>
                
                <div className="card bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-2">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <Target className="w-4 h-4 text-blue-600" /> Priority: Knee Stability
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    Your left knee risk is holding your score back. Strengthen your glute medius and left quad to boost your mark by +45 points.
                  </p>
                </div>

                <div className="card bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-2">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <Activity className="w-4 h-4 text-emerald-600" /> Mobility Optimization
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    You are outperforming 80% of peers in shoulder mobility. Maintain this upper-cross syndrome prevention routine for overhead stability.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
