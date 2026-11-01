/**
 * Shareable Session Store & Telemetry Serializer
 * Enables zero-cost, 1-click public review links for doctors, physical therapists,
 * and athletic coaches without requiring login or account creation.
 */

import type { ForensicAutopsyReport, TelemetryFlightFrame } from "./flightRecorder";
import type { VirtualSEMGResult } from "./virtualSEMGEngine";
import type { LandmarkPoint } from "./kinematicFilters";

export interface ShareableSessionPayload {
  id: string;
  patientName: string;
  patientAge: number;
  sportOrActivity: string;
  sessionDate: string;
  sessionType: "squat-analysis" | "sit-to-stand" | "standing-posture" | "gait-analysis";
  durationSeconds: number;
  repsCompleted: number;
  overallFormScore: number;
  maxKneeFlexionDeg: number;
  peakKamNmKg: number;
  semgSnapshot: VirtualSEMGResult;
  autopsyReport?: ForensicAutopsyReport | null;
  keyLandmarks: LandmarkPoint[];
  clinicianNotes?: string[];
  clearanceStatus?: "cleared" | "restricted" | "pending";
}

const STORAGE_KEY = "physiotwin_shareable_sessions";

// Sample preloaded clinical patient sessions for immediate out-of-the-box demoing
const SEED_SESSIONS: Record<string, ShareableSessionPayload> = {
  "PT-84920": {
    id: "PT-84920",
    patientName: "Marcus Vance",
    patientAge: 24,
    sportOrActivity: "CrossFit / Olympic Weightlifting",
    sessionDate: "2026-10-31",
    sessionType: "squat-analysis",
    durationSeconds: 45,
    repsCompleted: 5,
    overallFormScore: 78,
    maxKneeFlexionDeg: 82,
    peakKamNmKg: 0.54,
    semgSnapshot: {
      activations: {
        gluteusMaximus: 42,
        gluteusMedius: 18,
        vastusMedialis: 38,
        vastusLateralis: 84,
        rectusFemoris: 72,
        bicepsFemoris: 46,
        semitendinosus: 40,
        erectorSpinae: 88,
        rectusAbdominis: 65,
        gastrocnemius: 70
      },
      ratios: {
        gluteToLumbarRatio: 0.48, // Glute amnesia
        vmoToVlRatio: 0.45,       // Severe lateral quad dominance
        hamstringToQuadRatio: 0.43
      },
      fiberTelemetry: {
        eccentricForceMultiplier: 1.34,
        patellarMomentArmCm: 4.5,
        gluteMomentArmCm: 6.2,
        lumbarMomentArmCm: 5.6,
        vmoPennationAngleDeg: 19.5
      },
      diagnosticAlerts: [
        {
          id: "glute-amnesia",
          level: "danger",
          title: "Glute Amnesia & Lumbar Shear",
          message: "Erector spinae is firing at 88% while glutes underperform (42%). Overloading L4-L5 lumbar disc."
        },
        {
          id: "vmo-deficit",
          level: "warning",
          title: "Patellofemoral Tracking Deficit",
          message: "VMO (38%) is inhibited relative to outer quad (84%). High risk of lateral patellar wear."
        }
      ]
    },
    autopsyReport: {
      id: "autopsy-84920",
      incidentTimestampMs: 1730419200000,
      severity: "critical-shear",
      affectedStructure: "Left Anterior Cruciate Ligament (ACL: 8.8% Strain) & Medial Meniscus",
      peakShearTorqueNm: 62.4,
      peakGrfBodyweight: 2.3,
      peakAclStrainPercent: 8.8,
      peakLumbarShearNewtons: 540,
      peakLumbarCompNewtons: 2950,
      peakPatellofemoralStressMpa: 6.4,
      temporalResolutionHz: 120,
      causalChain: [
        {
          phase: "Trigger",
          relativeTimeMs: -380,
          jointTelemetry: "Knee: 142°, Trunk Pitch: 32°, Lumbar Shear: 320N",
          muscleActivationTelemetry: "Glute Medius: 48%, Core Bracing: 65%",
          description: "Descent initiation with subtle lateral weight shift onto left heel."
        },
        {
          phase: "Breakdown",
          relativeTimeMs: -160,
          jointTelemetry: "Valgus Drift: +4.2cm, ACL Strain: 6.2%, Angular Vel: 165°/s",
          muscleActivationTelemetry: "VMO: 24%, Glute Medius: 18%",
          description: "Neuromuscular inhibition: Gluteus Medius disengaged, allowing femur to internally rotate into valgus cave."
        },
        {
          phase: "Peak Shear Event",
          relativeTimeMs: 0,
          jointTelemetry: "Peak KAM: 62.4 N·m (0.54 N·m/kg), ACL Strain: 8.8%, Lumbar Shear: 540N",
          muscleActivationTelemetry: "Outer Quad (VL): 84%, Erector Spinae: 88%",
          description: "Ground reaction force peaked at 2.3× bodyweight while the joint was mechanically misaligned, transferring acute multi-axial shear into the ACL."
        }
      ],
      clinicalDiagnosis: "Acute Dynamic Valgus Joint Shear with 8.8% ACL Strain (Yield Threshold: 10.5%)",
      mechanisticRootCause: "Failure of proximal hip abductor (Gluteus Medius) recruitment at bottom turnaround, causing secondary internal rotation and abnormal lateral patellar tracking.",
      acutePrescription: [
        {
          phase: "Phase 1: Acute Protection & De-escalation",
          timeline: "Hours 0 – 48",
          protocol: [
            "Deload from deep knee flexion past 60° to eliminate shear across patellofemoral cartilage.",
            "Submaximal isometric quad sets: 4 sets × 30 seconds at 30° knee angle (pain-free zone).",
            "Supine diaphragmatic breathing with transverse abdominis bracing (5 minutes twice daily)."
          ],
          contraindications: [
            "No plyometrics or jump landings.",
            "Avoid loaded barbell squats below parallel until KAM drops below 0.30 Nm/kg."
          ]
        },
        {
          phase: "Phase 2: Neuromuscular Re-engagement",
          timeline: "Days 3 – 7",
          protocol: [
            "Banded Clamshells with 3-second isometric hold at top (3 sets × 12 reps each side).",
            "Terminal Knee Extensions (TKE) with resistance band to reactivate Vastus Medialis Oblique (VMO).",
            "Slow tempo box squats (3s eccentric) to a 100° elevated target box."
          ],
          contraindications: [
            "Do not allow knee to drift medial to the second toe during descent."
          ]
        }
      ]
    },
    keyLandmarks: [],
    clinicianNotes: [
      "Patient reports sharp pinch on medial knee compartment during turnaround on rep 4.",
      "Clear acute valgus collapse pattern. Recommend 1-week deload to elevated box squats."
    ],
    clearanceStatus: "restricted"
  },
  "PT-51204": {
    id: "PT-51204",
    patientName: "Elena Rostova",
    patientAge: 29,
    sportOrActivity: "Track & Field / 400m Hurdles",
    sessionDate: "2026-10-31",
    sessionType: "squat-analysis",
    durationSeconds: 38,
    repsCompleted: 6,
    overallFormScore: 94,
    maxKneeFlexionDeg: 90,
    peakKamNmKg: 0.22,
    semgSnapshot: {
      activations: {
        gluteusMaximus: 82,
        gluteusMedius: 78,
        vastusMedialis: 76,
        vastusLateralis: 80,
        rectusFemoris: 70,
        bicepsFemoris: 65,
        semitendinosus: 62,
        erectorSpinae: 60,
        rectusAbdominis: 82,
        gastrocnemius: 75
      },
      ratios: {
        gluteToLumbarRatio: 1.36,
        vmoToVlRatio: 0.95,
        hamstringToQuadRatio: 0.63
      },
      fiberTelemetry: {
        eccentricForceMultiplier: 1.38,
        patellarMomentArmCm: 4.6,
        gluteMomentArmCm: 6.5,
        lumbarMomentArmCm: 5.4,
        vmoPennationAngleDeg: 20.1
      },
      diagnosticAlerts: []
    },
    keyLandmarks: [],
    clinicianNotes: [
      "Exceptional bilateral symmetry (98%). Neutral pelvic alignment maintained throughout.",
      "VMO to VL balance is optimal. Cleared for full competition training volume."
    ],
    clearanceStatus: "cleared"
  }
};

