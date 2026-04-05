import projects from "@/data/projects.json";

export function SelectedWork() {
  return (
    <section className="py-16 px-4 md:px-0">
      <div className="max-w-[768px] mx-auto">
        <p className="text-[12px] md:text-[12px] font-medium uppercase tracking-[0.2em] text-text-secondary mb-8">
          Selected Work
        </p>
        <div className="space-y-8">
          {projects.map((project) => (
            <div key={project.name} className="border-t border-border pt-6">
              <div className="flex flex-col gap-2">
                <h3 className="text-[20px] md:text-[20px] font-medium">
                  {project.name}
                </h3>
                <p className="text-[16px] md:text-[17px] leading-[1.7] text-text-secondary">
                  {project.description}
                </p>
                <div className="flex items-center gap-4 mt-1">
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[14px] text-foreground opacity-100 hover:opacity-70 transition-opacity underline underline-offset-4"
                  >
                    View project
                  </a>
                  <div className="flex gap-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[13px] text-text-tertiary"
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
