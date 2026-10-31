import React, { useState } from "react";
import { Link } from "wouter";
import {
  TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp,
  FlaskConical, AlertTriangle, Sparkles, ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer, LineChart, Line, Tooltip as RechartTooltip
} from "recharts";
import type { MetricTrendItem } from "./PredictiveTrendsView";

// ── Trend helpers ─────────────────────────────────────────────────────────────
function trendColor(dir: string | undefined, status: string | undefined) {
  if (status === "high" || status === "low" || status === "flagged") return "text-rose-600";
  if (dir === "up")   return "text-amber-600";
  if (dir === "down") return "text-amber-600";
  return "text-emerald-700";
}

function trendLabel(dir: string | undefined, status: string | undefined) {
  if (status === "high" || status === "low" || status === "flagged") return "Flagged";
  if (dir === "up")   return "Rising";
  if (dir === "down") return "Falling";
  return "Stable";
}

function TrendIcon({ dir, status, className }: { dir?: string; status?: string; className?: string }) {
  const isFlag = status === "high" || status === "low" || status === "flagged";
  if (isFlag) return <AlertTriangle className={`w-3.5 h-3.5 text-rose-600 ${className ?? ""}`} />;
  if (dir === "up")   return <TrendingUp   className={`w-3.5 h-3.5 text-amber-600 ${className ?? ""}`} />;
  if (dir === "down") return <TrendingDown className={`w-3.5 h-3.5 text-amber-600 ${className ?? ""}`} />;
  return <Minus className={`w-3.5 h-3.5 text-emerald-600 ${className ?? ""}`} />;
}

