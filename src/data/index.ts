import type { Command, Category } from "@/lib/types";
import enCommands from "@/i18n/en/commands.json";
import { CATEGORY_META } from "@/lib/types";

const commands = enCommands as Record<string, Command>;

export const allCommands: Command[] = Object.values(commands);

export const commandsByCategory: Record<Category, Command[]> = {
  setup: [],
  snapshotting: [],
  branching: [],
  inspecting: [],
  undoing: [],
  sharing: [],
};
for (const c of allCommands) {
  commandsByCategory[c.category].push(c);
}

export function getCommand(slug: string): Command | undefined {
  return commands[slug] ?? allCommands.find((c) => c.slug === slug);
}

export function getRelated(command: Command): Command[] {
  return command.related
    .map((slug) => getCommand(slug))
    .filter((c): c is Command => Boolean(c));
}

export function getAdjacent(command: Command): {
  prev?: Command;
  next?: Command;
} {
  const i = allCommands.findIndex((c) => c.slug === command.slug);
  if (i === -1) return {};
  return {
    prev: i > 0 ? allCommands[i - 1] : undefined,
    next: i < allCommands.length - 1 ? allCommands[i + 1] : undefined,
  };
}

export function getBuilder() {
  return {
    name: "Dhiraj Arya",
    tagline: "Self-taught full-stack developer",
    website: "https://dhirajarya.in",
    github: "https://github.com/dhirajaryaa",
    twitter: "https://twitter.com/dhirajarya01",
    linkedin: "https://linkedin.com/in/dhirajarya01",
    email: "hello@dhirajarya.in",
    stack: ["Next.js", "TypeScript", "Tailwind", "PostgreSQL", "Drizzle", "Node.js"],
  };
}

export { CATEGORY_META };