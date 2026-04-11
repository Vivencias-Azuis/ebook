# Auth and Entitlements Phase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add account authentication, persist Stripe purchases into orders and entitlements, and require product access before showing library and reader content.

**Architecture:** Keep the existing Next.js monolith. Add better-auth-backed email/password auth with a small session helper, persist Stripe checkout completion into `orders` and `entitlements`, and switch the current public library/reader shells into session-aware customer routes that only show purchased products.

**Tech Stack:** Next.js 16, better-auth, Drizzle ORM, Turso/libSQL, Stripe Checkout Sessions, Zod, Vitest.

---

### Task 1: better-auth integration

- [ ] Wire `better-auth` config and route handler.
- [ ] Create login and register pages with basic forms.
- [ ] Add a server-side session helper.
- [ ] Verify build and auth route compilation.

### Task 2: persist webhook purchases

- [ ] Expand Stripe checkout metadata to include user identifier when available.
- [ ] On `checkout.session.completed`, upsert `orders`.
- [ ] Create or preserve `entitlements` idempotently.
- [ ] Add focused tests for webhook persistence helpers.

### Task 3: real customer library

- [ ] Change `/library` to require session.
- [ ] Query purchased products from `entitlements` instead of all published products.
- [ ] Show empty-state when the account has no products.

### Task 4: protect `/products/[slug]/read`

- [ ] Require session.
- [ ] Require an active entitlement for the product.
- [ ] Redirect or block access when the user has not purchased the product.

### Task 5: final verification

- [ ] Run `npm run lint`.
- [ ] Run `npm test`.
- [ ] Run `npm run build`.
