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
