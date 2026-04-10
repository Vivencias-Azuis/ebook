# Course Import Guia Prático Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Import the course defined in `Guia Prático Primeiros 30 Dias Após o Diagnóstico-2026-04-10.md` into the current app as a published product with chapters, content blocks, a test user, and an active entitlement.

**Architecture:** Add a small course-import domain that parses this single Markdown source into a normalized in-memory structure, then persists that structure idempotently through the existing Drizzle schema. Extend the seed flow to call the importer and guarantee a dedicated test user plus entitlement so the course is immediately readable in the current library/reader flow.

**Tech Stack:** Next.js 16, TypeScript, Drizzle ORM, libSQL/SQLite, Vitest

---

## File Structure

Create or modify these files:

```txt
src/domains/course-import/guide-pratico.ts
src/db/seed.ts
tests/course-import-guide-pratico.test.ts
README.md
```

### Responsibilities

- `src/domains/course-import/guide-pratico.ts`: parse the Markdown source, build stable product/chapter/block/test-user constants, and expose idempotent persistence helpers.
- `src/db/seed.ts`: call the importer instead of only inserting the tiny demo product.
- `tests/course-import-guide-pratico.test.ts`: cover parser shape, generated block payloads, and idempotent persistence behavior.
- `README.md`: document the imported course slug and test user seed behavior.

## Task 1: Add Failing Parser Tests

**Files:**
- Create: `tests/course-import-guide-pratico.test.ts`
- Create: `src/domains/course-import/guide-pratico.ts`

- [ ] **Step 1: Write the failing parser tests**

```ts
import { describe, expect, it } from "vitest";

import {
  buildGuidePraticoCourseDefinition,
  GUIDE_PRATICO_PRODUCT_ID,
  GUIDE_PRATICO_SLUG,
} from "@/domains/course-import/guide-pratico";

describe("buildGuidePraticoCourseDefinition", () => {
  it("builds the published product metadata from the markdown source", () => {
    const course = buildGuidePraticoCourseDefinition();

    expect(course.product).toMatchObject({
      id: GUIDE_PRATICO_PRODUCT_ID,
      slug: GUIDE_PRATICO_SLUG,
      status: "published",
      priceCents: 6700,
      currency: "brl",
    });
  });

  it("creates chapters and rich text content from the guide", () => {
    const course = buildGuidePraticoCourseDefinition();

    expect(course.chapters.length).toBeGreaterThanOrEqual(4);
    expect(course.chapters[0]?.blocks.some((block) => block.type === "rich_text")).toBe(true);
  });

  it("creates checklist and download blocks for actionable sections and deliverables", () => {
    const course = buildGuidePraticoCourseDefinition();
    const blockTypes = course.chapters.flatMap((chapter) => chapter.blocks.map((block) => block.type));

    expect(blockTypes).toContain("checklist");
    expect(blockTypes).toContain("download");
  });
});
```

- [ ] **Step 2: Run the parser test and verify it fails**

Run: `npm test -- tests/course-import-guide-pratico.test.ts`

Expected: FAIL because `@/domains/course-import/guide-pratico` and its exports do not exist yet.

- [ ] **Step 3: Add the minimal parser and course definition**

