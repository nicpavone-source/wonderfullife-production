import Image from "next/image";
import Link from "next/link";

import { createClient } from "../../lib/supabase/server";

type Video = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string | null;
  image_url: string | null;
  featured: boolean | null;
  status: string | null;
  created_at: string;
  updated_at: string | null;
};

type VideosPageProps = {
  searchParams: Promise<{
    category?: string;
  }>;
};

export const metadata = {
  title: "Videos | WonderfulLife.ca",
  description:
    "Watch WonderfulLife wellness, nutrition, fitness, community, product, and healthy-living videos.",
};

const videoCategories = [
  "Wellness",
  "Nutrition",
  "Fitness",
  "Healthy Aging",
  "Beauty",
  "Community",
  "USANA",
  "Meet Zoey",
  "Behind the Scenes",
] as const;

function normalizeCategory(value?: string | null) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

export default async function VideosPage({
  searchParams,
}: VideosPageProps) {
  const params = await searchParams;

  const selectedCategory =
    params.category?.trim() || "";

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("content_items")
    .select(
      `
        id,
        title,
        slug,
        excerpt,
        category,
        image_url,
        featured,
        status,
        created_at,
        updated_at
      `
    )
    .eq("type", "video")
    .eq("status", "published")
    .or("category.is.null,category.neq.Recipes")
    .order("featured", {
      ascending: false,
    })
    .order("updated_at", {
      ascending: false,
    });

  const videos =
    (data || []) as Video[];

  const filteredVideos =
    selectedCategory
      ? videos.filter(
          (video) =>
            normalizeCategory(
              video.category
            ) ===
            normalizeCategory(
              selectedCategory
            )
        )
      : videos;

  return (
    <main className="videos-page">
      <style>{`
        .videos-page {
          min-height: 100vh;
          background: #f7f9f6;
          color: #173d29;
        }

        .videos-hero {
          position: relative;
          width: 100%;
          aspect-ratio: 3.15 / 1;
          overflow: hidden;
          background: #eef4f7;
        }

        .videos-library {
          padding: 12px 28px 76px;
          background: #f7f9f6;
        }

        .videos-container {
          width: 100%;
          max-width: 1480px;
          margin: 0 auto;
        }

        .videos-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 16px;
        }

        .videos-heading-group {
          min-width: 0;
        }

        .videos-eyebrow {
          margin: 0 0 4px;
          color: #23633d;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .videos-title {
          margin: 0;
          color: #173d29;
          font-family:
            Georgia,
            "Times New Roman",
            serif;
          font-size:
            clamp(34px, 3.5vw, 46px);
          line-height: 1;
          letter-spacing: -0.035em;
        }

        .videos-ask-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          flex-shrink: 0;
          padding: 10px 18px;
          border: 1px solid #dfe6dd;
          border-radius: 999px;
          background: #ffffff;
          color: #23633d;
          font-size: 13px;
          font-weight: 900;
          text-decoration: none;
          box-shadow:
            0 8px 22px
            rgba(23, 61, 41, 0.07);
        }

        /* =====================================
           CATEGORY FILTER
           ===================================== */

        .videos-filter-wrap {
          margin-bottom: 22px;
        }

        .videos-filter-label {
          margin: 0 0 9px;
          color: #6d7a71;
          font-size: 11px;
          font-weight: 800;
        }

        .videos-filter {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .videos-filter-link {
          display: inline-flex;
          min-height: 36px;
          align-items: center;
          justify-content: center;
          padding: 0 13px;
          border: 1px solid #dbe4da;
          border-radius: 999px;
          background: #ffffff;
          color: #315b42;
          font-size: 11px;
          font-weight: 850;
          text-decoration: none;
          transition:
            background-color 150ms ease,
            border-color 150ms ease,
            color 150ms ease,
            transform 150ms ease;
        }

        .videos-filter-link:hover {
          transform: translateY(-1px);
          border-color: #a9c2ad;
        }

        .videos-filter-link-active {
          border-color: #23633d;
          background: #23633d;
          color: #ffffff;
        }

        .videos-filter-summary {
          margin: 10px 0 0;
          color: #758178;
          font-size: 11px;
        }

        /* =====================================
           VIDEO GRID
           ===================================== */

        .videos-grid {
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
          gap: 22px;
          align-items: stretch;
        }

        .video-card {
          display: flex;
          min-width: 0;
          overflow: hidden;
          flex-direction: column;
          border: 1px solid #dfe6dd;
          border-radius: 18px;
          background: #ffffff;
          box-shadow:
            0 10px 28px
            rgba(23, 61, 41, 0.07);
          transition:
            transform 180ms ease,
            box-shadow 180ms ease;
        }

        .video-card:hover {
          transform: translateY(-4px);
          box-shadow:
            0 18px 38px
            rgba(23, 61, 41, 0.12);
        }

        .video-image-link {
          position: relative;
          display: block;
          overflow: hidden;
          background: #eaf0ec;
          text-decoration: none;
        }

        .video-image {
          display: block;
          width: 100%;
          aspect-ratio: 16 / 9;
          object-fit: cover;
          transition: transform 180ms ease;
        }

        .video-card:hover
        .video-image {
          transform: scale(1.025);
        }

        .video-placeholder {
          display: grid;
          width: 100%;
          aspect-ratio: 16 / 9;
          place-items: center;
          background:
            linear-gradient(
              135deg,
              #dcebe2,
              #eef4ef
            );
          color: #23633d;
          font-size: 42px;
        }

        .video-play {
          position: absolute;
          top: 50%;
          left: 50%;
          display: grid;
          width: 46px;
          height: 46px;
          place-items: center;
          border:
            2px solid
            rgba(255, 255, 255, 0.95);
          border-radius: 50%;
          background:
            rgba(23, 111, 67, 0.92);
          color: #ffffff;
          font-size: 16px;
          transform:
            translate(-50%, -50%);
          box-shadow:
            0 8px 20px
            rgba(0, 0, 0, 0.2);
        }

        .video-featured {
          position: absolute;
          top: 10px;
          left: 10px;
          padding: 6px 10px;
          border-radius: 999px;
          background: #ffffff;
          color: #23633d;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .video-content {
          display: flex;
          flex: 1;
          flex-direction: column;
          padding: 16px;
        }

        .video-category {
          margin: 0;
          color: #23633d;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .video-title {
          margin: 7px 0 0;
          color: #173d29;
          font-family:
            Georgia,
            "Times New Roman",
            serif;
          font-size: 19px;
          line-height: 1.25;
        }

        .video-excerpt {
          display: -webkit-box;
          overflow: hidden;
          margin: 9px 0 0;
          color: #65746a;
          font-size: 13px;
          line-height: 1.55;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }

        .video-footer {
          margin-top: auto;
          padding-top: 14px;
        }

        .video-watch-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #23633d;
          font-size: 13px;
          font-weight: 900;
          text-decoration: none;
        }

        .videos-message {
          display: grid;
          min-height: 230px;
          place-items: center;
          padding: 34px;
          border: 1px solid #dfe6dd;
          border-radius: 18px;
          background: #ffffff;
          text-align: center;
        }

        .videos-error {
          padding: 20px;
          border: 1px solid #e7c9c9;
          border-radius: 12px;
          background: #fff0f0;
          color: #9f3838;
          font-size: 14px;
          font-weight: 700;
        }

        @media (max-width: 1200px) {
          .videos-hero {
            aspect-ratio: 2.65 / 1;
          }

          .videos-grid {
            grid-template-columns:
              repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 900px) {
          .videos-hero {
            aspect-ratio: 2 / 1;
          }

          .videos-library {
            padding-right: 20px;
            padding-left: 20px;
          }

          .videos-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 620px) {
          .videos-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .videos-ask-link {
            width: 100%;
            box-sizing: border-box;
          }

          .videos-filter {
            gap: 7px;
          }
        }

        @media (max-width: 560px) {
          .videos-hero {
            aspect-ratio: 1.35 / 1;
          }

          .videos-library {
            padding: 10px 16px 56px;
          }

          .videos-grid {
            grid-template-columns: 1fr;
          }

          .videos-title {
            font-size: 34px;
          }

          .videos-filter-link {
  min-height: 34px;
  padding: 0 11px;
  font-size: 10px;
}

/* PASTE HERE */
.videos-filter {
  flex-wrap: nowrap;
  overflow-x: auto;
  gap: 6px;
  padding-bottom: 3px;
  scrollbar-width: none;
}

.videos-filter::-webkit-scrollbar {
  display: none;
}

.videos-filter-link {
  flex: 0 0 auto;
  white-space: nowrap;
}

        }
      `}</style>

      {/* =====================================
          HERO — UNCHANGED
          ===================================== */}

      <section className="videos-hero">
        <Image
          src="/images/wl-videos-hero-zoey-studio.png"
          alt="WonderfulLife Videos — Watch, learn, and live better"
          fill
          priority
          sizes="100vw"
          style={{
            objectFit: "cover",
            objectPosition: "left center",
          }}
        />
      </section>

      {/* =====================================
          VIDEO LIBRARY
          ===================================== */}

      <section
        className="videos-library"
        id="all-videos"
      >
        <div className="videos-container">
          <header className="videos-header">
            <div className="videos-heading-group">
              <p className="videos-eyebrow">
                WonderfulLife Videos
              </p>

              <h1 className="videos-title">
                Explore Videos
              </h1>
            </div>

           
          </header>

          {/* =================================
              CATEGORY FILTER
              ================================= */}

          <div className="videos-filter-wrap">
            <p className="videos-filter-label">
              Browse by category
            </p>

            <nav
              className="videos-filter"
              aria-label="Video categories"
            >
              <Link
                href="/videos"
                className={
                  !selectedCategory
                    ? "videos-filter-link videos-filter-link-active"
                    : "videos-filter-link"
                }
              >
                All Videos
              </Link>

              {videoCategories.map(
                (category) => (
                  <Link
                    key={category}
                    href={`/videos?category=${encodeURIComponent(
                      category
                    )}`}
                    className={
                      normalizeCategory(
                        selectedCategory
                      ) ===
                      normalizeCategory(
                        category
                      )
                        ? "videos-filter-link videos-filter-link-active"
                        : "videos-filter-link"
                    }
                  >
                    {category}
                  </Link>
                )
              )}
            </nav>

            <p className="videos-filter-summary">
              {selectedCategory
                ? `${filteredVideos.length} ${
                    filteredVideos.length ===
                    1
                      ? "video"
                      : "videos"
                  } in ${selectedCategory}`
                : `${filteredVideos.length} videos`}
            </p>
          </div>

          {/* =================================
              ERROR
              ================================= */}

          {error ? (
            <div className="videos-error">
              Videos could not be loaded:{" "}
              {error.message}
            </div>
          ) : filteredVideos.length ===
            0 ? (
            <div className="videos-message">
              <div>
                <div
                  style={{
                    marginBottom: "12px",
                    fontSize: "46px",
                  }}
                >
                  ▶️
                </div>

                <h2
                  style={{
                    margin: 0,
                    color: "#173d29",
                    fontSize: "24px",
                  }}
                >
                  {selectedCategory
                    ? `No ${selectedCategory} videos yet`
                    : "New videos are coming soon"}
                </h2>

                <p
                  style={{
                    maxWidth: "520px",
                    margin: "9px auto 0",
                    color: "#6f7e73",
                    fontSize: "14px",
                    lineHeight: 1.65,
                  }}
                >
                  {selectedCategory
                    ? "Choose another category or return to All Videos."
                    : "Published wellness and healthy-living videos from the WonderfulLife Studio will automatically appear here."}
                </p>

                {selectedCategory ? (
                  <Link
                    href="/videos"
                    style={{
                      display:
                        "inline-flex",
                      marginTop: "14px",
                      color: "#23633d",
                      fontWeight: 900,
                      textDecoration:
                        "none",
                    }}
                  >
                    ← All Videos
                  </Link>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="videos-grid">
              {filteredVideos.map(
                (video) => (
                  <article
                    key={video.id}
                    className="video-card"
                  >
                    <Link
                      href={`/videos/${video.slug}`}
                      aria-label={`Watch ${video.title}`}
                      className="video-image-link"
                    >
                      {video.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={
                            video.image_url
                          }
                          alt={
                            video.title
                          }
                          className="video-image"
                        />
                      ) : (
                        <div className="video-placeholder">
                          ▶
                        </div>
                      )}

                      <span className="video-play">
                        ▶
                      </span>

                      {video.featured ? (
                        <span className="video-featured">
                          Featured
                        </span>
                      ) : null}
                    </Link>

                    <div className="video-content">
                      <p className="video-category">
                        {video.category ||
                          "WonderfulLife Video"}
                      </p>

                      <h2 className="video-title">
                        {video.title}
                      </h2>

                      <p className="video-excerpt">
                        {video.excerpt ||
                          "Watch this WonderfulLife wellness video."}
                      </p>

                      <div className="video-footer">
                        <Link
                          href={`/videos/${video.slug}`}
                          className="video-watch-link"
                        >
                          Watch Video{" "}
                          <span
                            aria-hidden="true"
                          >
                            →
                          </span>
                        </Link>
                      </div>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}