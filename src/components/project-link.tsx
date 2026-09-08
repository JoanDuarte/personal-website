export function ProjectLink({ href }: { href: string }) {
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
