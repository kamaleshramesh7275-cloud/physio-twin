import React, { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { Settings, User, Smartphone, Shield, Bell, Check, LogOut } from "lucide-react";
import { useAuth } from "./context/AuthContext";

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button 
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
        checked ? 'bg-blue-600' : 'bg-slate-200 border border-slate-300'
      }`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`} />
    </button>
  );
}

export default function SettingsPage() {
  const { user, logout } = useAuth();
  
  const [appleHealth, setAppleHealth] = useState(true);
  const [garmin, setGarmin] = useState(false);
  const [oura, setOura] = useState(true);
  
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [injuryAlerts, setInjuryAlerts] = useState(true);
  const [milestones, setMilestones] = useState(false);

  return (
    <div className="flex flex-col md:flex-row min-h-screen h-auto md:h-screen text-foreground md:overflow-hidden pb-[72px] md:pb-0 bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 max-w-4xl mx-auto w-full pt-8 md:pt-10">
        <header className="mb-6">
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600" /> Settings &amp; Preferences
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage your telemetry credentials, connected wearables, and privacy rules.</p>
        </header>

        <div className="space-y-6">
          
          {/* Account & Profile */}
          <section className="card bg-white border border-slate-200 shadow-sm p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" /> Account &amp; Profile
            </h2>
            <div className="flex items-center justify-between pt-1">
              <div>
                <div className="font-bold text-sm text-slate-900">{user?.email || "user@example.com"}</div>
                <div className="text-xs text-slate-500 mt-0.5">Physical Twin Pro · Telemetry Active</div>
              </div>
              <button 
                onClick={logout} 
                className="flex items-center gap-1.5 text-xs text-rose-700 hover:bg-rose-100 font-bold px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          </section>

          {/* Connected Devices */}
          <section className="card bg-white border border-slate-200 shadow-sm p-6 space-y-5">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-blue-600" /> Connected Wearable Sources
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-slate-900">Apple Health</div>
                  <div className="text-xs text-slate-500">Syncs steps, workouts, and continuous heart rate</div>
                </div>
                <Toggle checked={appleHealth} onChange={() => setAppleHealth(!appleHealth)} />
              </div>
              <div className="w-full h-px bg-slate-100" />
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-slate-900">Garmin Connect</div>
                  <div className="text-xs text-slate-500">Syncs VO2 max and acute training strain</div>
                </div>
                <Toggle checked={garmin} onChange={() => setGarmin(!garmin)} />
              </div>
              <div className="w-full h-px bg-slate-100" />
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-slate-900">Oura Ring</div>
                  <div className="text-xs text-slate-500">Syncs sleep staging and autonomic recovery score</div>
                </div>
                <Toggle checked={oura} onChange={() => setOura(!oura)} />
              </div>
            </div>
          </section>

          {/* Notifications */}
          <section className="card bg-white border border-slate-200 shadow-sm p-6 space-y-5">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-600" /> Notifications &amp; Alerts
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-slate-900">Weekly Twin Digest</div>
                  <div className="text-xs text-slate-500">Summary report of tissue adaptation and mobility changes</div>
                </div>
                <Toggle checked={weeklyReport} onChange={() => setWeeklyReport(!weeklyReport)} />
              </div>
              <div className="w-full h-px bg-slate-100" />
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-slate-900">Injury Risk Alerts</div>
                  <div className="text-xs text-slate-500">Real-time alerts for valgus deviations and high ACWR overreach</div>
                </div>
                <Toggle checked={injuryAlerts} onChange={() => setInjuryAlerts(!injuryAlerts)} />
              </div>
              <div className="w-full h-px bg-slate-100" />
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-slate-900">Milestone Achievements</div>
                  <div className="text-xs text-slate-500">Notifications when you unlock benchmark medals</div>
                </div>
                <Toggle checked={milestones} onChange={() => setMilestones(!milestones)} />
              </div>
            </div>
          </section>

          {/* Privacy */}
          <section className="card bg-white border border-slate-200 shadow-sm p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" /> Privacy &amp; Data Governance
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-sm text-slate-900">Anonymous Benchmarking</div>
                <div className="text-xs text-slate-500">Anonymize telemetry in global sports research datasets</div>
              </div>
              <div className="text-blue-600 font-bold text-xs flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                <Check className="w-3.5 h-3.5" /> Enabled
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
