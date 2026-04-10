import { describe, expect, it } from "vitest";

import { reorderItems } from "@/domains/admin/editor-mutations";

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
