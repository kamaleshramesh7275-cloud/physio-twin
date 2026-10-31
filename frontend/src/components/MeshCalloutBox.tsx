import React, { useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { ZoneId } from "../HoloModel3D";
import type { RegionBounds3D } from "../lib/regionBounds";

interface MeshCalloutBoxProps {
  regionId: ZoneId;
  bounds: RegionBounds3D;
  meshObject: THREE.Object3D | null;
  risk: number;
  label: string;
  detail?: string;
  isSelected?: boolean;
  onSelect?: (zone: ZoneId) => void;
  indexOffset?: number;
}

export function MeshCalloutBox({
  regionId,
  bounds,
  meshObject,
  risk,
  label,
  detail,
  isSelected,
  onSelect,
  indexOffset = 0,
}: MeshCalloutBoxProps) {
  const { camera, size } = useThree();
  const [screenRect, setScreenRect] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
    visible: boolean;
    isBackface: boolean;
  }>({ x: 0, y: 0, w: 0, h: 0, visible: false, isBackface: false });

  // Reusable vectors to eliminate GC allocations during useFrame
  const cornerVecsRef = useRef<THREE.Vector3[]>(
    Array.from({ length: 8 }, () => new THREE.Vector3())
  );
  const centerVecRef = useRef(new THREE.Vector3());
  const normalVecRef = useRef(new THREE.Vector3());

  useFrame(() => {
    if (!meshObject || risk <= 0) return;

    const { min, max, center } = bounds;
    const corners = cornerVecsRef.current;

    // 8 Bounding Box Corners in Local Space
    corners[0].set(min[0], min[1], min[2]);
    corners[1].set(min[0], min[1], max[2]);
    corners[2].set(min[0], max[1], min[2]);
    corners[3].set(min[0], max[1], max[2]);
    corners[4].set(max[0], min[1], min[2]);
    corners[5].set(max[0], min[1], max[2]);
    corners[6].set(max[0], max[1], min[2]);
    corners[7].set(max[0], max[1], max[2]);

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let anyBehindCamera = false;

    // Project each corner to 2D Screen Space
    for (let i = 0; i < 8; i++) {
      const worldPos = corners[i].applyMatrix4(meshObject.matrixWorld);
      if (worldPos.clone().applyMatrix4(camera.matrixWorldInverse).z > -0.1) {
        anyBehindCamera = true;
        break;
      }
      const proj = worldPos.project(camera);
      const sx = ((proj.x + 1) * size.width) / 2;
      const sy = ((-proj.y + 1) * size.height) / 2;

      minX = Math.min(minX, sx);
      minY = Math.min(minY, sy);
      maxX = Math.max(maxX, sx);
      maxY = Math.max(maxY, sy);
    }

    if (anyBehindCamera) {
      setScreenRect(r => (r.visible ? { ...r, visible: false } : r));
      return;
    }

    // Determine backface occluded status relative to camera
    centerVecRef.current.set(center[0], center[1], center[2]).applyMatrix4(meshObject.matrixWorld);
    normalVecRef.current.set(0, 0, 1).applyQuaternion(meshObject.quaternion);
    const viewDir = centerVecRef.current.clone().sub(camera.position).normalize();
    const isBackface = normalVecRef.current.dot(viewDir) > 0.45;

    setScreenRect({
      x: minX,
      y: minY,
      w: Math.max(16, maxX - minX),
      h: Math.max(16, maxY - minY),
      visible: true,
      isBackface,
    });
  });

  if (!screenRect.visible || screenRect.isBackface) return null;

  // Stagger callout cards left vs right based on which side of the body the zone is
  const isLeftBody = regionId.startsWith("left");
  const cardX = isLeftBody
    ? Math.min(size.width - 240, screenRect.x + screenRect.w + 28)
    : Math.max(16, screenRect.x - 230);
  const cardY = Math.max(20, Math.min(size.height - 120, screenRect.y + indexOffset * 65));

  const riskColor = risk >= 65 ? "#dc2626" : risk >= 30 ? "#d97706" : "#059669";
  const badgeBg = risk >= 65 ? "bg-rose-50 text-rose-700 border-rose-300" : risk >= 30 ? "bg-amber-50 text-amber-700 border-amber-300" : "bg-emerald-50 text-emerald-700 border-emerald-300";

  return (
    <Html fullscreen zIndexRange={[100, 0]}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* 2D Bounding Box with dashed border derived directly from mesh geometry */}
        <div
          className="absolute border-2 border-dashed rounded-lg transition-all duration-75 pointer-events-auto cursor-pointer"
          style={{
            left: `${screenRect.x}px`,
            top: `${screenRect.y}px`,
            width: `${screenRect.w}px`,
            height: `${screenRect.h}px`,
            borderColor: riskColor,
            boxShadow: `0 0 12px ${riskColor}30`,
            backgroundColor: `${riskColor}10`,
          }}
          onClick={() => onSelect && onSelect(regionId)}
        />

        {/* SVG Leader Line connecting 3D bounding box to Callout Card */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <line
            x1={isLeftBody ? screenRect.x + screenRect.w : screenRect.x}
            y1={screenRect.y + screenRect.h / 2}
            x2={isLeftBody ? cardX : cardX + 210}
            y2={cardY + 24}
            stroke={riskColor}
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
          <circle
            cx={isLeftBody ? screenRect.x + screenRect.w : screenRect.x}
            cy={screenRect.y + screenRect.h / 2}
            r="3"
            fill={riskColor}
          />
        </svg>

        {/* HTML Callout Card */}
        <div
          className="absolute z-20 pointer-events-auto bg-white/95 border border-slate-200 rounded-2xl p-3 shadow-xl backdrop-blur-md w-52 transition-all duration-100 cursor-pointer"
          style={{
            left: `${cardX}px`,
            top: `${cardY}px`,
          }}
          onClick={() => onSelect && onSelect(regionId)}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-extrabold text-slate-900 text-xs">
              {regionId.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
            </span>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${badgeBg}`}>
              {risk}%
            </span>
          </div>
          <div className="text-[10px] font-medium text-slate-600 leading-snug">
            {detail || label || `Elevated strain detected in ${regionId.replace("_", " ")}`}
          </div>
        </div>
      </div>
    </Html>
  );
}
