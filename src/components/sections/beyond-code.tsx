import bio from "@/data/bio.json";

export function BeyondCode() {
  return (
    <section className="py-16 px-4 md:px-0">
      <div className="max-w-[640px] mx-auto">
        <p className="text-[12px] md:text-[12px] font-medium uppercase tracking-[0.2em] text-text-secondary mb-8">
          Beyond Code
        </p>

        {/* Chess */}
        <div className="border-t border-border pt-6 mb-10">
          <h3 className="text-[20px] md:text-[20px] font-medium mb-3">
            Chess
          </h3>
          <p className="text-[16px] md:text-[17px] leading-[1.7] text-text-secondary mb-3">
            {bio.chess.text}
          </p>
          <a
            href={bio.chess.profileLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[14px] text-foreground opacity-100 hover:opacity-70 transition-opacity underline underline-offset-4"
          >
            Chess.com profile
          </a>
        </div>

        {/* Books */}
        <div className="border-t border-border pt-6">
          <h3 className="text-[20px] md:text-[20px] font-medium mb-4">
            Reading
          </h3>
          <ul className="space-y-3">
            {bio.books.map((book) => (
              <li key={book.title} className="flex flex-col">
                <span className="text-[16px] md:text-[17px] text-foreground">
                  {book.title}
                </span>
                <span className="text-[14px] text-text-tertiary">
                  {book.author}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
