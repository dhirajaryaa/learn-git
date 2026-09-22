import type { Metadata } from "next";
import { PracticeView } from "@/components/PracticeView";
import { LanguageProvider } from "@/components/i18n/LanguageProvider";
import { allCommands } from "@/data";

export const metadata: Metadata = {
  title: "Practice — a repo you can actually drive",
  description:
    "A pre-seeded repo runs right here in your tab. Edit files, stage, commit, branch, stash and hit a real merge conflict with markers — resolve it and finish the merge.",
};

const KNOWN_SLUGS = new Set(allCommands.map((c) => c.slug));

export default async function PracticePage({
  searchParams,
}: {
  searchParams: Promise<{ cmd?: string | string[] }>;
}) {
  const sp = await searchParams;
  const raw = Array.isArray(sp.cmd) ? undefined : sp.cmd;
  const cmdSlug = raw && KNOWN_SLUGS.has(raw) ? raw : undefined;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <LanguageProvider>
        <PracticeView cmdSlug={cmdSlug} />
      </LanguageProvider>
    </main>
  );
}