import React, { useState } from "react";
import { ShieldAlert, AlertTriangle, ChevronRight, Activity, X, Stethoscope, Clock, Zap } from "lucide-react";

export interface IncidentAlert {
  id: string;
  athleteId: string;
  athleteName: string;
  sport: string;
  severity: "critical" | "warning";
  timestamp: string;
  title: string;
  metric: string;
  triggerDetail: string;
  sessionRef: string;
}

export const SAMPLE_INCIDENTS: IncidentAlert[] = [
  {
    id: "inc-101",
    athleteId: "ath-1",
    athleteName: "Marcus Vance",
    sport: "CrossFit / Olympic Weightlifting",
    severity: "critical",
    timestamp: "12m ago",
    title: "Acute ACL Strain Spike (68.4%)",
    metric: "ACL Strain: 68.4% (Threshold: 60%)",
    triggerDetail: "Dynamic Valgus Collapse of 14.8° on Left Knee during Countermovement Jump landing.",
    sessionRef: "PT-84920"
  },
  {
    id: "inc-102",
    athleteId: "ath-5",
    athleteName: "Liam O'Connor",
    sport: "Rugby / Back Row",
    severity: "warning",
    timestamp: "1h 40m ago",
    title: "L4-L5 Lumbar Disc Shear Warning (2,910 N)",
    metric: "Disc Shear: 2,910 N (Caution: >2,800 N)",
    triggerDetail: "Rapid lumbar flexion velocity under eccentric barbell descent.",
    sessionRef: "PT-84920"
  },
  {
    id: "inc-103",
    athleteId: "ath-3",
    athleteName: "Devon Miller",
    sport: "Basketball / Point Guard",
    severity: "warning",
    timestamp: "4h ago",
    title: "Bilateral Landing Force Asymmetry (28%)",
    metric: "Bilateral GRF Asymmetry: 28%",
    triggerDetail: "Excessive weight distribution shift onto right tibia during drop landing.",
    sessionRef: "PT-84920"
  }
];

interface IncidentAlertFeedProps {
  incidents?: IncidentAlert[];
  onLaunchAutopsy?: (incident: IncidentAlert) => void;
}

export const IncidentAlertFeed: React.FC<IncidentAlertFeedProps> = ({
  incidents = SAMPLE_INCIDENTS,
  onLaunchAutopsy
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<"all" | "critical" | "warning">("all");

  const activeIncidents = incidents.filter(
    inc => !dismissedIds.includes(inc.id) && (activeFilter === "all" || inc.severity === activeFilter)
  );

  const criticalCount = incidents.filter(inc => !dismissedIds.includes(inc.id) && inc.severity === "critical").length;
  const warningCount = incidents.filter(inc => !dismissedIds.includes(inc.id) && inc.severity === "warning").length;

  if (activeIncidents.length === 0 && incidents.length > 0 && dismissedIds.length === incidents.length) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-red-500/30 bg-gradient-to-r from-red-950/30 via-slate-900/60 to-slate-950/80 shadow-lg shadow-red-950/20 overflow-hidden transition-all">
      {/* Top Banner Header */}
      <div className="px-4 py-3 bg-red-950/40 border-b border-red-500/20 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-ping absolute opacity-75" />
            <span className="w-3 h-3 rounded-full bg-red-500 relative" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-black tracking-wider uppercase text-red-400 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              Live Biomechanical Incident Alert Feed
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-300 border border-red-500/30">
              {criticalCount} Critical • {warningCount} Warning
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Filter Buttons */}
          <div className="flex items-center gap-1 text-[11px] font-mono bg-black/40 p-1 rounded-lg border border-border/50">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-2 py-0.5 rounded ${activeFilter === "all" ? "bg-red-500/30 text-red-200" : "text-muted-foreground hover:text-foreground"}`}
            >
              All ({criticalCount + warningCount})
            </button>
            <button
              onClick={() => setActiveFilter("critical")}
              className={`px-2 py-0.5 rounded ${activeFilter === "critical" ? "bg-red-500/40 text-red-200" : "text-muted-foreground hover:text-foreground"}`}
            >
              Critical ({criticalCount})
            </button>
            <button
              onClick={() => setActiveFilter("warning")}
              className={`px-2 py-0.5 rounded ${activeFilter === "warning" ? "bg-amber-500/30 text-amber-200" : "text-muted-foreground hover:text-foreground"}`}
            >
              Warning ({warningCount})
            </button>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-muted-foreground hover:text-foreground font-semibold px-2 py-1 rounded-lg bg-black/30 border border-border/40"
          >
            {isExpanded ? "Collapse" : "Expand"}
          </button>
        </div>
      </div>

      {/* Incident List */}
      {isExpanded && (
        <div className="divide-y divide-border/40">
          {activeIncidents.map(inc => {
            const isCrit = inc.severity === "critical";

            return (
              <div
                key={inc.id}
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-900/40 transition-colors"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div
                    className={`p-2 rounded-xl border mt-0.5 ${
                      isCrit
                        ? "bg-red-500/20 text-red-400 border-red-500/40"
                        : "bg-amber-500/20 text-amber-400 border-amber-500/40"
                    }`}
                  >
                    {isCrit ? <ShieldAlert className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-sm text-foreground">{inc.athleteName}</span>
                      <span className="text-xs text-muted-foreground">• {inc.sport}</span>
                      <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1 bg-muted/40 px-1.5 py-0.5 rounded">
                        <Clock className="w-3 h-3" /> {inc.timestamp}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-red-300 flex items-center gap-1.5">
                      <span>{inc.title}</span>
                      <span className="text-[10px] font-mono text-muted-foreground">({inc.metric})</span>
                    </div>

                    <p className="text-xs text-muted-foreground max-w-2xl">
                      {inc.triggerDetail}
                    </p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    onClick={() => onLaunchAutopsy?.(inc)}
                    className="btn-primary py-1.5 px-3.5 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-red-900/30"
                  >
                    <Activity className="w-3.5 h-3.5 text-red-200" />
                    Launch Autopsy
                  </button>

                  <button
                    onClick={() => setDismissedIds(prev => [...prev, inc.id])}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                    title="Dismiss alert"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {activeIncidents.length === 0 && (
            <div className="p-6 text-center text-xs text-muted-foreground">
              No active incidents matching the selected filter.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

