import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SmallScreenTip } from "@/components/SmallScreenTip";
import { ThemeProvider, LevelProvider } from "@/components/providers";
import { LanguageProvider } from "@/components/i18n/LanguageProvider";
import { SITE_URL, SITE_NAME, SITE_TITLE, SITE_DESCRIPTION, SITE_AUTHOR } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s · Git In Depth",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "git",
    "git tutorial",
    "learn git",
    "git internals",
    "git commands",
    "git workflow",
    "version control",
    "commit",
    "branching",
    "git visual guide",
  ],
  authors: [{ name: SITE_AUTHOR.name, url: SITE_AUTHOR.website }],
  creator: SITE_AUTHOR.name,
  publisher: SITE_NAME,
  category: "technology",
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: SITE_TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/twitter-image"],
  },
  icons: {
    icon: [{ rel: "icon", url: "/icon.svg", type: "image/svg+xml" }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0d" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("git-in-depth-theme");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;if(d)document.documentElement.classList.add("dark");}catch(e){}})();`,
          }}
        />
        <ThemeProvider>
          <LevelProvider>
            <LanguageProvider>
              <Navbar />
              <SmallScreenTip />
              <main className="flex-1">{children}</main>
              <Footer />
            </LanguageProvider>
          </LevelProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}