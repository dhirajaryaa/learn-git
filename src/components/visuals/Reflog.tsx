"use client";

import { motion } from "motion/react";
import { IconClockHour4, IconHash } from "@tabler/icons-react";

const ENTRIES = [
  { hash: "74d3b9f", action: "reset: moving to HEAD~2", from: "HEAD@{0}", now: true },
  { hash: "4b7c2a5", action: "commit: add components", from: "HEAD@{1}" },
  { hash: "9a2f1c0", action: "rebase (start): checkout main", from: "HEAD@{2}" },
  { hash: "c1d8e2f", action: "commit: feature work", from: "HEAD@{3}" },
  { hash: "e5f6a7b", action: "cherry-pick: hotfix", from: "HEAD@{4}" },
];

export function Reflog({ caption }: { caption?: string }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="overflow-hidden rounded-xl border border-line bg-[#fafafb]">
        <div className="flex items-center gap-2 border-b border-line bg-white px-4 py-2 dark:bg-zinc-900">
          <IconClockHour4 size={13} className="text-accent" />
          <span className="font-mono text-[11px] font-semibold text-zinc-600">.git/logs/HEAD</span>
          <span className="ml-auto text-[10px] text-zinc-400">every HEAD movement is journaled</span>
        </div>
        <div className="relative px-4 py-3">
          <div className="absolute bottom-3 left-4 top-3 w-px bg-line" />
          {ENTRIES.map((e, i) => (
            <motion.div
              key={e.hash + i}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.2 }}
              className={`relative mb-1.5 flex items-center gap-2 rounded-lg py-1 pl-5 font-mono text-[11.5px] last:mb-0 ${
                e.now ? "bg-accent/5 font-semibold text-foreground" : "text-zinc-600"
              }`}
            >
              <span className={`absolute left-[7px] top-1/2 h-[7px] w-[7px] -translate-y-1/2 rounded-full ${e.now ? "bg-accent" : "bg-zinc-300"} `} />
              <span className="text-zinc-400">{e.hash}</span>
              <span className="truncate">{e.action}</span>
              <span className="ml-auto shrink-0 text-[10px] text-zinc-400">{e.from}</span>
            </motion.div>
          ))}
        </div>
      </div>
      {caption && <p className="mx-auto max-w-md text-center text-[13px] text-muted">{caption}</p>}
    </div>
  );
}

export function StashPill() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-1 text-[11px] font-semibold text-accent">
      <IconHash size={11} /> recoverable {`HEAD@{n}`}
    </span>
  );
}