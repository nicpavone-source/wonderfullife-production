import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

type ContentType =
  | "article"
  | "recipe"
  | "video"
  | "product";

type ContentItem = {
  id: number;
  type: ContentType;
  title: string;
  slug: string;
  excerpt: string | null;
  image_url: string | null;
  category: string | null;
  primary_section: string | null;
  topic: string | null;
  tags: string[] | null;
  featured: boolean | null;
  published_at: string | null;
};

type RelatedItem = ContentItem & {
  score: number;
  sharedTags: string[];
};

type RelatedContentProps = {
  currentId: number;

  currentPrimarySection?: string | null;
  currentTopic?: string | null;
  currentTags?: string[] | null;

  maxPerType?: number;
  showArticles?: boolean;
  showRecipes?: boolean;
  showVideos?: boolean;
  showProducts?: boolean;
};

type RelatedGroups = {
  articles: RelatedItem[];
  recipes: RelatedItem[];
  videos: RelatedItem[];
  products: RelatedItem[];
};

function normalize(value: string | null | undefined) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeTags(tags?: string[] | null) {
  return Array.from(
    new Set(
      (tags || [])
        .map((tag) => normalize(tag))
        .filter(Boolean)
    )
  );
}

function getPublicHref(item: ContentItem) {
  switch (item.type) {
    case "article":
      return `/articles/${item.slug}`;

    case "recipe":
      return `/recipes/${item.slug}`;

    case "video":
      return `/videos/${item.slug}`;

    case "product":
      return `/shop/${item.slug}`;

    default:
      return "/";
  }
}

function scoreItem({
  item,
  currentPrimarySection,
  currentTopic,
  currentTags,
}: {
  item: ContentItem;
  currentPrimarySection: string;
  currentTopic: string;
  currentTags: string[];
}) {
  let score = 0;

  const itemSection = normalize(item.primary_section);
  const itemTopic = normalize(item.topic);
  const itemTags = normalizeTags(item.tags);

  const sharedTags = itemTags.filter((tag) =>
    currentTags.includes(tag)
  );

  /*
   * SCORING
   *
   * Same topic = strongest signal.
   * Shared tags = highly important.
   * Same section = supporting signal.
   * Featured content gets a small boost.
   */

  if (
    currentTopic &&
    itemTopic &&
    currentTopic === itemTopic
  ) {
    score += 20;
  }

  score += sharedTags.length * 6;

  if (
    currentPrimarySection &&
    itemSection &&
    currentPrimarySection === itemSection
  ) {
    score += 3;
  }

  if (item.featured) {
    score += 1;
  }

  return {
    score,
    sharedTags,
  };
}

function sortRelated(
  items: RelatedItem[]
) {
  return [...items].sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    const dateA = a.published_at
      ? new Date(a.published_at).getTime()
      : 0;

    const dateB = b.published_at
      ? new Date(b.published_at).getTime()
      : 0;

    return dateB - dateA;
  });
}

function sectionTitle(type: ContentType) {
  switch (type) {
    case "article":
      return "Related Articles";

    case "recipe":
      return "Related Recipes";

    case "video":
      return "Related Videos";

    case "product":
      return "Recommended Products";
  }
}

function sectionDescription(type: ContentType) {
  switch (type) {
    case "article":
      return "Continue exploring this topic.";

    case "recipe":
      return "Healthy recipes connected to this subject.";

    case "video":
      return "Watch more from WonderfulLife.";

    case "product":
      return "Products related to this content.";
  }
}

function emptyGroups(): RelatedGroups {
  return {
    articles: [],
    recipes: [],
    videos: [],
    products: [],
  };
}

