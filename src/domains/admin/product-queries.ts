import { asc } from "drizzle-orm";

import { db } from "@/db/client";
import { products } from "@/db/schema";

export async function getAllProductsForAdmin() {
  return db.select().from(products).orderBy(asc(products.createdAt));
}
