import type { Command, PlayerStep, Category } from "@/lib/types";

export type Lang = "en" | "hinglish";

export interface LevelCopy {
  label: string;
  note: string;
}

export interface FundamentalCopy {
  title: string;
  desc: string;
  points: string[];
}

export interface CategoryCopy {
  label: string;
  blurb: string;
}

export interface UiText {
  nav: {
    home: string;
    map: string;
    learn: string;
    scenario: string;
    learnerPrompt: string;
    themeAria: string;
    menuAria: string;
  };
  footer: {
    tagline: string;
    explore: string;
    map: string;
    firstCommand: string;
    readHistory: string;
    commands: string;
    builtBy: string;
    credit: string;
    madeFor: string;
    gh: string;
    x: string;
    linkedin: string;
    mail: string;
    web: string;
  };
  tip: {
    body: string;
    dismissAria: string;
  };
  lang: {
    label: string;
    english: string;
    hinglish: string;
    englishNote: string;
    hinglishNote: string;
  };
  home: {
    badge: string;
    titleStart: string;
    titleAccent: string;
    titleEnd: string;
    subtitle: string;
    ctaStart: string;
    ctaMap: string;
    statCommands: string;
    statWorkflows: string;
    statAnimated: string;
    graphLabel: string;
    mentalEyebrow: string;
    mentalTitle: string;
    mentalSubtitle: string;
    fundamentals: FundamentalCopy[];
    mapBannerTitle: string;
    mapBannerDesc: string;
    mapBannerCta: string;
    libraryEyebrow: string;
    libraryTitle: string;
    commandsCount: string;
    ctaTitleStart: string;
    ctaTitleAccent: string;
    ctaTitleEnd: string;
    ctaSubtitle: string;
    ctaBegin: string;
    ctaFinal: string;
    scenarioTitle: string;
    scenarioDesc: string;
    scenarioCta: string;
  };
  categories: Record<Category, CategoryCopy>;
  command: {
    backAll: string;
    mapCta: string;
    what: string;
    watch: string;
    watchDesc: string;
    hood: string;
    aliases: string;
    aliasIntro: string;
    aliasAlias: string;
    aliasExpands: string;
    aliasWhy: string;
    anatomy: string;
    uses: string;
    proTip: string;
    deeper: string;
    prev: string;
    next: string;
    facts: string;
    cheat: string;
    category: string;
    difficulty: string;
    syntax: string;
    step: string;
  };
  map: {
    badge: string;
    title: string;
    subtitle: string;
    legendStaged: { title: string; desc: string };
    legendModified: { title: string; desc: string };
    legendUntracked: { title: string; desc: string };
    stages: Record<string, { title: string; sub: string }>;
    placements: Record<string, string>;
  };
  player: {
    pauseAria: string;
    playAria: string;
    prevAria: string;
    nextAria: string;
    replayAria: string;
    stepOf: string;
    goToStep: string;
    done: string;
    replayAll: string;
    noVisual: string;
  };
  notFound: {
    badge: string;
    title: string;
    body: string;
    cta: string;
  };
  scenario: {
    badge: string;
    title: string;
    subtitle: string;
    actsLabel: string;
    ruleTitle: string;
    ruleBody: string;
    whyTitle: string;
    whyBody: string;
    backAll: string;
  };
  common: {
    open: string;
    commands: string;
    levels: {
      beginner: string;
      intermediate: string;
      advanced: string;
    };
  };
}

export interface ContentBundle {
  ui: UiText;
  modes: Record<string, LevelCopy>;
  commands: Record<string, Command>;
  steps: Record<string, PlayerStep[]>;
}

export type ModesText = Record<string, LevelCopy>;

export function tpl(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) =>
    k in vars ? String(vars[k]) : `{${k}}`
  );
}