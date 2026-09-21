import type { Metadata } from "next";
import { ScenarioView } from "@/components/ScenarioView";
import { LanguageProvider } from "@/components/i18n/LanguageProvider";

export const metadata: Metadata = {
  title: "A day of work — atomic commits, the human way",
  description:
    "A guided walkthrough of a realistic git session: scaffold the repo, split messy work into small atomic commits with chore / feat / fix / style prefixes, and ship a feature cleanly on a branch. No 50-file megacomits.",
};

export default function ScenarioPage() {
  return (
    <LanguageProvider>
      <ScenarioView />
    </LanguageProvider>
  );
}