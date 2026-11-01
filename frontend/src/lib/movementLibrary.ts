/**
 * 3D Movement Kinematics Library
 * Provides frame-by-frame joint trajectories, ideal ghost form benchmarks,
 * and synchronized Hill-model muscle activation telemetry for dynamic 3D twin playback.
 */

export type ExerciseType = "squat" | "hop" | "deadlift" | "press";

export interface JointCoordinates3D {
  [zoneId: string]: [number, number, number];
}

export interface MovementFrame {
  timestampSec: number;
  phaseLabel: string;
  // Patient compromised trajectory
  patientJoints: JointCoordinates3D;
  // Ideal "Gold Standard" ghost trajectory
  ghostJoints: JointCoordinates3D;
  // Live joint angles (degrees)
  angles: {
    kneeFlexion: number;
    hipAngle: number;
    trunkInclination: number;
    valgusDevCm: number;
    qAngleDeg: number;
  };
  // Kinetic forces
  forces: {
    aclStrainPct: number;
    lumbarShearN: number;
    grfMultiplierBW: number; // Ground reaction force in bodyweight multiples
  };
  // Hill MTU activations (0 - 100%)
  muscles: {
    vmo: number;
    vl: number;
    gluteMax: number;
    gluteMed: number;
    hamstrings: number;
    erectorSpinae: number;
  };
}

export interface ExerciseDefinition {
  id: ExerciseType;
  title: string;
  targetPathology: string;
  durationSec: number;
  frameCount: number;
  frames: MovementFrame[];
}

// Base anatomical coordinates for standing neutral pose
const BASE_STAND: JointCoordinates3D = {
  head: [0, 1.72, 0.02],
  neck: [0, 1.55, 0.02],
  chest: [0, 1.36, 0.08],
  lumbar: [0, 1.12, 0.05],
  left_shoulder: [0.21, 1.42, 0.0],
  right_shoulder: [-0.21, 1.42, 0.0],
  left_arm: [0.28, 1.22, -0.02],
  right_arm: [-0.28, 1.22, -0.02],
  left_forearm: [0.34, 1.02, -0.03],
  right_forearm: [-0.34, 1.02, -0.03],
  left_hip: [0.12, 0.95, 0.03],
  right_hip: [-0.12, 0.95, 0.03],
  left_thigh: [0.12, 0.72, 0.04],
  right_thigh: [-0.12, 0.72, 0.04],
  left_knee: [0.12, 0.48, 0.06],
  right_knee: [-0.12, 0.48, 0.06],
  left_shin: [0.11, 0.28, 0.05],
  right_shin: [-0.11, 0.28, 0.05],
  left_ankle: [0.10, 0.08, 0.03],
  right_ankle: [-0.10, 0.08, 0.03],
};

function deepCloneJoints(joints: JointCoordinates3D): JointCoordinates3D {
  const out: JointCoordinates3D = {};
  for (const k in joints) {
    out[k] = [...joints[k]] as [number, number, number];
  }
  return out;
}

