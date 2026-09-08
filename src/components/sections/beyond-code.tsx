import Image from "next/image";
import Link from "next/link";
import bio from "@/data/bio.json";
import { SpotlightCard } from "@/components/motion/spotlight-card";

const linkClass =
  "inline-flex min-h-11 items-center text-[14px] text-foreground underline underline-offset-4 transition-colors hover:text-primary focus-visible:outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring";

// The site's one real photograph, out of the accordion it used to live in.
export function BeyondCode() {
  return (
    <section className="px-4 md:px-0 py-12 md:py-16">
      <div className="max-w-[640px] mx-auto">
        <h2 className="text-[24px] md:text-[28px] font-medium tracking-[-0.02em] mb-10">
          Beyond code
        </h2>
      </div>
      {/* Like the Work grid: the heading sits in the prose column, the media
          breaks out to 960px by the same amount on both sides. */}
      <div className="max-w-[960px] mx-auto">
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12">
          <div className="overflow-hidden rounded-[var(--radius)] border border-border">
            <Image
              src="/images/messi.png"
              alt="With Messi at Casa Amarilla, Rosario"
              width={640}
              height={400}
              className="h-auto w-full"
            />
          </div>
          <div>
            <h3 className="text-[20px] font-medium tracking-[-0.01em] mb-3">Photo with Messi</h3>
            <p className="text-[16px] md:text-[17px] leading-[1.7] text-muted-foreground">
              I&apos;m from Rosario, same city where Messi is from. Back in 2005 or 2006, he came to show a few tricks at Casa Amarilla, where I was training football. Of course, back then he was just &quot;La Pulga,&quot; a young kid who had just started playing for Barcelona.
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          <SpotlightCard>
            <h3 className="text-[20px] font-medium tracking-[-0.01em]">Chess</h3>
            <p className="text-[15px] leading-[1.7] text-muted-foreground">{bio.chess.text}</p>
            <div className="flex flex-wrap gap-x-5">
              <Link href="/chess" className={linkClass}>
                My training page
              </Link>
              <a href={bio.chess.profileLink} target="_blank" rel="noopener noreferrer" className={linkClass}>
                Chess.com profile
              </a>
            </div>
          </SpotlightCard>

          <SpotlightCard>
            <h3 className="text-[20px] font-medium tracking-[-0.01em]">Reading</h3>
            <p className="text-[15px] leading-[1.7] text-muted-foreground">{bio.reading.text}</p>
            <ul className="space-y-1.5">
              {bio.reading.favorites.map((book) => (
                <li key={book.title} className="text-[15px] text-foreground">
                  {book.title}
                  <span className="text-muted-foreground"> — {book.author}</span>
                </li>
              ))}
            </ul>
            <a href={bio.reading.goodreadsLink} target="_blank" rel="noopener noreferrer" className={linkClass}>
              Goodreads profile
            </a>
          </SpotlightCard>
        </div>
      </div>
    </section>
  );
}
