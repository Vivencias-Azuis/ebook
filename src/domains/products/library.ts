import { and, asc, eq } from "drizzle-orm";

import { db } from "@/db/client";
import { entitlements, products } from "@/db/schema";

export type LibraryProduct = {
  entitlementId: string;
  entitlementCreatedAt: Date;
  productId: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string;
  priceCents: number;
  currency: string;
  status: "draft" | "published" | "archived";
};

export async function getUserLibraryProducts(userId: string) {
  return db
    .select({
      entitlementId: entitlements.id,
      entitlementCreatedAt: entitlements.createdAt,
      productId: products.id,
      slug: products.slug,
      title: products.title,
      subtitle: products.subtitle,
      description: products.description,
      priceCents: products.priceCents,
      currency: products.currency,
      status: products.status,
    })
    .from(entitlements)
    .innerJoin(products, eq(entitlements.productId, products.id))
    .where(
      and(eq(entitlements.userId, userId), eq(entitlements.status, "active")),
    )
    .orderBy(asc(entitlements.createdAt));
}
