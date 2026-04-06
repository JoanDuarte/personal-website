import Image from "next/image";
import bio from "@/data/bio.json";
import { CollapsibleSection } from "./collapsible-section";

export function BeyondCode() {
  return (
    <CollapsibleSection title="Beyond Code">
      {/* Chess */}
      <div className="mb-8">
        <h3 className="text-[17px] md:text-[18px] font-medium mb-2">Chess</h3>
        <p className="text-[16px] md:text-[17px] leading-[1.7] text-muted-foreground mb-2">
          {bio.chess.text}
        </p>
        <a
          href={bio.chess.profileLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[14px] text-foreground hover:opacity-70 transition-opacity underline underline-offset-4"
        >
          Chess.com profile
        </a>
      </div>

      {/* Messi */}
      <div className="mb-8">
        <h3 className="text-[17px] md:text-[18px] font-medium mb-2">Photo with Messi</h3>
        <p className="text-[16px] md:text-[17px] leading-[1.7] text-muted-foreground mb-3">
          I&apos;m from Rosario, same city where Messi is from. Back in 2005 or 2006, he came to show a few tricks at Casa Amarilla, where I was training football. Of course, back then he was just &quot;La Pulga,&quot; a young kid who had just started playing for Barcelona.
        </p>
        <div className="rounded-lg overflow-hidden border border-border">
          <Image
            src="/images/messi.jpg"
            alt="With Messi at Casa Amarilla, Rosario"
            width={640}
            height={400}
            className="w-full h-auto"
          />
        </div>
      </div>

      {/* Reading */}
      <div>
        <h3 className="text-[17px] md:text-[18px] font-medium mb-2">
          Reading
        </h3>
        <p className="text-[16px] md:text-[17px] leading-[1.7] text-muted-foreground mb-3">
          {bio.reading.text}
        </p>
        <ul className="space-y-1.5 mb-3">
          {bio.reading.favorites.map((book) => (
            <li key={book.title} className="text-[15px] text-foreground">
              {book.title}
              <span className="text-muted-foreground"> — {book.author}</span>
            </li>
          ))}
        </ul>
        <a
          href={bio.reading.goodreadsLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[14px] text-foreground hover:opacity-70 transition-opacity underline underline-offset-4"
        >
          Goodreads profile
        </a>
      </div>
    </CollapsibleSection>
  );
}
