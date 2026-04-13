/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/domains/auth/server", () => ({
  requireAdminSession: vi.fn(),
}));

vi.mock("@/domains/admin/product-queries", () => ({
  getAllProductsForAdmin: vi.fn(),
}));

vi.mock("@/domains/orders/admin", () => ({
  getRecentOrders: vi.fn(),
  getActiveEntitlements: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

import AdminPage from "@/app/admin/page";
import { requireAdminSession } from "@/domains/auth/server";
import { getAllProductsForAdmin } from "@/domains/admin/product-queries";
import { getRecentOrders, getActiveEntitlements } from "@/domains/orders/admin";

const mockProduct = (overrides: Record<string, unknown> = {}) => ({
  id: "prod-1",
  title: "Produto Teste",
  slug: "produto-teste",
  status: "published",
  priceCents: 4900,
  currency: "brl",
  ...overrides,
});

describe("AdminPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireAdminSession).mockResolvedValue(undefined as any);
    vi.mocked(getAllProductsForAdmin).mockResolvedValue([]);
    vi.mocked(getRecentOrders).mockResolvedValue([]);
    vi.mocked(getActiveEntitlements).mockResolvedValue([]);
  });

  it("contains a link to /admin/products/new", async () => {
    const page = await AdminPage();
    const markup = renderToStaticMarkup(page);

    expect(markup).toContain('href="/admin/products/new"');
  });

  it('shows the "Novo produto" CTA text', async () => {
    const page = await AdminPage();
    const markup = renderToStaticMarkup(page);

    expect(markup).toContain("Novo produto");
  });

  it("shows products of all statuses (published, draft, archived)", async () => {
    vi.mocked(getAllProductsForAdmin).mockResolvedValue([
      mockProduct({ id: "prod-pub", status: "published", slug: "pub" }) as any,
      mockProduct({ id: "prod-draft", status: "draft", slug: "draft" }) as any,
      mockProduct({ id: "prod-arch", status: "archived", slug: "arch" }) as any,
    ]);

    const page = await AdminPage();
    const markup = renderToStaticMarkup(page);

    expect(markup).toContain("published");
    expect(markup).toContain("draft");
    expect(markup).toContain("archived");
  });

  it('"Configurar" link points to /admin/products/{id}/settings', async () => {
    vi.mocked(getAllProductsForAdmin).mockResolvedValue([
      mockProduct({ id: "prod-123" }) as any,
    ]);

    const page = await AdminPage();
    const markup = renderToStaticMarkup(page);

    expect(markup).toContain('href="/admin/products/prod-123/settings"');
  });

  it('"Editar conteúdo" link points to /admin/editor/{id}', async () => {
    vi.mocked(getAllProductsForAdmin).mockResolvedValue([
      mockProduct({ id: "prod-456" }) as any,
    ]);

    const page = await AdminPage();
    const markup = renderToStaticMarkup(page);

    expect(markup).toContain('href="/admin/editor/prod-456"');
  });
});
