import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 className="text-[32px] font-semibold tracking-tight mb-6">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-[24px] font-medium tracking-tight mt-10 mb-4">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-[20px] font-medium mt-8 mb-3">{children}</h3>
    ),
    p: ({ children }) => (
      <p className="text-[17px] leading-[1.7] text-foreground mb-5">
        {children}
      </p>
    ),
    a: ({ href, children }) => (
      <a
        href={href}
        className="text-foreground underline underline-offset-4 opacity-100 hover:opacity-70 transition-opacity"
        target={href?.startsWith("http") ? "_blank" : undefined}
        rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      >
        {children}
      </a>
    ),
    ul: ({ children }) => (
      <ul className="list-disc pl-6 mb-5 space-y-1.5 text-[17px] leading-[1.7]">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal pl-6 mb-5 space-y-1.5 text-[17px] leading-[1.7]">
        {children}
      </ol>
    ),
    code: ({ children }) => (
      <code className="bg-surface px-1.5 py-0.5 rounded text-[15px] font-mono">
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre className="bg-surface border border-border rounded-lg p-4 overflow-x-auto mb-5 text-[15px]">
        {children}
      </pre>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-text-tertiary pl-4 italic text-text-secondary mb-5">
        {children}
      </blockquote>
    ),
    hr: () => <hr className="border-border my-10" />,
    ...components,
  };
}
