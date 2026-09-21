"use client";

import { GitGraph } from "./GitGraph";
import { Staging } from "./Staging";
import { Remote } from "./Remote";
import { GitDir } from "./GitDir";
import { Objects } from "./Objects";
import { Diff } from "./Diff";
import { Reflog } from "./Reflog";
import { Stash } from "./Stash";
import { Status } from "./Status";
import { Rebase } from "./Rebase";
import type { VisualConfig } from "@/lib/types";

export function Visual({ visual }: { visual: VisualConfig }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-gradient-to-b from-zinc-50/80 to-white p-3 sm:p-6">
      {visual.kind === "gitdir" && (
        <GitDir kind={visual.kind === "gitdir" ? "init" : "init"} caption={visual.caption} />
      )}
      {visual.kind === "staging" && (
        <Staging
          staged={visual.staged}
          dirty={visual.dirty}
          untracked={visual.untracked}
          mode={visual.mode}
          caption={visual.caption}
        />
      )}
      {visual.kind === "graph" && <GitGraph spec={visual.spec} />}
      {visual.kind === "rebased" && <Rebase spec={visual.spec} />}
      {visual.kind === "remote" && (
        <Remote
          remote={visual.remote}
          branch={visual.branch}
          mo={visual.mo}
          caption={visual.caption}
        />
      )}
      {visual.kind === "objects" && <Objects caption={visual.caption} />}
      {visual.kind === "diff" && <Diff caption={visual.caption} />}
      {visual.kind === "reflog" && <Reflog caption={visual.caption} />}
      {visual.kind === "stash" && <Stash caption={visual.caption} />}
      {visual.kind === "status" && <Status caption={visual.caption} />}
    </div>
  );
}