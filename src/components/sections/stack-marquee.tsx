import Image from "next/image";

// Every name here appears in joan-kb.md under "Technical Identity". The logos
// come from Simple Icons, monochrome, in the site's foreground color. If the
// CDN is unreachable the name still renders under the empty image slot.
const LOGOS = [
  { slug: "react", name: "React" },
  { slug: "typescript", name: "TypeScript" },
  { slug: "tailwindcss", name: "Tailwind" },
  { slug: "nextdotjs", name: "Next.js" },
  { slug: "expo", name: "Expo" },
  { slug: "supabase", name: "Supabase" },
  { slug: "postgresql", name: "Postgres" },
  { slug: "fastify", name: "Fastify" },
  { slug: "drizzle", name: "Drizzle" },
  { slug: "googlegemini", name: "Gemini" },
  { slug: "elevenlabs", name: "ElevenLabs" },
  { slug: "vercel", name: "Vercel" },
  { slug: "resend", name: "Resend" },
  { slug: "stripe", name: "Stripe" },
  { slug: "telegram", name: "Telegram" },
  { slug: "reactquery", name: "React Query" },
  { slug: "posthog", name: "PostHog" },
  { slug: "sentry", name: "Sentry" },
];

export function StackMarquee() {
  const track = [...LOGOS, ...LOGOS];
  return (
    <div className="group relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
      <div className="animate-marquee flex w-max gap-12 will-change-transform group-hover:[animation-play-state:paused]">
        {track.map((logo, i) => (
          <div
            key={`${logo.slug}-${i}`}
            aria-hidden={i >= LOGOS.length}
            className="flex w-[84px] flex-col items-center gap-2.5"
          >
            <Image
              src={`https://cdn.simpleicons.org/${logo.slug}/e8e8ea`}
              alt={i < LOGOS.length ? logo.name : ""}
              width={28}
              height={28}
              unoptimized
              className="opacity-75"
            />
            <span className="font-mono text-[11px] text-text-tertiary">{logo.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
