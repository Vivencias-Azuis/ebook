import { describe, expect, it } from "vitest";

import {
  buildDefaultBlockPayload,
  reorderItems,
} from "@/domains/admin/editor-mutations";

describe("reorderItems", () => {
  it("swaps an item upward", () => {
    const result = reorderItems(
      [
        { id: "chapter-1", sortOrder: 1 },
        { id: "chapter-2", sortOrder: 2 },
        { id: "chapter-3", sortOrder: 3 },
      ],
      "chapter-3",
      "up",
    );

    expect(result).toEqual([
      { id: "chapter-1", sortOrder: 1 },
      { id: "chapter-3", sortOrder: 2 },
      { id: "chapter-2", sortOrder: 3 },
    ]);
  });

  it("keeps first item stable when moving up", () => {
    const result = reorderItems(
      [
        { id: "chapter-1", sortOrder: 1 },
        { id: "chapter-2", sortOrder: 2 },
      ],
      "chapter-1",
      "up",
    );

    expect(result).toEqual([
      { id: "chapter-1", sortOrder: 1 },
      { id: "chapter-2", sortOrder: 2 },
    ]);
  });
});

describe("buildDefaultBlockPayload", () => {
  it("creates a valid checklist payload", () => {
    expect(JSON.parse(buildDefaultBlockPayload("checklist"))).toEqual({
      items: [{ id: "item-1", label: "Novo item" }],
    });
  });

  it("creates a valid quiz payload with at least two answers", () => {
    expect(JSON.parse(buildDefaultBlockPayload("quiz"))).toEqual({
      question: "Nova pergunta",
      answers: [
        { id: "answer-1", label: "Resposta 1", isCorrect: true },
        { id: "answer-2", label: "Resposta 2", isCorrect: false },
      ],
    });
  });
});
