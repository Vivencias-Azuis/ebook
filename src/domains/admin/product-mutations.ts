import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";

import { db } from "@/db/client";
import { products } from "@/db/schema";

export type CreateProductInput = {
  title: string;
  slug: string;
  description: string;
  priceCents: number;
  subtitle?: string;
  stripePriceId?: string;
};

export type UpdateProductInput = Partial<{
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  priceCents: number;
  status: "draft" | "published" | "archived";
  stripePriceId: string;
}>;

function isUniqueConstraintError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  // Check the error message itself and traverse the cause chain
  const isUnique = (msg: string) => msg.includes("UNIQUE constraint failed");
  if (isUnique(err.message)) return true;
  // libSQL wraps errors; check cause
  const cause = (err as { cause?: unknown }).cause;
  if (cause instanceof Error && isUnique(cause.message)) return true;
  // Some drivers stringify the cause into the message differently
  const str = String(err);
  return isUnique(str);
}

function normalizeSlug(slug: string): string {
  return slug.trim().toLowerCase().replace(/\s+/g, "-");
}

function validateCreateInput(input: CreateProductInput) {
  if (!input.title || input.title.trim() === "") {
    throw new Error("title is required");
  }
  if (!input.slug || input.slug.trim() === "") {
    throw new Error("slug is required");
  }
  if (!input.description || input.description.trim() === "") {
    throw new Error("description is required");
  }
  if (input.priceCents < 0) {
    throw new Error("priceCents must be >= 0");
  }
}

export async function createProduct(input: CreateProductInput) {
  validateCreateInput(input);

  const id = randomUUID();
  const slug = normalizeSlug(input.slug);

  try {
    const [product] = await db
      .insert(products)
      .values({
        id,
        slug,
        title: input.title,
        description: input.description,
        priceCents: input.priceCents,
        subtitle: input.subtitle ?? null,
        stripePriceId: input.stripePriceId ?? null,
        currency: "brl",
        status: "draft",
      })
      .returning();

    if (!product) {
      throw new Error("Failed to create product");
    }

    return product;
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      throw new Error("slug already exists");
    }
    throw err;
  }
}

export async function updateProduct(
  productId: string,
  input: UpdateProductInput,
) {
  const updateValues = Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined),
  ) as UpdateProductInput;

  if (updateValues.slug !== undefined) {
    updateValues.slug = normalizeSlug(updateValues.slug);
  }

  try {
    const [product] = await db
      .update(products)
      .set(updateValues)
      .where(eq(products.id, productId))
      .returning();

    return product ?? null;
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      throw new Error("slug already exists");
    }
    throw err;
  }
}
