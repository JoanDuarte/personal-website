"use client";

import { useState } from "react";
import Image from "next/image";
import projects from "@/data/projects.json";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type Project = (typeof projects)[number];

function ProjectLogo({ project, size = 28 }: { project: Project; size?: number }) {
  const [failed, setFailed] = useState(false);

  if (failed || !project.logo) {
    return (
      <span
        className="rounded-md bg-muted flex items-center justify-center text-[13px] font-medium text-muted-foreground shrink-0"
        style={{ width: size, height: size }}
      >
        {project.name[0]}
      </span>
    );
  }

  return (
    <Image
      src={project.logo}
      alt={`${project.name} logo`}
      width={size}
      height={size}
      className="rounded-md shrink-0"
      onError={() => setFailed(true)}
    />
  );
}

function Meta({ project }: { project: Project }) {
  return (
    <p className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-[12px] text-text-tertiary">
      <span>{project.date}</span>
      {project.tags.map((tag) => (
        <span key={tag}>{tag}</span>
      ))}
    </p>
  );
}

function ProjectLink({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-11 items-center text-[14px] text-foreground underline underline-offset-4 transition-colors hover:text-primary focus-visible:outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring"
    >
      View project
    </a>
  );
}

// The four active projects are the point of the page, so they get panels and
// their full description. Past ones are a compact list that opens on demand.
function ActiveCard({ project }: { project: Project }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <ProjectLogo project={project} />
          <CardTitle className="text-[17px]">{project.name}</CardTitle>
          <Badge variant="active">Active</Badge>
        </div>
        <CardDescription className="text-[14px] text-muted-foreground">
          {project.tagline}
        </CardDescription>
        <Meta project={project} />
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <p className="text-[14px] leading-[1.65] text-muted-foreground">
          {project.description}
        </p>
        {project.link && (
          <div className="mt-auto">
            <ProjectLink href={project.link} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PastRow({ project }: { project: Project }) {
  return (
    <AccordionItem value={project.name} className="border-0">
      <AccordionTrigger className="py-3 text-[15px] text-foreground hover:text-foreground">
        <span className="flex min-w-0 flex-1 items-center gap-3">
          <ProjectLogo project={project} size={24} />
          <span className="font-medium">{project.name}</span>
          <span className="hidden truncate text-[14px] text-muted-foreground sm:inline">
            {project.tagline}
          </span>
          <span className="ml-auto shrink-0 font-mono text-[12px] text-text-tertiary">
            {project.date}
          </span>
        </span>
      </AccordionTrigger>
      <AccordionContent className="pl-9 pb-5">
        <p className="text-[14px] leading-[1.65] text-muted-foreground sm:hidden mb-2">
          {project.tagline}
        </p>
        <p className="text-[15px] leading-[1.65] text-muted-foreground mb-2">
          {project.description}
        </p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
          {project.link && <ProjectLink href={project.link} />}
          <Meta project={project} />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

export function Work() {
  const active = projects.filter((p) => p.status === "active");
  const past = projects.filter((p) => p.status !== "active");

  return (
    <section className="py-20 md:py-28 px-4 md:px-0">
      <div className="max-w-[640px] mx-auto">
        <h2 className="text-[24px] md:text-[28px] font-medium tracking-[-0.02em] mb-2">
          Work
        </h2>
        <h3 className="text-[13px] font-medium text-text-tertiary mb-5">
          Active
        </h3>
      </div>

      {/* The grid breaks out to 960px, centered, so it is wider than the prose
          column by the same amount on both sides. */}
      <div className="max-w-[960px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        {active.map((project) => (
          <ActiveCard key={project.name} project={project} />
        ))}
      </div>

      <div className="max-w-[640px] mx-auto">
        <Separator className="my-12" />
        <h3 className="text-[13px] font-medium text-text-tertiary mb-2">
          Past
        </h3>
        <Accordion>
          {past.map((project) => (
            <PastRow key={project.name} project={project} />
          ))}
        </Accordion>
      </div>
    </section>
  );
}
