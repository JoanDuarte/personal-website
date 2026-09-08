import { SpotlightCard } from "@/components/motion/spotlight-card";

const posts = [
  {
    title: "Building with Conviction",
    slug: "building-with-conviction",
    date: "2026-04-01",
    description:
      "Why the best products come from builders who refuse to hedge.",
  },
];

export function Writing() {
  return (
    <section className="px-4 md:px-0 py-20 md:py-28">
      <div className="max-w-[640px] mx-auto">
        <h2 className="text-[24px] md:text-[28px] font-medium tracking-[-0.02em] mb-8">
          Writing
        </h2>
        <div className="space-y-4">
          {posts.map((post) => (
            <a
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block rounded-[var(--radius)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <SpotlightCard>
                <h3 className="text-[18px] font-medium tracking-[-0.01em] transition-colors group-hover:text-primary">
                  {post.title}
                </h3>
                <p className="text-[15px] leading-[1.7] text-muted-foreground">{post.description}</p>
                <time dateTime={post.date} className="block font-mono text-[12px] text-text-tertiary">
                  {new Date(post.date + "T00:00:00").toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </SpotlightCard>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
