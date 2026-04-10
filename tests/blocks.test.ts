import { expect, it } from "vitest";

import { parseBlockPayload } from "@/domains/content/blocks";

it('parses a rich_text payload', () => {
  expect(
    parseBlockPayload(
      "rich_text",
      JSON.stringify({ markdown: "Hello" }),
    ),
  ).toEqual({ markdown: "Hello" });
});

it("rejects an invalid checklist payload", () => {
  expect(() =>
    parseBlockPayload("checklist", JSON.stringify({ items: "bad" })),
  ).toThrow();
});

it("rejects malformed JSON payloads", () => {
  expect(() => parseBlockPayload("rich_text", "{")).toThrow();
});

it("rejects unexpected divider keys", () => {
  expect(() =>
    parseBlockPayload("divider", JSON.stringify({ unexpected: true })),
  ).toThrow();
});

it("keeps rich_text payloads aligned to the markdown contract", () => {
  expect(
    parseBlockPayload(
      "rich_text",
      JSON.stringify({ markdown: "Seeded markdown content" }),
    ),
  ).toEqual({ markdown: "Seeded markdown content" });

  expect(() =>
    parseBlockPayload("rich_text", JSON.stringify({ body: "Seeded body" })),
  ).toThrow();
});
