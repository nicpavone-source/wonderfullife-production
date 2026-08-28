import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import AutomaticRelatedContent from "@/components/content/AutomaticRelatedContent";
import ContentComments from "@/components/content/ContentComments";
import PrintButton from "@/components/content/PrintButton";
import { toggleSavedContentAction } from "@/app/actions/saved-content";
import { createClient } from "@/lib/supabase/server";

type ArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type Article = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string | null;
  category: string | null;
  primary_section: string | null;
  topic: string | null;
  tags: string[] | null;
  image_url: string | null;
  published_at: string | null;
  reading_minutes: number | null;
};

/*
 * ---------------------------------------------------------
 * INLINE MARKDOWN
 * ---------------------------------------------------------
 *
 * Handles:
 *
 * **bold**
 * *italic*
 *
 * without dangerouslySetInnerHTML.
 */
function formatInline(text: string): ReactNode[] {
  const parts = text.split(
    /(\*\*[^*]+\*\*|\*[^*]+\*)/g
  );

  return parts.map((part, index) => {
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

    if (
      part.startsWith("*") &&
      part.endsWith("*")
    ) {
      return (
        <em key={index}>
          {part.slice(1, -1)}
        </em>
      );
    }

    return part;
  });
}

/*
 * ---------------------------------------------------------
 * TEXT HELPERS
 * ---------------------------------------------------------
 */

