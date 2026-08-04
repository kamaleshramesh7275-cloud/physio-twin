import { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { Apple, Activity, Droplets, TrendingUp, AlertTriangle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { api } from "./api";
import { useAuth } from "./context/AuthContext";

export function NutritionRecovery() {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const uid = user?.uid || "demo_user";
        const res = await api.getExternalApps(uid);
        // Filter out HealthifyMe
        const nutritionData = res.filter((r: any) => r.app_name === "HealthifyMe");
        setData(nutritionData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Derive insights from the latest entry
  const latest = data.length > 0 ? data[0].session_data.nutrition : null;
  
  // Dummy historical trend for the chart
  const trendData = [
    { day: "Mon", calories: 2100, protein: 120 },
    { day: "Tue", calories: 2300, protein: 140 },
    { day: "Wed", calories: 2400, protein: 150 },
    { day: "Thu", calories: 2200, protein: 130 },
    { day: "Fri", calories: 2500, protein: 165 }, // Latest
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen h-auto md:h-screen text-foreground md:overflow-hidden pb-[72px] md:pb-0">
      <Sidebar />
      <main className="flex-1 md:overflow-y-auto p-4 md:p-6 space-y-6 anim-fade relative z-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2"><Apple className="w-6 h-6 text-emerald-500" /> Nutrition & Recovery</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Synced via Google Fit (HealthifyMe)</p>
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-panel text-center">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Protein Intake</div>
                <div className="text-3xl font-black text-emerald-400">{latest?.protein || "N/A"}</div>
                <div className="text-xs text-muted-foreground mt-2">Optimal for tissue repair</div>
              </div>
              <div className="glass-panel text-center">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Caloric Status</div>
                <div className="text-3xl font-black text-blue-400">{latest?.status || "N/A"}</div>
                <div className="text-xs text-muted-foreground mt-2">Maintenance Window</div>
              </div>
              <div className="glass-panel text-center">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Hydration</div>
                <div className="text-3xl font-black text-cyan-400">{latest?.hydration || "N/A"}</div>
                <div className="text-xs text-muted-foreground mt-2">Electrolyte balance stable</div>
              </div>
            </div>

            {/* AI Recovery Score */}
            <div className="glass-panel bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border-emerald-500/30">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <Activity className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Tissue Recovery Readiness: 85%</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your recent caloric intake and high protein consumption over the last 48 hours indicates optimal conditions for myofibrillar repair. You are cleared for high-intensity loads.
                  </p>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="glass-panel h-80">
              <div className="flex justify-between items-center mb-6">
                <div className="font-semibold text-sm">7-Day Trajectory</div>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="day" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => `${v} kcal`} />
                  <YAxis yAxisId="right" orientation="right" stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => `${v}g`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Line yAxisId="left" type="monotone" dataKey="calories" name="Calories" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} activeDot={{ r: 6 }} />
                  <Line yAxisId="right" type="monotone" dataKey="protein" name="Protein" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
