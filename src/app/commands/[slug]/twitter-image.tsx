import { commandOG, OG_SIZE } from "@/lib/og";
import { allCommands } from "@/data";

export const size = OG_SIZE;
export const contentType = "image/png";

export async function generateImageMetadata() {
  return allCommands.map((c) => ({
    id: c.slug,
    alt: `${c.command} — ${c.tagline}`,
  }));
}

export default async function Image({ id }: { id: Promise<string | number> }) {
  const slug = String(await id);
  const command = allCommands.find((c) => c.slug === slug) ?? allCommands[0];
  return commandOG(command);
}