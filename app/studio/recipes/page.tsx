import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import DeleteRecipeButton from "./DeleteRecipeButton";

type Recipe = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string | null;
  status: string | null;
  image_url: string | null;
  featured: boolean | null;
  created_at: string;
  updated_at: string | null;
};

type RecipesPageProps = {
  searchParams: Promise<{
    message?: string;
  }>;
};

const colors = {
  page: "#f6f8f5",
  panel: "#ffffff",
  border: "#dfe6dd",
  text: "#173d29",
  muted: "#6f7e73",
  green: "#23633d",
  greenDark: "#194d2f",
  greenSoft: "#eaf2e8",
  yellowSoft: "#fff5d8",
  yellowText: "#735c16",
  redSoft: "#fff0f0",
  red: "#9f3838",
};

async function deleteRecipeAction(formData: FormData) {
  "use server";

  const recipeId = Number(formData.get("recipe_id"));
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  if (!recipeId) {
    redirect(
      `/studio/recipes?message=${encodeURIComponent(
        "The recipe ID is missing."
      )}`
    );
  }

  const { error } = await supabase
    .from("content_items")
    .delete()
    .eq("id", recipeId)
    .eq("type", "recipe")
    .eq("created_by", user.id);

  if (error) {
    redirect(
      `/studio/recipes?message=${encodeURIComponent(error.message)}`
    );
  }

  redirect(
    `/studio/recipes?message=${encodeURIComponent(
      "Recipe deleted successfully."
    )}`
  );
}

