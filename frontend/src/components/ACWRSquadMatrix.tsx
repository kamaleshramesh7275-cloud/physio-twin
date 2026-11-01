import React, { useState } from "react";
import { Info, AlertTriangle, CheckCircle2, ShieldAlert, Sparkles, User, Crosshair } from "lucide-react";

export interface ACWRAthlete {
  id: string;
  name: string;
  sport: string;
  acuteLoad: number;   // 7-day rolling load (AU)
  chronicLoad: number; // 28-day rolling load (AU)
  acwr: number;        // acuteLoad / (chronicLoad / 4)
  riskStatus: "optimal" | "compensating" | "critical";
  sessionRef: string;
}

interface ACWRSquadMatrixProps {
  athletes: ACWRAthlete[];
  onSelectAthlete?: (athlete: ACWRAthlete) => void;
  onCompareAthlete?: (athlete: ACWRAthlete) => void;
  selectedId?: string | null;
}

export const ACWRSquadMatrix: React.FC<ACWRSquadMatrixProps> = ({
  athletes,
  onSelectAthlete,
  onCompareAthlete,
  selectedId
}) => {
  const [hoveredAthlete, setHoveredAthlete] = useState<ACWRAthlete | null>(null);

  // SVG dimensions & margins
  const width = 640;
  const height = 360;
  const margin = { top: 30, right: 30, bottom: 45, left: 60 };

  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  // Domain extents
  const minChronic = 1000;
  const maxChronic = 4000;
  const minAcute = 200;
  const maxAcute = 1600;

  // Coordinate scales
  const scaleX = (chronic: number) => {
    return margin.left + ((chronic - minChronic) / (maxChronic - minChronic)) * plotWidth;
  };

  const scaleY = (acute: number) => {
    return margin.top + plotHeight - ((acute - minAcute) / (maxAcute - minAcute)) * plotHeight;
  };

  // Convert ACWR boundaries to points across chronic domain [1000, 4000]
  // Acute = ACWR * (Chronic / 4)
  const getLinePoints = (ratio: number) => {
    const p1X = minChronic;
    const p1Y = ratio * (minChronic / 4);
    const p2X = maxChronic;
    const p2Y = ratio * (maxChronic / 4);
    return `${scaleX(p1X)},${scaleY(p1Y)} ${scaleX(p2X)},${scaleY(p2Y)}`;
  };

  // Polygon for Sweet Spot (0.8 to 1.3)
  const sweetSpotPolygon = `
    ${scaleX(minChronic)},${scaleY(0.8 * (minChronic / 4))}
    ${scaleX(maxChronic)},${scaleY(0.8 * (maxChronic / 4))}
    ${scaleX(maxChronic)},${scaleY(1.3 * (maxChronic / 4))}
    ${scaleX(minChronic)},${scaleY(1.3 * (minChronic / 4))}
  `;

  // Polygon for Overreaching (1.3 to 1.5)
  const overreachingPolygon = `
    ${scaleX(minChronic)},${scaleY(1.3 * (minChronic / 4))}
    ${scaleX(maxChronic)},${scaleY(1.3 * (maxChronic / 4))}
    ${scaleX(maxChronic)},${scaleY(1.5 * (maxChronic / 4))}
    ${scaleX(minChronic)},${scaleY(1.5 * (minChronic / 4))}
  `;

  // Polygon for Danger Zone (> 1.5)
  const dangerZonePolygon = `
    ${scaleX(minChronic)},${scaleY(1.5 * (minChronic / 4))}
    ${scaleX(maxChronic)},${scaleY(1.5 * (maxChronic / 4))}
    ${scaleX(maxChronic)},${scaleY(maxAcute)}
    ${scaleX(minChronic)},${scaleY(maxAcute)}
  `;

  return (
    <div className="card p-5 space-y-4 border border-border bg-card/60 backdrop-blur-md">
      {/* Title & Legend Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-foreground flex items-center gap-2">
              <Crosshair className="w-5 h-5 text-primary" />
              Gabbett ACWR Workload Matrix
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-primary/20 text-primary border border-primary/30">
              Tim Gabbett Clinical Model
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Acute (7-Day Fatigue) vs. Chronic (28-Day Fitness) Workload Ratio. Click athlete to inspect or duel.
          </p>
        </div>

        {/* Color Legend */}
        <div className="flex items-center gap-3 text-[11px] font-mono flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-emerald-400">Sweet Spot (0.8–1.3)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-amber-400">Overreaching (1.3–1.5)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-red-400">Danger Zone (&gt;1.5)</span>
          </div>
        </div>
      </div>

      {/* Interactive SVG Plot */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[500px] select-none"
        >
          {/* Shaded Background Zones */}
          {/* Danger Zone (> 1.5) */}
          <polygon
            points={dangerZonePolygon}
            fill="rgba(239, 68, 68, 0.12)"
            stroke="rgba(239, 68, 68, 0.3)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          {/* Overreaching (1.3 - 1.5) */}
          <polygon
            points={overreachingPolygon}
            fill="rgba(245, 158, 11, 0.12)"
            stroke="rgba(245, 158, 11, 0.3)"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          {/* Sweet Spot (0.8 - 1.3) */}
          <polygon
            points={sweetSpotPolygon}
            fill="rgba(16, 185, 129, 0.15)"
            stroke="rgba(16, 185, 129, 0.4)"
            strokeWidth="1.5"
          />

          {/* Zone Labels */}
          <text
            x={scaleX(2800)}
            y={scaleY(1.7 * (2800 / 4))}
            fill="#f87171"
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
            textAnchor="middle"
          >
            DANGER ZONE (&gt;1.5x)
          </text>
          <text
            x={scaleX(3200)}
            y={scaleY(1.4 * (3200 / 4))}
            fill="#fbbf24"
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
            textAnchor="middle"
          >
            OVERREACHING (1.3–1.5x)
          </text>
          <text
            x={scaleX(2500)}
            y={scaleY(1.05 * (2500 / 4))}
            fill="#34d399"
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
            textAnchor="middle"
          >
            SWEET SPOT (0.8–1.3x)
          </text>

          {/* Grid lines */}
          {[1000, 2000, 3000, 4000].map(val => (
            <g key={`x-grid-${val}`}>
              <line
                x1={scaleX(val)}
                y1={margin.top}
                x2={scaleX(val)}
                y2={margin.top + plotHeight}
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="1"
              />
              <text
                x={scaleX(val)}
                y={height - margin.bottom + 18}
                fill="#94a3b8"
                fontSize="10"
                fontFamily="monospace"
                textAnchor="middle"
              >
                {val}
              </text>
            </g>
          ))}

          {[400, 800, 1200, 1600].map(val => (
            <g key={`y-grid-${val}`}>
              <line
                x1={margin.left}
                y1={scaleY(val)}
                x2={margin.left + plotWidth}
                y2={scaleY(val)}
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="1"
              />
              <text
                x={margin.left - 10}
                y={scaleY(val) + 4}
                fill="#94a3b8"
                fontSize="10"
                fontFamily="monospace"
                textAnchor="end"
              >
                {val}
              </text>
            </g>
          ))}

          {/* Axis Labels */}
          <text
            x={margin.left + plotWidth / 2}
            y={height - 8}
            fill="#cbd5e1"
            fontSize="11"
            fontFamily="sans-serif"
            fontWeight="600"
            textAnchor="middle"
          >
            Chronic Workload (28-Day Fitness Baseline, AU) →
          </text>

          <text
            x={-(margin.top + plotHeight / 2)}
            y={18}
            fill="#cbd5e1"
            fontSize="11"
            fontFamily="sans-serif"
            fontWeight="600"
            textAnchor="middle"
            transform="rotate(-90)"
          >
            ↑ Acute Workload (7-Day Fatigue, AU)
          </text>

          {/* Athlete Data Points */}
          {athletes.map(a => {
            const cx = scaleX(a.chronicLoad);
            const cy = scaleY(a.acuteLoad);
            const isHovered = hoveredAthlete?.id === a.id;
            const isSelected = selectedId === a.id;

            let dotColor = "#10b981"; // emerald
            if (a.acwr > 1.5) dotColor = "#ef4444"; // red
            else if (a.acwr > 1.3) dotColor = "#f59e0b"; // amber

            return (
              <g
                key={a.id}
                className="cursor-pointer transition-all"
                onMouseEnter={() => setHoveredAthlete(a)}
                onMouseLeave={() => setHoveredAthlete(null)}
                onClick={() => onSelectAthlete?.(a)}
              >
                {/* Glow ring if selected or danger */}
                {(a.acwr > 1.5 || isSelected || isHovered) && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isHovered || isSelected ? 18 : 12}
                    fill={dotColor}
                    opacity={0.3}
                    className="animate-pulse"
                  />
                )}

                {/* Main Node */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 10 : 8}
                  fill={dotColor}
                  stroke="#ffffff"
                  strokeWidth={isSelected ? 3 : 1.5}
                />

                {/* Athlete Initials */}
                <text
                  x={cx}
                  y={cy + 3.5}
                  fill="#ffffff"
                  fontSize="8"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                  textAnchor="middle"
                  pointerEvents="none"
                >
                  {a.name.split(" ").map(n => n[0]).join("")}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Floating Tooltip */}
        {hoveredAthlete && (
          <div
            className="absolute z-20 pointer-events-none p-3 rounded-xl bg-slate-900/95 border border-primary/40 shadow-2xl space-y-1 text-xs"
            style={{
              left: `${Math.min(scaleX(hoveredAthlete.chronicLoad) + 15, width - 180)}px`,
              top: `${Math.max(scaleY(hoveredAthlete.acuteLoad) - 70, 10)}px`
            }}
          >
            <div className="font-black text-foreground flex items-center justify-between gap-3">
              <span>{hoveredAthlete.name}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                hoveredAthlete.acwr > 1.5 ? "bg-red-500/20 text-red-400" :
                hoveredAthlete.acwr > 1.3 ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"
              }`}>
                {hoveredAthlete.acwr}x
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground">{hoveredAthlete.sport}</div>
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/50 text-[10px] font-mono">
              <div>Acute (7d): <strong>{hoveredAthlete.acuteLoad} AU</strong></div>
              <div>Chronic (28d): <strong>{hoveredAthlete.chronicLoad} AU</strong></div>
            </div>
            <div className="text-[10px] text-primary/80 pt-0.5">
              Click to inspect &amp; duel this athlete
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
