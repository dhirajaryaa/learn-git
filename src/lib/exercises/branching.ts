import type { Exercise } from "./types";
import { runSilent } from "./types";

export const branchingExercises: Exercise[] = [
  /* ──────── git-branch ──────── */
  {
    id: "branch-1",
    slug: "git-branch",
    title: "Create and switch branches",
    difficulty: "easy",
    intro:
      "Create a new branch called 'feature' and switch to it. Then make a commit on that branch.",
    setup: async () => {
      return [
        { s: "🌿 You're on main — create a 'feature' branch", c: "accent" },
        { s: "  Try: git branch feature, then git switch feature", c: "dim" },
      ];
    },
    goals: [
      {
        id: "branch-create",
        label: "Create a branch named 'feature'",
        hint: "Type: git branch feature",
        check: async (engine) => {
          const lines = engine.snapshotLines();
          return lines.some((l) => l.s.includes("Created branch feature"));
        },
      },
      {
        id: "branch-switch",
        label: "Switch to the 'feature' branch",
        hint: "Type: git switch feature",
        check: async (engine) => {
          const lines = engine.snapshotLines();
          return lines.some((l) => l.s.includes("Switched to branch 'feature'"));
        },
      },
    ],
    celebration: "🌿 Branching is Git's superpower — parallel work without fear!",
  },

  /* ──────── git-checkout ──────── */
  {
    id: "checkout-1",
    slug: "git-checkout",
    title: "Move HEAD around",
    difficulty: "medium",
    intro: "Use checkout to jump back in history (detach HEAD), then jump back to main.",
    setup: async () => {
      return [
        { s: "🕒 Let's time travel!", c: "accent" },
        { s: "  Try: git checkout HEAD~1, then git checkout main", c: "dim" },
      ];
    },
    goals: [
      {
        id: "checkout-detach",
        label: "Checkout the previous commit (HEAD~1)",
        hint: "Type: git checkout HEAD~1",
        check: async (engine) => {
          const lines = engine.snapshotLines();
          return lines.some((l) => l.s.includes("Switched to branch 'HEAD~1'"));
        },
      },
      {
        id: "checkout-main",
        label: "Switch back to main",
        hint: "Type: git checkout main",
        check: async (engine) => {
          const lines = engine.snapshotLines();
          return lines.some((l) => l.s.includes("Switched to branch 'main'"));
        },
      },
    ],
    celebration: "🕒 You jumped backwards in time and back to the present!",
  },

  /* ──────── git-switch ──────── */
  {
    id: "switch-1",
    slug: "git-switch",
    title: "Change branches easily",
    difficulty: "easy",
    intro: "Use switch -c to create and switch to a branch in one command.",
    setup: async () => {
      return [
        { s: "🔀 A faster way to branch", c: "accent" },
        { s: "  Try: git switch -c new-feature", c: "dim" },
      ];
    },
    goals: [
      {
        id: "switch-c",
        label: "Create and switch to 'new-feature'",
        hint: "Type: git switch -c new-feature",
        check: async (engine) => {
          const lines = engine.snapshotLines();
          return lines.some((l) => l.s.includes("Switched to a new branch 'new-feature'"));
        },
      },
    ],
    celebration: "🔀 git switch -c is the modern, safe way to branch!",
  },

  /* ──────── git-merge ──────── */
  {
    id: "merge-conflict",
    slug: "git-merge",
    title: "Resolve a real merge conflict",
    difficulty: "hard",
    intro:
      "Two branches edited the same file differently. Merge them together, resolve the conflict markers (<<<<<<< / ======= / >>>>>>>), stage the fix, and finish the merge.",
    setup: async (engine) => {
      // create divergent branches
      await engine.setWorkFile(
        "src/app.js",
        "const app = () => 'hello from main';\n\nmodule.exports = app;\n"
      );
      await runSilent(engine, "git add .");
      await runSilent(engine, 'git commit -m "chore: main changes app.js"');

      await runSilent(engine, "git switch -c conflict-branch");
      await engine.setWorkFile(
        "src/app.js",
        "const app = () => 'hello from conflict-branch';\n\nmodule.exports = app;\n"
      );
      await runSilent(engine, "git add .");
      await runSilent(engine, 'git commit -m "feat: branch changes app.js"');

      await runSilent(engine, "git switch main");
      await engine.setWorkFile(
        "src/app.js",
        "const app = () => 'hello from main v2';\n\nmodule.exports = app;\n"
      );
      await runSilent(engine, "git add .");
      await runSilent(engine, 'git commit -m "fix: main updates app.js again"');

      return [
        { s: "⚡ Two branches changed the same line in src/app.js", c: "accent" },
        { s: "  Type: git merge conflict-branch", c: "dim" },
        { s: "  Then click src/app.js in the editor, remove the markers, save, git add, and git merge --continue", c: "dim" },
      ];
    },
    goals: [
      {
        id: "merge-start",
        label: "Start the merge (git merge conflict-branch)",
        hint: "Type: git merge conflict-branch",
        check: async (engine) => {
          return engine.conflictPaths.size > 0 ||
            engine.snapshotLines().some((l) => l.s.includes("CONFLICT"));
        },
      },
      {
        id: "merge-edit",
        label: "Edit src/app.js — remove <<<<<<< / ======= / >>>>>>> markers",
        hint: "Click src/app.js on the right, remove conflict markers, save",
        check: async (engine) => {
          const content = await engine.readWorkFile("src/app.js");
          return !content.includes("<<<<<<<") && !content.includes("=======") && !content.includes(">>>>>>>");
        },
      },
      {
        id: "merge-stage",
        label: "Stage the resolved file",
        hint: "Type: git add src/app.js",
        check: async (engine) => {
          return engine.conflictPaths.size === 0;
        },
      },
      {
        id: "merge-finish",
        label: "Finish the merge",
        hint: 'Type: git merge --continue or git commit -m "merge done"',
        check: async (engine) => {
          const lines = engine.snapshotLines();
          return lines.some((l) => l.s.includes("Merge made") || (l.s.includes("Merge") && l.c === "ok"));
        },
      },
    ],
    celebration: "🏆 You resolved a real merge conflict! This is the skill that separates beginners from pros.",
  },

  /* ──────── git-rebase ──────── */
  {
    id: "rebase-1",
    slug: "git-rebase",
    title: "Rebase a feature branch",
    difficulty: "medium",
    intro:
      "Your feature branch is behind main. Rebase it onto main to get a clean, linear history.",
    setup: async (engine) => {
      await runSilent(engine, "git switch -c feature-x");
      await engine.setWorkFile("feature.js", "export const feature = true;\n");
      await runSilent(engine, "git add .");
      await runSilent(engine, 'git commit -m "feat: add feature flag"');

      await runSilent(engine, "git switch main");
      await engine.setWorkFile("README.md", "# My app\n\nA tiny project with a hot-fix.\n");
      await runSilent(engine, "git add .");
      await runSilent(engine, 'git commit -m "fix: update readme"');

      await runSilent(engine, "git switch feature-x");

      return [
        { s: "📏 feature-x is behind main by one commit", c: "accent" },
        { s: "  Rebase onto main: git rebase main", c: "dim" },
      ];
    },
    goals: [
      {
        id: "rebase-do",
        label: "Rebase feature-x onto main",
        hint: "Type: git rebase main",
        check: async (engine) => {
          const lines = engine.snapshotLines();
          return lines.some((l) => l.s.includes("Successfully rebased"));
        },
      },
    ],
    celebration: "📏 Clean linear history — rebase is the pro way to stay up to date!",
  },
];