export default async function RecipesPage({
  searchParams,
}: RecipesPageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data: recipes, error } = await supabase
    .from("content_items")
    .select(
      `
        id,
        title,
        slug,
        excerpt,
        category,
        status,
        image_url,
        featured,
        created_at,
        updated_at
      `
    )
    .eq("type", "recipe")
    .order("created_at", { ascending: false });

  const recipeList = (recipes || []) as Recipe[];

  const publishedCount = recipeList.filter(
    (recipe) => recipe.status === "published"
  ).length;

  const draftCount = recipeList.filter(
    (recipe) => recipe.status !== "published"
  ).length;

  const featuredCount = recipeList.filter(
    (recipe) => recipe.featured
  ).length;

  const successMessage = params.message
    ? params.message.replaceAll("Article", "Recipe")
    : "";

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "28px 32px 60px",
        background: colors.page,
        color: colors.text,
      }}
    >
      <header
        style={{
          display: "flex",
          gap: "18px",
          alignItems: "flex-end",
          justifyContent: "space-between",
          flexWrap: "wrap",
          marginBottom: "20px",
        }}
      >
        <div>
          <p style={eyebrowStyle}>WonderfulLife Studio</p>

          <h1
            style={{
              margin: "8px 0 0",
              fontSize: "34px",
              lineHeight: 1.1,
            }}
          >
            Recipe Library
          </h1>

          <p
            style={{
              margin: "7px 0 0",
              color: colors.muted,
              fontSize: "14px",
            }}
          >
            View, organize, edit, and publish all WonderfulLife recipes.
          </p>
        </div>

        <Link href="/studio/recipes/new" style={createButtonStyle}>
          + Create New Recipe
        </Link>
      </header>

      {successMessage ? (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px 14px",
            border: `1px solid ${colors.border}`,
            borderRadius: "10px",
            background: colors.greenSoft,
            color: colors.green,
            fontSize: "13px",
            fontWeight: 800,
          }}
        >
          ✓ {successMessage}
        </div>
      ) : null}

      {error ? (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px 14px",
            border: `1px solid #e7c9c9`,
            borderRadius: "10px",
            background: colors.redSoft,
            color: colors.red,
            fontSize: "13px",
            fontWeight: 700,
          }}
        >
          Unable to load recipes: {error.message}
        </div>
      ) : null}

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: "12px",
          marginBottom: "18px",
        }}
      >
        <StatCard label="Total Recipes" value={recipeList.length} />
        <StatCard label="Published" value={publishedCount} />
        <StatCard label="Drafts" value={draftCount} />
        <StatCard label="Featured" value={featuredCount} />
      </section>

      {recipeList.length === 0 ? (
        <section
          style={{
            padding: "64px 24px",
            border: `1px dashed ${colors.border}`,
            borderRadius: "16px",
            background: colors.panel,
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "grid",
              width: "62px",
              height: "62px",
              margin: "0 auto",
              placeItems: "center",
              borderRadius: "50%",
              background: colors.greenSoft,
              fontSize: "30px",
            }}
          >
            🍽️
          </div>

          <h2
            style={{
              margin: "18px 0 0",
              fontSize: "26px",
              color: colors.text,
            }}
          >
            No recipes saved yet
          </h2>

          <p
            style={{
              maxWidth: "520px",
              margin: "10px auto 0",
              color: colors.muted,
              fontSize: "14px",
              lineHeight: 1.6,
            }}
          >
            Create your first recipe and it will appear here in the
            WonderfulLife Recipe Library.
          </p>

          <Link
            href="/studio/recipes/new"
            style={{
              ...createButtonStyle,
              display: "inline-flex",
              marginTop: "22px",
            }}
          >
            Create Your First Recipe
          </Link>
        </section>
      ) : (
        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "16px",
          }}
        >
          {recipeList.map((recipe) => {
            const lastUpdated = new Date(
              recipe.updated_at || recipe.created_at
            ).toLocaleDateString("en-CA", {
              year: "numeric",
              month: "short",
              day: "numeric",
            });

            const isPublished = recipe.status === "published";

            return (
              <article
                key={recipe.id}
                style={{
                  overflow: "hidden",
                  border: `1px solid ${colors.border}`,
                  borderRadius: "15px",
                  background: colors.panel,
                }}
              >
                <div
                  style={{
                    position: "relative",
                    aspectRatio: "16 / 9",
                    overflow: "hidden",
                    background: "#edf1eb",
                  }}
                >
                  {recipe.image_url ? (
                    <img
                      src={recipe.image_url}
                      alt={recipe.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        display: "grid",
                        width: "100%",
                        height: "100%",
                        placeItems: "center",
                        fontSize: "42px",
                      }}
                    >
                      🍳
                    </div>
                  )}

                  <div
                    style={{
                      position: "absolute",
                      top: "12px",
                      left: "12px",
                      display: "flex",
                      gap: "7px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        padding: "5px 9px",
                        borderRadius: "999px",
                        background: isPublished
                          ? colors.greenSoft
                          : colors.yellowSoft,
                        color: isPublished
                          ? colors.green
                          : colors.yellowText,
                        fontSize: "10px",
                        fontWeight: 900,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                      }}
                    >
                      {isPublished ? "Published" : "Draft"}
                    </span>

                    {recipe.featured ? (
                      <span
                        style={{
                          padding: "5px 9px",
                          borderRadius: "999px",
                          background: "#ffffff",
                          color: colors.green,
                          fontSize: "10px",
                          fontWeight: 900,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                        }}
                      >
                        Featured
                      </span>
                    ) : null}
                  </div>
                </div>

                <div style={{ padding: "18px" }}>
                  <p
                    style={{
                      margin: 0,
                      color: colors.green,
                      fontSize: "11px",
                      fontWeight: 900,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    {recipe.category || "Recipe"}
                  </p>

                  <h2
                    style={{
                      margin: "8px 0 0",
                      color: colors.text,
                      fontSize: "21px",
                      lineHeight: 1.3,
                    }}
                  >
                    {recipe.title}
                  </h2>

                  <p
                    style={{
                      minHeight: "66px",
                      margin: "10px 0 0",
                      color: colors.muted,
                      fontSize: "13px",
                      lineHeight: 1.6,
                    }}
                  >
                    {recipe.excerpt ||
                      "No recipe description was added."}
                  </p>

                  <p
                    style={{
                      margin: "14px 0 0",
                      color: colors.muted,
                      fontSize: "11px",
                    }}
                  >
                    Last updated {lastUpdated}
                  </p>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isPublished
                        ? "repeat(2, minmax(0, 1fr))"
                        : "1fr",
                      gap: "8px",
                      marginTop: "16px",
                    }}
                  >
                    <Link
                      href={`/studio/recipes/edit/${recipe.id}`}
                      style={editButtonStyle}
                    >
                      Edit Recipe
                    </Link>

                    {isPublished ? (
                      <Link
                        href={`/recipes/${recipe.slug}`}
                        style={viewButtonStyle}
                      >
                        View Recipe
                      </Link>
                    ) : null}

                    <DeleteRecipeButton
                      recipeId={recipe.id}
                      recipeTitle={recipe.title}
                      action={deleteRecipeAction}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div
      style={{
        padding: "16px",
        border: `1px solid ${colors.border}`,
        borderRadius: "13px",
        background: colors.panel,
      }}
    >
      <p
        style={{
          margin: 0,
          color: colors.muted,
          fontSize: "10px",
          fontWeight: 900,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </p>

      <p
        style={{
          margin: "7px 0 0",
          color: colors.text,
          fontSize: "28px",
          fontWeight: 900,
        }}
      >
        {value}
      </p>
    </div>
  );
}

const eyebrowStyle = {
  margin: 0,
  color: colors.green,
  fontSize: "11px",
  fontWeight: 900,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
} as const;

const createButtonStyle = {
  alignItems: "center",
  justifyContent: "center",
  padding: "11px 15px",
  border: "none",
  borderRadius: "9px",
  background: colors.green,
  color: "#ffffff",
  fontSize: "13px",
  fontWeight: 900,
  textDecoration: "none",
} as const;

const editButtonStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px 12px",
  borderRadius: "8px",
  background: colors.green,
  color: "#ffffff",
  fontSize: "12px",
  fontWeight: 900,
  textDecoration: "none",
} as const;

const viewButtonStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px 12px",
  border: `1px solid ${colors.border}`,
  borderRadius: "8px",
  background: "#ffffff",
  color: colors.green,
  fontSize: "12px",
  fontWeight: 900,
  textDecoration: "none",
} as const;