// ── 1. SQUAT TRAJECTORY GENERATOR ────────────────────────────────────────────
function generateSquatTrajectory(numFrames = 60): MovementFrame[] {
  const frames: MovementFrame[] = [];
  const duration = 2.4; // 2.4 seconds cycle

  for (let i = 0; i < numFrames; i++) {
    const tNorm = i / (numFrames - 1);
    // Smooth cosine wave: 0 (standing) -> 1 (deep bottom) -> 0 (standing)
    const cycle = (1 - Math.cos(tNorm * Math.PI * 2)) / 2;

    const ghostJoints = deepCloneJoints(BASE_STAND);
    const patientJoints = deepCloneJoints(BASE_STAND);

    // Vertical pelvic drop
    const dropY = cycle * 0.28;
    const trunkLeanZ = cycle * 0.12;

    // Apply ideal ghost displacements
    ghostJoints.lumbar[1] -= dropY;
    ghostJoints.lumbar[2] += trunkLeanZ;
    ghostJoints.chest[1] -= dropY;
    ghostJoints.chest[2] += trunkLeanZ * 1.2;
    ghostJoints.neck[1] -= dropY;
    ghostJoints.neck[2] += trunkLeanZ * 1.3;
    ghostJoints.head[1] -= dropY;
    ghostJoints.head[2] += trunkLeanZ * 1.35;

    ghostJoints.left_hip[1] -= dropY;
    ghostJoints.right_hip[1] -= dropY;
    ghostJoints.left_knee[1] -= dropY * 0.55;
    ghostJoints.right_knee[1] -= dropY * 0.55;
    ghostJoints.left_knee[2] += cycle * 0.09;
    ghostJoints.right_knee[2] += cycle * 0.09;

    // Patient trajectory includes dynamic Left Knee Valgus Collapse
    for (const k in ghostJoints) {
      patientJoints[k] = [...ghostJoints[k]];
    }
    // Medial collapse: left knee drifts inward towards centerline
    const valgusInwardX = cycle * 0.042; // ~4.2 cm inward drift
    patientJoints.left_knee[0] -= valgusInwardX;

    // Kinematics calculations
    const kneeFlexion = Math.round(165 - cycle * 85); // 165° down to 80°
    const hipAngle = Math.round(170 - cycle * 82);
    const trunkInclination = Math.round(12 + cycle * 22);
    const valgusDevCm = parseFloat((cycle * 4.2).toFixed(1));
    const qAngleDeg = parseFloat((14.0 + cycle * 7.5).toFixed(1));

    const aclStrainPct = parseFloat((3.8 + cycle * 5.4).toFixed(1));
    const lumbarShearN = Math.round(280 + cycle * 260);
    const grfMultiplierBW = parseFloat((1.0 + (cycle > 0.5 ? 0.35 : -0.15)).toFixed(2));

    const vmo = Math.round(35 + cycle * 42);
    const vl = Math.round(40 + cycle * 52); // Overactive vastus lateralis
    const gluteMax = Math.round(25 + cycle * 65);
    const gluteMed = Math.round(45 - cycle * 22); // Gluteus medius inhibition causing valgus
    const hamstrings = Math.round(30 + cycle * 35);
    const erectorSpinae = Math.round(35 + cycle * 55);

    let phaseLabel = "Standing Baseline";
    if (tNorm > 0.08 && tNorm < 0.45) phaseLabel = "Eccentric Descent";
    else if (tNorm >= 0.45 && tNorm <= 0.55) phaseLabel = "Deep Squat Inversion";
    else if (tNorm > 0.55 && tNorm < 0.92) phaseLabel = "Concentric Drive";

    frames.push({
      timestampSec: parseFloat((tNorm * duration).toFixed(2)),
      phaseLabel,
      patientJoints,
      ghostJoints,
      angles: { kneeFlexion, hipAngle, trunkInclination, valgusDevCm, qAngleDeg },
      forces: { aclStrainPct, lumbarShearN, grfMultiplierBW },
      muscles: { vmo, vl, gluteMax, gluteMed, hamstrings, erectorSpinae },
    });
  }

  return frames;
}

