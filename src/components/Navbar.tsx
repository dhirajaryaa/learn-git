"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  IconGitBranch,
  IconMenu2,
  IconX,
  IconSun,
  IconMoon,
  IconChevronDown,
  IconSparkles,
  IconTools,
  IconRocket,
  IconLanguage,
  type IconProps,
} from "@tabler/icons-react";
import { useTheme, useLearner, type Level } from "@/components/providers";
import { useI18n } from "@/components/i18n/LanguageProvider";

const LEVEL_ICONS: Record<Level, React.ComponentType<IconProps>> = {
  child: IconSparkles,
  junior: IconTools,
  developer: IconRocket,
};

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [modeOpen, setModeOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const { level, setLevel } = useLearner();
  const { lang, setLang, ui, modes } = useI18n();

  const links = [
    { href: "/", label: ui.nav.home },
    { href: "/map", label: ui.nav.map },
    { href: "/scenario", label: ui.nav.scenario },
    { href: "/commands/git-init", label: ui.nav.learn },
  ];

  const LevelIcon = LEVEL_ICONS[level];

  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-white shadow-sm">
            <IconGitBranch size={18} />
          </span>
          <span className="text-[15px] font-semibold tracking-tight">
            Git<span className="text-accent">·In</span>Depth
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full px-4 py-2 text-[13.5px] font-medium text-muted transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          {/* language */}
          <div className="relative">
            <button
              onClick={() => {
                setLangOpen((v) => !v);
                setModeOpen(false);
              }}
              aria-label={ui.lang.label}
              className="flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-[12.5px] font-medium text-foreground transition-colors hover:border-accent/40 dark:bg-zinc-900"
            >
              <IconLanguage size={14} className="text-accent" />
              <span className="uppercase">{lang === "en" ? "EN" : "HI"}</span>
              <IconChevronDown
                size={13}
                className={`text-muted transition-transform ${langOpen ? "rotate-180" : ""}`}
              />
            </button>
            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  onMouseLeave={() => setLangOpen(false)}
                  className="absolute right-0 top-11 w-56 overflow-hidden rounded-2xl border border-line bg-background p-1.5 shadow-xl shadow-black/5 dark:shadow-black/40"
                >
                  <p className="px-3 pb-1 pt-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-muted">
                    {ui.lang.label}
                  </p>
                  {(["en", "hinglish"] as const).map((l) => {
                    const active = lang === l;
                    const labels = {
                      en: { name: ui.lang.english, note: ui.lang.englishNote },
                      hinglish: { name: ui.lang.hinglish, note: ui.lang.hinglishNote },
                    }[l];
                    return (
                      <button
                        key={l}
                        onClick={() => {
                          setLang(l);
                          setLangOpen(false);
                        }}
                        className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors ${
                          active
                            ? "bg-accent/10 text-foreground"
                            : "text-muted hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                        }`}
                      >
                        <span className="grid h-7 w-7 place-items-center rounded-md border border-line text-[11px] font-bold uppercase">
                          {l === "en" ? "EN" : "HI"}
                        </span>
                        <span className="flex-1">
                          <span className={`block text-[13px] font-semibold ${active ? "text-accent" : ""}`}>
                            {labels.name}
                          </span>
                          <span className="block text-[10.5px] text-muted">{labels.note}</span>
                        </span>
                        {active && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* learner mode */}
          <div className="relative">
            <button
              onClick={() => {
                setModeOpen((v) => !v);
                setLangOpen(false);
              }}
              className="flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-[12.5px] font-medium text-foreground transition-colors hover:border-accent/40 dark:bg-zinc-900"
            >
              <LevelIcon size={14} className="text-accent" />
              <span className="hidden sm:inline">{modes[level]?.label ?? level}</span>
              <span className="text-[10.5px] text-muted sm:hidden">{modes[level]?.label ?? level}</span>
              <IconChevronDown
                size={13}
                className={`text-muted transition-transform ${modeOpen ? "rotate-180" : ""}`}
              />
            </button>
            <AnimatePresence>
              {modeOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  onMouseLeave={() => setModeOpen(false)}
                  className="absolute right-0 top-11 w-64 overflow-hidden rounded-2xl border border-line bg-background p-1.5 shadow-xl shadow-black/5 dark:shadow-black/40"
                >
                  <p className="px-3 pb-1 pt-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-muted">
                    {ui.nav.learnerPrompt}
                  </p>
                  {(Object.keys(modes) as Level[]).map((value) => {
                    const Icon = LEVEL_ICONS[value];
                    const m = modes[value];
                    const active = value === level;
                    return (
                      <button
                        key={value}
                        onClick={() => {
                          setLevel(value);
                          setModeOpen(false);
                        }}
                        className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors ${
                          active ? "bg-accent/10 text-foreground" : "text-muted hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                        }`}
                      >
                        <Icon size={15} className={active ? "text-accent" : "text-muted"} />
                        <span className="flex-1">
                          <span className={`block text-[13px] font-semibold ${active ? "text-accent" : ""}`}>
                            {m.label}
                          </span>
                          <span className="block text-[10.5px] text-muted">{m.note}</span>
                        </span>
                        {active && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* theme toggle */}
          <button
            onClick={toggle}
            aria-label={ui.nav.themeAria}
            className="hidden h-9 w-9 place-items-center rounded-full border border-line bg-white text-muted transition-colors hover:border-accent/40 hover:text-accent md:grid dark:bg-zinc-900"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={theme}
                initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.18 }}
              >
                {theme === "light" ? <IconMoon size={15} /> : <IconSun size={15} />}
              </motion.span>
            </AnimatePresence>
          </button>

          <button
            className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={ui.nav.menuAria}
          >
            {open ? <IconX size={18} /> : <IconMenu2 size={18} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden border-t border-line bg-background md:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-4">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:text-foreground"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}