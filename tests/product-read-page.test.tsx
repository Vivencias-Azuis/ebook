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
  it("renders the editorial reader shell and current progress", async () => {
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
              content:
                "<p>Voce nao precisa organizar tudo hoje. Vamos por partes.</p>",
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
    expect(markup).toContain("va-reader-bar");
    expect(markup).toContain("va-reader-panel");
    expect(markup).toContain("Ocultar sumário");
    expect(markup).toContain("reader-sidebar-root");
    expect(markup).toContain('aria-expanded="true"');
    expect(markup).toContain("Página 1 de 1");
    expect(markup).toContain("24%");
    expect(markup).toContain("Boas-vindas");
  });
});