// ── 2. SINGLE-LEG HOP & LAND TRAJECTORY ───────────────────────────────────────
function generateHopTrajectory(numFrames = 60): MovementFrame[] {
  const frames: MovementFrame[] = [];
  const duration = 1.8;

  for (let i = 0; i < numFrames; i++) {
    const tNorm = i / (numFrames - 1);
    let liftY = 0;
    let cycle = 0;
    let grf = 1.0;
    let valgus = 0;
    let phase = "Preparation";

    if (tNorm < 0.25) {
      // Countermovement dip
      cycle = (1 - Math.cos((tNorm / 0.25) * Math.PI)) / 2;
      liftY = -cycle * 0.12;
      phase = "Countermovement Load";
      grf = 1.4;
    } else if (tNorm < 0.6) {
      // Airborne phase
      const airNorm = (tNorm - 0.25) / 0.35;
      liftY = Math.sin(airNorm * Math.PI) * 0.25;
      cycle = 0.1;
      phase = "Flight Phase";
      grf = 0.0;
    } else {
      // Impact & landing deceleration
      const landNorm = (tNorm - 0.6) / 0.4;
      cycle = Math.sin(landNorm * Math.PI);
      liftY = -cycle * 0.22;
      phase = landNorm < 0.4 ? "Peak Impact Reversal" : "Stabilization Recovery";
      grf = landNorm < 0.3 ? 2.85 : 1.1; // 2.85x BW ground strike spike
      valgus = cycle * 0.055; // 5.5cm sharp valgus spike upon landing
    }

    const ghostJoints = deepCloneJoints(BASE_STAND);
    const patientJoints = deepCloneJoints(BASE_STAND);

    for (const k in ghostJoints) {
      ghostJoints[k][1] += liftY;
      patientJoints[k] = [...ghostJoints[k]];
    }

    patientJoints.left_knee[0] -= valgus;

    const kneeFlexion = Math.round(165 - cycle * 70);
    const valgusDevCm = parseFloat((valgus * 100).toFixed(1));
    const aclStrainPct = parseFloat((3.0 + (grf > 2 ? 6.2 : cycle * 3.5)).toFixed(1));

    frames.push({
      timestampSec: parseFloat((tNorm * duration).toFixed(2)),
      phaseLabel: phase,
      patientJoints,
      ghostJoints,
      angles: {
        kneeFlexion,
        hipAngle: Math.round(165 - cycle * 55),
        trunkInclination: Math.round(10 + cycle * 20),
        valgusDevCm,
        qAngleDeg: parseFloat((14.0 + valgus * 150).toFixed(1)),
      },
      forces: {
        aclStrainPct,
        lumbarShearN: Math.round(250 + cycle * 280),
        grfMultiplierBW: grf,
      },
      muscles: {
        vmo: Math.round(30 + cycle * 50),
        vl: Math.round(35 + cycle * 60),
        gluteMax: Math.round(20 + cycle * 75),
        gluteMed: Math.round(Math.max(15, 50 - valgus * 600)),
        hamstrings: Math.round(25 + cycle * 65),
        erectorSpinae: Math.round(30 + cycle * 45),
      },
    });
  }

  return frames;
}

// ── 3. ROMANIAN DEADLIFT (RDL / HIP HINGE) TRAJECTORY ─────────────────────────
function generateDeadliftTrajectory(numFrames = 60): MovementFrame[] {
  const frames: MovementFrame[] = [];
  const duration = 2.6;

  for (let i = 0; i < numFrames; i++) {
    const tNorm = i / (numFrames - 1);
    const cycle = (1 - Math.cos(tNorm * Math.PI * 2)) / 2;

    const ghostJoints = deepCloneJoints(BASE_STAND);
    const patientJoints = deepCloneJoints(BASE_STAND);

    // Hip push back (Z) and torso pitch forward (Z & Y)
    const hipBackZ = -cycle * 0.16;
    const torsoPitchY = -cycle * 0.32;
    const torsoPitchZ = cycle * 0.28;

    ghostJoints.left_hip[2] += hipBackZ;
    ghostJoints.right_hip[2] += hipBackZ;
    ghostJoints.lumbar[1] += torsoPitchY;
    ghostJoints.lumbar[2] += torsoPitchZ;
    ghostJoints.chest[1] += torsoPitchY * 1.3;
    ghostJoints.chest[2] += torsoPitchZ * 1.4;
    ghostJoints.head[1] += torsoPitchY * 1.4;
    ghostJoints.head[2] += torsoPitchZ * 1.5;

    for (const k in ghostJoints) {
      patientJoints[k] = [...ghostJoints[k]];
    }
    // Patient has excessive lumbar flexion (rounding)
    patientJoints.lumbar[2] += cycle * 0.06;

    const trunkInclination = Math.round(8 + cycle * 58); // Torso pitches to 66°
    const lumbarShearN = Math.round(240 + cycle * 420); // Exceeds 600N boundary

    frames.push({
      timestampSec: parseFloat((tNorm * duration).toFixed(2)),
      phaseLabel: cycle > 0.8 ? "Max Hamstring Stretch" : tNorm < 0.5 ? "Hip Hinge Descent" : "Glute Lockout",
      patientJoints,
      ghostJoints,
      angles: {
        kneeFlexion: Math.round(168 - cycle * 20), // Slight soft knee bend
        hipAngle: Math.round(175 - cycle * 85),
        trunkInclination,
        valgusDevCm: 0.8,
        qAngleDeg: 13.5,
      },
      forces: {
        aclStrainPct: 4.2,
        lumbarShearN,
        grfMultiplierBW: 1.15,
      },
      muscles: {
        vmo: 25,
        vl: 28,
        gluteMax: Math.round(20 + cycle * 70),
        gluteMed: 45,
        hamstrings: Math.round(30 + cycle * 68),
        erectorSpinae: Math.round(35 + cycle * 62),
      },
    });
  }

  return frames;
}

