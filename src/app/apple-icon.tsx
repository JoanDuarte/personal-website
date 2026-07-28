import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function Icon() {
  // Read from disk instead of fetching the site's own origin over HTTP, which
  // broke whenever NEXT_PUBLIC_SITE_URL was unset or pointed at a stale deploy.
  const avatar = await readFile(
    join(process.cwd(), "public/images/joan-avatar.jpg")
  );

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
          src={`data:image/jpeg;base64,${avatar.toString("base64")}`}
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
