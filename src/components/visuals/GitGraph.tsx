"use client";

import { motion } from "motion/react";
import type { GraphSpec, GraphRef } from "@/lib/types";

interface Placed {
  x: number;
  y: number;
  level: number;
  col: number;
}

interface Edge {
  from: Placed;
  to: Placed;
  merge: boolean;
  d: string;
}

const COL_W = 100;
const ROW_H = 74;
const R = 9;
const LEFT = 120;
const TOP = 34;
const CHIP_W = 96;
const CHIP_H = 18;
const CHAR_W = 6.8;

function layout(spec: GraphSpec): Placed[] {
  const placed: Placed[] = [];
  const colsAtLevel = new Map<number, Set<number>>();

  for (const node of spec.nodes) {
    const parentLevels = node.parents.map((p) => placed[p].level);
    const level = parentLevels.length ? Math.max(...parentLevels) + 1 : 0;

    const used = colsAtLevel.get(level) ?? new Set<number>();
    const free = (col: number) => !used.has(col);

    let col = 0;
    if (node.parents.length) {
      const anchor = node.parents[0];
      const preferred = placed[anchor].col;
      col = free(preferred) ? preferred : preferred + 1;
    }
    while (!free(col)) col += 1;
    used.add(col);
    if (!colsAtLevel.has(level)) colsAtLevel.set(level, used);

    placed.push({ x: LEFT + col * COL_W, y: TOP + level * ROW_H, level, col });
  }
  return placed;
}

function edgesFor(placed: Placed[], spec: GraphSpec): Edge[] {
  const edges: Edge[] = [];
  spec.nodes.forEach((node, i) => {
    node.parents.forEach((p, pi) => {
      const from = placed[i];
      const to = placed[p];
      const d =
        from.col === to.col
          ? `M ${from.x} ${from.y + R} L ${to.x} ${to.y - R}`
          : `M ${from.x} ${from.y + R} V ${to.y} H ${to.x} V ${to.y - R}`;
      edges.push({ from, to, merge: pi > 0, d });
    });
  });
  return edges;
}

function refChipTopLeft(p: Placed, index: number) {
  return { x: p.x - 8 - CHIP_W / 2, y: p.y - 26 - index * 24 - CHIP_H / 2 };
}

