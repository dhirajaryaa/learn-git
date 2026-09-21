"use client";

import { motion } from "motion/react";
import { IconArrowForward } from "@tabler/icons-react";
import { GitGraph } from "./GitGraph";
import type { RebaseSpec } from "@/lib/types";

export function Rebase({ spec }: { spec: RebaseSpec }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid items-center gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white p-4 dark:bg-zinc-900">
          <p className="mb-1 text-center font-mono text-[10.5px] font-semibold uppercase tracking-widest text-muted">
            before
          </p>
          <GitGraph spec={spec.before} height={280} />
        </div>

        <div className="relative rounded-2xl border border-accent/40 bg-white p-4 glow-accent dark:bg-zinc-900">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-accent px-3 py-1 text-[10px] font-semibold text-white shadow"
          >
            {spec.action}
          </motion.div>
          <p className="mb-1 text-center font-mono text-[10.5px] font-semibold uppercase tracking-widest text-accent">
            after · linear
          </p>
          <GitGraph spec={spec.after} height={280} />
        </div>
      </div>
      <p className="mx-auto flex max-w-md items-center gap-2 text-center text-[13px] text-muted">
        <IconArrowForward size={14} className="shrink-0 text-accent" />
        Each commit is re-created as a new object — h hashes rolled, history straight.
      </p>
    </div>
  );
}