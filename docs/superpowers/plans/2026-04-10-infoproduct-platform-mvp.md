# Infoproduct Platform MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first working MVP of a Next.js infoproduct platform with one-time Stripe purchases, Turso-backed access control, a customer library, a basic interactive reader, and an admin content shell.

**Architecture:** Start with a single Next.js App Router application. Use Turso/libSQL through Drizzle for persistence, better-auth for email/password sessions and roles, Stripe Checkout Sessions for one-time payments, and a block-based content model for interactive reading. Keep the first slice intentionally small but production-shaped: auth, access checks, webhook idempotency, and content rendering are first-class.

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS, Drizzle ORM, Turso/libSQL, better-auth, Stripe Checkout Sessions, Zod, Vitest, Playwright.

---

## Scope

This plan implements the MVP foundation, not the full commercial polish. It creates a working platform where an admin-seeded product can be sold, unlocked by Stripe webhook, shown in a customer library, and read in a simple block renderer.

Out of scope for this first implementation pass:

- Advanced visual design.
- Rich drag-and-drop editor.
- Production file uploads.
- Complex quiz scoring.
- Email automations.
- Refund automation.

## File Structure

Create this structure:

```txt
package.json
next.config.ts
tsconfig.json
drizzle.config.ts
vitest.config.ts
.env.example
src/app/(public)/page.tsx
src/app/(public)/products/[slug]/page.tsx
src/app/(auth)/login/page.tsx
src/app/(auth)/register/page.tsx
src/app/(customer)/library/page.tsx
src/app/(customer)/products/[slug]/read/page.tsx
src/app/(admin)/admin/page.tsx
src/app/api/auth/[...all]/route.ts
src/app/api/checkout/route.ts
src/app/api/stripe/webhook/route.ts
src/db/client.ts
src/db/schema.ts
src/db/seed.ts
src/domains/auth/server.ts
src/domains/products/queries.ts
src/domains/orders/access.ts
src/domains/orders/stripe.ts
src/domains/content/blocks.ts
src/features/reader/block-renderer.tsx
src/features/reader/progress-actions.ts
src/features/admin/admin-guard.ts
src/lib/env.ts
src/lib/format.ts
tests/access.test.ts
tests/blocks.test.ts
tests/stripe-webhook.test.ts
```

## Task 1: Scaffold Next.js App

**Files:**

- Create: `package.json`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `src/app/layout.tsx`
- Create: `src/app/globals.css`
- Create: `.gitignore`
- Create: `.env.example`

- [ ] **Step 1: Create the Next.js project files**

Run:

```bash
npm create next-app@latest . -- --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

Expected: a Next.js app is created in the current directory.

- [ ] **Step 2: Install MVP dependencies**

Run:

```bash
npm install drizzle-orm @libsql/client better-auth stripe zod
npm install -D drizzle-kit vitest @vitejs/plugin-react jsdom playwright
```

Expected: dependencies are added to `package.json`.

- [ ] **Step 3: Add environment template**

Create `.env.example` with:

```env
DATABASE_URL="libsql://your-database.turso.io"
DATABASE_AUTH_TOKEN="your-turso-token"
BETTER_AUTH_SECRET="replace-with-strong-secret"
BETTER_AUTH_URL="http://localhost:3000"
STRIPE_SECRET_KEY="sk_test_replace"
STRIPE_WEBHOOK_SECRET="whsec_replace"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

- [ ] **Step 4: Verify baseline**

Run:

```bash
npm run lint
npm run build
```

Expected: both commands complete successfully.

## Task 2: Database Schema and Seed

**Files:**

- Create: `drizzle.config.ts`
- Create: `src/db/client.ts`
- Create: `src/db/schema.ts`
- Create: `src/db/seed.ts`
- Create: `vitest.config.ts`
- Modify: `package.json`

- [ ] **Step 1: Add Drizzle config**

Create `drizzle.config.ts`:

```ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  },
});
```

- [ ] **Step 2: Add database client**

Create `src/db/client.ts`:

```ts
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

export const libsql = createClient({
  url: process.env.DATABASE_URL ?? "file:local.db",
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

export const db = drizzle(libsql, { schema });
```

- [ ] **Step 3: Add initial schema**

Create `src/db/schema.ts` with tables for users, products, chapters, blocks, orders, entitlements, and progress:

