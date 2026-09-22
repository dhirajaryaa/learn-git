"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconCircle,
  IconCircleCheck,
  IconFlame,
  IconInfoCircle,
  IconPlayerPlay,
  IconRotate,
  IconTargetArrow,
  IconTrophy,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import type { Exercise } from "@/lib/exercises";
import type { GitEngine } from "@/lib/git";
import { getCompletedExercises, markExerciseCompleted } from "@/lib/progress";

/* ───── types ───── */
interface GoalState {
  id: string;
  done: boolean;
}

const DIFFICULTY_CLS: Record<Exercise["difficulty"], string> = {
  easy: "border-emerald-400/40 bg-emerald-400/10 text-emerald-400",
  medium: "border-amber-400/40 bg-amber-400/10 text-amber-400",
  hard: "border-rose-400/40 bg-rose-400/10 text-rose-400",
};

const DIFFICULTY_LABEL: Record<Exercise["difficulty"], string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

/* ───── main component ───── */
export function ExercisePanel({
  exercises,
  engine,
  onSelect,
  rev,
}: {
  exercises: Exercise[];
  engine: GitEngine | null;
  onSelect: (exercise: Exercise) => void;
  /** terminal revision counter — triggers re-checks */
  rev: number;
}) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [goalStates, setGoalStates] = useState<GoalState[]>([]);
  const [allDone, setAllDone] = useState(false);
  const [setupDone, setSetupDone] = useState(false);
  const [hintOpen, setHintOpen] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const checkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevActiveIdx = useRef<number | null>(null);

  useEffect(() => {
    getCompletedExercises().then(setCompletedIds);
  }, [activeIdx]);

  const active = activeIdx !== null ? exercises[activeIdx] : null;

  /* start an exercise */
  const startExercise = useCallback(
    async (idx: number) => {
      const ex = exercises[idx];
      if (!engine || !engine.booted) return;

      setActiveIdx(idx);
      setAllDone(false);
      setSetupDone(false);
      setHintOpen(null);
      setGoalStates(ex.goals.map((g) => ({ id: g.id, done: false })));
      prevActiveIdx.current = idx;

      // run setup
      engine.clearTerminal();
      const setupLines = await ex.setup(engine);
      for (const l of setupLines) engine.pushLine(l);
      setSetupDone(true);
      onSelect(ex);
    },
    [engine, exercises, onSelect]
  );

  /* check goals whenever terminal rev changes */
  useEffect(() => {
    if (!active || !engine || !setupDone) return;
    if (allDone) return;

    if (checkTimer.current) clearTimeout(checkTimer.current);
    checkTimer.current = setTimeout(async () => {
      const next: GoalState[] = [];
      let allPassed = true;
      for (const g of active.goals) {
        const prev = goalStates.find((s) => s.id === g.id);
        if (prev?.done) {
          next.push({ id: g.id, done: true });
          continue;
        }
        try {
          const ok = await g.check(engine);
          next.push({ id: g.id, done: ok });
          if (!ok) allPassed = false;
        } catch {
          next.push({ id: g.id, done: false });
          allPassed = false;
        }
      }
      setGoalStates(next);
      if (allPassed && next.length > 0) {
        setAllDone(true);
        void markExerciseCompleted(active.id);
      }
    }, 300);

    return () => {
      if (checkTimer.current) clearTimeout(checkTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rev, setupDone, active]);

  const doneCount = goalStates.filter((g) => g.done).length;
  const totalGoals = active?.goals.length ?? 0;

  if (exercises.length === 0) return null;

  return (
    <div className="overflow-hidden">
      {/* header */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="flex w-full items-center justify-between gap-3 border-b border-white/10 px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent/20 text-accent">
            <IconTargetArrow size={16} />
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-zinc-200">
              Practice Exercises
            </p>
            <p className="text-[10.5px] text-zinc-500">
              {exercises.length} challenge{exercises.length !== 1 ? "s" : ""} available
            </p>
          </div>
        </div>
        <span className="grid h-6 w-6 place-items-center rounded-md text-zinc-500 transition-colors hover:bg-white/10 hover:text-white">
          {collapsed ? <IconChevronDown size={14} /> : <IconChevronUp size={14} />}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {/* exercise list (when none active) */}
            {activeIdx === null && (
              <div className="flex flex-col gap-2 p-3">
                {exercises.map((ex, i) => {
                  const isDone = completedIds.includes(ex.id);
                  return (
                  <button
                    key={ex.id}
                    onClick={() => void startExercise(i)}
                    disabled={!engine?.booted}
                    className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-left transition-all hover:border-accent/30 hover:bg-accent/5 disabled:opacity-40"
                  >
                    <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[12px] font-bold transition-colors ${isDone ? 'bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500/30' : 'bg-white/10 text-zinc-300 group-hover:bg-accent/20 group-hover:text-accent'}`}>
                      {isDone ? <IconCheck size={16} /> : i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-[13px] font-semibold group-hover:text-white ${isDone ? 'text-emerald-400/90' : 'text-zinc-200'}`}>
                        {ex.title}
                      </p>
                      <p className="mt-0.5 line-clamp-1 text-[11px] text-zinc-500">
                        {ex.intro}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${DIFFICULTY_CLS[ex.difficulty]}`}
                    >
                      {DIFFICULTY_LABEL[ex.difficulty]}
                    </span>
                    <IconPlayerPlay
                      size={14}
                      className="shrink-0 text-zinc-500 transition-colors group-hover:text-accent"
                    />
                  </button>
                  );
                })}
              </div>
            )}

            {/* active exercise */}
            {active && (
              <div className="p-2.5">
                {allDone ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-emerald-500/20 text-emerald-400">
                        <IconCircleCheck size={16} />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[12.5px] font-bold text-emerald-300">
                          {active.title} — Complete!
                        </p>
                        <p className="truncate text-[11px] text-emerald-400/80">
                          {active.celebration}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {activeIdx !== null && activeIdx < exercises.length - 1 ? (
                        <button
                          onClick={() => void startExercise(activeIdx + 1)}
                          className="flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-[11px] font-semibold text-white transition-opacity hover:opacity-90"
                        >
                          Next <IconPlayerPlay size={11} />
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setActiveIdx(null);
                            setAllDone(false);
                            setGoalStates([]);
                            setSetupDone(false);
                          }}
                          className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-medium text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                        >
                          Done
                        </button>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <>
                    {/* title + back */}
                    <div className="flex items-center justify-between gap-2 pb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-accent/20 text-accent">
                          <IconFlame size={14} />
                        </span>
                        <p className="truncate text-[13px] font-bold text-zinc-200">
                          {active.title}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${DIFFICULTY_CLS[active.difficulty]}`}
                        >
                          {DIFFICULTY_LABEL[active.difficulty]}
                        </span>
                        <button
                          onClick={() => {
                            setActiveIdx(null);
                            setAllDone(false);
                            setGoalStates([]);
                            setSetupDone(false);
                          }}
                          className="grid h-6 w-6 place-items-center rounded-md text-zinc-500 hover:bg-white/10 hover:text-white"
                          title="Back to exercises"
                        >
                          <IconRotate size={12} />
                        </button>
                      </div>
                    </div>

                    {/* intro */}
                    <div className="mb-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5">
                      <p className="flex items-start gap-2 text-[11.5px] leading-relaxed text-zinc-400">
                        <IconInfoCircle size={14} className="mt-0.5 shrink-0 text-accent" />
                        {active.intro}
                      </p>
                    </div>

                    {/* progress bar */}
                    <div className="mb-3 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                        <motion.div
                          className="h-full rounded-full bg-accent"
                          initial={{ width: 0 }}
                          animate={{ width: totalGoals > 0 ? `${(doneCount / totalGoals) * 100}%` : "0%" }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                        />
                      </div>
                      <span className="text-[10px] font-semibold text-zinc-500">
                        {doneCount}/{totalGoals}
                      </span>
                    </div>

                    {/* goals */}
                    <div className="flex flex-col gap-1.5">
                      {active.goals.map((goal, gi) => {
                        const state = goalStates.find((g) => g.id === goal.id);
                        const done = state?.done ?? false;
                        const isHintOpen = hintOpen === goal.id;

                        return (
                          <div key={goal.id}>
                            <div
                              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 transition-colors ${
                                done
                                  ? "bg-emerald-500/10 border border-emerald-500/20"
                                  : "bg-white/5 border border-white/10"
                              }`}
                            >
                              <span className="shrink-0">
                                {done ? (
                                  <IconCircleCheck size={16} className="text-emerald-400" />
                                ) : (
                                  <IconCircle size={16} className="text-zinc-600" />
                                )}
                              </span>
                              <p
                                className={`flex-1 text-[11.5px] font-medium ${
                                  done ? "text-emerald-300 line-through" : "text-zinc-300"
                                }`}
                              >
                                <span className="mr-1.5 text-[10px] font-bold text-zinc-600">
                                  {gi + 1}.
                                </span>
                                {goal.label}
                              </p>
                              {!done && (
                                <button
                                  onClick={() => setHintOpen(isHintOpen ? null : goal.id)}
                                  className={`grid h-5 w-5 place-items-center rounded-md text-[10px] transition-colors ${
                                    isHintOpen
                                      ? "bg-accent/20 text-accent"
                                      : "text-zinc-600 hover:bg-white/10 hover:text-zinc-400"
                                  }`}
                                  title="Show hint"
                                >
                                  ?
                                </button>
                              )}
                            </div>
                            <AnimatePresence>
                              {isHintOpen && !done && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.15 }}
                                  className="overflow-hidden"
                                >
                                  <div className="mx-3 mt-1 mb-1 rounded-md border border-accent/20 bg-accent/5 px-3 py-2">
                                    <p className="font-mono text-[10.5px] text-accent">
                                      💡 {goal.hint}
                                    </p>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
