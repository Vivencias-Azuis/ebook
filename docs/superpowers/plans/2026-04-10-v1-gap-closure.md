# V1 Gap Closure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the remaining V1 gaps in security, checkout state handling, reader progress, and admin/editor coverage without rewriting the existing MVP foundation.

**Architecture:** Reuse the current Next.js monolith and existing domain modules. Add small auth guard helpers, a dedicated progress domain, targeted admin query/mutation extensions, and route-level UI updates so the current app becomes aligned with the written plan/spec instead of diverging from it.

**Tech Stack:** Next.js 16 App Router, TypeScript, Drizzle ORM, better-auth, Stripe Checkout Sessions, Vitest, Tailwind CSS.

---

## Scope

This plan closes the concrete gaps already identified in the current codebase:

- Protect admin pages and admin server actions with admin role checks.
- Stop claiming checkout success before webhook-created entitlements exist.
- Persist and render basic reader progress using the existing `progress` table.
- Complete the missing V1 admin/editor operations: chapter rename/publish, block publish, create block by type, and basic orders/access visibility.

Out of scope for this pass:

- Asset upload/storage integration.
- Refund automation.
- Full order-support tooling.
- E2E browser tests.

## File Structure

Create or modify these files:

```txt
src/domains/auth/server.ts
src/domains/admin/access.ts
src/domains/admin/editor-queries.ts
src/domains/admin/editor-mutations.ts
src/domains/orders/admin.ts
src/domains/progress/queries.ts
src/domains/progress/mutations.ts
src/app/admin/page.tsx
src/app/admin/editor/[productId]/page.tsx
src/app/admin/editor/actions.ts
src/app/library/page.tsx
src/app/products/[slug]/read/page.tsx
src/app/api/checkout/route.ts
src/components/admin/editor-left-column.tsx
src/components/admin/editor-center-column.tsx
src/components/admin/editor-right-column.tsx
src/components/admin/block-forms/block-form-router.tsx
src/components/admin/block-forms/checklist-form.tsx
src/domains/products/library.ts
tests/admin-access.test.ts
tests/library-checkout-state.test.tsx
tests/progress.test.ts
tests/admin-editor-mutations.test.ts
```

## Task 1: Admin Access Guard

**Files:**
- Create: `src/domains/admin/access.ts`
- Modify: `src/domains/auth/server.ts`
- Modify: `src/app/admin/page.tsx`
- Modify: `src/app/admin/editor/[productId]/page.tsx`
- Modify: `src/app/admin/editor/actions.ts`
- Test: `tests/admin-access.test.ts`

- [ ] **Step 1: Write failing tests for admin role enforcement**
- [ ] **Step 2: Run `npm test -- tests/admin-access.test.ts` and verify it fails**
- [ ] **Step 3: Add `requireAdminSession()` and reuse it in admin pages/actions**
- [ ] **Step 4: Re-run `npm test -- tests/admin-access.test.ts` and verify it passes**

## Task 2: Checkout Pending State In Library

**Files:**
- Modify: `src/app/api/checkout/route.ts`
- Modify: `src/app/library/page.tsx`
- Modify: `src/domains/products/library.ts`
- Test: `tests/library-checkout-state.test.tsx`

- [ ] **Step 1: Write failing tests for pending-vs-unlocked checkout messaging**
- [ ] **Step 2: Run `npm test -- tests/library-checkout-state.test.tsx` and verify it fails**
- [ ] **Step 3: Change checkout redirect/query semantics and library messaging so “success” is not shown before entitlement exists**
- [ ] **Step 4: Re-run `npm test -- tests/library-checkout-state.test.tsx` and verify it passes**

## Task 3: Reader Progress

**Files:**
- Create: `src/domains/progress/queries.ts`
- Create: `src/domains/progress/mutations.ts`
- Modify: `src/domains/products/library.ts`
- Modify: `src/app/library/page.tsx`
- Modify: `src/app/products/[slug]/read/page.tsx`
- Modify: `src/components/admin/block-forms/checklist-form.tsx`
- Test: `tests/progress.test.ts`

- [ ] **Step 1: Write failing tests for progress calculations and persisted checklist state helpers**
- [ ] **Step 2: Run `npm test -- tests/progress.test.ts` and verify it fails**
- [ ] **Step 3: Implement progress queries/mutations on top of the existing `progress` table**
- [ ] **Step 4: Surface continue-reading and progress summary in the library**
- [ ] **Step 5: Persist checklist interactions and render progress indicator in the reader**
- [ ] **Step 6: Re-run `npm test -- tests/progress.test.ts` and verify it passes**

## Task 4: Complete Admin Editor Operations

**Files:**
- Modify: `src/domains/admin/editor-queries.ts`
- Modify: `src/domains/admin/editor-mutations.ts`
- Modify: `src/app/admin/editor/actions.ts`
- Modify: `src/components/admin/editor-left-column.tsx`
- Modify: `src/components/admin/editor-center-column.tsx`
- Modify: `src/components/admin/editor-right-column.tsx`
- Modify: `src/components/admin/block-forms/block-form-router.tsx`
- Test: `tests/admin-editor-mutations.test.ts`

- [ ] **Step 1: Extend failing editor mutation tests for chapter rename/publish, block publish, and create-by-type**
- [ ] **Step 2: Run `npm test -- tests/admin-editor-mutations.test.ts` and verify it fails**
- [ ] **Step 3: Add mutation helpers and actions for chapter rename/publish and block publish**
- [ ] **Step 4: Add UI controls for chapter title editing, publish toggles, and block type creation**
- [ ] **Step 5: Re-run `npm test -- tests/admin-editor-mutations.test.ts` and verify it passes**

## Task 5: Basic Orders And Access Visibility

**Files:**
- Create: `src/domains/orders/admin.ts`
- Modify: `src/app/admin/page.tsx`

- [ ] **Step 1: Add admin query helpers that join products, orders, and entitlements**
- [ ] **Step 2: Render a basic support-oriented admin section for recent orders and active entitlements**
- [ ] **Step 3: Verify `/admin` still builds and handles empty states**

## Task 6: Final Verification

**Files:**
- Verify only

- [ ] **Step 1: Run `npm test`**
- [ ] **Step 2: Run `npm run lint`**
- [ ] **Step 3: Run `npm run build`**
- [ ] **Step 4: Compare the implemented behavior against `docs/superpowers/specs/2026-04-10-infoproduct-platform-design.md` and `docs/superpowers/specs/2026-04-10-admin-visual-editor-design.md`**
