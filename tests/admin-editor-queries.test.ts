import { describe, expect, it } from "vitest";

import { deriveEditorSelection } from "@/domains/admin/editor-queries";

const product = {
  id: "product-guided-first-steps",
  title: "Guide",
  status: "published" as const,
};

const chapters = [
  {
    id: "chapter-intro",
    title: "Introdução",
    sortOrder: 1,
    isPublished: true,
    blocks: [
      {
        id: "block-a",
        title: "Intro",
        type: "rich_text" as const,
        sortOrder: 1,
        isPublished: true,
        payloadJson: '{"markdown":"Hello"}',
      },
    ],
  },
  {
    id: "chapter-week-1",
    title: "Semana 1",
    sortOrder: 2,
    isPublished: false,
    blocks: [
      {
        id: "block-week-1",
        title: "Semana 1 Intro",
        type: "rich_text" as const,
        sortOrder: 1,
        isPublished: false,
        payloadJson: '{"markdown":"Week 1"}',
      },
    ],
  },
];

describe("deriveEditorSelection", () => {
  it("defaults to the first chapter and first block when selections are null", () => {
    const result = deriveEditorSelection({
      product,
      chapters,
      selectedChapterId: null,
      selectedBlockId: null,
    });

    expect(result.selectedChapter?.id).toBe("chapter-intro");
    expect(result.selectedBlock?.id).toBe("block-a");
  });

  it("clears stale block selection when block is not in the selected chapter", () => {
    const result = deriveEditorSelection({
      product,
      chapters,
      selectedChapterId: "chapter-week-1",
      selectedBlockId: "block-a",
    });

    expect(result.selectedChapter?.id).toBe("chapter-week-1");
    expect(result.selectedBlock).toBeNull();
  });

  it("returns null selections when the selected chapter id is stale", () => {
    const result = deriveEditorSelection({
      product,
      chapters,
      selectedChapterId: "chapter-missing",
      selectedBlockId: "block-a",
    });

    expect(result.selectedChapter).toBeNull();
    expect(result.selectedBlock).toBeNull();
  });
});
