import type { BlockType } from "@/domains/content/blocks";
import { parseBlockPayload } from "@/domains/content/blocks";

const RICH_TEXT_SLIDE_CHARACTER_LIMIT = 1800;

export type ReaderBlock = {
  id: string;
  title: string | null;
  type: BlockType;
  payloadJson: string;
  sortOrder: number;
};

export type ReaderChapter = {
  id: string;
  title: string;
  sortOrder: number;
  blocks: ReaderBlock[];
};

export type ReaderPage = {
  pageNumber: number;
  chapterId: string;
  chapterTitle: string;
  chapterSortOrder: number;
  block: ReaderBlock | null;
  sourceBlockId: string | null;
  slideNumber: number;
  slideCount: number;
};

export function buildReaderPages(chapters: ReaderChapter[]) {
  const pages: ReaderPage[] = [];

  for (const chapter of chapters) {
    if (chapter.blocks.length === 0) {
      pages.push({
        pageNumber: pages.length + 1,
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        chapterSortOrder: chapter.sortOrder,
        block: null,
        sourceBlockId: null,
        slideNumber: 1,
        slideCount: 1,
      });
      continue;
    }

    for (const block of chapter.blocks) {
      const slideBlocks = getSlideBlocks(block);
      const slideCount = slideBlocks.length;

      for (const [index, slideBlock] of slideBlocks.entries()) {
        pages.push({
          pageNumber: pages.length + 1,
          chapterId: chapter.id,
          chapterTitle: chapter.title,
          chapterSortOrder: chapter.sortOrder,
          block: slideBlock,
          sourceBlockId: block.id,
          slideNumber: index + 1,
          slideCount,
        });
      }
    }
  }

  return pages;
}

function getSlideBlocks(block: ReaderBlock) {
  if (block.type !== "rich_text") {
    return [block];
  }

  const { markdown } = parseBlockPayload("rich_text", block.payloadJson);
  return splitMarkdownIntoSlides(markdown).map((slideMarkdown) => ({
    ...block,
    payloadJson: JSON.stringify({ markdown: slideMarkdown }),
  }));
}

function splitMarkdownIntoSlides(markdown: string) {
  const blocks = markdown
    .split(/\n\s*\n/g)
    .map((block) => block.trim())
    .filter(Boolean)
    .flatMap(splitOversizedBlock);

  if (blocks.length === 0) {
    return [markdown];
  }

  const slides: string[] = [];
  let currentSlide = "";

  for (const block of blocks) {
    const nextSlide = currentSlide ? `${currentSlide}\n\n${block}` : block;

    if (
      currentSlide &&
      nextSlide.length > RICH_TEXT_SLIDE_CHARACTER_LIMIT
    ) {
      slides.push(currentSlide);
      currentSlide = block;
      continue;
    }

    currentSlide = nextSlide;
  }

  if (currentSlide) {
    slides.push(currentSlide);
  }

  return slides;
}

function splitOversizedParagraph(paragraph: string) {
  return splitOversizedBlock(paragraph);
}

function splitOversizedBlock(block: string) {
  if (block.length <= RICH_TEXT_SLIDE_CHARACTER_LIMIT) {
    return [block];
  }

  const lines = block
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const line of lines) {
    for (const lineChunk of splitOversizedLine(line)) {
      const nextChunk = currentChunk ? `${currentChunk}\n${lineChunk}` : lineChunk;

      if (currentChunk && nextChunk.length > RICH_TEXT_SLIDE_CHARACTER_LIMIT) {
        chunks.push(currentChunk);
        currentChunk = lineChunk;
        continue;
      }

      currentChunk = nextChunk;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}

function splitOversizedLine(line: string) {
  const structuredPrefix = line.match(/^(?:- |### |## |# )/)?.[0] ?? "";
  const content = structuredPrefix ? line.slice(structuredPrefix.length).trim() : line;

  if (line.length <= RICH_TEXT_SLIDE_CHARACTER_LIMIT) {
    return [line];
  }

  const contentChunks = splitTextBySpaces(
    content,
    Math.max(RICH_TEXT_SLIDE_CHARACTER_LIMIT - structuredPrefix.length, 1),
  );

  return contentChunks.map((chunk) =>
    structuredPrefix ? `${structuredPrefix}${chunk}` : chunk,
  );
}

function splitTextBySpaces(text: string, maxLength: number) {
  if (text.length <= maxLength) {
    return [text];
  }

  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > maxLength) {
    const splitAt = remaining.lastIndexOf(" ", maxLength);
    const chunkEnd = splitAt > 0 ? splitAt : maxLength;
    chunks.push(remaining.slice(0, chunkEnd).trim());
    remaining = remaining.slice(chunkEnd).trim();
  }

  if (remaining) {
    chunks.push(remaining);
  }

  return chunks;
}

export function normalizeReaderPageNumber(
  rawPage: string | string[] | undefined,
  totalPages: number,
) {
  const pageValue = Array.isArray(rawPage) ? rawPage[0] : rawPage;
  const pageNumber = Number.parseInt(pageValue ?? "1", 10);

  if (!Number.isFinite(pageNumber) || pageNumber < 1) {
    return 1;
  }

  return Math.min(pageNumber, Math.max(totalPages, 1));
}
