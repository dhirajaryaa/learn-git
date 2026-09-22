import type { Exercise } from "./types";
import { runSilent } from "./types";

export const snapshottingExercises: Exercise[] = [
  /* ──────── git-status ──────── */
  {
    id: "status-1",
    slug: "git-status",
    title: "Check what changed",
    difficulty: "easy",
    intro:
      "You just edited a file and created a new one. Use git status to see the working tree, then stage both files.",
    setup: async (engine) => {
      const out = [];
      await engine.setWorkFile("README.md", "# My app\n\nUpdated description.\n");
      await engine.setWorkFile("notes.txt", "TODO: add tests\n");
      out.push({ s: "📂 README.md was modified, notes.txt is new", c: "accent" as const });
      out.push({ s: '  Try: git status, then git add .', c: "dim" as const });
      return out;
    },
    goals: [
      {
        id: "status-run",
        label: "Run git status to see what changed",
        hint: "Type: git status",
        check: async (engine) => {
          const lines = engine.snapshotLines();
          return lines.some((l) => l.s.includes("Changes not staged") || l.s.includes("Untracked"));
        },
      },
      {
        id: "status-stage",
        label: "Stage all changes",
        hint: "Type: git add .",
        check: async (engine) => {
          const states = await engine.fileStates();
          return states.filter((f) => f.state === "staged").length >= 2;
        },
      },
    ],
    celebration: "🎉 You spotted the changes and staged them — git status is your eyes!",
  },

  /* ──────── git-add ──────── */
  {
    id: "add-1",
    slug: "git-add",
    title: "Stage selectively",
    difficulty: "easy",
    intro:
      "Three files have been changed but only two should go into the next commit. Stage just README.md and src/app.js, not notes.txt.",
    setup: async (engine) => {
      await engine.setWorkFile("README.md", "# My app\n\nNew features added.\n");
      await engine.setWorkFile("src/app.js", "const app = () => 'v2';\nmodule.exports = app;\n");
      await engine.setWorkFile("notes.txt", "personal scratch — do NOT commit\n");
      return [{ s: "📂 3 files changed — stage only README.md and src/app.js", c: "accent" }];
    },
    goals: [
      {
        id: "add-selective",
        label: "Stage README.md and src/app.js (but not notes.txt)",
        hint: "Type: git add README.md && git add src/app.js",
        check: async (engine) => {
          const states = await engine.fileStates();
          const staged = new Set(states.filter((f) => f.state === "staged").map((f) => f.path));
          const notes = states.find((f) => f.path === "notes.txt");
          return staged.has("README.md") && staged.has("src/app.js") && notes?.state !== "staged";
        },
      },
    ],
    celebration: "🎯 Selective staging — you control exactly what goes into each commit!",
  },

  /* ──────── git-commit ──────── */
  {
    id: "commit-1",
    slug: "git-commit",
    title: "Make your first commit",
    difficulty: "easy",
    intro:
      "Files are already staged. Write a commit message following the conventional format: type: description.",
    setup: async (engine) => {
      await engine.setWorkFile("src/app.js", "const app = () => 'updated';\nmodule.exports = app;\n");
      await runSilent(engine, "git add .");
      return [
        { s: "✅ Files are staged and waiting", c: "accent" },
        { s: '  Write a commit: git commit -m "feat: your message"', c: "dim" },
      ];
    },
    goals: [
      {
        id: "commit-make",
        label: "Create a commit with a message",
        hint: 'Type: git commit -m "feat: add app logic"',
        check: async (engine) => {
          const lines = engine.snapshotLines();
          return lines.some((l) => l.s.includes("[main") && l.c === "ok");
        },
      },
    ],
    celebration: "📸 Committed! That snapshot is now permanent history.",
  },

  /* ──────── git-clean ──────── */
  {
    id: "clean-1",
    slug: "git-clean",
    title: "Remove untracked files",
    difficulty: "easy",
    intro:
      "Temporary files cluttered your repo. Use git clean to preview and remove them.",
    setup: async (engine) => {
      await engine.setWorkFile("temp.log", "debug log output\n");
      await engine.setWorkFile("scratch.txt", "random scratch\n");
      return [
        { s: "🧹 temp.log and scratch.txt are cluttering the repo", c: "accent" },
        { s: "  Preview: git clean -n", c: "dim" },
        { s: "  Remove:  git clean -fd", c: "dim" },
      ];
    },
    goals: [
      {
        id: "clean-preview",
        label: "Preview what would be removed",
        hint: "Type: git clean -n",
        check: async (engine) => {
          const lines = engine.snapshotLines();
          return lines.some((l) => l.s.includes("Would remove"));
        },
      },
      {
        id: "clean-do",
        label: "Remove untracked files",
        hint: "Type: git clean -fd",
        check: async (engine) => {
          const lines = engine.snapshotLines();
          return lines.some((l) => l.s.includes("Removing") && !l.s.includes("Would"));
        },
      },
    ],
    celebration: "🧹 Cleaned! Untracked files swept away — working tree is tidy.",
  },
];