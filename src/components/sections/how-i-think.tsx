import bio from "@/data/bio.json";

export function HowIThink() {
  return (
    <section className="py-24 px-4 md:px-0">
      <div className="max-w-[640px] mx-auto">
        <p className="text-[12px] md:text-[12px] font-medium uppercase tracking-[0.2em] text-text-secondary mb-8">
          How I Think
        </p>
        <div className="space-y-5">
          {bio.story.map((paragraph, i) => (
            <p
              key={i}
              className="text-[16px] md:text-[17px] leading-[1.7] text-foreground"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
