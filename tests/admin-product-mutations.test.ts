import { inArray } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { db } from "@/db/client";
import { products } from "@/db/schema";
import { getAllProductsForAdmin } from "@/domains/admin/product-queries";
import {
  createProduct,
  updateProduct,
} from "@/domains/admin/product-mutations";
import { getPublishedProducts } from "@/domains/products/queries";

const TEST_IDS = [
  "test-admin-product-draft",
  "test-admin-product-published",
  "test-admin-product-archived",
];

async function seedTestProducts() {
  await db.insert(products).values([
    {
      id: "test-admin-product-draft",
      slug: "test-admin-product-draft",
      title: "Draft Product",
      description: "A draft product",
      priceCents: 1000,
      currency: "brl",
      status: "draft",
    },
    {
      id: "test-admin-product-published",
      slug: "test-admin-product-published",
      title: "Published Product",
      description: "A published product",
      priceCents: 2000,
      currency: "brl",
      status: "published",
    },
    {
      id: "test-admin-product-archived",
      slug: "test-admin-product-archived",
      title: "Archived Product",
      description: "An archived product",
      priceCents: 3000,
      currency: "brl",
      status: "archived",
    },
  ]);
}

async function cleanupTestProducts() {
  await db.delete(products).where(inArray(products.id, TEST_IDS));
}

describe("getAllProductsForAdmin", () => {
  beforeEach(async () => {
    await cleanupTestProducts();
    await seedTestProducts();
  });

  afterEach(async () => {
    await cleanupTestProducts();
  });

  it("returns all statuses in a single call", async () => {
    const result = await getAllProductsForAdmin();
    const testProducts = result.filter((p) => TEST_IDS.includes(p.id));
    const statuses = testProducts.map((p) => p.status);
    expect(statuses).toContain("draft");
    expect(statuses).toContain("published");
    expect(statuses).toContain("archived");
  });
});

describe("getPublishedProducts (public query contrast)", () => {
  beforeEach(async () => {
    await cleanupTestProducts();
    await seedTestProducts();
  });

  afterEach(async () => {
    await cleanupTestProducts();
  });

  it("excludes draft products from public listing", async () => {
    const result = await getPublishedProducts();
    const ids = result.map((p) => p.id);
    expect(ids).not.toContain("test-admin-product-draft");
  });

  it("excludes archived products from public listing", async () => {
    const result = await getPublishedProducts();
    const ids = result.map((p) => p.id);
    expect(ids).not.toContain("test-admin-product-archived");
  });

  it("includes published products in public listing", async () => {
    const result = await getPublishedProducts();
    const ids = result.map((p) => p.id);
    expect(ids).toContain("test-admin-product-published");
  });
});

const MUTATION_TEST_IDS: string[] = [];

async function cleanupMutationTestProducts() {
  if (MUTATION_TEST_IDS.length === 0) return;
  await db.delete(products).where(inArray(products.id, MUTATION_TEST_IDS));
  MUTATION_TEST_IDS.length = 0;
}

describe("createProduct", () => {
  afterEach(async () => {
    await cleanupMutationTestProducts();
  });

  it("creates a draft product with defaults", async () => {
    const product = await createProduct({
      title: "Test Product",
      slug: "test-create-product-slug",
      description: "A test product",
      priceCents: 1500,
    });
    MUTATION_TEST_IDS.push(product.id);

    expect(product.id).toBeTruthy();
    expect(product.slug).toBe("test-create-product-slug");
    expect(product.currency).toBe("brl");
    expect(product.status).toBe("draft");
    expect(product.title).toBe("Test Product");
    expect(product.priceCents).toBe(1500);
  });

  it("normalizes slug to lowercase with hyphens", async () => {
    const product = await createProduct({
      title: "Slug Test",
      slug: "  My Test SLUG  ",
      description: "Tests slug normalization",
      priceCents: 0,
    });
    MUTATION_TEST_IDS.push(product.id);

    expect(product.slug).toBe("my-test-slug");
  });

  it("rejects duplicate slug with domain error", async () => {
    const product = await createProduct({
      title: "First",
      slug: "test-duplicate-slug",
      description: "First product",
      priceCents: 1000,
    });
    MUTATION_TEST_IDS.push(product.id);

    await expect(
      createProduct({
        title: "Second",
        slug: "test-duplicate-slug",
        description: "Second product",
        priceCents: 2000,
      }),
    ).rejects.toThrow("slug already exists");
  });

  it("throws validation error for empty title", async () => {
    await expect(
      createProduct({
        title: "",
        slug: "test-validation-slug",
        description: "desc",
        priceCents: 100,
      }),
    ).rejects.toThrow("title is required");
  });

  it("throws validation error for empty slug", async () => {
    await expect(
      createProduct({
        title: "Title",
        slug: "",
        description: "desc",
        priceCents: 100,
      }),
    ).rejects.toThrow("slug is required");
  });

  it("throws validation error for empty description", async () => {
    await expect(
      createProduct({
        title: "Title",
        slug: "test-validation-desc-slug",
        description: "",
        priceCents: 100,
      }),
    ).rejects.toThrow("description is required");
  });

  it("throws validation error for negative priceCents", async () => {
    await expect(
      createProduct({
        title: "Title",
        slug: "test-validation-price-slug",
        description: "desc",
        priceCents: -1,
      }),
    ).rejects.toThrow("priceCents must be >= 0");
  });
});

describe("updateProduct", () => {
  let productId: string;

  beforeEach(async () => {
    const product = await createProduct({
      title: "Original Title",
      slug: `test-update-product-${Date.now()}`,
      description: "Original description",
      priceCents: 1000,
    });
    productId = product.id;
    MUTATION_TEST_IDS.push(productId);
  });

  afterEach(async () => {
    await cleanupMutationTestProducts();
  });

  it("updates metadata fields", async () => {
    const updated = await updateProduct(productId, {
      title: "Updated Title",
      priceCents: 2500,
      description: "Updated description",
    });

    expect(updated).not.toBeNull();
    expect(updated!.title).toBe("Updated Title");
    expect(updated!.priceCents).toBe(2500);
    expect(updated!.description).toBe("Updated description");
  });

  it("transitions status from draft to published", async () => {
    const updated = await updateProduct(productId, { status: "published" });

    expect(updated).not.toBeNull();
    expect(updated!.status).toBe("published");
  });

  it("transitions status from published to archived", async () => {
    await updateProduct(productId, { status: "published" });
    const updated = await updateProduct(productId, { status: "archived" });

    expect(updated).not.toBeNull();
    expect(updated!.status).toBe("archived");
  });

  it("returns null for non-existent product", async () => {
    const result = await updateProduct("non-existent-id", { title: "Ghost" });
    expect(result).toBeNull();
  });
});
