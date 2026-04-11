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

it("renders download blocks as links when an href is provided", () => {
  const markup = renderToStaticMarkup(
    <BlockRenderer
      type="download"
      title="Material completo"
      payloadJson={JSON.stringify({
        assetId: "guia-pratico-pdf",
        label: "Baixar curso completo em PDF",
        href: "/downloads/guia-pratico-primeiros-30-dias.pdf",
      })}
    />,
  );

  expect(markup).toContain("Material completo");
  expect(markup).toContain(
    'href="/downloads/guia-pratico-primeiros-30-dias.pdf"',
  );
  expect(markup).toContain("Baixar curso completo em PDF");
});

it("renders a PDF download menu with fast and print options when generation mode is dynamic", () => {
  const markup = renderToStaticMarkup(
    <BlockRenderer
      type="download"
      title="Download do PDF"
      payloadJson={JSON.stringify({
        assetId: "guia-pratico-pdf",
        label: "Baixar PDF",
        mode: "dynamic_pdf",
        productSlug: "guia-pratico-primeiros-30-dias-apos-diagnostico",
      })}
    />,
  );

  expect(markup).toContain("Baixar PDF");
  expect(markup).toContain("PDF rápido");
  expect(markup).toContain("PDF para imprimir");
  expect(markup).toContain(
    "/api/products/guia-pratico-primeiros-30-dias-apos-diagnostico/download-pdf?variant=fast",
  );
  expect(markup).toContain(
    "/api/products/guia-pratico-primeiros-30-dias-apos-diagnostico/download-pdf?variant=print",
  );
});