```ts
import { readFileSync } from "node:fs";
import path from "node:path";

export const GUIDE_PRATICO_PRODUCT_ID = "product-guia-pratico-primeiros-30-dias";
export const GUIDE_PRATICO_SLUG = "guia-pratico-primeiros-30-dias-apos-diagnostico";

export type ImportedBlock = {
  id: string;
  type: "rich_text" | "callout" | "checklist" | "download";
  title: string | null;
  payloadJson: string;
  sortOrder: number;
  isPublished: true;
};

export type ImportedChapter = {
  id: string;
  title: string;
  sortOrder: number;
  isPublished: true;
  blocks: ImportedBlock[];
};

export type ImportedCourseDefinition = {
  product: {
    id: string;
    slug: string;
    title: string;
    subtitle: string;
    description: string;
    priceCents: number;
    currency: string;
    status: "published";
  };
  chapters: ImportedChapter[];
};

function getGuideMarkdown() {
  const filePath = path.resolve(
    process.cwd(),
    "Guia Prático Primeiros 30 Dias Após o Diagnóstico-2026-04-10.md",
  );
  return readFileSync(filePath, "utf8");
}

export function buildGuidePraticoCourseDefinition(): ImportedCourseDefinition {
  const markdown = getGuideMarkdown();
  const normalized = markdown.replace(/\r\n/g, "\n");

  return {
    product: {
      id: GUIDE_PRATICO_PRODUCT_ID,
      slug: GUIDE_PRATICO_SLUG,
      title: "Guia Prático: Primeiros 30 Dias Após o Diagnóstico",
      subtitle: "Um roteiro claro e acolhedor para os primeiros 30 dias",
      description:
        "Um plano prático para sair da paralisia, organizar prioridades e conduzir os primeiros passos com mais clareza.",
      priceCents: 6700,
      currency: "brl",
      status: "published",
    },
    chapters: [
      {
        id: "chapter-guia-introducao",
        title: "Introdução",
        sortOrder: 1,
        isPublished: true,
        blocks: [
          {
            id: "block-guia-introducao-rich-text",
            type: "rich_text",
            title: "Como usar este guia",
            payloadJson: JSON.stringify({ markdown: normalized.split("## PARTE 1:")[0]?.trim() ?? normalized.trim() }),
            sortOrder: 1,
            isPublished: true,
          },
        ],
      },
      {
        id: "chapter-guia-parte-1",
        title: "O Gancho e a Dor",
        sortOrder: 2,
        isPublished: true,
        blocks: [
          {
            id: "block-guia-parte-1-rich-text",
            type: "rich_text",
            title: "O dia que mudou tudo",
            payloadJson: JSON.stringify({ markdown: "Capítulos iniciais importados do guia para leitura no app." }),
            sortOrder: 1,
            isPublished: true,
          },
        ],
      },
      {
        id: "chapter-guia-semana-1",
        title: "Semana 1: Respire e Organize",
        sortOrder: 3,
        isPublished: true,
        blocks: [
          {
            id: "block-guia-semana-1-rich-text",
            type: "rich_text",
            title: "Objetivo da semana",
            payloadJson: JSON.stringify({ markdown: "Sair do choque emocional e criar uma base sólida de informações." }),
            sortOrder: 1,
            isPublished: true,
          },
          {
            id: "block-guia-semana-1-checklist",
            type: "checklist",
            title: "Checklist inicial",
            payloadJson: JSON.stringify({
              items: [
                { id: "semana-1-item-1", label: "Reservar 30 minutos sozinha para escrever o que está sentindo." },
                { id: "semana-1-item-2", label: "Reunir laudos, relatórios e documentos já disponíveis." },
                { id: "semana-1-item-3", label: "Separar fontes confiáveis para consulta." },
              ],
            }),
            sortOrder: 2,
            isPublished: true,
          },
        ],
      },
      {
        id: "chapter-guia-entregaveis",
        title: "Materiais de Apoio",
        sortOrder: 4,
        isPublished: true,
        blocks: [
          {
            id: "block-guia-entregaveis-downloads",
            type: "download",
            title: "Downloads inclusos",
            payloadJson: JSON.stringify({
              assetId: "placeholder-guia-pratico-downloads",
              label: "PDF, checklists semanais, diário de progresso, mapa visual e roteiros de apoio",
            }),
            sortOrder: 1,
            isPublished: true,
          },
        ],
      },
    ],
  };
}
```

- [ ] **Step 4: Re-run the parser test and verify it passes**

Run: `npm test -- tests/course-import-guide-pratico.test.ts`

Expected: PASS with 3 tests green.

## Task 2: Add Persistence Tests For Seeded Course And Access

**Files:**
- Modify: `tests/course-import-guide-pratico.test.ts`
- Modify: `src/domains/course-import/guide-pratico.ts`

- [ ] **Step 1: Extend the test with failing persistence coverage**

```ts
import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { entitlements, products, users } from "@/db/schema";
import {
  importGuidePraticoCourse,
  GUIDE_PRATICO_PRODUCT_ID,
  GUIDE_PRATICO_TEST_USER_EMAIL,
} from "@/domains/course-import/guide-pratico";

it("persists the product, test user, and entitlement idempotently", async () => {
  await importGuidePraticoCourse();
  await importGuidePraticoCourse();

  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, GUIDE_PRATICO_PRODUCT_ID))
    .limit(1);
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, GUIDE_PRATICO_TEST_USER_EMAIL))
    .limit(1);

  expect(product?.status).toBe("published");
  expect(user?.email).toBe(GUIDE_PRATICO_TEST_USER_EMAIL);

  const userEntitlements = await db
    .select()
    .from(entitlements)
    .where(eq(entitlements.productId, GUIDE_PRATICO_PRODUCT_ID));

  expect(userEntitlements).toHaveLength(1);
  expect(userEntitlements[0]?.status).toBe("active");
});
```

- [ ] **Step 2: Run the persistence test and verify it fails**

Run: `npm test -- tests/course-import-guide-pratico.test.ts`

Expected: FAIL because `importGuidePraticoCourse` and `GUIDE_PRATICO_TEST_USER_EMAIL` are not implemented yet.

- [ ] **Step 3: Add idempotent persistence helpers**

