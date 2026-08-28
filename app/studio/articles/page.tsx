import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DeleteArticleButton from "./DeleteArticleButton";
import "./articles-library.css";

type ContentStatus =
  | "draft"
  | "in_review"
  | "approved"
  | "rejected"
  | "scheduled"
  | "published"
  | "archived";

type Article = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string | null;
  category: string | null;
  status: ContentStatus | string;
  featured: boolean | null;
  image_url: string | null;
  tags: string[] | null;
  reading_minutes: number | null;
  created_at: string | null;
  updated_at: string | null;
  published_at?: string | null;
};

type StudioArticlesPageProps = {
  searchParams?: Promise<{
    message?: string;
    q?: string;
    status?: string;
  }>;
};

function formatDate(value: string | null) {
  if (!value) {
    return "Recently updated";
  }

  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    draft: "Draft",
    in_review: "In Review",
    approved: "Approved",
    rejected: "Rejected",
    scheduled: "Scheduled",
    published: "Published",
    archived: "Archived",
  };

  return labels[status] || status;
}

function getStatusClass(status: string) {
  if (status === "published") {
    return "published";
  }

  if (status === "draft") {
    return "draft";
  }

  return "workflow";
}

async function deleteArticleAction(formData: FormData) {
  "use server";

  const articleId = Number(formData.get("article_id"));
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  if (!articleId) {
    redirect(
      `/studio/articles?message=${encodeURIComponent(
        "The article ID is missing."
      )}`
    );
  }

  const { error } = await supabase
    .from("content_items")
    .delete()
    .eq("id", articleId)
    .eq("type", "article")
    .eq("created_by", user.id);

  if (error) {
    redirect(
      `/studio/articles?message=${encodeURIComponent(error.message)}`
    );
  }

  redirect(
    `/studio/articles?message=${encodeURIComponent(
      "Article deleted successfully."
    )}`
  );
}

