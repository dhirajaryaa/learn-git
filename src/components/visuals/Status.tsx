"use client";

import { motion } from "motion/react";
import { IconTerminal2 } from "@tabler/icons-react";

const LINES: { text: string; cls: string }[] = [
  { text: "On branch main", cls: "text-zinc-700" },
  { text: "Your branch is ahead of 'origin/main' by 2 commits.", cls: "text-zinc-500" },
  { text: "", cls: "" },
  { text: "Changes to be committed:", cls: "text-zinc-700" },
  { text: '  modified:   src/button.tsx  ✚', cls: "text-[#16a34a]" },
  { text: "", cls: "" },
  { text: "Changes not staged for commit:", cls: "text-zinc-700" },
  { text: '  modified:   src/theme.css  ✏', cls: "text-[#dc2626]" },
  { text: "", cls: "" },
  { text: "Untracked files:", cls: "text-zinc-700" },
  { text: "  notes.md", cls: "text-[#2563eb]" },
];

export function Status({ caption }: { caption?: string }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="overflow-hidden rounded-xl border border-line bg-[#0c0c0d] shadow-sm">
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#27c92e]" />
          <span className="ml-3 flex items-center gap-1.5 font-mono text-[11px] text-zinc-500">
            <IconTerminal2 size={12} /> ~/project · git status
          </span>
        </div>
        <div className="flex flex-col px-5 py-4">
          {LINES.map((l, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.17 }}
              className="whitespace-pre py-[2.5px] font-mono text-[11.5px] leading-relaxed"
            >
              {l.text ? <span className={l.cls}>{l.text}</span> : <span className="text-zinc-400"> </span>}
            </motion.div>
          ))}
        </div>
      </div>
      {caption && <p className="mx-auto max-w-md text-center text-[13px] text-muted">{caption}</p>}
    </div>
  );
}