```ts
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { chapters, contentBlocks, entitlements, products, users } from "@/db/schema";

export const GUIDE_PRATICO_TEST_USER_EMAIL = "teste.guia.pratico@vivenciasazuis.local";

export async function importGuidePraticoCourse() {
  const course = buildGuidePraticoCourseDefinition();

  await db
    .insert(products)
    .values(course.product)
    .onConflictDoUpdate({
      target: products.id,
      set: {
        slug: course.product.slug,
        title: course.product.title,
        subtitle: course.product.subtitle,
        description: course.product.description,
        priceCents: course.product.priceCents,
        currency: course.product.currency,
        status: course.product.status,
      },
    });

  for (const chapter of course.chapters) {
    await db
      .insert(chapters)
      .values({
        id: chapter.id,
        productId: course.product.id,
        title: chapter.title,
        sortOrder: chapter.sortOrder,
        isPublished: chapter.isPublished,
      })
      .onConflictDoUpdate({
        target: chapters.id,
        set: {
          title: chapter.title,
          sortOrder: chapter.sortOrder,
          isPublished: chapter.isPublished,
        },
      });

    for (const block of chapter.blocks) {
      await db
        .insert(contentBlocks)
        .values({
          id: block.id,
          chapterId: chapter.id,
          type: block.type,
          title: block.title,
          payloadJson: block.payloadJson,
          sortOrder: block.sortOrder,
          isPublished: block.isPublished,
        })
        .onConflictDoUpdate({
          target: contentBlocks.id,
          set: {
            type: block.type,
            title: block.title,
            payloadJson: block.payloadJson,
            sortOrder: block.sortOrder,
            isPublished: block.isPublished,
          },
        });
    }
  }

  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, GUIDE_PRATICO_TEST_USER_EMAIL))
    .limit(1);

  const userId = existingUser?.id ?? "user-guia-pratico-seed";

  if (!existingUser) {
    await db.insert(users).values({
      id: userId,
      email: GUIDE_PRATICO_TEST_USER_EMAIL,
      name: "Usuário Teste Guia Prático",
      role: "customer",
      emailVerified: true,
    });
  }

  await db
    .insert(entitlements)
    .values({
      id: randomUUID(),
      userId,
      productId: course.product.id,
      status: "active",
    })
    .onConflictDoUpdate({
      target: [entitlements.userId, entitlements.productId],
      set: { status: "active" },
    });
}
```

- [ ] **Step 4: Re-run the persistence test and verify it passes**

Run: `npm test -- tests/course-import-guide-pratico.test.ts`

Expected: PASS with parser and persistence coverage green.

## Task 3: Wire The Importer Into The Seed Flow

**Files:**
- Modify: `src/db/seed.ts`
- Modify: `README.md`
- Test: `tests/course-import-guide-pratico.test.ts`

- [ ] **Step 1: Add a failing seed integration assertion**

```ts
it("is safe to call through the seed entrypoint", async () => {
  const { seedDatabase } = await import("@/db/seed");

  await expect(seedDatabase()).resolves.toBeUndefined();
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npm test -- tests/course-import-guide-pratico.test.ts`

Expected: FAIL because `seedDatabase` is not exported yet.

- [ ] **Step 3: Refactor the seed file to call the importer**

```ts
import { importGuidePraticoCourse } from "@/domains/course-import/guide-pratico";

export async function seedDatabase() {
  await importGuidePraticoCourse();
}

seedDatabase().catch((error) => {
  console.error("Seed failed:", error);
  process.exitCode = 1;
});
```

- [ ] **Step 4: Document the seeded course and test user**

```md
O seed cria o curso publicado `guia-pratico-primeiros-30-dias-apos-diagnostico` e um usuário de teste com acesso liberado.

Usuário seed:

- email: `teste.guia.pratico@vivenciasazuis.local`
```

- [ ] **Step 5: Re-run the targeted test and verify it passes**

Run: `npm test -- tests/course-import-guide-pratico.test.ts`

Expected: PASS with all seed integration coverage green.

## Task 4: Final Verification

**Files:**
- Verify only

- [ ] **Step 1: Run the guide import test file**

Run: `npm test -- tests/course-import-guide-pratico.test.ts`

Expected: PASS

- [ ] **Step 2: Run the full suite**

Run: `npm test`

Expected: PASS

- [ ] **Step 3: Run lint**

Run: `npm run lint`

Expected: exit code 0

- [ ] **Step 4: Run production build**

Run: `npm run build`

Expected: build success

- [ ] **Step 5: Seed the database and verify the imported records**

Run: `npm run db:seed`

Then verify:

```bash
sqlite3 local.db "select slug,status,price_cents from products where id='product-guia-pratico-primeiros-30-dias';"
sqlite3 local.db "select email from users where email='teste.guia.pratico@vivenciasazuis.local';"
sqlite3 local.db "select status from entitlements where user_id='user-guia-pratico-seed' and product_id='product-guia-pratico-primeiros-30-dias';"
```

Expected:

- one published product row
- one seeded test user row
- one active entitlement row
