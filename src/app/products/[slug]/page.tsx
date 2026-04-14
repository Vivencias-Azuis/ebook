import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductSalesLanding } from "@/components/marketing/product-sales-landing";
import { getProductBySlug } from "@/domains/products/queries";
import { getProductCoverUrl } from "@/lib/product-assets";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product || product.status !== "published") {
    return {};
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const coverUrl = getProductCoverUrl(slug);
  const ogImage = coverUrl ? `${appUrl}${coverUrl}` : undefined;

  return {
    title: product.title,
    description: product.subtitle ?? product.description,
    openGraph: {
      title: product.title,
      description: product.subtitle ?? product.description,
      type: "website",
      url: `${appUrl}/products/${slug}`,
      ...(ogImage && {
        images: [{ url: ogImage, width: 480, height: 640, alt: product.title }],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description: product.subtitle ?? product.description,
      ...(ogImage && { images: [ogImage] }),
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product || product.status !== "published") {
    notFound();
  }

  return <ProductSalesLanding product={product} />;
}
