import { NextResponse } from "next/server";
import { allCommands, commandsByCategory } from "@/data";
import { CATEGORY_META } from "@/lib/types";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, SITE_AUTHOR } from "@/lib/site";

export const dynamic = "force-static";

function commandLine(c: (typeof allCommands)[number]): string {
  return `- ${c.command}: ${c.tagline} — (${c.level}) — ${SITE_URL}/commands/${c.slug}`;
}

export function GET() {
  const lines: string[] = [];
  lines.push(`# ${SITE_NAME}`);
  lines.push("");
  lines.push(`> ${SITE_DESCRIPTION}`);
  lines.push("");
  lines.push("- Languages: English (canonical) and Hinglish (generated from overrides by scripts/build-i18n.mjs).");
  lines.push("- Learner levels: child, junior, developer — walkthrough steps gate on a min level; every page works for all three.");
  lines.push(`- Built by ${SITE_AUTHOR.name} (${SITE_AUTHOR.website}). Change requests / bugs: ${SITE_AUTHOR.email}.`);
  lines.push("- This file is the machine-readable index. The full, single-file dump of every command's copy lives at /llms-full.txt.");
  lines.push("");
  lines.push("## Pages");
  lines.push("");
  lines.push(`- ${SITE_URL}/ — home page`);
  lines.push(`- ${SITE_URL}/map — skill-tree map of all 28 commands, grouped by category`);
  lines.push(`- ${SITE_URL}/scenario — guided 3-act day (start-to-finish git workflow); each step can run its own command`);
  lines.push("");
  lines.push("## Commands (28)");
  lines.push("");
  for (const meta of Object.values(CATEGORY_META)) {
    lines.push(`### ${meta.label} (${meta.id})`);
    lines.push(meta.blurb);
    lines.push("");
    for (const c of commandsByCategory[meta.id]) lines.push(commandLine(c));
    lines.push("");
  }
  lines.push("## What a command page contains");
  lines.push("");
  lines.push("- what: plain-language explanation of the concept, not just the flag list.");
  lines.push("- how: step-by-step under-the-hood walkthroughs (what Git actually stores: files, objects, hashes).");
  lines.push("- visual: animated diagram (commit graph, staging area, branches, merge conflicts, etc.).");
  lines.push("- syntax + options + uses: real-world usage and common reasons to reach for it.");
  lines.push("- aliases: the short forms pros actually type (short / full / why).");
  lines.push("- work/play player: an auto-advancing animated walkthrough on every page (/commands/<slug>).");
  lines.push("");
  lines.push("## Content source of truth");
  lines.push("");
  lines.push("- English copy: src/i18n/en/*.json (commands.json, steps.json, scenario.json, ui.json, modes.json).");
  lines.push("- Hinglish: src/i18n/hinglish/*.overrides.json, merged over the English structure by scripts/build-i18n.mjs.");
  lines.push("- Command catalogue & categories: src/data/index.ts and src/lib/types.ts. Do not add copy to code.");

  const body = lines.join("\n");
  return new NextResponse(body, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}