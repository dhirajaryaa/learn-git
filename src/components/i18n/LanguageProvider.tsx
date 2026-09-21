"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Command, PlayerStep, Scenario } from "@/lib/types";
import type { Lang, UiText } from "@/i18n/types";
import enUi from "@/i18n/en/ui.json";
import enModes from "@/i18n/en/modes.json";
import enCommands from "@/i18n/en/commands.json";
import enSteps from "@/i18n/en/steps.json";
import enScenario from "@/i18n/en/scenario.json";
import hUi from "@/i18n/hinglish/ui.json";
import hModes from "@/i18n/hinglish/modes.json";
import hCommands from "@/i18n/hinglish/commands.json";
import hSteps from "@/i18n/hinglish/steps.json";
import hScenario from "@/i18n/hinglish/scenario.json";

const LANG_KEY = "git-in-depth-lang";

export interface LanguageCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  ui: UiText;
  modes: Record<string, { label: string; note: string }>;
  commands: Record<string, Command>;
  steps: Record<string, PlayerStep[]>;
  scenario: Scenario;
}

const i18nData: Record<Lang, {
  ui: UiText;
  modes: Record<string, { label: string; note: string }>;
  commands: Record<string, Command>;
  steps: Record<string, PlayerStep[]>;
  scenario: Scenario;
}> = {
  en: {
    ui: enUi as UiText,
    modes: enModes,
    commands: enCommands as Record<string, Command>,
    steps: enSteps as Record<string, PlayerStep[]>,
    scenario: enScenario as Scenario,
  },
  hinglish: {
    ui: hUi as UiText,
    modes: hModes,
    commands: hCommands as Record<string, Command>,
    steps: hSteps as Record<string, PlayerStep[]>,
    scenario: hScenario as Scenario,
  },
};

const LanguageContext = createContext<LanguageCtx>({
  lang: "en",
  setLang: () => {},
  ...i18nData.en,
});

export const useI18n = () => useContext(LanguageContext);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "en";
    const stored = window.localStorage.getItem(LANG_KEY) as Lang | null;
    return stored === "en" || stored === "hinglish" ? stored : "en";
  });

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    window.localStorage.setItem(LANG_KEY, l);
  }, []);

  const value = useMemo(
    () => ({ ...i18nData[lang], lang, setLang }),
    [lang, setLang]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}