function normalizeForComparison(text: string) {
  return text
    .replace(/^#{1,6}\s*/, "")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/*
 * Detects Gemini-style glued text:
 *
 * ConnectivityIn today's...
 * OverloadYour working memory...
 * SeekingDigital platforms...
 * BlocksSchedule 60 to 90...
 *
 * The important clue is a lower-case character immediately
 * followed by an upper-case character with no space.
 */
function splitCamelJoinedText(text: string) {
  const matches = Array.from(
    text.matchAll(/([a-z0-9)])([A-Z])/g)
  );

  for (const match of matches) {
    if (match.index === undefined) {
      continue;
    }

    const splitAt = match.index + 1;

    const left = text
      .slice(0, splitAt)
      .trim();

    const right = text
      .slice(splitAt)
      .trim();

    const leftWords =
      left.split(/\s+/).filter(Boolean);

    /*
     * A real heading is normally fairly short,
     * while the accidentally attached paragraph is
     * normally a full sentence or paragraph.
     */
    if (
      leftWords.length >= 2 &&
      leftWords.length <= 18 &&
      left.length >= 8 &&
      right.length >= 20 &&
      /^[A-Z]/.test(right)
    ) {
      return {
        heading: left,
        paragraph: right,
      };
    }
  }

  return null;
}

/*
 * ---------------------------------------------------------
 * GEMINI / LEGACY ARTICLE NORMALIZER
 * ---------------------------------------------------------
 *
 * Repairs formatting problems already stored in Supabase.
 *
 * This means old articles do NOT need to be manually
 * edited one by one.
 */
function normalizeArticleBody(body: string) {
  let text = body
    /*
     * Standardize line endings.
     */
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")

    /*
     * Non-breaking spaces sometimes arrive from AI,
     * Word, browsers, or copied rich text.
     */
    .replace(/\u00a0/g, " ")

    /*
     * Gemini sometimes escapes bullets:
     *
     * \* B-Complex Vitamins
     *
     * becomes:
     *
     * * B-Complex Vitamins
     */
    .replace(/\\\*\s+/g, "* ")

    /*
     * Normalize bullet characters.
     */
    .replace(/[●▪◦]\s+/g, "• ")

    /*
     * Remove an unwanted generator attribution if Gemini
     * attaches it directly after the WonderfulLife byline.
     *
     * **WonderfulLife Health Team**with Gemini
     */
    .replace(
      /(\*\*WonderfulLife Health Team\*\*)\s*with\s+Gemini\b/gi,
      "$1"
    )

    /*
     * Put Markdown headings on their own line when they
     * are attached to preceding prose.
     */
    .replace(
      /([^\n])(?=#{1,3}\s+)/g,
      "$1\n"
    )

    /*
     * Remove Markdown divider lines accidentally attached
     * to headings.
     */
    .replace(
      /---\s*(?=#{1,3}\s+)/g,
      "\n"
    )

    /*
     * Example:
     *
     * nutrition helps:* Omega-3...
     *
     * becomes:
     *
     * nutrition helps:
     * * Omega-3...
     */
    .replace(
      /([:;])\s*(?=[*•-]\s+[A-Z])/g,
      "$1\n"
    )

    /*
     * Another common glued bullet:
     *
     * transmission.* L-Theanine
     */
    .replace(
      /([.!?])\s*(?=[*•-]\s+[A-Z])/g,
      "$1\n"
    )

    /*
     * Split numbered items that have been pasted together:
     *
     * ...source.2. Next source...
     *
     * becomes:
     *
     * ...source.
     * 2. Next source...
     */
    .replace(
      /([^\n])(?=\d+[.)]\s+[A-Z])/g,
      "$1\n"
    )

    /*
     * Remove stray standalone Markdown heading markers.
     */
    .replace(
      /\s+#\s*(?=\n|$)/g,
      "\n"
    )

    /*
     * Avoid extreme runs of blank lines.
     */
    .replace(/\n{4,}/g, "\n\n\n");

  const rawLines = text.split("\n");

  const repairedLines: string[] = [];

  for (const rawLine of rawLines) {
    const line = rawLine.trim();

    if (!line) {
      repairedLines.push("");
      continue;
    }

    /*
     * -----------------------------------------------------
     * MARKDOWN HEADINGS
     * -----------------------------------------------------
     */
    const headingMatch = line.match(
      /^(#{1,3})\s+(.+)$/
    );

    if (headingMatch) {
      const marker = headingMatch[1];
      const headingText =
        headingMatch[2].trim();

      /*
       * References can sometimes arrive as:
       *
       * # References1. Leroy...
       */
      const referencesMatch =
        headingText.match(
          /^(References|Sources|Further Reading|Recommended Reading)(?=\d+[.)]\s*)/i
        );

      if (referencesMatch) {
        const title =
          referencesMatch[1];

        const rest = headingText
          .slice(title.length)
          .trim();

        repairedLines.push(
          `${marker} ${title}`
        );

        if (rest) {
          const references = rest
            .split(/(?=\d+[.)]\s+)/g)
            .map((item) => item.trim())
            .filter(Boolean);

          repairedLines.push(
            ...references
          );
        }

        continue;
      }

      /*
       * Most important Gemini repair:
       *
       * # The Hidden Cost of Constant ConnectivityIn today's...
       *
       * becomes:
       *
       * # The Hidden Cost of Constant Connectivity
       *
       * In today's...
       */
      const joinedHeading =
        splitCamelJoinedText(
          headingText
        );

      if (joinedHeading) {
        repairedLines.push(
          `${marker} ${joinedHeading.heading}`
        );

        repairedLines.push(
          joinedHeading.paragraph
        );

        continue;
      }

      repairedLines.push(
        `${marker} ${headingText}`
      );

      continue;
    }

    /*
     * -----------------------------------------------------
     * NUMBERED SUBHEADINGS GLUED TO PARAGRAPHS
     * -----------------------------------------------------
     *
     * Gemini commonly generates:
     *
     * 1. Working Memory Capacity & Information OverloadYour working...
     *
     * or:
     *
     * 1) Dopamine Loops & Novelty SeekingDigital platforms...
     *
     * These are not intended to be ordinary list items.
     * They are article subheadings.
     */
    const numberedMatch =
      line.match(
        /^(\d+)[.)]\s+(.+)$/
      );

    if (numberedMatch) {
      const number =
        numberedMatch[1];

      const numberedText =
        numberedMatch[2].trim();

      const joinedNumbered =
        splitCamelJoinedText(
          numberedText
        );

      if (joinedNumbered) {
        repairedLines.push(
          `### ${number}. ${joinedNumbered.heading}`
        );

        repairedLines.push(
          joinedNumbered.paragraph
        );

        continue;
      }
    }

    /*
     * -----------------------------------------------------
     * BULLET THAT BEGINS AFTER ORDINARY TEXT
     * -----------------------------------------------------
     */
    const gluedBulletMatch =
      line.match(
        /^(.+?)([*•-]\s+.+)$/
      );

    if (
      gluedBulletMatch &&
      /[:.!?]\s*$/.test(
        gluedBulletMatch[1]
      )
    ) {
      repairedLines.push(
        gluedBulletMatch[1].trim()
      );

      repairedLines.push(
        gluedBulletMatch[2].trim()
      );

      continue;
    }

    repairedLines.push(line);
  }

  return repairedLines;
}

