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

      {/* Books */}
      <div>
        <h3 className="text-[17px] md:text-[18px] font-medium mb-3">
          Reading
        </h3>
        <ul className="space-y-2">
          {bio.books.map((book) => (
            <li key={book.title} className="flex flex-col">
              <span className="text-[16px] md:text-[17px] text-foreground">
                {book.title}
              </span>
              <span className="text-[14px] text-muted-foreground">
                {book.author}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </CollapsibleSection>
  );
}
