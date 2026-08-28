import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";

import ContentIntelligenceFields from "@/components/content/ContentIntelligenceFields";
import FeaturedImageUpload from "@/components/studio/articles/FeaturedImageUpload";
import RichTextEditor from "@/components/studio/articles/RichTextEditor";
import { updateContentAction } from "@/lib/actions/content";
import { createClient } from "@/lib/supabase/server";

type EditArticlePageProps = {
  params: Promise<{
    id: string;
  }>;
};

type Article = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string | null;
  category: string | null;
  status: string;
  featured: boolean | null;
  image_url: string | null;
  video_url: string | null;
  tags: string[] | null;
  reading_minutes: number | null;
  primary_section: string | null;
  topic: string | null;
};

type Topic = {
  id: number;
  name: string;
  slug: string;
  primary_section: string;
  active: boolean;
};

type Tag = {
  id: number;
  name: string;
  slug: string;
  category: string | null;
  active: boolean;
};

const colors = {
  page: "#f4f7f2",
  card: "#ffffff",
  green: "#246b40",
  darkGreen: "#173d29",
  muted: "#718077",
  border: "#dbe4da",
  softGreen: "#edf5ed",
};

const cardStyle: CSSProperties = {
  overflow: "hidden",
  border: `1px solid ${colors.border}`,
  borderRadius: "18px",
  background: colors.card,
  boxShadow: "0 8px 24px rgba(30, 73, 46, 0.06)",
};

const labelStyle: CSSProperties = {
  display: "block",
  marginBottom: "8px",
  color: "#294c36",
  fontSize: "14px",
  fontWeight: 700,
};

const inputStyle: CSSProperties = {
  boxSizing: "border-box",
  width: "100%",
  padding: "13px 15px",
  border: `1px solid ${colors.border}`,
  borderRadius: "11px",
  background: "#ffffff",
  color: colors.darkGreen,
  fontFamily: "inherit",
  fontSize: "15px",
  outline: "none",
};

const sectionLabelStyle: CSSProperties = {
  margin: 0,
  color: "#2b7748",
  fontSize: "11px",
  fontWeight: 800,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
};

const buttonStyle: CSSProperties = {
  padding: "12px 20px",
  borderRadius: "11px",
  fontFamily: "inherit",
  fontSize: "14px",
  fontWeight: 800,
  cursor: "pointer",
};