async function getRelatedContent({
  currentId,
  currentPrimarySection,
  currentTopic,
  currentTags,
  maxPerType,
}: {
  currentId: number;
  currentPrimarySection?: string | null;
  currentTopic?: string | null;
  currentTags?: string[] | null;
  maxPerType: number;
}): Promise<RelatedGroups> {
  const supabase = await createClient();

  const section = normalize(currentPrimarySection);
  const topic = normalize(currentTopic);
  const tags = normalizeTags(currentTags);

  /*
   * For the current size of WonderfulLife this is
   * intentionally simple and reliable:
   *
   * fetch published content, score it in Next.js,
   * then choose the strongest matches per content type.
   *
   * Later we can move the scoring into PostgreSQL
   * when the library becomes much larger.
   */

  const { data, error } = await supabase
    .from("content_items")
    .select(
      `
        id,
        type,
        title,
        slug,
        excerpt,
        image_url,
        category,
        primary_section,
        topic,
        tags,
        featured,
        published_at
      `
    )
    .eq("status", "published")
    .neq("id", currentId)
    .in("type", [
      "article",
      "recipe",
      "video",
      "product",
    ])
    .limit(500);

  if (error || !data) {
    console.error(
      "Automatic Related Content error:",
      error?.message
    );

    return emptyGroups();
  }

  const scored = (data as ContentItem[])
    .map((item) => {
      const relationship = scoreItem({
        item,
        currentPrimarySection: section,
        currentTopic: topic,
        currentTags: tags,
      });

      return {
        ...item,
        ...relationship,
      };
    })

    /*
     * Do not show completely unrelated content.
     */
    .filter((item) => item.score > 0);

  const groups: RelatedGroups = emptyGroups();

  groups.articles = sortRelated(
    scored.filter(
      (item) => item.type === "article"
    )
  ).slice(0, maxPerType);

  groups.recipes = sortRelated(
    scored.filter(
      (item) => item.type === "recipe"
    )
  ).slice(0, maxPerType);

  groups.videos = sortRelated(
    scored.filter(
      (item) => item.type === "video"
    )
  ).slice(0, maxPerType);

  groups.products = sortRelated(
    scored.filter(
      (item) => item.type === "product"
    )
  ).slice(0, maxPerType);

  return groups;
}

function RelatedCard({
  item,
}: {
  item: RelatedItem;
}) {
  return (
    <Link
      href={getPublicHref(item)}
      className="arc-card"
    >
      <div className="arc-image">
        {item.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image_url}
            alt={item.title}
          />
        ) : (
          <div className="arc-placeholder">
            {item.type === "article" && "📖"}
            {item.type === "recipe" && "🍽️"}
            {item.type === "video" && "▶"}
            {item.type === "product" && "🌿"}
          </div>
        )}

        {item.type === "video" ? (
          <span className="arc-play">
            ▶
          </span>
        ) : null}
      </div>

      <div className="arc-card-body">
        <p className="arc-type">
          {item.type}
        </p>

        <h3>
          {item.title}
        </h3>

        {item.excerpt ? (
          <p className="arc-excerpt">
            {item.excerpt}
          </p>
        ) : null}

        {item.sharedTags.length > 0 ? (
          <div className="arc-shared-tags">
            {item.sharedTags
              .slice(0, 3)
              .map((tag) => (
                <span key={tag}>
                  {tag.replace(/-/g, " ")}
                </span>
              ))}
          </div>
        ) : null}

        <div className="arc-footer">
          <span>
            Explore
          </span>

          <span aria-hidden="true">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}

function RelatedSection({
  type,
  items,
}: {
  type: ContentType;
  items: RelatedItem[];
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="arc-section">
      <header className="arc-section-header">
        <div>
          <p className="arc-eyebrow">
            WonderfulLife recommends
          </p>

          <h2>
            {sectionTitle(type)}
          </h2>

          <p>
            {sectionDescription(type)}
          </p>
        </div>
      </header>

      <div className="arc-grid">
        {items.map((item) => (
          <RelatedCard
            key={item.id}
            item={item}
          />
        ))}
      </div>
    </section>
  );
}

