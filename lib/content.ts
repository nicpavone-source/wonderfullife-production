import { createClient } from "@/lib/supabase/server";

export async function getPublishedContent({ type, q, category, limit = 24 }: { type?: string; q?: string; category?: string; limit?: number }) {
  const supabase = await createClient();
  let query = supabase.from("content_items").select("*").eq("status", "published").order("created_at", { ascending: false }).limit(limit);

  if (type) query = query.eq("type", type);
  if (category) query = query.ilike("category", `%${category}%`);
  if (q) query = query.or(`title.ilike.%${q}%,excerpt.ilike.%${q}%,body.ilike.%${q}%,category.ilike.%${q}%`);

  const { data } = await query;
  return data || [];
}

export async function getFeaturedContent() {
  const supabase = await createClient();
  const { data } = await supabase.from("content_items").select("*").eq("status", "published").eq("featured", true).limit(3);
  return data || [];
}
