import { Hero } from "@/components/sections/hero";
import { Work } from "@/components/sections/work";
import { HowIThink } from "@/components/sections/how-i-think";
import { BeyondCode } from "@/components/sections/beyond-code";
import { Writing } from "@/components/sections/writing";
import { Connect } from "@/components/sections/connect";
import { Footer } from "@/components/sections/footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <div id="work">
        <Work />
      </div>
      <HowIThink />
      <BeyondCode />
      <Writing />
      <Connect />
      <Footer />
    </main>
  );
}
