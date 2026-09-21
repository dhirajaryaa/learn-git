export type Category =
  | "snapshotting"
  | "branching"
  | "inspecting"
  | "undoing"
  | "sharing"
  | "setup";

export interface HoodStep {
  title: string;
  body: string;
  code?: string;
}

export interface GitAlias {
  short: string;
  full: string;
  note: string;
}

export interface CommandOption {
  flag: string;
  desc: string;
}

export interface GraphNode {
  id: string;
  msg: string;
  parents: number[];
}

export interface GraphRef {
  name: string;
  node: number;
  active?: boolean;
}

export interface GraphSpec {
  nodes: GraphNode[];
  refs?: GraphRef[];
  animation:
    | "build"
    | "merge"
    | "reset"
    | "headmove"
    | "tag"
    | "branch"
    | "log";
  highlight?: number;
  caption?: string;
}

export interface RebaseSpec {
  before: GraphSpec;
  after: GraphSpec;
  action: string;
}

export type VisualConfig =
  | { kind: "gitdir"; caption?: string }
  | {
      kind: "staging";
      staged?: string[];
      dirty?: string[];
      untracked?: string[];
      mode: "add" | "commit" | "restore";
      caption?: string;
    }
  | { kind: "graph"; spec: GraphSpec }
  | { kind: "rebased"; spec: RebaseSpec }
  | {
      kind: "remote";
      remote: string;
      branch: string;
      mo: "push" | "pull" | "fetch" | "clone";
      caption?: string;
    }
  | { kind: "objects"; caption?: string }
  | { kind: "diff"; caption?: string }
  | { kind: "reflog"; caption?: string }
  | { kind: "stash"; caption?: string }
  | { kind: "status"; caption?: string };

export interface Command {
  slug: string;
  command: string;
  name: string;
  category: Category;
  icon: string;
  level: "beginner" | "intermediate" | "advanced";
  tagline: string;
  what: string;
  how: HoodStep[];
  visual: VisualConfig;
  syntax: string;
  options: CommandOption[];
  uses: string[];
  aliases: GitAlias[];
  related: string[];
  proTip?: string;
}

export interface PlayerStep {
  title: string;
  body: string;
  cmd?: string;
  visual?: VisualConfig;
  min?: Level;
  act?: number;
}

export interface ScenarioAct {
  id: string;
  kicker: string;
  title: string;
  sub: string;
}

export interface Scenario {
  acts: ScenarioAct[];
  steps: PlayerStep[];
}

export type Level = "child" | "junior" | "developer";

export interface CategoryMeta {
  id: Category;
  label: string;
  blurb: string;
  icon: string;
}

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  setup: {
    id: "setup",
    label: "Setup",
    blurb: "Bring a repository to life.",
    icon: "tools",
  },
  snapshotting: {
    id: "snapshotting",
    label: "Snapshotting",
    blurb: "Turn changes into history.",
    icon: "camera",
  },
  branching: {
    id: "branching",
    label: "Branching & Merging",
    blurb: "Explore parallel timelines.",
    icon: "git-branch",
  },
  inspecting: {
    id: "inspecting",
    label: "Inspecting & History",
    blurb: "Read the story of a project.",
    icon: "search",
  },
  undoing: {
    id: "undoing",
    label: "Undoing & Rewriting",
    blurb: "Repair commits and mistakes.",
    icon: "rotate",
  },
  sharing: {
    id: "sharing",
    label: "Sharing & Sync",
    blurb: "Move history across machines.",
    icon: "satellite",
  },
};