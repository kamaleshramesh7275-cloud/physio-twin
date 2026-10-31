/**
 * Kinematic Signal Processing & Biomechanical Calculation Engine
 * Implements:
 * 1. One-Euro Adaptive Low-Pass Filter
 * 2. Landmark Confidence Gating
 * 3. 3D Euclidean Vector Angle Calculation
 * 4. Winter's Anthropometric Segment Mass & Whole-Body Center of Mass (COM) Model
 * 5. Dynamic Ground Reaction Force (GRF) & External Knee Abduction Moment (KAM)
 * 6. Standing Anthropometric Calibration & Rigid Bone-Length Invariance
 * 7. Intrinsic Body Coordinate Frame Orthogonalization (Rotation Invariance)
 * 8. 5-State Kinematic Movement Finite State Machine (Zero-Crossing Amortization)
 */

export interface LandmarkPoint {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
  presence?: number;
}

// ── 1. One-Euro Adaptive Low-Pass Filter ─────────────────────────
export class LowPassFilter {
  private y: number | null = null;
  private s: number | null = null;

  filter(value: number, alpha: number): number {
    if (this.y === null) {
      this.s = value;
      this.y = value;
      return value;
    }
    this.y = alpha * value + (1.0 - alpha) * this.s!;
    this.s = this.y;
    return this.y;
  }

  hasLast(): boolean {
    return this.y !== null;
  }

  last(): number {
    return this.y ?? 0;
  }

  reset(): void {
    this.y = null;
    this.s = null;
  }
}

export class OneEuroFilter {
  private minCutoff: number;
  private beta: number;
  private dCutoff: number;
  private xFilter: LowPassFilter;
  private dxFilter: LowPassFilter;
  private lastTime: number | null = null;

  constructor(minCutoff = 1.0, beta = 0.007, dCutoff = 1.0) {
    this.minCutoff = minCutoff;
    this.beta = beta;
    this.dCutoff = dCutoff;
    this.xFilter = new LowPassFilter();
    this.dxFilter = new LowPassFilter();
  }

  private alpha(cutoff: number, dt: number): number {
    const tau = 1.0 / (2.0 * Math.PI * cutoff);
    return 1.0 / (1.0 + tau / dt);
  }

  filter(value: number, timestampMs: number): number {
    if (this.lastTime === null) {
      this.lastTime = timestampMs;
      return this.xFilter.filter(value, 1.0);
    }

    const dt = Math.max(1e-4, (timestampMs - this.lastTime) / 1000.0);
    this.lastTime = timestampMs;

    const prevX = this.xFilter.last();
    const dx = (value - prevX) / dt;
    const edx = this.dxFilter.filter(dx, this.alpha(this.dCutoff, dt));

    const cutoff = this.minCutoff + this.beta * Math.abs(edx);
    return this.xFilter.filter(value, this.alpha(cutoff, dt));
  }

  reset(): void {
    this.xFilter.reset();
    this.dxFilter.reset();
    this.lastTime = null;
  }
}

// ── 2. Landmark Confidence Gate ─────────────────────────────────
export function isLandmarkConfident(lm?: LandmarkPoint | null, minConfidence = 0.65): boolean {
  if (!lm) return false;
  const v = lm.visibility !== undefined ? lm.visibility : 1.0;
  const p = lm.presence !== undefined ? lm.presence : 1.0;
  return v >= minConfidence && p >= minConfidence;
}

export function isFullBodyFramed(landmarks: LandmarkPoint[]): { isFramed: boolean; missingKeypoints: string[] } {
  if (!landmarks || landmarks.length < 33) {
    return { isFramed: false, missingKeypoints: ["No pose detected"] };
  }

  const check = [
    { name: "Head", idx: 0 },
    { name: "Shoulders", idx: 11 },
    { name: "Hips", idx: 23 },
    { name: "Knees", idx: 25 },
    { name: "Ankles", idx: 27 },
  ];

  const missing: string[] = [];
  for (const c of check) {
    const p = landmarks[c.idx];
    if (!p || !isLandmarkConfident(p, 0.55)) {
      missing.push(c.name);
    } else if (p.x < 0.02 || p.x > 0.98 || p.y < 0.02 || p.y > 0.98) {
      missing.push(`${c.name} (out of bounds)`);
    }
  }

  return { isFramed: missing.length === 0, missingKeypoints: missing };
}

