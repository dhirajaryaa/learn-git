"use client";

import { motion } from "motion/react";
import { IconFolder, IconFile, IconSettings, IconDatabase } from "@tabler/icons-react";

interface Tree {
  name: string;
  icon?: "file" | "folder" | "db" | "gear" | "settings";
  note?: string;
  relative?: boolean;
}

const TREES: Record<string, Tree[]> = {
  init: [
    { name: ".git", icon: "folder" },
    { name: "  ├── HEAD", icon: "file", note: "→ ref: refs/heads/main" },
    { name: "  ├── index", icon: "file", note: "the staging area (empty)" },
    { name: "  ├── objects/", icon: "folder" },
    { name: "  │   ├── info/", icon: "folder" },
    { name: "  │   └── pack/", icon: "folder" },
    { name: "  └── refs/", icon: "folder" },
    { name: "      ├── heads/", icon: "folder", note: "your branches" },
    { name: "      └── tags/", icon: "folder" },
  ],
  config: [
    { name: "scope  ──  who it affects", icon: "file" },
    { name: "/etc/gitconfig", icon: "settings", note: "--system · every user" },
    { name: "~/.gitconfig", icon: "settings", note: "--global · you, all repos" },
    { name: ".git/config", icon: "settings", note: "--local · this repo" },
  ],
};

export function GitDir({ kind, caption }: { kind: "init" | "config"; caption?: string }) {
  const tree = TREES[kind];
  return (
    <div className="flex flex-col gap-5">
      <div className="overflow-hidden rounded-xl border border-line bg-[#fafafb]">
        <div className="flex items-center gap-2 border-b border-line bg-white px-4 py-2.5 dark:bg-zinc-900">
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
          <div className="ml-3 flex items-center gap-1.5 font-mono text-[11px] text-muted">
            {kind === "init" ? <IconFolder size={12} /> : <IconSettings size={12} />}
            {kind === "init" ? "your-project/ · after git init" : "git config --list"}
          </div>
        </div>
        <div className="flex flex-col px-5 py-4">
          {tree.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
              className="flex items-center gap-1.5 py-[3px] font-mono text-[12px]"
            >
              {t.icon === "folder" ? (
                <IconFolder size={13} className="shrink-0 text-accent/70" />
              ) : t.icon === "db" ? (
                <IconDatabase size={13} className="shrink-0 text-accent/70" />
              ) : t.icon === "settings" ? (
                <IconSettings size={13} className="shrink-0 text-accent/70" />
              ) : (
                <IconFile size={13} className="shrink-0 text-zinc-400" />
              )}
              <span className={t.icon === "folder" ? "text-zinc-700" : "text-zinc-600"}>
                {t.name}
              </span>
              {t.note && (
                <span className="ml-2 hidden text-[10.5px] italic text-zinc-400 sm:inline">
                  {t.note}
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </div>
      {caption && <p className="mx-auto max-w-md text-center text-[13px] text-muted">{caption}</p>}
    </div>
  );
}