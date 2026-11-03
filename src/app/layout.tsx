import type { Metadata } from "next";
import bio from "@/data/bio.json";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { MotionProvider } from "@/components/motion/motion-provider";
import "./globals.css";

// Geist for everything that is read; Space Grotesk only for the name, as the
// one place the site's original letterforms stay. Geist Mono for periods and
// tags. All three are self-hosted by next/font at build time.
const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ??
      "https://joanduarte.com"
  ),
  title: "Joan Mateo Duarte Politi — Co-founder of Catherby",
  description: bio.positioning,
  openGraph: {
    title: "Joan Mateo Duarte Politi",
    description: bio.positioning,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Joan Mateo Duarte Politi",
    description: bio.positioning,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${geistMono.variable} ${spaceGrotesk.variable} dark antialiased bg-background`}
    >
      <body className="min-h-dvh text-foreground">
        {/* Motion writes the `initial` state (opacity 0) into the server HTML.
            Without JavaScript nothing would ever animate it back, so this rule
            makes every animated wrapper visible for that reader. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important;filter:none!important}`}</style>
        </noscript>
        <MotionProvider>{children}</MotionProvider>
        <Analytics />
      </body>
    </html>
  );
}
