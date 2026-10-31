import type { ZoneId } from "../HoloModel3D";
import type { GroupedRegionalInsight } from "../context/ClinicInsightsContext";

export type HeatSourceCategory = 
  | "clinicInsight" 
  | "onboardingInjury" 
  | "postureScan" 
  | "selfReportedPain" 
  | "kineticBleed"
  | "strain";

export interface HeatSource {
  id: string;
  region: ZoneId;
  intensity: number; // 0.0 to 1.0
  radius: number;    // Influence falloff radius in mesh units
  source: HeatSourceCategory;
  label: string;
  detail: string;
  timestamp: string; // ISO date or relative description
  confidence?: number; // 0.0 to 1.0 Bayesian confidence weight
}

export interface RegionHeatSummary {
  region: ZoneId;
  effectiveIntensity: number; // 0.0 to 1.0
  riskPercentage: number;     // 0 to 100
  label: "Healthy" | "Low Strain" | "Moderate Pain" | "High Pain/Strain";
  sources: HeatSource[];
}

// ── Kinetic Chain Neighbor Compensation Graph ──────────────────
// Maps a primary overloaded joint to secondary compensatory joints
const KINETIC_CHAIN_COUPLINGS: Record<ZoneId, { target: ZoneId; transferFactor: number; reason: string }[]> = {
  left_knee: [
    { target: "left_hip", transferFactor: 0.28, reason: "Gluteus medius firing lag compensating for knee valgus" },
    { target: "lumbar", transferFactor: 0.20, reason: "Pelvic lateral sway shifting axial load onto L4/L5 lumbar spine" },
    { target: "left_ankle", transferFactor: 0.22, reason: "Excessive subtalar pronation paired with knee collapse" }
  ],
  right_knee: [
    { target: "right_hip", transferFactor: 0.28, reason: "Gluteus medius firing lag compensating for knee valgus" },
    { target: "lumbar", transferFactor: 0.20, reason: "Pelvic lateral sway shifting axial load onto L4/L5 lumbar spine" },
    { target: "right_ankle", transferFactor: 0.22, reason: "Excessive subtalar pronation paired with knee collapse" }
  ],
  lumbar: [
    { target: "left_hip", transferFactor: 0.24, reason: "Hip flexor tightness accentuating anterior pelvic tilt" },
    { target: "right_hip", transferFactor: 0.24, reason: "Hip flexor tightness accentuating anterior pelvic tilt" },
    { target: "neck", transferFactor: 0.18, reason: "Compensatory cervical lordosis from altered spinal curvature" }
  ],
  neck: [
    { target: "head", transferFactor: 0.35, reason: "Suboccipital extensor tension causing cervicogenic headache risk" },
    { target: "lumbar", transferFactor: 0.15, reason: "Spinal kinetic moment arm increasing thoracic/lumbar shear" }
  ],
  left_shoulder: [
    { target: "neck", transferFactor: 0.25, reason: "Upper trapezius over-recruitment compensating for rotator cuff lag" },
    { target: "lumbar", transferFactor: 0.18, reason: "Lateral trunk tilt during overhead press compensations" }
  ],
  right_shoulder: [
    { target: "neck", transferFactor: 0.25, reason: "Upper trapezius over-recruitment compensating for rotator cuff lag" },
    { target: "lumbar", transferFactor: 0.18, reason: "Lateral trunk tilt during overhead press compensations" }
  ],
  left_hip: [
    { target: "left_knee", transferFactor: 0.32, reason: "Hip abductor weakness driving dynamic knee valgus moment" },
    { target: "lumbar", transferFactor: 0.25, reason: "Pelvic instability inducing compensatory lumbar hyperlordosis" }
  ],
  right_hip: [
    { target: "right_knee", transferFactor: 0.32, reason: "Hip abductor weakness driving dynamic knee valgus moment" },
    { target: "lumbar", transferFactor: 0.25, reason: "Pelvic instability inducing compensatory lumbar hyperlordosis" }
  ],
  left_ankle: [
    { target: "left_knee", transferFactor: 0.30, reason: "Limited talocrural dorsiflexion forcing premature knee flexion" },
    { target: "left_shin", transferFactor: 0.25, reason: "Tibialis anterior eccentric deceleration strain" }
  ],
  right_ankle: [
    { target: "right_knee", transferFactor: 0.30, reason: "Limited talocrural dorsiflexion forcing premature knee flexion" },
    { target: "right_shin", transferFactor: 0.25, reason: "Tibialis anterior eccentric deceleration strain" }
  ],
  head: [],
  chest: [
    { target: "neck", transferFactor: 0.20, reason: "Pectoral tightness drawing scapula forward into cervical strain" }
  ],
  left_arm: [],
  right_arm: [],
  left_forearm: [],
  right_forearm: [],
  left_thigh: [
    { target: "left_knee", transferFactor: 0.25, reason: "Quadriceps strength deficit increasing patellofemoral shear" }
  ],
  right_thigh: [
    { target: "right_knee", transferFactor: 0.25, reason: "Quadriceps strength deficit increasing patellofemoral shear" }
  ],
  left_shin: [],
  right_shin: [],
};

