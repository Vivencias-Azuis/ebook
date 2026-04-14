/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/domains/auth/server", () => ({
  requireServerSession: vi.fn(),
}));

vi.mock("@/domains/products/library", () => ({
  deriveLibraryCheckoutMessage: vi.fn(),
  getUserLibraryProducts: vi.fn(),
}));

vi.mock("@/domains/progress/queries", () => ({
  getUserProgressSummariesForProducts: vi.fn(),
}));

import LibraryPage from "@/app/library/page";
import { requireServerSession } from "@/domains/auth/server";
import {
  deriveLibraryCheckoutMessage,
  getUserLibraryProducts,
} from "@/domains/products/library";
import { getUserProgressSummariesForProducts } from "@/domains/progress/queries";

describe("LibraryPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists published courses even without payment and exposes a preview CTA", async () => {
    vi.mocked(requireServerSession).mockResolvedValue({
      user: { id: "user-1" },
    } as any);
    vi.mocked(getUserLibraryProducts).mockResolvedValue([
      {
        entitlementId: null,
        entitlementCreatedAt: null,
        productId: "prod-1",
        slug: "curso-preview",
        title: "Curso Preview",
        subtitle: null,
        description: "Primeiro curso visível mesmo sem pagamento.",
        priceCents: 29700,
        currency: "brl",
        status: "published",
        hasAccess: false,
      },
    ] as any);
    vi.mocked(getUserProgressSummariesForProducts).mockResolvedValue({});
    vi.mocked(deriveLibraryCheckoutMessage).mockReturnValue(null);

    const page = await LibraryPage({
      searchParams: Promise.resolve({}),
    });
    const markup = renderToStaticMarkup(page);

    expect(markup).toContain("Curso Preview");
    expect(markup).toContain("Primeiro curso visível mesmo sem pagamento.");
    expect(markup).toContain("Ler capítulo 1");
    expect(markup).toContain("/products/curso-preview/read");
    expect(markup).toContain("Sair");
    expect(markup).not.toContain(
      "Você ainda não tem guias liberados na biblioteca.",
    );
  });
});
