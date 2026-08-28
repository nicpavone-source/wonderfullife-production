import Link from "next/link";
import type { CSSProperties } from "react";

import ContentIntelligenceFields from "@/components/content/ContentIntelligenceFields";
import FeaturedImageUpload from "@/components/studio/articles/FeaturedImageUpload";
import RichTextEditor from "@/components/studio/articles/RichTextEditor";
import { createContentAction } from "@/lib/actions/content";
import { createClient } from "@/lib/supabase/server";

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

export default async function NewArticlePage() {
  const supabase = await createClient();

  const [
    { data: topicData, error: topicError },
    { data: tagData, error: tagError },
  ] = await Promise.all([
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
      <form action={createContentAction}>
        <input type="hidden" name="type" value="article" />
        <input type="hidden" name="image_url" value="" />
        <input type="hidden" name="video_url" value="" />

        <div
          style={{
            maxWidth: "1480px",
            margin: "0 auto",
          }}
        >
          {/* PAGE HEADER */}

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
                Create New Article
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
                Write, organize, classify, and prepare your
                article for publication on WonderfulLife.ca.
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
                value="draft"
                style={{
                  ...buttonStyle,
                  border: "1px solid #bcd2c0",
                  background: "#eaf3ea",
                  color: colors.green,
                }}
              >
                Save Draft
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

          {/* DATABASE WARNING */}

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

          {/* MAIN GRID */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(0, 1fr) minmax(300px, 360px)",
              alignItems: "start",
              gap: "24px",
            }}
          >
            {/* LEFT COLUMN */}

            <section
              style={{
                display: "flex",
                minWidth: 0,
                flexDirection: "column",
                gap: "24px",
              }}
            >
              {/* ARTICLE DETAILS */}

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
                      Start with the essentials
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
                    }}
                  >
                    Draft
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
                      placeholder="Enter a clear, engaging article title"
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
                        placeholder="Leave blank to generate from title"
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

                    <p
                      style={{
                        margin: "7px 0 0",
                        color: colors.muted,
                        fontSize: "12px",
                      }}
                    >
                      Leave this blank and the URL will be
                      generated from the article title.
                    </p>
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
                      placeholder="Write a short summary that introduces the article to readers."
                      style={{
                        ...inputStyle,
                        resize: "vertical",
                        lineHeight: 1.6,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* CONTENT INTELLIGENCE */}

              <ContentIntelligenceFields
                topics={topics}
                tags={tags}
                defaultPrimarySection="Wellness"
              />

              {/* ARTICLE BODY */}

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
                    Write your article
                  </h2>

                  <p
                    style={{
                      margin: "8px 0 0",
                      color: colors.muted,
                      fontSize: "13px",
                      lineHeight: 1.6,
                    }}
                  >
                    Add headings, lists, quotations, links,
                    and formatted text.
                  </p>
                </div>

                <div
                  style={{
                    padding: "24px 26px 26px",
                  }}
                >
                  <RichTextEditor />
                </div>
              </div>
            </section>

            {/* RIGHT COLUMN */}

            <aside
              style={{
                display: "flex",
                minWidth: 0,
                flexDirection: "column",
                gap: "24px",
              }}
            >
              {/* FEATURED IMAGE */}

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

                <FeaturedImageUpload />
              </div>

              {/* ORGANIZATION */}

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
                      defaultValue="Wellness"
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

              {/* SEO */}

              <div
                style={{
                  ...cardStyle,
                  padding: "22px",
                }}
              >
                <p style={sectionLabelStyle}>
                  Search Preview
                </p>

                <h2
                  style={{
                    margin: "6px 0 0",
                    color: colors.darkGreen,
                    fontSize: "20px",
                  }}
                >
                  SEO settings
                </h2>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "18px",
                    marginTop: "18px",
                  }}
                >
                  <div>
                    <label
                      htmlFor="seo-title"
                      style={labelStyle}
                    >
                      SEO title
                    </label>

                    <input
                      id="seo-title"
                      name="seo_title"
                      type="text"
                      placeholder="Search engine title"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="seo-description"
                      style={labelStyle}
                    >
                      Meta description
                    </label>

                    <textarea
                      id="seo-description"
                      name="seo_description"
                      rows={5}
                      placeholder="Describe this article for search engines."
                      style={{
                        ...inputStyle,
                        resize: "vertical",
                        lineHeight: 1.6,
                      }}
                    />
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </form>
    </main>
  );
}