"use client";

import type { ReactNode } from "react";
import type { Level } from "@/lib/types";
import { useLearner } from "@/components/providers";

const LEVEL_ORDER: Record<Level, number> = { child: 0, junior: 1, developer: 2 };

export function ShowAt({ at, children }: { at: Level; children: ReactNode }) {
  const { level } = useLearner();
  return LEVEL_ORDER[level] >= LEVEL_ORDER[at] ? children : null;
}