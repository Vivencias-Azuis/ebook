# Landing Ebook Vendas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reposicionar a home e a página pública do produto como uma landing editorial de vendas alinhada à marca Vivências Azuis.

**Architecture:** Extrair a experiência pública para componentes de marketing reutilizáveis, com copy e seções orientadas à decisão de compra. Aplicar a nova direção visual via tokens CSS globais e conectar a home ao produto publicado sem alterar o fluxo de checkout existente.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Vitest, Drizzle ORM.

---

## File Structure

```txt
src/app/layout.tsx
src/app/globals.css
src/app/page.tsx
src/app/products/[slug]/page.tsx
src/components/marketing/catalog-landing.tsx
src/components/marketing/product-sales-landing.tsx
tests/marketing-landing.test.tsx
```

## Task 1: Marketing component tests

**Files:**
- Create: `tests/marketing-landing.test.tsx`

- [ ] Write tests that assert the sales headline, buyer-identification section, FAQ/objection handling, and product CTA are rendered from pure marketing components.
- [ ] Run `npm test -- tests/marketing-landing.test.tsx` and verify it fails because the marketing components do not exist yet.

## Task 2: Marketing components

**Files:**
- Create: `src/components/marketing/catalog-landing.tsx`
- Create: `src/components/marketing/product-sales-landing.tsx`

- [ ] Implement reusable public marketing components with Vivências Azuis copy and structure for home and product page.
- [ ] Run `npm test -- tests/marketing-landing.test.tsx` and verify it passes.

## Task 3: Route integration and public theme

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/products/[slug]/page.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

- [ ] Replace the generic storefront home with the new editorial sales landing that highlights the published ebook.
- [ ] Replace the minimal product page with the full sales landing while preserving the checkout form.
- [ ] Update global metadata, fonts, and theme tokens to align with the Vivências Azuis visual direction.

## Task 4: Verification

**Files:**
- Verify only

- [ ] Run `npm test -- tests/marketing-landing.test.tsx`.
- [ ] Run `npm test`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
