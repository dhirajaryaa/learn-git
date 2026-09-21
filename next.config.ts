import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "dhirajarya.in" },
    ],
  },
};

export default nextConfig;
