import { inArray } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { db } from "@/db/client";
import { products } from "@/db/schema";
import { getAllProductsForAdmin } from "@/domains/admin/product-queries";
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

  it("returns draft products", async () => {
    const result = await getAllProductsForAdmin();
    const ids = result.map((p) => p.id);
    expect(ids).toContain("test-admin-product-draft");
  });

  it("returns archived products", async () => {
    const result = await getAllProductsForAdmin();
    const ids = result.map((p) => p.id);
    expect(ids).toContain("test-admin-product-archived");
  });

  it("returns published products", async () => {
    const result = await getAllProductsForAdmin();
    const ids = result.map((p) => p.id);
    expect(ids).toContain("test-admin-product-published");
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
