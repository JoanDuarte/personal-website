import { Hero } from "@/components/sections/hero";
import { Work } from "@/components/sections/work";
import { BeyondCode } from "@/components/sections/beyond-code";
import { Writing } from "@/components/sections/writing";
import { Footer } from "@/components/sections/footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <div id="work">
        <Work />
      </div>
      <BeyondCode />
      <Writing />
      <Footer />
    </main>
  );
}
