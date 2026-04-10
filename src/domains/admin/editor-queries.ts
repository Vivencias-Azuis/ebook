import { asc, eq, inArray } from "drizzle-orm";

import { db } from "@/db/client";
import { chapters, contentBlocks, products } from "@/db/schema";

export type EditorBlock = {
  id: string;
  title: string | null;
  type: typeof contentBlocks.$inferSelect.type;
  sortOrder: number;
  isPublished: boolean;
  payloadJson: string;
};

export type EditorChapter = {
  id: string;
  title: string;
  sortOrder: number;
  isPublished: boolean;
  blocks: EditorBlock[];
};

export type EditorProduct = typeof products.$inferSelect;

type EditorSelectionInput = {
  product: EditorProduct;
  chapters: EditorChapter[];
  selectedChapterId: string | null;
  selectedBlockId: string | null;
};

export async function getEditorProduct(productId: string) {
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  return product ?? null;
}

export async function getEditorChapters(productId: string): Promise<EditorChapter[]> {
  const productChapters = await db
    .select()
    .from(chapters)
    .where(eq(chapters.productId, productId))
    .orderBy(asc(chapters.sortOrder));

  if (productChapters.length === 0) {
    return [];
  }

  const chapterIds = productChapters.map((chapter) => chapter.id);
  const productBlocks = await db
    .select()
    .from(contentBlocks)
    .where(inArray(contentBlocks.chapterId, chapterIds))
    .orderBy(asc(contentBlocks.sortOrder));

  const blocksByChapterId = new Map<string, EditorBlock[]>();

  for (const block of productBlocks) {
    const chapterBlocks = blocksByChapterId.get(block.chapterId) ?? [];

    chapterBlocks.push({
      id: block.id,
      title: block.title,
      type: block.type,
      sortOrder: block.sortOrder,
      isPublished: block.isPublished,
      payloadJson: block.payloadJson,
    });

    blocksByChapterId.set(block.chapterId, chapterBlocks);
  }

  return productChapters.map((chapter) => ({
    id: chapter.id,
    title: chapter.title,
    sortOrder: chapter.sortOrder,
    isPublished: chapter.isPublished,
    blocks: blocksByChapterId.get(chapter.id) ?? [],
  }));
}

export function deriveEditorSelection({
  product,
  chapters,
  selectedChapterId,
  selectedBlockId,
}: EditorSelectionInput) {
  const selectedChapter =
    selectedChapterId === null
      ? chapters[0] ?? null
      : chapters.find((chapter) => chapter.id === selectedChapterId) ?? null;

  let selectedBlock = null;

  if (selectedChapter) {
    const matchedBlock = selectedChapter.blocks.find(
      (block) => block.id === selectedBlockId,
    );

    if (matchedBlock) {
      selectedBlock = matchedBlock;
    } else if (selectedBlockId === null) {
      selectedBlock = selectedChapter.blocks[0] ?? null;
    }
  }

  return {
    product,
    chapters,
    selectedChapter,
    selectedBlock,
  };
}
