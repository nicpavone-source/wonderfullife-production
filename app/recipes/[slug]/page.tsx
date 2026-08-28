import Link from "next/link";
import { notFound } from "next/navigation";

import { toggleSavedContentAction } from "@/app/actions/saved-content";
import PrintButton from "@/components/content/PrintButton";
import { createClient } from "../../../lib/supabase/server";

type RecipePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type Recipe = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string | null;
  category: string | null;
  image_url: string | null;
  video_url: string | null;
  tags: string[] | null;
  featured: boolean | null;
  status: string | null;
  reading_minutes: number | null;
};

type RecipeDetails = {
  prepTime: string;
  cookTime: string;
  servings: string;
  difficulty: string;
};

type RecipeSections = {
  details: RecipeDetails;
  ingredients: string[];
  instructions: string[];
  nutrition: string[];
  zoeyTip: string[];
  gallery: string[];
};

function getSection(body: string, heading: string) {
  const marker = `## ${heading}`;
  const start = body.indexOf(marker);

  if (start === -1) {
    return [];
  }

  const contentStart = start + marker.length;
  const remaining = body.slice(contentStart);
  const nextHeading = remaining.indexOf("\n## ");

  const section =
    nextHeading === -1
      ? remaining
      : remaining.slice(0, nextHeading);

  return section
    .trim()
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseRecipeBody(body: string | null): RecipeSections {
  const source = body || "";

  const detailLines = getSection(
    source,
    "Recipe Details"
  );

  const ingredientLines = getSection(
    source,
    "Ingredients"
  );

  const instructionLines = getSection(
    source,
    "Instructions"
  );

  const nutritionLines = getSection(
    source,
    "Nutrition"
  );

  const galleryLines = getSection(
    source,
    "Gallery"
  );

  const zoeyTipLines = getSection(
    source,
    "Zoey's Tip"
  );

  const details: RecipeDetails = {
    prepTime: "",
    cookTime: "",
    servings: "",
    difficulty: "",
  };

  for (const line of detailLines) {
    const lower = line.toLowerCase();

    if (lower.startsWith("prep time:")) {
      details.prepTime = line
        .slice(line.indexOf(":") + 1)
        .trim();
    }

    if (lower.startsWith("cook time:")) {
      details.cookTime = line
        .slice(line.indexOf(":") + 1)
        .trim();
    }

    if (lower.startsWith("servings:")) {
      details.servings = line
        .slice(line.indexOf(":") + 1)
        .trim();
    }

    if (lower.startsWith("difficulty:")) {
      details.difficulty = line
        .slice(line.indexOf(":") + 1)
        .trim();
    }
  }

  const ingredients = ingredientLines
    .filter((line) => line.startsWith("- "))
    .map((line) => line.replace(/^-\s+/, "").trim());

  const instructions = instructionLines
    .filter((line) => {
      const value = line.trim();
      const lower = value.toLowerCase();

      return (
        value.length > 0 &&
        lower !== "instructions" &&
        lower !== "not provided" &&
        lower !== "none" &&
        !/^###\s*step\s*\d+/i.test(value) &&
        !/^!\[[^\]]*\]\([^)]*\)$/.test(value)
      );
    })
    .map((line) =>
      line.replace(/^\d+\.\s*/, "").trim()
    )
    .filter(Boolean);

  const nutrition = nutritionLines.filter(
    (line) => {
      const value = line.toLowerCase();

      return (
        value !== "not provided" &&
        value !== "none"
      );
    }
  );

  const zoeyTip = zoeyTipLines.filter(
    (line) => {
      const value = line.toLowerCase();

      return (
        value !== "not provided" &&
        value !== "none"
      );
    }
  );

  const gallery = galleryLines.filter(
    (line) =>
      line !== "No additional images" &&
      (line.startsWith("https://") ||
        line.startsWith("http://"))
  );

  return {
    details,
    ingredients,
    instructions,
    nutrition,
    zoeyTip,
    gallery,
  };
}

