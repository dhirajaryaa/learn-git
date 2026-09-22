import type { Exercise } from "./types";
import { runSilent } from "./types";

export const sharingExercises: Exercise[] = [
  /* ──────── git-remote ──────── */
  {
    id: "remote-1",
    slug: "git-remote",
    title: "Add a remote",
    difficulty: "easy",
    intro: "Before you can push or pull, you need to connect your local repo to a remote server.",
    setup: async () => {
      return [
        { s: "🔗 Connect to the world", c: "accent" },
        { s: "  Try: git remote add origin /origin", c: "dim" },
      ];
    },
    goals: [
      {
        id: "remote-add",
        label: "Add a remote named 'origin'",
        hint: "Type: git remote add origin /origin",
        check: async (engine) => {
          const lines = engine.snapshotLines();
          return lines.some((l) => l.s.includes("$ git remote add origin /origin"));
        },
      }
    ],
    celebration: "🔗 Remote added! Now your repo knows where to send and receive code.",
  },

  /* ──────── git-push ──────── */
  {
    id: "push-1",
    slug: "git-push",
    title: "Push to a remote",
    difficulty: "medium",
    intro:
      "Set up a remote and push your main branch to it.",
    setup: async () => {
      return [
        { s: "🚀 No remote is configured yet", c: "accent" },
        { s: "  1. git remote add origin /origin", c: "dim" },
        { s: "  2. git push -u origin main", c: "dim" },
      ];
    },
    goals: [
      {
        id: "push-remote",
        label: "Add a remote named 'origin'",
        hint: "Type: git remote add origin /origin",
        check: async (engine) => {
          const lines = engine.snapshotLines();
          return lines.some((l) => l.s.includes("$ git remote add"));
        },
      },
      {
        id: "push-do",
        label: "Push main to origin",
        hint: "Type: git push -u origin main",
        check: async (engine) => {
          const lines = engine.snapshotLines();
          return lines.some((l) => l.s.includes("[new branch]") || l.s.includes("main -> main"));
        },
      },
    ],
    celebration: "🚀 Pushed! Your commits are now on the remote!",
  },

  /* ──────── git-fetch ──────── */
  {
    id: "fetch-1",
    slug: "git-fetch",
    title: "Download remote changes",
    difficulty: "easy",
    intro: "Fetch changes from the remote without merging them into your working files.",
    setup: async (engine) => {
      await runSilent(engine, "git remote add origin /origin");
      return [
        { s: "📥 Check if the remote has new commits", c: "accent" },
        { s: "  Try: git fetch origin", c: "dim" },
      ];
    },
    goals: [
      {
        id: "fetch-run",
        label: "Fetch from origin",
        hint: "Type: git fetch origin",
        check: async (engine) => {
          const lines = engine.snapshotLines();
          return lines.some((l) => l.s.includes("From /origin") || l.s.includes("$ git fetch"));
        },
      },
    ],
    celebration: "📥 Fetched! You downloaded the history, but your local files are safe and untouched.",
  },

  /* ──────── git-pull ──────── */
  {
    id: "pull-1",
    slug: "git-pull",
    title: "Fetch and merge",
    difficulty: "medium",
    intro: "Pull downloads changes from the remote and immediately merges them into your current branch.",
    setup: async (engine) => {
      await runSilent(engine, "git remote add origin /origin");
      return [
        { s: "⬇️ Bring your branch up to date", c: "accent" },
        { s: "  Try: git pull origin main", c: "dim" },
      ];
    },
    goals: [
      {
        id: "pull-run",
        label: "Pull from origin main",
        hint: "Type: git pull origin main",
        check: async (engine) => {
          const lines = engine.snapshotLines();
          return lines.some((l) => l.s.includes("Updating") || l.s.includes("Merge made") || l.s.includes("Already up to date"));
        },
      },
    ],
    celebration: "⬇️ Pulled! git pull is just git fetch + git merge in one command.",
  },

  /* ──────── git-clone ──────── */
  {
    id: "clone-1",
    slug: "git-clone",
    title: "Clone a repository",
    difficulty: "easy",
    intro: "Copy an entire repository from a remote server to your local machine.",
    setup: async () => {
      return [
        { s: "👯 Copy the origin repo", c: "accent" },
        { s: "  Try: git clone /origin my-clone", c: "dim" },
      ];
    },
    goals: [
      {
        id: "clone-run",
        label: "Clone /origin to my-clone",
        hint: "Type: git clone /origin my-clone",
        check: async (engine) => {
          const lines = engine.snapshotLines();
          return lines.some((l) => l.s.includes("Cloning into 'my-clone'"));
        },
      },
    ],
    celebration: "👯 Cloned! You now have a complete local copy of the remote repository.",
  },

  /* ──────── git-tag ──────── */
  {
    id: "tag-1",
    slug: "git-tag",
    title: "Tag a release",
    difficulty: "easy",
    intro: "Mark the current commit as version v1.0 with a lightweight tag.",
    setup: async () => {
      return [
        { s: "🏷️ The current commit is release-worthy — tag it!", c: "accent" },
        { s: "  Type: git tag v1.0", c: "dim" },
      ];
    },
    goals: [
      {
        id: "tag-create",
        label: "Create a tag named v1.0",
        hint: "Type: git tag v1.0",
        check: async (engine) => {
          const lines = engine.snapshotLines();
          return lines.some((l) => l.s.includes("$ git tag v1.0"));
        },
      },
      {
        id: "tag-verify",
        label: "List tags to verify",
        hint: "Type: git tag",
        check: async (engine) => {
          const lines = engine.snapshotLines();
          return lines.some((l) => l.s.trim() === "v1.0");
        },
      },
    ],
    celebration: "🏷️ Tagged! v1.0 is now a fixed bookmark in your history.",
  },
];