// ── Sparkline ─────────────────────────────────────────────────────────────────
function MiniSparkline({ history, color }: { history: MetricTrendItem["history"]; color: string }) {
  if (!history || history.length < 2) return null;
  const data = history.slice(-6).map(h => ({ v: h.value }));
  return (
    <div className="w-16 h-6 shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
          <RechartTooltip content={() => null} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Single metric card ────────────────────────────────────────────────────────
function SystemicCard({ metric }: { metric: MetricTrendItem }) {
  const [expanded, setExpanded] = useState(false);
  const dir    = metric.prediction?.trend_direction;
  const status = metric.latest_status;
  const isFlagged = status === "high" || status === "low" || status === "flagged";

  // Build full chart data for expanded view
  const histPoints = metric.history.slice(-8).map(h => ({
    d: new Date(h.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    v: h.value,
  }));

  const lineColor =
    isFlagged            ? "#e11d48"   // rose-600
    : dir === "up" || dir === "down" ? "#d97706"  // amber-600
    : "#059669";                                   // emerald-600

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border transition-all cursor-pointer select-none ${
        isFlagged
          ? "bg-rose-50/70 border-rose-200 hover:border-rose-300"
          : "bg-white border-slate-200 hover:border-blue-300 shadow-2xs"
      }`}
      onClick={() => setExpanded(p => !p)}
    >
      {/* Collapsed row */}
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        {/* Coloured status dot */}
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            isFlagged ? "bg-rose-600 animate-pulse" : lineColor === "#059669" ? "bg-emerald-600" : "bg-amber-500"
          }`}
        />

        {/* Name + value */}
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-bold text-slate-900 truncate leading-tight">
            {metric.canonical_name}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="font-mono text-[11px] font-black text-slate-900">
              {metric.latest_value ?? "—"}
            </span>
            <span className="text-[10px] text-slate-500">{metric.unit}</span>
            <span className={`text-[10px] font-bold flex items-center gap-0.5 ${trendColor(dir, status)}`}>
              <TrendIcon dir={dir} status={status} />
              {trendLabel(dir, status)}
            </span>
          </div>
        </div>

        {/* Sparkline */}
        <MiniSparkline history={metric.history} color={lineColor} />

        {/* Expand chevron */}
        <div className="text-slate-400 shrink-0">
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-2 border-t border-slate-100 pt-2 bg-slate-50/50 rounded-b-xl">
              {/* Full chart */}
              {histPoints.length >= 2 && (
                <div className="h-20 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={histPoints} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                      <Line
                        type="monotone"
                        dataKey="v"
                        stroke={lineColor}
                        strokeWidth={2}
                        dot={{ r: 3, fill: lineColor, strokeWidth: 0 }}
                        isAnimationActive={false}
                      />
                      <RechartTooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          return (
                            <div className="bg-white border border-slate-200 shadow-md rounded-lg px-2 py-1 text-[10px]">
                              <span className="font-mono font-black text-slate-900">
                                {payload[0].value} {metric.unit}
                              </span>
                            </div>
                          );
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Prediction note */}
              {metric.prediction?.has_prediction && metric.prediction.predicted_value != null && (
                <div className="text-[10px] text-slate-600 bg-white border border-slate-200 rounded-lg px-2 py-1.5 shadow-2xs">
                  60-day projection:{" "}
                  <span className="font-mono font-bold text-slate-900">
                    {metric.prediction.predicted_value} {metric.unit}
                  </span>
                  {metric.prediction.expected_range_min != null && (
                    <span className="ml-1 text-slate-500">
                      ({metric.prediction.expected_range_min}–{metric.prediction.expected_range_max})
                    </span>
                  )}
                </div>
              )}

              {/* Report link */}
              <Link
                href="/clinic"
                className="flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-700 transition-colors font-semibold"
                onClick={e => e.stopPropagation()}
              >
                <ExternalLink className="w-3 h-3" />
                View in Clinic Portal
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 flex items-center gap-2.5 animate-pulse">
      <div className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-2.5 bg-slate-200 rounded w-2/3" />
        <div className="h-2 bg-slate-200/80 rounded w-1/3" />
      </div>
      <div className="w-16 h-6 bg-slate-200/80 rounded" />
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────
interface SystemicInsightsPanelProps {
  metrics: MetricTrendItem[];
  isLoading: boolean;
  showHeader?: boolean;
}

export function SystemicInsightsPanel({ metrics, isLoading, showHeader = false }: SystemicInsightsPanelProps) {
  const flagged  = metrics.filter(m => m.latest_status === "high" || m.latest_status === "low" || m.latest_status === "flagged");
  const routine  = metrics.filter(m => m.latest_status !== "high" && m.latest_status !== "low" && m.latest_status !== "flagged");

  return (
    <div className="space-y-2">
      {/* Optional section header */}
      {showHeader && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <FlaskConical className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
              Lab Insights
            </span>
          </div>
          {metrics.length > 0 && (
            <Link
              href="/clinic"
              className="flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-700 transition-colors font-semibold"
            >
              <Sparkles className="w-3 h-3" /> Clinic Portal
            </Link>
          )}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-2">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && metrics.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-4 text-center space-y-2">
          <FlaskConical className="w-6 h-6 text-slate-400 mx-auto" />
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Upload a clinic report to see insights here
          </p>
          <Link
            href="/clinic"
            className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 font-semibold transition-colors"
          >
            <ExternalLink className="w-3 h-3" /> Go to Clinic Portal
          </Link>
        </div>
      )}

      {/* Flagged first */}
      {!isLoading && flagged.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-[9px] font-bold text-rose-700 uppercase tracking-widest px-0.5 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-rose-600" /> Flagged ({flagged.length})
          </div>
          {flagged.map(m => (
            <SystemicCard key={m.metric_key} metric={m} />
          ))}
        </div>
      )}

      {/* Routine */}
      {!isLoading && routine.length > 0 && (
        <div className="space-y-1.5">
          {flagged.length > 0 && (
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-0.5">
              All Biomarkers ({routine.length})
            </div>
          )}
          {routine.map(m => (
            <SystemicCard key={m.metric_key} metric={m} />
          ))}
        </div>
      )}
    </div>
  );
}