/*
 * ---------------------------------------------------------
 * ARTICLE BODY RENDERER
 * ---------------------------------------------------------
 */
function ArticleBody({
  body,
  articleTitle,
}: {
  body: string;
  articleTitle: string;
}) {
  const lines =
    normalizeArticleBody(body);

  const content: ReactNode[] = [];

  const normalizedArticleTitle =
    normalizeForComparison(
      articleTitle
    );

  let index = 0;

  while (index < lines.length) {
    const line =
      lines[index].trim();

    /*
     * Blank line.
     */
    if (!line) {
      index += 1;
      continue;
    }

    /*
     * -----------------------------------------------------
     * H3
     * -----------------------------------------------------
     */
    if (
      line.startsWith("### ")
    ) {
      content.push(
        <h3 key={`h3-${index}`}>
          {formatInline(
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
     * -----------------------------------------------------
     * H2
     * -----------------------------------------------------
     */
    if (
      line.startsWith("## ")
    ) {
      content.push(
        <h2 key={`h2-${index}`}>
          {formatInline(
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
     * -----------------------------------------------------
     * BODY H1
     * -----------------------------------------------------
     *
     * The database article title is already the true page H1
     * in the hero area.
     *
     * Therefore:
     *
     * - if # heading repeats the article title, hide it
     * - otherwise render it as an H2
     *
     * This prevents duplicate page titles and improves SEO.
     */
    if (
      line.startsWith("# ")
    ) {
      const headingText =
        line.replace(
          /^#\s+/,
          ""
        );

      const normalizedHeading =
        normalizeForComparison(
          headingText
        );

      if (
        normalizedHeading ===
        normalizedArticleTitle
      ) {
        index += 1;
        continue;
      }

      content.push(
        <h2 key={`h2-from-h1-${index}`}>
          {formatInline(
            headingText
          )}
        </h2>
      );

      index += 1;
      continue;
    }

    /*
     * Ignore Markdown dividers.
     */
    if (
      line === "---" ||
      line === "***" ||
      line === "___" ||
      line === "#"
    ) {
      index += 1;
      continue;
    }

    /*
     * -----------------------------------------------------
     * BLOCKQUOTE
     * -----------------------------------------------------
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

      content.push(
        <blockquote
          key={`quote-${index}`}
        >
          {formatInline(
            quoteLines.join(" ")
          )}
        </blockquote>
      );

      continue;
    }

    /*
     * -----------------------------------------------------
     * BULLETED LIST
     * -----------------------------------------------------
     */
    if (
      /^[-•*]\s+/.test(line)
    ) {
      const items:
        string[] = [];

      while (
        index < lines.length &&
        /^[-•*]\s+/.test(
          lines[index].trim()
        )
      ) {
        items.push(
          lines[index]
            .trim()
            .replace(
              /^[-•*]\s+/,
              ""
            )
        );

        index += 1;
      }

      content.push(
        <ul key={`ul-${index}`}>
          {items.map(
            (
              item,
              itemIndex
            ) => (
              <li key={itemIndex}>
                {formatInline(
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
     * -----------------------------------------------------
     * NUMBERED LIST
     * -----------------------------------------------------
     *
     * Used especially for References.
     */
    if (
      /^\d+[.)]\s*/.test(
        line
      )
    ) {
      const items:
        string[] = [];

      while (
        index < lines.length &&
        /^\d+[.)]\s*/.test(
          lines[index].trim()
        )
      ) {
        items.push(
          lines[index]
            .trim()
            .replace(
              /^\d+[.)]\s*/,
              ""
            )
        );

        index += 1;
      }

      content.push(
        <ol key={`ol-${index}`}>
          {items.map(
            (
              item,
              itemIndex
            ) => (
              <li key={itemIndex}>
                {formatInline(
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
     * -----------------------------------------------------
     * NORMAL PARAGRAPH
     * -----------------------------------------------------
     *
     * Consecutive prose lines become one paragraph until
     * another structural Markdown element is encountered.
     */
    const paragraphLines = [
      line,
    ];

    index += 1;

    while (
      index < lines.length
    ) {
      const nextLine =
        lines[index].trim();

      if (!nextLine) {
        break;
      }

      if (
        nextLine.startsWith(
          "# "
        ) ||
        nextLine.startsWith(
          "## "
        ) ||
        nextLine.startsWith(
          "### "
        ) ||
        nextLine.startsWith(
          "> "
        ) ||
        /^[-•*]\s+/.test(
          nextLine
        ) ||
        /^\d+[.)]\s*/.test(
          nextLine
        ) ||
        nextLine === "---" ||
        nextLine === "***" ||
        nextLine === "___" ||
        nextLine === "#"
      ) {
        break;
      }

      paragraphLines.push(
        nextLine
      );

      index += 1;
    }

    content.push(
      <p key={`p-${index}`}>
        {formatInline(
          paragraphLines.join(
            " "
          )
        )}
      </p>
    );
  }

  return (
    <div className="article-body">
      {content}
    </div>
  );
}

/*
 * ---------------------------------------------------------
 * PAGE
 * ---------------------------------------------------------
 */
export default async function ArticlePage({
  params,
}: ArticlePageProps) {
  const { slug } = await params;

  const supabase =
    await createClient();

  const { data, error } =
    await supabase
      .from("content_items")
      .select(
        `
          id,
          title,
          slug,
          excerpt,
          body,
          category,
          primary_section,
          topic,
          tags,
          image_url,
          published_at,
          reading_minutes
        `
      )
      .eq(
        "type",
        "article"
      )
      .eq(
        "slug",
        slug
      )
      .eq(
        "status",
        "published"
      )
      .single();

  if (
    error ||
    !data
  ) {
    notFound();
  }

  const article =
    data as Article;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isSaved = false;

  if (user) {
    const { data: savedRow } = await supabase
      .from("saved_content")
      .select("id")
      .eq("user_id", user.id)
      .eq("content_id", article.id)
      .maybeSingle();

    isSaved = Boolean(savedRow);
  }

  const publishedDate =
    article.published_at
      ? new Date(
          article.published_at
        ).toLocaleDateString(
          "en-CA",
          {
            year: "numeric",
            month: "long",
            day: "numeric",
          }
        )
      : null;

  const backHref =
    article.primary_section ===
    "Nutrition"
      ? "/nutrition"
      : article.primary_section ===
          "Wellness"
        ? "/wellness"
        : "/articles";

  const backLabel =
    article.primary_section ===
    "Nutrition"
      ? "← Back to Nutrition"
      : article.primary_section ===
          "Wellness"
        ? "← Back to Wellness"
        : "← Back to Articles";

  return (
    <main className="article-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .article-page {
          min-height: 100vh;
          background: #f6f8f5;
          color: #173d29;
        }

        .article-shell {
          width: min(100% - 32px, 1180px);
          margin: 0 auto;
          padding: 22px 0 52px;
        }

        .article-back {
          display: inline-flex;
          margin-bottom: 14px;
          color: #286f45;
          font-size: 12px;
          font-weight: 800;
          text-decoration: none;
        }

        .article-back:hover {
          text-decoration: underline;
        }

        .article-hero {
          overflow: hidden;
          border: 1px solid #dce5dc;
          border-radius: 20px;
          background: #ffffff;
          box-shadow: 0 8px 22px rgba(28, 66, 42, 0.045);
        }

        .article-hero-content {
          padding: 24px 30px 20px;
        }

        .article-eyebrow {
          margin: 0 0 7px;
          color: #287244;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .article-title {
          max-width: 920px;
          margin: 0;
          color: #173d29;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(32px, 3.8vw, 46px);
          line-height: 1.03;
          letter-spacing: -0.03em;
        }

        .article-excerpt {
          max-width: 880px;
          margin: 12px 0 0;
          color: #67756c;
          font-size: 15px;
          line-height: 1.5;
        }

        .article-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 7px 14px;
          margin-top: 13px;
          color: #7b887f;
          font-size: 10.5px;
          font-weight: 700;
        }

        .article-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          margin-top: 11px;
        }

        .article-tag {
          padding: 4px 8px;
          border-radius: 999px;
          background: #edf5ed;
          color: #2d7047;
          font-size: 9.5px;
          font-weight: 800;
          text-transform: capitalize;
        }

        .article-save-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 10px;
          margin-top: 15px;
        }

        .article-save-form {
          margin: 0;
        }

        .article-save-button {
          display: inline-flex;
          min-height: 38px;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 0 15px;
          border: 1px solid #bfd2c2;
          border-radius: 999px;
          background: #ffffff;
          color: #23633d;
          font: inherit;
          font-size: 11px;
          font-weight: 900;
          cursor: pointer;
          box-shadow: 0 7px 18px rgba(28, 66, 42, 0.06);
          transition:
            transform 150ms ease,
            background 150ms ease,
            border-color 150ms ease,
            color 150ms ease;
        }

        .article-save-button:hover {
          transform: translateY(-1px);
          border-color: #7fa58a;
          background: #f4f9f2;
        }

        .article-save-button.is-saved {
          border-color: #23633d;
          background: #23633d;
          color: #ffffff;
        }

        .article-save-note {
          color: #7b887f;
          font-size: 10.5px;
          font-weight: 700;
        }

        .article-image {
          width: 100%;
          max-height: 320px;
          background: #edf3ec;
        }

        .article-image img {
          display: block;
          width: 100%;
          height: min(320px, 31vw);
          min-height: 210px;
          object-fit: cover;
        }

        .article-content {
          max-width: 1020px;
          margin: 20px auto 0;
          padding: 28px 34px;
          border: 1px solid #dce5dc;
          border-radius: 18px;
          background: #ffffff;
          box-shadow: 0 7px 18px rgba(26, 65, 40, 0.04);
        }

        .article-body {
          color: #31463a;
          font-size: 15.5px;
          line-height: 1.58;
        }

        .article-body h2,
        .article-body h3 {
          color: #173d29;
          font-family: Georgia, "Times New Roman", serif;
          letter-spacing: -0.015em;
        }

        .article-body h2 {
          margin: 24px 0 10px;
          font-size: 24px;
          line-height: 1.16;
        }

        .article-body h3 {
          margin: 18px 0 8px;
          font-size: 20px;
          line-height: 1.2;
        }

        .article-body > h2:first-child,
        .article-body > h3:first-child {
          margin-top: 0;
        }

        .article-body p {
          margin: 0 0 12px;
        }

        .article-body strong {
          color: #193e2a;
          font-weight: 800;
        }

        .article-body em {
          color: #43594b;
        }

        .article-body ul,
        .article-body ol {
          margin: 2px 0 15px;
          padding-left: 22px;
        }

        .article-body li {
          margin-bottom: 5px;
          padding-left: 2px;
        }

        .article-body li::marker {
          color: #287244;
          font-weight: 900;
        }

        .article-body li strong {
          color: #173d29;
        }

        .article-body blockquote {
          margin: 18px 0;
          padding: 14px 17px;
          border-left: 4px solid #2c7a4b;
          border-radius: 0 10px 10px 0;
          background: #f3f8f2;
          color: #365442;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 16.5px;
          line-height: 1.48;
          font-style: italic;
        }

        .article-body a {
          color: #216c41;
          font-weight: 700;
        }

        .related-wrap {
          margin-top: 28px;
        }

        .related-wrap .wl-content-grid {
          gap: 16px;
        }

        .related-wrap .wl-content-card {
          border-radius: 18px;
        }

        .related-wrap .wl-content-card-image {
          min-height: 0;
        }

        .related-wrap .wl-content-card-image img {
          height: 210px;
          object-fit: cover;
        }

        .related-wrap .wl-content-card-body {
          padding: 16px;
        }

        .related-wrap .wl-content-card h2,
        .related-wrap .wl-content-card h3 {
          font-size: 19px;
          line-height: 1.16;
        }

        .related-wrap .wl-content-card-description {
          margin: 8px 0 11px;
          font-size: 13px;
          line-height: 1.45;
        }

        .related-wrap h1,
        .related-wrap h2 {
          font-size: clamp(28px, 3vw, 34px);
          line-height: 1.06;
        }

        @media print {
          @page {
            size: auto;
            margin: 0.75in 0.7in 0.8in;
          }

          html,
          body {
            width: auto !important;
            min-width: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: economy;
            print-color-adjust: economy;
          }

          .article-page {
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
          }

          .article-shell {
            width: auto !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .article-back,
          .article-save-row,
          .article-image,
          .article-tags,
          .related-wrap {
            display: none !important;
          }

          .article-hero {
            overflow: visible !important;
            margin: 0 !important;
            border: 0 !important;
            border-radius: 0 !important;
            background: #ffffff !important;
            box-shadow: none !important;
          }

          .article-hero-content {
            margin: 0 !important;
            padding: 0 0 14pt !important;
          }

          .article-eyebrow {
            margin: 0 0 5pt !important;
            color: #333333 !important;
            font-size: 8.5pt !important;
            line-height: 1.2 !important;
          }

          .article-title {
            max-width: none !important;
            margin: 0 !important;
            color: #000000 !important;
            font-size: 24pt !important;
            line-height: 1.1 !important;
            letter-spacing: -0.01em !important;
            break-after: avoid-page;
            page-break-after: avoid;
          }

          .article-excerpt {
            max-width: none !important;
            margin: 7pt 0 0 !important;
            color: #333333 !important;
            font-size: 10pt !important;
            line-height: 1.4 !important;
            orphans: 3;
            widows: 3;
          }

          .article-meta {
            margin: 7pt 0 0 !important;
            gap: 4pt 10pt !important;
            color: #555555 !important;
            font-size: 8pt !important;
            line-height: 1.3 !important;
          }

          .article-content {
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            border: 0 !important;
            border-radius: 0 !important;
            background: #ffffff !important;
            box-shadow: none !important;
          }

          .article-body {
            color: #111111 !important;
            font-size: 9.75pt !important;
            line-height: 1.46 !important;
            overflow-wrap: anywhere;
            word-break: normal;
          }

          .article-body h2,
          .article-body h3,
          .article-body strong {
            color: #000000 !important;
          }

          .article-body h2 {
            margin: 15pt 0 6pt !important;
            font-size: 15.5pt !important;
            line-height: 1.18 !important;
            break-after: avoid-page;
            page-break-after: avoid;
          }

          .article-body h3 {
            margin: 12pt 0 5pt !important;
            font-size: 12.5pt !important;
            line-height: 1.2 !important;
            break-after: avoid-page;
            page-break-after: avoid;
          }

          .article-body p {
            margin: 0 0 7pt !important;
            orphans: 3;
            widows: 3;
          }

          .article-body ul,
          .article-body ol {
            margin: 2pt 0 8pt !important;
            padding-left: 18pt !important;
            orphans: 3;
            widows: 3;
          }

          .article-body li {
            margin-bottom: 2.5pt !important;
            padding-left: 1pt !important;
            orphans: 2;
            widows: 2;
          }

          .article-body blockquote {
            margin: 9pt 0 !important;
            padding: 6pt 9pt !important;
            border-left: 1.5pt solid #555555 !important;
            border-radius: 0 !important;
            background: #ffffff !important;
            color: #222222 !important;
            font-size: 9.5pt !important;
            line-height: 1.42 !important;
            break-inside: avoid-page;
            page-break-inside: avoid;
          }

          .article-body a {
            color: #000000 !important;
            text-decoration: none !important;
          }

          .article-body h2 + p,
          .article-body h3 + p,
          .article-body h2 + ul,
          .article-body h2 + ol,
          .article-body h3 + ul,
          .article-body h3 + ol {
            break-before: avoid-page;
            page-break-before: avoid;
          }

          article ~ * {
            display: none !important;
          }
        }

        @media (max-width: 760px) {
          .article-shell {
            width: min(100% - 18px, 1180px);
            padding-top: 16px;
          }

          .article-hero-content {
            padding: 20px 18px 18px;
          }

          .article-title {
            font-size: clamp(30px, 8.5vw, 40px);
          }

          .article-excerpt {
            font-size: 14.5px;
          }

          .article-image {
            max-height: none;
          }

          .article-image img {
            height: 250px;
            min-height: 250px;
          }

          .article-content {
            margin-top: 16px;
            padding: 24px 18px;
          }

          .article-body {
            font-size: 15.5px;
            line-height: 1.58;
          }

          .article-body h2 {
            font-size: 23px;
          }

          .article-body h3 {
            font-size: 19px;
          }

          .article-body blockquote {
            font-size: 16px;
          }

          .related-wrap {
            margin-top: 24px;
          }

          .related-wrap .wl-content-card-image img {
            height: 190px;
          }
        }
      `}</style>

      <div className="article-shell">
        <Link
          href={backHref}
          className="article-back"
        >
          {backLabel}
        </Link>

        <article>
          <section className="article-hero">
            <div className="article-hero-content">
              <p className="article-eyebrow">
                {article.primary_section ||
                  article.category ||
                  "WonderfulLife Article"}
              </p>

              <h1 className="article-title">
                {article.title}
              </h1>

              {article.excerpt ? (
                <p className="article-excerpt">
                  {article.excerpt}
                </p>
              ) : null}

              <div className="article-meta">
                {publishedDate ? (
                  <span>
                    {publishedDate}
                  </span>
                ) : null}

                {article.reading_minutes ? (
                  <span>
                    {article.reading_minutes} min read
                  </span>
                ) : null}

                {article.topic ? (
                  <span>
                    Topic:{" "}
                    {article.topic.replace(
                      /-/g,
                      " "
                    )}
                  </span>
                ) : null}
              </div>

              {article.tags &&
              article.tags.length > 0 ? (
                <div className="article-tags">
                  {article.tags.map(
                    (tag) => (
                      <span
                        key={tag}
                        className="article-tag"
                      >
                        {tag.replace(
                          /-/g,
                          " "
                        )}
                      </span>
                    )
                  )}
                </div>
              ) : null}

              <div className="article-save-row">
                <PrintButton label="Print Article" />

                <form
                  action={toggleSavedContentAction}
                  className="article-save-form"
                >
                  <input
                    type="hidden"
                    name="content_id"
                    value={article.id}
                  />

                  <input
                    type="hidden"
                    name="return_path"
                    value={`/articles/${article.slug}`}
                  />

                  <button
                    type="submit"
                    className={`article-save-button${
                      isSaved ? " is-saved" : ""
                    }`}
                  >
                    <span aria-hidden="true">
                      {isSaved ? "✓" : "♡"}
                    </span>

                    {isSaved
                      ? "Saved"
                      : "Save for Later"}
                  </button>
                </form>

                {!user ? (
                  <span className="article-save-note">
                    Sign in to save this article.
                  </span>
                ) : isSaved ? (
                  <span className="article-save-note">
                    Saved to your Member Library.
                  </span>
                ) : null}
              </div>
            </div>

            {article.image_url ? (
              <div className="article-image">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={article.image_url}
                  alt={article.title}
                />
              </div>
            ) : null}
          </section>

          <section className="article-content">
            <ArticleBody
              body={
                article.body ||
                "Article content is coming soon."
              }
              articleTitle={
                article.title
              }
            />
          </section>
        </article>

        <ContentComments
          contentItemId={article.id}
          returnPath={`/articles/${article.slug}`}
        />

        <div className="related-wrap">
          <AutomaticRelatedContent
            currentId={article.id}
            currentPrimarySection={
              article.primary_section ||
              article.category
            }
            currentTopic={
              article.topic
            }
            currentTags={
              article.tags || []
            }
            maxPerType={3}
          />
        </div>
      </div>
    </main>
  );
}