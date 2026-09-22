import type { GitEngine, Line } from "../git";

export interface ExerciseGoal {
  id: string;
  label: string;
  hint: string;
  /** Async checker: returns true when this goal is complete */
  check: (engine: GitEngine) => Promise<boolean>;
}

export interface Exercise {
  id: string;
  slug: string;               // command slug it belongs to, e.g. "git-merge"
  title: string;
  difficulty: "easy" | "medium" | "hard";
  intro: string;              // shown before starting
  /** Seed the repo into the right starting state */
  setup: (engine: GitEngine) => Promise<Line[]>;
  goals: ExerciseGoal[];
  celebration: string;        // message on completion
}

export async function runSilent(engine: GitEngine, cmd: string): Promise<void> {
  const oldLen = engine.snapshotLines().length;
  await engine.run(cmd);
  // remove the lines that were just added to keep it silent
  const newLines = engine.snapshotLines();
  if (newLines.length > oldLen) {
    engine.clearTerminal();
    for (const l of newLines.slice(0, oldLen)) {
      engine.pushLine(l);
    }
  }
}