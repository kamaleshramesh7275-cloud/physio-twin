import { useState } from "react";

export type ZoneId =
  | "head" | "neck" | "chest" | "lumbar"
  | "left_shoulder" | "right_shoulder"
  | "left_arm"      | "right_arm"
  | "left_forearm"  | "right_forearm"
  | "left_hip"      | "right_hip"
  | "left_thigh"    | "right_thigh"
  | "left_knee"     | "right_knee"
  | "left_shin"     | "right_shin"
  | "left_ankle"    | "right_ankle";

export type ZoneRisk = Partial<Record<ZoneId, number>>;

// Precise polygon mapping over a centralized anatomical figure (100x100 grid)
const REGIONS: Record<ZoneId, string> = {
  head: "43,4 57,4 59,14 41,14",
  neck: "45,15 55,15 57,19 43,19",
  chest: "35,20 65,20 63,33 37,33",
  lumbar: "38,34 62,34 63,45 37,45",
  left_shoulder: "66,20 75,23 74,31 64,28",
  right_shoulder: "34,20 25,23 26,31 36,28",
  left_arm: "73,32 79,46 72,48 65,34",
  right_arm: "27,32 21,46 28,48 35,34",
  left_forearm: "80,47 84,62 77,63 72,49",
  right_forearm: "20,47 16,62 23,63 28,49",
  left_hip: "51,46 64,46 66,54 51,57",
  right_hip: "49,46 36,46 34,54 49,57",
  left_thigh: "52,58 65,55 58,73 50,73",
  right_thigh: "48,58 35,55 42,73 50,73",
  left_knee: "50,74 58,74 56,80 49,80",
  right_knee: "50,74 42,74 44,80 51,80",
  left_shin: "49,81 55,81 53,94 48,94",
  right_shin: "51,81 45,81 47,94 52,94",
  left_ankle: "47,95 53,95 55,98 46,98",
  right_ankle: "53,95 47,95 45,98 54,98"
};

export interface HoloOverlayProps {
  riskData: ZoneRisk;
  selectedZone: ZoneId | null;
  onZoneClick: (zone: ZoneId) => void;
}

export default function HoloOverlay({ riskData, selectedZone, onZoneClick }: HoloOverlayProps) {
  const [hovered, setHovered] = useState<ZoneId | null>(null);

  return (
    <div className="absolute inset-0 z-0 bg-[#020a14] overflow-hidden flex items-center justify-center pointer-events-none">
      
      {/* Container aspect ratio set to match a typical standing body proportion */}
      <div className="relative w-full max-w-[60vh] md:max-w-3xl aspect-[1/1.6] pointer-events-auto">
        
        {/* The high-fidelity background image (loaded from public folder) */}
        <img 
          src="/holographic_body.png" 
          alt="Sci-Fi Anatomy Overlay" 
          className="absolute inset-0 w-full h-full object-contain opacity-90 transition-opacity duration-1000"
          style={{ mixBlendMode: 'screen', filter: 'contrast(1.2) brightness(1.1)' }}
        />
        
        {/* The interactive SVG overlay layer */}
        <svg 
          viewBox="0 0 100 100" 
          preserveAspectRatio="none" 
          className="absolute inset-0 w-full h-full"
        >
          <defs>
            <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-orange" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {Object.entries(REGIONS).map(([id, points]) => {
            const zone = id as ZoneId;
            const risk = riskData[zone] ?? 0;
            const isSelected = selectedZone === zone;
            const isHovered = hovered === zone;
            
            // Determine dynamic coloring based on risk levels
            let fillOpacity = 0;
            let fill = "transparent";
            let filter: string | undefined = undefined;
            
            if (risk >= 70) {
              fill = "#ef4444"; // red
              fillOpacity = 0.55;
              filter = "url(#glow-red)";
            } else if (risk >= 55) {
              fill = "#f59e0b"; // orange
              fillOpacity = 0.4;
              filter = "url(#glow-orange)";
            } else if (risk >= 35) {
              fill = "#10b981"; // green
              fillOpacity = 0.1;
            }
            
            // Interaction boosts
            if (isSelected) fillOpacity = Math.max(fillOpacity, 0.6);
            if (isHovered) fillOpacity += 0.2;

            return (
              <polygon
                key={zone}
                points={points}
                fill={fill}
                fillOpacity={fillOpacity}
                stroke={isSelected ? "rgba(255,255,255,0.9)" : "transparent"}
                strokeWidth={isSelected ? "0.8" : "0"}
                filter={filter}
                className="cursor-pointer transition-all duration-500 ease-out"
                style={{ mixBlendMode: fillOpacity > 0 ? 'screen' : 'normal' }}
                onMouseEnter={() => setHovered(zone)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => onZoneClick(zone)}
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}
