import { getKbSections } from "@/lib/kb";

export function HowIThink() {
  const { howIThink } = getKbSections();
  return (
    <section className="px-4 md:px-0 py-12 md:py-16">
      <div className="max-w-[640px] mx-auto">
        <h2 className="text-[24px] md:text-[28px] font-medium tracking-[-0.02em] mb-6">
          How I think
        </h2>
        <div className="space-y-4">
          {howIThink.map((paragraph) => (
            <p
              key={paragraph.slice(0, 24)}
              className="text-[16px] md:text-[17px] leading-[1.7] text-muted-foreground"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
