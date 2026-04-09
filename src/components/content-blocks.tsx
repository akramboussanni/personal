import { ContentBlock } from "@/lib/types";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = {
  blocks: ContentBlock[];
};

const EXTERNAL_LINK_CLASS =
  "relative inline-block font-semibold text-on-surface transition-colors duration-300 hover:text-surface-tint focus-visible:text-surface-tint after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-[var(--accent)] after:transition-transform after:duration-300 hover:after:scale-x-100 focus-visible:after:scale-x-100";

const INTERNAL_LINK_CLASS =
  "relative inline-block font-semibold text-white transition-colors duration-300 hover:text-[var(--accent)] focus-visible:text-[var(--accent)] after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-[var(--accent)] after:transition-transform after:duration-300 hover:after:scale-x-100 focus-visible:after:scale-x-100";

function isInternalHref(href: string) {
  return (href.startsWith("/") && !href.startsWith("//")) || href.startsWith("#");
}

function renderInlineLink(href: string | undefined, children: React.ReactNode) {
  if (!href) {
    return <>{children}</>;
  }

  if (isInternalHref(href)) {
    return (
      <Link href={href} className={INTERNAL_LINK_CLASS}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} target="_blank" rel="noreferrer" className={EXTERNAL_LINK_CLASS}>
      {children}
    </a>
  );
}

export function ContentBlocks({ blocks }: Props) {
  return (
    <div className="space-y-6">
      {blocks.map((block, idx) => {
        if (block.type === "paragraph") {
          return (
            <ReactMarkdown
              key={idx}
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => <h1 className="font-headline text-3xl uppercase tracking-tight text-on-surface mb-3">{children}</h1>,
                h2: ({ children }) => <h2 className="font-headline text-2xl uppercase tracking-tight text-on-surface mb-2">{children}</h2>,
                h3: ({ children }) => <h3 className="font-headline text-xl uppercase tracking-tight text-on-surface mb-2">{children}</h3>,
                h4: ({ children }) => <h4 className="font-headline text-lg uppercase tracking-tight text-on-surface mb-1">{children}</h4>,
                p: ({ children }) => <p className="leading-8 text-on-surface">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-6 space-y-1 text-on-surface">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-6 space-y-1 text-on-surface">{children}</ol>,
                a: ({ href, children }) => renderInlineLink(href, children),
              }}
            >
              {block.text}
            </ReactMarkdown>
          );
        }

        if (block.type === "quote") {
          return (
            <blockquote
              key={idx}
              className="border-l-2 border-[var(--accent)] pl-5 text-xl font-semibold leading-8"
            >
              {block.text}
            </blockquote>
          );
        }

        return (
          <figure key={idx} className="space-y-2">
            {block.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={block.url}
                alt={block.caption || "content image"}
                className="w-full rounded-none border border-outline-variant/30 object-cover"
              />
            ) : (
              <div className="w-full border border-dashed border-outline-variant/40 p-4 text-xs uppercase tracking-[0.14em] text-on-surface-variant">
                Image block with empty URL
              </div>
            )}
            {block.caption ? (
              <figcaption className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">
                {block.caption}
              </figcaption>
            ) : null}
          </figure>
        );
      })}
    </div>
  );
}
