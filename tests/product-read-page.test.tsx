/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

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

import ProductReadPage from "@/app/products/[slug]/read/page";
import { requireServerSession } from "@/domains/auth/server";
import {
  canAccessProduct,
  getUserProductEntitlement,
} from "@/domains/orders/access";
import {
  getUserProductProgress,
  summarizeProductProgress,
} from "@/domains/progress/queries";
import {
  getProductBySlug,
  getPublishedProductContent,
} from "@/domains/products/queries";

describe("ProductReadPage", () => {
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
    expect(markup).toContain("Marcar página como lida");
    expect(markup).toContain("BBBBBBBBBB");
    expect(markup).not.toContain("AAAAAAAAAA");
  });
});
