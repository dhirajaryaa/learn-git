"use client";

import { motion } from "motion/react";
import {
  IconDatabase,
  IconCloud,
  IconFolder,
  IconDownload,
  IconUpload,
} from "@tabler/icons-react";
import { useMediaQuery } from "@/components/useMediaQuery";

export function Remote({
  remote,
  branch,
  mo,
  caption,
}: {
  remote: string;
  branch: string;
  mo: "push" | "pull" | "fetch" | "clone";
  caption?: string;
}) {
  const right = mo === "push";
  const vertical = !useMediaQuery("(min-width: 640px)");
  const dirText = {
    push: `new objects uploaded → ${remote}/${branch}`,
    fetch: `new objects downloaded ← ${remote}/${branch}`,
    pull: `objects downloaded, then merged ↓`,
    clone: `everything streams down ↓`,
  }[mo];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-stretch sm:flex-row sm:items-center sm:justify-center">
        {/* local */}
        <div className="w-full rounded-2xl border border-line bg-white p-4 dark:bg-zinc-900 sm:flex-1">
          <div className="mb-4 flex items-center gap-2">
            <span className={`grid h-7 w-7 place-items-center rounded-md ${right ? "bg-accent text-white" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"}`}>
              <IconFolder size={15} />
            </span>
            <div>
              <p className="text-[12.5px] font-semibold leading-tight">Your machine</p>
              <p className="text-[10.5px] font-mono text-muted">local repository</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-line bg-zinc-50/60 px-3 py-2 dark:bg-zinc-800/50">
            <span className="h-3 w-3 rounded-full bg-accent" />
            <span className="font-mono text-[11px] text-zinc-700 dark:text-zinc-300">{branch}</span>
            {mo === "push" && (
              <span className="ml-auto rounded bg-accent/10 px-1.5 text-[9px] font-bold text-accent">
                ahead ⇗
              </span>
            )}
            {mo === "fetch" && (
              <span className="ml-auto rounded bg-zinc-100 px-1.5 text-[9px] font-bold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                untouched ✓
              </span>
            )}
          </div>
        </div>

        {/* connector */}
        <div className="relative flex h-20 w-full shrink-0 items-center justify-center sm:h-40 sm:w-28 sm:justify-center">
          <svg
            className={`absolute inset-0 h-full w-full ${vertical ? "sm:block" : "sm:block"} hidden sm:block`}
            viewBox="0 0 96 140"
            fill="none"
            preserveAspectRatio="none"
          >
            <path d="M 48 0 V 140" stroke="#e4e4e7" strokeWidth={1.5} strokeDasharray="5 5" />
          </svg>
          <svg
            className="absolute inset-x-10 top-0 h-16 w-[calc(100%-5rem)] sm:hidden"
            viewBox="0 0 100 56"
            fill="none"
            preserveAspectRatio="none"
          >
            <path d="M 0 28 H 100" stroke="#e4e4e7" strokeWidth={1.5} strokeDasharray="4 4" />
          </svg>
          <motion.div
            className="relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-white shadow-md"
            animate={
              vertical
                ? { y: ["-50%", "50%", "-50%"] }
                : { x: ["-50%", "410%", "-50%"] }
            }
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ x: "-50%", y: "-50%" }}
          >
            {mo === "push" || mo === "clone" ? <IconUpload size={14} /> : <IconDownload size={14} />}
          </motion.div>
          <span className="absolute w-max text-[9.5px] font-medium text-muted -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap sm:bottom-1">
            {dirText}
          </span>
        </div>

        {/* remote */}
        <div className="w-full rounded-2xl border border-accent/30 bg-accent/5 p-4 dark:bg-accent/10 sm:flex-1">
          <div className="mb-4 flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-accent text-white">
              <IconCloud size={15} />
            </span>
            <div>
              <p className="text-[12.5px] font-semibold leading-tight">
                Remote <span className="font-mono text-[11px] text-accent">{remote}</span>
              </p>
              <p className="text-[10.5px] font-mono text-muted">everything.git</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-line bg-zinc-50/60 px-3 py-2 dark:bg-zinc-800/50">
            <IconDatabase size={13} className="text-zinc-400" />
            <span className="font-mono text-[11px] text-zinc-700 dark:text-zinc-300">
              refs/heads/{branch}
            </span>
            {mo === "push" && <span className="ml-auto text-[9px] font-bold text-accent">← advances</span>}
            {mo === "pull" && <span className="ml-auto text-[9px] font-bold text-accent">← merges down</span>}
          </div>
        </div>
      </div>

      {caption && <p className="mx-auto max-w-md text-center text-[13px] text-muted">{caption}</p>}
    </div>
  );
}