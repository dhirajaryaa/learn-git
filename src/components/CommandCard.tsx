"use client";

import Link from "next/link";
import { IconArrowUpRight } from "@tabler/icons-react";
import { CommandIcon } from "@/components/CommandIcon";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { CATEGORY_META, type Command } from "@/lib/types";

export function CommandCard({ command }: { command: Command }) {
  const { ui, commands } = useI18n();
  const local = commands[command.slug] ?? command;
  const meta = ui.categories[local.category];
  const metaIcon = CATEGORY_META[command.category].icon;

  return (
    <Link
      href={`/commands/${command.slug}`}
      className="group flex h-full flex-col rounded-2xl border border-line bg-white p-5 transition-all hover:-translate-y-1 hover:border-accent/30 hover:shadow-md dark:bg-zinc-900"
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-zinc-50 text-zinc-600 ring-1 ring-line transition-colors group-hover:bg-accent group-hover:text-white dark:bg-zinc-800 dark:text-zinc-300">
          <CommandIcon name={command.icon} size={18} />
        </span>
        <span className="rounded-full border border-line px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
          {ui.common.levels[local.level]}
        </span>
      </div>
      <code className="font-mono text-[15px] font-semibold text-foreground">
        {local.command}
      </code>
      <p className="mt-2 flex-1 text-[13px] leading-relaxed text-muted">{local.tagline}</p>
      <div className="mt-4 flex items-center justify-between border-t border-line pt-3.5">
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-400">
          <CommandIcon name={metaIcon} size={12} />
          {meta.label}
        </span>
        <span className="flex items-center gap-1 text-[12px] font-semibold text-accent opacity-0 transition-opacity group-hover:opacity-100">
          {ui.common.open} <IconArrowUpRight size={13} />
        </span>
      </div>
    </Link>
  );
}