"use client";

import Link from "next/link";
import { IconArrowRight, IconBook, IconMap2, IconRoute, IconTerminal2 } from "@tabler/icons-react";
import { Reveal } from "@/components/Reveal";
import { GitGraph } from "@/components/visuals/GitGraph";
import { CommandCard } from "@/components/CommandCard";
import { CommandIcon } from "@/components/CommandIcon";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { commandsByCategory } from "@/data";
import type { Category } from "@/lib/types";
import { tpl } from "@/i18n/types";

const HERO_GRAPH = {
  animation: "log" as const,
  highlight: 5,
  nodes: [
    { id: "9a2f1c0", msg: "init project", parents: [] },
    { id: "4b7c2a5", msg: "add components", parents: [0] },
    { id: "c86d9ee", msg: "style layout", parents: [1] },
    { id: "e1b5a09", msg: "fix nav menu", parents: [2] },
    { id: "74d3b9f", msg: "feat: dark mode", parents: [3] },
    { id: "0f9e8d7", msg: "merge branch 'feature'", parents: [2, 4] },
  ],
  refs: [
    { name: "main", node: 5 },
    { name: "HEAD", node: 5, active: true },
  ],
};

const ORDER: Category[] = [
  "setup",
  "snapshotting",
  "branching",
  "inspecting",
  "undoing",
  "sharing",
];

