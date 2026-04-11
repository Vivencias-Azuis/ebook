import { and, eq } from "drizzle-orm";

import { db } from "@/db/client";
import { entitlements } from "@/db/schema";

export type UserProductEntitlement = typeof entitlements.$inferSelect;

export function canAccessProduct(
  entitlement: Pick<UserProductEntitlement, "status"> | null,
) {
  return entitlement?.status === "active";
}

export async function getUserProductEntitlement(
  userId: string,
  productId: string,
) {
  const [entitlement] = await db
    .select()
    .from(entitlements)
    .where(
      and(
        eq(entitlements.userId, userId),
        eq(entitlements.productId, productId),
      ),
    )
    .limit(1);

  return entitlement ?? null;
}