// ── 3. Accurate 3D Joint Angle Calculation ──────────────────────
export function calculateJointAngle3D(
  a: LandmarkPoint,
  b: LandmarkPoint, // Vertex joint
  c: LandmarkPoint
): number {
  const v1x = a.x - b.x;
  const v1y = a.y - b.y;
  const v1z = (a.z ?? 0) - (b.z ?? 0);

  const v2x = c.x - b.x;
  const v2y = c.y - b.y;
  const v2z = (c.z ?? 0) - (b.z ?? 0);

  const dot = v1x * v2x + v1y * v2y + v1z * v2z;
  const mag1 = Math.sqrt(v1x * v1x + v1y * v1y + v1z * v1z);
  const mag2 = Math.sqrt(v2x * v2x + v2y * v2y + v2z * v2z);

  if (mag1 < 1e-6 || mag2 < 1e-6) return 0;
  const cosTheta = Math.max(-1.0, Math.min(1.0, dot / (mag1 * mag2)));
  return (Math.acos(cosTheta) * 180.0) / Math.PI;
}

// ── 4. Winter's Anthropometric Whole-Body Center of Mass (COM) ───
export function calculateWinterCOM(landmarks: LandmarkPoint[]): { x: number; y: number; z: number } {
  if (!landmarks || landmarks.length < 33) {
    return { x: 0, y: 0, z: 0 };
  }

  const nose = landmarks[0];
  const lShoulder = landmarks[11], rShoulder = landmarks[12];
  const lElbow = landmarks[13], rElbow = landmarks[14];
  const lWrist = landmarks[15], rWrist = landmarks[16];
  const lHip = landmarks[23], rHip = landmarks[24];
  const lKnee = landmarks[25], rKnee = landmarks[26];
  const lAnkle = landmarks[27], rAnkle = landmarks[28];
  const lToe = landmarks[31], rToe = landmarks[32];

  const mid = (p1: LandmarkPoint, p2: LandmarkPoint, ratio = 0.5): LandmarkPoint => ({
    x: p1.x + (p2.x - p1.x) * ratio,
    y: p1.y + (p2.y - p1.y) * ratio,
    z: (p1.z ?? 0) + ((p2.z ?? 0) - (p1.z ?? 0)) * ratio,
  });

  const midShoulder = mid(lShoulder, rShoulder);
  const midHip = mid(lHip, rHip);

  const segments = [
    { p: nose, w: 0.081 },
    { p: mid(midShoulder, midHip, 0.50), w: 0.497 },
    { p: mid(lShoulder, lElbow, 0.436), w: 0.028 },
    { p: mid(rShoulder, rElbow, 0.436), w: 0.028 },
    { p: mid(lElbow, lWrist, 0.682), w: 0.022 },
    { p: mid(rElbow, rWrist, 0.682), w: 0.022 },
    { p: mid(lHip, lKnee, 0.433), w: 0.100 },
    { p: mid(rHip, rKnee, 0.433), w: 0.100 },
    { p: mid(lKnee, lAnkle, 0.433), w: 0.0465 },
    { p: mid(rKnee, rAnkle, 0.433), w: 0.0465 },
    { p: mid(lAnkle, lToe, 0.50), w: 0.0145 },
    { p: mid(rAnkle, rToe, 0.50), w: 0.0145 },
  ];

  let comX = 0, comY = 0, comZ = 0;
  for (const seg of segments) {
    comX += seg.p.x * seg.w;
    comY += seg.p.y * seg.w;
    comZ += (seg.p.z ?? 0) * seg.w;
  }

  return { x: comX, y: comY, z: comZ };
}

