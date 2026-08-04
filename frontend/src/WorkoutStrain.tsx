import { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { Dumbbell, Activity, ShieldAlert } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { api } from "./api";
import { useAuth } from "./context/AuthContext";

export function WorkoutStrain() {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const uid = user?.uid || "demo_user";
        const res = await api.getExternalApps(uid);
        // Filter out Hevy/Strength Training
        const workoutData = res.filter((r: any) => r.app_name === "Hevy");
        setData(workoutData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Dummy progressive overload log for chart
  const volumeData = [
    { week: "W1", volume: 10500 },
    { week: "W2", volume: 11200 },
    { week: "W3", volume: 11800 },
    { week: "W4", volume: 12400 },
  ];

  // Muscular load map
  const loadMap = [
    { zone: "Lumbar", load: 85 },
    { zone: "Knees", load: 90 },
    { zone: "Shoulders", load: 40 },
    { zone: "Chest", load: 30 },
    { zone: "Core", load: 60 },
  ];

  const latest = data.length > 0 ? data[0].session_data.workouts[0] : null;

  return (
    <div className="flex flex-col md:flex-row min-h-screen h-auto md:h-screen text-foreground md:overflow-hidden pb-[72px] md:pb-0">
      <Sidebar />
      <main className="flex-1 md:overflow-y-auto p-4 md:p-6 space-y-6 anim-fade relative z-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2"><Dumbbell className="w-6 h-6 text-purple-500" /> Muscular Strain Map</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Synced via Google Fit (Hevy)</p>
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Warning System */}
            <div className="glass-panel bg-gradient-to-br from-red-500/10 to-purple-500/10 border-red-500/30">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-red-400">Critical Load Warning: Knees & Lumbar</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your latest <strong>{latest?.name || "Strength Training"}</strong> session pushed your total weekly leg volume 15% higher than normal. 
                    Given your current recovery status, we recommend avoiding heavy axial loading for the next 48 hours.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Radar Chart for Joint Load */}
              <div className="glass-panel h-80 flex flex-col">
                <div className="font-semibold text-sm mb-4">Joint Load Distribution</div>
                <div className="flex-1 -mx-4 -my-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={loadMap}>
                      <PolarGrid stroke="rgba(255,255,255,0.1)" />
                      <PolarAngleAxis dataKey="zone" tick={{ fill: '#888', fontSize: 12 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="Load" dataKey="load" stroke="#a855f7" fill="#a855f7" fillOpacity={0.4} />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', color: '#fff' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bar Chart for Volume Overload */}
              <div className="glass-panel h-80 flex flex-col">
                <div className="font-semibold text-sm mb-4">Progressive Overload Tracking (Total Volume)</div>
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={volumeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                      <XAxis dataKey="week" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => `${v/1000}k`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                        itemStyle={{ color: '#a855f7' }}
                        formatter={(value) => [`${value} lbs`, "Volume"]}
                      />
                      <Bar dataKey="volume" fill="#a855f7" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}
