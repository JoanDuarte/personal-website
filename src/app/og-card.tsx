import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import bio from "@/data/bio.json";

export const size = { width: 1200, height: 630 };

// The card is the page: name and line in Geist Mono on the page's black.
// Satori wants hex, so these are the tokens from globals.css converted once:
// --background oklch(0.145 0.004 260) ≈ #141416, --foreground oklch(0.93 0.004 260)
// ≈ #ececef, --text-secondary oklch(0.70 0.006 260) ≈ #a5a5aa. If a token moves,
// move these with it.
const BACKGROUND = "#141416";
const FOREGROUND = "#ececef";
const SECONDARY = "#a5a5aa";

// The font is read from disk rather than fetched: a fonts.gstatic.com URL
// 404'd once and took every link preview down with it. Satori needs at least
// one font, so there is no "render without it" fallback.
export async function renderOgCard() {
  const font = await readFile(
    join(process.cwd(), "src/app/fonts/GeistMono-Regular.ttf")
  );

  return new ImageResponse(
    (
      <div
        style={{
          background: BACKGROUND,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 96px",
          fontFamily: "Geist Mono",
        }}
      >
        <div
          style={{
            fontSize: 56,
            color: FOREGROUND,
            letterSpacing: "-0.01em",
            display: "flex",
          }}
        >
          {bio.name}
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 28,
            lineHeight: 1.5,
            color: SECONDARY,
            maxWidth: 900,
            display: "flex",
          }}
        >
          {bio.positioning}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Geist Mono", data: font, style: "normal" as const, weight: 400 },
      ],
    }
  );
}