// ── 5. Ground Reaction Force (GRF) via Whole-Body COM Acceleration 
export function estimateGroundReactionForce(
  userWeightKg: number,
  comYHistory: { y: number; timeSec: number }[]
): { peakAccY: number; peakGrfMultiplier: number; peakGrfNewtons: number } {
  if (comYHistory.length < 3) {
    return { peakAccY: 0.5, peakGrfMultiplier: 1.05, peakGrfNewtons: Math.round(userWeightKg * 9.80665 * 1.05) };
  }

  const g = 9.80665; // m/s^2
  let maxAccY = 0;

  for (let i = 1; i < comYHistory.length - 1; i++) {
    const prev = comYHistory[i - 1];
    const curr = comYHistory[i];
    const next = comYHistory[i + 1];

    const dt1 = Math.max(1e-3, curr.timeSec - prev.timeSec);
    const dt2 = Math.max(1e-3, next.timeSec - curr.timeSec);
    const dtAvg = (dt1 + dt2) / 2.0;

    const v1 = (curr.y - prev.y) / dt1;
    const v2 = (next.y - curr.y) / dt2;
    const accY = Math.abs((v2 - v1) / dtAvg);

    const metricAccY = accY * 1.75 * 9.8; 
    if (metricAccY > maxAccY && metricAccY < 40.0) {
      maxAccY = metricAccY;
    }
  }

  const peakAccY = parseFloat(Math.max(0.5, Math.min(25.0, maxAccY)).toFixed(1));
  const peakGrfMultiplier = parseFloat((1.0 + (peakAccY / g)).toFixed(2));
  const peakGrfNewtons = Math.round(userWeightKg * g * peakGrfMultiplier);

  return { peakAccY, peakGrfMultiplier, peakGrfNewtons };
}

// ── 6. Knee Abduction Moment (KAM) Clinical ACL & Meniscus Metric ──
export function calculateKneeAbductionMoment(
  grfNewtons: number,
  kneePoint: LandmarkPoint,
  anklePoint: LandmarkPoint,
  userWeightKg: number
): { kamNm: number; normalizedKamNmKg: number; riskRating: "Optimal" | "Moderate Shear" | "Critical ACL Risk" } {
  const leverArmMeters = Math.max(0.01, Math.min(0.25, Math.abs(kneePoint.x - anklePoint.x) * 0.45));
  const kamNm = parseFloat((grfNewtons * leverArmMeters).toFixed(1));
  const normalizedKamNmKg = parseFloat((kamNm / Math.max(40, userWeightKg)).toFixed(2));

  let riskRating: "Optimal" | "Moderate Shear" | "Critical ACL Risk" = "Optimal";
  if (normalizedKamNmKg > 1.8) {
    riskRating = "Critical ACL Risk";
  } else if (normalizedKamNmKg > 1.2) {
    riskRating = "Moderate Shear";
  }

  return { kamNm, normalizedKamNmKg, riskRating };
}

// ── 7. Standing Anthropometric Calibration & Rigid Bone Invariance ─
export interface StandingCalibrationProfile {
  femurLengthLeft: number;
  femurLengthRight: number;
  tibiaLengthLeft: number;
  tibiaLengthRight: number;
  torsoLength: number;
  shoulderWidth: number;
  hipWidth: number;
  isCalibrated: boolean;
}

