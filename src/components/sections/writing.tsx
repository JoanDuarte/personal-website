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
    <section className="py-16 px-4 md:px-0">
      <div className="max-w-[640px] mx-auto">
        <p className="text-[12px] md:text-[12px] font-medium uppercase tracking-[0.2em] text-muted-foreground mb-8">
          Writing
        </p>
        <div className="space-y-6">
          {posts.map((post) => (
            <a
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block pt-6 group"
            >
              <div className="flex flex-col gap-1">
                <h3 className="text-[18px] md:text-[20px] font-medium group-hover:opacity-70 transition-opacity">
                  {post.title}
                </h3>
                <p className="text-[16px] md:text-[17px] leading-[1.7] text-muted-foreground">
                  {post.description}
                </p>
                <time className="text-[13px] text-muted-foreground mt-1">
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
