import { expect, it } from "vitest";

import { db } from "@/db/client";
import { products } from "@/db/schema";

it("loads the db client and schema through the configured alias", () => {
  expect(db).toBeTruthy();
  expect(products.slug.name).toBe("slug");
});
