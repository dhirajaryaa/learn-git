"use client";

import Link from "next/link";
import Image from "next/image";
import {
  IconGitBranch,
  IconBrandGithub,
  IconBrandX,
  IconBrandLinkedin,
  IconWorld,
  IconMail,
  IconSun,
  IconMoon,
} from "@tabler/icons-react";
import { useTheme } from "@/components/providers";
import { useI18n } from "@/components/i18n/LanguageProvider";

export function Footer() {
  const { ui } = useI18n();
  const { theme, toggle } = useTheme();

  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-14 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm space-y-3">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-white">
              <IconGitBranch size={18} />
            </span>
            <span className="text-[15px] font-semibold tracking-tight">
              Git<span className="text-accent">·In</span>Depth
            </span>
          </Link>
          <p className="text-sm leading-relaxed text-muted">{ui.footer.tagline}</p>
        </div>

        <div className="grid grid-cols-2 gap-x-16 gap-y-2 text-sm md:grid-cols-3">
          <div className="space-y-2.5">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
              {ui.footer.explore}
            </p>
            <Link href="/map" className="block text-muted hover:text-foreground">
              {ui.footer.map}
            </Link>
            <Link href="/commands/git-init" className="block text-muted hover:text-foreground">
              {ui.footer.firstCommand}
            </Link>
            <Link href="/commands/git-log" className="block text-muted hover:text-foreground">
              {ui.footer.readHistory}
            </Link>
          </div>
          <div className="space-y-2.5">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
              {ui.footer.commands}
            </p>
            <Link href="/commands/git-commit" className="block text-muted hover:text-foreground">
              git commit
            </Link>
            <Link href="/commands/git-merge" className="block text-muted hover:text-foreground">
              git merge
            </Link>
            <Link href="/commands/git-rebase" className="block text-muted hover:text-foreground">
              git rebase
            </Link>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
              {ui.footer.builtBy}
            </p>
            <Link
              href="https://dhirajarya.in"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 text-[15px] font-semibold text-foreground hover:text-accent"
            >
              <span className="h-7 w-7 overflow-hidden rounded-full ring-1 ring-line">
                <Image
                  src="https://dhirajarya.in/assets/hero.webp"
                  alt={ui.footer.builtBy}
                  width={28}
                  height={28}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </span>
              Dhiraj Arya
            </Link>
            <div className="flex items-center gap-1.5 pt-1">
              <a
                href="https://github.com/dhirajaryaa"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={ui.footer.gh}
                className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-accent/40 hover:text-accent"
              >
                <IconBrandGithub size={15} />
              </a>
              <a
                href="https://twitter.com/dhirajarya01"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={ui.footer.x}
                className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-accent/40 hover:text-accent"
              >
                <IconBrandX size={14} />
              </a>
              <a
                href="https://linkedin.com/in/dhirajarya01"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={ui.footer.linkedin}
                className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-accent/40 hover:text-accent"
              >
                <IconBrandLinkedin size={15} />
              </a>
              <a
                href="mailto:hello@dhirajarya.in"
                aria-label={ui.footer.mail}
                className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-accent/40 hover:text-accent"
              >
                <IconMail size={15} />
              </a>
              <a
                href="https://dhirajarya.in"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={ui.footer.web}
                className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-accent/40 hover:text-accent"
              >
                <IconWorld size={15} />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-5 text-xs text-muted sm:flex-row">
          <p>
            {ui.footer.credit}{" "}
            <a
              href="https://dhirajarya.in"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:text-accent"
            >
              Dhiraj Arya
            </a>
            .
          </p>
          <div className="flex items-center gap-3">
            <p className="flex items-center gap-1">{ui.footer.madeFor}</p>
            <button
              onClick={toggle}
              aria-label={ui.nav.themeAria}
              className="grid h-9 w-9 place-items-center rounded-full border border-line bg-white text-muted transition-colors hover:border-accent/40 hover:text-accent dark:bg-zinc-900"
            >
              {theme === "light" ? <IconMoon size={15} /> : <IconSun size={15} />}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}