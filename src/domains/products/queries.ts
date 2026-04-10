import { and, asc, eq } from "drizzle-orm";

import type { BlockType } from "@/domains/content/blocks";
import { db } from "@/db/client";
import { chapters, contentBlocks, products } from "@/db/schema";

export async function getPublishedProducts() {
  return db
    .select()
    .from(products)
    .where(eq(products.status, "published"))
    .orderBy(asc(products.createdAt));
}

export async function getProductBySlug(slug: string) {
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1);

  return product ?? null;
}

type PublishedProductContentBlock = {
  id: string;
  title: string | null;
  type: BlockType;
  payloadJson: string;
  sortOrder: number;
};

type PublishedProductContentChapter = {
  id: string;
  title: string;
  sortOrder: number;
  blocks: PublishedProductContentBlock[];
};

type PublishedProductContentRow = {
  chapterId: string;
  chapterTitle: string;
  chapterSortOrder: number;
  blockId: string | null;
  blockTitle: string | null;
  blockType: BlockType | null;
  blockPayloadJson: string | null;
  blockSortOrder: number | null;
};

export async function getPublishedProductContent(productId: string) {
  const rows = await db
    .select({
      chapterId: chapters.id,
      chapterTitle: chapters.title,
      chapterSortOrder: chapters.sortOrder,
      blockId: contentBlocks.id,
      blockTitle: contentBlocks.title,
      blockType: contentBlocks.type,
      blockPayloadJson: contentBlocks.payloadJson,
      blockSortOrder: contentBlocks.sortOrder,
    })
    .from(chapters)
    .leftJoin(
      contentBlocks,
      and(
        eq(contentBlocks.chapterId, chapters.id),
        eq(contentBlocks.isPublished, true),
      ),
    )
    .where(
      and(eq(chapters.productId, productId), eq(chapters.isPublished, true)),
    )
    .orderBy(asc(chapters.sortOrder), asc(contentBlocks.sortOrder));

  const chapterMap = new Map<string, PublishedProductContentChapter>();

  for (const row of rows as PublishedProductContentRow[]) {
    let chapter = chapterMap.get(row.chapterId);

    if (!chapter) {
      chapter = {
        id: row.chapterId,
        title: row.chapterTitle,
        sortOrder: row.chapterSortOrder,
        blocks: [],
      };
      chapterMap.set(row.chapterId, chapter);
    }

    if (row.blockId && row.blockType && row.blockPayloadJson) {
      chapter.blocks.push({
        id: row.blockId,
        title: row.blockTitle,
        type: row.blockType,
        payloadJson: row.blockPayloadJson,
        sortOrder: row.blockSortOrder ?? 0,
      });
    }
  }

  return Array.from(chapterMap.values());
}