```ts
import { relations, sql } from "drizzle-orm";
import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .notNull()
    .default(false),
  image: text("image"),
  role: text("role", { enum: ["customer", "admin"] })
    .notNull()
    .default("customer"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  description: text("description").notNull(),
  priceCents: integer("price_cents").notNull(),
  currency: text("currency").notNull().default("brl"),
  status: text("status", { enum: ["draft", "published", "archived"] })
    .notNull()
    .default("draft"),
  stripePriceId: text("stripe_price_id"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const chapters = sqliteTable("chapters", {
  id: text("id").primaryKey(),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  sortOrder: integer("sort_order").notNull(),
  isPublished: integer("is_published", { mode: "boolean" })
    .notNull()
    .default(false),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const contentBlocks = sqliteTable("content_blocks", {
  id: text("id").primaryKey(),
  chapterId: text("chapter_id")
    .notNull()
    .references(() => chapters.id, { onDelete: "cascade" }),
  type: text("type", {
    enum: [
      "rich_text",
      "callout",
      "checklist",
      "download",
      "audio",
      "video",
      "quiz",
      "divider",
    ],
  }).notNull(),
  title: text("title"),
  payloadJson: text("payload_json").notNull(),
  sortOrder: integer("sort_order").notNull(),
  isPublished: integer("is_published", { mode: "boolean" })
    .notNull()
    .default(false),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  productId: text("product_id")
    .notNull()
    .references(() => products.id),
  stripeCheckoutSessionId: text("stripe_checkout_session_id")
    .notNull()
    .unique(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  status: text("status", {
    enum: ["pending", "paid", "failed", "refunded"],
  }).notNull(),
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const entitlements = sqliteTable(
  "entitlements",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    productId: text("product_id")
      .notNull()
      .references(() => products.id),
    sourceOrderId: text("source_order_id").references(() => orders.id),
    status: text("status", { enum: ["active", "revoked"] })
      .notNull()
      .default("active"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    userProductUnique: uniqueIndex("entitlements_user_product_unique").on(
      table.userId,
      table.productId,
    ),
  }),
);

export const progress = sqliteTable(
  "progress",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    productId: text("product_id")
      .notNull()
      .references(() => products.id),
    chapterId: text("chapter_id").references(() => chapters.id),
    blockId: text("block_id").references(() => contentBlocks.id),
    state: text("state").notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    progressUnique: uniqueIndex("progress_user_product_block_unique").on(
      table.userId,
      table.productId,
      table.blockId,
    ),
  }),
);

export const productRelations = relations(products, ({ many }) => ({
  chapters: many(chapters),
}));

export const chapterRelations = relations(chapters, ({ one, many }) => ({
  product: one(products, {
    fields: [chapters.productId],
    references: [products.id],
  }),
  blocks: many(contentBlocks),
}));
```

- [ ] **Step 4: Add scripts**

Modify `package.json` scripts:

```json
{
  "db:generate": "drizzle-kit generate",
  "db:migrate": "drizzle-kit migrate",
  "db:seed": "tsx src/db/seed.ts",
  "test": "vitest run"
}
```

Also install `tsx`:

```bash
npm install -D tsx
```

- [ ] **Step 5: Add Vitest config**

Create `vitest.config.ts`:

```ts
import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

- [ ] **Step 6: Add seed**

Create `src/db/seed.ts`:

```ts
import { db } from "./client";
import { chapters, contentBlocks, products } from "./schema";

await db
  .insert(products)
  .values({
    id: "prod_primeiros_30_dias",
    slug: "primeiros-30-dias-apos-o-diagnostico",
    title: "Guia Prático: Primeiros 30 Dias Após o Diagnóstico",
    subtitle:
      "Um roteiro claro e acolhedor para sair da paralisia e agir com confiança.",
    description:
      "Plano prático em quatro semanas para famílias após o diagnóstico de autismo.",
    priceCents: 6700,
    currency: "brl",
    status: "published",
  })
  .onConflictDoNothing();

await db
  .insert(chapters)
  .values({
    id: "chap_intro",
    productId: "prod_primeiros_30_dias",
    title: "Como usar este guia",
    sortOrder: 1,
    isPublished: true,
  })
  .onConflictDoNothing();

