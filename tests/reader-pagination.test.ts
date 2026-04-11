import { describe, expect, it } from "vitest";

import {
  buildReaderPages,
  normalizeReaderPageNumber,
} from "@/features/reader/pagination";

const chapters = [
  {
    id: "chapter-1",
    title: "Introdução",
    sortOrder: 1,
    blocks: [
      {
        id: "block-1",
        title: "Boas-vindas",
        type: "rich_text" as const,
        payloadJson: "{}",
        sortOrder: 1,
      },
      {
        id: "block-2",
        title: "Primeiros passos",
        type: "checklist" as const,
        payloadJson: "{}",
        sortOrder: 2,
      },
    ],
  },
  {
    id: "chapter-2",
    title: "Sem conteúdo",
    sortOrder: 2,
    blocks: [],
  },
];

describe("buildReaderPages", () => {
  it("turns each block into a sequential reader page", () => {
    const pages = buildReaderPages(chapters);

    expect(pages).toHaveLength(3);
    expect(pages.map((page) => page.pageNumber)).toEqual([1, 2, 3]);
    expect(pages[0]).toMatchObject({
      chapterTitle: "Introdução",
      block: { id: "block-1" },
    });
    expect(pages[1]).toMatchObject({
      chapterTitle: "Introdução",
      block: { id: "block-2" },
    });
  });

  it("creates a placeholder page for chapters without blocks", () => {
    const pages = buildReaderPages(chapters);

    expect(pages[2]).toMatchObject({
      chapterTitle: "Sem conteúdo",
      block: null,
    });
  });
});

describe("normalizeReaderPageNumber", () => {
  it("clamps invalid page numbers to the available range", () => {
    expect(normalizeReaderPageNumber("abc", 4)).toBe(1);
    expect(normalizeReaderPageNumber("-1", 4)).toBe(1);
    expect(normalizeReaderPageNumber("99", 4)).toBe(4);
    expect(normalizeReaderPageNumber("2", 4)).toBe(2);
  });
});