/**
 * Saves or updates a session in local storage
 */
export function saveShareableSession(session: ShareableSessionPayload): string {
  try {
    const existing = getAllSessions();
    existing[session.id] = session;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    return session.id;
  } catch {
    return session.id;
  }
}

/**
 * Retrieves all stored shareable sessions
 */
export function getAllSessions(): Record<string, ShareableSessionPayload> {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const parsed = data ? JSON.parse(data) : {};
    return { ...SEED_SESSIONS, ...parsed };
  } catch {
    return { ...SEED_SESSIONS };
  }
}

/**
 * Retrieves a session by ID or decodes from URL
 */
export function getShareableSession(id: string): ShareableSessionPayload | null {
  const all = getAllSessions();
  return all[id] || null;
}

/**
 * Appends a clinical note to an existing session
 */
export function appendClinicianNote(sessionId: string, note: string, clearance?: ShareableSessionPayload["clearanceStatus"]): boolean {
  const session = getShareableSession(sessionId);
  if (!session) return false;

  session.clinicianNotes = session.clinicianNotes ? [...session.clinicianNotes, note] : [note];
  if (clearance) session.clearanceStatus = clearance;
  saveShareableSession(session);
  return true;
}

/**
 * Generates an absolute public review URL
 */
export function generateShareableUrl(sessionId: string): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://physiotwin.app";
  return `${origin}/review?id=${sessionId}`;
}

