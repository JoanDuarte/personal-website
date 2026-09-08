"use client";

import { useState } from "react";
import Image from "next/image";
import projects from "@/data/projects.json";
import { SpotlightCard } from "@/components/motion/spotlight-card";
import { CountUp } from "@/components/motion/count-up";
import { Badge } from "@/components/ui/badge";
import { ProjectLink } from "@/components/project-link";
import { cn } from "@/lib/utils";

type Project = (typeof projects)[number];

function ProjectLogo({ project }: { project: Project }) {
  const [failed, setFailed] = useState(false);
  return (
    <span className="relative shrink-0">
      <span aria-hidden className="absolute inset-0 rounded-xl bg-foreground/10 blur-md" />
      {failed || !project.logo ? (
        <span className="relative flex size-11 items-center justify-center rounded-xl bg-muted text-[15px] font-medium text-muted-foreground">
          {project.name[0]}
        </span>
      ) : (
        <Image
          src={project.logo}
          alt={`${project.name} logo`}
          width={44}
          height={44}
          className="relative rounded-xl"
          onError={() => setFailed(true)}
        />
      )}
    </span>
  );
}

// Each active project's own description carries one figure worth making large.
// These are those figures, taken verbatim from projects.json; the labels are the
// words around them there. Nothing is added.
function Figure({ name }: { name: string }) {
  const big = "font-mono text-[44px] md:text-[56px] leading-none tracking-[-0.03em] text-primary";
  const small = "mt-2 font-mono text-[12px] text-text-tertiary";
  switch (name) {
    case "Verelyn":
      return (
        <div>
          <div className={big}>07:00</div>
          <p className={small}>one briefing, every morning</p>
        </div>
      );
    case "Flare":
      return (
        <div className="flex gap-6">
          {[
            [29, "database tables"],
            [23, "Edge Functions"],
            [3, "AI agents"],
          ].map(([n, label]) => (
            <div key={label}>
              <CountUp to={n as number} className={cn(big, "text-[36px] md:text-[44px]")} />
              <p className={small}>{label}</p>
            </div>
          ))}
        </div>
      );
    case "Privé":
      return (
        <div>
          <div className={big}>0%</div>
          <p className={small}>on every plan and every method</p>
        </div>
      );
    case "Inception":
      return (
        <div>
          <CountUp to={500} suffix="k" className={big} />
          <p className={small}>in ASICs</p>
        </div>
      );
    default:
      return null;
  }
}

function Panel({ project, wide }: { project: Project; wide?: boolean }) {
  return (
    <SpotlightCard className={cn("h-full", wide && "md:col-span-2")}>
      <div className={cn("flex flex-col gap-6", wide && "md:flex-row md:items-start md:justify-between md:gap-10")}>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <ProjectLogo project={project} />
            <h3 className="text-[20px] font-medium tracking-[-0.01em]">{project.name}</h3>
            <Badge variant="active">Active</Badge>
          </div>
          <p className="mt-4 text-[15px] text-foreground/90">{project.tagline}</p>
          <p className="mt-3 text-[14px] leading-[1.65] text-muted-foreground">
            {project.description}
          </p>
          <p className="mt-4 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[12px] text-text-tertiary">
            <span>{project.date}</span>
            {project.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </p>
          {project.link && (
            <div className="mt-2">
              <ProjectLink href={project.link} />
            </div>
          )}
        </div>
        <div className={cn("shrink-0", wide && "md:pt-1 md:text-right")}>
          <Figure name={project.name} />
        </div>
      </div>
    </SpotlightCard>
  );
}

// Flagship wide, two products, then the engine that funds them, wide. The past
// projects live in the timeline below.
export function Work() {
  const active = projects.filter((p) => p.status === "active");
  const wide = new Set(["Verelyn", "Inception"]);

  return (
    <section className="py-12 md:py-16 px-4 md:px-0">
      <div className="max-w-[640px] mx-auto">
        <h2 className="text-[24px] md:text-[28px] font-medium tracking-[-0.02em] mb-8">
          Work
        </h2>
      </div>
      <div className="max-w-[960px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        {active.map((project) => (
          <Panel key={project.name} project={project} wide={wide.has(project.name)} />
        ))}
      </div>
    </section>
  );
}