// ── Multi-Source Confidence Weighting ──────────────────────────
const SOURCE_CONFIDENCE: Record<HeatSourceCategory, number> = {
  clinicInsight: 0.90,     // Clinical report diagnosis
  postureScan: 0.85,       // Computer vision markerless scan
  onboardingInjury: 0.75,  // Verified intake history
  selfReportedPain: 0.70,  // Patient direct rating
  strain: 0.65,            // Hevy workout load calculation
  kineticBleed: 0.60,      // Biomechanical kinetic coupling
};

/**
 * Aggregates heat sources with kinetic chain neighbor bleed,
 * temporal decay, and confidence-weighted fusion.
 */
export function aggregateHeatSources(initialSources: HeatSource[]): Record<ZoneId, RegionHeatSummary> {
  // 1. Generate kinetic chain neighbor bleed sources
  const allSources = [...initialSources];
  const bleedSources: HeatSource[] = [];

  for (const src of initialSources) {
    if (src.source === "kineticBleed") continue; // Prevent infinite circular recursion
    if (src.intensity < 0.35) continue; // Only significant strains bleed across joints

    const couplings = KINETIC_CHAIN_COUPLINGS[src.region] || [];
    for (const coupling of couplings) {
      const bledIntensity = parseFloat((src.intensity * coupling.transferFactor).toFixed(2));
      if (bledIntensity >= 0.12) {
        bleedSources.push({
          id: `bleed-${src.id}-${coupling.target}`,
          region: coupling.target,
          intensity: bledIntensity,
          radius: 0.26,
          source: "kineticBleed",
          label: `Kinetic Bleed from ${src.region.replace(/_/g, " ")}`,
          detail: coupling.reason,
          timestamp: "Biomechanical Compensation",
          confidence: SOURCE_CONFIDENCE.kineticBleed,
        });
      }
    }
  }

  allSources.push(...bleedSources);

  // 2. Group by anatomical region
  const grouped: Partial<Record<ZoneId, HeatSource[]>> = {};
  for (const src of allSources) {
    if (!grouped[src.region]) grouped[src.region] = [];
    grouped[src.region]!.push(src);
  }

  const result: Partial<Record<ZoneId, RegionHeatSummary>> = {};

  for (const [regionKey, regionSources] of Object.entries(grouped) as [ZoneId, HeatSource[]][]) {
    if (!regionSources || regionSources.length === 0) continue;

    // Sort by confidence-weighted intensity descending
    const sorted = [...regionSources].sort((a, b) => {
      const confA = a.confidence ?? SOURCE_CONFIDENCE[a.source] ?? 0.6;
      const confB = b.confidence ?? SOURCE_CONFIDENCE[b.source] ?? 0.6;
      return (b.intensity * confB) - (a.intensity * confA);
    });

    const top = sorted[0];
    const topConf = top.confidence ?? SOURCE_CONFIDENCE[top.source] ?? 0.6;
    const baseEffective = top.intensity * (0.85 + topConf * 0.15);

    // Diminishing returns compound boost for multi-source confirmation
    let compoundBoost = 0;
    for (let i = 1; i < sorted.length; i++) {
      const sub = sorted[i];
      const subConf = sub.confidence ?? SOURCE_CONFIDENCE[sub.source] ?? 0.6;
      compoundBoost += sub.intensity * subConf * 0.06;
    }

    const effectiveIntensity = Math.min(1.0, parseFloat((baseEffective + compoundBoost).toFixed(2)));
    const riskPercentage = Math.round(effectiveIntensity * 100);

    let label: RegionHeatSummary["label"] = "Healthy";
    if (riskPercentage >= 65) label = "High Pain/Strain";
    else if (riskPercentage >= 35) label = "Moderate Pain";
    else if (riskPercentage > 0) label = "Low Strain";

    result[regionKey] = {
      region: regionKey,
      effectiveIntensity,
      riskPercentage,
      label,
      sources: sorted,
    };
  }

  return result as Record<ZoneId, RegionHeatSummary>;
}

