import { desc, eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";

import { db } from "@/db/client";
import { chapters, contentBlocks } from "@/db/schema";
import { type BlockType } from "@/domains/content/blocks";

export type ReorderDirection = "up" | "down";
export type UpdateChapterInput = Partial<{
  title: string;
  isPublished: boolean;
}>;

export type UpdateBlockInput = Partial<{
  title: string | null;
  payloadJson: string;
  sortOrder: number;
  isPublished: boolean;
}>;

function normalizeSortOrder<T extends { sortOrder: number }>(items: T[]) {
  return items.map((item, index) => ({
    ...item,
    sortOrder: index + 1,
  }));
}

export function reorderItems<T extends { id: string; sortOrder: number }>(
  items: T[],
  itemId: string,
  direction: ReorderDirection,
) {
  const orderedItems = [...items].sort((left, right) => left.sortOrder - right.sortOrder);
  const currentIndex = orderedItems.findIndex((item) => item.id === itemId);

  if (currentIndex === -1) {
    return normalizeSortOrder(orderedItems);
  }

  const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

  if (nextIndex < 0 || nextIndex >= orderedItems.length) {
    return normalizeSortOrder(orderedItems);
  }

  const reorderedItems = [...orderedItems];
  [reorderedItems[currentIndex], reorderedItems[nextIndex]] = [
    reorderedItems[nextIndex],
    reorderedItems[currentIndex],
  ];

  return normalizeSortOrder(reorderedItems);
}

async function getNextChapterSortOrder(productId: string) {
  const [lastChapter] = await db
    .select({ sortOrder: chapters.sortOrder })
    .from(chapters)
    .where(eq(chapters.productId, productId))
    .orderBy(desc(chapters.sortOrder))
    .limit(1);

  return (lastChapter?.sortOrder ?? 0) + 1;
}

async function getNextBlockSortOrder(chapterId: string) {
  const [lastBlock] = await db
    .select({ sortOrder: contentBlocks.sortOrder })
    .from(contentBlocks)
    .where(eq(contentBlocks.chapterId, chapterId))
    .orderBy(desc(contentBlocks.sortOrder))
    .limit(1);

  return (lastBlock?.sortOrder ?? 0) + 1;
}

export function buildDefaultBlockPayload(type: BlockType) {
  switch (type) {
    case "rich_text":
      return JSON.stringify({ markdown: "Novo conteúdo" });
    case "callout":
      return JSON.stringify({ tone: "info", body: "Novo callout" });
    case "checklist":
      return JSON.stringify({
        items: [{ id: "item-1", label: "Novo item" }],
      });
    case "download":
      return JSON.stringify({
        assetId: "asset-placeholder",
        label: "Arquivo para download",
      });
    case "audio":
      return JSON.stringify({
        url: "https://example.com/audio.mp3",
        title: "Novo áudio",
      });
    case "video":
      return JSON.stringify({
        url: "https://example.com/video.mp4",
        title: "Novo vídeo",
      });
    case "quiz":
      return JSON.stringify({
        question: "Nova pergunta",
        answers: [
          { id: "answer-1", label: "Resposta 1", isCorrect: true },
          { id: "answer-2", label: "Resposta 2", isCorrect: false },
        ],
      });
    case "divider":
      return JSON.stringify({});
  }
}

function pruneUpdateValues(input: UpdateBlockInput) {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined),
  ) as UpdateBlockInput;
}

export async function createChapter(productId: string, title: string) {
  const [chapter] = await db
    .insert(chapters)
    .values({
      id: randomUUID(),
      productId,
      title,
      sortOrder: await getNextChapterSortOrder(productId),
      isPublished: false,
    })
    .returning();

  if (!chapter) {
    throw new Error("Failed to create chapter");
  }

  return chapter;
}

export async function updateChapter(chapterId: string, input: UpdateChapterInput) {
  const updateValues = Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined),
  ) as UpdateChapterInput;

  const [chapter] = await db
    .update(chapters)
    .set(updateValues)
    .where(eq(chapters.id, chapterId))
    .returning();

  return chapter ?? null;
}

export async function createBlock(chapterId: string, type: BlockType) {
  const [block] = await db
    .insert(contentBlocks)
    .values({
      id: randomUUID(),
      chapterId,
      type,
      title: null,
      payloadJson: buildDefaultBlockPayload(type),
      sortOrder: await getNextBlockSortOrder(chapterId),
      isPublished: false,
    })
    .returning();

  if (!block) {
    throw new Error("Failed to create block");
  }

  return block;
}

export async function updateBlock(blockId: string, input: UpdateBlockInput) {
  const updateValues = pruneUpdateValues(input);
  const [block] = await db
    .update(contentBlocks)
    .set(updateValues)
    .where(eq(contentBlocks.id, blockId))
    .returning();

  return block ?? null;
}

export async function deleteBlock(blockId: string) {
  const [block] = await db
    .delete(contentBlocks)
    .where(eq(contentBlocks.id, blockId))
    .returning();

  return block ?? null;
}

export async function reorderChapter(productId: string, chapterId: string, direction: ReorderDirection) {
  const existing = await db.select().from(chapters).where(eq(chapters.productId, productId));
  if (existing.length === 0) return;
  const reordered = reorderItems(existing, chapterId, direction);
  await Promise.all(
    reordered.map((chapter) =>
      db.update(chapters).set({ sortOrder: chapter.sortOrder }).where(eq(chapters.id, chapter.id)),
    ),
  );
}

export async function reorderBlock(chapterId: string, blockId: string, direction: ReorderDirection) {
  const existing = await db.select().from(contentBlocks).where(eq(contentBlocks.chapterId, chapterId));
  if (existing.length === 0) return;
  const reordered = reorderItems(existing, blockId, direction);
  await Promise.all(
    reordered.map((block) =>
      db.update(contentBlocks).set({ sortOrder: block.sortOrder }).where(eq(contentBlocks.id, block.id)),
    ),
  );
}
