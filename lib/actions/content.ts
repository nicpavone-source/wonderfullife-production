"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function getStudioPath(type: string, studioContext?: string) {
  if (studioContext === "community") {
    return "/studio/community";
  }

  const paths: Record<string, string> = {
    article: "/studio/articles",
    recipe: "/studio/recipes",
    video: "/studio/videos",
    product: "/studio/products",
  };

  return paths[type] || "/studio";
}

function getPublicPath(type: string) {
  const paths: Record<string, string> = {
    article: "/articles",
    recipe: "/recipes",
    video: "/videos",
    product: "/shop",
  };

  return paths[type] || "/";
}

function readContentForm(formData: FormData) {
  const type = String(formData.get("type") || "article");
  const title = String(formData.get("title") || "").trim();
  const slug = slugify(String(formData.get("slug") || title));
  const status = String(formData.get("status") || "draft");
  const studioContext = String(
    formData.get("studio_context") || ""
  ).trim();

  const tags = formData
    .getAll("tags")
    .map((tag) => String(tag).trim())
    .filter(Boolean);

  return {
    type,
    title,
    slug,

    excerpt: String(formData.get("excerpt") || ""),
    body: String(formData.get("body") || ""),

    category: String(formData.get("category") || "Wellness"),

    primary_section: String(
      formData.get("primary_section") || ""
    ),

    topic: String(formData.get("topic") || ""),

    status,

    featured: formData.get("featured") === "on",

    image_url: String(formData.get("image_url") || ""),
    video_url: String(formData.get("video_url") || ""),

    tags,

    reading_minutes: Number(
      formData.get("reading_minutes") || 5
    ),

    studioContext,
  };
}

export async function createContentAction(
  formData: FormData
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const content = readContentForm(formData);
  const studioPath = getStudioPath(
    content.type,
    content.studioContext
  );

  if (!content.title) {
    redirect(
      `${studioPath}?message=${encodeURIComponent(
        "Content title is required."
      )}`
    );
  }

  if (!content.slug) {
    redirect(
      `${studioPath}?message=${encodeURIComponent(
        "Content URL slug is required."
      )}`
    );
  }

  const publishedAt =
    content.status === "published"
      ? new Date().toISOString()
      : null;

  const {
    studioContext: _studioContext,
    ...databaseContent
  } = content;

  const { error } = await supabase
    .from("content_items")
    .insert({
      created_by: user.id,
      ...databaseContent,
      published_at: publishedAt,
    });

  if (error) {
    redirect(
      `${studioPath}?message=${encodeURIComponent(
        error.message
      )}`
    );
  }

  revalidatePath("/studio");
  revalidatePath(studioPath);
  revalidatePath(getPublicPath(content.type));

  if (content.studioContext === "community") {
    revalidatePath("/community");
  }

  redirect(
    `${studioPath}?message=${encodeURIComponent(
      content.status === "published"
        ? "Content published successfully."
        : "Draft saved successfully."
    )}`
  );
}

export async function updateContentAction(
  formData: FormData
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const id = Number(formData.get("id"));
  const content = readContentForm(formData);
  const studioPath = getStudioPath(
    content.type,
    content.studioContext
  );

  if (!id) {
    redirect(
      `${studioPath}?message=${encodeURIComponent(
        "The content ID is missing."
      )}`
    );
  }

  if (!content.title) {
    redirect(
      `${studioPath}?message=${encodeURIComponent(
        "Content title is required."
      )}`
    );
  }

  if (!content.slug) {
    redirect(
      `${studioPath}?message=${encodeURIComponent(
        "Content URL slug is required."
      )}`
    );
  }

  const {
    studioContext: _studioContext,
    ...databaseContent
  } = content;

  const updates: Record<string, unknown> = {
    ...databaseContent,
    updated_at: new Date().toISOString(),
  };

  if (content.status === "published") {
    updates.published_at =
      new Date().toISOString();
  }

  const {
    data: updatedContent,
    error,
  } = await supabase
    .from("content_items")
    .update(updates)
    .eq("id", id)
    .eq("type", content.type)
    .select("id")
    .single();

  if (error) {
    redirect(
      `${studioPath}?message=${encodeURIComponent(
        error.message
      )}`
    );
  }

  if (!updatedContent) {
    redirect(
      `${studioPath}?message=${encodeURIComponent(
        "No content was updated."
      )}`
    );
  }

  revalidatePath("/studio");
  revalidatePath(studioPath);
  revalidatePath(`${studioPath}/edit/${id}`);
  revalidatePath(getPublicPath(content.type));
  revalidatePath(
    `${getPublicPath(content.type)}/${content.slug}`
  );

  if (content.studioContext === "community") {
    revalidatePath("/community");
  }

  redirect(
    `${studioPath}?message=${encodeURIComponent(
      content.status === "published"
        ? "Content updated and published."
        : "Content changes saved."
    )}`
  );
}