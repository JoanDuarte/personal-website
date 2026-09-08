import bio from "@/data/bio.json";

// The three paragraphs that used to sit inside the hero. They read better as
// the first thing after it than as the fourth thing inside it.
export function Story() {
  return (
    <section className="px-4 md:px-0 py-8 md:py-10">
      <div className="max-w-[640px] mx-auto space-y-4">
        {bio.story.map((paragraph) => (
          <p
            key={paragraph.slice(0, 24)}
            className="text-[16px] md:text-[17px] leading-[1.7] text-muted-foreground"
          >
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}