/**
 * Collect all active heat sources across clinic insights, onboarding injuries,
 * posture scans, self-reported pain (with temporal decay), and workout strain.
 */
export function collectAllHeatSources(options: {
  regionalInsights?: GroupedRegionalInsight[];
  userProfile?: any;
  lastSession?: any;
  selfReportedPain?: Record<string, { intensity: number; note?: string; timestamp: string; recordedAtMs?: number }>;
}): HeatSource[] {
  const sources: HeatSource[] = [];

  // 1. Clinic Insights
  if (options.regionalInsights) {
    for (const group of options.regionalInsights) {
      if (!group.metrics || group.metrics.length === 0) continue;
      const flaggedCount = group.metrics.filter(
        m => m.latest_status === "high" || m.latest_status === "low" || m.latest_status === "flagged"
      ).length;
      
      if (flaggedCount === 0) continue;

      const intensity = Math.min(1.0, 0.45 + flaggedCount * 0.2);
      const metricNames = group.metrics.map(m => m.canonical_name).join(", ");

      sources.push({
        id: `clinic-${group.zone}`,
        region: group.zone,
        intensity,
        radius: 0.28,
        source: "clinicInsight",
        label: "Clinic Lab Finding",
        detail: `Lab metrics: ${metricNames} (${flaggedCount} flagged)`,
        timestamp: "Clinic Report",
        confidence: SOURCE_CONFIDENCE.clinicInsight,
      });
    }
  }

  // 2. Onboarding Baseline Injury History
  if (options.userProfile) {
    const rawPainZone = options.userProfile.painZone || localStorage.getItem("pt_user_pain_zone");
    const rawPainLevel = options.userProfile.painLevel || localStorage.getItem("pt_user_pain_level");

    if (rawPainZone && rawPainZone !== "none" && rawPainZone !== "null") {
      const zoneKey = mapTextToZoneId(rawPainZone);
      if (zoneKey) {
        const pLevel = typeof rawPainLevel === "number" ? rawPainLevel : parseInt(rawPainLevel || "0", 10);
        if (pLevel > 0) {
          const intensity = Math.min(1.0, Math.max(0.2, pLevel / 10));

          sources.push({
            id: `onboarding-${zoneKey}`,
            region: zoneKey,
            intensity,
            radius: 0.32,
            source: "onboardingInjury",
            label: "Baseline Injury History",
            detail: `Onboarding baseline pain area (${pLevel}/10 severity)`,
            timestamp: "Baseline Intake",
            confidence: SOURCE_CONFIDENCE.onboardingInjury,
          });
        }
      }
    }
  }

  // 3. Posture Scan & Vision Kinematics
  if (options.lastSession) {
    const ls = options.lastSession;
    if (ls.shoulderTilt && ls.shoulderTilt > 1.8) {
      const intensity = Math.min(1.0, parseFloat((ls.shoulderTilt / 9.5).toFixed(2)));
      sources.push({
        id: "scan-shoulder",
        region: "left_shoulder",
        intensity,
        radius: 0.26,
        source: "postureScan",
        label: "Posture Scan (Shoulder Tilt)",
        detail: `Shoulder asymmetry: ${ls.shoulderTilt.toFixed(1)}° tilt`,
        timestamp: "Recent Scan",
        confidence: SOURCE_CONFIDENCE.postureScan,
      });
    }
    if (ls.hipTilt && ls.hipTilt > 1.8) {
      const intensity = Math.min(1.0, parseFloat((ls.hipTilt / 8.5).toFixed(2)));
      sources.push({
        id: "scan-hip",
        region: "left_hip",
        intensity,
        radius: 0.30,
        source: "postureScan",
        label: "Posture Scan (Pelvic Tilt)",
        detail: `Pelvic asymmetry: ${ls.hipTilt.toFixed(1)}° tilt`,
        timestamp: "Recent Scan",
        confidence: SOURCE_CONFIDENCE.postureScan,
      });
      sources.push({
        id: "scan-lumbar",
        region: "lumbar",
        intensity: Math.min(1.0, parseFloat((intensity * 1.15).toFixed(2))),
        radius: 0.35,
        source: "postureScan",
        label: "Posture Scan (Lumbar Load)",
        detail: `Compensatory lumbar load from ${ls.hipTilt.toFixed(1)}° pelvic tilt`,
        timestamp: "Recent Scan",
        confidence: SOURCE_CONFIDENCE.postureScan,
      });
    }
    if (ls.headForward && ls.headForward > 1.8) {
      const intensity = Math.min(1.0, parseFloat((ls.headForward / 7.5).toFixed(2)));
      sources.push({
        id: "scan-neck",
        region: "neck",
        intensity,
        radius: 0.24,
        source: "postureScan",
        label: "Posture Scan (Head Forward Shift)",
        detail: `Forward head displacement: ${ls.headForward.toFixed(1)} cm`,
        timestamp: "Recent Scan",
        confidence: SOURCE_CONFIDENCE.postureScan,
      });
    }
    if (ls.rom && (ls.rom < 85 || (ls.symmetry && ls.symmetry < 0.92))) {
      const intensity = Math.min(1.0, parseFloat(((1 - (ls.symmetry || 0.95)) * 4 + 0.32).toFixed(2)));
      sources.push({
        id: "scan-knee",
        region: "left_knee",
        intensity,
        radius: 0.28,
        source: "postureScan",
        label: "Posture Scan (Knee Kinematics)",
        detail: `Range of motion: ${Math.round(ls.rom)}°, Symmetry: ${Math.round((ls.symmetry || 0.95) * 100)}%`,
        timestamp: "Recent Scan",
        confidence: SOURCE_CONFIDENCE.postureScan,
      });
    }
  }

  // 4. Self-Reported Pain with Exponential Temporal Half-Life Decay
  const selfReportMap = options.selfReportedPain || getStoredSelfReportedPain();
  const nowMs = Date.now();
  const HALF_LIFE_DAYS = 7.0; // 7-day half-life for untreated pain decay

  for (const [zoneKey, entry] of Object.entries(selfReportMap)) {
    if (entry && entry.intensity > 0) {
      // Calculate elapsed days for exponential decay
      const recordedMs = entry.recordedAtMs || nowMs;
      const elapsedDays = Math.max(0, (nowMs - recordedMs) / (1000 * 60 * 60 * 24));
      const decayFactor = Math.exp(- (0.693 * elapsedDays) / HALF_LIFE_DAYS);
      const effectiveIntensity = parseFloat(Math.max(0.05, entry.intensity * decayFactor).toFixed(2));

      sources.push({
        id: `self-${zoneKey}`,
        region: zoneKey as ZoneId,
        intensity: effectiveIntensity,
        radius: 0.30,
        source: "selfReportedPain",
        label: "Patient Self-Reported Pain",
        detail: `${entry.note || "Direct patient self-reported pain score"} (${Math.round(entry.intensity * 10)}/10 initial, ${Math.round(effectiveIntensity * 100)}% active)`,
        timestamp: entry.timestamp || "Today",
        confidence: SOURCE_CONFIDENCE.selfReportedPain,
      });
    }
  }

  return sources;
}

