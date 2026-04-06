"use client";

import { useState } from "react";
import projects from "@/data/projects.json";

function ProjectRow({
  project,
}: {
  project: (typeof projects)[number];
}) {
  const [open, setOpen] = useState(false);
  const isActive = project.status === "active";

  return (
    <div className="border-t border-border">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left group"
      >
        <div className="flex items-center gap-3">
          <h3 className="text-[17px] md:text-[18px] font-medium group-hover:opacity-70 transition-opacity">
            {project.name}
          </h3>
          <span
            className={`text-[11px] font-medium uppercase tracking-[0.1em] px-2 py-0.5 rounded-full ${
              isActive
                ? "text-emerald-400 bg-emerald-400/10"
                : "text-muted-foreground bg-muted/50"
            }`}
          >
            {isActive ? "Active" : "Past"}
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      <div
        className={`grid transition-all duration-200 ease-out ${
          open ? "grid-rows-[1fr] opacity-100 pb-4" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="text-[15px] md:text-[16px] leading-[1.7] text-muted-foreground mb-3">
            {project.description}
          </p>
          <div className="flex items-center gap-4">
            {project.link && (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] text-foreground hover:opacity-70 transition-opacity underline underline-offset-4"
              >
                View project
              </a>
            )}
            <div className="flex gap-2">
              {project.tags.map((tag) => (
                <span key={tag} className="text-[12px] text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Work() {
  return (
    <section className="pt-12 pb-6 px-4 md:px-0">
      <div className="max-w-[640px] mx-auto">
        <p className="text-[12px] font-medium uppercase tracking-[0.2em] text-muted-foreground mb-4">
          Work
        </p>
        <div>
          {projects.map((project) => (
            <ProjectRow key={project.name} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
