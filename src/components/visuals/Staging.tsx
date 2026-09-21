"use client";

import { motion } from "motion/react";
import {
  IconFolder,
  IconStack2,
  IconDatabase,
  IconArrowRight,
  IconArrowLeft,
  IconArrowDown,
  IconFile,
  IconFilePencil,
  IconQuestionMark,
} from "@tabler/icons-react";

function Card({
  title,
  sub,
  icon: Icon,
  files,
  empty,
  active,
  accentNote,
}: {
  title: string;
  sub: string;
  icon: React.ComponentType<{ size?: number | string }>;
  files: { name: string; badge: "M" | "?" | "A" | null }[];
  empty: string;
  active: boolean;
  accentNote?: string;
}) {
  return (
    <div
      className={`w-full rounded-2xl border bg-white p-4 transition-colors duration-500 dark:bg-zinc-900 ${
        active ? "border-accent/50 glow-accent" : "border-line"
      }`}
    >
      <div className="mb-3 flex items-center gap-2">
        <span
          className={`grid h-7 w-7 place-items-center rounded-md transition-colors duration-500 ${
            active ? "bg-accent text-white" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
          }`}
        >
          <Icon size={15} />
        </span>
        <div>
          <p className="text-[12.5px] font-semibold leading-tight text-foreground">{title}</p>
          <p className="text-[10.5px] font-mono text-muted">{sub}</p>
        </div>
        {accentNote && (
          <span className="ml-auto rounded-full bg-accent/10 px-2 py-0.5 text-[9px] font-bold text-accent">
            {accentNote}
          </span>
        )}
      </div>

      <div className="flex min-h-[86px] flex-col gap-1.5">
        {files.length === 0 && (
          <p className="py-3 text-center text-[11px] text-zinc-400 dark:text-zinc-500">
            {empty}
          </p>
        )}
        {files.map((f, fi) => (
          <motion.div
            key={`${title}-${f.name}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 + fi * 0.07 }}
            className="flex items-center gap-2 rounded-lg border border-line bg-zinc-50/60 px-2.5 py-1.5 dark:bg-zinc-800/50"
          >
            {f.badge === null ? (
              <IconFile size={12} className="text-zinc-400" />
            ) : f.badge === "?" ? (
              <IconQuestionMark size={12} className="text-cyan-500" />
            ) : (
              <IconFilePencil size={12} className="text-accent" />
            )}
            <span className="truncate font-mono text-[11px] text-zinc-700 dark:text-zinc-300">
              {f.name}
            </span>
            {f.badge && (
              <span
                className={`ml-auto rounded px-1.5 text-[9px] font-bold ${
                  f.badge === "?"
                    ? "bg-cyan-50 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-400"
                    : "bg-accent/10 text-accent"
                }`}
              >
                {f.badge}
              </span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

type Dir = "forward" | "back" | "plain";

function Arrow({ dir, label, active }: { dir: Dir; label: string; active: boolean }) {
  if (!active) return <div className="h-2 shrink-0 sm:h-14 sm:w-10" />;
  const xK = dir === "forward" ? [0, 26, 0] : dir === "back" ? [0, -26, 0] : [0, 0, 0];
  const Icon = dir === "back" ? IconArrowLeft : IconArrowRight;
  return (
    <div className="relative flex h-14 w-full shrink-0 items-center justify-center sm:h-auto sm:w-12 sm:py-0 sm:flex-1 sm:self-stretch">
      {/* horizontal connector (sm+) */}
      <svg
        className="absolute inset-0 hidden h-full w-full sm:block"
        viewBox="0 0 100 60"
        fill="none"
        preserveAspectRatio="none"
      >
        <path d="M 0 30 H 100" stroke="#e4e4e7" strokeWidth={1.5} strokeDasharray="4 4" />
      </svg>
      <motion.div
        className="absolute top-1/2 left-1/2 z-10 hidden h-7 items-center gap-1.5 rounded-full bg-accent px-2.5 text-white shadow-sm sm:flex"
        animate={{ x: xK }}
        transition={{
          duration: dir === "plain" ? 2.4 : 1.6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ x: "-50%" }}
      >
        <Icon size={12} />
        <span className="whitespace-nowrap text-[10px] font-semibold">{label}</span>
      </motion.div>
      {/* vertical connector (mobile) */}
      <svg
        className="absolute inset-0 h-full w-full sm:hidden"
        viewBox="0 0 80 56"
        fill="none"
        preserveAspectRatio="none"
      >
        <path d="M 40 0 V 56" stroke="#e4e4e7" strokeWidth={1.5} strokeDasharray="4 4" />
      </svg>
      <motion.div
        className="absolute left-1/2 z-10 grid h-7 w-7 -translate-x-1/2 place-items-center rounded-full bg-accent text-white shadow-sm sm:hidden"
        animate={{ y: [0, 22, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <IconArrowDown size={12} />
      </motion.div>
      <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium text-muted">
        {label}
      </span>
    </div>
  );
}

export function Staging({
  staged = [],
  dirty = [],
  untracked = [],
  mode,
  caption,
}: {
  staged?: string[];
  dirty?: string[];
  untracked?: string[];
  mode: "add" | "commit" | "restore";
  caption?: string;
}) {
  const workFiles = [
    ...staged.map((f) => ({ name: f, badge: "M" as const })),
    ...dirty.map((f) => ({ name: f, badge: "M" as const })),
    ...untracked.map((f) => ({ name: f, badge: "?" as const })),
  ];
  const indexFiles = staged.map((f) => ({ name: f, badge: "A" as const }));
  const repoFiles = mode === "commit" ? staged.map((f) => ({ name: f, badge: null })) : [];

  const flow = {
    add: { from: 0, to: 1, label: "snapshot copied in" },
    commit: { from: 1, to: 2, label: "sealed into history" },
    restore: { from: 1, to: 0, label: "back out of the index" },
  }[mode];

  const lanes: { key: string; title: string; sub: string; icon: React.ComponentType<{ size?: number | string }>; files: { name: string; badge: "M" | "?" | "A" | null }[]; empty: string; note?: string }[] = [
    {
      key: "work",
      title: "Working Tree",
      sub: "files on disk",
      icon: IconFolder,
      files: workFiles,
      empty: "clean / no files",
      note: flow.to === 0 ? "files restored" : undefined,
    },
    {
      key: "index",
      title: "Index · Staging",
      sub: ".git/index",
      icon: IconStack2,
      files: indexFiles,
      empty: mode === "commit" ? "staged files here →" : "nothing staged",
      note: flow.from === 1 ? "staged" : undefined,
    },
    {
      key: "repo",
      title: "Repository",
      sub: "objects/ → commits",
      icon: IconDatabase,
      files: repoFiles,
      empty: "committed history",
      note: mode === "commit" ? "new commit" : undefined,
    },
  ];

  const gap = (i: number): { dir: Dir; label: string; active: boolean } => {
    // gap between lane i and i+1
    if (flow.from + flow.to === 2) {
      // add flow: work→index  (gap 0 active)
      return { dir: "forward", label: flow.label, active: i === 0 };
    }
    if (mode === "restore") {
      // index→work (gap 0 active, backward)
      return { dir: "back", label: flow.label, active: i === 0 };
    }
    // commit: index→repo (gap 1 active)
    return {
      dir: i === 0 ? "plain" : "forward",
      label: i === 0 ? "filtered in the index" : flow.label,
      active: true,
    };
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-stretch sm:flex-row sm:items-stretch">
        {lanes.map((l, i) => (
          <div key={l.key} className="flex flex-col sm:flex-1 sm:flex-row sm:items-center">
            <Card
              title={l.title}
              sub={l.sub}
              icon={l.icon}
              files={l.files}
              empty={l.empty}
              active={flow.to === i}
              accentNote={l.note}
            />
            {i < lanes.length - 1 && <Arrow {...gap(i)} />}
          </div>
        ))}
      </div>
      {caption && <p className="mx-auto max-w-md text-center text-[13px] text-muted">{caption}</p>}
    </div>
  );
}