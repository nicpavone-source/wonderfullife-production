import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "../../../lib/supabase/server";
import { toggleSavedContentAction } from "@/app/actions/saved-content";

type VideoPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type Video = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string | null;
  category: string | null;
  image_url: string | null;
  video_url: string | null;
  external_url: string | null;
  featured: boolean | null;
  status: string | null;
};

function getYouTubeEmbedUrl(url: string | null) {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    let videoId = "";

    if (parsed.hostname.includes("youtu.be")) {
      videoId = parsed.pathname.replace("/", "");
    } else if (parsed.hostname.includes("youtube.com")) {
      if (parsed.pathname.startsWith("/embed/")) {
        videoId = parsed.pathname.split("/embed/")[1] || "";
      } else if (parsed.pathname.startsWith("/shorts/")) {
        videoId = parsed.pathname.split("/shorts/")[1] || "";
      } else {
        videoId = parsed.searchParams.get("v") || "";
      }
    }

    if (!videoId) return null;

    return `https://www.youtube.com/embed/${videoId}`;
  } catch {
    return null;
  }
}

export default async function VideoDetailPage({
  params,
}: VideoPageProps) {
  const { slug } = await params;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("content_items")
    .select(
      `
        id,
        title,
        slug,
        excerpt,
        body,
        category,
        image_url,
        video_url,
        external_url,
        featured,
        status
      `
    )
    .eq("type", "video")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !data) {
    notFound();
  }

  const video = data as Video;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isSaved = false;

  if (user) {
    const { data: savedRow } = await supabase
      .from("saved_content")
      .select("id")
      .eq("user_id", user.id)
      .eq("content_id", video.id)
      .maybeSingle();

    isSaved = Boolean(savedRow);
  }

  const youtubeEmbedUrl = getYouTubeEmbedUrl(video.video_url);
  const category = (video.category || "").toLowerCase();

  /*
   * Return destination
   *
   * Wellness video   -> Wellness
   * Nutrition video  -> Nutrition
   * Other video      -> Videos
   */
  const backHref = category.includes("wellness")
    ? "/wellness"
    : category.includes("nutrition")
      ? "/nutrition"
      : "/videos";

  const backLabel = category.includes("wellness")
    ? "Back to Wellness"
    : category.includes("nutrition")
      ? "Back to Nutrition"
      : "Back to Videos";

  let actionLabel = "";
  const actionLink = video.external_url;

  if (category.includes("recipe")) {
    actionLabel = "🍽 View Full Recipe";
  } else if (category.includes("product")) {
    actionLabel = "🛒 View Product";
  } else if (category.includes("article")) {
    actionLabel = "📖 Read Related Article";
  }

  return (
    <main className="video-detail-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .video-detail-page {
          min-height: 100vh;
          background: #f7f9f6;
          color: #173d29;
        }

        .video-detail-shell {
          width: min(100% - 48px, 1280px);
          margin: 0 auto;
          padding: 30px 0 56px;
        }

        .video-back-link {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 20px;
          color: #23633d;
          font-size: 13px;
          font-weight: 900;
          text-decoration: none;
        }

        .video-detail-grid {
          display: grid;
          grid-template-columns:
            minmax(320px, 470px)
            minmax(0, 1fr);
          gap: 26px;
          align-items: start;
        }

        /* ==========================================
           VIDEO PLAYER
           ========================================== */

        .video-player-card {
          display: flex;
          justify-content: center;
          overflow: hidden;
          border: 1px solid #dfe6dd;
          border-radius: 20px;
          background: #101713;
          box-shadow: 0 14px 34px rgba(23, 61, 41, 0.1);
        }

        .video-player-frame {
          position: relative;
          width: min(100%, 430px);
          aspect-ratio: 9 / 16;
          margin: 0 auto;
          overflow: hidden;
          background: #000000;
        }

        .video-player-frame iframe,
        .video-player-frame img,
        .video-player-frame video {
          display: block;
          width: 100%;
          height: 100%;
          border: 0;
          object-fit: contain;
          background: #000000;
        }

        .video-fallback {
          position: relative;
          display: grid;
          width: min(100%, 430px);
          aspect-ratio: 9 / 16;
          margin: 0 auto;
          place-items: center;
          overflow: hidden;
          background: linear-gradient(135deg, #dcebe2, #eef4ef);
        }

        .video-fallback img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .video-fallback-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(13, 35, 24, 0.56),
            rgba(13, 35, 24, 0.08)
          );
        }

        .video-fallback-play {
          position: relative;
          z-index: 1;
          display: grid;
          width: 68px;
          height: 68px;
          place-items: center;
          border: 3px solid rgba(255, 255, 255, 0.95);
          border-radius: 50%;
          background: rgba(35, 99, 61, 0.92);
          color: #ffffff;
          font-size: 26px;
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.25);
        }

        /* ==========================================
           RIGHT COLUMN
           ========================================== */

        .video-sidebar {
          display: flex;
          flex-direction: column;
          gap: 16px;
          min-width: 0;
        }

        .video-info-card,
        .video-description-card {
          border: 1px solid #dfe6dd;
          border-radius: 18px;
          background: #ffffff;
          box-shadow: 0 10px 26px rgba(23, 61, 41, 0.055);
        }

        .video-info-card {
          padding: 22px 24px;
        }

        .video-category {
          margin: 0;
          color: #23633d;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .video-title {
          margin: 8px 0 0;
          color: #173d29;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(26px, 3vw, 40px);
          line-height: 1.08;
          letter-spacing: -0.025em;
        }

        .video-featured {
          display: inline-flex;
          margin-top: 12px;
          padding: 5px 9px;
          border-radius: 999px;
          background: #eaf2e8;
          color: #23633d;
          font-size: 9px;
          font-weight: 900;
        }

        .video-excerpt {
          margin: 14px 0 0;
          color: #5f7065;
          font-size: 14px;
          line-height: 1.6;
        }

        .video-actions {
          display: grid;
          gap: 8px;
          margin-top: 18px;
        }

        .video-primary-action,
        .video-secondary-action,
        .video-save-action {
          display: inline-flex;
          width: 100%;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 11px 15px;
          border-radius: 9px;
          font-size: 12px;
          font-weight: 900;
          text-decoration: none;
        }

        .video-primary-action {
          background: #2563eb;
          color: #ffffff;
          box-shadow: 0 8px 18px rgba(37, 99, 235, 0.18);
        }

        .video-secondary-action {
          border: 1px solid #dfe6dd;
          background: #ffffff;
          color: #23633d;
        }

        .video-save-form {
          width: 100%;
        }

        .video-save-action {
          width: 100%;
          border: 1px solid #cddccc;
          background: #eef5ec;
          color: #23633d;
          cursor: pointer;
          font-family: inherit;
        }

        .video-save-action:hover {
          background: #e5f0e2;
        }

        .video-save-action.is-saved {
          border-color: #23633d;
          background: #23633d;
          color: #ffffff;
        }

        .video-save-note {
          display: block;
          margin-top: 2px;
          color: #66766b;
          font-size: 11px;
          font-weight: 700;
          text-align: center;
        }

        /* ==========================================
           ABOUT THIS VIDEO
           ========================================== */

        .video-description-card {
          padding: 22px 24px;
        }

        .video-description-eyebrow {
          margin: 0 0 5px;
          color: #287244;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .video-description-title {
          margin: 0;
          color: #173d29;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 24px;
          line-height: 1.1;
        }

        .video-description {
          margin: 12px 0 0;
          color: #58685d;
          font-size: 13px;
          line-height: 1.65;
          white-space: pre-wrap;
        }

        /* ==========================================
           RESPONSIVE
           ========================================== */

        @media (max-width: 950px) {
          .video-detail-grid {
            grid-template-columns: 1fr;
          }

          .video-player-card {
            width: 100%;
            max-width: 470px;
            margin: 0 auto;
          }

          .video-sidebar {
            width: 100%;
          }
        }

        @media (max-width: 650px) {
          .video-detail-shell {
            width: min(100% - 24px, 1280px);
            padding-top: 22px;
          }

          .video-info-card,
          .video-description-card {
            padding: 18px;
          }

          .video-title {
            font-size: 30px;
          }

          .video-description-title {
            font-size: 22px;
          }

          .video-excerpt {
            font-size: 13px;
          }
        }
      `}</style>

      <div className="video-detail-shell">
        <Link href={backHref} className="video-back-link">
          <span aria-hidden="true">←</span>
          {backLabel}
        </Link>

        <div className="video-detail-grid">
          {/* VIDEO PLAYER */}

          <section className="video-player-card">
            {youtubeEmbedUrl ? (
              <div className="video-player-frame">
                <iframe
                  src={youtubeEmbedUrl}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            ) : video.video_url ? (
              <div className="video-player-frame">
                <video
                  controls
                  loop
                  playsInline
                  preload="metadata"
                  poster={video.image_url || undefined}
                >
                  <source src={video.video_url} />
                  Your browser does not support embedded video playback.
                </video>
              </div>
            ) : (
              <div className="video-fallback">
                {video.image_url ? (
                  <img
                    src={video.image_url}
                    alt={video.title}
                  />
                ) : null}

                <div className="video-fallback-overlay" />
                <div className="video-fallback-play">▶</div>
              </div>
            )}
          </section>

          {/* RIGHT COLUMN */}

          <div className="video-sidebar">
            {/* TITLE CARD */}

            <aside className="video-info-card">
              <p className="video-category">
                {video.category || "WonderfulLife Video"}
              </p>

              <h1 className="video-title">
                {video.title}
              </h1>

              {video.featured ? (
                <span className="video-featured">
                  Featured Video
                </span>
              ) : null}

              {video.excerpt ? (
                <p className="video-excerpt">
                  {video.excerpt}
                </p>
              ) : null}

              <div className="video-actions">
                {actionLink && actionLabel ? (
                  <Link
                    href={actionLink}
                    className="video-primary-action"
                  >
                    {actionLabel}
                  </Link>
                ) : null}

                <form
                  action={toggleSavedContentAction}
                  className="video-save-form"
                >
                  <input
                    type="hidden"
                    name="content_id"
                    value={video.id}
                  />

                  <input
                    type="hidden"
                    name="return_path"
                    value={`/videos/${video.slug}`}
                  />

                  <button
                    type="submit"
                    className={`video-save-action${
                      isSaved ? " is-saved" : ""
                    }`}
                  >
                    <span aria-hidden="true">
                      {isSaved ? "✓" : "♡"}
                    </span>

                    {isSaved ? "Saved" : "Save Video"}
                  </button>
                </form>

                {!user ? (
                  <span className="video-save-note">
                    Sign in to save this video.
                  </span>
                ) : isSaved ? (
                  <span className="video-save-note">
                    Saved to your Member Library.
                  </span>
                ) : null}

                <Link
                  href="/ask-zoey"
                  className="video-secondary-action"
                >
                  {category.includes("recipe")
                    ? "Ask Zoey About This Recipe"
                    : category.includes("product")
                      ? "Ask Zoey About This Product"
                      : category.includes("article")
                        ? "Ask Zoey About This Article"
                        : "Ask Zoey About This Video"}
                </Link>
              </div>
            </aside>

            {/* ABOUT THIS VIDEO */}

            <section className="video-description-card">
              <p className="video-description-eyebrow">
                More About This Video
              </p>

              <h2 className="video-description-title">
                About This Video
              </h2>

              <p className="video-description">
                {video.body ||
                  video.excerpt ||
                  "More information about this WonderfulLife video is coming soon."}
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}