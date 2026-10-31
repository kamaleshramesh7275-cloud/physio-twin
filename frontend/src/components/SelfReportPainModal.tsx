import React, { useState } from "react";
import { X, Flame, AlertCircle, CheckCircle2 } from "lucide-react";
import type { ZoneId } from "../HoloModel3D";
import { saveStoredSelfReportedPain } from "../lib/heatMapEngine";

interface SelfReportPainModalProps {
  zone: ZoneId | null;
  onClose: () => void;
  onSaved: () => void;
}

export function SelfReportPainModal({ zone, onClose, onSaved }: SelfReportPainModalProps) {
  const [painLevel, setPainLevel] = useState<number>(6);
  const [painType, setPainType] = useState<string>("Aching");
  const [note, setNote] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);

  if (!zone) return null;

  const zoneLabel = zone.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  const handleSave = () => {
    const intensity = painLevel / 10;
    const fullNote = `${painType} pain (${painLevel}/10). ${note}`.trim();
    saveStoredSelfReportedPain(zone, intensity, fullNote);
    setSubmitted(true);
    setTimeout(() => {
      onSaved();
      onClose();
    }, 600);
  };

  const getSeverityBadge = (val: number) => {
    if (val >= 8) return { label: "Severe Pain", color: "bg-rose-50 text-rose-700 border-rose-200" };
    if (val >= 5) return { label: "Moderate Pain", color: "bg-amber-50 text-amber-800 border-amber-200" };
    if (val >= 1) return { label: "Mild Strain", color: "bg-amber-50/80 text-amber-700 border-amber-200" };
    return { label: "No Pain", color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  };

  const badge = getSeverityBadge(painLevel);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm anim-fade">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl text-slate-900 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-xs">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight text-slate-900">Log Self-Reported Pain</h2>
            <p className="text-xs text-slate-500">Target Region: <span className="text-blue-600 font-bold">{zoneLabel}</span></p>
          </div>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
            <div className="text-base font-bold text-emerald-800">Pain Logged to Digital Twin!</div>
            <p className="text-xs text-slate-500">Updating 3D continuous heat field map...</p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Pain Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-700">Pain Rating (0–10)</label>
                <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${badge.color}`}>
                  {painLevel}/10 · {badge.label}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={painLevel}
                onChange={e => setPainLevel(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-100 border border-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium mt-1">
                <span>0 (None)</span>
                <span>5 (Moderate)</span>
                <span>10 (Worst)</span>
              </div>
            </div>

            {/* Pain Quality Options */}
            <div>
              <label className="text-xs font-bold text-slate-700 mb-2 block">Pain Quality</label>
              <div className="grid grid-cols-4 gap-2">
                {["Aching", "Sharp", "Stiff", "Throbbing"].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setPainType(type)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      painType === type
                        ? "bg-blue-50 text-blue-700 border-blue-500 shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Note */}
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">Notes (Optional)</label>
              <input
                type="text"
                placeholder="e.g., Aggravated during leg press / morning stiffness"
                value={note}
                onChange={e => setNote(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-600 bg-blue-50/60 p-3 rounded-xl border border-blue-100">
              <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Self-reported pain blends directly into the 3D continuous heat field map on your avatar.</span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                Save to Digital Twin
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
