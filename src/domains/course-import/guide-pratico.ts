import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { and, eq } from "drizzle-orm";

import { db } from "@/db/client";
import { account, chapters, contentBlocks, entitlements, products, users } from "@/db/schema";

export const GUIDE_PRATICO_PRODUCT_ID = "product-guia-pratico-primeiros-30-dias";
export const GUIDE_PRATICO_SLUG = "guia-pratico-primeiros-30-dias-apos-diagnostico";
export const GUIDE_PRATICO_TEST_USER_EMAIL = "teste.guia.pratico@vivenciasazuis.local";
export const GUIDE_PRATICO_TEST_USER_ID = "user-guia-pratico-seed";
export const GUIDE_PRATICO_TEST_USER_PASSWORD = "VivenciasAzuis@123";

export type ImportedBlockType = "rich_text" | "checklist" | "download";

export type ImportedBlock = {
  id: string;
  type: ImportedBlockType;
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
    currency: "brl";
    status: "published";
  };
  chapters: ImportedChapter[];
};

const GUIDE_FILE_PREFIX = "Guia Prático Primeiros 30 Dias Após o Diagnóstico";
const COURSE_SECTION_MARKERS = [
  { id: "chapter-guia-comece", title: "Comece por aqui", marker: "## COMECE POR AQUI" },
  { id: "chapter-guia-72h", title: "Primeiras 72 horas", marker: "## PRIMEIRAS 72 HORAS" },
  { id: "chapter-guia-semana-1", title: "Semana 1: Sair do caos", marker: "## SEMANA 1: SAIR DO CAOS" },
  { id: "chapter-guia-semana-2", title: "Semana 2: Profissionais, terapias e critério", marker: "## SEMANA 2: PROFISSIONAIS, TERAPIAS E CRITÉRIO" },
  { id: "chapter-guia-semana-3", title: "Semana 3: Casa, rotina e escola", marker: "## SEMANA 3: CASA, ROTINA E ESCOLA" },
  { id: "chapter-guia-semana-4", title: "Semana 4: Brasil real, direitos e próximos 60 dias", marker: "## SEMANA 4: BRASIL REAL, DIREITOS E PRÓXIMOS 60 DIAS" },
  { id: "chapter-guia-familia-materiais", title: "Família inteira e materiais interativos", marker: "## FAMÍLIA INTEIRA" },
] as const;

function getRequiredSection(sectionContent: string, sectionLabel: string) {
  if (!sectionContent.trim()) {
    throw new Error(
      `Missing required guide section in markdown source: ${sectionLabel}.`,
    );
  }

  return sectionContent;
}

export function resolveGuidePraticoMarkdownPath(cwd = process.cwd()) {
  const fileName = readdirSync(cwd)
    .filter((entry) => entry.startsWith(GUIDE_FILE_PREFIX) && entry.endsWith(".md"))
    .sort()[0];

  if (!fileName) {
    throw new Error("Missing required guide section in markdown source.");
  }

  return path.resolve(cwd, fileName);
}

function readGuideMarkdown() {
  const filePath = resolveGuidePraticoMarkdownPath();
  return readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");
}

function sliceBetween(markdown: string, startMarker: string, endMarker?: string) {
  const startIndex = markdown.indexOf(startMarker);

  if (startIndex === -1) {
    return "";
  }

  const contentStart = startIndex + startMarker.length;
  const remainder = markdown.slice(contentStart);

  if (!endMarker) {
    return remainder.trim();
  }

  const endIndex = remainder.indexOf(endMarker);

  return (endIndex === -1 ? remainder : remainder.slice(0, endIndex)).trim();
}

function sliceRequiredSectionByMarker(
  markdown: string,
  section: (typeof COURSE_SECTION_MARKERS)[number],
) {
  const sectionIndex = COURSE_SECTION_MARKERS.findIndex((item) => item.id === section.id);
  const nextMarker = COURSE_SECTION_MARKERS[sectionIndex + 1]?.marker;
  const content = sliceBetween(markdown, section.marker, nextMarker);

  return getRequiredSection(content, section.title);
}

function collectChecklistItems(section: string, idPrefix = "checklist-item") {
  return section
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- [ ]") || line.startsWith("\\- \\[ \\]"))
    .map((line, index) => ({
      id: `${idPrefix}-item-${index + 1}`,
      label: line
        .replace(/^\\?- \[ \] /, "")
        .replace(/^\\?- \\?\[ \\?\] /, "")
        .replace(/\s+/g, " ")
        .trim(),
    }));
}

function richTextBlock(id: string, title: string, markdown: string, sortOrder: number): ImportedBlock {
  return {
    id,
    type: "rich_text",
    title,
    payloadJson: JSON.stringify({ markdown }),
    sortOrder,
    isPublished: true,
  };
}

function checklistBlock(id: string, title: string, items: Array<{ id: string; label: string }>, sortOrder: number): ImportedBlock {
  return {
    id,
    type: "checklist",
    title,
    payloadJson: JSON.stringify({ items }),
    sortOrder,
    isPublished: true,
  };
}

function downloadBlock(
  id: string,
  title: string,
  label: string,
  sortOrder: number,
  options?: {
    href?: string;
    mode?: "static" | "dynamic_pdf";
    productSlug?: string;
  },
  assetId = "placeholder-guia-pratico-downloads",
): ImportedBlock {
  return {
    id,
    type: "download",
    title,
    payloadJson: JSON.stringify({
      assetId,
      label,
      href: options?.href,
      mode: options?.mode,
      productSlug: options?.productSlug,
    }),
    sortOrder,
    isPublished: true,
  };
}

