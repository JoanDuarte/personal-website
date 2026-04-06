import bio from "@/data/bio.json";
import { CollapsibleSection } from "./collapsible-section";

export function HowIThink() {
  return (
    <CollapsibleSection title="How I Think" id="how-i-think">
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
    </CollapsibleSection>
  );
}
