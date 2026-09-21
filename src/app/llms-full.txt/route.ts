import { NextResponse } from "next/server";
import { allCommands } from "@/data";
import type { Command } from "@/lib/types";
import stepsData from "@/i18n/en/steps.json";
import scenario from "@/i18n/en/scenario.json";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export const dynamic = "force-static";

type StepMap = Record<string, { title: string; body: string; cmd?: string; min?: number }[]>;
const steps = stepsData as StepMap;

function renderCommand(c: Command): string[] {
  const out: string[] = [];
  out.push(`## ${c.name}`);
  out.push("");
  out.push(`- Command: \`${c.command}\``);
  out.push(`- Category: ${c.category} — Level: ${c.level}`);
  out.push(`- URL: ${SITE_URL}/commands/${c.slug}`);
  out.push("");
  out.push(`### What it does`);
  out.push(c.what);
  out.push("");
  out.push(`### Syntax`);
  out.push(`\`\`\`bash`);
  out.push(c.syntax);
  out.push(`\`\`\``);
  out.push("");
  if (c.options.length) {
    out.push(`### Options`);
    out.push("");
    for (const o of c.options) out.push(`- \`${o.flag}\` — ${o.desc}`);
    out.push("");
  }
  out.push(`### Under the hood`);
  out.push("");
  for (const h of c.how) {
    out.push(`**${h.title}**`);
    out.push("");
    out.push(h.body);
    if (h.code) {
      out.push("");
      out.push(`\`\`\`bash`);
      out.push(h.code);
      out.push(`\`\`\``);
      out.push("");
    }
    out.push("");
  }
  out.push(`### Walkthrough (work/play player)`);
  out.push("");
  const csteps = steps[c.slug] ?? [];
  if (!csteps.length) out.push("No walkthrough steps.");
  for (const s of csteps) {
    const min = s.min === undefined ? "" : ` (min level: ${s.min === 0 ? "child" : s.min === 1 ? "junior" : "developer"})`;
    out.push(`**${s.title}**${min}`);
    out.push("");
    out.push(s.body);
    if (s.cmd) out.push("");
    if (s.cmd) out.push(`\`\`\`bash`);
    if (s.cmd) out.push(s.cmd);
    if (s.cmd) out.push(`\`\`\``);
    out.push("");
  }
  if (c.aliases.length) {
    out.push(`### Aliases pros use`);
    out.push("");
    for (const a of c.aliases) out.push(`- ${a.short} → ${a.full} — ${a.note}`);
    out.push("");
  }
  if (c.uses.length) out.push(`### Common uses`);
  if (c.uses.length) out.push("");
  if (c.uses.length) for (const u of c.uses) out.push(`- ${u}`);
  if (c.uses.length) out.push("");
  if (c.proTip) {
    out.push(`### Pro tip`);
    out.push("");
    out.push(c.proTip);
    out.push("");
  }
  if (c.related.length) {
    out.push(`### Related commands`);
    out.push("");
    for (const r of c.related) out.push(`- ${SITE_URL}/commands/${r}`);
    out.push("");
  }
  return out;
}

export function GET() {
  const out: string[] = [];
  out.push(`# ${SITE_NAME} — full content dump`);
  out.push("");
  out.push(`> Machine-readable snapshot of every command page, walkthrough step, and guided scenario. Index / instructions: ${SITE_URL}/llms.txt`);
  out.push("");
  out.push(`<details>`);
  out.push(`<summary>Table of contents</summary>`);
  out.push("");
  for (const c of allCommands) out.push(`- ${c.name} (${c.command}) — ${c.tagline} — ${SITE_URL}/commands/${c.slug}`);
  out.push(`- Guided scenario — ${SITE_URL}/scenario`);
  out.push("");
  out.push(`</details>`);
  out.push("");
  out.push(`---`);
  out.push("");
  for (const c of allCommands) {
    out.push(...renderCommand(c));
    out.push(`---`);
    out.push("");
  }
  out.push(`# Guided scenario`);
  out.push("");
  out.push(`A start-to-finish day of git: ${scenario.acts.length} acts.`);
  out.push("");
  for (const a of scenario.acts) {
    out.push(`## ${a.kicker}: ${a.title}`);
    out.push("");
    out.push(a.sub);
    out.push("");
  }
  out.push(`### Steps`);
  out.push("");
  let i = 0;
  for (const s of scenario.steps) {
    i += 1;
    out.push(`**${i}. ${s.title}**`);
    out.push("");
    out.push(s.body);
    if (s.cmd) {
      out.push("");
      out.push(`\`\`\`bash`);
      out.push(s.cmd);
      out.push(`\`\`\``);
      out.push("");
    }
  }

  return new NextResponse(out.join("\n"), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}