import type { BlockType } from "@/domains/content/blocks";

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
      });
      continue;
    }

    for (const block of chapter.blocks) {
      pages.push({
        pageNumber: pages.length + 1,
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        chapterSortOrder: chapter.sortOrder,
        block,
      });
    }
  }

  return pages;
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
