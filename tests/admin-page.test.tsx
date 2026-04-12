/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/domains/auth/server", () => ({
  requireAdminSession: vi.fn(),
}));

vi.mock("@/domains/products/queries", () => ({
  getPublishedProducts: vi.fn(),
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
import { getPublishedProducts } from "@/domains/products/queries";
import { getRecentOrders, getActiveEntitlements } from "@/domains/orders/admin";

describe("AdminPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireAdminSession).mockResolvedValue(undefined as any);
    vi.mocked(getPublishedProducts).mockResolvedValue([]);
    vi.mocked(getRecentOrders).mockResolvedValue([]);
    vi.mocked(getActiveEntitlements).mockResolvedValue([]);
  });

  it('contains a link to /admin/products/new', async () => {
    const page = await AdminPage();
    const markup = renderToStaticMarkup(page);

    expect(markup).toContain('href="/admin/products/new"');
  });

  it('shows the "Novo produto" CTA text', async () => {
    const page = await AdminPage();
    const markup = renderToStaticMarkup(page);

    expect(markup).toContain("Novo produto");
  });
});
