import { expect, it } from "vitest";

import { canAccessProduct } from "@/domains/orders/access";

it('canAccessProduct({ status: "active" }) returns true', () => {
  expect(canAccessProduct({ status: "active" })).toBe(true);
});

it("canAccessProduct(null) returns false", () => {
  expect(canAccessProduct(null)).toBe(false);
});

it('canAccessProduct({ status: "revoked" }) returns false', () => {
  expect(canAccessProduct({ status: "revoked" })).toBe(false);
});
