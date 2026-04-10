import { randomUUID } from "node:crypto";

import { and, eq } from "drizzle-orm";
import Stripe from "stripe";

import { db } from "@/db/client";
import { entitlements, orders } from "@/db/schema";

export type CheckoutSessionCompletedSession = Pick<
  Stripe.Checkout.Session,
  "id" | "payment_intent" | "metadata" | "amount_total" | "currency"
>;

export type CheckoutOrderRecord = typeof orders.$inferSelect;
export type CheckoutEntitlementRecord = typeof entitlements.$inferSelect;

export type CheckoutOrderUpsertInput = Pick<
  CheckoutOrderRecord,
  | "userId"
  | "productId"
  | "stripeCheckoutSessionId"
  | "stripePaymentIntentId"
  | "status"
  | "amountCents"
  | "currency"
>;

export type CheckoutEntitlementInput = Pick<
  CheckoutEntitlementRecord,
  "userId" | "productId" | "sourceOrderId"
>;

export type CheckoutSessionCompletedResult = {
  order: CheckoutOrderRecord;
  entitlement: CheckoutEntitlementRecord;
};

export type CheckoutSessionPersistenceRepository = {
  upsertOrder(input: CheckoutOrderUpsertInput): Promise<CheckoutOrderRecord>;
  ensureActiveEntitlement(
    input: CheckoutEntitlementInput,
  ): Promise<CheckoutEntitlementRecord>;
};

export class CheckoutSessionPersistenceError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "missing_metadata"
      | "missing_amount_total"
      | "missing_currency"
      | "invalid_session_payload",
  ) {
    super(message);
    this.name = "CheckoutSessionPersistenceError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

function getPaymentIntentId(
  paymentIntent: CheckoutSessionCompletedSession["payment_intent"],
) {
  if (typeof paymentIntent === "string") {
    return paymentIntent;
  }

  return paymentIntent?.id ?? null;
}

function requireNonEmptyString(
  value: unknown,
  fieldName: string,
  code: CheckoutSessionPersistenceError["code"] = "invalid_session_payload",
) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new CheckoutSessionPersistenceError(
      `checkout.session.completed is missing required ${fieldName}`,
      code,
    );
  }

  return value.trim();
}

function requireAmountTotal(amountTotal: CheckoutSessionCompletedSession["amount_total"]) {
  if (typeof amountTotal !== "number" || !Number.isInteger(amountTotal)) {
    throw new CheckoutSessionPersistenceError(
      "checkout.session.completed is missing required amount_total",
      "missing_amount_total",
    );
  }

  return amountTotal;
}

function requireCurrency(currency: CheckoutSessionCompletedSession["currency"]) {
  if (typeof currency !== "string" || currency.trim() === "") {
    throw new CheckoutSessionPersistenceError(
      "checkout.session.completed is missing required currency",
      "missing_currency",
    );
  }

  return currency.trim();
}

export function buildCheckoutSessionCompletedLog(
  session: CheckoutSessionCompletedSession,
) {
  return {
    sessionId: session.id,
    paymentIntentId: getPaymentIntentId(session.payment_intent),
    productId: session.metadata?.productId ?? null,
    userId: session.metadata?.userId ?? null,
    amountTotal: session.amount_total ?? null,
    currency: session.currency ?? null,
  };
}

export async function persistCheckoutSessionCompleted(
  session: CheckoutSessionCompletedSession,
  repository: CheckoutSessionPersistenceRepository = checkoutSessionPersistenceRepository,
) {
  const productId = requireNonEmptyString(
    session.metadata?.productId,
    "productId",
    "missing_metadata",
  );
  const userId = requireNonEmptyString(
    session.metadata?.userId,
    "userId",
    "missing_metadata",
  );
  const amountCents = requireAmountTotal(session.amount_total);
  const currency = requireCurrency(session.currency);
  const stripePaymentIntentId = getPaymentIntentId(session.payment_intent);

  const order = await repository.upsertOrder({
    userId,
    productId,
    stripeCheckoutSessionId: session.id,
    stripePaymentIntentId,
    status: "paid",
    amountCents,
    currency,
  });

  const entitlement = await repository.ensureActiveEntitlement({
    userId,
    productId,
    sourceOrderId: order.id,
  });

  return {
    order,
    entitlement,
  } satisfies CheckoutSessionCompletedResult;
}

export const checkoutSessionPersistenceRepository: CheckoutSessionPersistenceRepository =
  {
    async upsertOrder(input) {
      const [order] = await db
        .insert(orders)
        .values({
          id: randomUUID(),
          userId: input.userId,
          productId: input.productId,
          stripeCheckoutSessionId: input.stripeCheckoutSessionId,
          stripePaymentIntentId: input.stripePaymentIntentId,
          status: input.status,
          amountCents: input.amountCents,
          currency: input.currency,
        })
        .onConflictDoUpdate({
          target: orders.stripeCheckoutSessionId,
          set: {
            userId: input.userId,
            productId: input.productId,
            stripePaymentIntentId: input.stripePaymentIntentId,
            status: input.status,
            amountCents: input.amountCents,
            currency: input.currency,
          },
        })
        .returning();

      if (!order) {
        throw new Error("Failed to persist Stripe checkout order");
      }

      return order;
    },

    async ensureActiveEntitlement(input) {
      const [createdEntitlement] = await db
        .insert(entitlements)
        .values({
          id: randomUUID(),
          userId: input.userId,
          productId: input.productId,
          sourceOrderId: input.sourceOrderId,
          status: "active",
        })
        .onConflictDoNothing()
        .returning();

      if (createdEntitlement) {
        return createdEntitlement;
      }

      const [entitlement] = await db
        .select()
        .from(entitlements)
        .where(
          and(
            eq(entitlements.userId, input.userId),
            eq(entitlements.productId, input.productId),
          ),
        )
        .limit(1);

      if (!entitlement) {
        throw new Error("Failed to persist Stripe entitlement");
      }

      return entitlement;
    },
  };
