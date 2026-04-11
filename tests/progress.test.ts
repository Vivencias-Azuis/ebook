import { describe, expect, it } from "vitest";

import {
  buildChecklistProgressState,
  deriveContinueReadingChapterId,
  summarizeProductProgress,
} from "@/domains/progress/queries";

const chapters = [
  {
    id: "chapter-1",
    title: "Introducao",
    sortOrder: 1,
    blocks: [
      { id: "block-1", type: "rich_text" as const },
      { id: "block-2", type: "checklist" as const },
    ],
  },
  {
    id: "chapter-2",
    title: "Semana 1",
    sortOrder: 2,
    blocks: [{ id: "block-3", type: "callout" as const }],
  },
];

describe("summarizeProductProgress", () => {
  it("counts completed blocks and calculates percent", () => {
    const result = summarizeProductProgress(chapters, {
      "block-1": { completed: true },
      "block-2": { completed: false, checkedItemIds: ["a"] },
      "block-3": { completed: false },
    });

    expect(result).toEqual({
      totalBlocks: 3,
      completedBlocks: 1,
      percent: 33,
    });
  });
});

describe("deriveContinueReadingChapterId", () => {
  it("returns the first chapter with an incomplete block", () => {
    const chapterId = deriveContinueReadingChapterId(chapters, {
      "block-1": { completed: true },
      "block-2": { completed: false },
      "block-3": { completed: false },
    });

    expect(chapterId).toBe("chapter-1");
  });

  it("returns the last chapter when everything is complete", () => {
    const chapterId = deriveContinueReadingChapterId(chapters, {
      "block-1": { completed: true },
      "block-2": { completed: true },
      "block-3": { completed: true },
    });

    expect(chapterId).toBe("chapter-2");
  });
});

describe("buildChecklistProgressState", () => {
  it("marks the checklist complete only when all items are checked", () => {
    expect(
      buildChecklistProgressState(["item-1", "item-2"], ["item-1"]),
    ).toEqual({
      completed: false,
      checkedItemIds: ["item-1"],
    });

    expect(
      buildChecklistProgressState(["item-1", "item-2"], ["item-1", "item-2"]),
    ).toEqual({
      completed: true,
      checkedItemIds: ["item-1", "item-2"],
    });
  });
});
