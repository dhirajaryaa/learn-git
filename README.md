# Git, from the inside out

A learning site that teaches Git conceptually — not by memorization. Every
command page pairs a plain-language explanation with a **work/play walkthrough**
(an animated, auto-advancing step player) and an **under-the-hood visual**,
plus the real-world aliases pros actually type.

Available in **English** and **Hinglish** (for Indian readers) via the language
switch in the nav — all content lives in per-language JSON files, never in
components. Learner modes (Child / Junior / Developer) adapt each command page
and walkthrough to the reader's level. Dark mode included.

## Stack
Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind v4, Motion,
`@tabler/icons-react`. Package manager: **pnpm**.

## Commands
```bash
pnpm dev     # start the dev server
pnpm build   # production build (runs TypeScript checks)
pnpm lint    # ESLint
pnpm start   # serve the production build
```

## i18n workflow
- `src/i18n/en/` is the content source of truth (`ui.json`, `modes.json`,
  `commands.json`, `steps.json`).
- `src/i18n/hinglish/` holds two hand-edited override files
  (`commands.overrides.json`, `steps.overrides.json`); run
  `node scripts/build-i18n.mjs` to merge them with the English structure and
  regenerate the full Hinglish JSON. Run it after any English change.
- Alias names (`short`/`full`) stay identical across languages — only the
  `note` is translated.

See AGENTS.md for the full architecture and conventions.