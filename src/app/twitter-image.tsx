import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Joan Mateo Duarte Politi — Full-Stack Builder";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const spaceGrotesk = await fetch(
    new URL(
      "https://fonts.gstatic.com/s/spacegrotesk/v16/V8mDoQDjQSkFtoMM3T6r8E7mPbF4Cw.woff"
    )
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          background: "#050505",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Space Grotesk",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Orb glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 40%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Inner orb */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.12) 40%, transparent 70%)",
            boxShadow: "0 0 80px 30px rgba(255,255,255,0.06)",
            marginBottom: 40,
            display: "flex",
          }}
        />

        {/* Name */}
        <div
          style={{
            fontSize: 48,
            fontWeight: 600,
            color: "#F5F5F5",
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
            display: "flex",
          }}
        >
          Joan Mateo Duarte Politi
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 22,
            color: "#999999",
            marginTop: 16,
            display: "flex",
          }}
        >
          I build products where AI, systems, and interface design meet.
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Space Grotesk",
          data: spaceGrotesk,
          style: "normal",
          weight: 600,
        },
      ],
    }
  );
}