export function getStoredSelfReportedPain(): Record<string, { intensity: number; note?: string; timestamp: string; recordedAtMs?: number }> {
  try {
    const raw = localStorage.getItem("pt_self_reported_pain");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveStoredSelfReportedPain(zone: ZoneId, intensity: number, note?: string) {
  try {
    const current = getStoredSelfReportedPain();
    current[zone] = {
      intensity: Math.max(0, Math.min(1.0, intensity)),
      note: note || `Pain rating ${Math.round(intensity * 10)}/10`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      recordedAtMs: Date.now(),
    };
    localStorage.setItem("pt_self_reported_pain", JSON.stringify(current));
  } catch (e) {
    console.error("Failed saving self-reported pain", e);
  }
}

function mapTextToZoneId(text: string): ZoneId | null {
  const norm = text.toLowerCase();
  if (norm.includes("knee") && norm.includes("right")) return "right_knee";
  if (norm.includes("knee")) return "left_knee";
  if (norm.includes("back") || norm.includes("lumbar")) return "lumbar";
  if (norm.includes("shoulder") && norm.includes("right")) return "right_shoulder";
  if (norm.includes("shoulder")) return "left_shoulder";
  if (norm.includes("hip") && norm.includes("right")) return "right_hip";
  if (norm.includes("hip")) return "left_hip";
  if (norm.includes("neck") || norm.includes("cervical")) return "neck";
  if (norm.includes("ankle") && norm.includes("right")) return "right_ankle";
  if (norm.includes("ankle")) return "left_ankle";
  if (norm.includes("chest")) return "chest";
  if (norm.includes("head")) return "head";
  return "left_knee";
}
