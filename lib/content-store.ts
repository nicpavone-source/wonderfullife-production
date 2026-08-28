export type ContentType = "article" | "recipe";
export type ContentStatus = "draft" | "published";

export type ContentItem = {
  id: string;
  type: ContentType;
  status: ContentStatus;
  title: string;
  slug: string;
  summary: string;
  body: string;
  category: string;
  tags: string[];
  featuredImage: string;
  author: string;
  prepTime?: string;
  cookTime?: string;
  ingredients?: string;
  instructions?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
};

const KEY = "wonderfullife-content-v1";

const seed: ContentItem[] = [{
  id: "welcome-to-wonderfullife",
  type: "article",
  status: "published",
  title: "Welcome to WonderfulLife",
  slug: "welcome-to-wonderfullife",
  summary: "A warm introduction to practical wellness, nourishing habits and the WonderfulLife community.",
  body: "WonderfulLife was created to make healthy living feel welcoming, practical and possible.\n\nOpen the Content Studio, create a new article or recipe, and publish it when you are ready.",
  category: "WonderfulLife",
  tags: ["welcome", "wellness"],
  featuredImage: "",
  author: "Zoey",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  publishedAt: new Date().toISOString()
}];

export function slugify(value: string) {
  return value.toLowerCase().trim().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 90);
}

export function readContent(): ContentItem[] {
  if (typeof window === "undefined") return seed;
  const stored = localStorage.getItem(KEY);
  if (!stored) {
    localStorage.setItem(KEY, JSON.stringify(seed));
    return seed;
  }
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : seed;
  } catch {
    return seed;
  }
}

export function writeContent(items: ContentItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("wonderfullife-content-updated"));
}

export function getContentById(id: string) {
  return readContent().find((item) => item.id === id);
}

export function getContentBySlug(slug: string) {
  return readContent().find((item) => item.slug === slug);
}

export function upsertContent(input: Partial<ContentItem> & Pick<ContentItem, "type"|"status"|"title"|"slug">) {
  const items = readContent();
  const now = new Date().toISOString();
  const item: ContentItem = {
    id: input.id || crypto.randomUUID(),
    type: input.type,
    status: input.status,
    title: input.title,
    slug: input.slug,
    summary: input.summary || "",
    body: input.body || "",
    category: input.category || "Wellness",
    tags: input.tags || [],
    featuredImage: input.featuredImage || "",
    author: input.author || "Zoey",
    prepTime: input.prepTime,
    cookTime: input.cookTime,
    ingredients: input.ingredients,
    instructions: input.instructions,
    createdAt: input.createdAt || now,
    updatedAt: now,
    publishedAt: input.status === "published" ? now : undefined
  };
  const index = items.findIndex((x) => x.id === item.id);
  if (index >= 0) items[index] = item; else items.unshift(item);
  writeContent(items);
  return item;
}

export function deleteContent(id: string) {
  writeContent(readContent().filter((item) => item.id !== id));
}
