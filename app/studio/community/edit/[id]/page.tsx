import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { updateContentAction } from "@/lib/actions/content";

type PageProps = {
  params: Promise<{ id: string }>;
};

type JoinTeamContent = {
  id: number;
  type: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string | null;
  category: string | null;
  primary_section: string | null;
  topic: string | null;
  status: string | null;
  featured: boolean | null;
  image_url: string | null;
  video_url: string | null;
  tags: string[] | null;
  reading_minutes: number | null;
};

function getContentLabel(topic?: string | null) {
  if (!topic) return "Article";
  return topic
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default async function EditJoinTeamContentPage({
  params,
}: PageProps) {
  const { id } = await params;
  const numericId = Number(id);

  if (!numericId) notFound();

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("content_items")
    .select(`
      id,
      type,
      title,
      slug,
      excerpt,
      body,
      category,
      primary_section,
      topic,
      status,
      featured,
      image_url,
      video_url,
      tags,
      reading_minutes
    `)
    .eq("id", numericId)
    .single();

  if (error || !data) notFound();

  const item = data as JoinTeamContent;
  const formatLabel = getContentLabel(item.topic);

  return (
    <main style={{ minHeight: "100vh", padding: "32px 36px 70px", background: "#f4f7f2", color: "#173d29" }}>
      <div style={{ width: "min(100%, 1180px)", margin: "0 auto" }}>
        <Link href="/studio/community/library" style={{ display: "inline-flex", marginBottom: 20, color: "#4c6956", fontSize: 13, fontWeight: 800, textDecoration: "none" }}>
          ← Back to Join Our Team Content
        </Link>

        <div style={{ display: "flex", justifyContent: "space-between", gap: 24, alignItems: "flex-end", marginBottom: 26 }}>
          <div>
            <p style={{ margin: "0 0 7px", color: "#287244", fontSize: 11, fontWeight: 900, letterSpacing: ".18em", textTransform: "uppercase" }}>
              WonderfulLife Studio
            </p>
            <h1 style={{ margin: 0, color: "#173d29", fontSize: 40, lineHeight: 1.08, letterSpacing: "-.03em" }}>
              Edit {formatLabel}
            </h1>
            <p style={{ maxWidth: 720, margin: "10px 0 0", color: "#728078", fontSize: 14, lineHeight: 1.65 }}>
              Update your content, save your work, or publish it when you are ready.
            </p>
          </div>

          <span style={{ padding: "8px 13px", borderRadius: 999, background: "#e8f2e7", color: "#287244", fontSize: 11, fontWeight: 900 }}>
            {formatLabel}
          </span>
        </div>

        <form action={updateContentAction} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 300px", gap: 22, alignItems: "start" }}>
          <input type="hidden" name="id" value={item.id} />
          <input type="hidden" name="type" value={item.type || "article"} />
          <input type="hidden" name="studio_context" value="community" />
          <input type="hidden" name="primary_section" value="Join Our Team" />
          <input type="hidden" name="category" value="Join Our Team" />
          <input type="hidden" name="topic" value={item.topic || "article"} />

          <div style={{ display: "grid", gap: 18 }}>
            <section style={{ padding: 25, border: "1px solid #dce5da", borderRadius: 17, background: "#fff" }}>
              <h2 style={{ margin: 0, fontSize: 18 }}>Content Details</h2>

              <label style={{ display: "block", marginTop: 18, marginBottom: 7, fontSize: 11, fontWeight: 900 }}>Title</label>
              <input name="title" defaultValue={item.title} required style={{ width: "100%", height: 45, padding: "0 13px", border: "1px solid #d8e1d6", borderRadius: 10 }} />

              <label style={{ display: "block", marginTop: 18, marginBottom: 7, fontSize: 11, fontWeight: 900 }}>URL slug</label>
              <input name="slug" defaultValue={item.slug} required style={{ width: "100%", height: 45, padding: "0 13px", border: "1px solid #d8e1d6", borderRadius: 10 }} />

              <label style={{ display: "block", marginTop: 18, marginBottom: 7, fontSize: 11, fontWeight: 900 }}>Short description</label>
              <textarea name="excerpt" defaultValue={item.excerpt || ""} rows={5} style={{ width: "100%", padding: 13, border: "1px solid #d8e1d6", borderRadius: 10, resize: "vertical" }} />
            </section>

            <section style={{ padding: 25, border: "1px solid #dce5da", borderRadius: 17, background: "#fff" }}>
              <h2 style={{ margin: 0, fontSize: 18 }}>Content</h2>
              <textarea name="body" defaultValue={item.body || ""} style={{ width: "100%", minHeight: 600, marginTop: 18, padding: 13, border: "1px solid #d8e1d6", borderRadius: 10, resize: "vertical", lineHeight: 1.7 }} />
            </section>

            <section style={{ padding: 25, border: "1px solid #dce5da", borderRadius: 17, background: "#fff" }}>
              <h2 style={{ margin: 0, fontSize: 18 }}>Media</h2>
              <label style={{ display: "block", marginTop: 18, marginBottom: 7, fontSize: 11, fontWeight: 900 }}>Featured image URL</label>
              <input name="image_url" defaultValue={item.image_url || ""} style={{ width: "100%", height: 45, padding: "0 13px", border: "1px solid #d8e1d6", borderRadius: 10 }} />

              <label style={{ display: "block", marginTop: 18, marginBottom: 7, fontSize: 11, fontWeight: 900 }}>Video URL</label>
              <input name="video_url" defaultValue={item.video_url || ""} style={{ width: "100%", height: 45, padding: "0 13px", border: "1px solid #d8e1d6", borderRadius: 10 }} />
            </section>
          </div>

          <aside style={{ display: "grid", gap: 18 }}>
            <section style={{ padding: 25, border: "1px solid #dce5da", borderRadius: 17, background: "#fff" }}>
              <h2 style={{ margin: 0, fontSize: 18 }}>Publish</h2>

              <label style={{ display: "block", marginTop: 18, marginBottom: 7, fontSize: 11, fontWeight: 900 }}>Status</label>
              <select name="status" defaultValue={item.status || "draft"} style={{ width: "100%", height: 45, padding: "0 13px", border: "1px solid #d8e1d6", borderRadius: 10 }}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>

              <label style={{ display: "block", marginTop: 18, marginBottom: 7, fontSize: 11, fontWeight: 900 }}>Reading time</label>
              <input name="reading_minutes" type="number" min="1" defaultValue={item.reading_minutes || 5} style={{ width: "100%", height: 45, padding: "0 13px", border: "1px solid #d8e1d6", borderRadius: 10 }} />

              <label style={{ display: "flex", gap: 9, marginTop: 18, fontSize: 12, lineHeight: 1.5 }}>
                <input type="checkbox" name="featured" defaultChecked={Boolean(item.featured)} />
                <span>Feature this resource on the Join Our Team experience.</span>
              </label>

              <button type="submit" style={{ width: "100%", minHeight: 44, marginTop: 18, border: 0, borderRadius: 10, background: "#246b40", color: "#fff", fontWeight: 900, cursor: "pointer" }}>
                Save Changes
              </button>
            </section>

            <section style={{ padding: 18, borderRadius: 13, background: "#edf5eb" }}>
              <p style={{ margin: "0 0 7px", color: "#287244", fontSize: 9, fontWeight: 900, letterSpacing: ".14em", textTransform: "uppercase" }}>
                Publishing Standard
              </p>
              <h3 style={{ margin: 0, fontSize: 16 }}>Information. Support. Freedom to Decide.</h3>
            </section>
          </aside>
        </form>
      </div>
    </main>
  );
}