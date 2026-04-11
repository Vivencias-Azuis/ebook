import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";

import { ReaderSidebar } from "@/features/reader/reader-sidebar";
import type { ReaderPage } from "@/features/reader/pagination";
import type { BlockProgressState } from "@/domains/progress/queries";

const readerPages: ReaderPage[] = [
  {
    pageNumber: 1,
    chapterId: "chapter-1",
    chapterTitle: "Comeco",
    chapterSortOrder: 1,
    block: {
      id: "block-1-slide-1",
      title: "Boas-vindas",
      type: "rich_text",
      payloadJson: '{"content":"<p>Intro</p>"}',
      sortOrder: 1,
    },
    sourceBlockId: "block-1",
    slideNumber: 1,
    slideCount: 2,
  },
  {
    pageNumber: 2,
    chapterId: "chapter-1",
    chapterTitle: "Comeco",
    chapterSortOrder: 1,
    block: {
      id: "block-1-slide-2",
      title: "Boas-vindas",
      type: "rich_text",
      payloadJson: '{"content":"<p>Continuação</p>"}',
      sortOrder: 1,
    },
    sourceBlockId: "block-1",
    slideNumber: 2,
    slideCount: 2,
  },
  {
    pageNumber: 3,
    chapterId: "chapter-1",
    chapterTitle: "Comeco",
    chapterSortOrder: 1,
    block: {
      id: "block-2",
      title: "Checklist inicial",
      type: "checklist",
      payloadJson: '{"items":[]}',
      sortOrder: 2,
    },
    sourceBlockId: "block-2",
    slideNumber: 1,
    slideCount: 1,
  },
  {
    pageNumber: 4,
    chapterId: "chapter-2",
    chapterTitle: "Rede de apoio",
    chapterSortOrder: 2,
    block: {
      id: "block-3",
      title: "Quem acionar",
      type: "rich_text",
      payloadJson: '{"content":"<p>Rede</p>"}',
      sortOrder: 1,
    },
    sourceBlockId: "block-3",
    slideNumber: 1,
    slideCount: 1,
  },
];

const progressByBlockId: Record<string, BlockProgressState> = {
  "block-1": { completed: true },
};

afterEach(() => {
  document.body.innerHTML = "";
});

describe("ReaderSidebar", () => {
  it("shows slide-aware labels and keeps completion anchored to the source block", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <ReaderSidebar
          productTitle="Guia Pratico"
          productSlug="guia-pratico"
          currentPageNumber={2}
          progressPercent={34}
          readerPages={readerPages}
          progressByBlockId={progressByBlockId}
        />,
      );
    });

    expect(container.textContent).toContain("Guia Pratico");
    expect(container.textContent).toContain("Comeco");
    expect(container.textContent).toContain("Rede de apoio");
    expect(container.textContent).toContain("Parte 1 de 2");
    expect(container.textContent).toContain("Parte 2 de 2");
    expect(container.textContent).toContain("Boas-vindas");
    expect(container.textContent).toContain("Checklist inicial");
    expect(container.textContent).toContain("lida");
    expect(container.innerHTML).toContain("page=2");
    expect(container.innerHTML).toContain('aria-current="page"');

    await act(async () => {
      root.unmount();
    });
  });

  it("can collapse and expand the chapter index", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <ReaderSidebar
          productTitle="Guia Pratico"
          productSlug="guia-pratico"
          currentPageNumber={1}
          progressPercent={0}
          readerPages={readerPages}
          progressByBlockId={{}}
        />,
      );
    });

    const toggle = container.querySelector("button");
    expect(toggle?.textContent).toContain("Ocultar");
    expect(container.textContent).toContain("Boas-vindas");

    await act(async () => {
      toggle?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(container.textContent).toContain("Mostrar sumário");
    expect(container.textContent).not.toContain("Boas-vindas");

    await act(async () => {
      root.unmount();
    });
  });
});
