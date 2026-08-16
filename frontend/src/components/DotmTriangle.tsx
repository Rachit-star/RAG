"use client";

import React, { useEffect, useRef, useState } from "react";

interface DotmTriangleProps {
  size?: number;
  dotSize?: number;
  color?: string;
  speed?: number;
  bloom?: boolean;
}

const MATRIX_SIZE = 7;
const BASE_OPACITY = 0.08;
const HIGH_OPACITY = 0.94;
const CENTER_DIM = 0.2;

const TRIANGLE_CELLS = new Set([
  "1,3",
  "2,2",
  "2,4",
  "3,1",
  "3,3",
  "3,5",
  "4,0",
  "4,2",
  "4,4",
  "4,6",
]);

const PERIMETER_PATH: ReadonlyArray<readonly [number, number]> = [
  [1, 3],
  [2, 2],
  [3, 1],
  [4, 0],
  [4, 2],
  [4, 4],
  [4, 6],
  [3, 5],
  [2, 4],
];

const PATH_LEN = PERIMETER_PATH.length;
const TRAIL_SPAN = 3.35;
const HALF = PATH_LEN / 2;

function isWithinTriangleMask(row: number, col: number): boolean {
  return TRIANGLE_CELLS.has(`${row},${col}`);
}

function pathIndex(row: number, col: number): number | null {
  for (let i = 0; i < PATH_LEN; i++) {
    const [pr, pc] = PERIMETER_PATH[i];
    if (pr === row && pc === col) {
      return i;
    }
  }
  return null;
}

function modF(n: number, m: number): number {
  return ((n % m) + m) % m;
}

function smoothstep01(edge0: number, edge1: number, x: number): number {
  if (edge1 <= edge0) return x >= edge1 ? 1 : 0;
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export function DotmTriangle({
  size = 32,
  dotSize = 4,
  color = "currentColor",
  speed = 1.2,
  bloom = true,
}: DotmTriangleProps) {
  const [phase, setPhase] = useState(0);
  const requestRef = useRef<number>(0);
  const previousTimeRef = useRef<number>(0);

  // Cycle takes ~1800ms by default (adjusted by speed)
  const cycleDuration = 1800 / speed;

  const animate = (time: number) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current;
      setPhase((prevPhase) => {
        const newPhase = prevPhase + deltaTime / cycleDuration;
        return newPhase % 1;
      });
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [speed]);

  const gap = Math.max(1, Math.floor((size - dotSize * MATRIX_SIZE) / (MATRIX_SIZE - 1)));
  const totalSize = dotSize * MATRIX_SIZE + gap * (MATRIX_SIZE - 1);

  return (
    <div
      style={{
        display: "inline-block",
        width: `${totalSize}px`,
        height: `${totalSize}px`,
        color: color,
        position: "relative",
      }}
      aria-label="Loading..."
      role="status"
    >
      <div
        style={{
          display: "grid",
          gap: `${gap}px`,
          gridTemplateColumns: `repeat(${MATRIX_SIZE}, 1fr)`,
          gridTemplateRows: `repeat(${MATRIX_SIZE}, 1fr)`,
          width: "100%",
          height: "100%",
        }}
      >
        {Array.from({ length: MATRIX_SIZE * MATRIX_SIZE }).map((_, index) => {
          const row = Math.floor(index / MATRIX_SIZE);
          const col = index % MATRIX_SIZE;
          const isActive = isWithinTriangleMask(row, col);

          let opacity = 0;
          if (isActive) {
            if (row === 3 && col === 3) {
              opacity = CENTER_DIM;
            } else {
              const idx = pathIndex(row, col);
              if (idx !== null) {
                const s1 = phase * PATH_LEN;
                const s2 = modF(s1 + HALF, PATH_LEN);
                const a = BASE_OPACITY + (1 - smoothstep01(0, TRAIL_SPAN, modF(s1 - idx, PATH_LEN))) * (HIGH_OPACITY - BASE_OPACITY);
                const b = BASE_OPACITY + (1 - smoothstep01(0, TRAIL_SPAN, modF(s2 - idx, PATH_LEN))) * (HIGH_OPACITY - BASE_OPACITY);
                opacity = Math.min(HIGH_OPACITY, Math.max(a, b));
              } else {
                opacity = BASE_OPACITY;
              }
            }
          }

          return (
            <div
              key={index}
              style={{
                width: `${dotSize}px`,
                height: `${dotSize}px`,
                borderRadius: "50%",
                backgroundColor: isActive ? "currentColor" : "transparent",
                opacity: opacity,
                boxShadow: (bloom && isActive && opacity > 0.4) ? `0 0 ${opacity * 4}px currentColor` : "none",
                transition: "opacity 0.05s linear",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
