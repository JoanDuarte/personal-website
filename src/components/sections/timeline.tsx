import projects from "@/data/projects.json";
import { TimelineFrame } from "@/components/motion/timeline-frame";
import { Reveal } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { ProjectLink } from "@/components/project-link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const startYear = (date: string) => parseInt(date.slice(0, 4), 10);

// All nine projects in the order they started, from projects.json. The sort is
// stable, so two projects from the same year keep their file order.
const items = [...projects].sort((a, b) => startYear(a.date) - startYear(b.date));

export function Timeline() {
  return (
    <section className="px-4 md:px-0 py-20 md:py-28">
      <div className="max-w-[640px] mx-auto">
        <h2 className="text-[24px] md:text-[28px] font-medium tracking-[-0.02em] mb-10">
          How I got here
        </h2>
        <TimelineFrame>
          <Accordion>
            {items.map((project) => {
              const active = project.status === "active";
              return (
                <Reveal key={project.name}>
                  <AccordionItem value={project.name} className="relative border-0 pl-10">
                    <span
                      aria-hidden
                      className={
                        active
                          ? "absolute left-0 top-[19px] size-[15px] rounded-full border-2 border-primary bg-background"
                          : "absolute left-0 top-[19px] size-[15px] rounded-full border-2 border-border bg-background"
                      }
                    />
                    <AccordionTrigger className="py-4 text-[15px] text-foreground hover:text-foreground">
                      <span className="flex min-w-0 flex-1 items-center gap-3">
                        <span className="w-[96px] shrink-0 font-mono text-[12px] text-text-tertiary">
                          {project.date}
                        </span>
                        <span className="font-medium">{project.name}</span>
                        <span className="hidden truncate text-[14px] text-muted-foreground sm:inline">
                          {project.tagline}
                        </span>
                        <Badge variant={active ? "active" : "past"} className="ml-auto shrink-0">
                          {active ? "Active" : "Past"}
                        </Badge>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-6">
                      <p className="mb-2 text-[14px] leading-[1.65] text-muted-foreground sm:hidden">
                        {project.tagline}
                      </p>
                      <p className="mb-2 text-[15px] leading-[1.65] text-muted-foreground">
                        {project.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
                        {project.link && <ProjectLink href={project.link} />}
                        <p className="flex flex-wrap gap-x-3 font-mono text-[12px] text-text-tertiary">
                          {project.tags.map((tag) => (
                            <span key={tag}>{tag}</span>
                          ))}
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Reveal>
              );
            })}
          </Accordion>
        </TimelineFrame>
      </div>
    </section>
  );
}
