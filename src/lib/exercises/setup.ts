import type { Exercise } from "./types";
import { runSilent } from "./types";

export const setupExercises: Exercise[] = [
  /* ──────── git-init ──────── */
  {
    id: "init-1",
    slug: "git-init",
    title: "Initialize a repository",
    difficulty: "easy",
    intro:
      "Start by initializing a new empty Git repository in the current directory.",
    setup: async () => {
      return [
        { s: "🌱 Start fresh!", c: "accent" },
        { s: "  Try: git init", c: "dim" },
      ];
    },
    goals: [
      {
        id: "init-run",
        label: "Run git init",
        hint: "Type: git init",
        check: async (engine) => {
          const lines = engine.snapshotLines();
          return lines.some((l) => l.s.includes("Initialized empty Git repository"));
        },
      },
    ],
    celebration: "🌱 You've brought a repository to life! This creates the hidden .git folder where all history lives.",
  },

  /* ──────── git-config ──────── */
  {
    id: "config-1",
    slug: "git-config",
    title: "Set your identity",
    difficulty: "easy",
    intro:
      "Before you commit, Git needs to know who you are. Set your name and email.",
    setup: async () => {
      return [
        { s: "👤 Identify yourself!", c: "accent" },
        { s: '  1. git config --global user.name "Your Name"', c: "dim" },
        { s: '  2. git config --global user.email "you@example.com"', c: "dim" },
      ];
    },
    goals: [
      {
        id: "config-name",
        label: "Set your name",
        hint: 'Type: git config --global user.name "Your Name"',
        check: async (engine) => {
          const lines = engine.snapshotLines();
          return lines.some((l) => l.s.includes("git config") && l.s.includes("user.name"));
        },
      },
      {
        id: "config-email",
        label: "Set your email",
        hint: 'Type: git config --global user.email "you@example.com"',
        check: async (engine) => {
          const lines = engine.snapshotLines();
          return lines.some((l) => l.s.includes("git config") && l.s.includes("user.email"));
        },
      },
      {
        id: "config-list",
        label: "Verify your settings",
        hint: "Type: git config --list",
        check: async (engine) => {
          const lines = engine.snapshotLines();
          return lines.some((l) => l.s.includes("user.name=") || l.s.includes("user.email="));
        },
      },
    ],
    celebration: "👤 Identity set! Every commit you make will now have your signature on it.",
  }
];