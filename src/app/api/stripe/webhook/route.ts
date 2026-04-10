import Stripe from "stripe";
import { NextResponse } from "next/server";

import {
  buildCheckoutSessionCompletedLog,
  stripe,
} from "@/domains/orders/stripe";
import {
  CheckoutSessionPersistenceError,
  persistCheckoutSessionCompleted,
} from "@/domains/orders/persistence";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 },
    );
  }

  const rawBody = await request.text();

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET is required" },
      { status: 500 },
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid stripe signature" },
      { status: 400 },
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const summary = buildCheckoutSessionCompletedLog(session);

    try {
      const result = await persistCheckoutSessionCompleted(session);
      console.info("checkout.session.completed", {
        ...summary,
        orderId: result.order.id,
        entitlementId: result.entitlement.id,
        persisted: true,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown persistence error";

      console.error("checkout.session.completed.persistence_failed", {
        ...summary,
        error: message,
      });

      if (error instanceof CheckoutSessionPersistenceError) {
        return NextResponse.json(
          { error: "checkout.session.completed persistence failed" },
          { status: 500 },
        );
      }

      return NextResponse.json(
        { error: "checkout.session.completed persistence failed" },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ received: true });
}
