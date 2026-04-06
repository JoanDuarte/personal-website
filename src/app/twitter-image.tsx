import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Joan Mateo Duarte Politi — Full-Stack Builder";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://personal-website-iota-two-42.vercel.app";
const messiImageUrl = new URL("/images/messi.png", siteUrl).toString();

export default async function Image() {
  let spaceGrotesk: ArrayBuffer | undefined;
  try {
    const res = await fetch(
      new URL(
        "https://fonts.gstatic.com/s/spacegrotesk/v16/V8mDoQDjQSkFtoMM3T6r8E7mPbF4Cw.woff"
      )
    );
    if (res.ok) spaceGrotesk = await res.arrayBuffer();
  } catch {
    // Fall through — render without custom font
  }

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
          justifyContent: "stretch",
          fontFamily: "Space Grotesk",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 70% 30%, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.04) 28%, transparent 58%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.55) 100%)",
          }}
        />

        <img
          src={messiImageUrl}
          alt="With Messi at Casa Amarilla, Rosario"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "flex",
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
      fonts: spaceGrotesk
        ? [
            {
              name: "Space Grotesk",
              data: spaceGrotesk,
              style: "normal" as const,
              weight: 600,
            },
          ]
        : [],
    }
  );
}
