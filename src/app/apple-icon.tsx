import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

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
          borderRadius: 40,
        }}
      >
        {/* Outer glow */}
        <div
          style={{
            position: "absolute",
            width: 160,
            height: 160,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)",
            display: "flex",
          }}
        />
        {/* Orb */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.4) 30%, rgba(255,255,255,0.08) 60%, transparent 80%)",
            boxShadow: "0 0 40px 15px rgba(255,255,255,0.08)",
            display: "flex",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
