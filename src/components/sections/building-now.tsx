import bio from "@/data/bio.json";

export function BuildingNow() {
  const { currentBuild } = bio;

  return (
    <section className="py-24 px-4 md:px-0">
      <div className="max-w-[640px] mx-auto">
        <p className="text-[12px] md:text-[12px] font-medium uppercase tracking-[0.2em] text-text-secondary mb-8">
          What I&apos;m Building
        </p>
        <div className="border-t border-border pt-6">
          <h3 className="text-[20px] md:text-[20px] font-medium mb-3">
            {currentBuild.name}
          </h3>
          <p className="text-[16px] md:text-[17px] leading-[1.7] text-text-secondary mb-4">
            {currentBuild.description}
          </p>
          <a
            href={currentBuild.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[14px] text-foreground opacity-100 hover:opacity-70 transition-opacity underline underline-offset-4"
          >
            View on GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
