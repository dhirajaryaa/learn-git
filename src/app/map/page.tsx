"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  IconTools,
  IconFolder,
  IconStack2,
  IconDatabase,
  IconCloud,
  IconArrowRight,
  IconRefresh,
} from "@tabler/icons-react";
import { allCommands } from "@/data";
import { CommandIcon } from "@/components/CommandIcon";
import { Reveal } from "@/components/Reveal";
import { useI18n } from "@/components/i18n/LanguageProvider";

type StageId = "setup" | "work" | "index" | "repo" | "remote";

const STAGE_ORDER: StageId[] = ["setup", "work", "index", "repo", "remote"];

const STAGE_ICONS: Record<StageId, React.ElementType> = {
  setup: IconTools,
  work: IconFolder,
  index: IconStack2,
  repo: IconDatabase,
  remote: IconCloud,
};

// where each command acts (structural — vis stays the same in every language)
const PLACEMENT: Record<string, StageId> = {
  "git-init": "setup",
  "git-config": "setup",
  "git-status": "work",
  "git-diff": "work",
  "git-clean": "work",
  "git-add": "index",
  "git-commit": "repo",
  "git-branch": "repo",
  "git-checkout": "repo",
  "git-switch": "repo",
  "git-merge": "repo",
  "git-rebase": "repo",
  "git-reset": "repo",
  "git-revert": "repo",
  "git-restore": "work",
  "git-stash": "work",
  "git-cherry-pick": "repo",
  "git-tag": "repo",
  "git-log": "repo",
  "git-show": "repo",
  "git-blame": "repo",
  "git-reflog": "repo",
  "git-gc": "repo",
  "git-clone": "remote",
  "git-remote": "remote",
  "git-fetch": "remote",
  "git-pull": "remote",
  "git-push": "remote",
};

export default function MapPage() {
  const { ui } = useI18n();

  const chips = new Map<StageId, typeof allCommands>();
  STAGE_ORDER.forEach((s) => chips.set(s, []));
  for (const c of allCommands) {
    const stage = PLACEMENT[c.slug];
    if (!stage) continue;
    chips.get(stage)!.push(c);
  }

  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <div className="bg-dots pointer-events-none absolute inset-0 opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div className="relative mx-auto max-w-6xl px-6 pb-14 pt-16 text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-3.5 py-1.5 text-[12px] font-semibold text-accent">
              <IconRefresh size={13} /> {ui.map.badge}
            </span>
            <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              {ui.map.title}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-[15px] leading-relaxed text-muted">
              {ui.map.subtitle}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto max-w-6xl px-6">
          <div className="hidden items-center justify-between gap-2 md:flex">
            {STAGE_ORDER.map((s, i) => (
              <div key={s} className="flex flex-1 items-center gap-2">
                <StageTop s={s} />
                {i < STAGE_ORDER.length - 1 && <FlowArrow />}
              </div>
            ))}
          </div>

          <div className="mt-2 flex flex-col gap-3 md:hidden">
            {STAGE_ORDER.map((s) => (
              <div key={s} className="flex items-center gap-2">
                <StageTop s={s} />
              </div>
            ))}
          </div>

          {/* stage bodies */}
          <div className="mt-10 grid items-stretch gap-4 md:grid-cols-5">
            {STAGE_ORDER.map((s, i) => {
              const Icon = STAGE_ICONS[s];
              const stage = ui.map.stages[s];
              const accent = s === "remote";
              return (
                <Reveal key={s} delay={i * 0.06} className="h-full">
                  <div
                    className={`flex h-full flex-col gap-2 rounded-2xl border p-3 ${
                      accent ? "border-accent/30 bg-accent/5" : "border-line bg-white dark:bg-zinc-900"
                    }`}
                  >
                    <div className="flex items-center gap-2 px-1.5 pb-1 md:hidden">
                      <Icon size={13} className="text-accent" />
                      <span className="text-[12px] font-semibold">{stage.title}</span>
                      <span className="ml-auto text-[10px] text-muted">{stage.sub}</span>
                    </div>
                    {(chips.get(s) ?? []).map((c) => (
                      <Link
                        key={c.slug}
                        href={`/commands/${c.slug}`}
                        className="group rounded-xl border border-line bg-white px-2.5 py-2 transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-sm dark:bg-zinc-800"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <code className="font-mono text-[11px] font-semibold text-zinc-800 transition-colors group-hover:text-accent dark:text-zinc-100">
                            {c.command}
                          </code>
                          <CommandIcon name={c.icon} size={11} className="text-zinc-300 transition-colors group-hover:text-accent" />
                        </div>
                        <p className="mt-0.5 truncate text-[10px] text-muted">
                          {ui.map.placements[c.slug]}
                        </p>
                      </Link>
                    ))}
                    <p className="mt-auto px-1 pt-2 text-[10px] italic text-zinc-300 md:hidden">
                      {stage.sub}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>

          <Reveal delay={0.2}>
            <div className="mt-14 overflow-hidden rounded-2xl border border-line bg-zinc-50/50 dark:bg-zinc-900/40">
              <div className="grid divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                <Legend color="bg-accent" title={ui.map.legendStaged.title} desc={ui.map.legendStaged.desc} />
                <Legend color="bg-red-500" title={ui.map.legendModified.title} desc={ui.map.legendModified.desc} />
                <Legend color="bg-cyan-600" title={ui.map.legendUntracked.title} desc={ui.map.legendUntracked.desc} />
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function StageTop({ s }: { s: StageId }) {
  const { ui } = useI18n();
  const stage = ui.map.stages[s];
  const Icon = STAGE_ICONS[s];
  const accent = s === "remote";
  return (
    <div
      className={`flex flex-1 items-center gap-2.5 rounded-2xl border px-4 py-3 ${
        accent ? "border-accent/30 bg-accent/5" : "border-line bg-white dark:bg-zinc-900"
      }`}
    >
      <span
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
          accent ? "bg-accent text-white" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
        }`}
      >
        <Icon size={15} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[12.5px] font-semibold leading-tight">{stage.title}</p>
        <p className="truncate text-[10px] text-muted">{stage.sub}</p>
      </div>
    </div>
  );
}

function FlowArrow() {
  return (
    <div className="relative h-8 w-6 shrink-0 overflow-visible">
      <motion.div
        className="absolute inset-y-0 right-0 flex w-4 items-center"
        animate={{ x: [0, 8, 0], opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <IconArrowRight size={14} className="text-accent" />
      </motion.div>
    </div>
  );
}

function Legend({ color, title, desc }: { color: string; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 px-6 py-5">
      <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${color}`} />
      <div>
        <p className="text-[13px] font-semibold">{title}</p>
        <p className="mt-0.5 text-[12px] leading-relaxed text-muted">{desc}</p>
      </div>
    </div>
  );
}