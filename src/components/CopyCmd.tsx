"use client";

import { useState } from "react";
import { IconCheck, IconCopy } from "@tabler/icons-react";

export function CopyCmd({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-line bg-[#0c0c0d] px-4 py-3">
      <code className="truncate font-mono text-[13px] text-emerald-300">{text}</code>
      <button
        onClick={async () => {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1400);
        }}
        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
        aria-label="Copy command"
      >
        {copied ? <IconCheck size={14} className="text-emerald-400" /> : <IconCopy size={14} />}
      </button>
    </div>
  );
}