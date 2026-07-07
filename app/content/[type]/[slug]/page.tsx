import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function ContentPage({ params }: { params: Promise<{ type: string; slug: string }> }) {
  const { type, slug } = await params;
  const supabase = await createClient();
  const { data: item } = await supabase.from("content_items").select("*").eq("type", type).eq("slug", slug).single();

  if (!item) {
    return <main className="mx-auto max-w-5xl px-5 py-16"><section className="rounded-[2rem] bg-white p-10 shadow-wl">Content not found.</section></main>;
  }

  return (
    <main className="mx-auto max-w-5xl px-5 py-16">
      <article className="rounded-[2.5rem] bg-white p-8 shadow-wl md:p-12">
        <p className="font-black uppercase tracking-[.13em] text-forest">{item.type} • {item.category}</p>
        <h1 className="mt-3 font-serif text-5xl md:text-7xl">{item.title}</h1>
        {item.image_url ? <img src={item.image_url} alt="" className="mt-8 max-h-[520px] w-full rounded-[2rem] object-cover" /> : null}
        {item.excerpt ? <p className="mt-8 text-2xl leading-relaxed text-muted">{item.excerpt}</p> : null}
        {item.video_url && item.type === "video" ? <video className="mt-8 w-full rounded-[2rem]" controls src={item.video_url} /> : null}
        <div className="prose mt-8 max-w-none whitespace-pre-wrap text-lg leading-relaxed">{item.body}</div>
        <div className="mt-10">
          <Link href="/search" className="font-black text-forest">Search more content</Link>
        </div>
      </article>
    </main>
  );
}
