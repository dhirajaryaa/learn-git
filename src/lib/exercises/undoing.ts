import type { Exercise } from "./types";
import { runSilent } from "./types";

export const undoingExercises: Exercise[] = [
  /* ──────── git-reset ──────── */
  {
    id: "reset-1",
    slug: "git-reset",
    title: "Undo a bad commit",
    difficulty: "medium",
    intro:
      "Oops — the last commit was wrong. Use git reset to go back one commit.",
    setup: async (engine) => {
      await engine.setWorkFile("src/app.js", "const app = () => 'BROKEN CODE';\nmodule.exports = app;\n");
      await runSilent(engine, "git add .");
      await runSilent(engine, 'git commit -m "MISTAKE: broken code"');
      return [
        { s: "❌ The last commit broke everything — undo it!", c: "accent" },
        { s: "  Type: git reset --hard HEAD~1", c: "dim" },
      ];
    },
    goals: [
      {
        id: "reset-undo",
        label: "Reset HEAD back one commit",
        hint: "Type: git reset --hard HEAD~1",
        check: async (engine) => {
          const lines = engine.snapshotLines();
          return lines.some((l) => l.s.includes("HEAD is now at") && l.c === "ok");
        },
      },
    ],
    celebration: "⏪ Reset rewound history — like the bad commit never existed!",
  },

  /* ──────── git-revert ──────── */
  {
    id: "revert-1",
    slug: "git-revert",
    title: "Safely undo a commit",
    difficulty: "medium",
    intro:
      "Unlike reset, revert creates a NEW commit that undoes a previous one — safe for shared branches.",
    setup: async (engine) => {
      await engine.setWorkFile("src/app.js", "const app = () => 'oops bug here';\nmodule.exports = app;\n");
      await runSilent(engine, "git add .");
      await runSilent(engine, 'git commit -m "bug: introduced a bug"');
      return [
        { s: "🔄 The last commit introduced a bug — revert it safely", c: "accent" },
        { s: "  Type: git revert HEAD", c: "dim" },
      ];
    },
    goals: [
      {
        id: "revert-do",
        label: "Revert the last commit",
        hint: "Type: git revert HEAD",
        check: async (engine) => {
          const lines = engine.snapshotLines();
          return lines.some((l) => l.s.includes("Revert") && l.c === "ok");
        },
      },
    ],
    celebration: '🔄 Reverted! A new commit that "undoes" the bad one — history stays clean!',
  },

  /* ──────── git-restore ──────── */
  {
    id: "restore-1",
    slug: "git-restore",
    title: "Undo a file change",
    difficulty: "easy",
    intro:
      "You accidentally messed up src/app.js. Restore it from the last commit.",
    setup: async (engine) => {
      await engine.setWorkFile("src/app.js", "GARBAGE GARBAGE GARBAGE\n");
      return [
        { s: "😱 src/app.js is ruined — restore it!", c: "accent" },
        { s: "  Type: git restore src/app.js", c: "dim" },
      ];
    },
    goals: [
      {
        id: "restore-file",
        label: "Restore src/app.js from HEAD",
        hint: "Type: git restore src/app.js",
        check: async (engine) => {
          const content = await engine.readWorkFile("src/app.js");
          return !content.includes("GARBAGE");
        },
      },
    ],
    celebration: "✅ Restored! git restore brings files back from the last commit.",
  },

  /* ──────── git-stash ──────── */
  {
    id: "stash-1",
    slug: "git-stash",
    title: "Stash and restore work",
    difficulty: "medium",
    intro:
      "You're mid-work and need to switch branches. Stash your changes, switch, then come back and pop.",
    setup: async (engine) => {
      await engine.setWorkFile("src/app.js", "const app = () => 'work in progress';\nmodule.exports = app;\n");
      return [
        { s: "🗃️ You have uncommitted work in src/app.js", c: "accent" },
        { s: "  Stash it: git stash push", c: "dim" },
      ];
    },
    goals: [
      {
        id: "stash-push",
        label: "Stash your uncommitted changes",
        hint: "Type: git stash push",
        check: async (engine) => {
          const lines = engine.snapshotLines();
          return lines.some((l) => l.s.includes("Saved working directory"));
        },
      },
      {
        id: "stash-pop",
        label: "Pop the stash to restore your work",
        hint: "Type: git stash pop",
        check: async (engine) => {
          const lines = engine.snapshotLines();
          return lines.some((l) => l.s.includes("Dropped the stash") || l.s.includes("Applied"));
        },
      },
    ],
    celebration: "🗃️ Stash is your quick-save — park changes without committing!",
  },

  /* ──────── git-cherry-pick ──────── */
  {
    id: "cherry-1",
    slug: "git-cherry-pick",
    title: "Cherry-pick a commit",
    difficulty: "medium",
    intro:
      "A useful commit lives on another branch. Cherry-pick it onto main without merging the whole branch.",
    setup: async (engine) => {
      await runSilent(engine, "git switch -c hotfix");
      await engine.setWorkFile("fix.js", "// critical fix\nexport const patch = true;\n");
      await runSilent(engine, "git add .");
      await runSilent(engine, 'git commit -m "hotfix: critical patch"');
      const lines = engine.snapshotLines();
      const commitLine = lines.find((l) => l.s.startsWith("[hotfix"));
      const hash = commitLine?.s.match(/\[hotfix ([a-f0-9]+)\]/)?.[1] ?? "HEAD";

      await runSilent(engine, "git switch main");
      return [
        { s: "🍒 hotfix branch has a critical commit", c: "accent" },
        { s: `  Cherry-pick it: git cherry-pick ${hash}`, c: "dim" },
        { s: "  Or use: git cherry-pick hotfix (branch tip)", c: "dim" },
      ];
    },
    goals: [
      {
        id: "cherry-do",
        label: "Cherry-pick the hotfix commit onto main",
        hint: "Type: git cherry-pick hotfix",
        check: async (engine) => {
          const lines = engine.snapshotLines();
          return lines.some((l) => l.s.includes("hotfix:") && l.c === "ok");
        },
      },
    ],
    celebration: "🍒 Cherry-picked! You grabbed just the commit you needed — surgical precision!",
  },
];