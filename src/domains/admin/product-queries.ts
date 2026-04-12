import { asc, eq } from "drizzle-orm";

import { db } from "@/db/client";
import { products } from "@/db/schema";

export async function getAllProductsForAdmin() {
  return db.select().from(products).orderBy(asc(products.createdAt));
}

export async function getProductByIdForAdmin(id: string) {
  const rows = await db.select().from(products).where(eq(products.id, id));
  return rows[0] ?? null;
}
