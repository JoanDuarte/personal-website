const links = [
  { label: "GitHub", href: "https://github.com/JMDuarte" },
  { label: "LinkedIn", href: "https://linkedin.com/in/JMDuarte" },
  { label: "X / Twitter", href: "https://x.com/JMDuarte" },
  { label: "Email", href: "mailto:hello@jmduarte.com" },
];

export function Connect() {
  return (
    <section className="py-16 pb-24 px-4 md:px-0">
      <div className="max-w-[640px] mx-auto">
        <p className="text-[12px] md:text-[12px] font-medium uppercase tracking-[0.2em] text-text-secondary mb-8">
          Connect
        </p>
        <div className="flex flex-wrap gap-3">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.href.startsWith("mailto") ? undefined : "_blank"}
              rel={
                link.href.startsWith("mailto")
                  ? undefined
                  : "noopener noreferrer"
              }
              className="inline-flex items-center px-4 py-2.5 text-[15px] font-medium border border-[rgba(255,255,255,0.1)] rounded-full hover:border-[rgba(255,255,255,0.3)] hover:bg-[rgba(255,255,255,0.03)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