function IngredientList({
  items,
}: {
  items: string[];
}) {
  if (!items.length) {
    return (
      <p className="empty-section">
        Ingredients will be added soon.
      </p>
    );
  }

  return (
    <div className="ingredient-list">
      {items.map((item, index) => (
        <div
          className="ingredient-item"
          key={`${item}-${index}`}
        >
          <span
            className="ingredient-check"
            aria-hidden="true"
          >
            ✓
          </span>

          <p>{item}</p>
        </div>
      ))}
    </div>
  );
}

function InstructionList({
  items,
}: {
  items: string[];
}) {
  if (!items.length) {
    return (
      <p className="empty-section">
        Instructions will be added soon.
      </p>
    );
  }

  return (
    <div className="instruction-list">
      {items.map((item, index) => (
        <div
          className="instruction-item"
          key={`${item}-${index}`}
        >
          <span className="step-number">
            {index + 1}
          </span>

          <p>{item}</p>
        </div>
      ))}
    </div>
  );
}

export default async function RecipePage({
  params,
}: RecipePageProps) {
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
        tags,
        featured,
        status,
        reading_minutes
      `
    )
    .eq("type", "recipe")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !data) {
    console.error(
      "Recipe load error:",
      error
    );

    notFound();
  }

  const recipe = data as Recipe;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isSaved = false;

  if (user) {
    const { data: savedRow } = await supabase
      .from("saved_content")
      .select("id")
      .eq("user_id", user.id)
      .eq("content_id", recipe.id)
      .maybeSingle();

    isSaved = Boolean(savedRow);
  }

  const sections = parseRecipeBody(
    recipe.body
  );

  const {
    prepTime,
    cookTime,
    servings,
    difficulty,
  } = sections.details;

  return (
    <main className="public-recipe-page">
      <section className="recipe-shell">
        <Link
          href="/recipes"
          className="back-link"
        >
          ← Back to Recipes
        </Link>

        {/* HEADER */}

        <header className="recipe-header">
          <p className="recipe-eyebrow">
            {recipe.category ||
              "WonderfulLife Recipe"}
          </p>

          <h1>{recipe.title}</h1>

          <div className="header-badges">
            {recipe.featured ? (
              <span className="featured-badge">
                Featured Recipe
              </span>
            ) : null}

            {recipe.reading_minutes ? (
              <span className="reading-badge">
                {recipe.reading_minutes} min read
              </span>
            ) : null}
          </div>

          {recipe.excerpt ? (
            <p className="recipe-excerpt">
              {recipe.excerpt}
            </p>
          ) : null}
        </header>

        {/* VIDEO + HERO IMAGE */}

        <section className="recipe-visual-grid">
          <div className="recipe-video-card">
            {recipe.video_url ? (
              <video
                autoPlay
                muted
                loop
                playsInline
                controls
                preload="metadata"
                poster={
                  recipe.image_url ||
                  undefined
                }
              >
                <source
                  src={recipe.video_url}
                />

                Your browser does not support
                the video element.
              </video>
            ) : (
              <div className="media-placeholder">
                <span>▶</span>

                <p>
                  12-second recipe video
                </p>
              </div>
            )}
          </div>

          <div className="recipe-image-card">
            {recipe.image_url ? (
              <img
                src={recipe.image_url}
                alt={recipe.title}
              />
            ) : (
              <div className="media-placeholder">
                <span>🍽️</span>

                <p>Recipe hero image</p>
              </div>
            )}
          </div>
        </section>

        {/* REAL STUDIO RECIPE DETAILS */}

        <section
          className="recipe-stats"
          aria-label="Recipe information"
        >
          <div className="recipe-stat">
            <span className="stat-label">
              Prep
            </span>

            <strong>
              {prepTime || "—"}
            </strong>
          </div>

          <div className="recipe-stat">
            <span className="stat-label">
              Cook
            </span>

            <strong>
              {cookTime || "—"}
            </strong>
          </div>

          <div className="recipe-stat">
            <span className="stat-label">
              Serves
            </span>

            <strong>
              {servings || "—"}
            </strong>
          </div>

          <div className="recipe-stat">
            <span className="stat-label">
              Difficulty
            </span>

            <strong>
              {difficulty || "—"}
            </strong>
          </div>
        </section>

        {/* INGREDIENTS + INSTRUCTIONS */}

        <section className="recipe-main-card">
          <div className="ingredients-column">
            <p className="section-eyebrow">
              What you'll need
            </p>

            <h2>Ingredients</h2>

            <IngredientList
              items={
                sections.ingredients
              }
            />
          </div>

          <div className="instructions-column">
            <p className="section-eyebrow">
              Let's make it
            </p>

            <h2>Instructions</h2>

            <InstructionList
              items={
                sections.instructions
              }
            />
          </div>
        </section>

        {/* NUTRITION + ZOEY TIP */}

        {(sections.nutrition.length >
          0 ||
          sections.zoeyTip.length >
            0) && (
          <section className="recipe-extras-grid">
            {sections.nutrition.length >
            0 ? (
              <article className="extra-card nutrition-card">
                <span className="extra-icon">
                  ♡
                </span>

                <p className="section-eyebrow">
                  Wellness
                </p>

                <h2>Nutrition</h2>

                <div className="nutrition-list">
                  {sections.nutrition.map(
                    (line, index) => (
                      <div
                        className="nutrition-row"
                        key={`${line}-${index}`}
                      >
                        {line}
                      </div>
                    )
                  )}
                </div>
              </article>
            ) : null}

            {sections.zoeyTip.length >
            0 ? (
              <article className="extra-card zoey-tip-card">
                <span className="extra-icon">
                  ✦
                </span>

                <p className="section-eyebrow">
                  WonderfulLife
                </p>

                <h2>Zoey's Tip</h2>

                {sections.zoeyTip.map(
                  (line, index) => (
                    <p key={index}>
                      {line}
                    </p>
                  )
                )}
              </article>
            ) : null}
          </section>
        )}

        {/* OPTIONAL GALLERY */}

        {sections.gallery.length > 0 ? (
          <section className="gallery-section">
            <div className="gallery-heading">
              <div>
                <p className="section-eyebrow">
                  Step by step
                </p>

                <h2>Recipe Gallery</h2>
              </div>
            </div>

            <div className="gallery-grid">
              {sections.gallery.map(
                (image, index) => (
                  <div
                    className="gallery-card"
                    key={`${image}-${index}`}
                  >
                    <img
                      src={image}
                      alt={`${recipe.title} preparation ${
                        index + 1
                      }`}
                      loading="lazy"
                    />
                  </div>
                )
              )}
            </div>
          </section>
        ) : null}

        {/* TAGS */}

        {recipe.tags &&
        recipe.tags.length > 0 ? (
          <section
            className="recipe-tags"
            aria-label="Recipe tags"
          >
            {recipe.tags.map((tag) => (
              <span key={tag}>
                {tag}
              </span>
            ))}
          </section>
        ) : null}

        {/* FOOTER */}

        <div className="recipe-footer-actions">
          <PrintButton label="Print Recipe" />

          <form
            action={toggleSavedContentAction}
            className="save-recipe-form"
          >
            <input
              type="hidden"
              name="content_id"
              value={recipe.id}
            />

            <input
              type="hidden"
              name="return_path"
              value={`/recipes/${recipe.slug}`}
            />

            <button
              type="submit"
              className={`save-recipe-button${
                isSaved ? " is-saved" : ""
              }`}
            >
              <span aria-hidden="true">
                {isSaved ? "✓" : "♡"}
              </span>

              {isSaved
                ? "Saved"
                : "Save Recipe"}
            </button>
          </form>

          <Link
            href="/recipes"
            className="recipes-button"
          >
            Explore More Recipes →
          </Link>

          <Link
            href="/ask-zoey"
            className="zoey-button"
          >
            Ask Zoey About This Recipe
          </Link>

          {!user ? (
            <span className="save-recipe-note">
              Sign in to save this recipe.
            </span>
          ) : isSaved ? (
            <span className="save-recipe-note">
              Saved to your Member Library.
            </span>
          ) : null}
        </div>
      </section>

      <style>{`
        .public-recipe-page {
          min-height: 100vh;
          padding: 24px 20px 72px;
          background: #f6f8f4;
          color: #173d29;
        }

        .recipe-shell {
          width: min(1180px, 100%);
          margin: 0 auto;
        }

        .back-link {
          display: inline-flex;
          margin-bottom: 18px;
          color: #23633d;
          font-size: 14px;
          font-weight: 800;
          text-decoration: none;
        }

        .recipe-header {
          max-width: 900px;
          margin-bottom: 22px;
        }

        .recipe-eyebrow,
        .section-eyebrow {
          margin: 0 0 8px;
          color: #35714b;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .recipe-header h1 {
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(34px, 4.2vw, 48px);
          line-height: 1.04;
          letter-spacing: -0.035em;
        }

        .header-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 13px;
        }

        .featured-badge,
        .reading-badge {
          display: inline-flex;
          padding: 6px 11px;
          border-radius: 999px;
          background: #e8f1e6;
          color: #23633d;
          font-size: 11px;
          font-weight: 900;
        }

        .recipe-excerpt {
          max-width: 820px;
          margin: 15px 0 0;
          color: #647169;
          font-size: 16px;
          line-height: 1.58;
        }

        .recipe-visual-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
          align-items: stretch;
        }

        .recipe-video-card,
        .recipe-image-card {
          overflow: hidden;
          height: 470px;
          border: 1px solid #dce5da;
          border-radius: 22px;
          background: #ffffff;
          box-shadow: 0 12px 32px rgba(27, 69, 43, 0.07);
        }

        .recipe-video-card {
          display: flex;
          align-items: center;
          justify-content: center;
          background: #07110b;
        }

        .recipe-video-card video {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: contain;
          background: #07110b;
        }

        .recipe-image-card img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .media-placeholder {
          display: flex;
          width: 100%;
          height: 100%;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: #edf3eb;
          color: #23633d;
          text-align: center;
        }

        .media-placeholder span { font-size: 38px; }
        .media-placeholder p { margin: 0; font-weight: 800; }

        .recipe-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          margin-top: 18px;
          overflow: hidden;
          border: 1px solid #dce5da;
          border-radius: 18px;
          background: #ffffff;
          box-shadow: 0 8px 22px rgba(27, 69, 43, 0.04);
        }

        .recipe-stat {
          display: flex;
          min-height: 84px;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 14px;
          text-align: center;
        }

        .recipe-stat + .recipe-stat { border-left: 1px solid #e1e8df; }

        .stat-label {
          margin-bottom: 5px;
          color: #728078;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.13em;
          text-transform: uppercase;
        }

        .recipe-stat strong {
          color: #174d2d;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 20px;
        }

        .recipe-main-card {
          display: grid;
          grid-template-columns: minmax(260px, 0.82fr) minmax(0, 1.35fr);
          margin-top: 18px;
          overflow: hidden;
          border: 1px solid #dce5da;
          border-radius: 22px;
          background: #ffffff;
          box-shadow: 0 12px 30px rgba(27, 69, 43, 0.05);
        }

        .ingredients-column,
        .instructions-column { padding: clamp(24px, 3vw, 34px); }

        .ingredients-column {
          background: #f3f7f1;
          border-right: 1px solid #dce5da;
        }

        .recipe-main-card h2,
        .extra-card h2,
        .gallery-section h2 {
          margin: 0 0 18px;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(28px, 3vw, 34px);
          line-height: 1.08;
        }

        .ingredient-list { display: flex; flex-direction: column; gap: 1px; }
        .ingredient-item {
          display: flex; gap: 11px; align-items: flex-start; padding: 10px 0;
          border-bottom: 1px solid rgba(35, 99, 61, 0.1);
        }
        .ingredient-item:last-child { border-bottom: none; }
        .ingredient-check {
          display: grid; flex: 0 0 24px; width: 24px; height: 24px; place-items: center;
          border-radius: 50%; background: #deebdd; color: #23633d; font-size: 11px; font-weight: 900;
        }
        .ingredient-item p { margin: 1px 0 0; color: #4f6156; font-size: 15px; line-height: 1.5; }

        .instruction-list { display: flex; flex-direction: column; gap: 18px; }
        .instruction-item {
          display: grid; grid-template-columns: 34px 1fr; gap: 14px; align-items: flex-start;
        }
        .step-number {
          display: grid; width: 34px; height: 34px; place-items: center; border-radius: 50%;
          background: #23633d; color: #ffffff; font-size: 13px; font-weight: 900;
        }
        .instruction-item p { margin: 2px 0 0; color: #53645a; font-size: 15px; line-height: 1.62; }
        .empty-section { margin: 0; color: #7a877f; font-size: 15px; line-height: 1.6; }

        .recipe-extras-grid {
          display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px; margin-top: 18px;
        }
        .extra-card { padding: 26px; border: 1px solid #dce5da; border-radius: 20px; background: #ffffff; }
        .nutrition-card { background: #ffffff; }
        .zoey-tip-card { background: #edf5ed; }
        .extra-icon {
          display: grid; width: 38px; height: 38px; margin-bottom: 16px; place-items: center;
          border-radius: 50%; background: #e4efe3; color: #23633d; font-size: 17px;
        }
        .extra-card h2 { margin-bottom: 14px; }
        .extra-card > p:not(.section-eyebrow) { margin: 0 0 8px; color: #596960; font-size: 15px; line-height: 1.62; }
        .nutrition-list { display: grid; gap: 0; }
        .nutrition-row { padding: 9px 0; border-bottom: 1px solid #e5ebe3; color: #53645a; font-size: 15px; line-height: 1.45; }
        .nutrition-row:last-child { border-bottom: none; }

        .gallery-section { margin-top: 18px; padding: 26px; border: 1px solid #dce5da; border-radius: 22px; background: #ffffff; }
        .gallery-heading { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; }
        .gallery-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
        .gallery-card { overflow: hidden; aspect-ratio: 4 / 3; border-radius: 16px; background: #edf0ec; }
        .gallery-card img { display: block; width: 100%; height: 100%; object-fit: cover; }

        .recipe-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 20px; }
        .recipe-tags span {
          padding: 7px 11px; border: 1px solid #d7e2d6; border-radius: 999px; background: #edf5ed;
          color: #174d2d; font-size: 12px; font-weight: 900;
        }

        .recipe-footer-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: center;
          margin-top: 22px;
        }

        .save-recipe-form {
          margin: 0;
        }

        .save-recipe-button,
        .recipes-button,
        .zoey-button {
          display: inline-flex;
          min-height: 46px;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0 18px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 900;
          text-decoration: none;
        }

        .save-recipe-button {
          border: 1px solid #bfd2c2;
          background: #ffffff;
          color: #23633d;
          font: inherit;
          font-size: 14px;
          font-weight: 900;
          cursor: pointer;
          transition:
            transform 150ms ease,
            background 150ms ease,
            border-color 150ms ease,
            color 150ms ease;
        }

        .save-recipe-button:hover {
          transform: translateY(-1px);
          border-color: #7fa58a;
          background: #f4f9f2;
        }

        .save-recipe-button.is-saved {
          border-color: #23633d;
          background: #23633d;
          color: #ffffff;
        }

        .save-recipe-note {
          color: #7a877f;
          font-size: 11px;
          font-weight: 700;
        }

        .recipes-button {
          background: #23633d;
          color: #ffffff;
        }

        .zoey-button {
          border: 1px solid #d7e2d6;
          background: #ffffff;
          color: #23633d;
        }

        @media (max-width: 900px) {
          .recipe-stats { grid-template-columns: 1fr 1fr; }
          .recipe-stat:nth-child(3) { border-left: none; border-top: 1px solid #e1e8df; }
          .recipe-stat:nth-child(4) { border-top: 1px solid #e1e8df; }
          .recipe-main-card { grid-template-columns: 1fr; }
          .ingredients-column { border-right: 0; border-bottom: 1px solid #dce5da; }
          .gallery-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }

        @media (max-width: 820px) {
          .public-recipe-page { padding: 20px 14px 56px; }
          .recipe-header h1 { font-size: clamp(32px, 9vw, 42px); }
          .recipe-excerpt { font-size: 15px; }
          .recipe-visual-grid { grid-template-columns: 1fr; }
          .recipe-video-card, .recipe-image-card { height: auto; min-height: 320px; }
          .recipe-video-card video { height: auto; aspect-ratio: 9 / 16; }
          .recipe-image-card img { min-height: 320px; }
          .recipe-extras-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 560px) {
          .recipe-stats { grid-template-columns: 1fr 1fr; }
          .recipe-stat { min-height: 78px; padding: 12px 8px; }
          .recipe-stat strong { font-size: 18px; }
          .ingredients-column, .instructions-column { padding: 24px 18px; }
          .recipe-main-card h2, .extra-card h2, .gallery-section h2 { font-size: 28px; }
          .ingredient-item p, .instruction-item p { font-size: 15px; }
          .gallery-grid { grid-template-columns: 1fr; }
          .gallery-section { padding: 22px 16px; }
        }

        @media print {
          @page {
            margin: 0.55in;
          }

          body {
            background: #ffffff !important;
          }

          .public-recipe-page {
            min-height: auto;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
          }

          .recipe-shell {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
          }

          .back-link,
          .recipe-visual-grid,
          .gallery-section,
          .recipe-tags,
          .recipe-footer-actions,
          .header-badges {
            display: none !important;
          }

          .recipe-header {
            max-width: none !important;
            margin: 0 0 16px !important;
          }

          .recipe-eyebrow,
          .section-eyebrow {
            color: #333333 !important;
          }

          .recipe-header h1 {
            color: #000000 !important;
            font-size: 28pt !important;
            line-height: 1.08 !important;
          }

          .recipe-excerpt {
            max-width: none !important;
            margin-top: 8px !important;
            color: #333333 !important;
            font-size: 10.5pt !important;
            line-height: 1.4 !important;
          }

          .recipe-stats {
            grid-template-columns: repeat(4, 1fr) !important;
            margin-top: 12px !important;
            border: 1px solid #bdbdbd !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            break-inside: avoid;
          }

          .recipe-stat {
            min-height: auto !important;
            padding: 8px !important;
          }

          .recipe-stat strong {
            color: #000000 !important;
            font-size: 12pt !important;
          }

          .recipe-main-card {
            display: grid !important;
            grid-template-columns: 0.85fr 1.35fr !important;
            margin-top: 14px !important;
            overflow: visible !important;
            border: 1px solid #bdbdbd !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            break-inside: auto;
          }

          .ingredients-column,
          .instructions-column {
            padding: 16px !important;
            background: #ffffff !important;
          }

          .ingredients-column {
            border-right: 1px solid #bdbdbd !important;
            border-bottom: 0 !important;
          }

          .recipe-main-card h2,
          .extra-card h2 {
            margin-bottom: 10px !important;
            color: #000000 !important;
            font-size: 18pt !important;
          }

          .ingredient-item {
            padding: 5px 0 !important;
          }

          .ingredient-check {
            width: 18px !important;
            height: 18px !important;
            flex-basis: 18px !important;
            background: transparent !important;
            color: #000000 !important;
            border: 1px solid #777777 !important;
          }

          .ingredient-item p,
          .instruction-item p,
          .nutrition-row,
          .extra-card > p:not(.section-eyebrow) {
            color: #111111 !important;
            font-size: 10pt !important;
            line-height: 1.4 !important;
          }

          .instruction-list {
            gap: 10px !important;
          }

          .instruction-item {
            grid-template-columns: 24px 1fr !important;
            gap: 9px !important;
            break-inside: avoid;
          }

          .step-number {
            width: 24px !important;
            height: 24px !important;
            background: transparent !important;
            color: #000000 !important;
            border: 1px solid #555555 !important;
            font-size: 9pt !important;
          }

          .recipe-extras-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
            margin-top: 14px !important;
          }

          .extra-card {
            padding: 14px !important;
            border: 1px solid #bdbdbd !important;
            border-radius: 0 !important;
            background: #ffffff !important;
            break-inside: avoid;
          }

          .extra-icon {
            display: none !important;
          }

          .nutrition-row {
            padding: 5px 0 !important;
          }

          a {
            color: #000000 !important;
            text-decoration: none !important;
          }
        }
      `}</style>
    </main>
  );
}