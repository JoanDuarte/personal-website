import { Hero } from "@/components/sections/hero";
import { BuildingNow } from "@/components/sections/building-now";
import { SelectedWork } from "@/components/sections/selected-work";
import { HowIThink } from "@/components/sections/how-i-think";
import { BeyondCode } from "@/components/sections/beyond-code";
import { Writing } from "@/components/sections/writing";
import { Connect } from "@/components/sections/connect";

export default function Home() {
  return (
    <main>
      <Hero />
      <BuildingNow />
      <div id="selected-work">
        <SelectedWork />
      </div>
      <div id="how-i-think">
        <HowIThink />
      </div>
      <BeyondCode />
      <Writing />
      <Connect />
    </main>
  );
}
