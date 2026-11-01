import React, { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { 
  Users, ShieldAlert, Activity, CheckCircle2, AlertTriangle, 
  Share2, ArrowRight, Sparkles, Filter, Search, Stethoscope, Dumbbell, 
  Calendar, HeartHandshake, X, Layers, Crosshair, Send, Sliders
} from "lucide-react";
import { getAllSessions, getShareableSession, generateShareableUrl, type ShareableSessionPayload } from "./lib/shareableSessionStore";
import { LiveTwinMirrorCanvas } from "./components/LiveTwinMirrorCanvas";
import { IncidentAlertFeed, type IncidentAlert, SAMPLE_INCIDENTS } from "./components/IncidentAlertFeed";
import { ACWRSquadMatrix, type ACWRAthlete } from "./components/ACWRSquadMatrix";
import { ComparativeTwinCanvas, type ComparativeAthleteProfile } from "./components/ComparativeTwinCanvas";
import { BulkCorrectiveModal, type BulkAthleteItem } from "./components/BulkCorrectiveModal";
import { BiomechanicalAutopsyModal } from "./components/BiomechanicalAutopsyModal";
import type { ForensicAutopsyReport, TelemetryFlightFrame } from "./lib/flightRecorder";
import { Link } from "wouter";

export interface AthleteRosterItem {
  id: string;
  name: string;
  sport: string;
  age: number;
  lastSessionDate: string;
  riskStatus: "optimal" | "compensating" | "critical";
  riskScorePercent: number; // 0 - 100
  acwr: number;             // Acute-to-Chronic Workload Ratio
  acuteLoad: number;        // 7-day AU
  chronicLoad: number;      // 28-day AU
  symmetryPercent: number;
  valgusAngleDeg: number;
  kneeFlexionDeg: number;
  hipRotationDeg: number;
  trunkLeanDeg: number;
  vmoVlRatio: number;
  kamNmKg: number;
  activeAutopsy: boolean;
  assignedDrill?: string;
  sessionRef: string;
}

const INITIAL_ROSTER: AthleteRosterItem[] = [
  {
    id: "ath-1",
    name: "Marcus Vance",
    sport: "CrossFit / Olympic Weightlifting",
    age: 24,
    lastSessionDate: "Today, 14:20",
    riskStatus: "critical",
    riskScorePercent: 82,
    acwr: 1.68, // Spike in workload
    acuteLoad: 1180,
    chronicLoad: 2800,
    symmetryPercent: 78,
    valgusAngleDeg: 14.8,
    kneeFlexionDeg: 82,
    hipRotationDeg: 12,
    trunkLeanDeg: 32,
    vmoVlRatio: 0.45,
    kamNmKg: 0.54,
    activeAutopsy: true,
    assignedDrill: "Banded Clamshells + VMO TKEs",
    sessionRef: "PT-84920"
  },
  {
    id: "ath-2",
    name: "Elena Rostova",
    sport: "Track & Field / 400m Hurdles",
    age: 29,
    lastSessionDate: "Today, 11:45",
    riskStatus: "optimal",
    riskScorePercent: 12,
    acwr: 1.05,
    acuteLoad: 790,
    chronicLoad: 3000,
    symmetryPercent: 96,
    valgusAngleDeg: 2.1,
    kneeFlexionDeg: 90,
    hipRotationDeg: 2,
    trunkLeanDeg: 16,
    vmoVlRatio: 0.95,
    kamNmKg: 0.22,
    activeAutopsy: false,
    sessionRef: "PT-51204"
  },
  {
    id: "ath-3",
    name: "Devon Miller",
    sport: "Basketball / Point Guard",
    age: 21,
    lastSessionDate: "Yesterday",
    riskStatus: "compensating",
    riskScorePercent: 44,
    acwr: 1.35,
    acuteLoad: 980,
    chronicLoad: 2900,
    symmetryPercent: 84,
    valgusAngleDeg: 8.4,
    kneeFlexionDeg: 86,
    hipRotationDeg: 6,
    trunkLeanDeg: 24,
    vmoVlRatio: 0.68,
    kamNmKg: 0.38,
    activeAutopsy: false,
    sessionRef: "PT-84920"
  },
  {
    id: "ath-4",
    name: "Sarah Chen",
    sport: "Powerlifting / 63kg Class",
    age: 26,
    lastSessionDate: "2 days ago",
    riskStatus: "optimal",
    riskScorePercent: 18,
    acwr: 1.12,
    acuteLoad: 920,
    chronicLoad: 3300,
    symmetryPercent: 94,
    valgusAngleDeg: 3.0,
    kneeFlexionDeg: 95,
    hipRotationDeg: 3,
    trunkLeanDeg: 20,
    vmoVlRatio: 0.90,
    kamNmKg: 0.26,
    activeAutopsy: false,
    sessionRef: "PT-51204"
  },
  {
    id: "ath-5",
    name: "Liam O'Connor",
    sport: "Rugby / Back Row",
    age: 28,
    lastSessionDate: "3 days ago",
    riskStatus: "compensating",
    riskScorePercent: 52,
    acwr: 1.48,
    acuteLoad: 1150,
    chronicLoad: 3100,
    symmetryPercent: 81,
    valgusAngleDeg: 11.2,
    kneeFlexionDeg: 80,
    hipRotationDeg: 9,
    trunkLeanDeg: 28,
    vmoVlRatio: 0.58,
    kamNmKg: 0.46,
    activeAutopsy: false,
    sessionRef: "PT-84920"
  }
];

const GOLD_STANDARD_BENCHMARK: ComparativeAthleteProfile = {
  id: "gold-standard",
  name: "Gold Standard Kinematic Norm",
  sport: "Biomechanics Benchmark",
  valgusAngleDeg: 1.5,
  kneeFlexionDeg: 92,
  hipRotationDeg: 2,
  trunkLeanDeg: 15,
  vmoVlRatio: 1.0,
  kamNmKg: 0.18
};

export default function CoachPortalPage() {
  const [roster, setRoster] = useState<AthleteRosterItem[]>(INITIAL_ROSTER);
  const [filter, setFilter] = useState<"all" | "at-risk" | "optimal">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAthlete, setSelectedAthlete] = useState<AthleteRosterItem | null>(null);
  const [drillSuccess, setDrillSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Advanced feature modal states
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isDuelModalOpen, setIsDuelModalOpen] = useState(false);
  const [duelAthleteAId, setDuelAthleteAId] = useState<string>("ath-1"); // Marcus Vance
  const [duelAthleteBId, setDuelAthleteBId] = useState<string>("ath-2"); // Elena Rostova
  const [autopsyModalData, setAutopsyModalData] = useState<{ report: ForensicAutopsyReport; buffer: TelemetryFlightFrame[] } | null>(null);
  const [showAcwrSection, setShowAcwrSection] = useState(true);

  // Filter roster
  const filteredRoster = roster.filter(a => {
    const matchesFilter = filter === "all" 
      ? true 
      : filter === "at-risk" 
      ? a.riskStatus === "critical" || a.riskStatus === "compensating" 
      : a.riskStatus === "optimal";
    const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.sport.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const optimalCount = roster.filter(a => a.riskStatus === "optimal").length;
  const compensatingCount = roster.filter(a => a.riskStatus === "compensating").length;
  const criticalCount = roster.filter(a => a.riskStatus === "critical").length;

  const handleCopyLink = (sessionId: string) => {
    const url = generateShareableUrl(sessionId);
    navigator.clipboard.writeText(url);
    setCopiedLink(sessionId);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  const handleAssignDrill = (athleteId: string, drillName: string) => {
    setRoster(prev => prev.map(a => a.id === athleteId ? { ...a, assignedDrill: drillName } : a));
    if (selectedAthlete) {
      setSelectedAthlete(prev => prev ? { ...prev, assignedDrill: drillName } : null);
    }
    setDrillSuccess(true);
    setTimeout(() => setDrillSuccess(false), 3000);
  };

  const handleBulkBroadcast = (athleteIds: string[], protocolName: string) => {
    setRoster(prev => prev.map(a => athleteIds.includes(a.id) ? { ...a, assignedDrill: protocolName } : a));
  };

  const handleLaunchAutopsy = (incident: IncidentAlert) => {
    const session = getShareableSession(incident.sessionRef) || getShareableSession("PT-84920");
    if (session && session.autopsyReport) {
      // Mock 120Hz buffer around incident matching TelemetryFlightFrame structure
      const dummyBuffer: TelemetryFlightFrame[] = Array.from({ length: 60 }, (_, i) => ({
        timestampMs: 1730419200000 - (60 - i) * 8.33,
        worldLandmarks: [],
        kneeAngle: 80 + Math.sin(i / 10) * 10,
        hipAngle: 75,
        trunkInclination: 32,
        currentKamNm: 40.5,
        normalizedKamNmKg: 0.54,
        grfNewtons: 1725,
        semg: session.semgSnapshot,
        angularVelocityDegSec: 120,
        angularJerkDegSec3: 450,
        aclStrainPercent: 8.8,
        lumbarDiscCompNewtons: 2950,
        lumbarDiscShearNewtons: 540,
        patellofemoralStressMpa: 6.4,
        anomalyScore: 82
      }));

      setAutopsyModalData({
        report: session.autopsyReport,
        buffer: dummyBuffer
      });
    }
  };

  // Profiles for 3D duel
  const athleteAProfile: ComparativeAthleteProfile = roster.find(a => a.id === duelAthleteAId) || INITIAL_ROSTER[0];
  const athleteBProfile: ComparativeAthleteProfile = duelAthleteBId === "gold-standard" 
    ? GOLD_STANDARD_BENCHMARK 
    : (roster.find(a => a.id === duelAthleteBId) || INITIAL_ROSTER[1]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen text-foreground bg-background">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        
        {/* Header Bar */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold tracking-wider uppercase text-primary">
                Multi-Athlete Command Center
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Coach / Clinician Tier
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight flex items-center gap-2">
              <Users className="w-7 h-7 text-primary" /> Squad Biomechanical Triage
            </h1>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Feature 4 Trigger Button */}
            <button
              onClick={() => setIsBulkModalOpen(true)}
              className="btn-primary px-3.5 py-2 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-primary/20"
            >
              <Send className="w-3.5 h-3.5" />
              Bulk Correctives
            </button>

            {/* Feature 2 Trigger Button */}
            <button
              onClick={() => setIsDuelModalOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold border border-primary/40 bg-card hover:bg-primary/10 text-primary transition-all flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5" />
              3D Dual Duel
            </button>

            <Link
              href="/twin"
              className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-border bg-card hover:bg-muted/50 transition-all flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <Activity className="w-3.5 h-3.5 text-primary" />
              My Twin
            </Link>
          </div>
        </header>

        {/* Feature 5: Real-Time Incident Alert Feed */}
        <IncidentAlertFeed
          incidents={SAMPLE_INCIDENTS}
          onLaunchAutopsy={handleLaunchAutopsy}
        />

        {/* 1. Squad Injury Risk Radar Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="text-[11px] font-mono text-muted-foreground uppercase">Total Roster</div>
            <div className="text-2xl font-black font-mono-numbers mt-1 text-foreground">{roster.length} Athletes</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Active squad monitoring</div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <div className="text-[11px] font-mono text-emerald-400 uppercase flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Optimal Alignment
            </div>
            <div className="text-2xl font-black font-mono-numbers mt-1 text-emerald-400">{optimalCount} Athletes</div>
            <div className="text-[10px] text-emerald-300/80 mt-0.5">Cleared for full intensity</div>
          </div>

          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <div className="text-[11px] font-mono text-amber-400 uppercase flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Compensating
            </div>
            <div className="text-2xl font-black font-mono-numbers mt-1 text-amber-400">{compensatingCount} Athletes</div>
            <div className="text-[10px] text-amber-300/80 mt-0.5">Asymmetric load shift</div>
          </div>

          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
            <div className="text-[11px] font-mono text-red-400 uppercase flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" /> High Risk / Autopsy
            </div>
            <div className="text-2xl font-black font-mono-numbers mt-1 text-red-400">{criticalCount} Athlete</div>
            <div className="text-[10px] text-red-300/80 mt-0.5">Immediate deload required</div>
          </div>
        </div>

        {/* Feature 3: Gabbett ACWR "Sweet Spot vs. Danger Zone" Matrix */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-muted-foreground">
              Workload Monitoring &amp; Injury Prevention
            </span>
            <button
              onClick={() => setShowAcwrSection(!showAcwrSection)}
              className="text-xs text-primary hover:underline font-semibold"
            >
              {showAcwrSection ? "Hide Matrix" : "Show ACWR Matrix"}
            </button>
          </div>

          {showAcwrSection && (
            <ACWRSquadMatrix
              athletes={roster}
              selectedId={selectedAthlete?.id}
              onSelectAthlete={athlete => {
                const found = roster.find(a => a.id === athlete.id);
                if (found) setSelectedAthlete(found);
              }}
            />
          )}
        </div>

        {/* 2. Filter & Search Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-xl border border-border">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === "all" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({roster.length})
            </button>
            <button
              onClick={() => setFilter("at-risk")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === "at-risk" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              At Risk ({compensatingCount + criticalCount})
            </button>
            <button
              onClick={() => setFilter("optimal")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === "optimal" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Optimal ({optimalCount})
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search athlete or sport..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 rounded-xl text-xs bg-card border border-border text-foreground focus:outline-none focus:border-primary w-full sm:w-64"
            />
          </div>
        </div>

        {/* 3. Athlete Roster Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRoster.map(athlete => {
            const isCritical = athlete.riskStatus === "critical";
            const isComp = athlete.riskStatus === "compensating";

            return (
              <div
                key={athlete.id}
                className={`card p-5 space-y-4 border transition-all hover:shadow-lg ${
                  isCritical 
                    ? "border-red-500/40 bg-red-950/10 shadow-sm shadow-red-500/5" 
                    : isComp 
                    ? "border-amber-500/40 bg-amber-950/10" 
                    : "border-border hover:border-primary/40"
                }`}
              >
                {/* Top Card Meta */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-base text-foreground">{athlete.name}</h3>
                    <p className="text-xs text-muted-foreground">{athlete.sport} • {athlete.age}y</p>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase ${
                    isCritical 
                      ? "bg-red-500/20 text-red-400 border border-red-500/40" 
                      : isComp 
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" 
                      : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  }`}>
                    {athlete.riskStatus}
                  </span>
                </div>

                {/* Telemetry Numbers */}
                <div className="grid grid-cols-3 gap-2 py-2 border-y border-border/60 text-center">
                  <div>
                    <div className="text-[10px] font-mono text-muted-foreground uppercase">ACWR Ratio</div>
                    <div className={`font-mono font-black text-sm ${athlete.acwr > 1.5 ? "text-red-400" : "text-emerald-400"}`}>
                      {athlete.acwr}x
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-muted-foreground uppercase">Symmetry</div>
                    <div className={`font-mono font-black text-sm ${athlete.symmetryPercent < 85 ? "text-amber-400" : "text-emerald-400"}`}>
                      {athlete.symmetryPercent}%
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-muted-foreground uppercase">Valgus Dev</div>
                    <div className={`font-mono font-black text-sm ${athlete.valgusAngleDeg > 10 ? "text-red-400" : "text-emerald-400"}`}>
                      {athlete.valgusAngleDeg}°
                    </div>
                  </div>
                </div>

                {/* Active Incident / Assigned Drill */}
                {athlete.activeAutopsy && (
                  <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-500/30 flex items-center justify-between text-xs text-red-300">
                    <span className="flex items-center gap-1.5 font-bold">
                      <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                      1 Autopsy Incident Logged
                    </span>
                    <button
                      onClick={() => {
                        const inc = SAMPLE_INCIDENTS.find(i => i.athleteId === athlete.id) || SAMPLE_INCIDENTS[0];
                        handleLaunchAutopsy(inc);
                      }}
                      className="text-[10px] text-red-400 hover:underline font-mono font-bold"
                    >
                      View Forensic →
                    </button>
                  </div>
                )}

                {athlete.assignedDrill && (
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Dumbbell className="w-3.5 h-3.5 text-primary" />
                    <span>Drill: <strong className="text-foreground">{athlete.assignedDrill}</strong></span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setSelectedAthlete(athlete)}
                    className="btn-primary flex-1 py-2 text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <Activity className="w-3.5 h-3.5" />
                    Inspect Twin
                  </button>
                  <button
                    onClick={() => {
                      setDuelAthleteAId(athlete.id);
                      setIsDuelModalOpen(true);
                    }}
                    className="p-2 rounded-xl border border-primary/30 bg-card hover:bg-primary/10 text-primary text-xs transition-all"
                    title="Launch 3D Duel Comparison"
                  >
                    <Layers className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleCopyLink(athlete.sessionRef)}
                    className="p-2 rounded-xl border border-border bg-card hover:bg-muted/50 text-muted-foreground hover:text-foreground text-xs transition-all"
                    title="Generate 1-Click Zero-Login Doctor Link"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>

                {copiedLink === athlete.sessionRef && (
                  <div className="text-[11px] font-mono text-emerald-400 text-center font-bold">
                    ✓ Public Doctor Link copied to clipboard!
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Feature 2 Modal: Comparative 3D Dual-Athlete Duel */}
        {isDuelModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <div className="relative w-full max-w-5xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
              
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-border bg-slate-900/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-mono font-bold uppercase text-cyan-400">Kinematic Divergence Laboratory</div>
                    <h2 className="text-xl font-black text-foreground">Comparative 3D Dual-Athlete Duel</h2>
                  </div>
                </div>

                <button
                  onClick={() => setIsDuelModalOpen(false)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Selectors Bar */}
              <div className="px-6 py-3 bg-slate-900/40 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs font-mono font-bold text-cyan-400">Athlete A (Cyan):</span>
                  <select
                    value={duelAthleteAId}
                    onChange={e => setDuelAthleteAId(e.target.value)}
                    className="bg-card border border-border rounded-lg text-xs font-semibold px-3 py-1.5 text-foreground focus:outline-none focus:border-primary"
                  >
                    {roster.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.sport})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-xs font-mono font-bold text-muted-foreground">VS</div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs font-mono font-bold text-emerald-400">Athlete B (Emerald):</span>
                  <select
                    value={duelAthleteBId}
                    onChange={e => setDuelAthleteBId(e.target.value)}
                    className="bg-card border border-border rounded-lg text-xs font-semibold px-3 py-1.5 text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="gold-standard">Gold Standard Biomechanics Norm</option>
                    {roster.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.sport})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Modal Body with 3D Canvas */}
              <div className="flex-1 overflow-y-auto p-6">
                <ComparativeTwinCanvas
                  athleteA={athleteAProfile}
                  athleteB={athleteBProfile}
                />
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-border bg-slate-900/40 flex items-center justify-end">
                <button
                  onClick={() => setIsDuelModalOpen(false)}
                  className="btn-primary px-5 py-2 text-xs font-bold"
                >
                  Close Duel Canvas
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Feature 4 Modal: Bulk Corrective Broadcaster */}
        <BulkCorrectiveModal
          isOpen={isBulkModalOpen}
          onClose={() => setIsBulkModalOpen(false)}
          athletes={roster}
          onBroadcast={handleBulkBroadcast}
        />

        {/* Forensic Biomechanical Autopsy Modal */}
        {autopsyModalData && (
          <BiomechanicalAutopsyModal
            report={autopsyModalData.report}
            buffer={autopsyModalData.buffer}
            onClose={() => setAutopsyModalData(null)}
          />
        )}

        {/* 4. Deep Athlete Inspection Modal */}
        {selectedAthlete && (
          <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <div className="relative w-full max-w-4xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-border bg-slate-900/60 flex items-center justify-between">
                <div>
                  <div className="text-xs font-mono font-bold uppercase text-primary">Clinician Deep Drill-Down</div>
                  <h2 className="text-xl font-black text-foreground">
                    {selectedAthlete.name} • <span className="text-muted-foreground text-sm font-normal">{selectedAthlete.sport}</span>
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedAthlete(null)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* 3D Model Viewport */}
                <div className="card space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase">
                    <span>Athlete 3D Skeletal Rig &amp; Valgus Vector</span>
                    <span className="text-cyan-400 font-mono">Pelvic Root Invariant</span>
                  </div>
                  <div className="h-[320px] rounded-xl overflow-hidden border border-border">
                    <LiveTwinMirrorCanvas
                      kneeAngle={selectedAthlete.kneeFlexionDeg}
                      normalizedKamNmKg={selectedAthlete.kamNmKg}
                      showGhost={true}
                      className="w-full h-full"
                    />
                  </div>
                </div>

                {/* Prescribe Corrective Drill Section */}
                <div className="p-5 rounded-xl bg-card border border-primary/30 space-y-3">
                  <div className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <HeartHandshake className="w-4 h-4 text-primary" />
                    Prescribe Targeted Corrective Warm-Up Routine
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Instantly push a targeted 3-minute corrective drill to this athlete's mobile app:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      onClick={() => handleAssignDrill(selectedAthlete.id, "Banded Clamshells + VMO TKEs")}
                      className="p-3 rounded-xl border border-border bg-slate-900/60 hover:border-primary/50 text-left text-xs transition-all space-y-1"
                    >
                      <div className="font-bold text-foreground">Knee Stability Track</div>
                      <div className="text-[10px] text-muted-foreground">Banded Clamshells + VMO TKEs (3x12)</div>
                    </button>
                    <button
                      onClick={() => handleAssignDrill(selectedAthlete.id, "Diaphragmatic Transverse Core Bracing")}
                      className="p-3 rounded-xl border border-border bg-slate-900/60 hover:border-primary/50 text-left text-xs transition-all space-y-1"
                    >
                      <div className="font-bold text-foreground">Lumbar De-Load Protocol</div>
                      <div className="text-[10px] text-muted-foreground">Transverse Abdominal Bracing (5 min)</div>
                    </button>
                    <button
                      onClick={() => handleAssignDrill(selectedAthlete.id, "Box Squat 3s Eccentric Holds")}
                      className="p-3 rounded-xl border border-border bg-slate-900/60 hover:border-primary/50 text-left text-xs transition-all space-y-1"
                    >
                      <div className="font-bold text-foreground">Tempo Motor Control</div>
                      <div className="text-[10px] text-muted-foreground">Box Squat 3s Eccentric (4x6)</div>
                    </button>
                  </div>

                  {drillSuccess && (
                    <div className="text-xs font-bold text-emerald-400 pt-1">
                      ✓ Corrective drill successfully assigned and pushed to athlete's app!
                    </div>
                  )}
                </div>

              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-border bg-slate-900/40 flex items-center justify-between">
                <Link
                  href={`/review?id=${selectedAthlete.sessionRef}`}
                  className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
                >
                  Open Full Clinical Review Page <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <button
                  onClick={() => setSelectedAthlete(null)}
                  className="btn-primary px-5 py-2 text-xs font-bold"
                >
                  Close Inspection
                </button>
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}
