"use client";

import { ContentBlock } from "@/lib/types";

type Props = {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
};

export function ContentBlocksEditor({ blocks, onChange }: Props) {
  function updateBlock(index: number, next: ContentBlock) {
    const clone = [...blocks];
    clone[index] = next;
    onChange(clone);
  }

  function removeBlock(index: number) {
    const clone = blocks.filter((_, i) => i !== index);
    onChange(clone);
  }

  function addBlock(type: ContentBlock["type"]) {
    if (type === "paragraph") {
      onChange([...blocks, { type: "paragraph", text: "" }]);
      return;
    }

    if (type === "quote") {
      onChange([...blocks, { type: "quote", text: "" }]);
      return;
    }

    onChange([...blocks, { type: "image", url: "", caption: "" }]);
  }

  return (
    <div className="space-y-3">
      {blocks.map((block, index) => (
        <div key={index} className="border border-outline-variant/30 bg-surface-container-low p-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <select
              value={block.type}
              onChange={(e) => {
                const type = e.target.value as ContentBlock["type"];
                if (type === "paragraph") {
                  updateBlock(index, { type: "paragraph", text: "" });
                } else if (type === "quote") {
                  updateBlock(index, { type: "quote", text: "" });
                } else {
                  updateBlock(index, { type: "image", url: "", caption: "" });
                }
              }}
              className="bg-surface-container-high border border-outline-variant/40 p-2 text-xs"
            >
              <option value="paragraph">Paragraph</option>
              <option value="quote">Quote</option>
              <option value="image">Image</option>
            </select>
            <button
              type="button"
              onClick={() => removeBlock(index)}
              className="text-xs uppercase tracking-widest border border-outline-variant/40 px-3 py-2 hover:border-[var(--accent)]"
            >
              Remove Block
            </button>
          </div>

          {block.type === "image" ? (
            <>
              <input
                value={block.url}
                onChange={(e) => updateBlock(index, { ...block, url: e.target.value })}
                className="w-full bg-surface-container-high border border-outline-variant/40 p-2 text-xs"
                placeholder="Image URL"
              />
              <input
                value={block.caption || ""}
                onChange={(e) => updateBlock(index, { ...block, caption: e.target.value })}
                className="w-full bg-surface-container-high border border-outline-variant/40 p-2 text-xs"
                placeholder="Caption"
              />
            </>
          ) : (
            <textarea
              value={block.text}
              onChange={(e) => updateBlock(index, { ...block, text: e.target.value })}
              className="w-full bg-surface-container-high border border-outline-variant/40 p-2 text-xs min-h-[90px]"
              placeholder={block.type === "quote" ? "Quote" : "Paragraph"}
            />
          )}
        </div>
      ))}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => addBlock("paragraph")}
          className="text-xs uppercase tracking-widest border border-outline-variant/40 px-3 py-2 hover:border-[var(--accent)]"
        >
          Add Paragraph
        </button>
        <button
          type="button"
          onClick={() => addBlock("quote")}
          className="text-xs uppercase tracking-widest border border-outline-variant/40 px-3 py-2 hover:border-[var(--accent)]"
        >
          Add Quote
        </button>
        <button
          type="button"
          onClick={() => addBlock("image")}
          className="text-xs uppercase tracking-widest border border-outline-variant/40 px-3 py-2 hover:border-[var(--accent)]"
        >
          Add Image
        </button>
      </div>
    </div>
  );
}
