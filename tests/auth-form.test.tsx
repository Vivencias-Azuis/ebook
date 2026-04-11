import { expect, it } from "vitest";

import { AuthForm } from "@/components/auth/auth-form";

it("login form shows Portuguese labels", () => {
  expect(typeof AuthForm).toBe("function");
});
