"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { IconArrowLeft, IconBulb, IconTarget, IconTerminal2 } from "@tabler/icons-react";
import { PracticeTerminal } from "@/components/PracticePage";
import { CommandIcon } from "@/components/CommandIcon";
import { useI18n } from "@/components/i18n/LanguageProvider";

export function PracticeView({ cmdSlug }: { cmdSlug?: string }) {
  const { ui, commands, steps } = useI18n();
  const [resetKey, setResetKey] = useState(0);

  const topic = cmdSlug ? commands[cmdSlug] : undefined;

  const suggestions = useMemo(() => {
    if (!cmdSlug) return [];
    const seen = new Set<string>();
    const out: string[] = [];
    for (const s of steps[cmdSlug] ?? []) {
      if (s.cmd && !seen.has(s.cmd)) {
        seen.add(s.cmd);
        out.push(s.cmd);
      }
    }
    return out.slice(0, 6);
  }, [cmdSlug, steps]);

  const seed = cmdSlug === "git-init" ? "empty" : "starter";

  return (
    <div className="mx-auto max-w-5xl px-6 pb-24 pt-10">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted transition-colors hover:text-foreground"
      >
        <IconArrowLeft size={14} /> {ui.practice.back}
      </Link>

      <header className="mt-8 flex items-start gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent text-white shadow-md">
          <IconTerminal2 size={22} />
        </span>
        <div>
          <h1 className="font-mono text-2xl font-semibold tracking-tight sm:text-3xl">
            {ui.practice.title}
          </h1>
          <p className="mt-1.5 max-w-xl text-pretty text-[14px] leading-relaxed text-muted">
            {ui.practice.subtitle}
          </p>
        </div>
      </header>

      {topic ? (
        <div className="mt-8 rounded-2xl border border-accent/30 bg-accent-soft p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent text-white shadow-sm">
                <CommandIcon name={topic.icon} size={20} />
              </span>
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-accent">
                  <IconTarget size={11} /> {ui.practice.nowPracticing}
                </p>
                <h2 className="truncate font-mono text-[17px] font-bold">{topic.command}</h2>
              </div>
            </div>
            <Link
              href={`/commands/${cmdSlug}`}
              className="shrink-0 text-[12px] font-medium text-accent transition-opacity hover:opacity-80"
            >
              {ui.practice.reviewLesson} →
            </Link>
          </div>
          <p className="mt-2.5 text-pretty text-[13px] leading-relaxed text-foreground">
            {topic.tagline}
          </p>
          {suggestions.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-accent">
                <IconBulb size={12} /> {ui.practice.suggested}
              </span>
              {suggestions.map((s, i) => (
                <code
                  key={i}
                  className="rounded-md border border-accent/25 bg-white/60 px-2 py-0.5 font-mono text-[10.5px] text-zinc-700 dark:bg-black/20 dark:text-zinc-200"
                >
                  {s}
                </code>
              ))}
            </div>
          )}
        </div>
      ) : (
        <p className="mt-6 rounded-2xl border border-line bg-zinc-50/70 px-4 py-3 text-[12.5px] leading-relaxed text-muted dark:bg-zinc-900/60">
          {ui.practice.unlinkedHint}
        </p>
      )}

      <div className="mt-8">
        <PracticeTerminal
          key={resetKey}
          seed={seed}
          suggestions={suggestions}
          onReset={() => setResetKey((k) => k + 1)}
        />
      </div>

      <p className="mt-4 text-[12px] leading-relaxed text-zinc-400">
        {ui.practice.footnote}
      </p>
    </div>
  );
}