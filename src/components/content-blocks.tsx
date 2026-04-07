import { ContentBlock } from "@/lib/types";

type Props = {
  blocks: ContentBlock[];
};

export function ContentBlocks({ blocks }: Props) {
  return (
    <div className="space-y-6">
      {blocks.map((block, idx) => {
        if (block.type === "paragraph") {
          return (
            <p key={idx} className="leading-8 text-[var(--muted)]">
              {block.text}
            </p>
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
                className="w-full rounded-none border border-[var(--border)] object-cover"
              />
            ) : (
              <div className="w-full border border-dashed border-outline-variant/40 p-4 text-xs uppercase tracking-[0.14em] text-on-surface-variant">
                Image block with empty URL
              </div>
            )}
            {block.caption ? (
              <figcaption className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                {block.caption}
              </figcaption>
            ) : null}
          </figure>
        );
      })}
    </div>
  );
}