// ── 4. OVERHEAD SHOULDER PRESS TRAJECTORY ────────────────────────────────────
function generatePressTrajectory(numFrames = 60): MovementFrame[] {
  const frames: MovementFrame[] = [];
  const duration = 2.2;

  for (let i = 0; i < numFrames; i++) {
    const tNorm = i / (numFrames - 1);
    const cycle = (1 - Math.cos(tNorm * Math.PI * 2)) / 2;

    const ghostJoints = deepCloneJoints(BASE_STAND);
    const patientJoints = deepCloneJoints(BASE_STAND);

    // Arms elevate upward and outward
    const armElevY = cycle * 0.38;
    const armElevX = cycle * 0.05;

    ghostJoints.left_arm[1] += armElevY * 0.6;
    ghostJoints.right_arm[1] += armElevY * 0.6;
    ghostJoints.left_forearm[1] += armElevY;
    ghostJoints.right_forearm[1] += armElevY;
    ghostJoints.left_forearm[0] += armElevX;
    ghostJoints.right_forearm[0] -= armElevX;

    for (const k in ghostJoints) {
      patientJoints[k] = [...ghostJoints[k]];
    }
    // Patient has asymmetric left shoulder lag
    patientJoints.left_forearm[1] -= cycle * 0.06;

    frames.push({
      timestampSec: parseFloat((tNorm * duration).toFixed(2)),
      phaseLabel: cycle > 0.85 ? "Overhead Lockout" : tNorm < 0.5 ? "Press Drive" : "Eccentric Lower",
      patientJoints,
      ghostJoints,
      angles: {
        kneeFlexion: 175,
        hipAngle: 176,
        trunkInclination: Math.round(5 + cycle * 12),
        valgusDevCm: 0.2,
        qAngleDeg: 12.0,
      },
      forces: {
        aclStrainPct: 2.1,
        lumbarShearN: Math.round(220 + cycle * 160),
        grfMultiplierBW: 1.05,
      },
      muscles: {
        vmo: 15,
        vl: 18,
        gluteMax: 30,
        gluteMed: 35,
        hamstrings: 20,
        erectorSpinae: Math.round(30 + cycle * 45),
      },
    });
  }

  return frames;
}

// ── EXPORTED REGISTRY OF ALL EXERCISES ───────────────────────────────────────
export const MOVEMENT_LIBRARY: Record<ExerciseType, ExerciseDefinition> = {
  squat: {
    id: "squat",
    title: "Double-Leg Back Squat",
    targetPathology: "Dynamic Knee Valgus & Lumbar Shear",
    durationSec: 2.4,
    frameCount: 60,
    frames: generateSquatTrajectory(60),
  },
  hop: {
    id: "hop",
    title: "Single-Leg Hop & Deceleration",
    targetPathology: "Acute ACL Rupture Risk & GRF Spike",
    durationSec: 1.8,
    frameCount: 60,
    frames: generateHopTrajectory(60),
  },
  deadlift: {
    id: "deadlift",
    title: "Romanian Deadlift (Hip Hinge)",
    targetPathology: "L4-L5 Lumbar Flexion & Shear Failure",
    durationSec: 2.6,
    frameCount: 60,
    frames: generateDeadliftTrajectory(60),
  },
  press: {
    id: "press",
    title: "Overhead Barbell Press",
    targetPathology: "Subacromial Shoulder Impingement",
    durationSec: 2.2,
    frameCount: 60,
    frames: generatePressTrajectory(60),
  },
};
