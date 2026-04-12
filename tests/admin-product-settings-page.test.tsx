/* eslint-disable @typescript-eslint/no-explicit-any */
import { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ProductForm } from "@/components/admin/product-form";

// Mock server actions — they use "use server" and cannot run in jsdom
vi.mock("@/app/admin/products/actions", () => ({
  createProductAction: vi.fn(async () => ({ success: false })),
  updateProductAction: vi.fn(async () => ({ success: false })),
}));

// Mock next/navigation (not used directly by ProductForm but transitively)
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  notFound: vi.fn(() => { throw new Error("NEXT_NOT_FOUND"); }),
}));

// Mock next/link so href is rendered as a plain anchor in jsdom
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

vi.mock("@/domains/auth/server", () => ({
  requireAdminSession: vi.fn(),
}));

vi.mock("@/domains/admin/product-queries", () => ({
  getProductByIdForAdmin: vi.fn(),
}));

const MOCK_PRODUCT = {
  id: "prod-abc-123",
  title: "Guia Prático",
  slug: "guia-pratico",
  subtitle: "Um guia essencial",
  description: "Descrição completa do produto",
  priceCents: 4990,
  status: "published",
  stripePriceId: "price_test_123",
};

afterEach(() => {
  document.body.innerHTML = "";
});

beforeEach(() => {
  vi.clearAllMocks();
});

it("renders prefilled values when a product is provided", async () => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  await act(async () => {
    root.render(<ProductForm product={MOCK_PRODUCT} />);
  });

  const titleInput = container.querySelector<HTMLInputElement>("#title");

  if (!titleInput) {
    throw new Error("Title input not found");
  }

  expect(titleInput.value).toBe(MOCK_PRODUCT.title);

  await act(async () => {
    root.unmount();
  });
});

it("shows the editor link when a product is provided", async () => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  await act(async () => {
    root.render(<ProductForm product={MOCK_PRODUCT} />);
  });

  const editorLink = container.querySelector<HTMLAnchorElement>(
    `a[href="/admin/editor/${MOCK_PRODUCT.id}"]`,
  );

  expect(editorLink).not.toBeNull();

  await act(async () => {
    root.unmount();
  });
});

it("editor link points to the correct product path", async () => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  await act(async () => {
    root.render(<ProductForm product={MOCK_PRODUCT} />);
  });

  const editorLink = container.querySelector<HTMLAnchorElement>(
    'a[href^="/admin/editor/"]',
  );

  if (!editorLink) {
    throw new Error("Editor link not found");
  }

  expect(editorLink.getAttribute("href")).toBe(
    `/admin/editor/${MOCK_PRODUCT.id}`,
  );

  expect(editorLink.textContent).toContain("Editar conteúdo do produto");

  await act(async () => {
    root.unmount();
  });
});

it("does not show the editor link in create mode (no product)", async () => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  await act(async () => {
    root.render(<ProductForm />);
  });

  const editorLink = container.querySelector<HTMLAnchorElement>(
    'a[href^="/admin/editor/"]',
  );

  expect(editorLink).toBeNull();

  await act(async () => {
    root.unmount();
  });
});

// ─── Settings page (server component) ────────────────────────────────────────

describe("ProductSettingsPage", () => {
  beforeEach(async () => {
    const { requireAdminSession } = await import("@/domains/auth/server");
    vi.mocked(requireAdminSession).mockResolvedValue(undefined as any);

    const { getProductByIdForAdmin } = await import(
      "@/domains/admin/product-queries"
    );
    vi.mocked(getProductByIdForAdmin).mockResolvedValue({
      ...MOCK_PRODUCT,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);
  });

  it("renders the product title in the heading subtitle", async () => {
    const { default: ProductSettingsPage } = await import(
      "@/app/admin/products/[productId]/settings/page"
    );

    const page = await ProductSettingsPage({
      params: Promise.resolve({ productId: MOCK_PRODUCT.id }),
    });
    const markup = renderToStaticMarkup(page as React.ReactElement);

    expect(markup).toContain(MOCK_PRODUCT.title);
    expect(markup).toContain("Configurações do produto");
  });

  it("renders quick links for public page, reader, and editor", async () => {
    const { default: ProductSettingsPage } = await import(
      "@/app/admin/products/[productId]/settings/page"
    );

    const page = await ProductSettingsPage({
      params: Promise.resolve({ productId: MOCK_PRODUCT.id }),
    });
    const markup = renderToStaticMarkup(page as React.ReactElement);

    expect(markup).toContain(`href="/products/${MOCK_PRODUCT.slug}"`);
    expect(markup).toContain(`href="/products/${MOCK_PRODUCT.slug}/read"`);
    expect(markup).toContain(`href="/admin/editor/${MOCK_PRODUCT.id}"`);
  });
});
