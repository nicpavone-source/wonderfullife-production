"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type VideoStatus = "draft" | "published";

export type VideoRecord = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string | null;
  category: string | null;
  status: VideoStatus;
  featured: boolean | null;
  image_url: string | null;
  video_url: string | null;
  tags: string[] | null;
  published_at: string | null;
};

type VideoEditorProps = {
  mode: "create" | "edit";
  initialVideo?: VideoRecord | null;
};

type UploadKind = "video" | "thumbnail";

const MEDIA_BUCKET = "wonderfullife-media";
const MAX_VIDEO_SIZE = 500 * 1024 * 1024;
const MAX_IMAGE_SIZE = 12 * 1024 * 1024;

const VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const categories = [
  "Wellness",
  "Nutrition",
  "Recipes",
  "Fitness",
  "Healthy Aging",
  "Beauty",
  "Community",
  "USANA",
  "Meet Zoey",
  "Behind the Scenes",
];

function makeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function safeFileName(value: string) {
  const extension = value.includes(".")
    ? value.slice(value.lastIndexOf(".")).toLowerCase()
    : "";

  const baseName = value
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${Date.now()}-${baseName || "video-file"}${extension}`;
}

function extractStoragePath(publicUrl: string | null | undefined) {
  if (!publicUrl) return null;

  const marker = `/storage/v1/object/public/${MEDIA_BUCKET}/`;
  const markerIndex = publicUrl.indexOf(marker);

  if (markerIndex === -1) return null;

  const rawPath = publicUrl.slice(markerIndex + marker.length).split("?")[0];

  try {
    return decodeURIComponent(rawPath);
  } catch {
    return rawPath;
  }
}

export default function VideoEditor({
  mode,
  initialVideo,
}: VideoEditorProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [title, setTitle] = useState(initialVideo?.title ?? "");
  const [slug, setSlug] = useState(initialVideo?.slug ?? "");
  const [description, setDescription] = useState(initialVideo?.excerpt ?? "");
  const [transcript, setTranscript] = useState(initialVideo?.body ?? "");
  const [category, setCategory] = useState(
    initialVideo?.category ?? "Wellness"
  );
  const [tags, setTags] = useState(initialVideo?.tags?.join(", ") ?? "");
  const [featured, setFeatured] = useState(Boolean(initialVideo?.featured));
  const [status, setStatus] = useState<VideoStatus>(
    initialVideo?.status ?? "draft"
  );
  const [videoUrl, setVideoUrl] = useState(initialVideo?.video_url ?? "");
  const [thumbnailUrl, setThumbnailUrl] = useState(
    initialVideo?.image_url ?? ""
  );

  const [videoUploading, setVideoUploading] = useState(false);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");

  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mode === "edit" && !initialVideo) {
      setMessage("This video could not be loaded.");
    }
  }, [initialVideo, mode]);

  function updateTitle(value: string) {
    setTitle(value);

    if (!slug || slug === makeSlug(title)) {
      setSlug(makeSlug(value));
    }
  }

  async function uploadFile(
    file: File,
    kind: UploadKind
  ): Promise<string | null> {
    const isVideo = kind === "video";
    const allowedTypes = isVideo ? VIDEO_TYPES : IMAGE_TYPES;
    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;

    if (!allowedTypes.includes(file.type)) {
      setMessage(
        isVideo
          ? "Please choose an MP4, MOV, or WebM video."
          : "Please choose a JPG, PNG, or WebP image."
      );
      return null;
    }

    if (file.size > maxSize) {
      setMessage(
        isVideo
          ? "The video is too large. The maximum size is 500 MB."
          : "The thumbnail is too large. The maximum size is 12 MB."
      );
      return null;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setMessage("Your login session could not be confirmed.");
      return null;
    }

    const folder = kind === "video" ? "videos" : "video-thumbnails";
    const path = `${user.id}/${folder}/${safeFileName(file.name)}`;

    const { error: uploadError } = await supabase.storage
      .from(MEDIA_BUCKET)
      .upload(path, file, {
        cacheControl: "31536000",
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      setMessage(`Upload failed: ${uploadError.message}`);
      return null;
    }

    const { data } = supabase.storage
      .from(MEDIA_BUCKET)
      .getPublicUrl(path);

    return data.publicUrl;
  }

  async function handleVideoUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setVideoUploading(true);
    setMessage("");

    const url = await uploadFile(file, "video");

    if (url) {
      setVideoUrl(url);
      setMessage("Video uploaded successfully.");
    }

    setVideoUploading(false);
  }

  async function handleThumbnailUpload(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setThumbnailUploading(true);
    setMessage("");

    const url = await uploadFile(file, "thumbnail");

    if (url) {
      setThumbnailUrl(url);
      setMessage("Thumbnail uploaded successfully.");
    }

    setThumbnailUploading(false);
  }

  async function removeUploadedAsset(url: string, kind: UploadKind) {
    const path = extractStoragePath(url);

    if (path) {
      await supabase.storage.from(MEDIA_BUCKET).remove([path]);
    }

    if (kind === "video") {
      setVideoUrl("");
    } else {
      setThumbnailUrl("");
    }

    setMessage(
      kind === "video"
        ? "Video removed from this entry."
        : "Thumbnail removed from this entry."
    );
  }

  async function saveVideo(nextStatus: VideoStatus) {
    if (!title.trim()) {
      setMessage("Please enter a video title.");
      return;
    }

    if (!videoUrl.trim()) {
      setMessage("Please upload a video or enter an external video URL.");
      return;
    }

    const finalSlug = makeSlug(slug || title);

    if (!finalSlug) {
      setMessage("Please enter a valid title or slug.");
      return;
    }

    setSaving(true);
    setMessage("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setSaving(false);
      setMessage("Your login session could not be confirmed.");
      return;
    }

    const tagList = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const now = new Date().toISOString();

    const record = {
      type: "video",
      title: title.trim(),
      slug: finalSlug,
      excerpt: description.trim() || null,
      summary: description.trim() || null,
      body: transcript.trim() || null,
      category,
      status: nextStatus,
      featured,
      image_url: thumbnailUrl.trim() || null,
      video_url: videoUrl.trim(),
      tags: tagList,
      author: "Zoey",
      updated_at: now,
      published_at:
        nextStatus === "published"
          ? initialVideo?.published_at || now
          : initialVideo?.published_at || null,
    };

    const result =
      mode === "edit" && initialVideo?.id
        ? await supabase
            .from("content_items")
            .update(record)
            .eq("id", initialVideo.id)
            .eq("type", "video")
        : await supabase.from("content_items").insert({
            ...record,
            created_by: user.id,
          });

    setSaving(false);

    if (result.error) {
      setMessage(`The video could not be saved: ${result.error.message}`);
      return;
    }

    setStatus(nextStatus);
    router.push("/studio/videos");
    router.refresh();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await saveVideo(status);
  }

  async function deleteVideo() {
    if (!initialVideo?.id) return;

    const confirmed = window.confirm(
      `Delete "${initialVideo.title}"? This cannot be undone.`
    );

    if (!confirmed) return;

    setDeleting(true);
    setMessage("");

    const { error } = await supabase
      .from("content_items")
      .delete()
      .eq("id", initialVideo.id)
      .eq("type", "video");

    if (error) {
      setDeleting(false);
      setMessage(`The video could not be deleted: ${error.message}`);
      return;
    }

    const paths = [
      extractStoragePath(initialVideo.video_url),
      extractStoragePath(initialVideo.image_url),
    ].filter((path): path is string => Boolean(path));

    if (paths.length) {
      await supabase.storage.from(MEDIA_BUCKET).remove(paths);
    }

    router.push("/studio/videos");
    router.refresh();
  }

  return (
    <main style={pageStyle}>
      <header style={headerStyle}>
        <div>
          <p style={eyebrowStyle}>WonderfulLife Video Studio</p>
          <h1 style={{ margin: "8px 0 0", fontSize: "34px" }}>
            {mode === "edit" ? "Edit Video" : "Upload New Video"}
          </h1>
          <p style={mutedStyle}>
            Upload, organize, edit, save, and publish your existing videos.
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/studio/videos")}
          style={secondaryButtonStyle}
        >
          ← Video Library
        </button>
      </header>

      {message && <div style={noticeStyle}>{message}</div>}

      <form onSubmit={handleSubmit}>
        <div style={editorGridStyle}>
          <section style={mainPanelStyle}>
            <EditorSection title="Video details">
              <Field label="Video title" required>
                <input
                  value={title}
                  onChange={(event) => updateTitle(event.target.value)}
                  placeholder="Nutrition for Healthy Aging"
                  style={inputStyle}
                />
              </Field>

              <div style={twoColumnStyle}>
                <Field label="Slug">
                  <input
                    value={slug}
                    onChange={(event) => setSlug(event.target.value)}
                    placeholder="nutrition-for-healthy-aging"
                    style={inputStyle}
                  />
                </Field>

                <Field label="Category">
                  <select
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    style={inputStyle}
                  >
                    {categories.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Short description">
                <textarea
                  rows={4}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="A short description that appears on the video card."
                  style={textareaStyle}
                />
              </Field>

              <Field label="Tags">
                <input
                  value={tags}
                  onChange={(event) => setTags(event.target.value)}
                  placeholder="healthy aging, nutrition, protein"
                  style={inputStyle}
                />
              </Field>
            </EditorSection>

            <EditorSection title="Video file">
              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/quicktime,video/webm"
                onChange={handleVideoUpload}
                style={{ display: "none" }}
              />

              {!videoUrl ? (
                <button
                  type="button"
                  disabled={videoUploading}
                  onClick={() => videoInputRef.current?.click()}
                  style={uploadAreaStyle}
                >
                  <span style={{ fontSize: "36px" }}>🎬</span>
                  <strong style={{ fontSize: "16px" }}>
                    {videoUploading
                      ? "Uploading video…"
                      : "Click to upload an existing video"}
                  </strong>
                  <span style={{ color: "#6f7e73", fontSize: "12px" }}>
                    MP4, MOV, or WebM — maximum 500 MB
                  </span>
                </button>
              ) : (
                <div style={{ display: "grid", gap: "12px" }}>
                  <video
                    src={videoUrl}
                    controls
                    preload="metadata"
                    style={videoPreviewStyle}
                  />

                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      type="button"
                      onClick={() => videoInputRef.current?.click()}
                      disabled={videoUploading}
                      style={smallButtonStyle}
                    >
                      Replace Video
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        void removeUploadedAsset(videoUrl, "video")
                      }
                      style={dangerButtonStyle}
                    >
                      Remove Video
                    </button>
                  </div>
                </div>
              )}

              <Field label="Or use an external video URL">
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(event) => setVideoUrl(event.target.value)}
                  placeholder="TikTok, YouTube, Vimeo, or hosted video URL"
                  style={inputStyle}
                />
              </Field>
            </EditorSection>

            <EditorSection title="Thumbnail">
              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleThumbnailUpload}
                style={{ display: "none" }}
              />

              {thumbnailUrl ? (
                <div style={{ display: "grid", gap: "12px" }}>
                  <img
                    src={thumbnailUrl}
                    alt="Video thumbnail preview"
                    style={thumbnailPreviewStyle}
                  />

                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      type="button"
                      onClick={() => thumbnailInputRef.current?.click()}
                      disabled={thumbnailUploading}
                      style={smallButtonStyle}
                    >
                      Replace Thumbnail
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        void removeUploadedAsset(thumbnailUrl, "thumbnail")
                      }
                      style={dangerButtonStyle}
                    >
                      Remove Thumbnail
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={thumbnailUploading}
                  onClick={() => thumbnailInputRef.current?.click()}
                  style={uploadAreaStyle}
                >
                  <span style={{ fontSize: "34px" }}>🖼️</span>
                  <strong style={{ fontSize: "16px" }}>
                    {thumbnailUploading
                      ? "Uploading thumbnail…"
                      : "Upload a video thumbnail"}
                  </strong>
                  <span style={{ color: "#6f7e73", fontSize: "12px" }}>
                    JPG, PNG, or WebP — 16:9 recommended
                  </span>
                </button>
              )}
            </EditorSection>

            <EditorSection title="Description or transcript">
              <textarea
                rows={16}
                value={transcript}
                onChange={(event) => setTranscript(event.target.value)}
                placeholder="Add a full transcript, supporting information, key points, or show notes."
                style={textareaStyle}
              />
            </EditorSection>
          </section>

          <aside style={asideStyle}>
            <section style={sidePanelStyle}>
              <h2 style={sideTitleStyle}>Publish</h2>

              <Field label="Status">
                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as VideoStatus)
                  }
                  style={inputStyle}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </Field>

              <label style={checkboxLabelStyle}>
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(event) => setFeatured(event.target.checked)}
                />
                Feature this video
              </label>

              <div style={publishActionsStyle}>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void saveVideo("draft")}
                  style={secondaryWideButtonStyle}
                >
                  {saving
                    ? "Saving…"
                    : mode === "edit"
                      ? "Save Changes"
                      : "Save Draft"}
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void saveVideo("published")}
                  style={primaryButtonStyle}
                >
                  {saving
                    ? "Publishing…"
                    : mode === "edit"
                      ? "Save & Publish"
                      : "Publish Video"}
                </button>
              </div>
            </section>

            <section style={{ ...sidePanelStyle, background: "#eaf2e8" }}>
              <h2 style={sideTitleStyle}>Video checklist</h2>
              <Checklist complete={Boolean(title.trim())} label="Title added" />
              <Checklist
                complete={Boolean(videoUrl.trim())}
                label="Video added"
              />
              <Checklist
                complete={Boolean(thumbnailUrl.trim())}
                label="Thumbnail added"
              />
              <Checklist
                complete={Boolean(description.trim())}
                label="Description added"
              />
              <Checklist complete={Boolean(tags.trim())} label="Tags added" />
            </section>

            {mode === "edit" && (
              <section style={sidePanelStyle}>
                <h2 style={{ ...sideTitleStyle, color: "#a13f3f" }}>
                  Delete video
                </h2>
                <p style={mutedStyle}>
                  This permanently removes the video record and uploaded files.
                </p>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => void deleteVideo()}
                  style={deleteWideButtonStyle}
                >
                  {deleting ? "Deleting…" : "Delete Video"}
                </button>
              </section>
            )}
          </aside>
        </div>
      </form>
    </main>
  );
}

function EditorSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={sectionStyle}>
      <h2 style={sectionTitleStyle}>{title}</h2>
      <div style={{ display: "grid", gap: "15px" }}>{children}</div>
    </section>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "grid", gap: "6px" }}>
      <span style={fieldLabelStyle}>
        {label}
        {required ? " *" : ""}
      </span>
      {children}
    </label>
  );
}

function Checklist({
  complete,
  label,
}: {
  complete: boolean;
  label: string;
}) {
  return (
    <div style={{ ...checklistStyle, color: complete ? "#23633d" : "#6f7e73" }}>
      <span
        style={{
          ...checkCircleStyle,
          border: `1px solid ${complete ? "#23633d" : "#dfe6dd"}`,
          background: complete ? "#23633d" : "#ffffff",
          color: complete ? "#ffffff" : "#6f7e73",
        }}
      >
        {complete ? "✓" : "○"}
      </span>
      {label}
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  padding: "28px 32px 60px",
  background: "#f6f8f5",
  color: "#173d29",
} as const;

const headerStyle = {
  display: "flex",
  gap: "18px",
  alignItems: "flex-end",
  justifyContent: "space-between",
  flexWrap: "wrap",
  marginBottom: "18px",
} as const;

const editorGridStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) 340px",
  gap: "16px",
  alignItems: "start",
} as const;

const mainPanelStyle = {
  overflow: "hidden",
  border: "1px solid #dfe6dd",
  borderRadius: "14px",
  background: "#ffffff",
} as const;

const sectionStyle = {
  padding: "21px",
  borderBottom: "1px solid #dfe6dd",
} as const;

const sectionTitleStyle = {
  margin: "0 0 16px",
  color: "#173d29",
  fontSize: "18px",
} as const;

const asideStyle = {
  position: "sticky",
  top: "18px",
  display: "grid",
  gap: "14px",
} as const;

const sidePanelStyle = {
  padding: "18px",
  border: "1px solid #dfe6dd",
  borderRadius: "14px",
  background: "#ffffff",
} as const;

const sideTitleStyle = {
  margin: "0 0 14px",
  color: "#173d29",
  fontSize: "17px",
} as const;

const eyebrowStyle = {
  margin: 0,
  color: "#23633d",
  fontSize: "11px",
  fontWeight: 900,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
} as const;

const mutedStyle = {
  margin: "7px 0 0",
  color: "#6f7e73",
  fontSize: "12px",
  lineHeight: 1.6,
} as const;

const noticeStyle = {
  marginBottom: "14px",
  padding: "12px 14px",
  border: "1px solid #dfe6dd",
  borderRadius: "10px",
  background: "#eaf2e8",
  color: "#23633d",
  fontSize: "13px",
  fontWeight: 800,
} as const;

const fieldLabelStyle = {
  color: "#173d29",
  fontSize: "12px",
  fontWeight: 850,
} as const;

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 11px",
  border: "1px solid #dfe6dd",
  borderRadius: "8px",
  background: "#ffffff",
  color: "#173d29",
  fontFamily: "inherit",
  fontSize: "13px",
  outline: "none",
} as const;

const textareaStyle = {
  ...inputStyle,
  resize: "vertical",
  lineHeight: 1.65,
} as const;

const twoColumnStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "12px",
} as const;

const uploadAreaStyle = {
  display: "grid",
  width: "100%",
  minHeight: "190px",
  padding: "24px",
  placeItems: "center",
  gap: "8px",
  border: "2px dashed #dfe6dd",
  borderRadius: "12px",
  background: "#fbfcfa",
  color: "#173d29",
  fontFamily: "inherit",
  cursor: "pointer",
} as const;

const videoPreviewStyle = {
  width: "100%",
  maxHeight: "520px",
  borderRadius: "12px",
  background: "#101410",
} as const;

const thumbnailPreviewStyle = {
  width: "100%",
  maxHeight: "430px",
  objectFit: "cover",
  borderRadius: "12px",
} as const;

const checkboxLabelStyle = {
  display: "flex",
  gap: "9px",
  alignItems: "center",
  marginTop: "14px",
  fontSize: "13px",
  fontWeight: 850,
} as const;

const publishActionsStyle = {
  display: "grid",
  gap: "10px",
  marginTop: "20px",
} as const;

const primaryButtonStyle = {
  width: "100%",
  padding: "12px 14px",
  border: "none",
  borderRadius: "8px",
  background: "#23633d",
  color: "#ffffff",
  fontFamily: "inherit",
  fontSize: "13px",
  fontWeight: 900,
  cursor: "pointer",
} as const;

const secondaryButtonStyle = {
  padding: "10px 14px",
  border: "1px solid #dfe6dd",
  borderRadius: "8px",
  background: "#ffffff",
  color: "#23633d",
  fontFamily: "inherit",
  fontSize: "13px",
  fontWeight: 900,
  cursor: "pointer",
} as const;

const secondaryWideButtonStyle = {
  ...secondaryButtonStyle,
  width: "100%",
} as const;

const smallButtonStyle = {
  flex: 1,
  padding: "10px 12px",
  border: "1px solid #dfe6dd",
  borderRadius: "8px",
  background: "#ffffff",
  color: "#23633d",
  fontFamily: "inherit",
  fontSize: "12px",
  fontWeight: 850,
  cursor: "pointer",
} as const;

const dangerButtonStyle = {
  ...smallButtonStyle,
  color: "#a13f3f",
} as const;

const deleteWideButtonStyle = {
  width: "100%",
  padding: "11px 14px",
  border: "1px solid #e1bcbc",
  borderRadius: "8px",
  background: "#fff7f7",
  color: "#a13f3f",
  fontFamily: "inherit",
  fontSize: "13px",
  fontWeight: 900,
  cursor: "pointer",
} as const;

const checklistStyle = {
  display: "flex",
  gap: "9px",
  alignItems: "center",
  marginTop: "10px",
  fontSize: "12px",
  fontWeight: 800,
} as const;

const checkCircleStyle = {
  display: "grid",
  width: "22px",
  height: "22px",
  flex: "0 0 22px",
  placeItems: "center",
  borderRadius: "50%",
} as const;