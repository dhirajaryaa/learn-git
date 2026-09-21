<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Git, from the inside out — project notes

## What this is
A single-page-class learning site that teaches Git conceptually, not by memorization.
Every command page pairs a plain-language explanation with a **work/play walkthrough**
(an animated, auto-advancing player) and an **under-the-hood visual**, plus the
real-world aliases pros actually type.

## Stack & commands
- Next.js 16 (App Router, Turbopack default), React 19, TypeScript, Tailwind v4, Motion.
- Icons: `@tabler/icons-react`. Package manager: **pnpm** (`node_modules` is pnpm-linked).
- `pnpm dev` / `pnpm build` / `pnpm lint` / `pnpm start`.
- There is **no test suite** — verify with `pnpm build` (runs TS checks) and a manual
  smoke test of `/`, `/map`, `/commands/git-init`, `/commands/git-status`, `/nope`.

## Architecture
- `src/app/` — routes. `/commands/[slug]` is a thin server shell (`generateStaticParams`
  + metadata) that renders the client `CommandView`. `/` and `/map` are client pages.
- `src/lib/types.ts` — `Command`, `PlayerStep`, visual-union types and `CATEGORY_META`
  (structural, language-neutral).
- `src/data/index.ts` — readonly catalogue derived from `src/i18n/en/commands.json`
  (`allCommands`, `commandsByCategory`, `getCommand`, `getAdjacent`, `getBuilder`).
  Do not put copy here — content lives in i18n JSON.
- `src/components/providers.tsx` — `ThemeProvider` (dark mode, lazy localStorage init)
  and `LevelProvider` (learner level: `child` | `junior` | `developer`).
- `src/components/i18n/LanguageProvider.tsx` — `LanguageProvider` + `useI18n()`
  supplying `{ lang, setLang, ui, modes, commands, steps }` for the active language.
- `src/components/WorkflowPlayer.tsx` — the step player; filters steps by learner level
  (`min`) and uses `STEP_MS` + 100-tick progress. Level-filter values: child 0, junior 1, developer 2.
- `src/components/ShowAt.tsx` — renders children only at a minimum learner level.
- `src/components/visuals/` — per-command animated diagrams (all `"use client"`, Motion).
- `src/components/useMediaQuery.ts` — `useSyncExternalStore`-based breakpoint hook.

## i18n — content lives ONLY in JSON (source of truth)
Structure mirror: `src/i18n/en/` and `src/i18n/hinglish/`, each with:
- `ui.json` — UI chrome (nav, footer, home, command page, map, player, notFound, common, categories).
- `modes.json` — learner-mode labels/byline per language.
- `commands.json` — 28 commands, one object per slug.
- `steps.json` — 28 keys, 77 walkthrough steps (each step: `title`, `body`, `cmd`,
  optional `min` gating, optional `visual`).

Rules:
- **English is canonical.** `en/commands.json` is also the data layer used at build time.
- **Hinglish is generated, never hand-edited.** Hand-edited *overrides* live in
  `src/i18n/hinglish/commands.overrides.json` and `steps.overrides.json`; run
  `node scripts/build-i18n.mjs` to merge English structure with Hinglish copy and emit
  `commands.json`/`steps.json`. Re-run it after ANY change to English content.
- **Alias names stay identical across languages** (both `short` and `full`); only the
  `note`/`why` is translated. Commands map to overrides by slug; steps by index in the
  command's step array. Visual refs/`syntax`/`code`/`cmd` strings are never translated.
- New languages = new `src/i18n/<lang>/` folder + overrides + wiring in
  `LanguageProvider` and the nav selector.

## Persistence keys
- `git-in-depth-lang` (en | hinglish), `git-in-depth-theme` (light | dark),
  `git-in-depth-level` (child | junior | developer), sessionStorage `git-tip-dismissed`.

## Conventions
- No test framework; type errors surface via `pnpm build` (Turbopack runs `tsc` first).
- ESLint uses React Compiler-era rules — `react-hooks/set-state-in-effect` is enabled.
  Read scrollbar-free localStorage/matchMedia state with **lazy `useState` initializers**
  (`typeof window === "undefined"` guard) or `useSyncExternalStore`, and use React's
  render-time state adjustment instead of setState-in-effect where needed.
- Color tokens (`--background`, `--foreground`, `--accent`, `--line`, `--muted`,
  `--accent-soft`) are CSS variables that flip via the `.dark` class — always prefer
  `text-foreground`/`text-muted`/`border-line`/`bg-accent-soft` over raw `zinc` utilities,
  and pair any raw `bg-white`/`bg-zinc-*` with a `dark:` variant.
