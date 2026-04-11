/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it, vi } from "vitest";

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

vi.mock("@/domains/products/pdf", () => ({
  ensureProductPdf: vi.fn(),
  normalizeProductContentForPdf: vi.fn(),
}));

vi.mock("node:fs/promises", () => ({
  default: {
    readFile: vi.fn(),
  },
  readFile: vi.fn(),
}));

import { GET } from "@/app/api/products/[slug]/download-pdf/route";
import { requireServerSession } from "@/domains/auth/server";
import { canAccessProduct, getUserProductEntitlement } from "@/domains/orders/access";
import { getProductBySlug, getPublishedProductContent } from "@/domains/products/queries";
import { ensureProductPdf, normalizeProductContentForPdf } from "@/domains/products/pdf";
import { readFile } from "node:fs/promises";

describe("download pdf route", () => {
  it("rejects an invalid variant", async () => {
    const request = new Request("http://localhost/api/products/guia/download-pdf?variant=weird");
    const response = await GET(request, { params: Promise.resolve({ slug: "guia" }) });

    expect(response.status).toBe(400);
  });

  it("returns a pdf attachment for an entitled user", async () => {
    vi.mocked(requireServerSession).mockResolvedValue({ user: { id: "user-1" } } as any);
    vi.mocked(getProductBySlug).mockResolvedValue({
      id: "prod-1",
      slug: "guia",
      title: "Guia",
      subtitle: null,
      status: "published",
    } as any);
    vi.mocked(getUserProductEntitlement).mockResolvedValue({ status: "active" } as any);
    vi.mocked(canAccessProduct).mockReturnValue(true);
    vi.mocked(getPublishedProductContent).mockResolvedValue([]);
    vi.mocked(normalizeProductContentForPdf).mockReturnValue({
      product: { id: "prod-1", slug: "guia", title: "Guia" },
      chapters: [],
    } as any);
    vi.mocked(ensureProductPdf).mockResolvedValue("/path/to/guia-fast.pdf");
    vi.mocked(readFile).mockResolvedValue(Buffer.from("PDF_CONTENT") as any);

    const request = new Request("http://localhost/api/products/guia/download-pdf?variant=fast");
    const response = await GET(request, { params: Promise.resolve({ slug: "guia" }) });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/pdf");
    expect(response.headers.get("content-disposition")).toContain("guia-fast.pdf");
  });

  it("rejects users without entitlement", async () => {
    vi.mocked(requireServerSession).mockResolvedValue({ user: { id: "user-1" } } as any);
    vi.mocked(getProductBySlug).mockResolvedValue({
      id: "prod-1",
      slug: "guia",
      title: "Guia",
      subtitle: null,
      status: "published",
    } as any);
    vi.mocked(getUserProductEntitlement).mockResolvedValue(null);
    vi.mocked(canAccessProduct).mockReturnValue(false);

    const request = new Request("http://localhost/api/products/guia/download-pdf?variant=fast");
    const response = await GET(request, { params: Promise.resolve({ slug: "guia" }) });

    expect(response.status).toBe(403);
  });
});
