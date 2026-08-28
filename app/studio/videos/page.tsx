"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type VideoItem = {
  id: number;
  title: string;
  excerpt: string | null;
  category: string | null;
  status: "draft" | "published";
  featured: boolean | null;
  image_url: string | null;
  video_url: string | null;
  updated_at: string | null;
};

const BUCKET = "wonderfullife-media";

function storagePath(url?: string | null) {
  if (!url) return null;

  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const index = url.indexOf(marker);

  if (index < 0) return null;

  const rawPath = url
    .slice(index + marker.length)
    .split("?")[0];

  try {
    return decodeURIComponent(rawPath);
  } catch {
    return rawPath;
  }
}

export default function VideoLibraryPage() {
  const supabase = useMemo(() => createClient(), []);

  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    void loadVideos();
  }, []);

  async function loadVideos() {
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from("content_items")
      .select(
        "id,title,excerpt,category,status,featured,image_url,video_url,updated_at"
      )
      .eq("type", "video")
      .order("updated_at", { ascending: false });

    if (error) {
      setMessage(`Unable to load videos: ${error.message}`);
    } else {
      setVideos((data ?? []) as VideoItem[]);
    }

    setLoading(false);
  }

  async function deleteVideo(video: VideoItem) {
    const confirmed = window.confirm(
      `Delete "${video.title}"? This cannot be undone.`
    );

    if (!confirmed) return;

    setDeleting(video.id);
    setMessage("");

    const { error } = await supabase
      .from("content_items")
      .delete()
      .eq("id", video.id)
      .eq("type", "video");

    if (error) {
      setDeleting(null);
      setMessage(`Could not delete video: ${error.message}`);
      return;
    }

    const paths = [
      storagePath(video.video_url),
      storagePath(video.image_url),
    ].filter((path): path is string => Boolean(path));

    if (paths.length > 0) {
      await supabase.storage
        .from(BUCKET)
        .remove(paths);
    }

    setVideos((current) =>
      current.filter((item) => item.id !== video.id)
    );

    setDeleting(null);
    setMessage("Video deleted.");
  }

  const shownVideos = useMemo(() => {
    const query = search.trim().toLowerCase();

    return videos.filter((video) => {
      const matchesSearch =
        !query ||
        video.title.toLowerCase().includes(query) ||
        video.category?.toLowerCase().includes(query) ||
        video.excerpt?.toLowerCase().includes(query);

      const matchesFilter =
        filter === "all" || video.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [videos, search, filter]);

  const publishedCount = videos.filter(
    (video) => video.status === "published"
  ).length;

  const draftCount = videos.filter(
    (video) => video.status === "draft"
  ).length;

  return (
    <main style={pageStyle}>
      <header style={headerStyle}>
        <div>
          <p style={eyebrowStyle}>
            WonderfulLife Video Studio
          </p>

          <h1
            style={{
              margin: "8px 0 0",
              fontSize: "34px",
            }}
          >
            Video Library
          </h1>

          <p style={mutedStyle}>
            Upload, edit, delete, save, and publish
            WonderfulLife videos.
          </p>
        </div>

        <Link
          href="/studio/videos/new"
          style={newButtonStyle}
        >
          + Upload New Video
        </Link>
      </header>

      {message && (
        <div style={noticeStyle}>
          {message}
        </div>
      )}

      <section style={statsStyle}>
        <Stat
          label="All Videos"
          value={videos.length}
        />

        <Stat
          label="Published"
          value={publishedCount}
        />

        <Stat
          label="Drafts"
          value={draftCount}
        />
      </section>

      <section style={toolsStyle}>
        <input
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search videos"
          style={inputStyle}
        />

        <select
          value={filter}
          onChange={(event) =>
            setFilter(event.target.value)
          }
          style={inputStyle}
        >
          <option value="all">
            All statuses
          </option>

          <option value="published">
            Published
          </option>

          <option value="draft">
            Drafts
          </option>
        </select>
      </section>

      {loading ? (
        <section style={emptyStyle}>
          Loading videos…
        </section>
      ) : shownVideos.length === 0 ? (
        <section style={emptyStyle}>
          <h2 style={{ margin: 0 }}>
            No videos found
          </h2>

          <p style={mutedStyle}>
            Upload your first existing video to begin.
          </p>
        </section>
      ) : (
        <section style={cardsStyle}>
          {shownVideos.map((video) => (
            <article
              key={video.id}
              style={cardStyle}
            >
              <div style={imageBoxStyle}>
                {video.image_url ? (
                  <img
                    src={video.image_url}
                    alt={video.title}
                    style={imageStyle}
                  />
                ) : (
                  <span
                    style={{
                      fontSize: "42px",
                    }}
                  >
                    🎬
                  </span>
                )}

                <span
                  style={{
                    ...badgeStyle,
                    background:
                      video.status === "published"
                        ? "#23633d"
                        : "#6f7e73",
                  }}
                >
                  {video.status}
                </span>

                {video.featured && (
                  <span style={featuredStyle}>
                    Featured
                  </span>
                )}
              </div>

              <div
                style={{
                  padding: "16px",
                }}
              >
                <p style={categoryStyle}>
                  {video.category || "Wellness"}
                </p>

                <h2
                  style={{
                    margin: "7px 0 0",
                    fontSize: "19px",
                    lineHeight: 1.3,
                  }}
                >
                  {video.title}
                </h2>

                <p
                  style={{
                    ...mutedStyle,
                    minHeight: "42px",
                  }}
                >
                  {video.excerpt ||
                    "No description added yet."}
                </p>

                <div style={actionsStyle}>
                  <Link
                    href={`/studio/videos/edit/${video.id}`}
                    style={editButtonStyle}
                  >
                    Edit Video
                  </Link>

                  <button
                    type="button"
                    onClick={() =>
                      void deleteVideo(video)
                    }
                    disabled={deleting === video.id}
                    style={deleteButtonStyle}
                  >
                    {deleting === video.id
                      ? "Deleting…"
                      : "Delete"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div style={statStyle}>
      <strong
        style={{
          display: "block",
          fontSize: "26px",
        }}
      >
        {value}
      </strong>

      <span style={mutedStyle}>
        {label}
      </span>
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

const statsStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(3, minmax(0, 1fr))",
  gap: "12px",
  marginBottom: "16px",
} as const;

const statStyle = {
  padding: "16px",
  border: "1px solid #dfe6dd",
  borderRadius: "14px",
  background: "#ffffff",
} as const;

const toolsStyle = {
  display: "grid",
  gridTemplateColumns:
    "minmax(0, 1fr) 190px",
  gap: "12px",
  padding: "14px",
  marginBottom: "16px",
  border: "1px solid #dfe6dd",
  borderRadius: "14px",
  background: "#ffffff",
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

const cardsStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fill, minmax(280px, 1fr))",
  gap: "16px",
} as const;

const cardStyle = {
  overflow: "hidden",
  border: "1px solid #dfe6dd",
  borderRadius: "14px",
  background: "#ffffff",
} as const;

const imageBoxStyle = {
  position: "relative",
  display: "grid",
  aspectRatio: "16 / 9",
  overflow: "hidden",
  placeItems: "center",
  background: "#e8ede7",
} as const;

const imageStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
} as const;

const badgeStyle = {
  position: "absolute",
  top: "10px",
  left: "10px",
  padding: "5px 8px",
  borderRadius: "999px",
  color: "#ffffff",
  fontSize: "10px",
  fontWeight: 900,
  textTransform: "uppercase",
} as const;

const featuredStyle = {
  position: "absolute",
  top: "10px",
  right: "10px",
  padding: "5px 8px",
  borderRadius: "999px",
  background: "#ffffff",
  color: "#23633d",
  fontSize: "10px",
  fontWeight: 900,
} as const;

const categoryStyle = {
  margin: 0,
  color: "#23633d",
  fontSize: "10px",
  fontWeight: 900,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
} as const;

const actionsStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "8px",
  marginTop: "15px",
} as const;

const editButtonStyle = {
  display: "grid",
  placeItems: "center",
  padding: "10px",
  border: "1px solid #dfe6dd",
  borderRadius: "8px",
  background: "#ffffff",
  color: "#23633d",
  fontSize: "12px",
  fontWeight: 900,
  textDecoration: "none",
} as const;

const deleteButtonStyle = {
  padding: "10px",
  border: "1px solid #e1bcbc",
  borderRadius: "8px",
  background: "#fff7f7",
  color: "#a13f3f",
  fontFamily: "inherit",
  fontSize: "12px",
  fontWeight: 900,
  cursor: "pointer",
} as const;

const newButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "11px 15px",
  borderRadius: "8px",
  background: "#23633d",
  color: "#ffffff",
  fontSize: "13px",
  fontWeight: 900,
  textDecoration: "none",
} as const;

const emptyStyle = {
  display: "grid",
  minHeight: "350px",
  padding: "30px",
  placeItems: "center",
  alignContent: "center",
  border: "1px solid #dfe6dd",
  borderRadius: "14px",
  background: "#ffffff",
  textAlign: "center",
} as const;