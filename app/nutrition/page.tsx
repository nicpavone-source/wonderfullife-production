import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Nutrition | WonderfulLife",
  description:
    "Explore practical nutrition guidance, healthy eating, food science, healthy aging, energy, hydration and everyday strategies for better health.",
};

/* =========================================================
   TYPES
   ========================================================= */

type NutritionArticle = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  image_url: string | null;
  category: string | null;
  primary_section: string | null;
  topic: string | null;
  tags: string[] | null;
  reading_minutes: number | null;
  published_at: string | null;
  featured: boolean | null;
};

type NutritionVideo = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  image_url: string | null;
  video_url: string | null;
  category: string | null;
  primary_section: string | null;
  topic: string | null;
  tags: string[] | null;
  published_at: string | null;
  featured: boolean | null;
};

type NutritionMixedItem =
  | {
      kind: "article";
      item: NutritionArticle;
    }
  | {
      kind: "video";
      item: NutritionVideo;
    };

/* =========================================================
   HELPERS
   ========================================================= */

function pretty(value?: string | null) {
  return String(value || "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function publishedTime(value?: string | null) {
  if (!value) return 0;

  const time = new Date(value).getTime();

  return Number.isNaN(time) ? 0 : time;
}

/* =========================================================
   ARTICLE IMAGE
   ========================================================= */

function ArticleImage({
  article,
}: {
  article: NutritionArticle;
}) {
  if (!article.image_url) {
    return (
      <div className="article-placeholder">
        <span>WonderfulLife Nutrition</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={article.image_url}
      alt={article.title}
      className="article-image"
    />
  );
}

/* =========================================================
   VIDEO IMAGE
   ========================================================= */

function VideoImage({
  video,
}: {
  video: NutritionVideo;
}) {
  if (!video.image_url) {
    return (
      <div className="article-placeholder video-placeholder">
        <span>WonderfulLife Video</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={video.image_url}
      alt={video.title}
      className="article-image"
    />
  );
}

/* =========================================================
   ARTICLE CARD
   ========================================================= */

function ArticleCard({
  article,
}: {
  article: NutritionArticle;
}) {
  return (
    <Link
      href={`/articles/${article.slug}`}
      className="article-card"
    >
      <div className="article-image-wrap">
        <ArticleImage article={article} />

        <span className="content-type-badge">
          ARTICLE
        </span>

        {article.topic ? (
          <span className="article-topic">
            {pretty(article.topic)}
          </span>
        ) : null}
      </div>

      <div className="article-body">
        <h3>{article.title}</h3>

        {article.excerpt ? (
          <p className="article-excerpt">
            {article.excerpt}
          </p>
        ) : null}

        <div className="article-footer">
          <span className="article-meta">
            {article.reading_minutes
              ? `${article.reading_minutes} min read`
              : "Nutrition"}
          </span>

          <span className="article-link">
            Read →
          </span>
        </div>
      </div>
    </Link>
  );
}

/* =========================================================
   VIDEO CARD
   ========================================================= */

function VideoCard({
  video,
}: {
  video: NutritionVideo;
}) {
  return (
    <Link
      href={`/videos/${video.slug}`}
      className="article-card video-card"
    >
      <div className="article-image-wrap">
        <VideoImage video={video} />

        <span className="content-type-badge video-type-badge">
          VIDEO
        </span>

        <span
          className="video-play-button"
          aria-hidden="true"
        >
          ▶
        </span>

        {video.topic ? (
          <span className="article-topic">
            {pretty(video.topic)}
          </span>
        ) : null}
      </div>

      <div className="article-body">
        <h3>{video.title}</h3>

        {video.excerpt ? (
          <p className="article-excerpt">
            {video.excerpt}
          </p>
        ) : null}

        <div className="article-footer">
          <span className="article-meta">
            WonderfulLife Video
          </span>

          <span className="article-link">
            Watch →
          </span>
        </div>
      </div>
    </Link>
  );
}

/* =========================================================
   MIXED CARD
   ========================================================= */

function MixedCard({
  content,
}: {
  content: NutritionMixedItem;
}) {
  if (content.kind === "video") {
    return <VideoCard video={content.item} />;
  }

  return <ArticleCard article={content.item} />;
}

/* =========================================================
   PAGE
   ========================================================= */

export default async function NutritionPage() {
  const supabase = await createClient();

  /* =======================================================
     NUTRITION ARTICLES
     ======================================================= */

  const {
    data: articleData,
    error: articleError,
  } = await supabase
    .from("content_items")
    .select(
      `
        id,
        title,
        slug,
        excerpt,
        image_url,
        category,
        primary_section,
        topic,
        tags,
        reading_minutes,
        published_at,
        featured
      `
    )
    .eq("type", "article")
    .eq("status", "published")
    .or(
      "primary_section.eq.Nutrition,category.eq.Nutrition"
    )
    .order("published_at", {
      ascending: false,
    })
    .limit(20);

  const articles =
    (articleData || []) as NutritionArticle[];

  /* =======================================================
     NUTRITION VIDEOS
     ======================================================= */

  const {
    data: videoData,
    error: videoError,
  } = await supabase
    .from("content_items")
    .select(
      `
        id,
        title,
        slug,
        excerpt,
        image_url,
        video_url,
        category,
        primary_section,
        topic,
        tags,
        published_at,
        featured
      `
    )
    .eq("type", "video")
    .eq("status", "published")
    .or(
      "primary_section.eq.Nutrition,category.eq.Nutrition"
    )
    .order("published_at", {
      ascending: false,
    })
    .limit(20);

  const videos =
    (videoData || []) as NutritionVideo[];

  const error =
    articleError || videoError;

  /* =======================================================
     LATEST NUTRITION — ROTATING SIX-CARD BLEND

     1 featured + 1 recent + 4 rotating items.
     Articles and videos share the same eligible pool.
     ======================================================= */

  const allNutritionItems: NutritionMixedItem[] = [
    ...articles.map(
      (article): NutritionMixedItem => ({
        kind: "article",
        item: article,
      })
    ),

    ...videos.map(
      (video): NutritionMixedItem => ({
        kind: "video",
        item: video,
      })
    ),
  ];

  const sortedNutrition = [...allNutritionItems].sort(
    (a, b) =>
      publishedTime(b.item.published_at) -
      publishedTime(a.item.published_at)
  );

  // 1 featured item
  const featuredItem = sortedNutrition.find(
    (entry) => entry.item.featured === true
  );

  // 1 newest item that is different from the featured item
  const recentItem = sortedNutrition.find(
    (entry) =>
      entry.item.id !== featuredItem?.item.id
  );

  // Everything else is eligible to rotate
  const rotatingPool = sortedNutrition.filter(
    (entry) =>
      entry.item.id !== recentItem?.item.id &&
      entry.item.id !== featuredItem?.item.id
  );

  // Shuffle the remaining content
  const shuffledRotating = [...rotatingPool].sort(
    () => Math.random() - 0.5
  );

  // Final Nutrition selection:
  // 1 recent + 1 featured + 4 rotating
  const latestNutrition: NutritionMixedItem[] = [
    ...(recentItem ? [recentItem] : []),
    ...(featuredItem ? [featuredItem] : []),
    ...shuffledRotating.slice(0, 4),
  ];

  const preferredTopics = [
    "Blood Sugar",
    "Gut Health",
    "Energy & Metabolism",
    "Healthy Aging",
    "Hydration",
    "Protein & Muscle",
  ];

  return (
    <main className="nutrition-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        .nutrition-page {
          width: 100%;
          min-height: 100vh;
          overflow: hidden;
          background: #f7f8f4;
          color: #173d29;
        }

        /* =====================================
           HERO
           ===================================== */

        .nutrition-hero {
          position: relative;
          width: min(100% - 36px, 1300px);
           height: clamp(360px, 24vw, 360px);
          margin: 18px auto 0;
          overflow: hidden;
          border-radius: 30px;
          background: #eef3eb;
          box-shadow:
            0 18px 48px rgba(25, 64, 39, 0.07);
        }

        .nutrition-hero-image {
          display: block;
          width: 100%;
          height: auto;
        }

        /* =====================================
           MAIN CONTENT
           ===================================== */

        .nutrition-content {
          width: min(100% - 48px, 1360px);
          margin: 0 auto;
          padding: 42px 0 64px;
        }

        .eyebrow {
          margin: 0 0 7px;
          color: #287244;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.17em;
          text-transform: uppercase;
        }

        .section-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 20px;
        }

        .section-title {
          margin: 0;
          color: #173d29;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size:
            clamp(32px, 3.7vw, 48px);

          line-height: 1.03;
          letter-spacing: -0.03em;
        }

        .section-description {
          margin: 7px 0 0;
          color: #718078;
          font-size: 14px;
          line-height: 1.55;
        }

        .view-all {
          flex: 0 0 auto;
          color: #23633d;
          font-size: 13px;
          font-weight: 900;
          text-decoration: none;
        }

        /* =====================================
           SIX-CARD GRID
           ===================================== */

        .article-grid {
          display: grid;

          grid-template-columns:
            repeat(3, minmax(0, 1fr));

          gap: 18px;
        }

        .see-all-row {
          display: flex;
          justify-content: flex-end;
          margin-top: 16px;
        }

        .see-all-link {
          display: inline-flex;
          min-height: 42px;
          align-items: center;
          padding: 0 20px;
          border: 1px solid #d4dfd2;
          border-radius: 999px;
          background: #ffffff;
          color: #23633d;
          font-size: 12px;
          font-weight: 900;
          text-decoration: none;
          transition:
            transform 0.15s ease,
            border-color 0.15s ease;
        }

        .see-all-link:hover {
          transform: translateY(-1px);
          border-color: #aac4ae;
        }

        .article-card {
          display: flex;
          min-width: 0;
          overflow: hidden;
          flex-direction: column;

          border: 1px solid #dce5da;
          border-radius: 20px;

          background: #ffffff;
          color: inherit;
          text-decoration: none;

          box-shadow:
            0 8px 24px
            rgba(27, 67, 41, 0.045);

          transition:
            transform 0.18s ease,
            box-shadow 0.18s ease;
        }

        .article-card:hover {
          transform: translateY(-3px);

          box-shadow:
            0 15px 36px
            rgba(27, 67, 41, 0.09);
        }

        /* =====================================
           CARD MEDIA
           ===================================== */

        .article-image-wrap {
          position: relative;
          overflow: hidden;
          aspect-ratio: 16 / 9;
          background: #edf3ec;
        }

        .article-image {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;

          transition: transform 0.3s ease;
        }

        .article-card:hover
        .article-image {
          transform: scale(1.025);
        }

        .article-placeholder {
          display: grid;
          width: 100%;
          height: 100%;
          place-items: center;

          background:
            linear-gradient(
              135deg,
              #e8f2e6,
              #fafcf9
            );
        }

        .video-placeholder {
          background:
            linear-gradient(
              135deg,
              #dcece4,
              #f7fbf8
            );
        }

        .article-placeholder span {
          color: #34714a;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 16px;
          font-weight: 700;
        }

        /* =====================================
           ARTICLE / VIDEO BADGES
           ===================================== */

        .content-type-badge {
          position: absolute;
          top: 10px;
          left: 10px;

          z-index: 2;

          padding: 6px 10px;

          border-radius: 999px;

          background:
            rgba(255, 255, 255, 0.96);

          color: #23633d;

          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.08em;
        }

        .video-type-badge {
          color: #ffffff;

          background:
            rgba(23, 61, 41, 0.92);
        }

        .article-topic {
          position: absolute;
          bottom: 10px;
          left: 10px;

          z-index: 2;

          padding: 6px 10px;

          border-radius: 999px;

          background:
            rgba(255, 255, 255, 0.95);

          color: #23633d;

          font-size: 9px;
          font-weight: 900;
        }

        /* =====================================
           VIDEO PLAY BUTTON
           ===================================== */

        .video-play-button {
          position: absolute;
          top: 50%;
          left: 50%;

          z-index: 2;

          display: grid;

          width: 54px;
          height: 54px;

          place-items: center;

          border:
            1px solid
            rgba(255, 255, 255, 0.72);

          border-radius: 50%;

          background:
            rgba(23, 61, 41, 0.84);

          color: #ffffff;

          font-size: 16px;

          transform:
            translate(-50%, -50%);

          box-shadow:
            0 10px 28px
            rgba(0, 0, 0, 0.18);

          backdrop-filter: blur(6px);
        }

        .video-card:hover
        .video-play-button {
          background:
            rgba(23, 61, 41, 0.97);
        }

        /* =====================================
           CARD BODY
           ===================================== */

        .article-body {
          display: flex;
          flex: 1;
          flex-direction: column;
          padding: 18px;
        }

        .article-body h3 {
          margin: 0;
          color: #173d29;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 20px;
          line-height: 1.18;
        }

        .article-excerpt {
          display: -webkit-box;
          overflow: hidden;

          margin: 9px 0 0;

          color: #748178;

          font-size: 12.5px;
          line-height: 1.5;

          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }

        .article-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;

          margin-top: auto;
          padding-top: 16px;
        }

        .article-meta {
          color: #929c95;
          font-size: 10px;
          font-weight: 700;
        }

        .article-link {
          color: #23633d;
          font-size: 11px;
          font-weight: 900;
        }

        /* =====================================
           ERROR / EMPTY
           ===================================== */

        .message {
          padding: 28px;
          border: 1px solid #dce5da;
          border-radius: 18px;
          background: #ffffff;
          text-align: center;
        }

        .message strong {
          display: block;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 23px;
        }

        .message p {
          margin: 8px 0 0;
          color: #6f7c74;
          font-size: 13px;
          line-height: 1.6;
        }

        /* =====================================
           LOWER DISCOVERY AREA
           ===================================== */

        .discovery-section {
          display: grid;

          grid-template-columns:
            minmax(0, 1.25fr)
            minmax(320px, 0.75fr);

          gap: 18px;
          margin-top: 42px;
        }

        .topics-panel,
        .recipes-panel {
          overflow: hidden;

          border: 1px solid #dce5da;
          border-radius: 22px;
        }

        .topics-panel {
          padding: 26px;

          background:
            linear-gradient(
              135deg,
              #edf5ea,
              #fbfdf9
            );
        }

        .small-title {
          margin: 0;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 30px;
          line-height: 1.05;
        }

        .topics-grid {
          display: grid;

          grid-template-columns:
            repeat(3, minmax(0, 1fr));

          gap: 9px;
          margin-top: 18px;
        }

        .topic-card {
          display: flex;

          min-height: 58px;

          align-items: center;
          justify-content: space-between;
          gap: 10px;

          padding: 12px 14px;

          border: 1px solid #d9e4d8;
          border-radius: 12px;

          background:
            rgba(255, 255, 255, 0.92);

          color: #173d29;
          text-decoration: none;

          transition:
            transform 0.15s ease,
            background 0.15s ease;
        }

        .topic-card:hover {
          transform: translateY(-1px);
          background: #ffffff;
        }

        .topic-name {
          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 13px;
          font-weight: 700;
          line-height: 1.25;
        }

        .topic-arrow {
          color: #2b7748;
          font-size: 13px;
        }

        /* =====================================
           RECIPE PANEL
           ===================================== */

        .recipes-panel {
          display: flex;
          flex-direction: column;
          justify-content: center;

          padding: 28px;

          background: #173d29;
          color: #ffffff;
        }

        .recipes-panel .eyebrow {
          color: #a7d49d;
        }

        .recipes-panel h2 {
          margin: 0;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size:
            clamp(28px, 3vw, 40px);

          line-height: 1.05;
        }

        .recipes-panel p {
          margin: 12px 0 20px;

          color:
            rgba(255, 255, 255, 0.74);

          font-size: 13px;
          line-height: 1.6;
        }

        .recipe-button {
          display: inline-flex;

          width: fit-content;
          min-height: 44px;

          align-items: center;
          justify-content: center;

          padding: 0 18px;

          border-radius: 999px;

          background: #ffffff;
          color: #173d29;

          font-size: 12px;
          font-weight: 900;

          text-decoration: none;
        }

        /* =====================================
           RESPONSIVE
           ===================================== */

        @media (max-width: 1000px) {
          .article-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .discovery-section {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 700px) {
          .nutrition-hero {
            width: calc(100% - 20px);
            margin-top: 10px;
            border-radius: 20px;
          }

          .nutrition-content {
            width: min(100% - 24px, 1360px);
            padding: 30px 0 56px;
          }

          .section-header {
            align-items: flex-start;
            flex-direction: column;
            gap: 10px;
          }

          .article-grid {
            grid-template-columns: 1fr;
          }

          .topics-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 460px) {
          .topics-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* =====================================
          NUTRITION HERO — UNCHANGED
          ===================================== */}

      <section
        className="nutrition-hero"
        aria-label="WonderfulLife Nutrition"
      >
        <Image
          src="/images/nutrition-homepage-v2.png"
          alt="Zoey welcoming visitors to WonderfulLife Nutrition."
          width={1536}
          height={1024}
          priority
          sizes="100vw"
          className="nutrition-hero-image"
        />
      </section>

      <section className="nutrition-content">

        {/* =====================================
            LATEST NUTRITION
            ===================================== */}

        <section id="nutrition-latest">
          <div className="section-header">
            <div>
              <p className="eyebrow">
                Fresh From WonderfulLife
              </p>

              <h1 className="section-title">
                Latest Nutrition
              </h1>

              <p className="section-description">
                Articles and videos about food, health and
                nutrition for everyday living.
              </p>
            </div>
          </div>

          {error ? (
            <div className="message">
              <strong>
                Nutrition content is temporarily unavailable.
              </strong>

              <p>{error.message}</p>
            </div>
          ) : null}

          {!error &&
          latestNutrition.length === 0 ? (
            <div className="message">
              <strong>
                Your Nutrition library is ready.
              </strong>

              <p>
                Publish Nutrition articles or videos in the
                Studio and they will automatically appear here.
              </p>
            </div>
          ) : null}

          {!error &&
          latestNutrition.length > 0 ? (
            <>
              <div className="article-grid">
                {latestNutrition.map(
                  (content) => (
                    <MixedCard
                      key={`${content.kind}-${content.item.id}`}
                      content={content}
                    />
                  )
                )}
              </div>

              <div className="see-all-row">
                <Link
                  href="/articles"
                  className="see-all-link"
                >
                  See All Articles →
                </Link>
              </div>
            </>
          ) : null}
        </section>

        {/* =====================================
            EXPLORE BY GOAL — UNCHANGED
            ===================================== */}

        <section className="discovery-section">
          <div className="topics-panel">
            <p className="eyebrow">
              Explore By Goal
            </p>

            <h2 className="small-title">
              Find what matters to you.
            </h2>

            <div className="topics-grid">
              {preferredTopics.map((topic) => (
                <Link
                  key={topic}
                  href={`/articles?topic=${encodeURIComponent(
                    topic
                  )}`}
                  className="topic-card"
                >
                  <span className="topic-name">
                    {topic}
                  </span>

                  <span className="topic-arrow">
                    →
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* =====================================
              RECIPE PANEL — UNCHANGED
              ===================================== */}

          <div className="recipes-panel">
            <p className="eyebrow">
              From Nutrition To Kitchen
            </p>

            <h2>
              Eat well without making it complicated.
            </h2>

            <p>
              Turn nutrition knowledge into simple,
              colourful meals with WonderfulLife recipes
              made for everyday life.
            </p>

            <Link
              href="/recipes"
              className="recipe-button"
            >
              Explore Healthy Recipes →
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}