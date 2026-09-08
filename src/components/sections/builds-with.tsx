import { getKbSections } from "@/lib/kb";
import { StackMarquee } from "@/components/sections/stack-marquee";

export function BuildsWith() {
  const { buildsWithIntro, buildsWith } = getKbSections();
  return (
    <section className="px-4 md:px-0 py-20 md:py-28">
      <div className="max-w-[640px] mx-auto">
        <h2 className="text-[24px] md:text-[28px] font-medium tracking-[-0.02em] mb-4">
          What I build with
        </h2>
        <p className="text-[16px] md:text-[17px] leading-[1.7] text-muted-foreground mb-10">
          {buildsWithIntro}
        </p>
      </div>
      <div className="max-w-[960px] mx-auto mb-12">
        <StackMarquee />
      </div>
      <div className="max-w-[640px] mx-auto">
        <dl className="grid grid-cols-1 md:grid-cols-[136px_1fr] gap-x-6 gap-y-5">
          {buildsWith.map(({ label, value }) => (
            <div key={label} className="contents">
              <dt className="font-mono text-[12px] text-text-tertiary md:pt-1">
                {label}
              </dt>
              <dd className="text-[15px] leading-[1.6] text-muted-foreground">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
