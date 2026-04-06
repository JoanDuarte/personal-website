import { Hero } from "@/components/sections/hero";
import { BuildingNow } from "@/components/sections/building-now";
import { SelectedWork } from "@/components/sections/selected-work";
import { HowIThink } from "@/components/sections/how-i-think";
import { BeyondCode } from "@/components/sections/beyond-code";
import { Writing } from "@/components/sections/writing";
import { Connect } from "@/components/sections/connect";
import { Footer } from "@/components/sections/footer";
import { RevealOnScroll } from "@/components/reveal-on-scroll";

export default function Home() {
  return (
    <main>
      <Hero />

      <div className="border-t border-border">
        <RevealOnScroll>
          <BuildingNow />
        </RevealOnScroll>
      </div>

      <div id="selected-work" className="border-t border-border">
        <RevealOnScroll>
          <SelectedWork />
        </RevealOnScroll>
      </div>

      <div id="how-i-think" className="border-t border-border">
        <RevealOnScroll>
          <HowIThink />
        </RevealOnScroll>
      </div>

      <div className="border-t border-border">
        <RevealOnScroll>
          <BeyondCode />
        </RevealOnScroll>
      </div>

      <div className="border-t border-border">
        <RevealOnScroll>
          <Writing />
        </RevealOnScroll>
      </div>

      <div className="border-t border-border">
        <RevealOnScroll>
          <Connect />
        </RevealOnScroll>
      </div>

      <Footer />
    </main>
  );
}
