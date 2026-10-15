import type { Metadata } from "next";

export type CmsPageMeta = {
  meta_title?: string | null;
  meta_description?: string | null;
  og_image?: string | null;
  og_image_alt?: string | null;
};

export function buildMetadata(
  page: CmsPageMeta | undefined,
  fallback: { title: string; description: string },
): Metadata {
  const title = page?.meta_title || fallback.title;
  const description = page?.meta_description || fallback.description;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(page?.og_image && {
        images: [{ url: page.og_image, alt: page.og_image_alt || title }],
      }),
    },
  };
}
