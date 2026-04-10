import { describe, expect, it } from "vitest";

import { hasAdminRole } from "@/domains/admin/access";

describe("hasAdminRole", () => {
  it("returns true for admin users", () => {
    expect(hasAdminRole({ role: "admin" })).toBe(true);
  });

  it("returns false for customer users", () => {
    expect(hasAdminRole({ role: "customer" })).toBe(false);
  });

  it("returns false for missing users", () => {
    expect(hasAdminRole(null)).toBe(false);
  });
});
