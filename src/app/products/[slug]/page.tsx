import { notFound } from "next/navigation";

import { ProductSalesLanding } from "@/components/marketing/product-sales-landing";
import { getProductBySlug } from "@/domains/products/queries";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product || product.status !== "published") {
    notFound();
  }

  return <ProductSalesLanding product={product} />;
}
