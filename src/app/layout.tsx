import type { Metadata } from "next";
import bio from "@/data/bio.json";
import { Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { MotionProvider } from "@/components/motion/motion-provider";
import "./globals.css";

// One typeface for the whole page. Geist Mono was already here for metadata;
// now it is everything. Self-hosted by next/font at build time.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://joanduarte.com"
  ),
  title: bio.name,
  description: bio.positioning,
  openGraph: {
    title: bio.name,
    description: bio.positioning,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: bio.name,
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
      className={`${geistMono.variable} dark antialiased bg-background`}
    >
      <body className="min-h-dvh text-foreground">
        {/* Motion writes the `initial` state (opacity 0) into the server HTML.
            Without JavaScript nothing would ever animate it back, so this rule
            makes every animated element visible for that reader. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <MotionProvider>{children}</MotionProvider>
        <Analytics />
      </body>
    </html>
  );
}
