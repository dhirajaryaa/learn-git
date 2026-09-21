"use client";

import Link from "next/link";
import {
  IconGitBranch,
  IconBrandGithub,
  IconBrandX,
  IconBrandLinkedin,
  IconWorld,
  IconMail,
} from "@tabler/icons-react";
import { useI18n } from "@/components/i18n/LanguageProvider";

export function Footer() {
  const { ui } = useI18n();

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
              <span className="grid h-7 w-7 place-items-center rounded-full bg-zinc-900 text-[10px] font-bold text-white transition-colors group-hover:bg-accent">
                D
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
                href="mailto:dhirajarya.ptn@gmail.com"
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
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-5 text-xs text-muted sm:flex-row">
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
          <p className="flex items-center gap-1">{ui.footer.madeFor}</p>
        </div>
      </div>
    </footer>
  );
}