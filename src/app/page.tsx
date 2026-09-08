import { Hero } from "@/components/sections/hero";
import { Story } from "@/components/sections/story";
import { Work } from "@/components/sections/work";
import { Timeline } from "@/components/sections/timeline";
import { HowIThink } from "@/components/sections/how-i-think";
import { BuildsWith } from "@/components/sections/builds-with";
import { BeyondCode } from "@/components/sections/beyond-code";
import { Writing } from "@/components/sections/writing";
import { Footer } from "@/components/sections/footer";
import { Reveal } from "@/components/motion/reveal";
import { ScrollProgress } from "@/components/motion/scroll-progress";

export default function Home() {
  return (
    <main>
      <ScrollProgress />
      <Hero />
      <Reveal>
        <Story />
      </Reveal>
      <Reveal>
        <div id="work">
          <Work />
        </div>
      </Reveal>
      <Timeline />
      <Reveal>
        <HowIThink />
      </Reveal>
      <Reveal>
        <BuildsWith />
      </Reveal>
      <Reveal>
        <BeyondCode />
      </Reveal>
      <Reveal>
        <Writing />
      </Reveal>
      <Footer />
    </main>
  );
}
