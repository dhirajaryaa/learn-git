import type { Exercise } from "./types";

export const inspectingExercises: Exercise[] = [
  /* ──────── git-log ──────── */
  {
    id: "log-1",
    slug: "git-log",
    title: "Read the commit history",
    difficulty: "easy",
    intro:
      "Explore the commit history with git log. Try both the full and oneline formats.",
    setup: async () => {
      return [
        { s: "📜 The repo has 2 commits already — read them", c: "accent" },
        { s: "  Try: git log, then git log --oneline", c: "dim" },
      ];
    },
    goals: [
      {
        id: "log-full",
        label: "View the full commit log",
        hint: "Type: git log",
        check: async (engine) => {
          const lines = engine.snapshotLines();
          return lines.some((l) => l.s.startsWith("commit ") && l.c === "accent");
        },
      },
      {
        id: "log-oneline",
        label: "View the compact log",
        hint: "Type: git log --oneline",
        check: async (engine) => {
          const lines = engine.snapshotLines();
          return lines.filter((l) => l.s.includes("$ git log --oneline")).length > 0;
        },
      },
    ],
    celebration: "📜 git log is your project's autobiography!",
  },

  /* ──────── git-show ──────── */
  {
    id: "show-1",
    slug: "git-show",
    title: "Inspect a specific commit",
    difficulty: "easy",
    intro: "Use git show to see the exact changes made in the last commit (HEAD).",
    setup: async () => {
      return [
        { s: "🔍 Look at what just happened", c: "accent" },
        { s: "  Try: git show HEAD", c: "dim" },
      ];
    },
    goals: [
      {
        id: "show-head",
        label: "Show changes from HEAD",
        hint: "Type: git show HEAD",
        check: async (engine) => {
          const lines = engine.snapshotLines();
          return lines.some((l) => l.s.includes("$ git show HEAD"));
        },
      },
    ],
    celebration: "🔍 git show is the fastest way to verify exactly what a commit changed.",
  },

  /* ──────── git-diff ──────── */
  {
    id: "diff-1",
    slug: "git-diff",
    title: "See exactly what changed",
    difficulty: "easy",
    intro:
      "A file has been modified. Use git diff to see the exact changes line by line.",
    setup: async (engine) => {
      await engine.setWorkFile("src/app.js", "const app = () => 'changed!';\n\nconst nav = ['home', 'about', 'contact'];\n\nmodule.exports = { app, nav };\n");
      return [
        { s: "🔍 src/app.js was modified — what exactly changed?", c: "accent" },
        { s: "  Type: git diff", c: "dim" },
      ];
    },
    goals: [
      {
        id: "diff-view",
        label: "View the diff to see what lines changed",
        hint: "Type: git diff",
        check: async (engine) => {
          const lines = engine.snapshotLines();
          return lines.some((l) => l.s.startsWith("+") && l.c === "ok") ||
                 lines.some((l) => l.s.startsWith("-") && l.c === "danger");
        },
      },
    ],
    celebration: "🔍 git diff shows you the exact surgical changes — line by line!",
  },

  /* ──────── git-blame ──────── */
  {
    id: "blame-1",
    slug: "git-blame",
    title: "Find who changed each line",
    difficulty: "easy",
    intro: "Use git blame to see who last touched each line of README.md.",
    setup: async () => {
      return [
        { s: "🔎 Who wrote each line of README.md?", c: "accent" },
        { s: "  Type: git blame README.md", c: "dim" },
      ];
    },
    goals: [
      {
        id: "blame-run",
        label: "Run git blame on README.md",
        hint: "Type: git blame README.md",
        check: async (engine) => {
          const lines = engine.snapshotLines();
          return lines.some((l) => l.s.includes("(You") && l.s.includes(")"));
        },
      },
    ],
    celebration: "🔎 blame shows authorship per line — great for understanding code history!",
  },

  /* ──────── git-reflog ──────── */
  {
    id: "reflog-1",
    slug: "git-reflog",
    title: "View the movement history",
    difficulty: "medium",
    intro: "The reflog records every time HEAD moves. Run it to see your recent branch switches and commits.",
    setup: async () => {
      return [
        { s: "📓 The hidden journal of movements", c: "accent" },
        { s: "  Type: git reflog", c: "dim" },
      ];
    },
    goals: [
      {
        id: "reflog-run",
        label: "View the reflog",
        hint: "Type: git reflog",
        check: async (engine) => {
          const lines = engine.snapshotLines();
          return lines.some((l) => l.s.includes("HEAD@{0}"));
        },
      },
    ],
    celebration: "📓 The reflog is Git's safety net — almost nothing is truly lost!",
  },

  /* ──────── git-gc ──────── */
  {
    id: "gc-1",
    slug: "git-gc",
    title: "Garbage collect",
    difficulty: "easy",
    intro: "Run git gc to clean up unnecessary files and optimize the local repository.",
    setup: async () => {
      return [
        { s: "🧹 Time for spring cleaning", c: "accent" },
        { s: "  Type: git gc", c: "dim" },
      ];
    },
    goals: [
      {
        id: "gc-run",
        label: "Run garbage collection",
        hint: "Type: git gc",
        check: async (engine) => {
          const lines = engine.snapshotLines();
          return lines.some((l) => l.s.includes("Enumerating objects"));
        },
      },
    ],
    celebration: "🧹 Cleaned! The repository is optimized.",
  },
];