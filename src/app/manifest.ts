import type { MetadataRoute } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: "Git In Depth",
    description: "Learn Git conceptually — every command with an animated walkthrough and an under-the-hood visual.",
    start_url: "/",
    display: "standalone",
    background_color: "#fafafa",
    theme_color: "#c026d3",
    icons: [
      { src: `${SITE_URL}/icon.svg`, sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}