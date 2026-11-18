import Image from "next/image";

import { getProductCoverUrl } from "@/lib/product-assets";

export function ProductCover({
  slug,
  title,
  priority = false,
  size = "shelf",
}: {
  slug: string;
  title: string;
  priority?: boolean;
  size?: "hero" | "shelf" | "thumb";
}) {
  const src = getProductCoverUrl(slug) ?? "/images/guia-pratico-cover.png";
  const sizeClass =
    size === "hero"
      ? "va-book va-book-hero"
      : size === "thumb"
        ? "va-book va-book-thumb"
        : "va-book";

  return (
    <figure className={sizeClass}>
      <span className="va-book-ribbon" aria-hidden="true" />
      <Image
        src={src}
        alt={`Capa de ${title}`}
        width={480}
        height={640}
        className="va-book-image"
        priority={priority}
      />
    </figure>
  );
}
