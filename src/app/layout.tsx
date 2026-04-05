import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Joan Mateo Duarte Politi — Full-Stack Builder",
  description:
    "I build products where AI, systems, and interface design meet. Full-stack engineer crossing domains.",
  openGraph: {
    title: "Joan Mateo Duarte Politi",
    description:
      "I build products where AI, systems, and interface design meet.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Joan Mateo Duarte Politi",
    description:
      "I build products where AI, systems, and interface design meet.",
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
    <html lang="en" className={`${spaceGrotesk.variable} dark antialiased`}>
      <body className="min-h-dvh bg-background text-foreground">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
