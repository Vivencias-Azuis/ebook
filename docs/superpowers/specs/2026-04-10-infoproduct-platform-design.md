# Infoproduct Platform Design

Date: 2026-04-10

## Goal

Build a Next.js platform for selling multiple one-time digital products. Each product has its own sales page, Stripe one-time checkout, customer account access, and an interactive reader inside the app. Content is managed through an internal admin panel rather than Markdown files in the repository.

The first product is the guide "Primeiros 30 Dias Após o Diagnóstico", but the system must support a catalog of independent future products.

## Product Model

Each product is sold independently. A successful payment permanently unlocks access to that product for the purchasing user. There is no subscription model in the first version.

Core user-facing areas:

- Public sales pages for individual products.
- Account creation and login with email/password.
- Customer library showing purchased products.
- Interactive reader with chapters, rich content blocks, downloads, and progress tracking.
- Payment success/pending/error states.

Core admin areas:

- Product management.
- Sales page content management.
- Chapter management.
- Rich block editor.
- Asset management for files and media.
- Orders and access management.

## Recommended Stack

- Next.js App Router for the public app, customer area, admin area, and backend routes.
- Turso/libSQL as the primary relational database.
- Drizzle ORM for schema, migrations, and typed queries.
- better-auth for email/password accounts, sessions, and roles.
- Stripe Checkout Sessions for one-time payments.
- Stripe webhooks as the source of truth for purchase confirmation.
- Cloudflare R2 or another S3-compatible storage service for rich assets.
- Zod for input validation and content block payload validation.
- Tailwind CSS and focused internal components for the admin and reader UI.

## Architecture

Suggested app organization:

```txt
src/app/(public)
src/app/(auth)
src/app/(customer)
src/app/(admin)
src/app/api/stripe/webhook
src/db
src/domains/auth
src/domains/products
src/domains/content
src/domains/orders
src/domains/assets
src/features/reader
src/features/admin
```

The public area can render product sales pages by slug. The authenticated customer area must check entitlements before showing paid content. The admin area must require an admin role for every page and mutation.

Stripe webhook handling should live in a route handler and must validate the Stripe signature before processing events.

## Customer Journey

1. Visitor lands on a product sales page.
2. Visitor creates an account or logs in.
3. The app creates a Stripe Checkout Session for the selected product.
4. User completes payment in Stripe Checkout.
5. Stripe sends a webhook event.
6. Webhook records the order and creates an entitlement.
7. Customer sees the product in their library.
8. Customer reads the product in the interactive reader.
9. Reader saves progress as the customer completes chapters or blocks.

The success page must not unlock access by itself. It can poll or reload account access and show a pending state until the webhook creates the entitlement.

## Data Model

Primary tables:

- `users`: customer and admin accounts.
- `sessions`/auth tables: managed by the auth provider.
- `products`: catalog items and product metadata.
- `product_prices`: current and historical prices, including Stripe price references if used.
- `sales_pages`: structured sales page content per product.
- `chapters`: ordered chapters inside a product.
- `content_blocks`: ordered rich content blocks inside chapters.
- `assets`: uploaded files used by product pages and content blocks.
- `orders`: purchase records tied to Stripe checkout/payment data.
- `entitlements`: access grants from a user to a product.
- `progress`: per-user reading/completion state.
- `quiz_attempts`: quiz responses and results when quiz blocks are active.
- `admin_audit_logs`: relevant admin content, pricing, and access changes.

Recommended `content_blocks` shape:

```txt
content_blocks
- id
- chapter_id
- type
- sort_order
- title
- payload_json
- is_published
- created_at
- updated_at
```

The system should use a flexible block model with a shared `content_blocks` table and a validated JSON payload for each block type. This avoids premature table sprawl while keeping the editor extensible.

Initial block types:

- `rich_text`: formatted text.
- `callout`: highlighted note, warning, tip, or reflection.
- `checklist`: user-markable checklist.
- `download`: downloadable asset.
- `audio`: embedded or hosted audio.
- `video`: hosted video or embed reference.
- `quiz`: simple question and answer structure.
- `divider`: visual separation.

## Access Rules

- Public product pages are readable by anyone.
- Customer routes require a logged-in user.
- Admin routes require a logged-in admin user.
- Paid content requires an active entitlement for the current user and product.
- Private assets require signed or temporary URLs.
- Access grants are permanent for one-time products unless manually revoked by an admin.

## Stripe Integration

Use Stripe Checkout Sessions for one-time payments.

Required behavior:

- Create one checkout session for one product purchase.
- Attach product/user identifiers in Stripe metadata.
- Validate webhook signatures.
- Process successful checkout/payment events idempotently.
- Store Stripe object IDs on orders for support and reconciliation.
- Create entitlements only from verified Stripe webhook events.
- Handle repeated webhooks without duplicating orders or entitlements.

Important states:

- `pending`: checkout started but payment not confirmed.
- `paid`: payment confirmed and entitlement created.
- `failed`: payment failed or expired.
- `refunded`: purchase refunded; entitlement behavior must be decided before launch.

For V1, refunded orders should be visible in admin. Automatic entitlement revocation on refund can be implemented if refund handling is part of the launch scope.

## Admin Experience

The admin panel should support:

- Creating and editing products.
- Setting slug, title, cover image, description, status, and price.
- Editing sales page sections.
- Creating, ordering, publishing, and unpublishing chapters.
- Creating and ordering content blocks inside chapters.
- Uploading and selecting assets.
- Viewing orders and entitlements.
- Manually granting or revoking access for support cases.

The admin should warn before publishing incomplete content, such as a product with no chapters or a chapter with no published blocks.

## Reader Experience

The reader should feel like an interactive ebook, not a plain article page.

Required V1 behavior:

- Product overview with chapters.
- Chapter sidebar or mobile chapter drawer.
- Central content area rendering rich blocks.
- Progress indicator.
- Continue-reading shortcut.
- Checklist block state saved per user.
- Downloads surfaced inline.
- Responsive layout for desktop and mobile.

The reader should prioritize calm, clear, accessible reading. Rich blocks should support the content rather than distract from it.

## Error Handling

Expected failure states:

- Payment complete but webhook not processed yet: show an access-pending state.
- Checkout canceled: return to sales page with a non-alarming message.
- Missing entitlement: redirect to sales page or show no-access state.
- Webhook validation failure: reject request and log safely.
- Webhook processing failure: preserve enough data for retry/manual inspection.
- Upload failure: do not create a usable asset.
- Empty chapter/product publication: block publish or show a clear warning.

## Testing Strategy

Minimum test coverage:

- Unit tests for entitlement checks.
- Unit tests for content block payload validation.
- Integration tests for Stripe webhook processing and idempotency.
- Integration tests for product, chapter, and block admin mutations.
- E2E test for account creation/login.
- E2E test for purchase flow using Stripe test mode or mocked confirmation.
- E2E test for library access and reader progress.
- E2E test for admin creating a product, chapter, and content block.

## Launch Scope

V1 should include:

- One product live.
- Multi-product catalog support.
- Account creation and login.
- Stripe one-time checkout.
- Verified webhook access unlock.
- Customer library.
- Interactive reader with rich blocks.
- Admin product/chapter/block management.
- Basic asset upload/selection.
- Basic order and entitlement admin view.

Defer unless needed for launch:

- Subscriptions.
- Community features.
- Comments.
- Certificates.
- Affiliate system.
- Advanced analytics dashboard.
- Complex quiz scoring.
- Automated email sequences beyond transactional account/payment emails.

## Open Decisions

- Choose deployment target.
- Choose asset storage provider.
- Decide refund entitlement behavior.
- Decide whether the first launch needs quizzes active or only the schema and renderer prepared.
- Decide final visual direction for sales page and reader.

