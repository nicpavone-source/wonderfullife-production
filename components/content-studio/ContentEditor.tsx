"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type ContentType = "article" | "recipe";
type ContentStatus = "draft" | "published";

type EditorForm = {
  title: string;
  slug: string;
  summary: string;
  body: string;
  category: string;
  author: string;
  tags: string;
  featuredImage: string;
  prepTime: string;
  cookTime: string;
  ingredients: string;
  instructions: string;
};

const blankForm: EditorForm = {
  title: "",
  slug: "",
  summary: "",
  body: "",
  category: "Wellness",
  author: "Zoey",
  tags: "",
  featuredImage: "",
  prepTime: "",
  cookTime: "",
  ingredients: "",
  instructions: "",
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ContentEditor({
  contentId,
}: {
  contentId?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialType: ContentType =
    searchParams.get("type") === "recipe" ? "recipe" : "article";

  const [type, setType] = useState<ContentType>(initialType);
  const [form, setForm] = useState<EditorForm>(blankForm);
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);

  const calculatedSlug = useMemo(
    () => form.slug.trim() || slugify(form.title),
    [form.slug, form.title]
  );

  function setField(name: keyof EditorForm, value: string) {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  useEffect(() => {
    if (!contentId) return;

    let cancelled = false;

    async function loadContent() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("content_items")
        .select("*")
        .eq("id", contentId)
        .single();

      if (error) {
        console.error(error);
        setNotice(`Unable to load content: ${error.message}`);
        return;
      }

      if (cancelled || !data) return;

      setType(data.type === "recipe" ? "recipe" : "article");

      setForm({
        title: data.title || "",
        slug: data.slug || "",
        summary: data.summary || data.excerpt || "",
        body: data.body || "",
        category: data.category || "Wellness",
        author: data.author || "Zoey",
        tags: Array.isArray(data.tags) ? data.tags.join(", ") : "",
        featuredImage: data.image_url || "",
        prepTime: "",
        cookTime: "",
        ingredients: "",
        instructions: "",
      });
    }

    loadContent();

    return () => {
      cancelled = true;
    };
  }, [contentId]);

  async function save(status: ContentStatus) {
    if (!form.title.trim()) {
      setNotice("Please add a title.");
      return;
    }

    if (!calculatedSlug) {
      setNotice("Please add a valid page address.");
      return;
    }

    setSaving(true);
    setNotice("Saving...");

    const supabase = createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setSaving(false);
      setNotice("Please sign in before saving content.");
      return;
    }

    const now = new Date().toISOString();

    let body = form.body;

    if (type === "recipe") {
      body = [
        form.body,
        form.ingredients
          ? `Ingredients\n\n${form.ingredients}`
          : "",
        form.instructions
          ? `Instructions\n\n${form.instructions}`
          : "",
      ]
        .filter(Boolean)
        .join("\n\n");
    }

    const contentData = {
      type,
      status,
      title: form.title.trim(),
      slug: calculatedSlug,
      summary: form.summary.trim(),
      excerpt: form.summary.trim(),
      body,
      category: form.category || "Wellness",
      author: form.author || "Zoey",
      image_url: form.featuredImage.trim() || null,
      tags: form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      published_at: status === "published" ? now : null,
      updated_at: now,
    };

    const result = contentId
      ? await supabase
          .from("content_items")
          .update(contentData)
          .eq("id", contentId)
          .select("id")
          .single()
      : await supabase
          .from("content_items")
          .insert({
            ...contentData,
            created_by: user.id,
            created_at: now,
          })
          .select("id")
          .single();

    if (result.error) {
      console.error(result.error);
      setSaving(false);
      setNotice(`Unable to save: ${result.error.message}`);
      return;
    }

    setSaving(false);

    setNotice(
      status === "published"
        ? "Published permanently to Supabase."
        : "Draft saved permanently to Supabase."
    );

    router.push(`/studio/edit/${result.data.id}`);
    router.refresh();
  }

  return (
    <div className="wl-editor">
      {notice && <div className="wl-notice">{notice}</div>}

      <div className="wl-editor-toolbar">
        <div className="wl-segmented">
          <button
            type="button"
            className={type === "article" ? "active" : ""}
            onClick={() => setType("article")}
          >
            Article
          </button>

          <button
            type="button"
            className={type === "recipe" ? "active" : ""}
            onClick={() => setType("recipe")}
          >
            Recipe
          </button>
        </div>

        <div className="wl-editor-buttons">
          <button
            type="button"
            className="wl-btn wl-btn-secondary"
            disabled={saving}
            onClick={() => save("draft")}
          >
            {saving ? "Saving..." : "Save Draft"}
          </button>

          <button
            type="button"
            className="wl-btn wl-btn-primary"
            disabled={saving}
            onClick={() => save("published")}
          >
            {saving ? "Saving..." : "Publish"}
          </button>
        </div>
      </div>

      <div className="wl-editor-grid">
        <section className="wl-editor-main">
          <label>
            Title
            <input
              value={form.title}
              onChange={(event) =>
                setField("title", event.target.value)
              }
              placeholder={
                type === "recipe" ? "Recipe title" : "Article title"
              }
            />
          </label>

          <label>
            Summary
            <textarea
              rows={3}
              value={form.summary}
              onChange={(event) =>
                setField("summary", event.target.value)
              }
              placeholder="Write a short introduction."
            />
          </label>

          {type === "recipe" ? (
            <>
              <div className="wl-two-column">
                <label>
                  Prep time
                  <input
                    value={form.prepTime}
                    onChange={(event) =>
                      setField("prepTime", event.target.value)
                    }
                    placeholder="15 minutes"
                  />
                </label>

                <label>
                  Cook time
                  <input
                    value={form.cookTime}
                    onChange={(event) =>
                      setField("cookTime", event.target.value)
                    }
                    placeholder="30 minutes"
                  />
                </label>
              </div>

              <label>
                Ingredients
                <textarea
                  rows={10}
                  value={form.ingredients}
                  onChange={(event) =>
                    setField("ingredients", event.target.value)
                  }
                  placeholder="Enter one ingredient per line."
                />
              </label>

              <label>
                Instructions
                <textarea
                  rows={12}
                  value={form.instructions}
                  onChange={(event) =>
                    setField("instructions", event.target.value)
                  }
                  placeholder="Enter one instruction per line."
                />
              </label>

              <label>
                Recipe notes
                <textarea
                  className="wl-editor-body"
                  rows={8}
                  value={form.body}
                  onChange={(event) =>
                    setField("body", event.target.value)
                  }
                />
              </label>
            </>
          ) : (
            <label>
              Article body
              <textarea
                className="wl-editor-body"
                rows={18}
                value={form.body}
                onChange={(event) =>
                  setField("body", event.target.value)
                }
                placeholder="Write the article here."
              />
            </label>
          )}
        </section>

        <aside className="wl-editor-sidebar">
          <div className="wl-panel">
            <h2>Publishing details</h2>

            <label>
              Category
              <select
                value={form.category}
                onChange={(event) =>
                  setField("category", event.target.value)
                }
              >
                <option>Wellness</option>
                <option>Nutrition</option>
                <option>Recovery</option>
                <option>Movement</option>
                <option>Healthy Aging</option>
                <option>Mindset</option>
                <option>Recipes</option>
              </select>
            </label>

            <label>
              Author
              <input
                value={form.author}
                onChange={(event) =>
                  setField("author", event.target.value)
                }
              />
            </label>

            <label>
              Tags
              <input
                value={form.tags}
                onChange={(event) =>
                  setField("tags", event.target.value)
                }
                placeholder="wellness, sleep, movement"
              />
            </label>

            <label>
              Page address
              <input
                value={form.slug}
                onChange={(event) =>
                  setField("slug", event.target.value)
                }
                placeholder={calculatedSlug}
              />
            </label>
          </div>

          <div className="wl-panel">
            <h2>Featured image</h2>

            <label>
              Image URL or public path
              <input
                value={form.featuredImage}
                onChange={(event) =>
                  setField("featuredImage", event.target.value)
                }
                placeholder="/images/article-image.jpg"
              />
            </label>

            {form.featuredImage && (
              <img
                className="wl-image-preview"
                src={form.featuredImage}
                alt="Content preview"
              />
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}