/* eslint-disable @typescript-eslint/no-explicit-any */
import { isValidElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("notFound");
  }),
  redirect: vi.fn((location: string) => {
    throw new Error(`redirect:${location}`);
  }),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/domains/auth/server", () => ({
  requireServerSession: vi.fn(),
}));

vi.mock("@/domains/orders/access", () => ({
  canAccessProduct: vi.fn(),
  getUserProductEntitlement: vi.fn(),
}));

vi.mock("@/domains/products/queries", () => ({
  getProductBySlug: vi.fn(),
  getPublishedProductContent: vi.fn(),
}));

vi.mock("@/domains/progress/queries", () => ({
  getUserProductProgress: vi.fn(),
  summarizeProductProgress: vi.fn(),
}));

vi.mock("@/domains/progress/mutations", () => ({
  setBlockCompletion: vi.fn(),
  setChecklistProgress: vi.fn(),
}));

vi.mock("@/features/reader/pagination", async () => {
  const actual = await vi.importActual<typeof import("@/features/reader/pagination")>(
    "@/features/reader/pagination",
  );

  return {
    ...actual,
    buildReaderPages: vi.fn(actual.buildReaderPages),
    normalizeReaderPageNumber: vi.fn(actual.normalizeReaderPageNumber),
  };
});

import ProductReadPage from "@/app/products/[slug]/read/page";
import { requireServerSession } from "@/domains/auth/server";
import {
  canAccessProduct,
  getUserProductEntitlement,
} from "@/domains/orders/access";
import {
  setBlockCompletion,
  setChecklistProgress,
} from "@/domains/progress/mutations";
import {
  getUserProductProgress,
  summarizeProductProgress,
} from "@/domains/progress/queries";
import { revalidatePath } from "next/cache";
import {
  getProductBySlug,
  getPublishedProductContent,
} from "@/domains/products/queries";
import {
  buildReaderPages,
} from "@/features/reader/pagination";

function collectText(node: unknown): string {
  if (node == null || typeof node === "boolean") {
    return "";
  }

  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(collectText).join("");
  }

  if (!isValidElement(node)) {
    return "";
  }

  return collectText(node.props.children);
}

function findFormActionByButtonLabel(node: unknown, label: string): unknown {
  if (node == null || typeof node === "boolean") {
    return null;
  }

  if (Array.isArray(node)) {
    for (const child of node) {
      const action = findFormActionByButtonLabel(child, label);

      if (action) {
        return action;
      }
    }

    return null;
  }

  if (!isValidElement(node)) {
    return null;
  }

  if (
    node.type === "form" &&
    collectText(node.props.children).includes(label)
  ) {
    return node.props.action;
  }

  return findFormActionByButtonLabel(node.props.children, label);
}