await db
  .insert(contentBlocks)
  .values({
    id: "block_intro_text",
    chapterId: "chap_intro",
    type: "rich_text",
    title: "Você não precisa descobrir tudo hoje",
    payloadJson: JSON.stringify({
      markdown:
        "Este guia organiza seus próximos 30 dias em passos pequenos, claros e possíveis.",
    }),
    sortOrder: 1,
    isPublished: true,
  })
  .onConflictDoNothing();
```

- [ ] **Step 7: Verify database setup**

Run:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

Expected: migration is generated, applied, and seed completes without duplicate errors.

## Task 3: Content Block Validation and Rendering

**Files:**

- Create: `src/domains/content/blocks.ts`
- Create: `src/features/reader/block-renderer.tsx`
- Create: `tests/blocks.test.ts`

- [ ] **Step 1: Write block validation tests**

Create `tests/blocks.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { parseBlockPayload } from "@/domains/content/blocks";

describe("parseBlockPayload", () => {
  it("accepts rich text payloads", () => {
    const result = parseBlockPayload(
      "rich_text",
      JSON.stringify({ markdown: "Hello" }),
    );
    expect(result).toEqual({ markdown: "Hello" });
  });

  it("rejects invalid checklist payloads", () => {
    expect(() =>
      parseBlockPayload("checklist", JSON.stringify({ items: "bad" })),
    ).toThrow();
  });
});
```

- [ ] **Step 2: Run test and verify failure**

Run:

```bash
npm test -- tests/blocks.test.ts
```

Expected: FAIL because `parseBlockPayload` does not exist.

- [ ] **Step 3: Implement block parser**

Create `src/domains/content/blocks.ts`:

```ts
import { z } from "zod";

export const blockTypeSchema = z.enum([
  "rich_text",
  "callout",
  "checklist",
  "download",
  "audio",
  "video",
  "quiz",
  "divider",
]);
export type BlockType = z.infer<typeof blockTypeSchema>;

const schemas = {
  rich_text: z.object({ markdown: z.string().min(1) }),
  callout: z.object({
    tone: z.enum(["info", "warning", "success"]),
    body: z.string().min(1),
  }),
  checklist: z.object({
    items: z
      .array(z.object({ id: z.string().min(1), label: z.string().min(1) }))
      .min(1),
  }),
  download: z.object({ assetId: z.string().min(1), label: z.string().min(1) }),
  audio: z.object({ url: z.string().url(), title: z.string().optional() }),
  video: z.object({ url: z.string().url(), title: z.string().optional() }),
  quiz: z.object({
    question: z.string().min(1),
    answers: z
      .array(
        z.object({
          id: z.string().min(1),
          label: z.string().min(1),
          isCorrect: z.boolean(),
        }),
      )
      .min(2),
  }),
  divider: z.object({}),
} satisfies Record<BlockType, z.ZodTypeAny>;

export function parseBlockPayload(type: BlockType, payloadJson: string) {
  const parsed = JSON.parse(payloadJson);
  return schemas[type].parse(parsed);
}
```

- [ ] **Step 4: Implement basic renderer**

Create `src/features/reader/block-renderer.tsx`:

```tsx
import { parseBlockPayload, type BlockType } from "@/domains/content/blocks";

type BlockRendererProps = {
  type: BlockType;
  title: string | null;
  payloadJson: string;
};

