import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.wonderful-life.ca";

  const supabase = await createClient();

  const { data: contentItems } = await supabase
    .from("content_items")
    .select("type, slug, published_at, status")
    .eq("status", "published")
    .not("slug", "is", null);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/wellness`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/nutrition`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/articles`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/recipes`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/videos`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/shop`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/ask-zoey`,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/community`,
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  const dynamicPages: MetadataRoute.Sitemap =
    contentItems?.flatMap((item) => {
      let path = "";

      switch (item.type) {
        case "article":
          path = `/articles/${item.slug}`;
          break;

        case "recipe":
          path = `/recipes/${item.slug}`;
          break;

        case "video":
          path = `/videos/${item.slug}`;
          break;

        case "product":
          path = `/products/${item.slug}`;
          break;

        default:
          return [];
      }

      return [
        {
          url: `${baseUrl}${path}`,
          lastModified: item.published_at
            ? new Date(item.published_at)
            : undefined,
          changeFrequency: "weekly" as const,
          priority: 0.7,
        },
      ];
    }) ?? [];

  return [...staticPages, ...dynamicPages];
}