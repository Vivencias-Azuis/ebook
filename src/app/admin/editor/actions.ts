"use server";

import { revalidatePath } from "next/cache";
import {
  createBlock,
  createChapter,
  deleteBlock,
  reorderBlock,
  reorderChapter,
  updateChapter,
  updateBlock,
  type ReorderDirection,
} from "@/domains/admin/editor-mutations";
import { requireAdminSession } from "@/domains/auth/server";
import type { BlockType } from "@/domains/content/blocks";

export async function createChapterAction(productId: string, title: string) {
  await requireAdminSession();
  await createChapter(productId, title);
  revalidatePath(`/admin/editor/${productId}`);
}

export async function createBlockAction(productId: string, chapterId: string, type: BlockType) {
  await requireAdminSession();
  await createBlock(chapterId, type);
  revalidatePath(`/admin/editor/${productId}`);
}

export async function updateBlockAction(
  productId: string,
  blockId: string,
  input: { title: string | null; payloadJson: string; isPublished: boolean },
) {
  await requireAdminSession();
  await updateBlock(blockId, input);
  revalidatePath(`/admin/editor/${productId}`);
}

export async function deleteBlockAction(productId: string, blockId: string) {
  await requireAdminSession();
  await deleteBlock(blockId);
  revalidatePath(`/admin/editor/${productId}`);
}

export async function reorderChapterAction(productId: string, chapterId: string, direction: ReorderDirection) {
  await requireAdminSession();
  await reorderChapter(productId, chapterId, direction);
  revalidatePath(`/admin/editor/${productId}`);
}

export async function reorderBlockAction(productId: string, chapterId: string, blockId: string, direction: ReorderDirection) {
  await requireAdminSession();
  await reorderBlock(chapterId, blockId, direction);
  revalidatePath(`/admin/editor/${productId}`);
}

export async function updateChapterAction(
  productId: string,
  chapterId: string,
  input: { title?: string; isPublished?: boolean },
) {
  await requireAdminSession();
  await updateChapter(chapterId, input);
  revalidatePath(`/admin/editor/${productId}`);
}
