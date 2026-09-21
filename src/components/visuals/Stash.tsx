"use client";

import { motion } from "motion/react";
import { IconArchive, IconArrowRight, IconArrowDown, IconCheck } from "@tabler/icons-react";
import { useMediaQuery } from "@/components/useMediaQuery";

const FILES = ["src/wip.ts", "docs/notes.md", "env.local"];

export function Stash({ caption }: { caption?: string }) {
  const vertical = !useMediaQuery("(min-width: 640px)");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-stretch sm:flex-row sm:items-center">
        {/* worktree */}
        <div className="w-full rounded-2xl border border-line bg-white p-4 dark:bg-zinc-900 sm:flex-1">
          <div className="mb-3 flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              <IconArchive size={15} />
            </span>
            <div>
              <p className="text-[12.5px] font-semibold leading-tight">Working Tree</p>
              <p className="text-[10.5px] font-mono text-muted">before git stash</p>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            {FILES.map((f, i) => (
              <motion.div
                key={f}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-2 rounded-lg border border-line bg-zinc-50/60 px-3 py-2 font-mono text-[11px] text-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-300"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                {f}
              </motion.div>
            ))}
          </div>
        </div>

        {/* connector */}
        <div className="relative flex h-14 w-full shrink-0 items-center justify-center sm:h-36 sm:w-20">
          <svg
            className="absolute inset-0 hidden h-full w-full sm:block"
            viewBox="0 0 80 140"
            fill="none"
            preserveAspectRatio="none"
          >
            <path d="M 40 0 V 140" stroke="#e4e4e7" strokeWidth={1.5} strokeDasharray="5 5" />
          </svg>
          <svg
            className="absolute inset-x-8 top-0 h-14 w-[calc(100%-4rem)] sm:hidden"
            viewBox="0 0 100 56"
            fill="none"
            preserveAspectRatio="none"
          >
            <path d="M 0 28 H 100" stroke="#e4e4e7" strokeWidth={1.5} strokeDasharray="4 4" />
          </svg>
          <motion.div
            className="relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-white shadow-md"
            animate={vertical ? { y: ["-50%", "50%", "-50%"] } : { x: ["-50%", "430%", "-50%"] }}
            transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut" }}
            style={{ x: "-50%", y: "-50%" }}
          >
            {vertical ? <IconArrowDown size={14} /> : <IconArrowRight size={14} />}
          </motion.div>
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9.5px] font-medium text-muted">
            packed away
          </span>
        </div>

        {/* stash stack */}
        <div className="w-full rounded-2xl border border-accent/40 bg-white p-4 glow-accent dark:bg-zinc-900 sm:flex-1">
          <div className="mb-3 flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-accent text-white">
              <IconArchive size={15} />
            </span>
            <div>
              <p className="text-[12.5px] font-semibold leading-tight">Stash Stack</p>
              <p className="text-[10.5px] font-mono text-muted">refs/stash · LIFO</p>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            {["stash@{0}  WIP: login work"].map((f, i) => (
              <motion.div
                key={f}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                className="flex items-center gap-2 rounded-lg border border-accent/20 bg-accent/5 px-3 py-2 font-mono text-[11px] text-zinc-700 dark:text-zinc-300"
              >
                <IconCheck size={12} className="text-accent" />
                {f}
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
              className="flex items-center gap-2 rounded-lg border border-dashed border-line px-3 py-2 font-mono text-[11px] text-zinc-400"
            >
              workspace is clean now
            </motion.div>
          </div>
        </div>
      </div>
      {caption && <p className="mx-auto max-w-md text-center text-[13px] text-muted">{caption}</p>}
    </div>
  );
}