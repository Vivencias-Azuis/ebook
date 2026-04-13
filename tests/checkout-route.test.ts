/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/domains/auth/server", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/db/client", () => ({
  db: {
    select: vi.fn(),
  },
}));

vi.mock("@/domains/orders/stripe", () => ({
  stripe: {
    checkout: {
      sessions: {
        create: vi.fn(),
      },
    },
  },
}));

import { POST } from "@/app/api/checkout/route";
import { getServerSession } from "@/domains/auth/server";
import { db } from "@/db/client";
import { stripe } from "@/domains/orders/stripe";

function createDbSelectChain(product: Record<string, unknown> | undefined) {
  return {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue(product ? [product] : []),
  };
}

describe("checkout route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = "sk_test_example";
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "user-1" },
    } as any);
  });

  it("returns a clear 500 error when the product has no stripePriceId", async () => {
    vi.mocked(db.select).mockReturnValue(
      createDbSelectChain({
        id: "prod-1",
        slug: "guia",
        title: "Guia",
        currency: "brl",
        priceCents: 997,
        stripePriceId: null,
      }) as any,
    );

    const request = new Request("http://localhost/api/checkout", {
      method: "POST",
      body: new URLSearchParams({ productId: "prod-1" }),
    });

    const response = await POST(request);

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "Product is missing stripePriceId",
    });
    expect(stripe.checkout.sessions.create).not.toHaveBeenCalled();
  });

  it("creates the checkout session using the stored stripe price id", async () => {
    vi.mocked(db.select).mockReturnValue(
      createDbSelectChain({
        id: "prod-1",
        slug: "guia",
        title: "Guia",
        currency: "brl",
        priceCents: 997,
        stripePriceId: "price_test_123",
      }) as any,
    );
    vi.mocked(stripe.checkout.sessions.create).mockResolvedValue({
      url: "https://checkout.stripe.test/session",
    } as any);

    const request = new Request("http://localhost/api/checkout", {
      method: "POST",
      body: new URLSearchParams({ productId: "prod-1" }),
    });

    const response = await POST(request);

    expect(response.status).toBe(303);
    expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        line_items: [{ price: "price_test_123", quantity: 1 }],
      }),
    );
    expect(stripe.checkout.sessions.create).not.toHaveBeenCalledWith(
      expect.objectContaining({
        line_items: [
          expect.objectContaining({
            price_data: expect.anything(),
          }),
        ],
      }),
    );
  });
});
