const coversBySlug: Record<string, string> = {
  "guia-pratico-primeiros-30-dias-apos-diagnostico":
    "/images/guia-pratico-cover.png",
};

export function getProductCoverUrl(slug: string): string | null {
  return coversBySlug[slug] ?? null;
}
