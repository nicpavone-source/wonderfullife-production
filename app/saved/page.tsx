import ContentCard from "@/components/ContentCard";
import { createClient } from "@/lib/supabase/server";

export default async function SavedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: rows } = await supabase.from("saved_content").select("content_items(*)").eq("user_id", user?.id);
  const items = (rows || []).map((r: any) => r.content_items).filter(Boolean);

  return (
    <main className="mx-auto max-w-7xl px-5 py-16 md:px-10">
      <p className="text-center font-black uppercase tracking-[.13em] text-forest">Member Library</p>
      <h1 className="mb-10 mt-3 text-center font-serif text-5xl md:text-7xl">Saved Content</h1>
      {items.length ? <div className="grid gap-6 md:grid-cols-3">{items.map((item: any) => <ContentCard key={item.id} item={item} />)}</div> : <div className="rounded-[2rem] bg-white p-10 text-center shadow-wl">No saved content yet.</div>}
    </main>
  );
}
