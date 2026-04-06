import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://personal-website-iota-two-42.vercel.app";
const avatarUrl = new URL("/images/joan-avatar.jpg", siteUrl).toString();

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#050505",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 44,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 50% 40%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 40%, transparent 70%)",
          }}
        />
        <img
          src={avatarUrl}
          alt="Joan Mateo Duarte Politi"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "flex",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
