import { describe, expect, it } from "vitest";

import { parseBlockPayload } from "@/domains/content/blocks";
import {
  buildReaderPages,
  normalizeReaderPageNumber,
} from "@/features/reader/pagination";

const longMarkdown = Array.from({ length: 24 }, (_, index) => {
  const paragraphNumber = index + 1;
  return `Paragrafo ${paragraphNumber} com texto suficiente para ocupar espaco na leitura e manter a fragmentacao em etapas confortaveis.`;
}).join("\n\n");

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
        payloadJson: JSON.stringify({ markdown: longMarkdown }),
        sortOrder: 1,
      },
      {
        id: "block-2",
        title: "Primeiros passos",
        type: "checklist" as const,
        payloadJson: JSON.stringify({
          items: [{ id: "item-1", label: "Fazer o primeiro exercicio" }],
        }),
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
  it("splits long rich-text blocks into sequential slides without changing block progress identity", () => {
    const pages = buildReaderPages(chapters);
    const firstSlideMarkdown = parseBlockPayload(
      "rich_text",
      pages[0].block?.payloadJson ?? "",
    ).markdown;
    const secondSlideMarkdown = parseBlockPayload(
      "rich_text",
      pages[1].block?.payloadJson ?? "",
    ).markdown;
    const firstSlideParagraphs = firstSlideMarkdown.split("\n\n");
    const secondSlideParagraphs = secondSlideMarkdown.split("\n\n");

    expect(pages).toHaveLength(4);
    expect(pages.map((page) => page.pageNumber)).toEqual([1, 2, 3, 4]);
    expect(pages[0]).toMatchObject({
      chapterTitle: "Introdução",
      block: { id: "block-1" },
      sourceBlockId: "block-1",
      slideNumber: 1,
      slideCount: 2,
    });
    expect(pages[1]).toMatchObject({
      chapterTitle: "Introdução",
      block: { id: "block-1" },
      sourceBlockId: "block-1",
      slideNumber: 2,
      slideCount: 2,
    });
    expect(firstSlideMarkdown).not.toBe(secondSlideMarkdown);
    expect(firstSlideMarkdown).not.toBe(longMarkdown);
    expect(secondSlideMarkdown).not.toBe(longMarkdown);
    expect(`${firstSlideMarkdown}\n\n${secondSlideMarkdown}`).toBe(longMarkdown);
    expect(firstSlideParagraphs[0]).toContain("Paragrafo 1 ");
    expect(firstSlideParagraphs.at(-1)).not.toContain("Paragrafo 24 ");
    expect(secondSlideParagraphs[0]).not.toContain("Paragrafo 1 ");
    expect(secondSlideParagraphs.at(-1)).toContain("Paragrafo 24 ");
    expect(pages[2]).toMatchObject({
      chapterTitle: "Introdução",
      block: { id: "block-2" },
      sourceBlockId: "block-2",
      slideNumber: 1,
      slideCount: 1,
    });
    expect(pages[2].block?.payloadJson).toBe(chapters[0].blocks[1].payloadJson);
  });

  it("creates a placeholder page for chapters without blocks", () => {
    const pages = buildReaderPages(chapters);

    expect(pages[3]).toMatchObject({
      chapterTitle: "Sem conteúdo",
      block: null,
      sourceBlockId: null,
      slideNumber: 1,
      slideCount: 1,
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
