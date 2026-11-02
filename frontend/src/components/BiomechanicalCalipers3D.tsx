import React, { useMemo } from "react";
import * as THREE from "three";
import { Html, Line } from "@react-three/drei";
import type { JointCoordinates3D } from "../lib/movementLibrary";

export interface BiomechanicalCalipers3DProps {
  patientJoints: JointCoordinates3D;
  ghostJoints?: JointCoordinates3D | null;
  kneeAngle: number;
  valgusDevCm: number;
  qAngleDeg: number;
  showGhost?: boolean;
}

export const BiomechanicalCalipers3D: React.FC<BiomechanicalCalipers3DProps> = ({
  patientJoints,
  ghostJoints,
  kneeAngle,
  valgusDevCm,
  qAngleDeg,
  showGhost = true,
}) => {
  const leftKnee = patientJoints?.left_knee;
  const leftHip = patientJoints?.left_hip;
  const leftAnkle = patientJoints?.left_ankle;
  const hasJoints = Boolean(leftKnee && leftHip && leftAnkle);

  // 1. Q-Angle Plumb Line from ASIS (Hip) directly down through Ankle
  const plumbLinePoints = useMemo(() => {
    if (!hasJoints || !leftHip || !leftAnkle) return [];
    return [
      [leftHip[0], leftHip[1], leftHip[2]] as [number, number, number],
      [leftHip[0], leftAnkle[1], leftHip[2]] as [number, number, number],
    ];
  }, [hasJoints, leftHip, leftAnkle]);

  // 2. Horizontal Valgus Deviation Offset Vector from Plumb Line to Knee
  const deviationLinePoints = useMemo(() => {
    if (!hasJoints || !leftHip || !leftKnee) return [];
    return [
      [leftHip[0], leftKnee[1], leftHip[2]] as [number, number, number],
      [leftKnee[0], leftKnee[1], leftKnee[2]] as [number, number, number],
    ];
  }, [hasJoints, leftHip, leftKnee]);

  // 3. Angular Arc Line for Knee Flexion
  const angleArcPoints = useMemo(() => {
    if (!hasJoints || !leftKnee) return [];
    const arcRadius = 0.085;
    const curvePoints: [number, number, number][] = [];
    const segments = 16;
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * ((180 - kneeAngle) * (Math.PI / 180));
      curvePoints.push([
        leftKnee[0] + 0.02,
        leftKnee[1] + Math.cos(angle) * arcRadius,
        leftKnee[2] + Math.sin(angle) * arcRadius,
      ]);
    }
    return curvePoints;
  }, [hasJoints, leftKnee, kneeAngle]);

  if (!hasJoints) return null;

  return (
    <group>
      {/* ── 1. Vertical Q-Angle Plumb Line (Cyan Laser Guide) ────────── */}
      <Line
        points={plumbLinePoints}
        color="#06b6d4"
        lineWidth={2}
        dashed
        dashSize={0.03}
        gapSize={0.02}
        transparent
        opacity={0.7}
      />

      {/* ── 2. Horizontal Valgus Deviation Vector (Red Warning Offset) ─ */}
      {valgusDevCm > 0.5 && (
        <group>
          <Line
            points={deviationLinePoints}
            color="#ef4444"
            lineWidth={3}
            transparent
            opacity={0.85}
          />

          {/* Floating Measurement Tag in 3D Space */}
          <Html position={[leftKnee[0] - 0.14, leftKnee[1] - 0.02, leftKnee[2]]} center distanceFactor={4.5}>
            <div className="px-2 py-0.5 rounded bg-black/85 border border-red-500/50 text-[10px] font-mono text-red-300 font-bold whitespace-nowrap shadow-lg">
              +{valgusDevCm} cm Valgus
            </div>
          </Html>
        </group>
      )}

      {/* ── 3. 3D Angular Arc at Left Knee Joint ──────────────────────── */}
      <Line
        points={angleArcPoints}
        color={kneeAngle < 90 ? "#ef4444" : "#10b981"}
        lineWidth={2.5}
      />

      <Html position={[leftKnee[0] + 0.14, leftKnee[1] + 0.05, leftKnee[2]]} center distanceFactor={4.5}>
        <div className="px-1.5 py-0.5 rounded bg-zinc-900/90 border border-zinc-700 text-[10px] font-mono text-white font-extrabold shadow">
          {kneeAngle}°
        </div>
      </Html>

      {/* ── 4. Superimposed Ghost Rig (Ideal Form Benchmark in Emerald) ── */}
      {showGhost && ghostJoints && (
        <group>
          {/* Ghost Left Knee */}
          {ghostJoints.left_knee && (
            <mesh position={ghostJoints.left_knee}>
              <sphereGeometry args={[0.026, 12, 12]} />
              <meshStandardMaterial
                color={0x10b981}
                emissive={0x10b981}
                emissiveIntensity={0.6}
                transparent
                opacity={0.4}
                wireframe
              />
            </mesh>
          )}

          {/* Ghost Bone Connector */}
          {ghostJoints.left_hip && ghostJoints.left_knee && (
            <mesh
              position={[
                (ghostJoints.left_hip[0] + ghostJoints.left_knee[0]) / 2,
                (ghostJoints.left_hip[1] + ghostJoints.left_knee[1]) / 2,
                (ghostJoints.left_hip[2] + ghostJoints.left_knee[2]) / 2,
              ]}
            >
              <sphereGeometry args={[0.012, 8, 8]} />
              <meshBasicMaterial color={0x10b981} transparent opacity={0.3} />
            </mesh>
          )}
        </group>
      )}
    </group>
  );
};
