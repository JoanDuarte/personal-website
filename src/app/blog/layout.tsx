export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-dvh px-4 md:px-0 py-16 md:py-24">
      <article className="max-w-[640px] mx-auto">
        {children}
      </article>
      <div className="max-w-[640px] mx-auto mt-16 pt-6 border-t border-border">
        <a
          href="/"
          className="text-[14px] text-text-secondary hover:text-foreground transition-colors"
        >
          &larr; Back home
        </a>
      </div>
    </main>
  );
}
