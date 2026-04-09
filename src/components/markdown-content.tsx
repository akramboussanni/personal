import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = {
  content: string;
  className?: string;
};

export function MarkdownContent({ content, className }: Props) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="mb-4 leading-8 text-on-surface">{children}</p>,
          h1: ({ children }) => <h1 className="font-headline text-3xl uppercase tracking-tight mb-4">{children}</h1>,
          h2: ({ children }) => <h2 className="font-headline text-2xl uppercase tracking-tight mb-3">{children}</h2>,
          h3: ({ children }) => <h3 className="font-headline text-xl uppercase tracking-tight mb-2">{children}</h3>,
          ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-1 text-on-surface">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-1 text-on-surface">{children}</ol>,
          blockquote: ({ children }) => <blockquote className="border-l-2 border-[var(--accent)] pl-4 italic mb-4 text-on-surface">{children}</blockquote>,
          code: ({ children }) => <code className="bg-surface-container-low border border-outline-variant/30 px-1 py-0.5 text-sm text-on-surface">{children}</code>,
          a: ({ href, children }) => <a href={href} className="underline text-on-surface hover:text-[var(--accent)]">{children}</a>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
