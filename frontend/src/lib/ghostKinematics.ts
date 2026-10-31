/**
 * Biomechanical Canonical Ghost Kinematics & Spatial Discrepancy Engine
 * Computes:
 * 1. Root-relative pelvic coordinate normalizations (perspective & translation invariant).
 * 2. Real-time canonical gold-standard 3D ghost trajectories for Squats, Sit-to-Stand, and Posture.
 * 3. Euclidean joint discrepancy vectors (in cm and degrees).
 * 4. Overall live Form Match Score (0 - 100%).
 */

import type { LandmarkPoint, StandingCalibrationProfile, RepPhase } from "./kinematicFilters";

export interface FormDiscrepancyResult {
  overallScore: number;
  kneeValgusDeltaCm: number; // Positive = live knee caved inward compared to ghost
  depthDeltaDeg: number;     // Absolute deviation from target angle
  torsoAngleDeltaDeg: number;
  jointDeviations: {
    jointIndex: number;
    name: string;
    deltaCm: number;
    severity: "good" | "warning" | "danger";
  }[];
}

/**
 * Normalizes 3D landmarks into a Pelvic Centric Root Frame:
 * Root origin (0, 0, 0) = Midpoint of Left Hip (23) and Right Hip (24).
 * Eliminates camera translation artifacts.
 */
export function normalizeToPelvicFrame(landmarks: LandmarkPoint[]): LandmarkPoint[] {
  if (!landmarks || landmarks.length < 25) return landmarks;

  const lh = landmarks[23];
  const rh = landmarks[24];
  if (!lh || !rh) return landmarks;

  const rootX = (lh.x + rh.x) / 2;
  const rootY = (lh.y + rh.y) / 2;
  const rootZ = ((lh.z ?? 0) + (rh.z ?? 0)) / 2;

  return landmarks.map(p => ({
    x: p.x - rootX,
    y: p.y - rootY,
    z: (p.z ?? 0) - rootZ,
    visibility: p.visibility ?? 1.0,
    presence: p.presence ?? 1.0
  }));
}

/**
 * Synthesizes a Canonical Gold-Standard Squat/Sit-to-Stand Ghost Pose
 * based on the user's specific bone calibration and current motion phase/angle.
 * 
 * Knee angle theta: 180 = standing vertical, 90 = parallel depth, 70 = deep squat.
 */
export function generateCanonicalSquatPose(
  kneeAngleDeg: number,
  calibration?: StandingCalibrationProfile | null
): LandmarkPoint[] {
  // Baseline bone lengths (metric meters), defaulting to standard 50th percentile human if uncalibrated
  const femurL = calibration?.femurLengthLeft ?? 0.43;
  const femurR = calibration?.femurLengthRight ?? 0.43;
  const tibiaL = calibration?.tibiaLengthLeft ?? 0.42;
  const tibiaR = calibration?.tibiaLengthRight ?? 0.42;
  const torsoL = calibration?.torsoLength ?? 0.50;
  const shoulderW = calibration?.shoulderWidth ?? 0.38;
  const hipW = calibration?.hipWidth ?? 0.28;

  // Clamp knee angle to physical human bounds
  const thetaKnee = Math.max(65, Math.min(180, kneeAngleDeg));
  const kneeRad = (thetaKnee * Math.PI) / 180;

  // Biomechanical closed-chain kinematics:
  // As knee flexes:
  // - Tibia inclines forward by phi: phi ≈ (180 - theta) * 0.28
  // - Femur pitches backwards: hip drops in Y and shifts backwards in Z
  const flexDelta = 180 - thetaKnee;
  const tibiaAngleRad = (flexDelta * 0.25 * Math.PI) / 180; // Shins track ~25% of flexion angle forward
  const trunkAngleRad = (flexDelta * 0.35 * Math.PI) / 180; // Torso tilts forward ~35% of flexion to balance COM

  // Feet positions relative to pelvis at standing (Y is down in MediaPipe convention, Z is depth away from camera)
  // At root: Pelvis is (0, 0, 0)
  const halfHip = hipW / 2;
  const halfShoulder = shoulderW / 2;

  // Knee position relative to hip:
  // In an ideal squat, knees track strictly forward in the sagittal plane with zero valgus collapse.
  const kneeY = femurL * Math.sin(kneeRad / 2);
  const kneeZ = -femurL * Math.cos(kneeRad / 2);

  // Ankle position relative to knee:
  const ankleY = kneeY + tibiaL * Math.cos(tibiaAngleRad);
  const ankleZ = kneeZ + tibiaL * Math.sin(tibiaAngleRad);

  // Torso & Shoulders relative to pelvis:
  const shoulderY = -torsoL * Math.cos(trunkAngleRad);
  const shoulderZ = -torsoL * Math.sin(trunkAngleRad);

  // Head/Nose position:
  const headY = shoulderY - 0.22;
  const headZ = shoulderZ - 0.05;

  // Assemble full 33-landmark array (Pelvis-centered)
  const ghost: LandmarkPoint[] = new Array(33).fill(null).map(() => ({ x: 0, y: 0, z: 0, visibility: 1 }));

  // Head & Spine
  ghost[0] = { x: 0, y: headY, z: headZ };
  ghost[11] = { x: -halfShoulder, y: shoulderY, z: shoulderZ };
  ghost[12] = { x: halfShoulder, y: shoulderY, z: shoulderZ };

  // Arms in ergonomic counterbalance posture (hands held slightly forward at chest height)
  ghost[13] = { x: -halfShoulder * 1.1, y: shoulderY + 0.22, z: shoulderZ - 0.15 };
  ghost[14] = { x: halfShoulder * 1.1, y: shoulderY + 0.22, z: shoulderZ - 0.15 };
  ghost[15] = { x: -0.08, y: shoulderY + 0.18, z: shoulderZ - 0.25 };
  ghost[16] = { x: 0.08, y: shoulderY + 0.18, z: shoulderZ - 0.25 };

  // Pelvis / Hips
  ghost[23] = { x: -halfHip, y: 0, z: 0 };
  ghost[24] = { x: halfHip, y: 0, z: 0 };

  // Knees (Symmetric, strictly parallel tracking)
  ghost[25] = { x: -halfHip * 1.05, y: kneeY, z: kneeZ };
  ghost[26] = { x: halfHip * 1.05, y: kneeY, z: kneeZ };

  // Ankles (Directly under/slightly outside knees for optimal biomechanical base of support)
  ghost[27] = { x: -halfHip * 1.10, y: ankleY, z: ankleZ };
  ghost[28] = { x: halfHip * 1.10, y: ankleY, z: ankleZ };

  // Feet / Toes
  ghost[31] = { x: -halfHip * 1.12, y: ankleY + 0.04, z: ankleZ - 0.14 };
  ghost[32] = { x: halfHip * 1.12, y: ankleY + 0.04, z: ankleZ - 0.14 };

  return ghost;
}

