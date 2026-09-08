import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
    <section className="px-4 md:px-0">
      <div className="max-w-[640px] mx-auto">
        <Accordion>
          <AccordionItem value="writing">
            <AccordionTrigger>Writing</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                {posts.map((post) => (
                  <a
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="block group rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <h3 className="text-[16px] md:text-[17px] font-medium transition-colors group-hover:text-primary">
                      {post.title}
                    </h3>
                    <p className="text-[14px] md:text-[15px] leading-[1.7] text-muted-foreground mt-1">
                      {post.description}
                    </p>
                    <time
                      dateTime={post.date}
                      className="font-mono text-[12px] text-text-tertiary mt-1 block"
                    >
                      {new Date(post.date + "T00:00:00").toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                  </a>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  );
}
