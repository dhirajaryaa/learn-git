"use client";

import Link from "next/link";
import {
  IconArrowLeft,
  IconArrowRight,
  IconArrowUpRight,
  IconCheck,
  IconCode,
  IconGauge,
} from "@tabler/icons-react";
import type { Command } from "@/lib/types";
import { CATEGORY_META } from "@/lib/types";
import { CommandIcon } from "@/components/CommandIcon";
import { CopyCmd } from "@/components/CopyCmd";
import { Visual } from "@/components/visuals/Visual";
import { WorkflowPlayer } from "@/components/WorkflowPlayer";
import { ShowAt } from "@/components/ShowAt";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { tpl } from "@/i18n/types";

export function CommandView({
  command,
  prevSlug,
  nextSlug,
}: {
  command: Command;
  prevSlug?: string;
  nextSlug?: string;
}) {
  const { ui, commands, steps } = useI18n();
  const local = commands[command.slug] ?? command;
  const stepList = steps[command.slug] ?? [];
  const meta = ui.categories[local.category];
  const metaIcon = CATEGORY_META[command.category].icon;

  const related = command.related
    .map((slug) => commands[slug] ?? null)
    .filter((c): c is Command => Boolean(c));
  const prev = prevSlug ? commands[prevSlug] : undefined;
  const next = nextSlug ? commands[nextSlug] : undefined;

  return (
    <div className="mx-auto max-w-6xl px-6 pb-24 pt-10">
      {/* back */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted transition-colors hover:text-foreground"
      >
        <IconArrowLeft size={14} /> {ui.command.backAll}
      </Link>

      {/* header */}
      <header className="mt-8 flex flex-col gap-8 border-b border-line pb-12 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-start gap-5">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-accent text-white shadow-md">
            <CommandIcon name={command.icon} size={26} />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-mono text-3xl font-semibold tracking-tight sm:text-4xl">
                {local.command}
              </h1>
              {local.level !== "beginner" && (
                <span className="rounded-full border border-line px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                  {ui.common.levels[local.level]}
                </span>
              )}
            </div>
            <p className="mt-2 max-w-xl text-pretty text-[15px] leading-relaxed text-muted">
              {local.tagline}
            </p>
          </div>
        </div>
        <div className="w-full max-w-sm shrink-0 space-y-3">
          <CopyCmd text={local.command} />
          <Link
            href="/map"
            className="flex items-center justify-center gap-2 rounded-xl border border-line px-4 py-3 text-[13px] font-medium text-muted transition-colors hover:border-accent/40 hover:text-accent"
          >
            <IconGauge size={15} /> {ui.command.mapCta}
          </Link>
        </div>
      </header>

      <div className="mt-12 grid gap-14 lg:grid-cols-[minmax(0,1fr)_260px]">
        {/* MAIN */}
        <div className="min-w-0 space-y-16">
          {/* what + visual */}
          <section>
            <SectionLabel>{ui.command.what}</SectionLabel>
            <p className="max-w-2xl text-pretty text-[17px] leading-[1.75] text-foreground">
              {local.what}
            </p>
            <div className="mt-8">
              <Visual visual={local.visual} />
            </div>
          </section>

          {/* guided walkthrough */}
          {stepList.length > 0 && (
            <section>
              <SectionLabel>{ui.command.watch}</SectionLabel>
              <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-muted">
                {ui.command.watchDesc}
              </p>
              <div className="mt-6">
                <WorkflowPlayer steps={stepList} />
              </div>
            </section>
          )}

          {/* under the hood */}
          <ShowAt at="junior">
            <section>
              <SectionLabel>{ui.command.hood}</SectionLabel>
              <div className="mt-5 space-y-4">
                {local.how.map((step, i) => (
                  <div key={i} className="rounded-2xl border border-line bg-white p-6 dark:bg-zinc-900">
                    <div className="flex items-start gap-3.5">
                      <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent/10 text-[12px] font-bold text-accent">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-[15px] font-semibold tracking-tight">{step.title}</h3>
                        <p className="mt-2 text-pretty text-[14px] leading-relaxed text-muted">
                          {step.body}
                        </p>
                        {step.code && (
                          <pre className="mt-4 overflow-x-auto rounded-xl bg-[#0c0c0d] px-4 py-3.5 font-mono text-[12px] leading-relaxed text-emerald-300">
                            {step.code}
                          </pre>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </ShowAt>

          {/* aliases */}
          <section>
            <SectionLabel>{ui.command.aliases}</SectionLabel>
            <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-muted">
              {tpl(ui.command.aliasIntro, { cmd: local.command })}
            </p>
            <div className="mt-5 rounded-xl border border-line bg-zinc-50/70 p-4 dark:bg-zinc-900/60">
              <code className="font-mono text-[12.5px] text-zinc-700 dark:text-zinc-300">
                git config --global alias.st{" "}
                <span className="text-zinc-400"># → {local.aliases[0]?.full ?? "git status"}</span>
              </code>
            </div>
            <div className="mt-5 overflow-hidden rounded-2xl border border-line">
              <div className="grid grid-cols-[150px_1fr_1.2fr] gap-0 bg-zinc-50 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:bg-zinc-800/60">
                <span>{ui.command.aliasAlias}</span>
                <span className="hidden md:block">{ui.command.aliasExpands}</span>
                <span>{ui.command.aliasWhy}</span>
              </div>
              {local.aliases.map((a, i) => (
                <div
                  key={i}
                  className="grid grid-cols-2 gap-x-4 border-t border-line px-5 py-3.5 md:grid-cols-[150px_1fr_1.2fr]"
                >
                  <code className="font-mono text-[12.5px] font-semibold text-accent">
                    {a.short}
                  </code>
                  <code className="hidden font-mono text-[12px] text-zinc-600 md:block dark:text-zinc-300">
                    {a.full}
                  </code>
                  <p className="col-span-2 mt-1 text-[12.5px] leading-relaxed text-muted md:col-span-1 md:mt-0">
                    {a.note}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* anatomy */}
          <section>
            <SectionLabel>{ui.command.anatomy}</SectionLabel>
            <ShowAt at="developer">
              <div className="mt-5 overflow-x-auto rounded-2xl border border-line bg-[#0c0c0d] p-6">
                <div className="flex w-max items-center gap-2 font-mono text-[13px] text-zinc-300">
                  <IconCode size={15} className="text-accent" />
                  <span className="text-emerald-300">{local.syntax}</span>
                </div>
              </div>
            </ShowAt>
            <ShowAt at="junior">
              <div className="mt-4 overflow-hidden rounded-2xl border border-line">
                {local.options.map((o, i) => (
                  <div
                    key={i}
                    className={`flex flex-col gap-1.5 bg-white px-5 py-3.5 sm:flex-row sm:gap-6 dark:bg-zinc-900 ${
                      i > 0 ? "border-t border-line" : ""
                    }`}
                  >
                    <code className="w-48 shrink-0 font-mono text-[12.5px] font-semibold text-zinc-800 dark:text-zinc-100">
                      {o.flag}
                    </code>
                    <p className="text-[13px] leading-relaxed text-muted">{o.desc}</p>
                  </div>
                ))}
              </div>
            </ShowAt>
          </section>

          {/* uses */}
          <section>
            <SectionLabel>{ui.command.uses}</SectionLabel>
            <div className="mt-5 space-y-3">
              {local.uses.map((u, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent/10">
                    <IconCheck size={11} className="text-accent" />
                  </span>
                  <p className="text-pretty text-[14px] leading-relaxed text-zinc-600 dark:text-zinc-300">{u}</p>
                </div>
              ))}
            </div>
            {local.proTip && (
              <ShowAt at="developer">
                <div className="mt-8 rounded-2xl border border-accent/25 bg-accent-soft p-6">
                  <p className="text-[12px] font-semibold uppercase tracking-wider text-accent">
                    {ui.command.proTip}
                  </p>
                  <p className="mt-2 text-pretty text-[14px] leading-relaxed text-foreground">
                    {local.proTip}
                  </p>
                </div>
              </ShowAt>
            )}
          </section>

          {/* related */}
          {related.length > 0 && (
            <section>
              <SectionLabel>{ui.command.deeper}</SectionLabel>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/commands/${r.slug}`}
                    className="group flex items-center justify-between rounded-2xl border border-line bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-sm dark:bg-zinc-900"
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 place-items-center rounded-lg bg-zinc-50 text-zinc-600 ring-1 ring-line transition-colors group-hover:bg-accent group-hover:text-white dark:bg-zinc-800 dark:text-zinc-300">
                        <CommandIcon name={r.icon} size={16} />
                      </span>
                      <div>
                        <code className="font-mono text-[13px] font-semibold">{r.command}</code>
                        <p className="text-[11.5px] text-muted">{r.tagline}</p>
                      </div>
                    </div>
                    <IconArrowUpRight size={15} className="text-zinc-300 transition-colors group-hover:text-accent" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* prev / next */}
          <nav className="grid gap-3 border-t border-line pt-8 sm:grid-cols-2">
            {prev ? (
              <Link
                href={`/commands/${prev.slug}`}
                className="group flex items-center gap-3 rounded-2xl border border-line bg-white p-5 transition-all hover:border-accent/30 hover:shadow-sm dark:bg-zinc-900"
              >
                <IconArrowLeft size={16} className="shrink-0 text-zinc-300 transition-colors group-hover:text-accent" />
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-wider text-zinc-400">{ui.command.prev}</p>
                  <code className="font-mono text-[13.5px] font-semibold">{prev.command}</code>
                </div>
              </Link>
            ) : (
              <div />
            )}
            {next && (
              <Link
                href={`/commands/${next.slug}`}
                className="group flex items-center justify-end gap-3 rounded-2xl border border-line bg-white p-5 text-right transition-all hover:border-accent/30 hover:shadow-sm dark:bg-zinc-900"
              >
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-wider text-zinc-400">{ui.command.next}</p>
                  <code className="font-mono text-[13.5px] font-semibold">{next.command}</code>
                </div>
                <IconArrowRight size={16} className="shrink-0 text-zinc-300 transition-colors group-hover:text-accent" />
              </Link>
            )}
          </nav>
        </div>

        {/* SIDEBAR */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-6">
            <div className="rounded-2xl border border-line bg-white p-5 dark:bg-zinc-900">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                {ui.command.facts}
              </p>
              <dl className="mt-4 space-y-4 text-[13px]">
                <div>
                  <dt className="text-zinc-400">{ui.command.category}</dt>
                  <dd className="mt-0.5 flex items-center gap-1.5 font-medium">
                    <CommandIcon name={metaIcon} size={13} className="text-accent" />
                    {meta.label}
                  </dd>
                </div>
                <div>
                  <dt className="text-zinc-400">{ui.command.difficulty}</dt>
                  <dd className="mt-0.5 font-medium capitalize">{ui.common.levels[local.level]}</dd>
                </div>
                <div>
                  <dt className="text-zinc-400">{ui.command.syntax}</dt>
                  <dd className="mt-0.5 overflow-x-auto font-mono text-[12px] text-zinc-700 dark:text-zinc-300">
                    {local.syntax}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl border border-line bg-white p-5 dark:bg-zinc-900">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                {ui.command.cheat}
              </p>
              <div className="mt-3 space-y-2">
                {local.aliases.slice(0, 4).map((a) => (
                  <div key={a.short} className="flex items-center justify-between gap-2">
                    <code className="font-mono text-[12px] font-semibold text-accent">{a.short}</code>
                    <code className="truncate font-mono text-[11.5px] text-zinc-500 dark:text-zinc-400">{a.full}</code>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-3 text-[17px] font-semibold tracking-tight">
      {children}
      <span className="h-px flex-1 bg-line" />
    </h2>
  );
}