import { desc, eq } from "drizzle-orm";

import { db } from "@/db/client";
import { entitlements, orders, products, users } from "@/db/schema";

export async function getRecentOrders(limit = 10) {
  return db
    .select({
      id: orders.id,
      status: orders.status,
      amountCents: orders.amountCents,
      currency: orders.currency,
      createdAt: orders.createdAt,
      productTitle: products.title,
      userEmail: users.email,
    })
    .from(orders)
    .innerJoin(products, eq(orders.productId, products.id))
    .innerJoin(users, eq(orders.userId, users.id))
    .orderBy(desc(orders.createdAt))
    .limit(limit);
}

export async function getActiveEntitlements(limit = 10) {
  return db
    .select({
      id: entitlements.id,
      createdAt: entitlements.createdAt,
      productTitle: products.title,
      userEmail: users.email,
      status: entitlements.status,
    })
    .from(entitlements)
    .innerJoin(products, eq(entitlements.productId, products.id))
    .innerJoin(users, eq(entitlements.userId, users.id))
    .orderBy(desc(entitlements.createdAt))
    .limit(limit);
}
