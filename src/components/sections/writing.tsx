import { CollapsibleSection } from "./collapsible-section";

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
    <CollapsibleSection title="Writing">
      <div className="space-y-4">
        {posts.map((post) => (
          <a
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block group"
          >
            <h3 className="text-[16px] md:text-[17px] font-medium group-hover:opacity-70 transition-opacity">
              {post.title}
            </h3>
            <p className="text-[14px] md:text-[15px] leading-[1.7] text-muted-foreground mt-1">
              {post.description}
            </p>
            <time className="text-[12px] text-muted-foreground mt-1 block">
              {new Date(post.date + "T00:00:00").toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </a>
        ))}
      </div>
    </CollapsibleSection>
  );
}
