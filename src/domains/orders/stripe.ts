export { buildCheckoutSessionCompletedLog } from "@/domains/orders/persistence";

import Stripe from "stripe";

import { ensureProductionEnvironment } from "@/lib/production-env";

ensureProductionEnvironment();

export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder",
  {
    apiVersion: "2026-02-25.clover" as never,
  },
);
