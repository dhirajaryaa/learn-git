"use client";

import Link from "next/link";
import { IconArrowLeft, IconListCheck, IconRuler2, IconFocusCentered } from "@tabler/icons-react";
import { WorkflowPlayer } from "@/components/WorkflowPlayer";
import { useI18n } from "@/components/i18n/LanguageProvider";

export function ScenarioView() {
  const { ui, scenario } = useI18n();
  const sc = ui.scenario;

  const countByAct = (act: number) =>
    scenario.steps.filter((s) => (s.act ?? 0) === act).length;

  return (
    <div className="mx-auto max-w-5xl px-6 pb-24 pt-10">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted transition-colors hover:text-foreground"
      >
        <IconArrowLeft size={14} /> {sc.backAll}
      </Link>

      {/* header */}
      <header className="mt-8 border-b border-line pb-10">
        <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3.5 py-1.5 text-[12px] font-semibold text-accent">
          <IconListCheck size={13} /> {sc.badge}
        </span>
        <h1 className="mt-5 max-w-2xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          {sc.title}
        </h1>
        <p className="mt-4 max-w-2xl text-pretty text-[15px] leading-relaxed text-muted">
          {sc.subtitle}
        </p>
      </header>

      {/* why + rule */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white p-6 dark:bg-zinc-900">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent/10 text-accent">
            <IconFocusCentered size={17} />
          </span>
          <h2 className="mt-3 text-[15px] font-semibold tracking-tight">{sc.whyTitle}</h2>
          <p className="mt-2 text-pretty text-[13.5px] leading-relaxed text-muted">{sc.whyBody}</p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-6 dark:bg-zinc-900">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent/10 text-accent">
            <IconRuler2 size={17} />
          </span>
          <h2 className="mt-3 text-[15px] font-semibold tracking-tight">{sc.ruleTitle}</h2>
          <p className="mt-2 text-pretty text-[13.5px] leading-relaxed text-muted">{sc.ruleBody}</p>
        </div>
      </div>

      {/* acts */}
      <section className="mt-12">
        <h2 className="flex items-center gap-3 text-[15px] font-semibold tracking-tight">
          {sc.actsLabel}
          <span className="h-px flex-1 bg-line" />
        </h2>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {scenario.acts.map((act, i) => (
            <div key={act.id} className="rounded-2xl border border-line bg-white p-5 dark:bg-zinc-900">
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-accent">
                {act.kicker}
              </p>
              <h3 className="mt-1.5 text-[15px] font-semibold tracking-tight">{act.title}</h3>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">{act.sub}</p>
              <p className="mt-3 font-mono text-[11px] text-zinc-400">
                {countByAct(i)} {ui.common.commands}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* player */}
      <div className="mt-10">
        <WorkflowPlayer steps={scenario.steps} acts={scenario.acts} />
      </div>

      <p className="mt-8 text-center text-[13px] text-muted">
        <Link href="/commands/git-commit" className="font-medium text-accent hover:underline">
          git commit
        </Link>{" "}
        · <Link href="/commands/git-branch" className="font-medium text-accent hover:underline">git branch</Link>{" "}
        · <Link href="/commands/git-log" className="font-medium text-accent hover:underline">git log</Link>
      </p>
    </div>
  );
}