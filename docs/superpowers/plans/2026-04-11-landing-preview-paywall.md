# Landing Preview Paywall Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the landing page into a Vivências Azuis course catalog and allow logged-in users to read chapter 1 as a free preview before showing a Stripe paywall.

**Architecture:** Keep the existing Next.js App Router structure and reuse current product, auth, reader, and Stripe flows. Implement preview mode inside the current reader route by deriving allowed pages from the first published chapter and passing locked-state metadata into client-side reader UI.

**Tech Stack:** Next.js App Router, React Server/Client Components, Vitest, Drizzle/SQLite, Stripe Checkout

---

### Task 1: Update auth redirect and landing catalog CTA

**Files:**
- Modify: `src/components/auth/auth-form.tsx`
- Modify: `src/app/login/page.tsx`
- Modify: `src/components/marketing/catalog-landing.tsx`
- Test: `tests/auth-form.test.tsx`
- Test: `tests/marketing-landing.test.tsx`

- [ ] **Step 1: Write the failing auth redirect test**

```tsx
it("uses the next query parameter as callback and redirect target", async () => {
  // render login form with next="/products/guia/read"
  // submit valid credentials
  // expect auth client callbackURL "/products/guia/read"
  // expect router.replace("/products/guia/read")
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/auth-form.test.tsx`
Expected: FAIL because `AuthForm` does not accept or use a `nextPath`

- [ ] **Step 3: Write the failing landing CTA test**

```tsx
it("routes each catalog card to login with the reader next param", () => {
  const markup = renderToStaticMarkup(
    <CatalogLanding featuredProduct={product} products={[product]} />,
  );

  expect(markup).toContain("Cursos disponíveis");
  expect(markup).toContain("Entrar para começar");
  expect(markup).toContain(
    "/login?next=%2Fproducts%2Fguia-pratico-primeiros-30-dias%2Fread",
  );
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npm test -- tests/marketing-landing.test.tsx`
Expected: FAIL because the current CTA still points to product pages and old copy

- [ ] **Step 5: Write minimal implementation**

```tsx
export function AuthForm({ mode, nextPath = "/library" }: AuthFormProps) {
  // pass callbackURL: nextPath
  // router.replace(nextPath)
}

const nextPath = typeof searchParams?.next === "string"
  ? searchParams.next
  : "/library";

<AuthForm mode="login" nextPath={nextPath} />

<Link href={`/login?next=${encodeURIComponent(`/products/${product.slug}/read`)}`}>
  Entrar para começar
</Link>
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm test -- tests/auth-form.test.tsx tests/marketing-landing.test.tsx`
Expected: PASS

---

### Task 2: Add preview-mode reader access rules

**Files:**
- Modify: `src/app/products/[slug]/read/page.tsx`
- Modify: `src/features/reader/reader-sidebar.tsx`
- Test: `tests/product-read-page.test.tsx`
- Test: `tests/reader-sidebar.test.tsx`

- [ ] **Step 1: Write the failing preview reader test**

```tsx
it("keeps non-paying users inside the reader and locks pages after chapter one", async () => {
  // entitlement inactive
  // two published chapters
  // expect no redirect
  // expect markup contains lock label and disabled chapter styles
  // expect current step count uses only preview pages
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/product-read-page.test.tsx`
Expected: FAIL because non-paying users are redirected away from the reader

- [ ] **Step 3: Write the failing sidebar lock test**

```tsx
it("renders locked reader pages with cadeado and no navigation link", () => {
  // render sidebar with one free chapter and one locked chapter
  // expect lock text/icon
  // expect locked item is not a clickable href
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npm test -- tests/reader-sidebar.test.tsx`
Expected: FAIL because sidebar has no locked-state support

- [ ] **Step 5: Write minimal implementation**

```tsx
const hasFullAccess = canAccessProduct(entitlement);
const previewChapterId = chapters[0]?.id ?? null;
const accessibleReaderPages = hasFullAccess
  ? readerPages
  : readerPages.filter((page) => page.chapterId === previewChapterId);
const safePageNumber = Math.min(requestedPageNumber, accessibleReaderPages.length);

<ReaderSidebar
  readerPages={readerPages}
  accessiblePageNumbers={new Set(accessibleReaderPages.map((page) => page.pageNumber))}
  isPreviewMode={!hasFullAccess}
/>
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm test -- tests/product-read-page.test.tsx tests/reader-sidebar.test.tsx`
Expected: PASS

---

### Task 3: Show Stripe paywall popup at the end of the preview

**Files:**
- Create: `src/features/reader/reader-preview-shell.tsx`
- Modify: `src/app/products/[slug]/read/page.tsx`
- Test: `tests/product-read-page.test.tsx`

- [ ] **Step 1: Write the failing paywall modal test**

```tsx
it("shows the preview completion popup on the last free slide", async () => {
  // entitlement inactive
  // current page equals last accessible page of chapter one
  // expect paywall title copy
  // expect checkout form contains productId
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/product-read-page.test.tsx`
Expected: FAIL because the reader does not render any preview completion popup

- [ ] **Step 3: Write minimal implementation**

```tsx
export function ReaderPreviewShell({
  isPreviewMode,
  shouldOpenPaywall,
  productId,
  productTitle,
  children,
}: ReaderPreviewShellProps) {
  // client component
  // open modal once when shouldOpenPaywall becomes true
  // render POST /api/checkout form with hidden productId
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- tests/product-read-page.test.tsx`
Expected: PASS

---

### Task 4: Run focused regression verification

**Files:**
- Test: `tests/auth-form.test.tsx`
- Test: `tests/marketing-landing.test.tsx`
- Test: `tests/product-read-page.test.tsx`
- Test: `tests/reader-sidebar.test.tsx`
- Test: `tests/library-checkout-state.test.tsx`

- [ ] **Step 1: Run the focused suite**

Run: `npm test -- tests/auth-form.test.tsx tests/marketing-landing.test.tsx tests/product-read-page.test.tsx tests/reader-sidebar.test.tsx tests/library-checkout-state.test.tsx`
Expected: PASS

- [ ] **Step 2: Run full test suite if the focused suite is clean**

Run: `npm test`
Expected: PASS or isolated pre-existing failures only