export default function Home() {
  const { ui, commands } = useI18n();

  const fundamentals = ui.home.fundamentals.map((f, i) => ({
    ...f,
    icon: ["box", "git-branch", "list", "point"][i] ?? "box",
  }));

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,white,transparent)] opacity-60" />
        <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[46rem] -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]" />
        <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-20 md:pt-28">
          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr]">
            <div>
              <Reveal>
                <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-3.5 py-1.5 text-[12px] font-semibold text-accent">
                  <IconTerminal2 size={13} />
                  {ui.home.badge}
                </span>
              </Reveal>
              <Reveal delay={0.08}>
                <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-5xl md:text-[3.4rem]">
                  {ui.home.titleStart} <span className="text-accent">{ui.home.titleAccent}</span>
                  {ui.home.titleEnd}
                </h1>
              </Reveal>
              <Reveal delay={0.16}>
                <p className="mt-6 max-w-xl text-pretty text-[15.5px] leading-relaxed text-muted">
                  {ui.home.subtitle}
                </p>
              </Reveal>
              <Reveal delay={0.24}>
                <div className="mt-9 flex flex-wrap items-center gap-3">
                  <Link
                    href="/commands/git-init"
                    className="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-md transition-transform hover:scale-[1.03]"
                  >
                    {ui.home.ctaStart} <code className="font-mono text-[12.5px]">git init</code>
                    <IconArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <Link
                    href="/map"
                    className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-accent/40 hover:text-accent dark:bg-zinc-900"
                  >
                    <IconMap2 size={16} />
                    {ui.home.ctaMap}
                  </Link>
                </div>
              </Reveal>
              <Reveal delay={0.32}>
                <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 text-[12.5px] text-muted">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-accent" /> {tpl(ui.home.statCommands, { n: Object.keys(commands).length })}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-zinc-300" /> {ui.home.statWorkflows}
                  </span>
                  <span className="flex items-center gap-2">
                    <IconBook size={13} className="text-muted" /> {ui.home.statAnimated}
                  </span>
                </div>
              </Reveal>
            </div>

            <Reveal delay={0.2} className="hidden lg:block">
              <div className="glow-accent rounded-3xl border border-line bg-white/80 p-5 shadow-sm backdrop-blur dark:bg-zinc-900/70">
                <div className="mb-2 flex items-center justify-between px-2">
                  <span className="font-mono text-[11px] font-semibold text-zinc-500">
                    ~/project · git log --graph --oneline
                  </span>
                  <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-[10px] font-semibold text-accent">
                    {ui.home.graphLabel}
                  </span>
                </div>
                <GitGraph spec={HERO_GRAPH} />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* MENTAL MODEL */}
      <section className="border-y border-line py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-accent">
              {ui.home.mentalEyebrow}
            </p>
            <h2 className="mt-3 max-w-2xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              {ui.home.mentalTitle}
            </h2>
            <p className="mt-4 max-w-2xl text-pretty leading-relaxed text-muted">
              {ui.home.mentalSubtitle}
            </p>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {fundamentals.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.08}>
                <div className="group h-full rounded-2xl border border-line bg-zinc-50/40 p-6 transition-all hover:-translate-y-1 hover:border-accent/30 hover:shadow-sm dark:bg-zinc-900/60">
                  <span className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-white text-zinc-500 shadow-sm ring-1 ring-line transition-colors group-hover:bg-accent group-hover:text-white dark:bg-zinc-800 dark:text-zinc-400">
                    <CommandIcon name={f.icon} size={18} />
                  </span>
                  <h3 className="text-[16px] font-semibold tracking-tight">{f.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted">{f.desc}</p>
                  <ul className="mt-4 space-y-1.5">
                    {f.points.map((p) => (
                      <li key={p} className="flex items-center gap-2 text-[12px] text-zinc-500">
                        <span className="h-1 w-1 shrink-0 rounded-full bg-accent/70" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.15} className="mt-10">
            <div className="grid items-center gap-3 rounded-2xl border border-line bg-white p-6 sm:grid-cols-[auto_1fr] dark:bg-zinc-900">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent/10 text-accent">
                <IconMap2 size={20} />
              </span>
              <div className="sm:pl-2">
                <p className="text-[15px] font-semibold">{ui.home.mapBannerTitle}</p>
                <p className="mt-1 text-[13px] text-muted">{ui.home.mapBannerDesc}</p>
              </div>
              <Link
                href="/map"
                className="sm:justify-self-end inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-2.5 text-sm font-medium transition-colors hover:border-accent/40 hover:text-accent dark:bg-zinc-900"
              >
                {ui.home.mapBannerCta} <IconArrowRight size={15} />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.2} className="mt-4">
            <div className="rounded-2xl border border-accent/25 bg-accent-soft p-6 sm:p-7">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
                <div className="flex items-start gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent text-white shadow-md">
                    <IconRoute size={20} />
                  </span>
                  <div>
                    <p className="text-[15px] font-semibold text-foreground">{ui.home.scenarioTitle}</p>
                    <p className="mt-1 max-w-2xl text-pretty text-[13px] leading-relaxed text-muted">
                      {ui.home.scenarioDesc}
                    </p>
                  </div>
                </div>
                <Link
                  href="/scenario"
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-md transition-transform hover:scale-[1.03]"
                >
                  {ui.home.scenarioCta} <IconArrowRight size={15} />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* COMMANDS BY CATEGORY */}
      <section className="pb-24 pt-4">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-accent">
              {ui.home.libraryEyebrow}
            </p>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              {ui.home.libraryTitle}
            </h2>
          </Reveal>

          <div className="mt-12 space-y-16">
            {ORDER.map((cat) => {
              const meta = ui.categories[cat];
              const cmds = commandsByCategory[cat];
              return (
                <div key={cat}>
                  <Reveal>
                    <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
                      <div>
                        <h3 className="text-[18px] font-semibold tracking-tight">{meta.label}</h3>
                        <p className="mt-0.5 text-[13px] text-muted">{meta.blurb}</p>
                      </div>
                      <span className="font-mono text-[11px] text-zinc-400">
                        {tpl(ui.home.commandsCount, { n: cmds.length })}
                      </span>
                    </div>
                  </Reveal>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {cmds.map((c, i) => (
                      <Reveal key={c.slug} delay={i * 0.05}>
                        <CommandCard command={c} />
                      </Reveal>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-line">
        <div className="relative overflow-hidden">
          <div className="bg-dots pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(70%_60%_at_50%_50%,black,transparent)]" />
          <div className="relative mx-auto max-w-3xl px-6 py-24 text-center">
            <Reveal>
              <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                {ui.home.ctaTitleStart} <span className="text-accent">{ui.home.ctaTitleAccent}</span>
                {ui.home.ctaTitleEnd}
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-pretty text-[15px] leading-relaxed text-muted">
                {ui.home.ctaSubtitle}
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/commands/git-init"
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3 text-sm font-semibold text-white shadow-md transition-transform hover:scale-[1.03]"
                >
                  <code className="font-mono text-[12.5px]">git init</code> {ui.home.ctaBegin}
                  <IconArrowRight size={15} />
                </Link>
                <Link
                  href="/map"
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-7 py-3 text-sm font-medium transition-colors hover:border-accent/40 hover:text-accent dark:bg-zinc-900"
                >
                  {ui.home.ctaFinal}
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}