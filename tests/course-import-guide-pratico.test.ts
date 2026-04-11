import { and, eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { verifyPassword } from "better-auth/crypto";

import { db } from "@/db/client";
import { account, entitlements, products, users } from "@/db/schema";
import {
  buildGuidePraticoCourseDefinition,
  buildGuidePraticoCourseDefinitionFromMarkdown,
  GUIDE_PRATICO_PRODUCT_ID,
  GUIDE_PRATICO_TEST_USER_EMAIL,
  GUIDE_PRATICO_TEST_USER_PASSWORD,
  GUIDE_PRATICO_SLUG,
  importGuidePraticoCourse,
  resolveGuidePraticoMarkdownPath,
} from "@/domains/course-import/guide-pratico";

describe("buildGuidePraticoCourseDefinition", () => {
  async function resetGuidePraticoSeedState() {
    await db
      .delete(entitlements)
      .where(eq(entitlements.productId, GUIDE_PRATICO_PRODUCT_ID));
    await db
      .delete(account)
      .where(
        and(
          eq(account.providerId, "credential"),
          eq(account.accountId, "user-guia-pratico-seed"),
        ),
      );
    await db.delete(users).where(eq(users.email, GUIDE_PRATICO_TEST_USER_EMAIL));
    await db.delete(products).where(eq(products.id, GUIDE_PRATICO_PRODUCT_ID));
  }

  it("builds the published product metadata from the markdown source", () => {
    const course = buildGuidePraticoCourseDefinition();

    expect(course.product).toMatchObject({
      id: GUIDE_PRATICO_PRODUCT_ID,
      slug: GUIDE_PRATICO_SLUG,
      status: "published",
      priceCents: 9700,
      currency: "brl",
    });
    expect(course.product.description).toContain("evitar decisões caras");
    expect(course.product.description).toContain("conversar com profissionais e escola");
    expect(course.product.title).toContain("Suspeita ou Diagnóstico");
    expect(course.product.subtitle).toContain("organizar o que fazer primeiro");
  });

  it("creates chapters and rich text content from the guide", () => {
    const course = buildGuidePraticoCourseDefinition();

    expect(course.chapters).toHaveLength(7);
    expect(course.chapters.map((chapter) => chapter.title)).toEqual([
      "Comece por aqui",
      "Primeiras 72 horas",
      "Semana 1: Sair do caos",
      "Semana 2: Profissionais, terapias e critério",
      "Semana 3: Casa, rotina e escola",
      "Semana 4: Brasil real, direitos e próximos 60 dias",
      "Família inteira e materiais interativos",
    ]);
    expect(course.chapters[0]?.blocks.some((block) => block.type === "rich_text")).toBe(true);
  });

  it("creates checklist and download blocks for actionable sections and deliverables", () => {
    const course = buildGuidePraticoCourseDefinition();
    const blockTypes = course.chapters.flatMap((chapter) => chapter.blocks.map((block) => block.type));
    const checklistBlock = course.chapters
      .flatMap((chapter) => chapter.blocks)
      .find((block) => block.type === "checklist");

    expect(blockTypes).toContain("checklist");
    expect(blockTypes).toContain("download");
    expect(
      JSON.parse(checklistBlock?.payloadJson ?? "{\"items\":[]}").items.length,
    ).toBeGreaterThan(0);
  });

  it("includes a full-course download link in the support materials", () => {
    const course = buildGuidePraticoCourseDefinition();
    const downloadBlock = course.chapters
      .flatMap((chapter) => chapter.blocks)
      .find((block) => block.type === "download");

    expect(downloadBlock?.title).toBe("Download do PDF completo");
    expect(JSON.parse(downloadBlock?.payloadJson ?? "{}")).toMatchObject({
      assetId: "guia-pratico-primeiros-30-dias-completo",
      label: "Baixar PDF",
      mode: "dynamic_pdf",
      productSlug: GUIDE_PRATICO_SLUG,
    });
  });

  it("keeps practical guidance and safety language in the imported content", () => {
    const course = buildGuidePraticoCourseDefinition();
    const markdown = course.chapters
      .flatMap((chapter) => chapter.blocks)
      .filter((block) => block.type === "rich_text")
      .map((block) => JSON.parse(block.payloadJson).markdown)
      .join("\n");

    expect(markdown).toContain("Este guia não substitui avaliação médica");
    expect(markdown).toContain("promessa de cura");
    expect(markdown).toContain("Mensagem para a escola");
    expect(markdown).toContain("Próximos 60 dias");
  });

  it("includes conversion and retention support sections in the guide content", () => {
    const course = buildGuidePraticoCourseDefinition();
    const markdown = course.chapters
      .flatMap((chapter) => chapter.blocks)
      .filter((block) => block.type === "rich_text")
      .map((block) => JSON.parse(block.payloadJson).markdown)
      .join("\n");

    expect(markdown).toContain("Para quem este guia não é");
    expect(markdown).toContain("Plano de 30 dias em uma página");
    expect(markdown).toContain("Versão rápida");
    expect(markdown).toContain("Exemplo preenchido");
    expect(markdown).toContain("Resposta boa");
    expect(markdown).toContain("Resposta ruim");
    expect(markdown).toContain("3 armadilhas das primeiras semanas");
    expect(markdown).toContain("Plano B");
  });

  it("positions the guide as a practical first-steps ebook", () => {
    const course = buildGuidePraticoCourseDefinition();
    const markdown = course.chapters
      .flatMap((chapter) => chapter.blocks)
      .filter((block) => block.type === "rich_text")
      .map((block) => JSON.parse(block.payloadJson).markdown)
      .join("\n");

    expect(markdown).toContain("Nos primeiros 30 dias");
    expect(markdown).toContain("Missão 0");
    expect(markdown).toContain("Missão 1");
    expect(markdown).toContain("Resultado esperado");
    expect(markdown).toContain("Família inteira");
    expect(markdown).toContain("Materiais interativos");
    expect(markdown).toContain("PDF para imprimir, levar em consulta ou revisar com a escola");
  });

  it("adds Brazilian support, rights, caregiver, and family guidance", () => {
    const course = buildGuidePraticoCourseDefinition();
    const markdown = course.chapters
      .flatMap((chapter) => chapter.blocks)
      .filter((block) => block.type === "rich_text")
      .map((block) => JSON.parse(block.payloadJson).markdown)
      .join("\n");

    expect(markdown).toContain("Brasil real e direitos");
    expect(markdown).toContain("UBS");
    expect(markdown).toContain("CER");
    expect(markdown).toContain("CAPS");
    expect(markdown).toContain("Lei 12.764/2012");
    expect(markdown).toContain("Lei Brasileira de Inclusão");
    expect(markdown).toContain("CIPTEA");
    expect(markdown).toContain("CRAS");
    expect(markdown).toContain("Família inteira");
    expect(markdown).toContain("Cuidador também precisa de plano");
    expect(markdown).toContain("Fontes confiáveis para continuar");
  });

  it("keeps suspicion and diagnosis paths visible in the imported guide", () => {
    const course = buildGuidePraticoCourseDefinition();
    const markdown = course.chapters
      .flatMap((chapter) => chapter.blocks)
      .filter((block) => block.type === "rich_text")
      .map((block) => JSON.parse(block.payloadJson).markdown)
      .join("\n");

    expect(markdown).toContain("Se você está em fase de suspeita");
    expect(markdown).toContain("Se você já recebeu o diagnóstico");
    expect(markdown).toContain("fluxo de diagnóstico ou investigação");
    expect(markdown).toContain("acesso a apoio, escola e direitos");
  });

  it("resolves the guide source from a stable filename prefix", () => {
    expect(resolveGuidePraticoMarkdownPath()).toContain(
      "Guia Prático Primeiros 30 Dias Após o Diagnóstico",
    );
  });

  it("fails fast when required markdown sections are missing", () => {
    expect(() => buildGuidePraticoCourseDefinitionFromMarkdown("# Guia incompleto")).toThrow(
      /Missing required guide section/i,
    );
  });

  it("persists the product, test user, and entitlement idempotently", async () => {
    await resetGuidePraticoSeedState();

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
    expect(user).toMatchObject({
      id: "user-guia-pratico-seed",
      name: "Usuário Teste Guia Prático",
      email: GUIDE_PRATICO_TEST_USER_EMAIL,
      role: "customer",
      emailVerified: true,
    });

    const userEntitlements = await db
      .select()
      .from(entitlements)
      .where(
        and(
          eq(entitlements.userId, "user-guia-pratico-seed"),
          eq(entitlements.productId, GUIDE_PRATICO_PRODUCT_ID),
        ),
      );

    expect(userEntitlements).toHaveLength(1);
    expect(userEntitlements[0]?.status).toBe("active");
  });

  it("reuses an existing user with the seed email when the id differs", async () => {
    const legacyUserId = "user-guia-pratico-legacy";

    await resetGuidePraticoSeedState();

    await db.insert(users).values({
      id: legacyUserId,
      name: "Legado",
      email: GUIDE_PRATICO_TEST_USER_EMAIL,
      emailVerified: false,
      role: "admin",
      image: null,
    });

    await importGuidePraticoCourse();

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, GUIDE_PRATICO_TEST_USER_EMAIL))
      .limit(1);
    const userEntitlements = await db
      .select()
      .from(entitlements)
      .where(
        and(
          eq(entitlements.userId, legacyUserId),
          eq(entitlements.productId, GUIDE_PRATICO_PRODUCT_ID),
        ),
      );

    expect(user).toMatchObject({
      id: legacyUserId,
      name: "Usuário Teste Guia Prático",
      email: GUIDE_PRATICO_TEST_USER_EMAIL,
      role: "customer",
      emailVerified: true,
    });
    expect(userEntitlements).toHaveLength(1);
    expect(userEntitlements[0]?.status).toBe("active");
  });

  it("is safe to call through the seed entrypoint", async () => {
    const { seedDatabase } = await import("@/db/seed");

    await expect(seedDatabase()).resolves.toBeUndefined();
  });

  it("creates a credential account for the seeded user", async () => {
    await resetGuidePraticoSeedState();

    await importGuidePraticoCourse();

    const [credentialAccount] = await db
      .select()
      .from(account)
      .where(
        and(
          eq(account.providerId, "credential"),
          eq(account.userId, "user-guia-pratico-seed"),
        ),
      )
      .limit(1);

    expect(credentialAccount?.accountId).toBe("user-guia-pratico-seed");
    expect(credentialAccount?.password).toBeTruthy();
    await expect(
      verifyPassword({
        hash: credentialAccount?.password ?? "",
        password: GUIDE_PRATICO_TEST_USER_PASSWORD,
      }),
    ).resolves.toBe(true);
  });
});
