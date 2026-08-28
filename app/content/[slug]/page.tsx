"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useParams } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type ContentItem = {
  id: number;
  type: string;
  title: string;
  slug: string;
  excerpt: string | null;
  summary: string | null;
  body: string | null;
  category: string | null;
  author: string | null;
  image_url: string | null;
  video_url: string | null;
  tags: string[] | null;
  reading_minutes: number | null;
  published_at: string | null;
  featured: boolean | null;
};

type RecipeSections = {
  details: string[];
  ingredients: string[];
  instructions: string[];
  nutrition: string[];
  gallery: string[];
};

/*
 * ---------------------------------------------------------
 * VIDEO
 * ---------------------------------------------------------
 */

function getVideoEmbedUrl(videoUrl: string | null) {
  if (!videoUrl) return null;

  try {
    const url = new URL(videoUrl);

    if (url.hostname.includes("youtube.com")) {
      const videoId = url.searchParams.get("v");

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }

      if (url.pathname.startsWith("/embed/")) {
        return videoUrl;
      }
    }

    if (url.hostname.includes("youtu.be")) {
      const videoId = url.pathname.replace("/", "");

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    if (url.hostname.includes("vimeo.com")) {
      const videoId = url.pathname
        .split("/")
        .filter(Boolean)
        .pop();

      if (videoId) {
        return `https://player.vimeo.com/video/${videoId}`;
      }
    }

    return null;
  } catch {
    return null;
  }
}

/*
 * ---------------------------------------------------------
 * RECIPE BODY
 * ---------------------------------------------------------
 */

function normalizeHeading(value: string) {
  return value
    .replace(/^#+\s*/, "")
    .trim()
    .toLowerCase();
}

function parseRecipeBody(
  body: string | null
): RecipeSections {
  const sections: RecipeSections = {
    details: [],
    ingredients: [],
    instructions: [],
    nutrition: [],
    gallery: [],
  };

  if (!body) return sections;

  const lines = body.split(/\r?\n/);

  let current:
    | keyof RecipeSections
    | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) continue;

    if (line.startsWith("#")) {
      const heading =
        normalizeHeading(line);

      if (heading === "recipe details") {
        current = "details";
      } else if (
        heading === "ingredients"
      ) {
        current = "ingredients";
      } else if (
        heading === "instructions"
      ) {
        current = "instructions";
      } else if (
        heading === "nutrition"
      ) {
        current = "nutrition";
      } else if (
        heading === "gallery"
      ) {
        current = "gallery";
      } else {
        current = null;
      }

      continue;
    }

    if (current) {
      sections[current].push(line);
    }
  }

  sections.ingredients =
    sections.ingredients.map((line) =>
      line
        .replace(/^[-•]\s*/, "")
        .trim()
    );

  sections.instructions =
    sections.instructions.map((line) =>
      line
        .replace(/^\d+\.\s*/, "")
        .trim()
    );

  sections.gallery =
    sections.gallery.filter(
      (line) =>
        line !==
          "No additional images" &&
        (line.startsWith("http://") ||
          line.startsWith("https://"))
    );

  return sections;
}

function parseLabelValue(line: string) {
  const separator =
    line.indexOf(":");

  if (separator === -1) {
    return {
      label: line,
      value: "",
    };
  }

  return {
    label: line
      .slice(0, separator)
      .trim(),

    value: line
      .slice(separator + 1)
      .trim(),
  };
}

/*
 * ---------------------------------------------------------
 * ARTICLE MARKDOWN
 * ---------------------------------------------------------
 *
 * WonderfulLife stores clean Markdown-style text.
 *
 * This renderer supports:
 *
 * ## headings
 * ### subheadings
 * **bold**
 * *italic*
 * [links](url)
 * bullets
 * numbered lists
 * blockquotes
 * Markdown tables
 *
 * without dangerouslySetInnerHTML.
 */

