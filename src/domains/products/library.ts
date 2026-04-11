import { and, asc, eq } from "drizzle-orm";

import { db } from "@/db/client";
import { entitlements, products } from "@/db/schema";

export type LibraryProduct = {
  entitlementId: string | null;
  entitlementCreatedAt: Date | null;
  productId: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string;
  priceCents: number;
  currency: string;
  status: "draft" | "published" | "archived";
  hasAccess: boolean;
};

export function deriveLibraryCheckoutMessage(
  checkoutState: string | undefined,
  hasProducts: boolean,
) {
  if (checkoutState !== "processing") {
    return null;
  }

  if (hasProducts) {
    return "Pagamento recebido. Seu novo acesso pode levar alguns segundos para aparecer na biblioteca.";
  }

  return "Pagamento recebido. Estamos confirmando seu acesso. Se o novo produto ainda nao apareceu, atualize a pagina em alguns segundos.";
}

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
      hasAccess: entitlements.id,
    })
    .from(products)
    .leftJoin(
      entitlements,
      and(
        eq(entitlements.productId, products.id),
        eq(entitlements.userId, userId),
        eq(entitlements.status, "active"),
      ),
    )
    .where(eq(products.status, "published"))
    .orderBy(asc(products.createdAt))
    .then((rows) =>
      rows.map((row) => ({
        ...row,
        hasAccess: row.hasAccess !== null,
      })),
    );
}
