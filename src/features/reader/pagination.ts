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
      const slideCount = getBlockSlideCount(block);

      for (let slideNumber = 1; slideNumber <= slideCount; slideNumber += 1) {
        pages.push({
          pageNumber: pages.length + 1,
          chapterId: chapter.id,
          chapterTitle: chapter.title,
          chapterSortOrder: chapter.sortOrder,
          block,
          sourceBlockId: block.id,
          slideNumber,
          slideCount,
        });
      }
    }
  }

  return pages;
}

function getBlockSlideCount(block: ReaderBlock) {
  if (block.type !== "rich_text") {
    return 1;
  }

  const { markdown } = parseBlockPayload("rich_text", block.payloadJson);
  return splitMarkdownIntoSlides(markdown).length;
}

function splitMarkdownIntoSlides(markdown: string) {
  const paragraphs = markdown
    .split(/\n\s*\n/g)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) {
    return [markdown];
  }

  const slides: string[] = [];
  let currentSlide = "";

  for (const paragraph of paragraphs) {
    const nextSlide = currentSlide ? `${currentSlide}\n\n${paragraph}` : paragraph;

    if (
      currentSlide &&
      nextSlide.length > RICH_TEXT_SLIDE_CHARACTER_LIMIT
    ) {
      slides.push(currentSlide);
      currentSlide = paragraph;
      continue;
    }

    currentSlide = nextSlide;
  }

  if (currentSlide) {
    slides.push(currentSlide);
  }

  return slides;
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
