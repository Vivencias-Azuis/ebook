import { expect, it } from "vitest";

import {
  CheckoutSessionPersistenceError,
  persistCheckoutSessionCompleted,
  type CheckoutSessionCompletedSession,
  type CheckoutSessionPersistenceRepository,
} from "@/domains/orders/persistence";

function buildSession(
  overrides: Partial<CheckoutSessionCompletedSession> = {},
): CheckoutSessionCompletedSession {
  return {
    id: "cs_test_123",
    payment_intent: "pi_test_123",
    amount_total: 29700,
    currency: "brl",
    metadata: {
      productId: "prod_123",
      userId: "user_123",
    },
    ...overrides,
    metadata: {
      productId: "prod_123",
      userId: "user_123",
      ...(overrides.metadata ?? {}),
    },
  } as CheckoutSessionCompletedSession;
}

class FakeCheckoutSessionPersistenceRepository
  implements CheckoutSessionPersistenceRepository
{
  public readonly orders = new Map<string, Awaited<
    ReturnType<CheckoutSessionPersistenceRepository["upsertOrder"]>
  >>();

  public readonly entitlements = new Map<string, Awaited<
    ReturnType<CheckoutSessionPersistenceRepository["ensureActiveEntitlement"]>
  >>();

  public upsertOrderCalls = 0;

  public ensureActiveEntitlementCalls = 0;

  async upsertOrder(input: Parameters<
    CheckoutSessionPersistenceRepository["upsertOrder"]
  >[0]) {
    this.upsertOrderCalls += 1;

    const existing = this.orders.get(input.stripeCheckoutSessionId);

    if (existing) {
      const updated = { ...existing, ...input };
      this.orders.set(input.stripeCheckoutSessionId, updated);
      return updated;
    }

    const created = {
      id: `order_${this.orders.size + 1}`,
      status: "paid" as const,
      ...input,
    };

    this.orders.set(input.stripeCheckoutSessionId, created);
    return created;
  }

  async ensureActiveEntitlement(input: Parameters<
    CheckoutSessionPersistenceRepository["ensureActiveEntitlement"]
  >[0]) {
    this.ensureActiveEntitlementCalls += 1;

    const key = `${input.userId}:${input.productId}`;
    const existing = this.entitlements.get(key);

    if (existing) {
      return existing;
    }

    const created = {
      id: `entitlement_${this.entitlements.size + 1}`,
      status: "active" as const,
      ...input,
    };

    this.entitlements.set(key, created);
    return created;
  }
}

it("persists the first checkout completion into an order and entitlement intent", async () => {
  const repository = new FakeCheckoutSessionPersistenceRepository();

  const result = await persistCheckoutSessionCompleted(
    buildSession(),
    repository,
  );

  expect(repository.upsertOrderCalls).toBe(1);
  expect(repository.ensureActiveEntitlementCalls).toBe(1);
  expect(repository.orders.get("cs_test_123")).toMatchObject({
    stripeCheckoutSessionId: "cs_test_123",
    stripePaymentIntentId: "pi_test_123",
    userId: "user_123",
    productId: "prod_123",
    amountCents: 29700,
    currency: "brl",
    status: "paid",
  });
  expect(repository.entitlements.get("user_123:prod_123")).toMatchObject({
    userId: "user_123",
    productId: "prod_123",
    sourceOrderId: result.order.id,
    status: "active",
  });
});

it("does not create duplicate order or entitlement records for the same session twice", async () => {
  const repository = new FakeCheckoutSessionPersistenceRepository();
  const session = buildSession();

  await persistCheckoutSessionCompleted(session, repository);
  await persistCheckoutSessionCompleted(session, repository);

  expect(repository.upsertOrderCalls).toBe(2);
  expect(repository.ensureActiveEntitlementCalls).toBe(2);
  expect(repository.orders.size).toBe(1);
  expect(repository.entitlements.size).toBe(1);
  expect(repository.orders.get("cs_test_123")).toMatchObject({
    stripeCheckoutSessionId: "cs_test_123",
    userId: "user_123",
    productId: "prod_123",
  });
});

it("rejects missing checkout metadata before any persistence calls run", async () => {
  const repository = new FakeCheckoutSessionPersistenceRepository();

  await expect(
    persistCheckoutSessionCompleted(
      buildSession({
        metadata: {
          productId: "prod_123",
          userId: undefined,
        } as CheckoutSessionCompletedSession["metadata"],
      }),
      repository,
    ),
  ).rejects.toBeInstanceOf(CheckoutSessionPersistenceError);

  expect(repository.upsertOrderCalls).toBe(0);
  expect(repository.ensureActiveEntitlementCalls).toBe(0);
  expect(repository.orders.size).toBe(0);
  expect(repository.entitlements.size).toBe(0);
});