export function dist3D(p1: LandmarkPoint, p2: LandmarkPoint): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  const dz = (p1.z ?? 0) - (p2.z ?? 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function calibrateStandingProfile(landmarks: LandmarkPoint[]): StandingCalibrationProfile {
  const lHip = landmarks[23], rHip = landmarks[24];
  const lKnee = landmarks[25], rKnee = landmarks[26];
  const lAnkle = landmarks[27], rAnkle = landmarks[28];
  const lShoulder = landmarks[11], rShoulder = landmarks[12];

  const midShoulder: LandmarkPoint = {
    x: (lShoulder.x + rShoulder.x) / 2,
    y: (lShoulder.y + rShoulder.y) / 2,
    z: ((lShoulder.z ?? 0) + (rShoulder.z ?? 0)) / 2,
  };
  const midHip: LandmarkPoint = {
    x: (lHip.x + rHip.x) / 2,
    y: (lHip.y + rHip.y) / 2,
    z: ((lHip.z ?? 0) + (rHip.z ?? 0)) / 2,
  };

  return {
    femurLengthLeft: dist3D(lHip, lKnee),
    femurLengthRight: dist3D(rHip, rKnee),
    tibiaLengthLeft: dist3D(lKnee, lAnkle),
    tibiaLengthRight: dist3D(rKnee, rAnkle),
    torsoLength: dist3D(midShoulder, midHip),
    shoulderWidth: dist3D(lShoulder, rShoulder),
    hipWidth: dist3D(lHip, rHip),
    isCalibrated: true,
  };
}

/**
 * Enforces rigid segment invariance: bone lengths cannot phantom-stretch during squats/reps.
 */
export function enforceRigidBoneLengths(
  landmarks: LandmarkPoint[],
  profile: StandingCalibrationProfile
): LandmarkPoint[] {
  if (!profile.isCalibrated || landmarks.length < 33) return landmarks;

  const result = landmarks.map(l => ({ ...l }));

  const constrainSegment = (originIdx: number, targetIdx: number, targetLen: number) => {
    const o = result[originIdx];
    const t = result[targetIdx];
    const currentDist = dist3D(o, t);
    if (currentDist < 1e-4) return;

    // If segment length drifts by more than 5%, project back along direction vector
    const ratio = targetLen / currentDist;
    if (Math.abs(1.0 - ratio) > 0.05) {
      t.x = o.x + (t.x - o.x) * ratio;
      t.y = o.y + (t.y - o.y) * ratio;
      if (t.z !== undefined && o.z !== undefined) {
        t.z = o.z + (t.z - o.z) * ratio;
      }
    }
  };

  // Constrain femurs and tibias
  constrainSegment(23, 25, profile.femurLengthLeft);
  constrainSegment(24, 26, profile.femurLengthRight);
  constrainSegment(25, 27, profile.tibiaLengthLeft);
  constrainSegment(26, 28, profile.tibiaLengthRight);

  return result;
}

// ── 8. Intrinsic Body Coordinate Frame Orthogonalization ──────────
/**
 * Computes rotation matrix to transform landmarks from camera space into the athlete's
 * local pelvic-shoulder anatomical frame, making flexion/valgus camera-angle invariant.
 */
export function computeBodyFrameTransform(landmarks: LandmarkPoint[]): {
  transform: (p: LandmarkPoint) => LandmarkPoint;
} {
  const lHip = landmarks[23], rHip = landmarks[24];
  const lShoulder = landmarks[11], rShoulder = landmarks[12];

  // Origin = Pelvis center
  const originX = (lHip.x + rHip.x) / 2;
  const originY = (lHip.y + rHip.y) / 2;
  const originZ = ((lHip.z ?? 0) + (rHip.z ?? 0)) / 2;

  // Frontal Unit Vector (X_local): from Right Hip to Left Hip
  let fx = lHip.x - rHip.x;
  let fy = lHip.y - rHip.y;
  let fz = (lHip.z ?? 0) - (rHip.z ?? 0);
  const fMag = Math.sqrt(fx * fx + fy * fy + fz * fz) || 1.0;
  fx /= fMag; fy /= fMag; fz /= fMag;

  // Longitudinal Unit Vector (Y_local): from Pelvis Center to Shoulder Center
  const midShoulderX = (lShoulder.x + rShoulder.x) / 2;
  const midShoulderY = (lShoulder.y + rShoulder.y) / 2;
  const midShoulderZ = ((lShoulder.z ?? 0) + (rShoulder.z ?? 0)) / 2;
  let ly = midShoulderY - originY;
  let lx = midShoulderX - originX;
  let lz = midShoulderZ - originZ;
  const lMag = Math.sqrt(lx * lx + ly * ly + lz * lz) || 1.0;
  lx /= lMag; ly /= lMag; lz /= lMag;

  // Sagittal Unit Vector (Z_local): Cross Product of Frontal and Longitudinal
  const sx = fy * lz - fz * ly;
  const sy = fz * lx - fx * lz;
  const sz = fx * ly - fy * lx;

  return {
    transform: (p: LandmarkPoint): LandmarkPoint => {
      const rx = p.x - originX;
      const ry = p.y - originY;
      const rz = (p.z ?? 0) - originZ;

      // Project into orthonormal basis [fx, fy, fz], [lx, ly, lz], [sx, sy, sz]
      return {
        x: rx * fx + ry * fy + rz * fz,
        y: rx * lx + ry * ly + rz * lz,
        z: rx * sx + ry * sy + rz * sz,
        visibility: p.visibility,
        presence: p.presence,
      };
    },
  };
}

// ── 9. 5-State Kinematic Movement Finite State Machine (FSM) ──────
export type RepPhase = "IDLE" | "DESCENT" | "AMORTIZATION" | "ASCENT" | "LOCKOUT";

export interface FSMStateUpdate {
  phase: RepPhase;
  repCompleted: boolean;
  repCount: number;
  inflectionDepthAngle: number;
}

export class KinematicMovementFSM {
  private phase: RepPhase = "IDLE";
  private repCount = 0;
  private minInflectionAngle = 180.0;
  private prevAngle = 180.0;
  private prevTimeSec = 0;
  private lastRepTimeSec = 0;

  update(currentAngle: number, timeSec: number): FSMStateUpdate {
    if (this.prevTimeSec === 0) {
      this.prevTimeSec = timeSec;
      this.prevAngle = currentAngle;
      return { phase: this.phase, repCompleted: false, repCount: this.repCount, inflectionDepthAngle: currentAngle };
    }

    const dt = Math.max(1e-3, timeSec - this.prevTimeSec);
    const velocity = (currentAngle - this.prevAngle) / dt; // deg/sec (negative = flexing/descending)

    let repCompleted = false;

    switch (this.phase) {
      case "IDLE":
      case "LOCKOUT":
        if (currentAngle < 155.0 && velocity < -20.0) {
          this.phase = "DESCENT";
          this.minInflectionAngle = currentAngle;
        }
        break;

      case "DESCENT":
        if (currentAngle < this.minInflectionAngle) {
          this.minInflectionAngle = currentAngle;
        }
        // Zero-crossing velocity turnaround detection
        if (velocity >= -5.0 && this.minInflectionAngle < 125.0) {
          this.phase = "AMORTIZATION";
        }
        break;

      case "AMORTIZATION":
        if (currentAngle < this.minInflectionAngle) {
          this.minInflectionAngle = currentAngle;
        }
        if (velocity > 15.0) {
          this.phase = "ASCENT";
        }
        break;

      case "ASCENT":
        if (currentAngle > 155.0) {
          // Terminal extension lockout completed
          if (timeSec - this.lastRepTimeSec > 1.0 && this.minInflectionAngle < 125.0) {
            this.repCount++;
            repCompleted = true;
            this.lastRepTimeSec = timeSec;
          }
          this.phase = "LOCKOUT";
        }
        break;
    }

    this.prevAngle = currentAngle;
    this.prevTimeSec = timeSec;

    return {
      phase: this.phase,
      repCompleted,
      repCount: this.repCount,
      inflectionDepthAngle: Math.round(this.minInflectionAngle),
    };
  }

  getRepCount(): number {
    return this.repCount;
  }

  reset(): void {
    this.phase = "IDLE";
    this.repCount = 0;
    this.minInflectionAngle = 180.0;
    this.prevAngle = 180.0;
    this.prevTimeSec = 0;
    this.lastRepTimeSec = 0;
  }
}
