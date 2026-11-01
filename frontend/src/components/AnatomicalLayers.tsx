import React, { useMemo } from "react";
import * as THREE from "three";
import type { JointCoordinates3D } from "../lib/movementLibrary";

export interface AnatomicalLayersProps {
  joints: JointCoordinates3D;
  layerStep: number; // 0 = 100% Skin, 1 = 100% Muscle, 2 = 100% Bone, 3 = 100% Force/Ligament
  muscleActivations: {
    vmo: number;
    vl: number;
    gluteMax: number;
    gluteMed: number;
    hamstrings: number;
    erectorSpinae: number;
  };
  grfMultiplier: number;
  aclStrainPct: number;
}

// Bone connections representing the skeletal anatomy
const SKELETAL_BONES: [string, string][] = [
  // Spine & Torso
  ["head", "neck"],
  ["neck", "chest"],
  ["chest", "lumbar"],
  ["lumbar", "left_hip"],
  ["lumbar", "right_hip"],
  ["left_hip", "right_hip"],
  // Left Lower Limb
  ["left_hip", "left_knee"], // Femur
  ["left_knee", "left_ankle"], // Tibia/Fibula
  // Right Lower Limb
  ["right_hip", "right_knee"], // Femur
  ["right_knee", "right_ankle"], // Tibia/Fibula
  // Shoulders & Arms
  ["chest", "left_shoulder"],
  ["chest", "right_shoulder"],
  ["left_shoulder", "left_arm"],
  ["left_arm", "left_forearm"],
  ["right_shoulder", "right_arm"],
  ["right_arm", "right_forearm"],
];

/** Helper to generate smooth cylinder mesh between 2 3D points */
function BoneCylinder({
  start,
  end,
  radius = 0.022,
  color = 0xe2e8f0,
  opacity = 1.0,
}: {
  start: [number, number, number];
  end: [number, number, number];
  radius?: number;
  color?: number;
  opacity?: number;
}) {
  const { position, rotation, length } = useMemo(() => {
    const p1 = new THREE.Vector3(...start);
    const p2 = new THREE.Vector3(...end);
    const sub = new THREE.Vector3().subVectors(p2, p1);
    const len = sub.length();
    const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);

    // Orientation quaternion aligning along Y-axis
    const orientation = new THREE.Matrix4();
    orientation.lookAt(p1, p2, new THREE.Vector3(0, 1, 0));

    const euler = new THREE.Euler().setFromRotationMatrix(orientation);
    euler.x += Math.PI / 2;

    return { position: mid, rotation: euler, length: len };
  }, [start, end]);

  return (
    <mesh position={position} rotation={rotation}>
      <cylinderGeometry args={[radius, radius * 0.9, length, 12]} />
      <meshStandardMaterial
        color={color}
        roughness={0.4}
        metalness={0.15}
        transparent={opacity < 1}
        opacity={opacity}
      />
    </mesh>
  );
}

/** 3D Muscle Group Mesh with dynamic contractile color flaring */
function MuscleBand({
  start,
  end,
  activationPct,
  radius = 0.035,
  opacity = 1.0,
  label = "Muscle",
}: {
  start: [number, number, number];
  end: [number, number, number];
  activationPct: number;
  radius?: number;
  opacity?: number;
  label?: string;
}) {
  const { position, rotation, length, color, emissiveIntensity } = useMemo(() => {
    const p1 = new THREE.Vector3(...start);
    const p2 = new THREE.Vector3(...end);
    const len = p1.distanceTo(p2);
    const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);

    const orientation = new THREE.Matrix4();
    orientation.lookAt(p1, p2, new THREE.Vector3(0, 1, 0));
    const euler = new THREE.Euler().setFromRotationMatrix(orientation);
    euler.x += Math.PI / 2;

    // Muscle color transitions from dark maroon (0%) to amber (50%) to bright red/crimson flare (100%)
    let col = 0x6b1d1d;
    let emissiveInt = 0.1;
    if (activationPct > 70) {
      col = 0xef4444; // High activation crimson flare
      emissiveInt = 0.8;
    } else if (activationPct > 35) {
      col = 0xf59e0b; // Moderate activation amber
      emissiveInt = 0.4;
    }

    return {
      position: mid,
      rotation: euler,
      length: len,
      color: col,
      emissiveIntensity: emissiveInt,
    };
  }, [start, end, activationPct]);

  return (
    <mesh position={position} rotation={rotation}>
      {/* Slightly bulging capsule/cylinder for muscle belly */}
      <cylinderGeometry args={[radius * 1.1, radius, length, 14]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={emissiveIntensity}
        roughness={0.35}
        metalness={0.2}
        transparent={opacity < 1}
        opacity={opacity}
      />
    </mesh>
  );
}

/** Dynamic Ground Reaction Force (GRF) Vector Arrow */
function GRFForceArrow({
  footPos,
  grfMagnitude,
  opacity,
}: {
  footPos: [number, number, number];
  grfMagnitude: number;
  opacity: number;
}) {
  if (opacity <= 0.05 || grfMagnitude <= 0.1) return null;
  const arrowHeight = Math.min(0.65, grfMagnitude * 0.22);

  return (
    <group position={[footPos[0], footPos[1], footPos[2]]}>
      {/* Vertical force shaft */}
      <mesh position={[0, arrowHeight / 2, 0]}>
        <cylinderGeometry args={[0.012, 0.012, arrowHeight, 8]} />
        <meshBasicMaterial color={grfMagnitude > 2 ? 0xef4444 : 0x10b981} transparent opacity={opacity} />
      </mesh>
      {/* Arrowhead */}
      <mesh position={[0, arrowHeight + 0.03, 0]}>
        <coneGeometry args={[0.032, 0.06, 12]} />
        <meshBasicMaterial color={grfMagnitude > 2 ? 0xef4444 : 0x10b981} transparent opacity={opacity} />
      </mesh>
    </group>
  );
}

