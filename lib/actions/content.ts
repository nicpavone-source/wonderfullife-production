"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function createContentAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const type = String(formData.get("type") || "article");
  const title = String(formData.get("title") || "");
  const slug = slugify(String(formData.get("slug") || title));

  const { error } = await supabase.from("content_items").insert({
    created_by: user.id,
    type,
    title,
    slug,
    excerpt: String(formData.get("excerpt") || ""),
    body: String(formData.get("body") || ""),
    category: String(formData.get("category") || "Wellness"),
    status: String(formData.get("status") || "draft"),
    featured: formData.get("featured") === "on",
    image_url: String(formData.get("image_url") || ""),
    video_url: String(formData.get("video_url") || ""),
    tags: String(formData.get("tags") || "").split(",").map(t => t.trim()).filter(Boolean),
    reading_minutes: Number(formData.get("reading_minutes") || 5)
  });

  if (error) redirect(`/studio/${type}s?message=${encodeURIComponent(error.message)}`);
  revalidatePath("/");
  revalidatePath(`/${type}s`);
  redirect(`/studio/${type}s?message=Content saved.`);
}
