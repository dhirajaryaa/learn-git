"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState, useEffect } from "react";
import { IconArrowLeft, IconBulb, IconTarget, IconTerminal2, IconCopy, IconCheck, IconTrash } from "@tabler/icons-react";
import { PracticeTerminal } from "@/components/PracticePage";
import { ExercisePanel } from "@/components/ExercisePanel";
import { CommandIcon } from "@/components/CommandIcon";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { getExercisesForCommand, type Exercise } from "@/lib/exercises";
import type { GitEngine } from "@/lib/git";
import { clearAllProgress } from "@/lib/progress";
import { allCommands } from "@/data";

const SHOW_AI_PROMPT = new Set([
  "git-add", "git-commit", "git-branch", "git-checkout", "git-switch",
  "git-merge", "git-rebase", "git-reset", "git-restore", "git-revert",
  "git-stash", "git-cherry-pick", "git-push", "git-pull", "git-fetch"
]);

export function PracticeView({ cmdSlug }: { cmdSlug?: string }) {
  const { ui, commands, steps } = useI18n();
  const router = useRouter();
  const [resetKey, setResetKey] = useState(0);
  const [rev, setRev] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [engine, setEngine] = useState<GitEngine | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);

  const topic = cmdSlug ? commands[cmdSlug] : undefined;

  const exercises = useMemo(
    () => (cmdSlug ? getExercisesForCommand(cmdSlug) : []),
    [cmdSlug]
  );

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

  const handleEngineReady = useCallback((e: GitEngine) => {
    setEngine(e);
  }, []);

  const handleRevChange = useCallback(() => {
    setRev((r) => r + 1);
  }, []);

  const handleExerciseSelect = useCallback((ex: Exercise | null) => {
    setActiveExercise(ex);
    setRev((r) => r + 1);
    setRefreshTrigger((r) => r + 1);
  }, []);

  const handleFullReset = async () => {
    if (window.confirm("Are you sure you want to completely reset all your progress and the practice terminal?")) {
      await clearAllProgress();
      setResetKey((k) => k + 1);
      setActiveExercise(null);
    }
  };

  const cmdIndex = cmdSlug ? allCommands.findIndex(c => c.slug === cmdSlug) : -1;
  const learnedCommands = cmdIndex >= 0
    ? allCommands.slice(0, cmdIndex + 1).map(c => c.command).join(", ")
    : "basic git commands";

  const aiPrompt = activeExercise
    ? `I'm practicing Git using a browser-based sandbox. I just completed an exercise on: ${activeExercise.title} (${cmdSlug}).

Please generate a NEW, slightly harder practice scenario for me on the same topic.
Include:
1. The exact setup commands I need to run to create the scenario (e.g. creating branches, making conflicting edits).
2. The specific goals I need to achieve.
3. Do NOT give me the exact answer commands to solve the goal! Let me figure it out.

IMPORTANT: I am following a curriculum. So far, I have ONLY learned the following commands:
${learnedCommands}

Do NOT require me to use any Git commands outside of this list to solve the scenario.`
    : `I'm practicing Git using a browser-based sandbox. I'm focusing on the command: ${cmdSlug || "general git commands"}.

Please generate a realistic practice scenario for me.
Include:
1. The setup commands I need to run first to configure the scenario.
2. The goals I need to achieve.
3. Don't give me the exact answer commands to solve the goal — let me figure it out!

IMPORTANT: I am following a curriculum. So far, I have ONLY learned the following commands:
${learnedCommands}

Do NOT require me to use any Git commands outside of this list to solve the scenario.`;

  return (
    <div className="mx-auto max-w-5xl px-6 pb-24 pt-10">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted transition-colors hover:text-foreground"
      >
        <IconArrowLeft size={14} /> {ui.practice.back}
      </button>

      <header className="mt-8 flex items-start gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent text-white shadow-md">
          <IconTerminal2 size={22} />
        </span>
        <div className="flex-1 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="font-mono text-2xl font-semibold tracking-tight sm:text-3xl">
              {ui.practice.title}
            </h1>
            <p className="mt-1.5 max-w-xl text-pretty text-[14px] leading-relaxed text-muted">
              {ui.practice.subtitle}
            </p>
          </div>
          <button
            onClick={handleFullReset}
            className="shrink-0 flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-[11px] font-semibold text-red-400 hover:bg-red-500/20 transition-colors"
          >
            <IconTrash size={14} /> Reset Progress
          </button>
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
            <button
              onClick={() => router.back()}
              className="shrink-0 text-[12px] font-medium text-accent transition-opacity hover:opacity-80"
            >
              {ui.practice.reviewLesson} →
            </button>
          </div>
          <p className="mt-2.5 text-pretty text-[13px] leading-relaxed text-foreground">
            {topic.tagline}
          </p>
        </div>
      ) : (
        <p className="mt-6 rounded-2xl border border-line bg-zinc-50/70 px-4 py-3 text-[12.5px] leading-relaxed text-muted dark:bg-zinc-900/60">
          {ui.practice.unlinkedHint}
        </p>
      )}

      <div className="mt-6">
        <PracticeTerminal
          key={resetKey}
          seed={seed}
          suggestions={suggestions}
          onReset={() => setResetKey((k) => k + 1)}
          onEngineReady={handleEngineReady}
          onRevChange={handleRevChange}
          refreshTrigger={refreshTrigger}
        >
          {exercises.length > 0 && (
            <div className="border-t border-white/10 bg-black/40">
              <ExercisePanel
                key={resetKey}
                exercises={exercises}
                engine={engine}
                onSelect={handleExerciseSelect}
                rev={rev}
              />
            </div>
          )}
        </PracticeTerminal>
      </div>

      {(!cmdSlug || SHOW_AI_PROMPT.has(cmdSlug)) && (
        <div className="mt-8 rounded-2xl border border-line bg-zinc-50 p-5 dark:bg-zinc-900/60">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[13px] font-semibold text-foreground">
              Want more practice scenarios?
            </p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(aiPrompt);
                setCopiedPrompt(true);
                setTimeout(() => setCopiedPrompt(false), 2000);
              }}
              className="flex items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 py-1 text-[11px] font-medium text-muted shadow-sm transition-colors hover:text-foreground dark:bg-zinc-800"
            >
              {copiedPrompt ? <IconCheck size={14} className="text-emerald-500" /> : <IconCopy size={14} />}
              {copiedPrompt ? "Copied!" : "Copy AI Prompt"}
            </button>
          </div>
          <p className="text-[12px] leading-relaxed text-muted mb-3">
            Paste this prompt into ChatGPT, Claude, or any AI to generate infinite custom challenges that you can solve right here in this terminal:
          </p>
          <div className="rounded-xl bg-white p-3 font-mono text-[11px] text-zinc-500 border border-line dark:bg-black/40 dark:text-zinc-400 whitespace-pre-wrap">
            {aiPrompt}
          </div>
        </div>
      )}

      <p className="mt-6 text-[12px] leading-relaxed text-zinc-400">
        {ui.practice.footnote}
      </p>
    </div>
  );
}