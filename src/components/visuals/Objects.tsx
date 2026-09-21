"use client";

import { motion } from "motion/react";
import { IconFile, IconFolder, IconMail, IconHistory } from "@tabler/icons-react";

export function Objects({ caption }: { caption?: string }) {
  const commit = [
    { k: "tree", v: "f2b0c9d1a4e8…", ic: IconFolder },
    { k: "parent", v: "9a2f1c0b7d3e…", ic: IconHistory },
    { k: "author", v: "Ada <ada@dev> 12:07 +0200", ic: IconMail },
    { k: "committer", v: "Ada <ada@dev> 12:07 +0200", ic: IconMail },
    { k: "message", v: "feat: add dark mode", ic: IconFile },
  ] as const;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-stretch sm:justify-center">
        {/* commit */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="w-full max-w-xs rounded-2xl border border-accent/40 bg-white p-4 shadow-sm dark:bg-zinc-900"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="rounded-full bg-accent/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-accent">
              commit
            </span>
            <span className="font-mono text-[11px] text-zinc-400">74d3b9f0…</span>
          </div>
          <div className="flex flex-col gap-1.5">
            {commit.map((r, i) => (
              <motion.div
                key={r.k}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 + i * 0.15 }}
                className="flex items-center gap-2 rounded-lg bg-zinc-50 px-2.5 py-1.5 dark:bg-zinc-800/60"
              >
                <r.ic size={12} className="shrink-0 text-zinc-400" />
                <span className="w-[74px] shrink-0 font-mono text-[10.5px] text-zinc-500 dark:text-zinc-400">
                  {r.k}
                </span>
                <span className="truncate font-mono text-[10.5px] text-zinc-700 dark:text-zinc-300">{r.v}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="hidden font-mono text-[20px] text-zinc-300 sm:block"
        >
          →
        </motion.div>

        {/* tree */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="w-full max-w-xs rounded-2xl border border-line bg-white p-4 shadow-sm dark:bg-zinc-900"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              tree
            </span>
            <span className="font-mono text-[11px] text-zinc-400">f2b0c9d1…</span>
          </div>
          <div className="flex flex-col gap-1.5">
            {[
              "blob aa8f1e… README.md",
              "blob 3c2d09… src/main.ts",
              "tree b7e1a2… src/",
            ].map((row, i) => (
              <motion.div
                key={row}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.3 + i * 0.15 }}
                className="flex items-center gap-2 rounded-lg bg-zinc-50 px-2.5 py-1.5 font-mono text-[10.5px] text-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300"
              >
                {row}
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="hidden font-mono text-[20px] text-zinc-300 sm:block"
        >
          →
        </motion.div>

        {/* blobs */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.75 }}
          className="w-full max-w-xs rounded-2xl border border-line bg-white p-4 shadow-sm dark:bg-zinc-900"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              blob
            </span>
            <span className="font-mono text-[11px] text-zinc-400">aa8f1e…</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              className="rounded-lg border border-dashed border-line px-2.5 py-2 font-mono text-[10.5px] leading-relaxed text-zinc-500"
            >
              header: blob + size<br />content bytes…
              <br />
              <span className="text-accent/70">SHA-1 → unique key of content</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
      {caption && <p className="mx-auto max-w-md text-center text-[13px] text-muted">{caption}</p>}
    </div>
  );
}