export function GitGraph({ spec, height }: { spec: GraphSpec; height?: number }) {
  const placed = layout(spec);
  const edges = edgesFor(placed, spec);
  const maxLevel = Math.max(...placed.map((p) => p.level));
  const maxCol = Math.max(...placed.map((p) => p.col));
  const longestMsg = Math.max(...spec.nodes.map((nd) => nd.msg.length * CHAR_W), 72);

  const width = LEFT + maxCol * COL_W + longestMsg + 56;
  const h = height ?? TOP + maxLevel * ROW_H + 120;

  const n = spec.nodes.length;
  const highlight = spec.highlight ?? n - 1;
  const anim = spec.animation;

  const refsByNode = new Map<number, GraphRef[]>();
  (spec.refs ?? []).forEach((r) => {
    const list = refsByNode.get(r.node) ?? [];
    list.push(r);
    refsByNode.set(r.node, list);
  });

  return (
    <div className="flex flex-col">
      <svg
        viewBox={`0 0 ${width} ${h}`}
        className="mx-auto block h-auto w-full max-w-[600px]"
        role="img"
        aria-label="Animated git commit graph"
        style={{ height: "auto" }}
      >
        {/* edges + flow */}
        {edges.map((e, i) => {
          const delay = 0.1 + i * 0.16;
          return (
            <g key={`edge-${i}`}>
              <motion.path
                d={e.d}
                fill="none"
                stroke={e.merge ? "var(--accent)" : "var(--graph-edge)"}
                strokeWidth={e.merge ? 1.6 : 1.4}
                strokeDasharray={e.merge ? "3 3" : undefined}
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0.4 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ pathLength: { duration: 0.7, delay, ease: "easeInOut" }, opacity: { duration: 0.25, delay } }}
              />
              <motion.circle
                r={3}
                fill={e.merge ? "var(--accent)" : "var(--muted)"}
                initial={{ offsetDistance: "0%", opacity: 0 }}
                animate={{ offsetDistance: "100%", opacity: [0, 1, 1, 0] }}
                transition={{
                  offsetDistance: { duration: 1.05, delay: delay + 0.2, ease: "easeInOut" },
                  opacity: { duration: 1.05, delay: delay + 0.2, times: [0, 0.15, 0.85, 1] },
                }}
                style={{ offsetPath: `path("${e.d}")` }}
              />
            </g>
          );
        })}

        {/* nodes */}
        {placed.map((p, i) => {
          const isHighlight = i === highlight;
          return (
            <g key={`node-${i}`}>
              {isHighlight && (
                <motion.circle
                  cx={p.x}
                  cy={p.y}
                  r={R + 4}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth={1.5}
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={{ opacity: [0, 1, 0], scale: [0.5, 1.15, 1.5] }}
                  transition={{ duration: 2.2, delay: 0.6 + i * 0.12, repeat: Infinity, repeatDelay: 0.6, ease: "easeOut" }}
                />
              )}
              <motion.circle
                cx={p.x}
                cy={p.y}
                r={R}
                fill={isHighlight ? "#fff" : "var(--graph-node)"}
                stroke={isHighlight ? "var(--accent)" : "var(--graph-node-stroke)"}
                strokeWidth={isHighlight ? 2 : 1.4}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 380, damping: 22, delay: 0.1 + i * 0.12 }}
              />
              <text
                x={p.x}
                y={p.y + 26}
                textAnchor="middle"
                fontSize={10}
                className="fill-[var(--graph-id)] font-mono"
              >
                {spec.nodes[i].id}
              </text>
              <text
                x={p.x + 28}
                y={p.y + 4.5}
                textAnchor="start"
                fontSize={13}
                className={isHighlight ? "fill-foreground font-semibold" : "fill-[var(--graph-msg)]"}
              >
                {spec.nodes[i].msg}
              </text>

              {/* ref chips */}
              {(refsByNode.get(i) ?? []).map((ref, ri) => {
                const c = refChipTopLeft(p, ri);
                const isHead = !!ref.active;
                return (
                  <motion.g
                    key={`ref-${i}-${ri}`}
                    initial={(() => {
                      switch (anim) {
                        case "tag":
                          return { y: c.y - 46, opacity: 0 };
                        case "branch":
                          return { x: c.x + 140, opacity: 0 };
                        case "reset":
                          return { x: c.x - 110, opacity: 0 };
                        case "merge":
                          return { x: c.x + 140, opacity: 0 };
                        default:
                          return { y: c.y - 40, opacity: 0 };
                      }
                    })()}
                    animate={{ x: c.x, y: c.y, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.7 + i * 0.16 + ri * 0.1 }}
                  >
                    <rect
                      x={c.x}
                      y={c.y}
                      width={CHIP_W}
                      height={CHIP_H}
                      rx={CHIP_H / 2}
                      fill={isHead ? "var(--accent)" : "var(--graph-chip)"}
                      stroke={isHead ? "transparent" : "var(--graph-chip-stroke)"}
                    />
                    <text
                      x={c.x + CHIP_W / 2}
                      y={c.y + CHIP_H / 2 + 4}
                      textAnchor="middle"
                      fontSize={10.5}
                      fontWeight={600}
                      className={isHead ? "fill-white" : "fill-[var(--graph-chip-text)]"}
                    >
                      {ref.name}
                    </text>
                  </motion.g>
                );
              })}
            </g>
          );
        })}
      </svg>

      {spec.caption && (
        <p className="mx-auto mt-5 max-w-md text-center text-[13px] leading-relaxed text-muted">
          {spec.caption}
        </p>
      )}
    </div>
  );
}