describe("ProductReadPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders a premium slide shell with slide-aware navigation", async () => {
    vi.mocked(requireServerSession).mockResolvedValue({
      user: { id: "user-1" },
    } as any);
    vi.mocked(getProductBySlug).mockResolvedValue({
      id: "prod-1",
      slug: "guia-pratico",
      title: "Guia Pratico",
      status: "published",
    } as any);
    vi.mocked(getUserProductEntitlement).mockResolvedValue({
      status: "active",
    } as any);
    vi.mocked(canAccessProduct).mockReturnValue(true);
    vi.mocked(getPublishedProductContent).mockResolvedValue([
      {
        id: "chapter-1",
        title: "Comeco",
        sortOrder: 1,
        blocks: [
          {
            id: "block-1",
            title: "Boas-vindas",
            type: "rich_text",
            payloadJson: JSON.stringify({
              markdown: `${"A".repeat(1000)}\n\n${"B".repeat(1000)}`,
            }),
            sortOrder: 1,
          },
        ],
      },
    ] as any);
    vi.mocked(getUserProductProgress).mockResolvedValue({});
    vi.mocked(summarizeProductProgress).mockReturnValue({
      percent: 24,
    } as any);

    const page = await ProductReadPage({
      params: Promise.resolve({ slug: "guia-pratico" }),
      searchParams: Promise.resolve({ page: "1" }),
    });

    const markup = renderToStaticMarkup(page);

    expect(markup).toContain("va-reader-page");
    expect(markup).toContain("va-reader-shell");
    expect(markup).toContain("va-reader-stage");
    expect(markup).toContain("va-reader-slide");
    expect(markup).toContain("va-reader-bar");
    expect(markup).toContain("va-reader-panel");
    expect(markup).toContain("Ocultar sumário");
    expect(markup).toContain("reader-sidebar-root");
    expect(markup).toContain('aria-expanded="true"');
    expect(markup).toContain("Etapa 1 de 2");
    expect(markup).toContain("24% concluído");
    expect(markup).toContain("Continuar");
    expect(markup).toContain("Boas-vindas");
  });

  it("renders only the current fragmented slide payload while keeping block actions", async () => {
    vi.mocked(requireServerSession).mockResolvedValue({
      user: { id: "user-1" },
    } as any);
    vi.mocked(getProductBySlug).mockResolvedValue({
      id: "prod-1",
      slug: "guia-pratico",
      title: "Guia Pratico",
      status: "published",
    } as any);
    vi.mocked(getUserProductEntitlement).mockResolvedValue({
      status: "active",
    } as any);
    vi.mocked(canAccessProduct).mockReturnValue(true);
    vi.mocked(getPublishedProductContent).mockResolvedValue([
      {
        id: "chapter-1",
        title: "Comeco",
        sortOrder: 1,
        blocks: [
          {
            id: "block-1",
            title: "Boas-vindas",
            type: "rich_text",
            payloadJson: JSON.stringify({
              markdown: `${"A".repeat(1000)}\n\n${"B".repeat(1000)}`,
            }),
            sortOrder: 1,
          },
        ],
      },
    ] as any);
    vi.mocked(getUserProductProgress).mockResolvedValue({
      "block-1": { completed: false },
    } as any);
    vi.mocked(summarizeProductProgress).mockReturnValue({
      percent: 24,
    } as any);

    const page = await ProductReadPage({
      params: Promise.resolve({ slug: "guia-pratico" }),
      searchParams: Promise.resolve({ page: "2" }),
    });

    const markup = renderToStaticMarkup(page);

    expect(markup).toContain("Etapa 2 de 2");
    expect(markup).toContain("Parte 2 de 2");
    expect(markup).toContain("Marcar bloco como lido");
    expect(markup).toContain("vale para todas as partes deste bloco");
    expect(markup).toContain("BBBBBBBBBB");
    expect(markup).not.toContain("AAAAAAAAAA");
  });

  it("submits fragmented slide completion against the original block id", async () => {
    vi.mocked(requireServerSession).mockResolvedValue({
      user: { id: "user-1" },
    } as any);
    vi.mocked(getProductBySlug).mockResolvedValue({
      id: "prod-1",
      slug: "guia-pratico",
      title: "Guia Pratico",
      status: "published",
    } as any);
    vi.mocked(getUserProductEntitlement).mockResolvedValue({
      status: "active",
    } as any);
    vi.mocked(canAccessProduct).mockReturnValue(true);
    vi.mocked(getPublishedProductContent).mockResolvedValue([
      {
        id: "chapter-1",
        title: "Comeco",
        sortOrder: 1,
        blocks: [],
      },
    ] as any);
    vi.mocked(getUserProductProgress).mockResolvedValue({
      "block-1": { completed: false },
    } as any);
    vi.mocked(summarizeProductProgress).mockReturnValue({
      percent: 24,
    } as any);
    vi.mocked(buildReaderPages).mockReturnValue([
      {
        pageNumber: 1,
        chapterId: "chapter-1",
        chapterTitle: "Comeco",
        chapterSortOrder: 1,
        block: {
          id: "slide-block-1",
          title: "Boas-vindas",
          type: "rich_text",
          payloadJson: JSON.stringify({ markdown: "Primeira parte" }),
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
          id: "slide-block-2",
          title: "Boas-vindas",
          type: "rich_text",
          payloadJson: JSON.stringify({ markdown: "Segunda parte" }),
          sortOrder: 1,
        },
        sourceBlockId: "block-1",
        slideNumber: 2,
        slideCount: 2,
      },
    ]);

    const page = await ProductReadPage({
      params: Promise.resolve({ slug: "guia-pratico" }),
      searchParams: Promise.resolve({ page: "2" }),
    });
    const action = findFormActionByButtonLabel(page, "Marcar bloco como lido");

    expect(action).toBeTypeOf("function");

    await (action as () => Promise<void>)();

    expect(setBlockCompletion).toHaveBeenCalledWith({
      userId: "user-1",
      productId: "prod-1",
      chapterId: "chapter-1",
      blockId: "block-1",
      completed: true,
    });
    expect(setChecklistProgress).not.toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith(
      "/products/guia-pratico/read?page=2",
    );
    expect(revalidatePath).toHaveBeenCalledWith("/library");
  });

  it("submits checklist progress against the original block id on a slide-aware route", async () => {
    vi.mocked(requireServerSession).mockResolvedValue({
      user: { id: "user-1" },
    } as any);
    vi.mocked(getProductBySlug).mockResolvedValue({
      id: "prod-1",
      slug: "guia-pratico",
      title: "Guia Pratico",
      status: "published",
    } as any);
    vi.mocked(getUserProductEntitlement).mockResolvedValue({
      status: "active",
    } as any);
    vi.mocked(canAccessProduct).mockReturnValue(true);
    vi.mocked(getPublishedProductContent).mockResolvedValue([
      {
        id: "chapter-1",
        title: "Comeco",
        sortOrder: 1,
        blocks: [],
      },
    ] as any);
    vi.mocked(getUserProductProgress).mockResolvedValue({
      "block-checklist": { completed: false, checkedItemIds: ["item-1"] },
    } as any);
    vi.mocked(summarizeProductProgress).mockReturnValue({
      percent: 24,
    } as any);
    vi.mocked(buildReaderPages).mockReturnValue([
      {
        pageNumber: 1,
        chapterId: "chapter-1",
        chapterTitle: "Comeco",
        chapterSortOrder: 1,
        block: {
          id: "slide-block-1",
          title: "Introducao",
          type: "rich_text",
          payloadJson: JSON.stringify({ markdown: "Primeira parte" }),
          sortOrder: 1,
        },
        sourceBlockId: "block-rich-text",
        slideNumber: 1,
        slideCount: 2,
      },
      {
        pageNumber: 2,
        chapterId: "chapter-1",
        chapterTitle: "Comeco",
        chapterSortOrder: 1,
        block: {
          id: "slide-checklist-1",
          title: "Checklist inicial",
          type: "checklist",
          payloadJson: JSON.stringify({
            items: [
              { id: "item-1", label: "Primeiro passo" },
              { id: "item-2", label: "Segundo passo" },
            ],
          }),
          sortOrder: 2,
        },
        sourceBlockId: "block-checklist",
        slideNumber: 1,
        slideCount: 1,
      },
    ]);

    const page = await ProductReadPage({
      params: Promise.resolve({ slug: "guia-pratico" }),
      searchParams: Promise.resolve({ page: "2" }),
    });
    const action = findFormActionByButtonLabel(page, "Salvar checklist");

    expect(action).toBeTypeOf("function");

    const formData = new FormData();
    formData.append("allItemIds", "item-1");
    formData.append("allItemIds", "item-2");
    formData.append("checkedItemIds", "item-1");
    formData.append("checkedItemIds", "item-2");

    await (action as (formData: FormData) => Promise<void>)(formData);

    expect(setChecklistProgress).toHaveBeenCalledWith({
      userId: "user-1",
      productId: "prod-1",
      chapterId: "chapter-1",
      blockId: "block-checklist",
      allItemIds: ["item-1", "item-2"],
      checkedItemIds: ["item-1", "item-2"],
    });
    expect(setBlockCompletion).not.toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith(
      "/products/guia-pratico/read?page=2",
    );
    expect(revalidatePath).toHaveBeenCalledWith("/library");
  });
});