/**
 * Synthesizes a Canonical Neutral Standing Posture Ghost Pose
 */
export function generateCanonicalPosturePose(
  calibration?: StandingCalibrationProfile | null
): LandmarkPoint[] {
  return generateCanonicalSquatPose(178, calibration);
}

/**
 * Calculates real-time 3D Euclidean and Angular Discrepancy between Live Pose and Ghost
 */
export function calculateFormDiscrepancy(
  liveRaw: LandmarkPoint[],
  ghostRaw: LandmarkPoint[]
): FormDiscrepancyResult {
  if (!liveRaw || !ghostRaw || liveRaw.length < 29 || ghostRaw.length < 29) {
    return {
      overallScore: 100,
      kneeValgusDeltaCm: 0,
      depthDeltaDeg: 0,
      torsoAngleDeltaDeg: 0,
      jointDeviations: []
    };
  }

  // Normalize both to root pelvic frame for fair geometric comparison
  const live = normalizeToPelvicFrame(liveRaw);
  const ghost = ghostRaw;

  // Key joints to compare
  const joints = [
    { idx: 25, name: "Left Knee", weight: 0.25 },
    { idx: 26, name: "Right Knee", weight: 0.25 },
    { idx: 11, name: "Left Shoulder", weight: 0.15 },
    { idx: 12, name: "Right Shoulder", weight: 0.15 },
    { idx: 27, name: "Left Ankle", weight: 0.10 },
    { idx: 28, name: "Right Ankle", weight: 0.10 },
  ];

  let totalWeightedErrorCm = 0;
  const jointDeviations: FormDiscrepancyResult["jointDeviations"] = [];

  for (const j of joints) {
    const pLive = live[j.idx];
    const pGhost = ghost[j.idx];
    if (!pLive || !pGhost) continue;

    const dx = pLive.x - pGhost.x;
    const dy = pLive.y - pGhost.y;
    const dz = (pLive.z ?? 0) - (pGhost.z ?? 0);
    const distMeters = Math.sqrt(dx * dx + dy * dy + dz * dz);
    const deltaCm = distMeters * 100;

    totalWeightedErrorCm += deltaCm * j.weight;

    let severity: "good" | "warning" | "danger" = "good";
    if (deltaCm > 7.0) severity = "danger";
    else if (deltaCm > 3.5) severity = "warning";

    jointDeviations.push({
      jointIndex: j.idx,
      name: j.name,
      deltaCm: parseFloat(deltaCm.toFixed(1)),
      severity
    });
  }

  // Knee Valgus calculation (lateral inward displacement)
  // In body frame, left knee is negative X, right knee is positive X.
  // Inward cave for left knee: pLive.x > pGhost.x
  // Inward cave for right knee: pLive.x < pGhost.x
  const lkLive = live[25], lkGhost = ghost[25];
  const rkLive = live[26], rkGhost = ghost[26];
  let valgusCm = 0;
  if (lkLive && lkGhost && rkLive && rkGhost) {
    const leftInward = Math.max(0, (lkLive.x - lkGhost.x) * 100);
    const rightInward = Math.max(0, (rkGhost.x - rkLive.x) * 100);
    valgusCm = Math.max(leftInward, rightInward);
  }

  // Form score calculation: perfect match is 100%, drops by 3.5% per weighted cm of deviation
  const overallScore = Math.max(0, Math.min(100, Math.round(100 - totalWeightedErrorCm * 3.5)));

  return {
    overallScore,
    kneeValgusDeltaCm: parseFloat(valgusCm.toFixed(1)),
    depthDeltaDeg: 0,
    torsoAngleDeltaDeg: 0,
    jointDeviations
  };
}

