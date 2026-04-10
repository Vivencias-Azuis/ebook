import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";

import { BlockRenderer } from "@/features/reader/block-renderer";

it("renders a fallback when block payload parsing fails", () => {
  const markup = renderToStaticMarkup(
    <BlockRenderer type="rich_text" title="Fallback test" payloadJson="{" />,
  );

  expect(markup).toContain("Conteúdo indisponível neste bloco.");
  expect(markup).toContain("Fallback test");
});

it("renders checklist items with checkbox inputs and labels", () => {
  const markup = renderToStaticMarkup(
    <BlockRenderer
      type="checklist"
      title={null}
      payloadJson={JSON.stringify({
        items: [{ id: "item-1", label: "Leia a introdução" }],
      })}
    />,
  );

  expect(markup).toContain('type="checkbox"');
  expect(markup).toContain('id="checklist-item-1"');
  expect(markup).toContain('for="checklist-item-1"');
  expect(markup).toContain("Leia a introdução");
});
