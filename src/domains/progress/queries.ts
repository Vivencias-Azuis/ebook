import { and, eq, inArray } from "drizzle-orm";

import { db } from "@/db/client";
import { chapters, contentBlocks, progress } from "@/db/schema";

export type BlockProgressState = {
  completed: boolean;
  checkedItemIds?: string[];
};

type ProgressChapter = {
  id: string;
  title: string;
  sortOrder: number;
  blocks: { id: string; type: string }[];
};

export function parseBlockProgressState(
  state: string | null | undefined,
): BlockProgressState {
  if (!state) {
    return { completed: false };
  }

  try {
    const parsed = JSON.parse(state) as Partial<BlockProgressState>;
    return {
      completed: parsed.completed === true,
      checkedItemIds: Array.isArray(parsed.checkedItemIds)
        ? parsed.checkedItemIds.map(String)
        : undefined,
    };
  } catch {
    return { completed: false };
  }
}

export function buildChecklistProgressState(
  allItemIds: string[],
  checkedItemIds: string[],
): BlockProgressState {
  const uniqueCheckedIds = Array.from(new Set(checkedItemIds)).filter((id) =>
    allItemIds.includes(id),
  );

  return {
    completed:
      allItemIds.length > 0 && uniqueCheckedIds.length === allItemIds.length,
    checkedItemIds: uniqueCheckedIds,
  };
}

export function summarizeProductProgress(
  productChapters: ProgressChapter[],
  progressByBlockId: Record<string, BlockProgressState>,
) {
  const totalBlocks = productChapters.reduce(
    (sum, chapter) => sum + chapter.blocks.length,
    0,
  );
  const completedBlocks = productChapters.reduce(
    (sum, chapter) =>
      sum +
      chapter.blocks.filter(
        (block) => progressByBlockId[block.id]?.completed === true,
      ).length,
    0,
  );

  return {
    totalBlocks,
    completedBlocks,
    percent:
      totalBlocks === 0 ? 0 : Math.round((completedBlocks / totalBlocks) * 100),
  };
}

export function deriveContinueReadingChapterId(
  productChapters: ProgressChapter[],
  progressByBlockId: Record<string, BlockProgressState>,
) {
  for (const chapter of productChapters) {
    if (
      chapter.blocks.some((block) => !progressByBlockId[block.id]?.completed)
    ) {
      return chapter.id;
    }
  }

  return productChapters.at(-1)?.id ?? null;
}

export async function getUserProductProgress(
  userId: string,
  productId: string,
) {
  const rows = await db
    .select({
      blockId: progress.blockId,
      state: progress.state,
    })
    .from(progress)
    .where(
      and(
        eq(progress.userId, userId),
        eq(progress.productId, productId),
        eq(progress.scope, "block"),
      ),
    );

  return Object.fromEntries(
    rows
      .filter((row) => row.blockId)
      .map((row) => [
        row.blockId as string,
        parseBlockProgressState(row.state),
      ]),
  ) as Record<string, BlockProgressState>;
}

export async function getPublishedProductOutline(productId: string) {
  const rows = await db
    .select({
      chapterId: chapters.id,
      chapterTitle: chapters.title,
      chapterSortOrder: chapters.sortOrder,
      blockId: contentBlocks.id,
      blockType: contentBlocks.type,
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
    .orderBy(chapters.sortOrder, contentBlocks.sortOrder);

  const chapterMap = new Map<string, ProgressChapter>();

  for (const row of rows) {
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

    if (row.blockId && row.blockType) {
      chapter.blocks.push({
        id: row.blockId,
        type: row.blockType,
      });
    }
  }

  return Array.from(chapterMap.values());
}

export async function getUserProgressSummariesForProducts(
  userId: string,
  productIds: string[],
) {
  if (productIds.length === 0) {
    return {};
  }

  const [outlineRows, progressRows] = await Promise.all([
    db
      .select({
        productId: chapters.productId,
        chapterId: chapters.id,
        chapterTitle: chapters.title,
        chapterSortOrder: chapters.sortOrder,
        blockId: contentBlocks.id,
        blockType: contentBlocks.type,
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
        and(
          inArray(chapters.productId, productIds),
          eq(chapters.isPublished, true),
        ),
      )
      .orderBy(chapters.productId, chapters.sortOrder, contentBlocks.sortOrder),
    db
      .select({
        productId: progress.productId,
        blockId: progress.blockId,
        state: progress.state,
      })
      .from(progress)
      .where(
        and(
          eq(progress.userId, userId),
          inArray(progress.productId, productIds),
          eq(progress.scope, "block"),
        ),
      ),
  ]);

  const outlineByProductId = new Map<string, ProgressChapter[]>();

  for (const row of outlineRows) {
    const productChapters = outlineByProductId.get(row.productId) ?? [];
    let chapter = productChapters.find((item) => item.id === row.chapterId);

    if (!chapter) {
      chapter = {
        id: row.chapterId,
        title: row.chapterTitle,
        sortOrder: row.chapterSortOrder,
        blocks: [],
      };
      productChapters.push(chapter);
      outlineByProductId.set(row.productId, productChapters);
    }

    if (row.blockId && row.blockType) {
      chapter.blocks.push({
        id: row.blockId,
        type: row.blockType,
      });
    }
  }

  const progressByProductId = new Map<
    string,
    Record<string, BlockProgressState>
  >();

  for (const row of progressRows) {
    if (!row.blockId) {
      continue;
    }

    const productProgress = progressByProductId.get(row.productId) ?? {};
    productProgress[row.blockId] = parseBlockProgressState(row.state);
    progressByProductId.set(row.productId, productProgress);
  }

  return Object.fromEntries(
    productIds.map((productId) => {
      const outline = outlineByProductId.get(productId) ?? [];
      const blockProgress = progressByProductId.get(productId) ?? {};
      const summary = summarizeProductProgress(outline, blockProgress);

      return [
        productId,
        {
          ...summary,
          continueReadingChapterId: deriveContinueReadingChapterId(
            outline,
            blockProgress,
          ),
        },
      ];
    }),
  ) as Record<
    string,
    ReturnType<typeof summarizeProductProgress> & {
      continueReadingChapterId: string | null;
    }
  >;
}
