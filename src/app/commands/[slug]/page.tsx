import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCommand, getAdjacent } from "@/data";
import { CommandView } from "@/components/CommandView";
import { LanguageProvider } from "@/components/i18n/LanguageProvider";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export async function generateStaticParams() {
  const { allCommands } = await import("@/data");
  return allCommands.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const command = getCommand(slug);
  if (!command)
    return {
      title: "Not found",
    };
  const canonical = `${SITE_URL}/commands/${slug}`;
  const title = `${command.command} — Git, from the inside out`;
  return {
    title,
    description: command.tagline,
    alternates: { canonical },
    openGraph: {
      title,
      description: command.tagline,
      url: canonical,
      siteName: SITE_NAME,
      type: "website",
      locale: "en_US",
      images: [{ url: `/commands/${slug}/opengraph-image/${slug}`, width: 1200, height: 630, alt: `${command.command} — ${command.name}` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: command.tagline,
      images: [`/commands/${slug}/twitter-image/${slug}`],
    },
  };
}

export default async function CommandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const command = getCommand(slug);
  if (!command) notFound();

  const { prev, next } = getAdjacent(command);

  return (
    <LanguageProvider>
      <CommandView command={command} prevSlug={prev?.slug} nextSlug={next?.slug} />
    </LanguageProvider>
  );
}