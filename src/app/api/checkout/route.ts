import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getServerSession } from "@/domains/auth/server";
import { db } from "@/db/client";
import { products } from "@/db/schema";
import { stripe } from "@/domains/orders/stripe";

function getAppBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const productId = formData.get("productId");

  if (typeof productId !== "string" || productId.trim() === "") {
    return NextResponse.json(
      { error: "productId is required" },
      { status: 400 },
    );
  }

  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  if (!product.stripePriceId) {
    return NextResponse.json(
      { error: "Product is missing stripePriceId" },
      { status: 500 },
    );
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "STRIPE_SECRET_KEY is required" },
      { status: 500 },
    );
  }

  const userSession = await getServerSession();
  const baseUrl = getAppBaseUrl();
  const metadata: Record<string, string> = {
    productId: product.id,
  };

  if (userSession?.user?.id) {
    metadata.userId = userSession.user.id;
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    metadata,
    line_items: [
      {
        quantity: 1,
        price: product.stripePriceId,
      },
    ],
    success_url: new URL("/library?checkout=processing", baseUrl).toString(),
    cancel_url: new URL(
      `/products/${product.slug}?checkout=cancelled`,
      baseUrl,
    ).toString(),
  });

  if (!checkoutSession.url) {
    return NextResponse.json(
      { error: "Unable to create checkout session" },
      { status: 500 },
    );
  }

  return NextResponse.redirect(checkoutSession.url, 303);
}
