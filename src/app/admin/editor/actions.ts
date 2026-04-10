"use server";

import { revalidatePath } from "next/cache";
import {
  createBlock,
  createChapter,
  deleteBlock,
  reorderBlock,
  reorderChapter,
  updateBlock,
  type ReorderDirection,
} from "@/domains/admin/editor-mutations";
import type { BlockType } from "@/domains/content/blocks";

export async function createChapterAction(productId: string, title: string) {
  await createChapter(productId, title);
  revalidatePath(`/admin/editor/${productId}`);
}

export async function createBlockAction(productId: string, chapterId: string, type: BlockType) {
  await createBlock(chapterId, type);
  revalidatePath(`/admin/editor/${productId}`);
}

export async function updateBlockAction(
  productId: string,
  blockId: string,
  input: { title: string | null; payloadJson: string; isPublished: boolean },
) {
  await updateBlock(blockId, input);
  revalidatePath(`/admin/editor/${productId}`);
}

export async function deleteBlockAction(productId: string, blockId: string) {
  await deleteBlock(blockId);
  revalidatePath(`/admin/editor/${productId}`);
}

export async function reorderChapterAction(productId: string, chapterId: string, direction: ReorderDirection) {
  await reorderChapter(productId, chapterId, direction);
  revalidatePath(`/admin/editor/${productId}`);
}

export async function reorderBlockAction(productId: string, chapterId: string, blockId: string, direction: ReorderDirection) {
  await reorderBlock(chapterId, blockId, direction);
  revalidatePath(`/admin/editor/${productId}`);
}