export default async function AutomaticRelatedContent({
  currentId,

  currentPrimarySection = "",
  currentTopic = "",
  currentTags = [],

  maxPerType = 3,

  showArticles = true,
  showRecipes = true,
  showVideos = true,
  showProducts = true,
}: RelatedContentProps) {
  const groups = await getRelatedContent({
    currentId,
    currentPrimarySection,
    currentTopic,
    currentTags,
    maxPerType,
  });

  const hasAnything =
    groups.articles.length > 0 ||
    groups.recipes.length > 0 ||
    groups.videos.length > 0 ||
    groups.products.length > 0;

  if (!hasAnything) {
    return null;
  }

  return (
    <div className="arc-root">
      <style>{`
        .arc-root {
          width: 100%;
          max-width: 1200px;
          margin: 64px auto 0;
          color: #173d29;
        }

        .arc-section {
          margin-top: 52px;
        }

        .arc-section:first-child {
          margin-top: 0;
        }

        .arc-section-header {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 20px;
        }

        .arc-eyebrow {
          margin: 0 0 6px;
          color: #287244;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }

        .arc-section-header h2 {
          margin: 0;
          color: #173d29;
          font-family:
            Georgia,
            "Times New Roman",
            serif;
          font-size: clamp(26px, 3vw, 34px);
          line-height: 1.1;
        }

        .arc-section-header > div > p:last-child {
          margin: 8px 0 0;
          color: #748178;
          font-size: 13px;
        }

        .arc-grid {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 18px;
        }

        .arc-card {
          display: flex;
          min-width: 0;
          overflow: hidden;
          flex-direction: column;
          border: 1px solid #dce5dc;
          border-radius: 18px;
          background: #ffffff;
          color: inherit;
          text-decoration: none;
          box-shadow:
            0 8px 22px
            rgba(26, 65, 40, 0.06);
          transition:
            transform 0.18s ease,
            box-shadow 0.18s ease,
            border-color 0.18s ease;
        }

        .arc-card:hover {
          transform: translateY(-4px);
          border-color: #b8cfbc;
          box-shadow:
            0 16px 32px
            rgba(26, 65, 40, 0.1);
        }

        .arc-image {
          position: relative;
          overflow: hidden;
          aspect-ratio: 16 / 10;
          background: #edf3ec;
        }

        .arc-image img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition:
            transform 0.3s ease;
        }

        .arc-card:hover .arc-image img {
          transform: scale(1.035);
        }

        .arc-placeholder {
          display: grid;
          width: 100%;
          height: 100%;
          place-items: center;
          font-size: 44px;
        }

        .arc-play {
          position: absolute;
          top: 50%;
          left: 50%;
          display: grid;
          width: 52px;
          height: 52px;
          place-items: center;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          background:
            rgba(255, 255, 255, 0.92);
          color: #23633d;
          box-shadow:
            0 8px 24px
            rgba(0, 0, 0, 0.14);
        }

        .arc-card-body {
          display: flex;
          flex: 1;
          flex-direction: column;
          padding: 18px;
        }

        .arc-type {
          margin: 0 0 7px;
          color: #2d7548;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.13em;
          text-transform: uppercase;
        }

        .arc-card h3 {
          margin: 0;
          color: #173d29;
          font-size: 18px;
          line-height: 1.3;
        }

        .arc-excerpt {
          display: -webkit-box;
          overflow: hidden;
          margin: 10px 0 0;
          color: #748178;
          font-size: 12px;
          line-height: 1.55;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 3;
        }

        .arc-shared-tags {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-top: 14px;
        }

        .arc-shared-tags span {
          padding: 5px 8px;
          border-radius: 999px;
          background: #edf6ed;
          color: #34714a;
          font-size: 9px;
          font-weight: 800;
          text-transform: capitalize;
        }

        .arc-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: auto;
          padding-top: 17px;
          color: #23633d;
          font-size: 11px;
          font-weight: 900;
        }

        @media (max-width: 900px) {
          .arc-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 620px) {
          .arc-root {
            margin-top: 44px;
          }

          .arc-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {showArticles ? (
        <RelatedSection
          type="article"
          items={groups.articles}
        />
      ) : null}

      {showRecipes ? (
        <RelatedSection
          type="recipe"
          items={groups.recipes}
        />
      ) : null}

      {showVideos ? (
        <RelatedSection
          type="video"
          items={groups.videos}
        />
      ) : null}

      {showProducts ? (
        <RelatedSection
          type="product"
          items={groups.products}
        />
      ) : null}
    </div>
  );
}