function renderInlineMarkdown(
  text: string
): ReactNode[] {
  const pattern =
    /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;

  const parts =
    text.split(pattern);

  return parts.map(
    (part, index) => {
      /*
       * Bold
       */
      if (
        part.startsWith("**") &&
        part.endsWith("**")
      ) {
        return (
          <strong key={index}>
            {part.slice(2, -2)}
          </strong>
        );
      }

      /*
       * Italic
       */
      if (
        part.startsWith("*") &&
        part.endsWith("*") &&
        !part.startsWith("**")
      ) {
        return (
          <em key={index}>
            {part.slice(1, -1)}
          </em>
        );
      }

      /*
       * Markdown link
       */
      const linkMatch =
        part.match(
          /^\[([^\]]+)\]\(([^)]+)\)$/
        );

      if (linkMatch) {
        return (
          <a
            key={index}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
          >
            {linkMatch[1]}
          </a>
        );
      }

      return part;
    }
  );
}

function isTableDivider(
  line: string
) {
  const cells = line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());

  return (
    cells.length > 0 &&
    cells.every((cell) =>
      /^:?-{3,}:?$/.test(cell)
    )
  );
}

function splitTableRow(
  line: string
) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function ArticleMarkdown({
  body,
}: {
  body: string;
}) {
  const normalized = body
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\u00a0/g, " ");

  const lines =
    normalized.split("\n");

  const output:
    ReactNode[] = [];

  let index = 0;

  while (index < lines.length) {
    const line =
      lines[index].trim();

    /*
     * Blank line
     */
    if (!line) {
      index += 1;
      continue;
    }

    /*
     * H3
     */
    if (
      line.startsWith("### ")
    ) {
      output.push(
        <h3
          key={`h3-${index}`}
          className="wl-md-h3"
        >
          {renderInlineMarkdown(
            line.replace(
              /^###\s+/,
              ""
            )
          )}
        </h3>
      );

      index += 1;
      continue;
    }

    /*
     * H2
     */
    if (
      line.startsWith("## ")
    ) {
      output.push(
        <h2
          key={`h2-${index}`}
          className="wl-md-h2"
        >
          {renderInlineMarkdown(
            line.replace(
              /^##\s+/,
              ""
            )
          )}
        </h2>
      );

      index += 1;
      continue;
    }

    /*
     * Body H1 becomes H2 because
     * the public page already has
     * the article title as the H1.
     */
    if (
      line.startsWith("# ")
    ) {
      output.push(
        <h2
          key={`h1-as-h2-${index}`}
          className="wl-md-h2"
        >
          {renderInlineMarkdown(
            line.replace(
              /^#\s+/,
              ""
            )
          )}
        </h2>
      );

      index += 1;
      continue;
    }

    /*
     * Divider
     */
    if (
      line === "---" ||
      line === "***" ||
      line === "___"
    ) {
      output.push(
        <hr
          key={`hr-${index}`}
          className="wl-md-divider"
        />
      );

      index += 1;
      continue;
    }

    /*
     * Blockquote
     */
    if (
      line.startsWith("> ")
    ) {
      const quoteLines:
        string[] = [];

      while (
        index < lines.length &&
        lines[index]
          .trim()
          .startsWith("> ")
      ) {
        quoteLines.push(
          lines[index]
            .trim()
            .replace(
              /^>\s+/,
              ""
            )
        );

        index += 1;
      }

      output.push(
        <blockquote
          key={`quote-${index}`}
          className="wl-md-quote"
        >
          {quoteLines.map(
            (
              quote,
              quoteIndex
            ) => (
              <p
                key={quoteIndex}
              >
                {renderInlineMarkdown(
                  quote
                )}
              </p>
            )
          )}
        </blockquote>
      );

      continue;
    }

    /*
     * Markdown table
     */
    if (
      line.startsWith("|") &&
      index + 1 <
        lines.length &&
      isTableDivider(
        lines[index + 1]
      )
    ) {
      const header =
        splitTableRow(line);

      index += 2;

      const rows:
        string[][] = [];

      while (
        index < lines.length
      ) {
        const rowLine =
          lines[index].trim();

        if (
          !rowLine ||
          !rowLine.startsWith("|")
        ) {
          break;
        }

        rows.push(
          splitTableRow(
            rowLine
          )
        );

        index += 1;
      }

      output.push(
        <div
          key={`table-${index}`}
          className="wl-md-table-wrap"
        >
          <table className="wl-md-table">
            <thead>
              <tr>
                {header.map(
                  (
                    cell,
                    cellIndex
                  ) => (
                    <th
                      key={
                        cellIndex
                      }
                    >
                      {renderInlineMarkdown(
                        cell
                      )}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody>
              {rows.map(
                (
                  row,
                  rowIndex
                ) => (
                  <tr
                    key={
                      rowIndex
                    }
                  >
                    {header.map(
                      (
                        _,
                        cellIndex
                      ) => (
                        <td
                          key={
                            cellIndex
                          }
                        >
                          {renderInlineMarkdown(
                            row[
                              cellIndex
                            ] || ""
                          )}
                        </td>
                      )
                    )}
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      );

      continue;
    }

    /*
     * Bulleted list
     */
    if (
      /^[-•*]\s+/.test(
        line
      )
    ) {
      const listItems:
        string[] = [];

      while (
        index <
          lines.length &&
        /^[-•*]\s+/.test(
          lines[index].trim()
        )
      ) {
        listItems.push(
          lines[index]
            .trim()
            .replace(
              /^[-•*]\s+/,
              ""
            )
        );

        index += 1;
      }

      output.push(
        <ul
          key={`ul-${index}`}
          className="wl-md-list"
        >
          {listItems.map(
            (
              item,
              itemIndex
            ) => (
              <li
                key={
                  itemIndex
                }
              >
                {renderInlineMarkdown(
                  item
                )}
              </li>
            )
          )}
        </ul>
      );

      continue;
    }

    /*
     * Numbered list
     */
    if (
      /^\d+[.)]\s+/.test(
        line
      )
    ) {
      const listItems:
        string[] = [];

      while (
        index <
          lines.length &&
        /^\d+[.)]\s+/.test(
          lines[index].trim()
        )
      ) {
        listItems.push(
          lines[index]
            .trim()
            .replace(
              /^\d+[.)]\s+/,
              ""
            )
        );

        index += 1;
      }

      output.push(
        <ol
          key={`ol-${index}`}
          className="wl-md-list"
        >
          {listItems.map(
            (
              item,
              itemIndex
            ) => (
              <li
                key={
                  itemIndex
                }
              >
                {renderInlineMarkdown(
                  item
                )}
              </li>
            )
          )}
        </ol>
      );

      continue;
    }

    /*
     * Normal paragraph
     *
     * Stop when another Markdown
     * structure begins.
     */
    const paragraphLines =
      [line];

    index += 1;

    while (
      index < lines.length
    ) {
      const next =
        lines[index].trim();

      if (!next) {
        break;
      }

      if (
        next.startsWith("# ") ||
        next.startsWith("## ") ||
        next.startsWith("### ") ||
        next.startsWith("> ") ||
        /^[-•*]\s+/.test(
          next
        ) ||
        /^\d+[.)]\s+/.test(
          next
        ) ||
        next === "---" ||
        next === "***" ||
        next === "___" ||
        (
          next.startsWith(
            "|"
          ) &&
          index + 1 <
            lines.length &&
          isTableDivider(
            lines[index + 1]
          )
        )
      ) {
        break;
      }

      paragraphLines.push(
        next
      );

      index += 1;
    }

    output.push(
      <p
        key={`p-${index}`}
        className="wl-md-paragraph"
      >
        {renderInlineMarkdown(
          paragraphLines.join(
            " "
          )
        )}
      </p>
    );
  }

  return (
    <div className="wl-markdown">
      {output}
    </div>
  );
}

/*
 * ---------------------------------------------------------
 * PAGE
 * ---------------------------------------------------------
 */

export default function ContentPage() {
  const params =
    useParams<{
      slug: string;
    }>();

  const slug = params?.slug;

  const [
    item,
    setItem,
  ] =
    useState<ContentItem | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;

    async function loadContent() {
      setLoading(true);

      setErrorMessage("");

      const supabase =
        createClient();

      const {
        data,
        error,
      } = await supabase
        .from("content_items")
        .select(
          `
            id,
            type,
            title,
            slug,
            excerpt,
            summary,
            body,
            category,
            author,
            image_url,
            video_url,
            tags,
            reading_minutes,
            published_at,
            featured
          `
        )
        .eq("slug", slug)
        .eq(
          "status",
          "published"
        )
        .maybeSingle();

      if (cancelled) {
        return;
      }

      if (error) {
        console.error(error);

        setErrorMessage(
          error.message
        );

        setLoading(false);

        return;
      }

      setItem(data);

      setLoading(false);
    }

    loadContent();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const recipeSections =
    useMemo(
      () =>
        parseRecipeBody(
          item?.body || null
        ),
      [item?.body]
    );

  if (loading) {
    return (
      <main className="wl-article-page">
        <section className="wl-article-status">
          <p className="wl-studio-eyebrow">
            WonderfulLife
          </p>

          <h1>
            Loading content…
          </h1>
        </section>
      </main>
    );
  }

  if (
    errorMessage ||
    !item
  ) {
    return (
      <main className="wl-article-page">
        <section className="wl-article-status">
          <p className="wl-studio-eyebrow">
            WonderfulLife
          </p>

          <h1>
            Content not found
          </h1>

          <p>
            This content may have
            been removed,
            unpublished, or moved
            to a different address.
          </p>

          <Link
            className="wl-article-back"
            href="/"
          >
            ← Return Home
          </Link>
        </section>
      </main>
    );
  }

  const publishedDate =
    item.published_at
      ? new Intl.DateTimeFormat(
          "en-CA",
          {
            year: "numeric",
            month: "long",
            day: "numeric",
          }
        ).format(
          new Date(
            item.published_at
          )
        )
      : "";

  const backLink =
    item.type === "recipe"
      ? "/recipes/all"
      : item.type === "video"
        ? "/videos"
        : item.type ===
            "product"
          ? "/shop"
          : "/articles";

  const backLabel =
    item.type === "recipe"
      ? "Recipes"
      : item.type === "video"
        ? "Videos"
        : item.type ===
            "product"
          ? "Shop"
          : "Articles";

  const videoEmbedUrl =
    getVideoEmbedUrl(
      item.video_url
    );

  return (
    <main className="wl-article-page">
      <style>{`
        /*
         * WONDERFULLIFE MARKDOWN
         */

        .wl-markdown {
          color: #31463a;
          font-size: 18px;
          line-height: 1.82;
        }

        .wl-markdown .wl-md-paragraph {
          margin: 0 0 28px;
        }

        .wl-markdown .wl-md-h2 {
          margin: 52px 0 20px;
          color: #173d29;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(28px, 3vw, 34px);
          line-height: 1.18;
          letter-spacing: -0.025em;
        }

        .wl-markdown .wl-md-h3 {
          margin: 38px 0 16px;
          color: #1b4b32;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 25px;
          line-height: 1.25;
          letter-spacing: -0.018em;
        }

        .wl-markdown > .wl-md-h2:first-child,
        .wl-markdown > .wl-md-h3:first-child {
          margin-top: 0;
        }

        .wl-markdown strong {
          color: #173d29;
          font-weight: 800;
        }

        .wl-markdown em {
          color: #41594b;
        }

        .wl-markdown a {
          color: #216c41;
          font-weight: 700;
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        .wl-markdown .wl-md-list {
          margin: 4px 0 32px;
          padding-left: 28px;
        }

        .wl-markdown .wl-md-list li {
          margin-bottom: 13px;
          padding-left: 5px;
        }

        .wl-markdown .wl-md-list li::marker {
          color: #287244;
          font-weight: 900;
        }

        .wl-markdown .wl-md-quote {
          margin: 36px 0;
          padding: 22px 26px;
          border-left: 4px solid #2c7a4b;
          border-radius: 0 14px 14px 0;
          background: #f3f8f2;
          color: #365442;
        }

        .wl-markdown .wl-md-quote p {
          margin: 0;
        }

        .wl-markdown .wl-md-divider {
          margin: 40px 0;
          border: 0;
          border-top: 1px solid #dce5dc;
        }

        /*
         * MARKDOWN TABLE
         */

        .wl-md-table-wrap {
          width: 100%;
          margin: 28px 0 38px;
          overflow-x: auto;
          border: 1px solid #dbe5da;
          border-radius: 16px;
          background: #ffffff;
        }

        .wl-md-table {
          width: 100%;
          min-width: 700px;
          border-collapse: collapse;
          font-size: 15px;
          line-height: 1.55;
        }

        .wl-md-table th {
          padding: 15px 17px;
          border-bottom: 1px solid #d8e2d7;
          background: #eef5ed;
          color: #173d29;
          text-align: left;
          font-weight: 800;
          vertical-align: top;
        }

        .wl-md-table td {
          padding: 15px 17px;
          border-bottom: 1px solid #e6ece5;
          color: #3c5143;
          vertical-align: top;
        }

        .wl-md-table tbody tr:last-child td {
          border-bottom: 0;
        }

        .wl-md-table tbody tr:nth-child(even) {
          background: #fafcf9;
        }

        @media (max-width: 720px) {
          .wl-markdown {
            font-size: 17px;
            line-height: 1.78;
          }

          .wl-markdown .wl-md-h2 {
            margin-top: 42px;
            font-size: 28px;
          }

          .wl-markdown .wl-md-h3 {
            margin-top: 32px;
            font-size: 23px;
          }

          .wl-md-table {
            font-size: 14px;
          }
        }
      `}</style>

      {item.image_url && (
        <section className="wl-article-hero">
          <img
            src={item.image_url}
            alt={item.title}
          />
        </section>
      )}

      <article className="wl-article-container">
        <Link
          className="wl-article-back"
          href={backLink}
        >
          ← Back to {backLabel}
        </Link>

        <header className="wl-article-header">
          <p className="wl-studio-eyebrow">
            {item.category ||
              "WonderfulLife"}
          </p>

          <h1>
            {item.title}
          </h1>

          {(item.summary ||
            item.excerpt) && (
            <p className="wl-article-summary">
              {item.summary ||
                item.excerpt}
            </p>
          )}

          <div className="wl-article-meta">
            <span>
              {item.author ||
                "Zoey"}
            </span>

            {publishedDate && (
              <span>
                {publishedDate}
              </span>
            )}

            {item.type !==
              "video" &&
              item.reading_minutes && (
                <span>
                  {
                    item.reading_minutes
                  }{" "}
                  min read
                </span>
              )}

            {item.featured && (
              <span>
                Featured
              </span>
            )}
          </div>
        </header>

        {item.type ===
          "video" &&
          videoEmbedUrl && (
            <section
              style={{
                position:
                  "relative",
                width: "100%",
                paddingBottom:
                  "56.25%",
                marginBottom:
                  "32px",
                overflow:
                  "hidden",
                borderRadius:
                  "24px",
                backgroundColor:
                  "#000",
              }}
            >
              <iframe
                src={
                  videoEmbedUrl
                }
                title={item.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{
                  position:
                    "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  border: 0,
                }}
              />
            </section>
          )}

        {item.type ===
          "video" &&
          item.video_url &&
          !videoEmbedUrl && (
            <section
              style={{
                marginBottom:
                  "32px",
                padding: "24px",
                borderRadius:
                  "20px",
                backgroundColor:
                  "#f3f7f1",
              }}
            >
              <p>
                This video cannot be
                embedded directly.
              </p>

              <a
                href={
                  item.video_url
                }
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontWeight: 700,
                  color:
                    "#07573d",
                }}
              >
                Open video in a new
                window →
              </a>
            </section>
          )}

        {item.type ===
        "recipe" ? (
          <div
            style={{
              display: "grid",
              gap: "28px",
            }}
          >
            {recipeSections
              .details.length >
              0 && (
              <section
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(150px, 1fr))",
                  gap: "12px",
                }}
              >
                {recipeSections.details.map(
                  (line) => {
                    const {
                      label,
                      value,
                    } =
                      parseLabelValue(
                        line
                      );

                    return (
                      <div
                        key={
                          line
                        }
                        style={{
                          padding:
                            "16px",
                          border:
                            "1px solid #dfe6dd",
                          borderRadius:
                            "14px",
                          background:
                            "#f7faf5",
                        }}
                      >
                        <div
                          style={{
                            color:
                              "#6f7e73",
                            fontSize:
                              "12px",
                            fontWeight:
                              800,
                            textTransform:
                              "uppercase",
                            letterSpacing:
                              "0.06em",
                          }}
                        >
                          {
                            label
                          }
                        </div>

                        <div
                          style={{
                            marginTop:
                              "6px",
                            color:
                              "#173d29",
                            fontSize:
                              "17px",
                            fontWeight:
                              800,
                          }}
                        >
                          {value ||
                            "—"}
                        </div>
                      </div>
                    );
                  }
                )}
              </section>
            )}

            {recipeSections
              .ingredients
              .length > 0 && (
              <section>
                <h2
                  style={{
                    marginBottom:
                      "14px",
                  }}
                >
                  Ingredients
                </h2>

                <ul
                  style={{
                    display:
                      "grid",
                    gap: "10px",
                    margin: 0,
                    paddingLeft:
                      "22px",
                  }}
                >
                  {recipeSections.ingredients.map(
                    (
                      ingredient,
                      index
                    ) => (
                      <li
                        key={`${ingredient}-${index}`}
                      >
                        {
                          ingredient
                        }
                      </li>
                    )
                  )}
                </ul>
              </section>
            )}

            {recipeSections
              .instructions
              .length > 0 && (
              <section>
                <h2
                  style={{
                    marginBottom:
                      "14px",
                  }}
                >
                  Instructions
                </h2>

                <ol
                  style={{
                    display:
                      "grid",
                    gap: "16px",
                    margin: 0,
                    paddingLeft:
                      "26px",
                  }}
                >
                  {recipeSections.instructions.map(
                    (
                      instruction,
                      index
                    ) => (
                      <li
                        key={`${instruction}-${index}`}
                        style={{
                          paddingLeft:
                            "6px",
                        }}
                      >
                        {
                          instruction
                        }
                      </li>
                    )
                  )}
                </ol>
              </section>
            )}

            {recipeSections
              .nutrition.length >
              0 && (
              <section>
                <h2
                  style={{
                    marginBottom:
                      "14px",
                  }}
                >
                  Nutrition
                </h2>

                <div
                  style={{
                    display:
                      "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(140px, 1fr))",
                    gap: "12px",
                  }}
                >
                  {recipeSections.nutrition.map(
                    (line) => {
                      const {
                        label,
                        value,
                      } =
                        parseLabelValue(
                          line
                        );

                      return (
                        <div
                          key={
                            line
                          }
                          style={{
                            padding:
                              "15px",
                            border:
                              "1px solid #dfe6dd",
                            borderRadius:
                              "12px",
                            background:
                              "#ffffff",
                          }}
                        >
                          <div
                            style={{
                              color:
                                "#6f7e73",
                              fontSize:
                                "12px",
                              fontWeight:
                                800,
                            }}
                          >
                            {
                              label
                            }
                          </div>

                          <div
                            style={{
                              marginTop:
                                "5px",
                              color:
                                "#173d29",
                              fontSize:
                                "18px",
                              fontWeight:
                                900,
                            }}
                          >
                            {value ||
                              "—"}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </section>
            )}

            {recipeSections
              .gallery.length >
              0 && (
              <section>
                <h2
                  style={{
                    marginBottom:
                      "14px",
                  }}
                >
                  Gallery
                </h2>

                <div
                  style={{
                    display:
                      "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "14px",
                  }}
                >
                  {recipeSections.gallery.map(
                    (
                      url,
                      index
                    ) => (
                      <div
                        key={`${url}-${index}`}
                        style={{
                          overflow:
                            "hidden",
                          aspectRatio:
                            "4 / 3",
                          borderRadius:
                            "16px",
                          background:
                            "#edf0ec",
                        }}
                      >
                        <img
                          src={
                            url
                          }
                          alt={`${item.title} gallery image ${index + 1}`}
                          loading="lazy"
                          style={{
                            width:
                              "100%",
                            height:
                              "100%",
                            objectFit:
                              "cover",
                          }}
                        />
                      </div>
                    )
                  )}
                </div>
              </section>
            )}
          </div>
        ) : item.type ===
          "article" ? (
          <div className="wl-article-body">
            {item.body ? (
              <ArticleMarkdown
                body={
                  item.body
                }
              />
            ) : (
              <p>
                {item.summary ||
                  item.excerpt}
              </p>
            )}
          </div>
        ) : (
          <div className="wl-article-body">
            {item.body ? (
              <ArticleMarkdown
                body={
                  item.body
                }
              />
            ) : (
              <p>
                {item.summary ||
                  item.excerpt}
              </p>
            )}
          </div>
        )}

        <footer className="wl-article-footer">
          {item.tags &&
            item.tags.length >
              0 && (
              <div className="wl-article-tags">
                {item.tags.map(
                  (tag) => (
                    <span
                      key={
                        tag
                      }
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>
            )}

          <Link href={backLink}>
            Explore more{" "}
            {backLabel} →
          </Link>
        </footer>
      </article>
    </main>
  );
}