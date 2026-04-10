import { randomUUID } from "node:crypto";

import { and, eq } from "drizzle-orm";

import { db } from "@/db/client";
import { progress } from "@/db/schema";
import {
  buildChecklistProgressState,
  type BlockProgressState,
} from "@/domains/progress/queries";

export async function upsertBlockProgress(input: {
  userId: string;
  productId: string;
  chapterId: string;
  blockId: string;
  state: BlockProgressState;
}) {
  const [record] = await db
    .insert(progress)
    .values({
      id: randomUUID(),
      userId: input.userId,
      productId: input.productId,
      scope: "block",
      targetId: input.blockId,
      chapterId: input.chapterId,
      blockId: input.blockId,
      state: JSON.stringify(input.state),
    })
    .onConflictDoUpdate({
      target: [
        progress.userId,
        progress.productId,
        progress.scope,
        progress.targetId,
      ],
      set: {
        chapterId: input.chapterId,
        blockId: input.blockId,
        state: JSON.stringify(input.state),
      },
    })
    .returning();

  return record ?? null;
}

export async function setBlockCompletion(input: {
  userId: string;
  productId: string;
  chapterId: string;
  blockId: string;
  completed: boolean;
}) {
  return upsertBlockProgress({
    ...input,
    state: {
      completed: input.completed,
    },
  });
}

export async function setChecklistProgress(input: {
  userId: string;
  productId: string;
  chapterId: string;
  blockId: string;
  allItemIds: string[];
  checkedItemIds: string[];
}) {
  return upsertBlockProgress({
    userId: input.userId,
    productId: input.productId,
    chapterId: input.chapterId,
    blockId: input.blockId,
    state: buildChecklistProgressState(input.allItemIds, input.checkedItemIds),
  });
}

export async function getExistingBlockProgressRecord(input: {
  userId: string;
  productId: string;
  blockId: string;
}) {
  const [record] = await db
    .select()
    .from(progress)
    .where(
      and(
        eq(progress.userId, input.userId),
        eq(progress.productId, input.productId),
        eq(progress.scope, "block"),
        eq(progress.targetId, input.blockId),
      ),
    )
    .limit(1);

  return record ?? null;
}
