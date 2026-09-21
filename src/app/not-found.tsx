"use client";

import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";
import { useI18n } from "@/components/i18n/LanguageProvider";

export default function NotFound() {
  const { ui } = useI18n();
  const nf = ui.notFound;
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 py-24 text-center">
      <span className="font-mono text-[13px] font-bold text-accent">{nf.badge}</span>
      <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
        {nf.title}
      </h1>
      <p className="mt-4 max-w-md text-pretty leading-relaxed text-muted">{nf.body}</p>
      <Link
        href="/"
        className="mt-9 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-md transition-transform hover:scale-[1.03]"
      >
        <IconArrowLeft size={15} /> {nf.cta}
      </Link>
    </div>
  );
}