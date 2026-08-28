import Image from "next/image";
import Link from "next/link";

import { createClient } from "../../lib/supabase/server";

type Recipe = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string | null;
  image_url: string | null;
  video_url: string | null;
  featured: boolean | null;
  created_at: string;
  updated_at: string | null;
};

type RecipeVideo = {
  id: number;
  title: string;
  slug: string;
  image_url: string | null;
  created_at: string;
  updated_at: string | null;
};

export const metadata = {
  title: "Recipes | WonderfulLife.ca",
  description:
    "Discover simple, nourishing WonderfulLife recipes, recipe videos, printable collections, and healthy cooking inspiration.",
};

const categories = [
  ["Breakfast", "☀"],
  ["Lunch", "♨"],
  ["Dinner", "⌒"],
  ["Smoothies", "♧"],
  ["Soups", "≋"],
  ["Desserts", "♜"],
] as const;

function formatDate(value: string | null) {
  if (!value) return "Recently added";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently added";

  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function CardImage({
  src,
  alt,
  className,
}: {
  src: string | null;
  alt: string;
  className: string;
}) {
  if (!src) {
    return (
      <div className={`${className} image-placeholder`} aria-hidden="true">
        🍽
      </div>
    );
  }

  return <img src={src} alt={alt} className={className} />;
}

export default async function RecipesPage() {
  const supabase = await createClient();

  const [recipesResult, videosResult] = await Promise.all([
    supabase
      .from("content_items")
      .select(
        "id,title,slug,excerpt,category,image_url,video_url,featured,created_at,updated_at"
      )
      .eq("type", "recipe")
      .eq("status", "published")
      .order("featured", { ascending: false })
      .order("updated_at", { ascending: false })
      .limit(12),

    supabase
      .from("content_items")
      .select("id,title,slug,image_url,created_at,updated_at")
      .eq("type", "video")
      .eq("status", "published")
      .in("category", ["Recipe", "Recipes"])
      .order("featured", { ascending: false })
      .order("updated_at", { ascending: false })
      .limit(5),
  ]);

  const recipes = (recipesResult.data || []) as Recipe[];
  const recipeVideos = (videosResult.data || []) as RecipeVideo[];

  const featured =
    recipes.find((recipe) => Boolean(recipe.featured)) || recipes[0] || null;

  const newest = recipes
    .filter((recipe) => recipe.id !== featured?.id)
    .slice(0, 4);

  const error =
    recipesResult.error?.message || videosResult.error?.message || null;

  return (
    <main className="recipes-home">
      <style>{`
        .recipes-home {
          min-height: 100vh;
          overflow-x: hidden;
          background: #f8f7f2;
          color: #173d29;
        }

        .recipes-hero {
          position: relative;
          display: block;
          width: 100%;
          aspect-ratio: 1536 / 398;
          overflow: hidden;
          background: #f7f5ee;
        }

        .recipes-hero-image {
          object-fit: cover;
          object-position: 70% center;
        }

        .recipes-content {
          width: min(1480px, calc(100% - 48px));
          margin: 0 auto;
          padding: 26px 0 56px;
        }

        .recipes-section {
          margin-top: 30px;
        }

        .recipes-section:first-child {
          margin-top: 0;
        }

        .recipes-heading-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 14px;
        }

        .recipes-heading {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          margin: 0;
          color: #174b31;
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 0.07em;
          text-transform: uppercase;
        }

        .recipes-heading-icon {
          display: grid;
          width: 24px;
          height: 24px;
          place-items: center;
          border-radius: 50%;
          background: #e9f1e8;
          color: #176a42;
        }

        .recipes-section-link {
          color: #17623d;
          font-size: 13px;
          font-weight: 900;
          text-decoration: none;
        }

        .recipes-showcase-grid {
          display: grid;
          grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
          gap: 20px;
          align-items: stretch;
        }

        .recipes-showcase-panel {
          min-width: 0;
          margin-top: 0;
          padding: 18px;
          border: 1px solid #dfe7dc;
          border-radius: 22px;
          background: #ffffff;
          box-shadow: 0 14px 38px rgba(29, 70, 45, 0.07);
        }

        .recipes-featured-card {
          display: grid;
          grid-template-columns: 1.08fr 0.92fr;
          min-height: 286px;
          overflow: hidden;
          border: 1px solid #dfe7dc;
          border-radius: 24px;
          background: #fff;
          box-shadow: 0 18px 50px rgba(29, 70, 45, 0.08);
        }

        .recipes-featured-media {
          position: relative;
          display: block;
          min-height: 286px;
          overflow: hidden;
          background: #e9efe9;
        }

        .recipes-featured-image {
          width: 100%;
          height: 100%;
          min-height: 286px;
          object-fit: cover;
          transition: transform 180ms ease;
        }

        .recipes-featured-card:hover .recipes-featured-image {
          transform: scale(1.018);
        }

        .recipes-play-badge {
          position: absolute;
          top: 50%;
          left: 50%;
          display: grid;
          width: 64px;
          height: 64px;
          place-items: center;
          border: 3px solid #fff;
          border-radius: 50%;
          background: rgba(23, 97, 61, 0.92);
          color: #fff;
          font-size: 22px;
          transform: translate(-50%, -50%);
        }

        .recipes-featured-copy {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 24px;
        }

        .recipes-featured-eyebrow {
          margin: 0 0 12px;
          color: #247045;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .recipes-featured-title {
          margin: 0;
          color: #173d29;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(27px, 2.25vw, 38px);
          line-height: 1.02;
          letter-spacing: -0.035em;
        }

        .recipes-featured-description {
          margin: 18px 0 0;
          color: #657269;
          font-size: 13px;
          line-height: 1.55;
        }

        .recipes-chips,
        .recipes-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 22px;
        }

        .recipes-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border: 1px solid #dde7dc;
          border-radius: 999px;
          background: #f7faf6;
          color: #315a40;
          font-size: 12px;
          font-weight: 800;
        }

        .recipes-button {
          display: inline-flex;
          min-height: 46px;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0 20px;
          border: 1px solid #17613d;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 900;
          text-decoration: none;
        }

        .recipes-button-primary {
          background: #17613d;
          color: #fff;
        }

        .recipes-button-secondary {
          background: #fff;
          color: #17613d;
        }

        .recipes-videos-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 12px;
        }

        .recipes-video-card,
        .recipes-card {
          min-width: 0;
        }

        .recipes-video-media,
        .recipes-card-media {
          position: relative;
          display: block;
          overflow: hidden;
          border: 1px solid #dfe7dc;
          border-radius: 16px;
          background: #e9efe9;
          box-shadow: 0 10px 26px rgba(29, 70, 45, 0.07);
        }

        .recipes-video-image {
          display: block;
          width: 100%;
          aspect-ratio: 16 / 10;
          object-fit: cover;
        }

        .recipes-small-play {
          position: absolute;
          top: 50%;
          left: 50%;
          display: grid;
          width: 46px;
          height: 46px;
          place-items: center;
          border: 2px solid #fff;
          border-radius: 50%;
          background: rgba(20, 88, 53, 0.92);
          color: #fff;
          transform: translate(-50%, -50%);
        }

        .recipes-video-title {
          margin: 10px 0 0;
          color: #183e2a;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 13px;
          line-height: 1.22;
        }

        .recipes-video-date {
          margin: 6px 0 0;
          color: #758077;
          font-size: 10px;
        }

        .recipes-newest-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 20px;
        }

        .recipes-card {
          display: flex;
          overflow: hidden;
          flex-direction: column;
          border: 1px solid #dfe7dc;
          border-radius: 18px;
          background: #fff;
          box-shadow: 0 12px 30px rgba(29, 70, 45, 0.07);
        }

        .recipes-card-image {
          display: block;
          width: 100%;
          aspect-ratio: 4 / 3;
          object-fit: cover;
        }

        .recipes-save-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          display: grid;
          width: 34px;
          height: 34px;
          place-items: center;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.93);
          color: #174b31;
        }

        .recipes-card-copy {
          display: flex;
          flex: 1;
          flex-direction: column;
          padding: 16px;
        }

        .recipes-card-title {
          margin: 0;
          color: #183e2a;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 21px;
          line-height: 1.22;
        }

        .recipes-card-excerpt {
          display: -webkit-box;
          overflow: hidden;
          margin: 10px 0 0;
          color: #68756c;
          font-size: 13px;
          line-height: 1.55;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }

        .recipes-card-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: auto;
          padding-top: 14px;
          color: #467056;
          font-size: 11px;
          font-weight: 800;
        }

        .recipes-lower-grid {
          display: grid;
          grid-template-columns: 1.4fr 0.85fr 0.85fr;
          gap: 20px;
        }

        .recipes-panel {
          position: relative;
          overflow: hidden;
          padding: 24px;
          border: 1px solid #dfe7dc;
          border-radius: 20px;
          background: #fff;
          box-shadow: 0 12px 30px rgba(29, 70, 45, 0.06);
        }

        .recipes-categories {
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 14px;
          margin-top: 20px;
        }

        .recipes-category {
          display: flex;
          align-items: center;
          flex-direction: column;
          color: #214f35;
          text-align: center;
          text-decoration: none;
        }

        .recipes-category-icon {
          display: grid;
          width: 62px;
          height: 62px;
          place-items: center;
          border: 1px solid #d8e3d7;
          border-radius: 50%;
          background: #fbfcf9;
          color: #1a6740;
          font-size: 24px;
        }

        .recipes-category-label {
          margin-top: 8px;
          font-size: 12px;
          font-weight: 900;
        }

        .recipes-panel-title {
          margin: 0;
          color: #174b31;
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .recipes-panel-copy {
          margin: 14px 0 0;
          color: #69756d;
          font-size: 13px;
          line-height: 1.6;
        }

        .recipes-panel-button {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-top: 22px;
          padding: 12px 18px;
          border-radius: 999px;
          background: #17613d;
          color: #fff;
          font-size: 12px;
          font-weight: 900;
          text-decoration: none;
        }

        .recipes-benefits {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 1px;
          overflow: hidden;
          margin-top: 22px;
          border: 1px solid #dfe7dc;
          border-radius: 20px;
          background: #dfe7dc;
        }

        .recipes-benefit {
          display: flex;
          align-items: center;
          gap: 12px;
          min-height: 88px;
          padding: 18px;
          background: #fff;
        }

        .recipes-benefit-title {
          margin: 0;
          color: #1b452f;
          font-size: 13px;
          font-weight: 900;
        }

        .recipes-benefit-copy {
          margin: 4px 0 0;
          color: #758077;
          font-size: 11px;
        }

        .recipes-empty,
        .recipes-error {
          display: grid;
          min-height: 200px;
          place-items: center;
          padding: 30px;
          border: 1px solid #dfe7dc;
          border-radius: 20px;
          background: #fff;
          color: #68756c;
          text-align: center;
        }

        .recipes-error {
          border-color: #e8caca;
          background: #fff2f2;
          color: #963c3c;
          font-weight: 800;
        }

        .image-placeholder {
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, #dfece1, #f1f6ef);
          color: #256645;
          font-size: 44px;
        }

        @media (max-width: 1180px) {
          .recipes-showcase-grid {
            grid-template-columns: 1fr;
          }

          .recipes-videos-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .recipes-video-card:nth-child(n + 4) {
            display: none;
          }

          .recipes-newest-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .recipes-lower-grid {
            grid-template-columns: 1fr 1fr;
          }

          .recipes-categories-panel {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 820px) {
          .recipes-hero {
            aspect-ratio: 1.35 / 1;
          }

          .recipes-content {
            width: min(100% - 28px, 720px);
          }

          .recipes-featured-card {
            grid-template-columns: 1fr;
          }

          .recipes-featured-media,
          .recipes-featured-image {
            min-height: 320px;
          }

          .recipes-benefits {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 620px) {
          .recipes-content {
            width: min(100% - 20px, 560px);
          }

          .recipes-videos-grid,
          .recipes-newest-grid,
          .recipes-lower-grid {
            grid-template-columns: 1fr;
          }

          .recipes-video-card:nth-child(n + 4) {
            display: block;
          }

          .recipes-categories {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .recipes-heading-row {
            align-items: flex-start;
            flex-direction: column;
          }

          .recipes-actions {
            flex-direction: column;
          }

          .recipes-button {
            width: 100%;
            box-sizing: border-box;
          }
        }
      `}</style>

      <Link
        href="/recipes/all"
        aria-label="Explore all WonderfulLife recipes"
        className="recipes-hero"
      >
        <Image
          src="/images/wl-home-recipes-v2-clean-hero.png"
          alt="WonderfulLife Recipes homepage featuring Zoey preparing a healthy meal"
          fill
          priority
          sizes="100vw"
          className="recipes-hero-image"
        />
      </Link>

      <div className="recipes-content">
        {error ? (
          <div className="recipes-error">Recipe content could not be loaded: {error}</div>
        ) : (
          <>
            <div className="recipes-showcase-grid">
              <section className="recipes-section recipes-showcase-panel">
                <div className="recipes-heading-row">
                  <h2 className="recipes-heading">
                    <span className="recipes-heading-icon">🌿</span>
                    Featured Recipe
                </h2>
              </div>

              {featured ? (
                <article className="recipes-featured-card">
                  <Link
                    href={`/recipes/${featured.slug}`}
                    className="recipes-featured-media"
                  >
                    <CardImage
                      src={featured.image_url}
                      alt={featured.title}
                      className="recipes-featured-image"
                    />

                    {featured.video_url ? (
                      <span className="recipes-play-badge">▶</span>
                    ) : null}
                  </Link>

                  <div className="recipes-featured-copy">
                    <p className="recipes-featured-eyebrow">
                      {featured.category || "WonderfulLife Recipe"}
                    </p>

                    <h1 className="recipes-featured-title">{featured.title}</h1>

                    <p className="recipes-featured-description">
                      {featured.excerpt ||
                        "A nourishing WonderfulLife recipe created to make healthy eating simple and delicious."}
                    </p>

                    <div className="recipes-chips">
                      <span className="recipes-chip">
                        ● {featured.category || "Healthy Recipe"}
                      </span>
                      <span className="recipes-chip">
                        ◷ {formatDate(featured.updated_at || featured.created_at)}
                      </span>
                      {featured.video_url ? (
                        <span className="recipes-chip">▶ Video included</span>
                      ) : null}
                    </div>

                    <div className="recipes-actions">
                      <Link
                        href={`/recipes/${featured.slug}`}
                        className="recipes-button recipes-button-primary"
                      >
                        🌿 View Recipe
                      </Link>

                      {featured.video_url ? (
                        <Link
                          href={`/recipes/${featured.slug}#recipe-video`}
                          className="recipes-button recipes-button-secondary"
                        >
                          ▶ Watch Video
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </article>
              ) : (
                <div className="recipes-empty">
                  Publish and feature a recipe in the WonderfulLife Studio.
                </div>
              )}
            </section>

              <section className="recipes-section recipes-showcase-panel">
                <div className="recipes-heading-row">
                  <h2 className="recipes-heading">
                    <span className="recipes-heading-icon">▶</span>
                    Latest Recipe Videos
                </h2>

                <Link href="/recipes/all" className="recipes-section-link">
                  View all recipes →
                </Link>
              </div>

              {recipeVideos.length ? (
                <div className="recipes-videos-grid">
                  {recipeVideos.map((video) => (
                    <article key={video.id} className="recipes-video-card">
                      <Link
                        href={`/videos/${video.slug}`}
                        className="recipes-video-media"
                      >
                        <CardImage
                          src={video.image_url}
                          alt={video.title}
                          className="recipes-video-image"
                        />
                        <span className="recipes-small-play">▶</span>
                      </Link>

                      <h3 className="recipes-video-title">{video.title}</h3>
                      <p className="recipes-video-date">
                        {formatDate(video.updated_at || video.created_at)}
                      </p>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="recipes-empty">
                  Recipe videos from the Video Studio will appear here.
                </div>
              )}
            </section>

            </div>

            <section className="recipes-section">
              <div className="recipes-heading-row">
                <h2 className="recipes-heading">
                  <span className="recipes-heading-icon">🌿</span>
                  Newest Recipes
                </h2>

                <Link href="/recipes/all" className="recipes-section-link">
                  View all recipes →
                </Link>
              </div>

              {newest.length ? (
                <div className="recipes-newest-grid">
                  {newest.map((recipe) => (
                    <article key={recipe.id} className="recipes-card">
                      <Link
                        href={`/recipes/${recipe.slug}`}
                        className="recipes-card-media"
                      >
                        <CardImage
                          src={recipe.image_url}
                          alt={recipe.title}
                          className="recipes-card-image"
                        />
                        <span className="recipes-save-badge">♡</span>
                      </Link>

                      <div className="recipes-card-copy">
                        <h3 className="recipes-card-title">{recipe.title}</h3>
                        <p className="recipes-card-excerpt">
                          {recipe.excerpt ||
                            "Discover this nourishing WonderfulLife recipe."}
                        </p>
                        <div className="recipes-card-meta">
                          <span>● {recipe.category || "Healthy Recipe"}</span>
                          {recipe.video_url ? <span>▶ Video</span> : null}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="recipes-empty">
                  Your newest published recipes will appear here.
                </div>
              )}
            </section>

            <section className="recipes-section recipes-lower-grid">
              <div className="recipes-panel recipes-categories-panel">
                <h2 className="recipes-heading">
                  <span className="recipes-heading-icon">🌿</span>
                  Browse by Category
                </h2>

                <div className="recipes-categories">
                  {categories.map(([label, symbol]) => (
                    <Link
                      key={label}
                      href={`/recipes/all?category=${encodeURIComponent(label)}`}
                      className="recipes-category"
                    >
                      <span className="recipes-category-icon">{symbol}</span>
                      <span className="recipes-category-label">{label}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="recipes-panel">
                <h2 className="recipes-panel-title">🌿 Printable Recipe Collection</h2>
                <p className="recipes-panel-copy">
                  Browse recipes prepared for easy printing while we build the
                  downloadable WonderfulLife PDF collection.
                </p>
                <Link href="/recipes/all?format=print" className="recipes-panel-button">
                  ↓ View Printable Recipes
                </Link>
              </div>

              <div className="recipes-panel">
                <h2 className="recipes-panel-title">🌿 Healthy Cooking Tips</h2>
                <p className="recipes-panel-copy">
                  Discover practical ideas that make nourishing home cooking
                  simpler, faster, and more enjoyable.
                </p>
                <Link href="/articles" className="recipes-panel-button">
                  🌿 View Tips
                </Link>
              </div>
            </section>

            <section className="recipes-benefits" aria-label="Recipe benefits">
              {[
                ["🌿", "Healthy & Delicious", "Recipes you will love"],
                ["🧺", "Simple Ingredients", "Real food, real results"],
                ["📋", "Step-by-Step", "Easy to follow"],
                ["♡", "Made with Love", "By Zoey, for you"],
                ["🔖", "Save & Share", "Keep your favourites"],
              ].map(([icon, title, copy]) => (
                <div className="recipes-benefit" key={title}>
                  <span style={{ fontSize: 25 }}>{icon}</span>
                  <div>
                    <p className="recipes-benefit-title">{title}</p>
                    <p className="recipes-benefit-copy">{copy}</p>
                  </div>
                </div>
              ))}
            </section>
          </>
        )}
      </div>
    </main>
  );
}