export const AnatomicalLayers: React.FC<AnatomicalLayersProps> = ({
  joints,
  layerStep,
  muscleActivations,
  grfMultiplier,
  aclStrainPct,
}) => {
  // Calculate opacities based on continuous layerStep (0 to 3)
  // 0: Skin only
  // 1: Muscle layer dominant
  // 2: Bone / Skeletal layer dominant
  // 3: Ligament / Forces dominant
  const muscleOpacity = Math.max(0, Math.min(1, 1 - Math.abs(layerStep - 1)));
  const boneOpacity = Math.max(0, Math.min(1, 1 - Math.abs(layerStep - 2)));
  const forceOpacity = Math.max(0, Math.min(1, layerStep - 2));

  const hasJoints = Boolean(joints && joints.left_knee && joints.right_knee && joints.left_hip);
  if (!hasJoints) return null;

  return (
    <group>
      {/* ── TIER 2: MYOFASCIAL MUSCLE LAYER ───────────────────────────── */}
      {muscleOpacity > 0.02 && (
        <group>
          {/* Left Quad - Vastus Medialis (VMO) */}
          <MuscleBand
            start={joints.left_hip}
            end={joints.left_knee}
            activationPct={muscleActivations.vmo}
            radius={0.038}
            opacity={muscleOpacity * 0.92}
            label="VMO"
          />
          {/* Right Quad - Vastus Medialis (VMO) */}
          <MuscleBand
            start={joints.right_hip}
            end={joints.right_knee}
            activationPct={muscleActivations.vmo}
            radius={0.038}
            opacity={muscleOpacity * 0.92}
            label="Right VMO"
          />
          {/* Erector Spinae along Spine */}
          <MuscleBand
            start={joints.lumbar}
            end={joints.chest}
            activationPct={muscleActivations.erectorSpinae}
            radius={0.045}
            opacity={muscleOpacity * 0.88}
            label="Erector Spinae"
          />
          {/* Hamstrings (Posterior Thigh) */}
          <MuscleBand
            start={[joints.left_hip[0], joints.left_hip[1], joints.left_hip[2] - 0.04]}
            end={[joints.left_knee[0], joints.left_knee[1], joints.left_knee[2] - 0.03]}
            activationPct={muscleActivations.hamstrings}
            radius={0.036}
            opacity={muscleOpacity * 0.85}
            label="Left Hamstrings"
          />
        </group>
      )}

      {/* ── TIER 3: ARTICULAR SKELETAL RIG ────────────────────────────── */}
      {boneOpacity > 0.02 && (
        <group>
          {SKELETAL_BONES.map(([j1, j2], idx) => {
            const p1 = joints[j1];
            const p2 = joints[j2];
            if (!p1 || !p2) return null;
            return (
              <BoneCylinder
                key={`bone-${idx}`}
                start={p1}
                end={p2}
                radius={j1.includes("femur") || j1.includes("hip") ? 0.024 : 0.018}
                color={0xf1f5f9}
                opacity={boneOpacity * 0.95}
              />
            );
          })}

          {/* Volumetric Spheres for Articular Joints */}
          {Object.entries(joints).map(([name, pos]) => (
            <mesh key={`joint-${name}`} position={pos}>
              <sphereGeometry args={[0.026, 16, 16]} />
              <meshStandardMaterial
                color={0x94a3b8}
                roughness={0.3}
                metalness={0.4}
                transparent={boneOpacity < 1}
                opacity={boneOpacity * 0.95}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* ── TIER 4: LIGAMENTS & GROUND REACTION FORCE VECTORS ─────────── */}
      {forceOpacity > 0.02 && (
        <group>
          {/* Left Knee ACL Ligament Tension Band */}
          <mesh position={joints.left_knee}>
            <torusGeometry args={[0.034, 0.007, 8, 24]} />
            <meshStandardMaterial
              color={aclStrainPct > 6.0 ? 0xef4444 : 0x10b981}
              emissive={aclStrainPct > 6.0 ? 0xef4444 : 0x10b981}
              emissiveIntensity={aclStrainPct > 6.0 ? 0.9 : 0.4}
              transparent
              opacity={forceOpacity}
            />
          </mesh>

          {/* Right Knee ACL Band */}
          <mesh position={joints.right_knee}>
            <torusGeometry args={[0.034, 0.007, 8, 24]} />
            <meshStandardMaterial
              color={0x10b981}
              emissive={0x10b981}
              emissiveIntensity={0.3}
              transparent
              opacity={forceOpacity}
            />
          </mesh>

          {/* Ground Reaction Force Vectors at each foot */}
          <GRFForceArrow footPos={joints.left_ankle} grfMagnitude={grfMultiplier} opacity={forceOpacity} />
          <GRFForceArrow footPos={joints.right_ankle} grfMagnitude={grfMultiplier} opacity={forceOpacity} />
        </group>
      )}
    </group>
  );
};

