import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 1200, height: 630 };

/**
 * Assets are read from disk rather than fetched.
 *
 * The font used to come from a version-pinned fonts.gstatic.com URL that has
 * since 404'd, and the photo was fetched over HTTP from the site's own origin.
 * Either failure produced a 500: Satori needs at least one font, so the
 * "render without a custom font" fallback could never actually render.
 */
async function loadAssets() {
  const [font, photo] = await Promise.all([
    readFile(join(process.cwd(), "src/app/fonts/SpaceGrotesk-SemiBold.ttf")),
    readFile(join(process.cwd(), "public/images/messi-og.jpg")),
  ]);

  return {
    font,
    photoDataUri: `data:image/jpeg;base64,${photo.toString("base64")}`,
  };
}

export async function renderOgCard() {
  const { font, photoDataUri } = await loadAssets();

  return new ImageResponse(
    (
      <div
        style={{
          background:
            "linear-gradient(135deg, #050505 0%, #141414 50%, #050505 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "stretch",
          justifyContent: "flex-start",
          fontFamily: "Space Grotesk",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- Satori renders
            this tree outside the DOM; next/image does not work in ImageResponse. */}
        <img
          src={photoDataUri}
          alt="With Messi at Casa Amarilla, Rosario"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "flex",
          }}
        />

        <div
          style={{
            position: "absolute",
            // Satori has no `inset` shorthand, so a div relying on it collapses
            // to zero size. The original overlays did exactly that and never
            // painted; these need explicit offsets and dimensions.
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            // Heavy at the bottom so the name stays readable over the bright
            // parts of the photo, while the top of the frame stays untinted.
            background:
              "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 72%, rgba(0,0,0,0.94) 100%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: 64,
            right: 64,
            bottom: 56,
            maxWidth: 820,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div
            style={{
              fontSize: 44,
              fontWeight: 600,
              color: "#F5F5F5",
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
              display: "flex",
              textShadow: "0 2px 18px rgba(0,0,0,0.4)",
            }}
          >
            Joan Mateo Duarte Politi
          </div>
          <div
            style={{
              fontSize: 22,
              color: "rgba(245,245,245,0.82)",
              display: "flex",
              textShadow: "0 2px 12px rgba(0,0,0,0.35)",
            }}
          >
            Rosario, football, and one of my favorite photos.
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Space Grotesk",
          data: font,
          style: "normal" as const,
          weight: 600,
        },
      ],
    }
  );
}
