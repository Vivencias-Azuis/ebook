import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

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
      id: "block-1",
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
      id: "block-1",
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
  it("shows slide-aware labels and block-scoped completion copy for fragmented content", async () => {
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
          accessiblePageNumbers={
            new Set(readerPages.map((page) => page.pageNumber))
          }
          isPreviewMode={false}
        />,
      );
    });

    const toggle = container.querySelector("button");

    await act(async () => {
      toggle?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(container.textContent).toContain("Guia Pratico");
    expect(container.textContent).toContain("Comeco");
    expect(container.textContent).toContain("Rede de apoio");
    expect(container.textContent).toContain("Boas-vindas");
    expect(container.textContent).toContain("Checklist inicial");
    expect(container.textContent).toContain("Quem acionar");
    expect(container.innerHTML).toContain('aria-label="Lido"');
    expect(container.innerHTML).toContain("page=2");
    expect(container.innerHTML).toContain('aria-current="page"');

    await act(async () => {
      root.unmount();
    });
  });

  it("stacks the sidebar header and item metadata to avoid squeezing the title", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <ReaderSidebar
          productTitle="Guia Pratico: Primeiros 30 Dias Após Suspeita ou Diagnóstico"
          productSlug="guia-pratico"
          currentPageNumber={2}
          progressPercent={34}
          readerPages={readerPages}
          progressByBlockId={progressByBlockId}
          accessiblePageNumbers={
            new Set(readerPages.map((page) => page.pageNumber))
          }
          isPreviewMode={false}
        />,
      );
    });

    expect(container.innerHTML).toContain('<div class="space-y-4">');
    expect(container.innerHTML).toContain("flex items-start justify-between gap-3");
    expect(container.innerHTML).toContain("shrink-0 rounded-full border");
    expect(container.innerHTML).toContain("flex items-center gap-3");

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
          accessiblePageNumbers={
            new Set(readerPages.map((page) => page.pageNumber))
          }
          isPreviewMode={false}
        />,
      );
    });

    const toggle = container.querySelector("button");
    expect(toggle?.textContent).toContain("Abrir");
    expect(container.textContent).not.toContain("Boas-vindas");

    await act(async () => {
      toggle?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(container.textContent).toContain("Ocultar");
    expect(container.textContent).toContain("Boas-vindas");

    await act(async () => {
      root.unmount();
    });
  });

  it("falls back to the block id when sourceBlockId is unavailable", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <ReaderSidebar
          productTitle="Guia Pratico"
          productSlug="guia-pratico"
          currentPageNumber={1}
          progressPercent={50}
          readerPages={[
            {
              pageNumber: 1,
              chapterId: "chapter-1",
              chapterTitle: "Comeco",
              chapterSortOrder: 1,
              block: {
                id: "block-legacy",
                title: "Bloco antigo",
                type: "rich_text",
                payloadJson: '{"content":"<p>Legado</p>"}',
                sortOrder: 1,
              },
              sourceBlockId: null,
              slideNumber: 1,
              slideCount: 1,
            },
          ]}
          progressByBlockId={{ "block-legacy": { completed: true } }}
          accessiblePageNumbers={new Set([1])}
          isPreviewMode={false}
        />,
      );
    });

    await act(async () => {
      container
        .querySelector("button")
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(container.innerHTML).toContain('aria-label="Lido"');

    await act(async () => {
      root.unmount();
    });
  });

  it("renders locked pages with cadeado and no navigation link in preview mode", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <ReaderSidebar
          productTitle="Guia Pratico"
          productSlug="guia-pratico"
          currentPageNumber={1}
          progressPercent={10}
          readerPages={readerPages}
          progressByBlockId={{}}
          accessiblePageNumbers={new Set([1, 2, 3])}
          isPreviewMode
          onOpenPaywall={() => undefined}
        />,
      );
    });

    await act(async () => {
      container
        .querySelector("button")
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(container.textContent).toContain("Quem acionar");
    expect(container.textContent).toContain("🔒");
    expect(container.innerHTML).not.toContain("page=4");
    expect(
      container.querySelector('[data-paywall-trigger="locked-page"]'),
    ).not.toBeNull();

    await act(async () => {
      root.unmount();
    });
  });

  it("opens the paywall when a locked page is clicked in preview mode", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    const onOpenPaywall = vi.fn();

    await act(async () => {
      root.render(
        <ReaderSidebar
          productTitle="Guia Pratico"
          productSlug="guia-pratico"
          currentPageNumber={1}
          progressPercent={10}
          readerPages={readerPages}
          progressByBlockId={{}}
          accessiblePageNumbers={new Set([1, 2, 3])}
          isPreviewMode
          onOpenPaywall={onOpenPaywall}
        />,
      );
    });

    await act(async () => {
      container
        .querySelector("button")
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    const lockedPageTrigger = container.querySelector(
      '[data-paywall-trigger="locked-page"]',
    );

    expect(lockedPageTrigger).not.toBeNull();

    await act(async () => {
      lockedPageTrigger?.dispatchEvent(
        new MouseEvent("click", { bubbles: true }),
      );
    });

    expect(onOpenPaywall).toHaveBeenCalledTimes(1);

    await act(async () => {
      root.unmount();
    });
  });
});