export function BlockRenderer({
  type,
  title,
  payloadJson,
}: BlockRendererProps) {
  const payload = parseBlockPayload(type, payloadJson);

  if (type === "rich_text") {
    return (
      <article className="prose max-w-none whitespace-pre-wrap">
        {payload.markdown}
      </article>
    );
  }

  if (type === "callout") {
    return (
      <aside className="rounded-2xl border bg-blue-50 p-4 text-blue-950">
        {title ? <h3 className="font-semibold">{title}</h3> : null}
        <p>{payload.body}</p>
      </aside>
    );
  }

  if (type === "checklist") {
    return (
      <div className="rounded-2xl border p-4">
        {title ? <h3 className="font-semibold">{title}</h3> : null}
        <ul className="mt-3 space-y-2">
          {payload.items.map((item) => (
            <li key={item.id} className="flex gap-2">
              <input type="checkbox" aria-label={item.label} />
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (type === "divider") {
    return <hr className="my-8" />;
  }

  return (
    <div className="rounded-2xl border p-4">
      {title ? <h3 className="font-semibold">{title}</h3> : null}
      <p className="text-sm text-muted-foreground">
        Bloco {type} preparado para renderização rica.
      </p>
    </div>
  );
}
```

- [ ] **Step 5: Run tests**

Run:

```bash
npm test -- tests/blocks.test.ts
```

Expected: PASS.

## Task 4: Product Queries and Public Sales Page

**Files:**

- Create: `src/domains/products/queries.ts`
- Create: `src/lib/format.ts`
- Modify: `src/app/(public)/page.tsx`
- Create: `src/app/(public)/products/[slug]/page.tsx`

- [ ] **Step 1: Add currency formatting**

Create `src/lib/format.ts`:

```ts
export function formatMoney(cents: number, currency = "BRL") {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(cents / 100);
}
```

- [ ] **Step 2: Add product queries**

Create `src/domains/products/queries.ts`:

```ts
import { asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { chapters, contentBlocks, products } from "@/db/schema";

export async function getPublishedProducts() {
  return db
    .select()
    .from(products)
    .where(eq(products.status, "published"))
    .orderBy(asc(products.createdAt));
}

export async function getProductBySlug(slug: string) {
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1);
  return product ?? null;
}

export async function getPublishedProductContent(productId: string) {
  const productChapters = await db
    .select()
    .from(chapters)
    .where(eq(chapters.productId, productId))
    .orderBy(asc(chapters.sortOrder));

  const rows = await db
    .select()
    .from(contentBlocks)
    .innerJoin(chapters, eq(contentBlocks.chapterId, chapters.id))
    .where(eq(chapters.productId, productId))
    .orderBy(asc(chapters.sortOrder), asc(contentBlocks.sortOrder));

  return productChapters.map((chapter) => ({
    ...chapter,
    blocks: rows
      .filter((row) => row.chapters.id === chapter.id)
      .map((row) => row.content_blocks),
  }));
}
```

- [ ] **Step 3: Add public home**

Create `src/app/(public)/page.tsx`:

```tsx
import Link from "next/link";
import { getPublishedProducts } from "@/domains/products/queries";
import { formatMoney } from "@/lib/format";

export default async function HomePage() {
  const products = await getPublishedProducts();

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-700">
        Vivências Azuis
      </p>
      <h1 className="mt-4 max-w-3xl text-5xl font-semibold tracking-tight">
        Guias práticos para famílias no espectro.
      </h1>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            className="rounded-3xl border p-6 transition hover:shadow-lg"
          >
            <h2 className="text-2xl font-semibold">{product.title}</h2>
            <p className="mt-3 text-neutral-600">{product.description}</p>
            <p className="mt-6 font-semibold">
              {formatMoney(product.priceCents, product.currency.toUpperCase())}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Add product sales page**

Create `src/app/(public)/products/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/domains/products/queries";
import { formatMoney } from "@/lib/format";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductSalesPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product || product.status !== "published") {
    notFound();
  }

  return (
    <main className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr]">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-700">
          Guia prático
        </p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight">
          {product.title}
        </h1>
        {product.subtitle ? (
          <p className="mt-5 text-xl text-neutral-700">{product.subtitle}</p>
        ) : null}
        <p className="mt-8 text-lg leading-8 text-neutral-700">
          {product.description}
        </p>
      </section>
      <aside className="rounded-3xl border bg-stone-50 p-8">
        <p className="text-sm text-neutral-600">Acesso permanente</p>
        <p className="mt-2 text-4xl font-semibold">
          {formatMoney(product.priceCents, product.currency.toUpperCase())}
        </p>
        <form action="/api/checkout" method="post" className="mt-8">
          <input type="hidden" name="productId" value={product.id} />
          <button className="w-full rounded-full bg-teal-700 px-6 py-4 font-semibold text-white">
            Comprar agora
          </button>
        </form>
      </aside>
    </main>
  );
}
```

- [ ] **Step 5: Verify public pages**

Run:

```bash
npm run build
```

Expected: build succeeds.

## Task 5: Access Rules

**Files:**

- Create: `src/domains/orders/access.ts`
- Create: `tests/access.test.ts`

- [ ] **Step 1: Write access tests**

Create `tests/access.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { canAccessProduct } from "@/domains/orders/access";

describe("canAccessProduct", () => {
  it("allows active entitlements", () => {
    expect(canAccessProduct({ status: "active" })).toBe(true);
  });

  it("rejects missing entitlements", () => {
    expect(canAccessProduct(null)).toBe(false);
  });

  it("rejects revoked entitlements", () => {
    expect(canAccessProduct({ status: "revoked" })).toBe(false);
  });
});
```

- [ ] **Step 2: Run test and verify failure**

Run:

```bash
npm test -- tests/access.test.ts
```

Expected: FAIL because `canAccessProduct` does not exist.

- [ ] **Step 3: Implement access helper**

Create `src/domains/orders/access.ts`:

```ts
import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { entitlements } from "@/db/schema";

type EntitlementLike = {
  status: "active" | "revoked";
} | null;

export function canAccessProduct(entitlement: EntitlementLike) {
  return entitlement?.status === "active";
}

export async function getUserProductEntitlement(
  userId: string,
  productId: string,
) {
  const [entitlement] = await db
    .select()
    .from(entitlements)
    .where(
      and(
        eq(entitlements.userId, userId),
        eq(entitlements.productId, productId),
      ),
    )
    .limit(1);

  return entitlement ?? null;
}
```

- [ ] **Step 4: Run access tests**

Run:

```bash
npm test -- tests/access.test.ts
```

Expected: PASS.

## Task 6: Stripe Checkout and Webhook Skeleton

**Files:**

- Create: `src/domains/orders/stripe.ts`
- Create: `src/app/api/checkout/route.ts`
- Create: `src/app/api/stripe/webhook/route.ts`
- Create: `tests/stripe-webhook.test.ts`

- [ ] **Step 1: Add Stripe client helper**

Create `src/domains/orders/stripe.ts`:

```ts
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2026-02-25.clover",
});
```

- [ ] **Step 2: Add checkout route**

Create `src/app/api/checkout/route.ts`:

```ts
import { NextResponse } from "next/server";
import { getProductBySlug } from "@/domains/products/queries";
import { stripe } from "@/domains/orders/stripe";

export async function POST(request: Request) {
  const formData = await request.formData();
  const productId = String(formData.get("productId") ?? "");

  if (!productId) {
    return NextResponse.json({ error: "Produto inválido." }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "brl",
          product_data: { name: "Produto digital" },
          unit_amount: 6700,
        },
        quantity: 1,
      },
    ],
    metadata: {
      productId,
    },
    success_url: `${appUrl}/library?checkout=success`,
    cancel_url: `${appUrl}/products/primeiros-30-dias-apos-o-diagnostico?checkout=cancelled`,
  });

  return NextResponse.redirect(session.url!, { status: 303 });
}
```

- [ ] **Step 3: Add webhook route**

Create `src/app/api/stripe/webhook/route.ts`:

```ts
import { NextResponse } from "next/server";
import { stripe } from "@/domains/orders/stripe";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature." },
      { status: 400 },
    );
  }

  const body = await request.text();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook secret is not configured." },
      { status: 500 },
    );
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json(
      { error: "Invalid Stripe signature." },
      { status: 400 },
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    console.info("Stripe checkout completed", {
      checkoutSessionId: session.id,
      productId: session.metadata?.productId,
    });
  }

  return NextResponse.json({ received: true });
}
```

- [ ] **Step 4: Verify route build**

Run:

```bash
npm run build
```

Expected: build succeeds.

## Task 7: Customer Library and Reader

**Files:**

- Create: `src/app/(customer)/library/page.tsx`
- Create: `src/app/(customer)/products/[slug]/read/page.tsx`

- [ ] **Step 1: Add temporary library page**

Create `src/app/(customer)/library/page.tsx`:

```tsx
import Link from "next/link";
import { getPublishedProducts } from "@/domains/products/queries";

export default async function LibraryPage() {
  const products = await getPublishedProducts();

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-4xl font-semibold">Minha biblioteca</h1>
      <p className="mt-3 text-neutral-600">
        Seus produtos comprados aparecerão aqui. Nesta primeira fatia, exibimos
        o produto seed para validar a leitura.
      </p>
      <div className="mt-8 grid gap-4">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.slug}/read`}
            className="rounded-2xl border p-5 hover:shadow"
          >
            <h2 className="text-xl font-semibold">{product.title}</h2>
            <p className="mt-2 text-neutral-600">Continuar leitura</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Add reader page**

Create `src/app/(customer)/products/[slug]/read/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import {
  getProductBySlug,
  getPublishedProductContent,
} from "@/domains/products/queries";
import { BlockRenderer } from "@/features/reader/block-renderer";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CustomerProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const chapters = await getPublishedProductContent(product.id);

  return (
    <main className="mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[280px_1fr]">
      <aside className="rounded-3xl border bg-stone-50 p-5">
        <h1 className="text-lg font-semibold">{product.title}</h1>
        <nav className="mt-6 space-y-2">
          {chapters.map((chapter) => (
            <a
              key={chapter.id}
              href={`#${chapter.id}`}
              className="block rounded-xl px-3 py-2 text-sm hover:bg-white"
            >
              {chapter.title}
            </a>
          ))}
        </nav>
      </aside>
      <section className="space-y-10">
        {chapters.map((chapter) => (
          <article
            key={chapter.id}
            id={chapter.id}
            className="rounded-3xl border p-8"
          >
            <h2 className="text-3xl font-semibold">{chapter.title}</h2>
            <div className="mt-8 space-y-6">
              {chapter.blocks.map((block) => (
                <BlockRenderer
                  key={block.id}
                  type={block.type}
                  title={block.title}
                  payloadJson={block.payloadJson}
                />
              ))}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
```

- [ ] **Step 3: Verify reader build**

Run:

```bash
npm run build
```

Expected: build succeeds.

## Task 8: Admin Shell

**Files:**

- Create: `src/app/(admin)/admin/page.tsx`

- [ ] **Step 1: Add admin dashboard shell**

Create `src/app/(admin)/admin/page.tsx`:

```tsx
import Link from "next/link";
import { getPublishedProducts } from "@/domains/products/queries";
import { formatMoney } from "@/lib/format";

export default async function AdminPage() {
  const products = await getPublishedProducts();

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-700">
            Admin
          </p>
          <h1 className="mt-3 text-4xl font-semibold">Painel de produtos</h1>
        </div>
        <button className="rounded-full bg-neutral-950 px-5 py-3 text-sm font-semibold text-white">
          Novo produto
        </button>
      </div>
      <div className="mt-10 overflow-hidden rounded-3xl border">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-100">
            <tr>
              <th className="p-4">Produto</th>
              <th className="p-4">Status</th>
              <th className="p-4">Preço</th>
              <th className="p-4">Link</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t">
                <td className="p-4 font-medium">{product.title}</td>
                <td className="p-4">{product.status}</td>
                <td className="p-4">
                  {formatMoney(
                    product.priceCents,
                    product.currency.toUpperCase(),
                  )}
                </td>
                <td className="p-4">
                  <Link
                    href={`/products/${product.slug}`}
                    className="text-teal-700 underline"
                  >
                    Ver página
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify admin build**

Run:

```bash
npm run build
```

Expected: build succeeds.

## Task 9: Final Verification

**Files:**

- No new files.

- [ ] **Step 1: Run static checks**

Run:

```bash
npm run lint
npm test
npm run build
```

Expected: lint, tests, and build pass.

- [ ] **Step 2: Run local app**

Run:

```bash
npm run dev
```

Expected: app starts at `http://localhost:3000`.

- [ ] **Step 3: Manual smoke test**

Open:

```txt
http://localhost:3000
http://localhost:3000/products/primeiros-30-dias-apos-o-diagnostico
http://localhost:3000/library
http://localhost:3000/products/primeiros-30-dias-apos-o-diagnostico/read
http://localhost:3000/admin
```

Expected:

- Home lists the seed product.
- Product page shows the sales CTA.
- Library shows the seed product.
- Reader renders the seed chapter and block.
- Admin lists the seed product.

## Self-Review

Spec coverage:

- Multi-product catalog: covered by products table and public listing.
- One-time Stripe purchases: covered by checkout route and verified webhook entry point.
- Customer accounts: dependency and route structure included, but full better-auth wiring should be the next plan if not completed during execution.
- Turso schema: covered.
- Library and reader: covered as first slice.
- Admin: covered as first shell.
- Rich content blocks: covered by block schema, parser, and initial renderer.

Required next implementation plan:

- Complete better-auth integration and route guards.
- Persist Stripe webhook orders and entitlements instead of logging only.
- Add real admin CRUD forms.
- Add signed asset uploads.
- Add reader progress persistence.