export default async function EditArticlePage({
  params,
}: EditArticlePageProps) {
  const { id } = await params;
  const articleId = Number(id);

  if (!articleId) {
    notFound();
  }

  const supabase = await createClient();

  const [
    { data: articleData, error: articleError },
    { data: topicData, error: topicError },
    { data: tagData, error: tagError },
  ] = await Promise.all([
    supabase
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
          video_url,
          tags,
          reading_minutes,
          primary_section,
          topic
        `
      )
      .eq("id", articleId)
      .eq("type", "article")
      .single(),

    supabase
      .from("content_topics")
      .select(
        `
          id,
          name,
          slug,
          primary_section,
          active
        `
      )
      .eq("active", true)
      .order("primary_section")
      .order("name"),

    supabase
      .from("content_tags")
      .select(
        `
          id,
          name,
          slug,
          category,
          active
        `
      )
      .eq("active", true)
      .order("category")
      .order("name"),
  ]);

  if (articleError || !articleData) {
    notFound();
  }

  const article = articleData as Article;
  const topics = (topicData || []) as Topic[];
  const tags = (tagData || []) as Tag[];

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "34px 38px 60px",
        background: colors.page,
      }}
    >
      <form action={updateContentAction}>
        <input type="hidden" name="id" value={article.id} />
        <input type="hidden" name="type" value="article" />

        <input
          type="hidden"
          name="video_url"
          value={article.video_url || ""}
        />

        <div style={{ maxWidth: "1480px", margin: "0 auto" }}>
          <header
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "24px",
              marginBottom: "28px",
            }}
          >
            <div>
              <Link
                href="/studio/articles"
                style={{
                  display: "inline-block",
                  marginBottom: "18px",
                  color: "#496a55",
                  fontSize: "14px",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                ← Back to Articles
              </Link>

              <p style={sectionLabelStyle}>
                WonderfulLife Studio
              </p>

              <h1
                style={{
                  margin: "8px 0 0",
                  color: colors.darkGreen,
                  fontSize: "40px",
                  lineHeight: 1.1,
                  letterSpacing: "-0.03em",
                }}
              >
                Edit Article
              </h1>

              <p
                style={{
                  maxWidth: "720px",
                  margin: "12px 0 0",
                  color: colors.muted,
                  fontSize: "15px",
                  lineHeight: 1.7,
                }}
              >
                Update this article, its classification, and
                publication settings on WonderfulLife.ca.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                paddingTop: "32px",
              }}
            >
              <button
                type="button"
                style={{
                  ...buttonStyle,
                  border: `1px solid ${colors.border}`,
                  background: "#ffffff",
                  color: "#31523c",
                }}
              >
                Preview
              </button>

              <button
                type="submit"
                name="status"
                value={article.status}
                style={{
                  ...buttonStyle,
                  border: "1px solid #bcd2c0",
                  background: "#eaf3ea",
                  color: colors.green,
                }}
              >
                Save Changes
              </button>

              <button
                type="submit"
                name="status"
                value="published"
                style={{
                  ...buttonStyle,
                  padding: "12px 22px",
                  border: "none",
                  background: colors.green,
                  color: "#ffffff",
                  boxShadow:
                    "0 8px 18px rgba(36, 107, 64, 0.2)",
                }}
              >
                Publish Article
              </button>
            </div>
          </header>

          {topicError || tagError ? (
            <div
              style={{
                marginBottom: "24px",
                padding: "16px 18px",
                border: "1px solid #ebcaca",
                borderRadius: "12px",
                background: "#fff3f3",
                color: "#9f3838",
                fontSize: "13px",
                fontWeight: 700,
              }}
            >
              Content Intelligence could not be loaded:{" "}
              {topicError?.message || tagError?.message}
            </div>
          ) : null}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(0, 1fr) minmax(300px, 360px)",
              alignItems: "start",
              gap: "24px",
            }}
          >
            <section
              style={{
                display: "flex",
                minWidth: 0,
                flexDirection: "column",
                gap: "24px",
              }}
            >
              <div
                style={{
                  ...cardStyle,
                  padding: "26px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "16px",
                    marginBottom: "24px",
                  }}
                >
                  <div>
                    <p style={sectionLabelStyle}>
                      Article Details
                    </p>

                    <h2
                      style={{
                        margin: "6px 0 0",
                        color: colors.darkGreen,
                        fontSize: "22px",
                      }}
                    >
                      Update the essentials
                    </h2>
                  </div>

                  <span
                    style={{
                      padding: "6px 12px",
                      borderRadius: "999px",
                      background: colors.softGreen,
                      color: "#34754b",
                      fontSize: "12px",
                      fontWeight: 800,
                      textTransform: "capitalize",
                    }}
                  >
                    {article.status}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                  }}
                >
                  <div>
                    <label
                      htmlFor="article-title"
                      style={labelStyle}
                    >
                      Article title
                    </label>

                    <input
                      id="article-title"
                      name="title"
                      type="text"
                      required
                      defaultValue={article.title}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="article-slug"
                      style={labelStyle}
                    >
                      URL slug
                    </label>

                    <div
                      style={{
                        display: "flex",
                        overflow: "hidden",
                        border: `1px solid ${colors.border}`,
                        borderRadius: "11px",
                        background: "#ffffff",
                      }}
                    >
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          padding: "0 14px",
                          borderRight: `1px solid ${colors.border}`,
                          background: "#f4f7f3",
                          color: colors.muted,
                          fontSize: "13px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        wonderfullife.ca/articles/
                      </span>

                      <input
                        id="article-slug"
                        name="slug"
                        type="text"
                        required
                        defaultValue={article.slug}
                        style={{
                          minWidth: 0,
                          flex: 1,
                          padding: "13px 14px",
                          border: "none",
                          color: colors.darkGreen,
                          fontFamily: "inherit",
                          fontSize: "14px",
                          outline: "none",
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="article-excerpt"
                      style={labelStyle}
                    >
                      Short description
                    </label>

                    <textarea
                      id="article-excerpt"
                      name="excerpt"
                      rows={4}
                      defaultValue={article.excerpt || ""}
                      style={{
                        ...inputStyle,
                        resize: "vertical",
                        lineHeight: 1.6,
                      }}
                    />
                  </div>
                </div>
              </div>

              <ContentIntelligenceFields
                topics={topics}
                tags={tags}
                defaultPrimarySection={
                  article.primary_section ||
                  article.category ||
                  "Wellness"
                }
                defaultTopic={article.topic || ""}
                defaultTags={article.tags || []}
              />

              <div style={cardStyle}>
                <div
                  style={{
                    padding: "22px 26px",
                    borderBottom: `1px solid ${colors.border}`,
                  }}
                >
                  <p style={sectionLabelStyle}>
                    Article Content
                  </p>

                  <h2
                    style={{
                      margin: "6px 0 0",
                      color: colors.darkGreen,
                      fontSize: "22px",
                    }}
                  >
                    Edit your article
                  </h2>

                  <p
                    style={{
                      margin: "8px 0 0",
                      color: colors.muted,
                      fontSize: "13px",
                      lineHeight: 1.6,
                    }}
                  >
                    Update headings, lists, quotations,
                    links, and formatted text.
                  </p>
                </div>

                <div
                  style={{
                    padding: "24px 26px 26px",
                  }}
                >
                  <RichTextEditor
                    initialContent={article.body || ""}
                  />
                </div>
              </div>
            </section>

            <aside
              style={{
                display: "flex",
                minWidth: 0,
                flexDirection: "column",
                gap: "24px",
              }}
            >
              <div
                style={{
                  ...cardStyle,
                  padding: "22px",
                }}
              >
                <p style={sectionLabelStyle}>
                  Featured Image
                </p>

                <h2
                  style={{
                    margin: "6px 0 0",
                    color: colors.darkGreen,
                    fontSize: "20px",
                  }}
                >
                  Article cover
                </h2>

                {article.image_url ? (
                  <div
                    style={{
                      marginTop: "18px",
                      overflow: "hidden",
                      borderRadius: "14px",
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={article.image_url}
                      alt={article.title}
                      style={{
                        width: "100%",
                        aspectRatio: "16 / 9",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  </div>
                ) : null}

                <FeaturedImageUpload
                  initialImageUrl={article.image_url || ""}
                />
              </div>

              <div
                style={{
                  ...cardStyle,
                  padding: "22px",
                }}
              >
                <p style={sectionLabelStyle}>
                  Organization
                </p>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "19px",
                    marginTop: "18px",
                  }}
                >
                  <div>
                    <label
                      htmlFor="category"
                      style={labelStyle}
                    >
                      Legacy Category
                    </label>

                    <select
                      id="category"
                      name="category"
                      defaultValue={
                        article.category || "Wellness"
                      }
                      style={inputStyle}
                    >
                      <option value="Wellness">
                        Wellness
                      </option>

                      <option value="Nutrition">
                        Nutrition
                      </option>

                      <option value="Healthy Living">
                        Healthy Living
                      </option>

                      <option value="Fitness">
                        Fitness
                      </option>

                      <option value="Mindset">
                        Mindset
                      </option>

                      <option value="Community">
                        Community
                      </option>
                    </select>

                    <p
                      style={{
                        margin: "7px 0 0",
                        color: colors.muted,
                        fontSize: "12px",
                        lineHeight: 1.5,
                      }}
                    >
                      Kept temporarily for compatibility
                      with existing WonderfulLife content.
                    </p>
                  </div>

                  <label
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "11px",
                      padding: "14px",
                      border: `1px solid ${colors.border}`,
                      borderRadius: "12px",
                      background: "#fafcf9",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      name="featured"
                      defaultChecked={Boolean(
                        article.featured
                      )}
                      style={{
                        marginTop: "3px",
                        accentColor: colors.green,
                      }}
                    />

                    <span>
                      <strong
                        style={{
                          display: "block",
                          color: "#294c36",
                          fontSize: "14px",
                        }}
                      >
                        Feature this article
                      </strong>

                      <span
                        style={{
                          display: "block",
                          marginTop: "4px",
                          color: colors.muted,
                          fontSize: "12px",
                          lineHeight: 1.5,
                        }}
                      >
                        Display it in featured areas of
                        WonderfulLife.ca.
                      </span>
                    </span>
                  </label>
                </div>
              </div>

              <div
                style={{
                  ...cardStyle,
                  padding: "22px",
                }}
              >
                <p style={sectionLabelStyle}>
                  Article Information
                </p>

                <div
                  style={{
                    marginTop: "18px",
                    padding: "14px",
                    border: `1px solid ${colors.border}`,
                    borderRadius: "12px",
                    background: "#fafcf9",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      color: "#294c36",
                      fontSize: "13px",
                      fontWeight: 800,
                    }}
                  >
                    Article ID
                  </p>

                  <p
                    style={{
                      margin: "5px 0 0",
                      color: colors.muted,
                      fontSize: "13px",
                    }}
                  >
                    {article.id}
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </form>
    </main>
  );
}