export default async function StudioArticlesPage({
  searchParams,
}: StudioArticlesPageProps) {
  const params = (await searchParams) || {};
  const searchTerm = String(params.q || "").trim();
  const statusFilter = String(params.status || "all");
  const message = String(params.message || "");

  const supabase = await createClient();

  let query = supabase
    .from("content_items")
    .select(
      `
        id,
        title,
        slug,
        excerpt,
        body,
        category,
        status,
        featured,
        image_url,
        tags,
        reading_minutes,
        created_at,
        updated_at,
        published_at
      `
    )
    .eq("type", "article")
    .order("updated_at", {
      ascending: false,
      nullsFirst: false,
    });

  if (statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  if (searchTerm) {
    query = query.or(
      `title.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%,excerpt.ilike.%${searchTerm}%`
    );
  }

  const { data, error } = await query;

  const articles = (data || []) as Article[];

  const { count: publishedCount } = await supabase
    .from("content_items")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("type", "article")
    .eq("status", "published");

  const { count: draftCount } = await supabase
    .from("content_items")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("type", "article")
    .eq("status", "draft");

  const { count: featuredCount } = await supabase
    .from("content_items")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("type", "article")
    .eq("featured", true);

  return (
    <main className="articles-library">
      <header className="articles-library__header">
        <div>
          <p className="articles-library__eyebrow">
            WonderfulLife Content Studio
          </p>

          <h1>Articles</h1>

          <p>
            Create, manage, edit, and publish WonderfulLife articles.
          </p>
        </div>

        <Link
          href="/studio/articles/new"
          className="articles-library__new-button"
        >
          + New Article
        </Link>
      </header>

      {message ? (
        <div
          style={{
            marginTop: "24px",
            padding: "14px 18px",
            border: "1px solid #bdd8c2",
            borderRadius: "12px",
            background: "#edf7ee",
            color: "#245f39",
            fontSize: "14px",
            fontWeight: 700,
          }}
        >
          {message}
        </div>
      ) : null}

      {error ? (
        <div
          style={{
            marginTop: "24px",
            padding: "14px 18px",
            border: "1px solid #edcccc",
            borderRadius: "12px",
            background: "#fff4f4",
            color: "#a13f3f",
            fontSize: "14px",
            fontWeight: 700,
          }}
        >
          The Articles Library could not be loaded: {error.message}
        </div>
      ) : null}

      <section className="articles-library__stats">
        <div>
          <strong>{publishedCount || 0}</strong>
          <span>Published</span>
        </div>

        <div>
          <strong>{draftCount || 0}</strong>
          <span>Drafts</span>
        </div>

        <div>
          <strong>{featuredCount || 0}</strong>
          <span>Featured</span>
        </div>
      </section>

      <section className="articles-library__content">
        <div className="articles-library__section-heading">
          <div>
            <p>Library</p>
            <h2>All Articles</h2>
          </div>
        </div>

        <form
          action="/studio/articles"
          method="get"
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "12px",
            margin: "24px 0",
          }}
        >
          <input
            type="search"
            name="q"
            defaultValue={searchTerm}
            placeholder="Search articles by title, category, or description..."
            className="articles-library__search"
            style={{ margin: 0 }}
          />

          <select
            name="status"
            defaultValue={statusFilter}
            aria-label="Filter articles by status"
            style={{
              minHeight: "52px",
              padding: "0 16px",
              border: "1px solid #d9e3d5",
              borderRadius: "12px",
              background: "#ffffff",
              color: "#31523c",
              fontFamily: "inherit",
              fontSize: "14px",
              fontWeight: 700,
            }}
          >
            <option value="all">All statuses</option>
            <option value="draft">Drafts</option>
            <option value="published">Published</option>
            <option value="in_review">In Review</option>
            <option value="scheduled">Scheduled</option>
            <option value="archived">Archived</option>
          </select>

          <button
            type="submit"
            style={{
              minHeight: "52px",
              padding: "0 20px",
              border: "1px solid #28633f",
              borderRadius: "12px",
              background: "#28633f",
              color: "#ffffff",
              fontFamily: "inherit",
              fontSize: "14px",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Search
          </button>

          {(searchTerm || statusFilter !== "all") && (
            <Link
              href="/studio/articles"
              style={{
                minHeight: "52px",
                padding: "0 18px",
                border: "1px solid #d9e3d5",
                borderRadius: "12px",
                background: "#ffffff",
                color: "#31523c",
                display: "inline-flex",
                alignItems: "center",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: 800,
              }}
            >
              Clear
            </Link>
          )}
        </form>

        {!error && articles.length === 0 ? (
          <div className="articles-library__empty">
            <span>📝</span>

            <h3>No matching articles</h3>

            <p>
              Create a new article or adjust your search and status filter.
            </p>

            <Link href="/studio/articles/new">
              Create New Article
            </Link>
          </div>
        ) : (
          <div className="articles-library__grid">
            {articles.map((article) => {
              const previewText =
                article.excerpt?.trim() ||
                article.body?.trim() ||
                "No article description has been added yet.";

              return (
                <article
                  className="article-library-card"
                  key={article.id}
                >
                  <div className="article-library-card__image">
                    {article.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={article.image_url}
                        alt={article.title}
                      />
                    ) : (
                      <div>WonderfulLife Article</div>
                    )}
                  </div>

                  <div className="article-library-card__content">
                    <div className="article-library-card__meta">
                      <span>{article.category || "Wellness"}</span>

                      <span
                        className={getStatusClass(article.status)}
                      >
                        {getStatusLabel(article.status)}
                      </span>

                      {article.featured ? (
                        <span className="featured">Featured</span>
                      ) : null}
                    </div>

                    <h3>{article.title}</h3>

                    <p>
                      {previewText.length > 180
                        ? `${previewText.slice(0, 180)}...`
                        : previewText}
                    </p>

                    <small>
                      Updated{" "}
                      {formatDate(
                        article.updated_at || article.created_at
                      )}
                      {article.reading_minutes
                        ? ` · ${article.reading_minutes} min read`
                        : ""}
                    </small>

                    {article.tags && article.tags.length > 0 ? (
                      <small
                        style={{
                          display: "block",
                          marginTop: "7px",
                        }}
                      >
                        Tags: {article.tags.join(", ")}
                      </small>
                    ) : null}

                    <div className="article-library-card__actions">
                      <Link
                        href={`/studio/articles/edit/${article.id}`}
                        className="edit-button"
                        style={{
                          minHeight: "42px",
                          padding: "0 16px",
                          borderRadius: "9px",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#ffffff",
                          background: "#28633f",
                          border: "1px solid #28633f",
                          textDecoration: "none",
                          fontWeight: 800,
                        }}
                      >
                        Edit Article
                      </Link>

                      {article.status === "published" ? (
                        <Link
                          href={`/articles/${article.slug}`}
                          target="_blank"
                          style={{
                            minHeight: "42px",
                            padding: "0 16px",
                            border: "1px solid #d7e3d2",
                            borderRadius: "9px",
                            background: "#eef4eb",
                            color: "#285b3b",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            textDecoration: "none",
                            fontWeight: 800,
                          }}
                        >
                          View Article
                        </Link>
                      ) : null}

                      <DeleteArticleButton
                        articleId={article.id}
                        articleTitle={article.title}
                        action={deleteArticleAction}
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}