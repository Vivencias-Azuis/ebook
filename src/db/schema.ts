import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

const nowMs = sql`(cast((julianday('now') - 2440587.5) * 86400000 as integer))`;

const createdAt = () =>
  integer("created_at", { mode: "timestamp_ms" }).notNull().default(nowMs);

const updatedAt = () =>
  integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(nowMs)
    .$onUpdate(() => nowMs);

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
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const session = sqliteTable(
  "session",
  {
    id: text("id").primaryKey(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    token: text("token").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
  },
  (table) => ({
    tokenUnique: uniqueIndex("session_token_unique").on(table.token),
    userIdIndex: index("session_user_id_index").on(table.userId),
  }),
);

export const account = sqliteTable(
  "account",
  {
    id: text("id").primaryKey(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    providerId: text("provider_id").notNull(),
    accountId: text("account_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", {
      mode: "timestamp_ms",
    }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", {
      mode: "timestamp_ms",
    }),
    scope: text("scope"),
    password: text("password"),
  },
  (table) => ({
    userIdIndex: index("account_user_id_index").on(table.userId),
  }),
);

export const verification = sqliteTable(
  "verification",
  {
    id: text("id").primaryKey(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => ({
    identifierIndex: index("verification_identifier_index").on(
      table.identifier,
    ),
  }),
);

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
  createdAt: createdAt(),
  updatedAt: updatedAt(),
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
  createdAt: createdAt(),
  updatedAt: updatedAt(),
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
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "restrict" }),
  stripeCheckoutSessionId: text("stripe_checkout_session_id")
    .notNull()
    .unique(),
  stripePaymentIntentId: text("stripe_payment_intent_id").unique(),
  status: text("status", {
    enum: ["pending", "paid", "failed", "refunded"],
  })
    .notNull()
    .default("pending"),
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const entitlements = sqliteTable(
  "entitlements",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    sourceOrderId: text("source_order_id").references(() => orders.id, {
      onDelete: "set null",
    }),
    status: text("status", { enum: ["active", "revoked"] })
      .notNull()
      .default("active"),
    createdAt: createdAt(),
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
      .references(() => users.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    scope: text("scope", { enum: ["product", "chapter", "block"] }).notNull(),
    targetId: text("target_id").notNull(),
    chapterId: text("chapter_id").references(() => chapters.id, {
      onDelete: "cascade",
    }),
    blockId: text("block_id").references(() => contentBlocks.id, {
      onDelete: "cascade",
    }),
    state: text("state").notNull(),
    updatedAt: updatedAt(),
  },
  (table) => ({
    userProductScopeTargetUnique: uniqueIndex(
      "progress_user_product_scope_target_unique",
    ).on(table.userId, table.productId, table.scope, table.targetId),
  }),
);

export const productsRelations = relations(products, ({ many }) => ({
  chapters: many(chapters),
}));

export const chaptersRelations = relations(chapters, ({ many, one }) => ({
  product: one(products, {
    fields: [chapters.productId],
    references: [products.id],
  }),
  blocks: many(contentBlocks),
}));
