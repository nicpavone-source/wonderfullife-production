import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

/* =========================================================
   TYPES
   ========================================================= */

type WellnessArticle = {
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

type WellnessVideo = {
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

type MixedItem =
  | {
      kind: "article";
      item: WellnessArticle;
    }
  | {
      kind: "video";
      item: WellnessVideo;
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
  article: WellnessArticle;
}) {
  if (!article.image_url) {
    return (
      <div className="media-placeholder">
        <span>WonderfulLife</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={article.image_url}
      alt={article.title}
      className="media-image"
    />
  );
}

/* =========================================================
   VIDEO IMAGE
   ========================================================= */

function VideoImage({
  video,
}: {
  video: WellnessVideo;
}) {
  if (!video.image_url) {
    return (
      <div className="media-placeholder video-placeholder">
        <span>WonderfulLife Video</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={video.image_url}
      alt={video.title}
      className="media-image"
    />
  );
}

/* =========================================================
   ARTICLE CARD
   ========================================================= */

function ArticleCard({
  article,
}: {
  article: WellnessArticle;
}) {
  return (
    <Link
      href={`/articles/${article.slug}`}
      className="media-card"
    >
      <div className="media-image-wrap">
        <ArticleImage article={article} />

        <span className="format-badge">
          ARTICLE
        </span>

        {article.topic ? (
          <span className="topic-badge">
            {pretty(article.topic)}
          </span>
        ) : null}
      </div>

      <div className="media-body">
        <h3>{article.title}</h3>

        {article.excerpt ? (
          <p className="media-excerpt">
            {article.excerpt}
          </p>
        ) : null}

        <div className="media-meta">
          {article.reading_minutes ? (
            <span>
              {article.reading_minutes} min read
            </span>
          ) : (
            <span>Article</span>
          )}
        </div>

        <div className="media-link">
          Read →
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
  video: WellnessVideo;
}) {
  return (
    <Link
      href={`/videos/${video.slug}`}
      className="media-card video-card"
    >
      <div className="media-image-wrap">
        <VideoImage video={video} />

        <span className="format-badge video-format">
          VIDEO
        </span>

        <span
          className="play-button"
          aria-hidden="true"
        >
          ▶
        </span>

        {video.topic ? (
          <span className="topic-badge">
            {pretty(video.topic)}
          </span>
        ) : null}
      </div>

      <div className="media-body">
        <h3>{video.title}</h3>

        {video.excerpt ? (
          <p className="media-excerpt">
            {video.excerpt}
          </p>
        ) : null}

        <div className="media-meta">
          <span>WonderfulLife Video</span>
        </div>

        <div className="media-link">
          Watch →
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
  content: MixedItem;
}) {
  if (content.kind === "video") {
    return <VideoCard video={content.item} />;
  }

  return <ArticleCard article={content.item} />;
}

/* =========================================================
   PAGE
   ========================================================= */

export default async function WellnessPage() {
  const supabase = await createClient();

  /* =======================================================
     WELLNESS ARTICLES
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
  "primary_section.eq.Wellness,category.eq.Wellness"
)
    .order("published_at", {
      ascending: false,
    })
    .limit(30);

  const articles =
    (articleData || []) as WellnessArticle[];

  /* =======================================================
     WELLNESS VIDEOS
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
      "primary_section.eq.Wellness,category.eq.Wellness"
    )
    .order("published_at", {
      ascending: false,
    })
    .limit(30);

  const videos =
    (videoData || []) as WellnessVideo[];

  const error =
    articleError || videoError;

  /* =======================================================
     LATEST IN WELLNESS

     Articles and videos are merged into one collection,
     sorted by publication date, newest first.

     The homepage shows 1 featured item, 1 recent item, and 4 rotating items.
     ======================================================= */

  const allMixedItems: MixedItem[] = [
    ...articles.map(
      (article): MixedItem => ({
        kind: "article",
        item: article,
      })
    ),

    ...videos.map(
      (video): MixedItem => ({
        kind: "video",
        item: video,
      })
    ),
  ];

 const sortedWellness = [...allMixedItems].sort(
  (a, b) =>
    publishedTime(b.item.published_at) -
    publishedTime(a.item.published_at)
);

// 1 featured item
const featuredItem = sortedWellness.find(
  (entry) => entry.item.featured === true
);

// 1 newest item that is different from the featured item
const recentItem = sortedWellness.find(
  (entry) =>
    entry.item.id !== featuredItem?.item.id
);

// Everything else is eligible to rotate
const rotatingPool = sortedWellness.filter(
  (entry) =>
    entry.item.id !== recentItem?.item.id &&
    entry.item.id !== featuredItem?.item.id
);

// Shuffle the remaining content
const shuffledRotating = [...rotatingPool].sort(
  () => Math.random() - 0.5
);

// Final Wellness selection:
// 1 recent + 1 featured + 4 rotating
const latestWellness = [
  ...(recentItem ? [recentItem] : []),
  ...(featuredItem ? [featuredItem] : []),
  ...shuffledRotating.slice(0, 4),
];

  /* =======================================================
     BROWSE WELLNESS

     Topics are drawn primarily from your Wellness articles.
     Tags provide fallback choices for older content.
     ======================================================= */

  const realTopics = Array.from(
    new Set(
      articles
        .map((article) => article.topic)
        .filter(
          (topic): topic is string =>
            Boolean(topic)
        )
    )
  );

  const tagCounts =
    new Map<string, number>();

  articles.forEach((article) => {
    (article.tags || []).forEach((tag) => {
      if (!tag) return;

      tagCounts.set(
        tag,
        (tagCounts.get(tag) || 0) + 1
      );
    });
  });

  const popularTags =
    Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);

  const browseTopics =
    Array.from(
      new Set([
        ...realTopics,
        ...popularTags,
      ])
    ).slice(0, 8);

  const hasContent =
    latestWellness.length > 0;

  return (
    <main className="wellness-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        .wellness-page {
          min-height: 100vh;
          background: #ffffff;
          color: #173d29;
        }

        /* ==========================================
           WELLNESS HERO V4.0 — LOCKED
           ========================================== */

        .wellness-hero {
          position: relative;
          width: 100%;
          height: clamp(400px, 30vw, 400px);
          overflow: hidden;
          background: #f7faf8;
        }

        .wellness-hero-image {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
        }

        /* ==========================================
           LATEST WELLNESS
           ========================================== */

        .latest-zone {
          border-top: 1px solid #edf1ed;
          background: #ffffff;
          padding-bottom: 4px;
        }

        .content-shell {
          width: min(100% - 48px, 1320px);
          margin: 0 auto;
          padding-top: 20px;
        }

        .section-header {
          margin-bottom: 14px;
        }

        .eyebrow {
          margin: 0 0 4px;
          color: #287244;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }

        .section-title {
          margin: 0;

          color: #173d29;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size:
            clamp(23px, 2.3vw, 30px);

          line-height: 1.08;
          letter-spacing: -0.02em;
        }

        .section-description {
          margin: 5px 0 0;
          color: #748178;
          font-size: 12px;
          line-height: 1.45;
        }

        /* ==========================================
           6-CARD MEDIA GRID
           ========================================== */

        .media-grid {
          display: grid;

          grid-template-columns:
            repeat(3, minmax(0, 1fr));

          gap: 14px;
        }
.see-all-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 14px;
}

.see-all-link {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 0 18px;
  border: 1px solid #d4dfd2;
  border-radius: 999px;
  background: #ffffff;
  color: #23633d;
  font-size: 11px;
  font-weight: 900;
  text-decoration: none;
}

.see-all-link:hover {
  transform: translateY(-1px);
  border-color: #aac4ae;
}
        .media-card {
          display: flex;
          min-width: 0;
          overflow: hidden;
          flex-direction: column;

          border: 1px solid #dde6dd;
          border-radius: 14px;

          background: #ffffff;
          color: inherit;
          text-decoration: none;

          box-shadow:
            0 4px 14px
            rgba(27, 67, 41, 0.04);

          transition:
            transform 0.16s ease,
            box-shadow 0.16s ease,
            border-color 0.16s ease;
        }

        .media-card:hover {
          transform: translateY(-2px);

          border-color: #c8d8ca;

          box-shadow:
            0 9px 20px
            rgba(27, 67, 41, 0.075);
        }

        /* ==========================================
           MEDIA IMAGE
           ========================================== */

        .media-image-wrap {
          position: relative;
          overflow: hidden;

          aspect-ratio: 16 / 8.3;

          background: #edf3ec;
        }

        .media-image {
          display: block;
          width: 100%;
          height: 100%;

          object-fit: cover;

          transition:
            transform 0.25s ease;
        }

        .media-card:hover
        .media-image {
          transform: scale(1.025);
        }

        .media-placeholder {
          display: grid;
          width: 100%;
          height: 100%;

          place-items: center;

          background:
            linear-gradient(
              135deg,
              #e9f2e7,
              #fafcf9
            );
        }

        .video-placeholder {
          background:
            linear-gradient(
              135deg,
              #dcebe2,
              #eff7f2
            );
        }

        .media-placeholder span {
          color: #34714a;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 15px;
          font-weight: 700;
        }

        /* ==========================================
           ARTICLE / VIDEO BADGES
           ========================================== */

        .format-badge {
          position: absolute;
          top: 8px;
          left: 8px;

          z-index: 2;

          padding: 4px 7px;

          border-radius: 999px;

          background:
            rgba(255, 255, 255, 0.95);

          color: #23633d;

          font-size: 7px;
          font-weight: 900;
          letter-spacing: 0.08em;
        }

        .video-format {
          color: #ffffff;

          background:
            rgba(23, 61, 41, 0.91);
        }

        /* ==========================================
           TOPIC BADGE
           ========================================== */

        .topic-badge {
          position: absolute;
          bottom: 8px;
          left: 8px;

          z-index: 2;

          padding: 4px 7px;

          border-radius: 999px;

          background:
            rgba(255, 255, 255, 0.94);

          color: #23633d;

          font-size: 7px;
          font-weight: 900;
        }

        /* ==========================================
           VIDEO PLAY BUTTON
           ========================================== */

        .play-button {
          position: absolute;
          top: 50%;
          left: 50%;

          z-index: 2;

          display: grid;

          width: 46px;
          height: 46px;

          place-items: center;

          border:
            1px solid
            rgba(255, 255, 255, 0.65);

          border-radius: 50%;

          background:
            rgba(20, 63, 42, 0.82);

          color: #ffffff;

          font-size: 14px;

          transform:
            translate(-50%, -50%);

          box-shadow:
            0 8px 24px
            rgba(0, 0, 0, 0.18);

          backdrop-filter: blur(6px);
        }

        .video-card:hover
        .play-button {
          background:
            rgba(20, 63, 42, 0.96);
        }

        /* ==========================================
           CARD BODY
           ========================================== */

        .media-body {
          display: flex;
          flex: 1;
          flex-direction: column;

          padding: 12px 13px 13px;
        }

        .media-body h3 {
          margin: 0;

          color: #173d29;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 16px;
          line-height: 1.22;
        }

        .media-excerpt {
          display: -webkit-box;
          overflow: hidden;

          margin: 6px 0 0;

          color: #748178;

          font-size: 11px;
          line-height: 1.4;

          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }

        .media-meta {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;

          margin-top: 7px;

          color: #929c95;

          font-size: 8px;
          font-weight: 700;
        }

        .media-link {
          margin-top: auto;
          padding-top: 9px;

          color: #23633d;

          font-size: 9px;
          font-weight: 900;
        }

        /* ==========================================
           BROWSE WELLNESS
           ========================================== */

        .browse-footer {
          width: min(100% - 48px, 1320px);

          margin: 22px auto 0;

          padding: 15px 18px 17px;

          border: 1px solid #dce5dc;

          border-radius:
            14px 14px 0 0;

          background:
            linear-gradient(
              135deg,
              #f2f8f0,
              #fbfdf9
            );
        }

        .browse-header {
          margin-bottom: 10px;
        }

        .browse-title {
          margin: 0;

          color: #173d29;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size:
            clamp(19px, 1.9vw, 24px);

          line-height: 1.08;
        }

        .topics-grid {
          display: grid;

          grid-template-columns:
            repeat(4, minmax(0, 1fr));

          gap: 7px;
        }

        .topic-card {
          display: flex;

          min-height: 42px;

          align-items: center;
          justify-content: space-between;

          padding: 8px 10px;

          border: 1px solid #dbe6db;
          border-radius: 9px;

          background: #ffffff;

          color: #173d29;

          text-decoration: none;

          transition:
            border-color 0.15s ease,
            transform 0.15s ease;
        }

        .topic-card:hover {
          transform: translateY(-1px);

          border-color: #aec6b2;
        }

        .topic-name {
          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 12px;
          font-weight: 700;
        }

        .topic-arrow {
          color: #2b7748;
          font-size: 10px;
        }

        /* ==========================================
           ERROR / EMPTY
           ========================================== */

        .message {
          width: min(100% - 48px, 1320px);

          margin: 20px auto 0;

          padding: 22px;

          border-radius: 14px;

          background: #f7faf6;

          text-align: center;
        }

        /* ==========================================
           RESPONSIVE
           ========================================== */

        @media (max-width: 1100px) {
          .wellness-hero {
            height: 500px;
          }
        }

        @media (max-width: 950px) {
          .media-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .topics-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 700px) {
          .wellness-hero {
            height: 460px;
          }

          .wellness-hero-image {
            object-position: 54% center;
          }
        }

        @media (max-width: 650px) {
          .content-shell,
          .browse-footer,
          .message {
            width:
              min(100% - 24px, 1320px);
          }

          .media-grid,
          .topics-grid {
            grid-template-columns: 1fr;
          }

          .wellness-hero {
            height: auto;
            overflow-x: hidden;
          }

          .wellness-hero-image {
            width: 100%;
            height: auto;
            object-fit: contain;
          }
        }
      `}</style>

      {/* =====================================================
          WELLNESS HERO V4.0 — UNCHANGED
          ===================================================== */}

      <section className="wellness-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/wellness-homepage-v4.png"
          alt="Zoey welcoming visitors to WonderfulLife Wellness"
          className="wellness-hero-image"
        />
      </section>

      {/* =====================================================
          DATABASE ERROR
          ===================================================== */}

      {error ? (
        <div className="message">
          <strong>
            Wellness content is temporarily unavailable.
          </strong>

          <p>{error.message}</p>
        </div>
      ) : null}

      {/* =====================================================
          EMPTY LIBRARY
          ===================================================== */}

      {!error && !hasContent ? (
        <div className="message">
          <strong>
            Your Wellness library is ready.
          </strong>

          <p>
            Publish Wellness articles and videos in the Studio
            and they will automatically appear here.
          </p>
        </div>
      ) : null}

      {/* =====================================================
          LATEST IN WELLNESS — 6 ROTATING MIXED CARDS
          ===================================================== */}

      {!error && latestWellness.length > 0 ? (
        <section className="latest-zone">
          <div className="content-shell">
            <div className="section-header">
              <p className="eyebrow">
                Fresh From WonderfulLife
              </p>

              <h1 className="section-title">
                Latest in Wellness
              </h1>

              <p className="section-description">
                Our newest articles and videos for healthier,
                happier everyday living.
              </p>
            </div>

            <div className="media-grid">
              {latestWellness.map(
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
          </div>
        </section>
      ) : null}

      {/* =====================================================
          BROWSE WELLNESS
          ===================================================== */}

      {!error &&
      browseTopics.length > 0 ? (
        <section className="browse-footer">
          <div className="browse-header">
            <p className="eyebrow">
              Explore
            </p>

            <h2 className="browse-title">
              Browse Wellness
            </h2>
          </div>

          <div className="topics-grid">
            {browseTopics.map((topic) => (
              <Link
                key={topic}
                href={`/articles?topic=${encodeURIComponent(
                  topic
                )}`}
                className="topic-card"
              >
                <span className="topic-name">
                  {pretty(topic)}
                </span>

                <span className="topic-arrow">
                  →
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}