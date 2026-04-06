import projects from "@/data/projects.json";

export function SelectedWork() {
  return (
    <section className="py-16 px-4 md:px-0">
      <div className="max-w-[640px] mx-auto">
        <p className="text-[12px] font-medium uppercase tracking-[0.2em] text-muted-foreground mb-8">
          Selected Work
        </p>
        <div className="space-y-8">
          {projects.map((project) => (
            <div
              key={project.name}
              className="pt-6 rounded-lg hover:-translate-y-0.5 hover:shadow-[0_4px_20px_oklch(0.84_0.13_66_/_0.08)]"
              style={{
                transition: "transform 200ms ease-out, box-shadow 200ms ease-out",
              }}
            >
              <div className="flex flex-col gap-2">
                <h3 className="text-[20px] font-medium">
                  {project.name}
                </h3>
                <p className="text-[16px] md:text-[17px] leading-[1.7] text-muted-foreground">
                  {project.description}
                </p>
                <div className="flex items-center gap-4 mt-1">
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[14px] text-foreground hover:opacity-70 transition-opacity underline underline-offset-4"
                  >
                    View project
                  </a>
                  <div className="flex gap-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[13px] text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
