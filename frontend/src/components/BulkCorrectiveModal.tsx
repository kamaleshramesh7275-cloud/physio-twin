import React, { useState } from "react";
import { Dumbbell, CheckSquare, Square, X, Users, CheckCircle2, ShieldAlert, Sparkles, Send } from "lucide-react";

export interface BulkAthleteItem {
  id: string;
  name: string;
  sport: string;
  riskStatus: "optimal" | "compensating" | "critical";
  acwr: number;
  assignedDrill?: string;
}

interface BulkCorrectiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  athletes: BulkAthleteItem[];
  onBroadcast: (selectedAthleteIds: string[], protocolName: string) => void;
}

const PRESET_PROTOCOLS = [
  {
    id: "proto-1",
    name: "Valgus Reduction Micro-Dose",
    subtitle: "Banded Clamshells + Spanish Squat Isometric Holds (3x12)",
    target: "Medial Knee Collateral & VMO Firing",
    recommendedFor: ["critical", "compensating"]
  },
  {
    id: "proto-2",
    name: "Hamstring Strain Shield",
    subtitle: "Eccentric Nordic Curls + Romanian Deadlift Tempo 4-0-1 (3x6)",
    target: "Hamstring:Quad Force Ratio & Knee Extension Deceleration",
    recommendedFor: ["compensating"]
  },
  {
    id: "proto-3",
    name: "Lumbar Unloader & Anti-Extension",
    subtitle: "Deadbug Core Bracing + Bird-Dog Holds (3x45s)",
    target: "L4-L5 Disc Shear Reduction & Transverse Bracing",
    recommendedFor: ["critical", "compensating"]
  },
  {
    id: "proto-4",
    name: "25% Volume Deload & Readiness Reset",
    subtitle: "Mandatory 25% tonnage reduction for next 48 hours",
    target: "Gabbett ACWR Danger Zone Management (>1.5 Ratio)",
    recommendedFor: ["critical"]
  }
];

export const BulkCorrectiveModal: React.FC<BulkCorrectiveModalProps> = ({
  isOpen,
  onClose,
  athletes,
  onBroadcast
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    athletes.filter(a => a.riskStatus === "critical" || a.acwr > 1.4).map(a => a.id)
  );
  const [selectedProtocol, setSelectedProtocol] = useState<string>(PRESET_PROTOCOLS[0].name);
  const [broadcasted, setBroadcasted] = useState(false);

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllDanger = () => {
    setSelectedIds(athletes.filter(a => a.acwr > 1.4 || a.riskStatus === "critical").map(a => a.id));
  };

  const handleSelectAll = () => {
    setSelectedIds(athletes.map(a => a.id));
  };

  const handleDeselectAll = () => {
    setSelectedIds([]);
  };

  const handleSubmit = () => {
    if (selectedIds.length === 0) return;
    onBroadcast(selectedIds, selectedProtocol);
    setBroadcasted(true);
    setTimeout(() => {
      setBroadcasted(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/20 text-primary border border-primary/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold uppercase text-primary">Squad Batch Intervention</div>
              <h2 className="text-xl font-black text-foreground">Bulk Corrective Protocol Broadcaster</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Quick Selection Buttons */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                1. Select Athletes to Receive Protocol ({selectedIds.length} of {athletes.length} selected)
              </span>
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={handleSelectAllDanger}
                  className="text-red-400 hover:underline font-semibold"
                >
                  Select All Danger/Critical
                </button>
                <span>•</span>
                <button
                  onClick={handleSelectAll}
                  className="text-primary hover:underline font-semibold"
                >
                  Select All
                </button>
                <span>•</span>
                <button
                  onClick={handleDeselectAll}
                  className="text-muted-foreground hover:underline"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Athlete List Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 border border-border rounded-xl bg-slate-950/40">
              {athletes.map(a => {
                const isSelected = selectedIds.includes(a.id);
                const isCrit = a.riskStatus === "critical";
                const isComp = a.riskStatus === "compensating";

                return (
                  <div
                    key={a.id}
                    onClick={() => toggleSelect(a.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? "border-primary bg-primary/10 shadow-sm"
                        : "border-border/60 hover:border-border bg-slate-900/30"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-primary shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-muted-foreground shrink-0" />
                      )}
                      <div>
                        <div className="text-xs font-bold text-foreground">{a.name}</div>
                        <div className="text-[10px] text-muted-foreground">{a.sport}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        isCrit
                          ? "bg-red-500/20 text-red-400 border border-red-500/40"
                          : isComp
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                          : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      }`}>
                        {a.acwr}x
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Corrective Protocol Presets */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
              2. Select Corrective Micro-Protocol to Deploy
            </span>

            <div className="grid grid-cols-1 gap-2.5">
              {PRESET_PROTOCOLS.map(proto => {
                const isChosen = selectedProtocol === proto.name;

                return (
                  <div
                    key={proto.id}
                    onClick={() => setSelectedProtocol(proto.name)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                      isChosen
                        ? "border-primary bg-primary/10 ring-1 ring-primary shadow-sm"
                        : "border-border bg-slate-900/30 hover:border-border/80"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Dumbbell className={`w-4 h-4 ${isChosen ? "text-primary" : "text-muted-foreground"}`} />
                        <h4 className="font-bold text-sm text-foreground">{proto.name}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground">{proto.subtitle}</p>
                      <div className="text-[10px] font-mono text-cyan-400">
                        Target: {proto.target}
                      </div>
                    </div>

                    <div className="shrink-0 pt-1">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isChosen ? "border-primary bg-primary" : "border-muted-foreground"
                      }`}>
                        {isChosen && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Feedback message */}
          {broadcasted && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Corrective protocol successfully broadcast to {selectedIds.length} athlete accounts!
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-slate-900/40 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={selectedIds.length === 0}
            className="btn-primary px-6 py-2.5 text-xs font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
          >
            <Send className="w-4 h-4" />
            Broadcast to {selectedIds.length} Athletes
          </button>
        </div>

      </div>
    </div>
  );
};

