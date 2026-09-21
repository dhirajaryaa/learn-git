"use client";

import { useEffect, useMemo, useState } from "react";
import {
  IconPlayerPlayFilled,
  IconPlayerPauseFilled,
  IconPlayerSkipBackFilled,
  IconPlayerSkipForwardFilled,
  IconRotateClockwise2,
  IconTerminal2,
} from "@tabler/icons-react";
import type { PlayerStep, ScenarioAct } from "@/lib/types";
import { Visual } from "@/components/visuals/Visual";
import { useLearner } from "@/components/providers";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { tpl } from "@/i18n/types";

const STEP_MS = 9000;
const TICKS = 100;

const LEVEL_ORDER: Record<string, number> = { child: 0, junior: 1, developer: 2 };

function visible(steps: PlayerStep[], level: string) {
  const order = LEVEL_ORDER[level] ?? 0;
  return steps.filter((s) => !s.min || LEVEL_ORDER[s.min] <= order);
}

export function WorkflowPlayer({
  steps,
  acts,
}: {
  steps: PlayerStep[];
  acts?: ScenarioAct[];
}) {
  const { level } = useLearner();
  const { ui } = useI18n();
  const p = ui.player;
  const filtered = useMemo(() => visible(steps, level), [steps, level]);
  const n = filtered.length;

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  const [prevLevel, setPrevLevel] = useState(level);
  if (prevLevel !== level) {
    setPrevLevel(level);
    setIndex(0);
    setProgress(0);
    setPlaying(true);
  }

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(
      () => setProgress((p) => Math.min(p + 1, TICKS)),
      STEP_MS / TICKS
    );
    return () => clearInterval(id);
  }, [playing]);

  const currentAct = filtered[Math.min(index, n - 1)]?.act ?? 0;
  const jumpToAct = (actIdx: number) => {
    const target = filtered.findIndex((st) => (st.act ?? 0) === actIdx);
    if (target !== -1) {
      setIndex(target);
      setProgress(0);
      setPlaying(true);
    }
  };

  if (progress >= TICKS) {
    if (index >= n - 1) {
      setProgress(0);
      setPlaying(false);
    } else {
      setProgress(0);
      setIndex(index + 1);
    }
  }

  if (n === 0) return null;

  const step = filtered[Math.min(index, n - 1)];
  const pct = Math.round((progress / TICKS) * 100);

  const restartCurrent = () => {
    setProgress(0);
    setPlaying(true);
  };

  const goPrev = () => {
    if (index > 0) {
      setIndex(index - 1);
      setProgress(0);
      setPlaying(true);
    }
  };

  const goNext = () => {
    if (index < n - 1) {
      setIndex(index + 1);
      setProgress(0);
      setPlaying(true);
    }
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-sm dark:bg-zinc-900">
      {/* act rail (scenario) */}
      {acts && acts.length > 0 && (
        <div className="flex items-stretch gap-2 overflow-x-auto border-b border-line bg-zinc-50/70 px-4 py-3 dark:bg-zinc-900">
          {acts.map((act, ai) => {
            const active = currentAct === ai;
            const started = currentAct > ai;
            return (
              <button
                key={act.id}
                onClick={() => jumpToAct(ai)}
                aria-current={active ? "step" : undefined}
                className={`flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition-colors ${
                  active
                    ? "border-accent/40 bg-accent/10 text-accent"
                    : started
                      ? "border-line text-foreground hover:border-accent/30"
                      : "border-line text-muted opacity-70"
                }`}
              >
                <span className="font-mono text-[10px] font-bold opacity-80">{act.kicker}</span>
                {act.title}
              </button>
            );
          })}
        </div>
      )}

      {/* progress */}
      <div className="h-1 w-full bg-zinc-100 dark:bg-zinc-800">
        <div
          className="h-full bg-accent transition-[width] duration-150 ease-linear"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* toolbar */}
      <div className="flex items-center gap-1.5 border-b border-line px-4 py-3 sm:gap-2 sm:px-5">
        <button
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? p.pauseAria : p.playAria}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-white shadow-sm transition-transform hover:scale-105 active:scale-95"
        >
          {playing ? <IconPlayerPauseFilled size={15} /> : <IconPlayerPlayFilled size={15} />}
        </button>
        <button
          onClick={goPrev}
          disabled={index === 0}
          aria-label={p.prevAria}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line text-muted transition-colors hover:text-foreground disabled:opacity-40"
        >
          <IconPlayerSkipBackFilled size={13} />
        </button>
        <button
          onClick={goNext}
          disabled={index >= n - 1}
          aria-label={p.nextAria}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line text-muted transition-colors hover:text-foreground disabled:opacity-40"
        >
          <IconPlayerSkipForwardFilled size={13} />
        </button>
        <button
          onClick={restartCurrent}
          aria-label={p.replayAria}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line text-muted transition-colors hover:text-foreground"
        >
          <IconRotateClockwise2 size={15} />
        </button>

        <span className="ml-2 shrink-0 font-mono text-[11.5px] font-medium text-muted">
          {tpl(p.stepOf, { current: index + 1, total: n })}
        </span>

        {/* step dots */}
        <div className="ml-auto flex items-center gap-1.5 overflow-x-auto">
          {filtered.map((st, i) => (
            <button
              key={i}
              onClick={() => {
                setIndex(i);
                setProgress(0);
                setPlaying(true);
              }}
              aria-label={tpl(p.goToStep, { n: i + 1, title: st.title })}
              className={`h-2 shrink-0 rounded-full transition-all ${
                i === index ? "w-6 bg-accent" : "w-2 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600"
              }`}
            />
          ))}
        </div>
      </div>

      {/* content */}
      <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,300px)_1fr] lg:gap-9">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-accent">
            {tpl(ui.command.step, { n: index + 1 })}
          </p>
          <h3 className="mt-1.5 text-[19px] font-bold leading-tight tracking-tight text-foreground">
            {step.title}
          </h3>
          <p className="mt-3 text-pretty text-[14px] leading-relaxed text-muted">{step.body}</p>
          {step.cmd && (
            <div className="mt-5 flex items-center gap-2.5 overflow-x-auto rounded-xl bg-[#0c0c0d] px-4 py-3">
              <IconTerminal2 size={14} className="shrink-0 text-zinc-500" />
              <code className="whitespace-nowrap font-mono text-[12.5px] font-medium text-emerald-300">
                {step.cmd}
              </code>
            </div>
          )}
        </div>

        {step.visual ? (
            <div className="min-w-0 rounded-2xl border border-line bg-zinc-50/70 p-4 dark:bg-zinc-800/50 sm:p-6">
              <Visual visual={step.visual} />
            </div>
          ) : (
            <div className="grid min-w-0 place-items-center rounded-2xl border border-dashed border-line bg-zinc-50/50 p-8 text-center dark:bg-zinc-800/30">
              <p className="max-w-sm text-pretty text-[13px] leading-relaxed text-muted">
                {p.noVisual}
              </p>
            </div>
          )}
      </div>

      {!playing && index >= n - 1 && (
        <div className="flex items-center justify-center gap-3 border-t border-line bg-accent-soft px-5 py-3.5">
          <p className="text-[13px] font-medium text-foreground">{p.done}</p>
          <button
            onClick={() => {
              setIndex(0);
              setProgress(0);
              setPlaying(true);
            }}
            className="rounded-full bg-accent px-4 py-1.5 text-[12.5px] font-semibold text-white transition-transform hover:scale-105"
          >
            {p.replayAll}
          </button>
        </div>
      )}
    </div>
  );
}