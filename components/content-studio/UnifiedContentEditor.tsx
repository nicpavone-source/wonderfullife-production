"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type StudioContentType = "article" | "recipe" | "video";
type ContentStatus = "draft" | "published";

type UnifiedContentEditorProps = {
  type: StudioContentType;
};

type ContentDraft = {
  title: string;
  category: string;
  tags: string;
  content: string;
  image: string;
  videoUrl: string;
  status: ContentStatus;
  featured: boolean;
};

function getDefaultCategory(type: StudioContentType) {
  if (type === "recipe") return "Breakfast";
  if (type === "video") return "Wellness";
  return "Wellness";
}

function createEmptyDraft(type: StudioContentType): ContentDraft {
  return {
    title: "",
    category: getDefaultCategory(type),
    tags: "",
    content: "",
    image: "",
    videoUrl: "",
    status: "draft",
    featured: false,
  };
}

function getTypeDetails(type: StudioContentType) {
  if (type === "recipe") {
    return {
      singular: "Recipe",
      plural: "Recipes",
      eyebrow: "RECIPE STUDIO",
      description:
        "Add a title, choose a category, upload a photo and enter the complete recipe.",
      contentLabel: "Recipe Content",
      contentPlaceholder:
        "Add the introduction, ingredients and step-by-step instructions...",
      previewAction: "Preview Full Recipe →",
    };
  }

  if (type === "video") {
    return {
      singular: "Video",
      plural: "Videos",
      eyebrow: "VIDEO STUDIO",
      description:
        "Add a title, choose a category, upload a thumbnail and enter the video details.",
      contentLabel: "Video Description or Transcript",
      contentPlaceholder:
        "Add the video description, transcript or supporting information...",
      previewAction: "Preview Full Video →",
    };
  }

  return {
    singular: "Article",
    plural: "Articles",
    eyebrow: "ARTICLE STUDIO",
    description:
      "Add a title, choose a category, upload a photo and start writing.",
    contentLabel: "Article Content",
    contentPlaceholder: "Start writing your article here...",
    previewAction: "Preview Full Article →",
  };
}

