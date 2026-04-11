import { readFile } from "node:fs/promises";

import { NextResponse } from "next/server";

import { requireServerSession } from "@/domains/auth/server";
import {
  canAccessProduct,
  getUserProductEntitlement,
} from "@/domains/orders/access";
import {
  ensureProductPdf,
  normalizeProductContentForPdf,
  type ProductPdfVariant,
} from "@/domains/products/pdf";
import {
  getProductBySlug,
  getPublishedProductContent,
} from "@/domains/products/queries";

function parseVariant(value: string | null): ProductPdfVariant | null {
  return value === "fast" || value === "print" ? value : null;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const url = new URL(request.url);
  const variant = parseVariant(url.searchParams.get("variant"));

  if (!variant) {
    return NextResponse.json(
      { error: "Invalid pdf variant." },
      { status: 400 },
    );
  }

  const session = await requireServerSession();
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product || product.status !== "published") {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  const entitlement = await getUserProductEntitlement(
    session.user.id,
    product.id,
  );

  if (!canAccessProduct(entitlement)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const chapters = await getPublishedProductContent(product.id);
  const normalized = normalizeProductContentForPdf({
    product: {
      id: product.id,
      slug: product.slug,
      title: product.title,
      subtitle: product.subtitle,
    },
    chapters,
  });
  const pdfPath = await ensureProductPdf(normalized, variant);
  const buffer = await readFile(pdfPath);

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${product.slug}-${variant}.pdf"`,
      "Cache-Control": "private, max-age=0, must-revalidate",
    },
  });
}