function sectionTitleFromMarkdown(section: string, fallback: string) {
  return (
    section
      .split("\n")
      .map((line) => line.trim())
      .find((line) => line.startsWith("### "))
      ?.replace(/^### /, "") ?? fallback
  );
}

function sectionIdSuffix(chapterId: string) {
  return chapterId.replace(/^chapter-guia-/, "");
}

export function buildGuidePraticoCourseDefinition(): ImportedCourseDefinition {
  return buildGuidePraticoCourseDefinitionFromMarkdown(readGuideMarkdown());
}

export function buildGuidePraticoCourseDefinitionFromMarkdown(
  rawMarkdown: string,
): ImportedCourseDefinition {
  const markdown = rawMarkdown.replace(/\r\n/g, "\n");

  return {
    product: {
      id: GUIDE_PRATICO_PRODUCT_ID,
      slug: GUIDE_PRATICO_SLUG,
      title: "Guia Prático: Primeiros 30 Dias Após Suspeita ou Diagnóstico",
      subtitle: "Um guia prático para organizar o que fazer primeiro sem se afogar em informação",
      description:
        "Um guia prático para organizar documentos, evitar decisões caras por medo e conversar com profissionais e escola com mais clareza nos primeiros 30 dias.",
      priceCents: 997,
      currency: "brl",
      status: "published",
    },
    chapters: COURSE_SECTION_MARKERS.map((section, index) => {
      const sectionContent = sliceRequiredSectionByMarker(markdown, section);
      const suffix = sectionIdSuffix(section.id);
      const blocks: ImportedBlock[] = [
        richTextBlock(
          `block-guia-${suffix}-conteudo`,
          sectionTitleFromMarkdown(sectionContent, section.title),
          sectionContent,
          1,
        ),
      ];
      const checklistItems = collectChecklistItems(sectionContent, suffix);

      if (checklistItems.length > 0 && section.title.startsWith("Semana")) {
        blocks.push(
          checklistBlock(
            `block-guia-${suffix}-checklist`,
            `Checklist da ${section.title.split(":")[0]}`,
            checklistItems,
            2,
          ),
        );
      }

      if (section.id === "chapter-guia-familia-materiais") {
        blocks.push(
          downloadBlock(
            "block-guia-curso-completo-download",
            "Download do PDF completo",
            "Baixar PDF",
            2,
            {
              mode: "dynamic_pdf",
              productSlug: GUIDE_PRATICO_SLUG,
            },
            "guia-pratico-primeiros-30-dias-completo",
          ),
        );
      }

      return {
        id: section.id,
        title: section.title,
        sortOrder: index + 1,
        isPublished: true,
        blocks,
      };
    }),
  };
}

export async function importGuidePraticoCourse() {
  const course = buildGuidePraticoCourseDefinition();
  const hashedPassword = await hashPassword(GUIDE_PRATICO_TEST_USER_PASSWORD);

  await db.transaction(async (tx) => {
    await tx
      .insert(products)
      .values({
        id: course.product.id,
        slug: course.product.slug,
        title: course.product.title,
        subtitle: course.product.subtitle,
        description: course.product.description,
        priceCents: course.product.priceCents,
        currency: course.product.currency,
        status: course.product.status,
        stripePriceId: null,
      })
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
          stripePriceId: null,
        },
      });

    for (const chapter of course.chapters) {
      await tx
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
            productId: course.product.id,
            title: chapter.title,
            sortOrder: chapter.sortOrder,
            isPublished: chapter.isPublished,
          },
        });

      for (const block of chapter.blocks) {
        await tx
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
              chapterId: chapter.id,
              type: block.type,
              title: block.title,
              payloadJson: block.payloadJson,
              sortOrder: block.sortOrder,
              isPublished: block.isPublished,
            },
          });
      }
    }

    const [existingSeedUser] = await tx
      .select({
        id: users.id,
      })
      .from(users)
      .where(eq(users.email, GUIDE_PRATICO_TEST_USER_EMAIL))
      .limit(1);
    const guidePraticoUserId = existingSeedUser?.id ?? GUIDE_PRATICO_TEST_USER_ID;

    await tx
      .insert(users)
      .values({
        id: guidePraticoUserId,
        name: "Usuário Teste Guia Prático",
        email: GUIDE_PRATICO_TEST_USER_EMAIL,
        emailVerified: true,
        role: "customer",
        image: null,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          name: "Usuário Teste Guia Prático",
          email: GUIDE_PRATICO_TEST_USER_EMAIL,
          emailVerified: true,
          role: "customer",
          image: null,
        },
      });

    const [existingCredentialAccount] = await tx
      .select({
        id: account.id,
      })
      .from(account)
      .where(
        and(
          eq(account.userId, guidePraticoUserId),
          eq(account.providerId, "credential"),
        ),
      )
      .limit(1);

    if (existingCredentialAccount) {
      await tx
        .update(account)
        .set({
          providerId: "credential",
          accountId: guidePraticoUserId,
          password: hashedPassword,
        })
        .where(eq(account.id, existingCredentialAccount.id));
    } else {
      await tx.insert(account).values({
        id: `account-credential-${guidePraticoUserId}`,
        providerId: "credential",
        accountId: guidePraticoUserId,
        userId: guidePraticoUserId,
        password: hashedPassword,
      });
    }

    await tx
      .insert(entitlements)
      .values({
        id: randomUUID(),
        userId: guidePraticoUserId,
        productId: course.product.id,
        sourceOrderId: null,
        status: "active",
      })
      .onConflictDoUpdate({
        target: [entitlements.userId, entitlements.productId],
        set: {
          status: "active",
          sourceOrderId: null,
        },
      });
  });
}
