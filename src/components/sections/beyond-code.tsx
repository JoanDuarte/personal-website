import Image from "next/image";
import Link from "next/link";
import bio from "@/data/bio.json";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const linkClass =
  "inline-flex min-h-11 items-center text-[14px] text-foreground underline underline-offset-4 transition-colors hover:text-primary focus-visible:outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring";

export function BeyondCode() {
  return (
    <section className="px-4 md:px-0">
      <div className="max-w-[640px] mx-auto">
        <Accordion>
          <AccordionItem value="beyond-code">
            <AccordionTrigger>Beyond code</AccordionTrigger>
            <AccordionContent>
              {/* Chess */}
              <div className="mb-8">
                <h3 className="text-[17px] md:text-[18px] font-medium mb-2">Chess</h3>
                <p className="text-[16px] md:text-[17px] leading-[1.7] text-muted-foreground mb-2">
                  {bio.chess.text}
                </p>
                <div className="flex flex-wrap gap-x-5 gap-y-1">
                  <Link href="/chess" className={linkClass}>
                    My training page
                  </Link>
                  <a
                    href={bio.chess.profileLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                  >
                    Chess.com profile
                  </a>
                </div>
              </div>

              {/* Messi */}
              <div className="mb-8">
                <h3 className="text-[17px] md:text-[18px] font-medium mb-2">Photo with Messi</h3>
                <p className="text-[16px] md:text-[17px] leading-[1.7] text-muted-foreground mb-3">
                  I&apos;m from Rosario, same city where Messi is from. Back in 2005 or 2006, he came to show a few tricks at Casa Amarilla, where I was training football. Of course, back then he was just &quot;La Pulga,&quot; a young kid who had just started playing for Barcelona.
                </p>
                <div className="rounded-[var(--radius)] overflow-hidden border border-border">
                  <Image
                    src="/images/messi.png"
                    alt="With Messi at Casa Amarilla, Rosario"
                    width={640}
                    height={400}
                    className="w-full h-auto"
                  />
                </div>
              </div>

              {/* Reading */}
              <div>
                <h3 className="text-[17px] md:text-[18px] font-medium mb-2">Reading</h3>
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
                  className={linkClass}
                >
                  Goodreads profile
                </a>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  );
}
