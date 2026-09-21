#!/usr/bin/env node
// Merges the per-language copy overrides into complete commands.json / steps.json.
// Visuals, code and structure are inherited from English; only copy fields are swapped.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const i18n = (lang, file) => join(root, "src", "i18n", lang, file);

const enCommands = JSON.parse(readFileSync(i18n("en", "commands.json"), "utf8"));
const overrides = JSON.parse(readFileSync(i18n("hinglish", "commands.overrides.json"), "utf8"));
const enSteps = JSON.parse(readFileSync(i18n("en", "steps.json"), "utf8"));
const stepOverrides = JSON.parse(readFileSync(i18n("hinglish", "steps.overrides.json"), "utf8"));
const enScenario = JSON.parse(readFileSync(i18n("en", "scenario.json"), "utf8"));
const scenarioOverrides = JSON.parse(
  readFileSync(i18n("hinglish", "scenario.overrides.json"), "utf8")
);

const outCommands = {};
for (const [slug, cmd] of Object.entries(enCommands)) {
  const ov = overrides[slug];
  const merged = { ...cmd };
  if (ov) {
    for (const key of ["name", "tagline", "what", "proTip"]) {
      if (ov[key]) merged[key] = ov[key];
    }
    if (ov.how) {
      merged.how = cmd.how.map((h, i) => {
        const o = ov.how[i];
        if (!o) return h;
        return { ...h, title: o.title ?? h.title, body: o.body ?? h.body };
      });
    }
    if (ov.optionsDesc) {
      merged.options = cmd.options.map((o, i) =>
        i < ov.optionsDesc.length ? { ...o, desc: ov.optionsDesc[i] } : o
      );
    }
    if (ov.uses) {
      merged.uses = cmd.uses.map((u, i) => (i < ov.uses.length ? ov.uses[i] : u));
    }
    if (ov.aliasesNote) {
      const notes = Array.isArray(ov.aliasesNote) ? ov.aliasesNote : [ov.aliasesNote];
      merged.aliases = cmd.aliases.map((a, i) =>
        i < notes.length ? { ...a, note: notes[i] } : a
      );
    }
  }
  outCommands[slug] = merged;
}

const outSteps = {};
for (const [slug, steps] of Object.entries(enSteps)) {
  const ov = stepOverrides[slug];
  outSteps[slug] = steps.map((st, i) => {
    const o = ov?.[i];
    if (!o) return st;
    return { ...st, title: o.title ?? st.title, body: o.body ?? st.body };
  });
}

const outScenario = {
  acts: enScenario.acts.map((act, i) => {
    const o = scenarioOverrides.acts?.[i];
    return {
      ...act,
      kicker: o?.kicker ?? act.kicker,
      title: o?.title ?? act.title,
      sub: o?.sub ?? act.sub,
    };
  }),
  steps: enScenario.steps.map((st, i) => {
    const o = scenarioOverrides.steps?.[i];
    if (!o) return st;
    return { ...st, title: o.title ?? st.title, body: o.body ?? st.body };
  }),
};

writeFileSync(i18n("hinglish", "commands.json"), JSON.stringify(outCommands, null, 2));
writeFileSync(i18n("hinglish", "steps.json"), JSON.stringify(outSteps, null, 2));
writeFileSync(i18n("hinglish", "scenario.json"), JSON.stringify(outScenario, null, 2));

const missing = Object.keys(enCommands).filter((k) => !overrides[k]);
const missingSteps = Object.keys(enSteps).filter((k) => !stepOverrides[k]);
console.log("commands written:", Object.keys(outCommands).length);
console.log("steps written:", Object.values(outSteps).reduce((a, s) => a + s.length, 0));
console.log("scenario steps written:", outScenario.steps.length);
console.log("commands without overrides:", missing.length ? missing : "none");
console.log("steps without overrides:", missingSteps.length ? missingSteps : "none");