function makeSlug(title: string) {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function UnifiedContentEditor({
  type,
}: UnifiedContentEditorProps) {
  const details = getTypeDetails(type);
  const storageKey = `wonderfullife-${type}-draft`;

  const [draft, setDraft] = useState<ContentDraft>(() =>
    createEmptyDraft(type)
  );
  const [isLoaded, setIsLoaded] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    try {
      const savedDraft = window.localStorage.getItem(storageKey);

      if (savedDraft) {
        setDraft(JSON.parse(savedDraft));
      }
    } catch {
      setDraft(createEmptyDraft(type));
    }

    setIsLoaded(true);
  }, [storageKey, type]);

  const previewTitle =
    draft.title.trim() || `Your ${details.singular.toLowerCase()} title`;

  const previewText = useMemo(() => {
    const cleanText = draft.content.trim();

    if (!cleanText) {
      return `Start creating your ${details.singular.toLowerCase()} and a preview will appear here.`;
    }

    return cleanText.length > 150
      ? `${cleanText.slice(0, 150)}...`
      : cleanText;
  }, [draft.content, details.singular]);

  function updateDraft<Key extends keyof ContentDraft>(
    key: Key,
    value: ContentDraft[Key]
  ) {
    setDraft((current) => ({
      ...current,
      [key]: value,
    }));

    setSavedMessage("");
  }

  function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      window.alert("Please choose an image file.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      updateDraft("image", String(reader.result));
    };

    reader.readAsDataURL(file);
  }

  function saveDraft() {
    try {
      const localDraft = {
        ...draft,
        image: "",
        status: "draft" as ContentStatus,
      };

      window.localStorage.setItem(
        storageKey,
        JSON.stringify(localDraft)
      );

      updateDraft("status", "draft");
      setSavedMessage(`${details.singular} draft saved`);
    } catch {
      window.alert(
        "The draft could not be saved because browser storage is full."
      );
    }
  }

  async function publishContent() {
    if (!draft.title.trim()) {
      window.alert(`Please enter a ${details.singular.toLowerCase()} title.`);
      return;
    }

    if (!draft.content.trim()) {
      window.alert(`Please enter the ${details.contentLabel.toLowerCase()}.`);
      return;
    }

    setIsPublishing(true);
    setSavedMessage("");

    const supabase = createClient();
    const slug = makeSlug(draft.title);

    const tags = draft.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const contentRecord = {
      type,
      title: draft.title.trim(),
      slug,
      excerpt: draft.content.trim().slice(0, 180),
      summary: draft.content.trim().slice(0, 180),
      body: draft.content,
      category: draft.category || getDefaultCategory(type),
      status: "published",
      featured: draft.featured,
      image_url: draft.image || null,
      video_url: draft.videoUrl || null,
      tags,
      author: "Zoey",
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("content_items")
      .upsert(contentRecord, {
        onConflict: "type,slug",
      });

    setIsPublishing(false);

    if (error) {
      console.error(error);
      window.alert(
        `${details.singular} could not be published: ${error.message}`
      );
      return;
    }

    window.localStorage.removeItem(storageKey);

    setDraft((current) => ({
      ...current,
      status: "published",
    }));

    setSavedMessage(`${details.singular} published`);

    window.alert(`${details.singular} published successfully.`);
  }

  function startNewContent() {
    const confirmed = window.confirm(
      `Start a new ${details.singular.toLowerCase()}? Any unsaved changes will be cleared.`
    );

    if (!confirmed) return;

    setDraft(createEmptyDraft(type));
    setSavedMessage("");
    window.localStorage.removeItem(storageKey);
  }

  if (!isLoaded) {
    return null;
  }

  return (
    <main className="wl-studio-main">
      <header className="wl-studio-header">
        <div>
          <p className="wl-studio-eyebrow">{details.eyebrow}</p>
          <h1>Create New {details.singular}</h1>
          <p className="muted">{details.description}</p>
        </div>

        <button
          className="wl-button"
          type="button"
          onClick={startNewContent}
        >
          + New {details.singular}
        </button>
      </header>

      <div className="wl-studio-grid">
        <section className="wl-studio-section wl-studio-card">
          <div className="wl-studio-field">
            <label htmlFor={`${type}-title`}>
              {details.singular} Title
            </label>

            <input
              id={`${type}-title`}
              type="text"
              maxLength={100}
              value={draft.title}
              onChange={(event) =>
                updateDraft("title", event.target.value)
              }
              placeholder={`Enter your ${details.singular.toLowerCase()} title`}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: "18px",
            }}
          >
            <div className="wl-studio-field">
              <label htmlFor={`${type}-category`}>Category</label>

              <select
                id={`${type}-category`}
                value={draft.category}
                onChange={(event) =>
                  updateDraft("category", event.target.value)
                }
              >
                <option>Wellness</option>
                <option>Nutrition</option>
                <option>Breakfast</option>
                <option>Lunch</option>
                <option>Dinner</option>
                <option>Snacks</option>
                <option>Desserts</option>
                <option>Fitness</option>
                <option>Beauty</option>
                <option>Community</option>
              </select>
            </div>

            <div className="wl-studio-field">
              <label htmlFor={`${type}-tags`}>Tags</label>

              <input
                id={`${type}-tags`}
                type="text"
                value={draft.tags}
                onChange={(event) =>
                  updateDraft("tags", event.target.value)
                }
                placeholder="Example: breakfast, healthy, vegetables"
              />
            </div>
          </div>

          <div className="wl-studio-field">
            <label htmlFor={`${type}-image`}>Hero Image</label>

            <input
              id={`${type}-image`}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleImageUpload}
            />
          </div>

          {draft.image && (
            <div
              style={{
                overflow: "hidden",
                marginBottom: "22px",
                borderRadius: "18px",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={draft.image}
                alt={`${details.singular} preview`}
                style={{
                  width: "100%",
                  maxHeight: "420px",
                  objectFit: "cover",
                }}
              />
            </div>
          )}

          {type === "video" && (
            <div className="wl-studio-field">
              <label htmlFor="video-url">Video URL</label>

              <input
                id="video-url"
                type="url"
                value={draft.videoUrl}
                onChange={(event) =>
                  updateDraft("videoUrl", event.target.value)
                }
                placeholder="https://..."
              />
            </div>
          )}

          <div className="wl-studio-field">
            <label htmlFor={`${type}-content`}>
              {details.contentLabel}
            </label>

            <textarea
              id={`${type}-content`}
              value={draft.content}
              onChange={(event) =>
                updateDraft("content", event.target.value)
              }
              placeholder={details.contentPlaceholder}
              style={{ minHeight: "420px" }}
            />
          </div>

          <div className="wl-studio-message">
            {savedMessage || `${details.singular} ready to edit`}
          </div>
        </section>

        <section className="wl-studio-section wl-studio-card">
          <p className="wl-studio-eyebrow">
            {details.singular} Preview
          </p>

          <h2>{previewTitle}</h2>
          <p className="muted">{previewText}</p>

          <div className="wl-studio-field">
            <label>
              <input
                type="radio"
                name={`${type}-status`}
                checked={draft.status === "draft"}
                onChange={() => updateDraft("status", "draft")}
                style={{ width: "auto", marginRight: "8px" }}
              />
              Draft
            </label>

            <label>
              <input
                type="radio"
                name={`${type}-status`}
                checked={draft.status === "published"}
                onChange={() => updateDraft("status", "published")}
                style={{ width: "auto", marginRight: "8px" }}
              />
              Publish Now
            </label>
          </div>

          <label>
            <input
              type="checkbox"
              checked={draft.featured}
              onChange={(event) =>
                updateDraft("featured", event.target.checked)
              }
              style={{ width: "auto", marginRight: "8px" }}
            />
            Featured {details.singular}
          </label>

          <div
            className="wl-studio-actions"
            style={{ marginTop: "24px" }}
          >
            <button
              className="wl-button"
              type="button"
              onClick={saveDraft}
            >
              Save Draft
            </button>

            <button
              className="wl-button wl-button-primary"
              type="button"
              onClick={publishContent}
              disabled={isPublishing}
            >
              {isPublishing
                ? "Publishing..."
                : `Publish ${details.singular}`}
            </button>
          </div>

          <p className="muted" style={{ marginTop: "20px" }}>
            {details.previewAction}
          </p>
        </section>
      </div>
    </main>
  );
}