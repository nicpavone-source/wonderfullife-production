
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import AutomaticRelatedContent from "@/components/content/AutomaticRelatedContent";
import ContentComments from "@/components/content/ContentComments";
import PrintButton from "@/components/content/PrintButton";
import { toggleSavedContentAction } from "@/app/actions/saved-content";
import { createClient } from "@/lib/supabase/server";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
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

function safeUrl(url: string): string | null {
  const value = url.trim();

  if (
    value.startsWith("/") &&
    !value.startsWith("//")
  ) {
    return value;
  }

  try {
    const parsed = new URL(value);

    if (
      parsed.protocol === "https:" ||
      parsed.protocol === "http:"
    ) {
      return value;
    }
  } catch {
    return null;
  }

  return null;
}

function formatInline(text: string): ReactNode[] {
  const result: ReactNode[] = [];

  const pattern =
    /(!\[[^\]]*\]\([^)]+\)|\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|__[^_]+__|(?<!\*)\*[^*\n]+\*(?!\*)|(?<!_)_[^_\n]+_(?!_)|`[^`]+`)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result.push(
        text.slice(lastIndex, match.index)
      );
    }

    const token = match[0];
    const key = match.index;

    const image = token.match(
      /^!\[([^\]]*)\]\(([^)]+)\)$/
    );

    const link = token.match(
      /^\[([^\]]+)\]\(([^)]+)\)$/
    );

    if (image) {
      const src = safeUrl(image[2]);

      if (src) {
        result.push(
          <img
            key={key}
            src={src}
            alt={image[1]}
            loading="lazy"
            decoding="async"
            className="article-inline-media"
          />
        );
      } else {
        result.push(token);
      }
    } else if (link) {
      const href = safeUrl(link[2]);

      result.push(
        href ? (
          <a key={key} href={href}>
            {link[1]}
          </a>
        ) : (
          token
        )
      );
    } else if (
      token.startsWith("**") ||
      token.startsWith("__")
    ) {
      result.push(
        <strong key={key}>
          {token.slice(2, -2)}
        </strong>
      );
    } else if (
      token.startsWith("*") ||
      token.startsWith("_")
    ) {
      result.push(
        <em key={key}>
          {token.slice(1, -1)}
        </em>
      );
    } else if (token.startsWith("`")) {
      result.push(
        <code key={key}>
          {token.slice(1, -1)}
        </code>
      );
    } else {
      result.push(token);
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }

  return result;
}

function normalizeArticleBody(body: string): string {
  return body
    .replace(/\r\n?/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/\\([*_])/g, "$1")
    .replace(/([^\n])(#{1,3}\s+)/g, "$1\n\n$2")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
}

function cleanHeading(text: string): string {
  return text
    .replace(/[*_`]/g, "")
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function isImage(line: string): boolean {
  return /^!\[([^\]]*)\]\(([^)]+)\)$/.test(line);
}

function isTableSeparator(line: string): boolean {
  return (
    /^\|?[\s:|-]+\|?$/.test(line) &&
    line.includes("-") &&
    line.includes("|")
  );
}

function splitTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isStructuralLine(line: string): boolean {
  return (
    /^#{1,6}\s+/.test(line) ||
    /^>\s?/.test(line) ||
    /^[-*•]\s+/.test(line) ||
    /^\d+[.)]\s+/.test(line) ||
    isImage(line) ||
    /^(```|~~~)/.test(line) ||
    /^(---|\*\*\*|___)$/.test(line)
  );
}

function ArticleBody({
  body,
  articleTitle,
}: {
  body: string;
  articleTitle: string;
}) {
  const lines = normalizeArticleBody(body).split("\n");
  const content: ReactNode[] = [];
  const normalizedTitle = cleanHeading(articleTitle);

  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();

    if (!line) {
      index++;
      continue;
    }

    // Inline article images.
    const imageMatch = line.match(
      /^!\[([^\]]*)\]\(([^)]+)\)$/
    );

    if (imageMatch) {
      const alt = imageMatch[1];
      const src = safeUrl(imageMatch[2]);

      if (src) {
        content.push(
          <figure
            key={`image-${index}`}
            className="article-inline-image"
          >
            <img
              src={src}
              alt={alt}
              loading="lazy"
              decoding="async"
            />
            {alt && (
              <figcaption>{alt}</figcaption>
            )}
          </figure>
        );
      } else {
        content.push(
          <p key={`invalid-image-${index}`}>
            {line}
          </p>
        );
      }

      index++;
      continue;
    }

    // Markdown headings.
    const headingMatch = line.match(
      /^(#{1,6})\s+(.+)$/
    );

    if (headingMatch) {
      const level = headingMatch[1].length;
      const heading = headingMatch[2].trim();

      if (
        level === 1 &&
        cleanHeading(heading) === normalizedTitle
      ) {
        index++;
        continue;
      }

      if (level <= 2) {
        content.push(
          <h2 key={`heading-${index}`}>
            {formatInline(heading)}
          </h2>
        );
      } else {
        content.push(
          <h3 key={`heading-${index}`}>
            {formatInline(heading)}
          </h3>
        );
      }

      index++;
      continue;
    }

    // Horizontal divider.
    if (/^(---|\*\*\*|___)$/.test(line)) {
      content.push(
        <hr key={`divider-${index}`} />
      );
      index++;
      continue;
    }

    // Code blocks.
    if (/^(```|~~~)/.test(line)) {
      const marker = line.slice(0, 3);
      const codeLines: string[] = [];
      index++;

      while (
        index < lines.length &&
        !lines[index].trim().startsWith(marker)
      ) {
        codeLines.push(lines[index]);
        index++;
      }

      if (index < lines.length) {
        index++;
      }

      content.push(
        <pre key={`code-${index}`}>
          <code>{codeLines.join("\n")}</code>
        </pre>
      );

      continue;
    }

    // Markdown tables.
    if (
      line.includes("|") &&
      index + 1 < lines.length &&
      isTableSeparator(lines[index + 1].trim())
    ) {
      const headers = splitTableRow(line);
      const rows: string[][] = [];

      index += 2;

      while (
        index < lines.length &&
        lines[index].trim().includes("|") &&
        lines[index].trim()
      ) {
        rows.push(
          splitTableRow(lines[index])
        );
        index++;
      }

      content.push(
        <div
          key={`table-${index}`}
          className="article-table-wrap"
        >
          <table>
            <thead>
              <tr>
                {headers.map((header, i) => (
                  <th key={i}>
                    {formatInline(header)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {headers.map((_, cellIndex) => (
                    <td key={cellIndex}>
                      {formatInline(
                        row[cellIndex] || ""
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

      continue;
    }

    // Blockquotes.
    if (/^>\s?/.test(line)) {
      const quotes: string[] = [];

      while (
        index < lines.length &&
        /^>\s?/.test(lines[index].trim())
      ) {
        quotes.push(
          lines[index]
            .trim()
            .replace(/^>\s?/, "")
        );
        index++;
      }

      content.push(
        <blockquote key={`quote-${index}`}>
          {formatInline(quotes.join(" "))}
        </blockquote>
      );

      continue;
    }

    // Unordered lists.
    if (/^[-*•]\s+/.test(line)) {
      const items: string[] = [];

      while (
        index < lines.length &&
        /^[-*•]\s+/.test(lines[index].trim())
      ) {
        items.push(
          lines[index]
            .trim()
            .replace(/^[-*•]\s+/, "")
        );
        index++;
      }

      content.push(
        <ul key={`list-${index}`}>
          {items.map((item, i) => (
            <li key={i}>
              {formatInline(item)}
            </li>
          ))}
        </ul>
      );

      continue;
    }

    // Numbered lists.
    if (/^\d+[.)]\s+/.test(line)) {
      const items: string[] = [];
      const start = Number(
        line.match(/^(\d+)/)?.[1] || 1
      );

      while (
        index < lines.length &&
        /^\d+[.)]\s+/.test(lines[index].trim())
      ) {
        items.push(
          lines[index]
            .trim()
            .replace(/^\d+[.)]\s+/, "")
        );
        index++;
      }

      content.push(
        <ol key={`numbered-${index}`} start={start}>
          {items.map((item, i) => (
            <li key={i}>
              {formatInline(item)}
            </li>
          ))}
        </ol>
      );

      continue;
    }

    // Ordinary paragraphs.
    const paragraphs = [line];
    index++;

    while (index < lines.length) {
      const next = lines[index].trim();

      if (
        !next ||
        isStructuralLine(next) ||
        (
          next.includes("|") &&
          index + 1 < lines.length &&
          isTableSeparator(
            lines[index + 1].trim()
          )
        )
      ) {
        break;
      }

      paragraphs.push(next);
      index++;
    }

    content.push(
      <p key={`paragraph-${index}`}>
        {formatInline(paragraphs.join(" "))}
      </p>
    );
  }

  return (
    <div className="article-body">
      {content}
    </div>
  );
}

export default async function ArticlePage({
  params,
}: ArticlePageProps) {
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
      primary_section,
      topic,
      tags,
      image_url,
      published_at,
      reading_minutes
      `
    )
    .eq("type", "article")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !data) {
    notFound();
  }

  const article = data as Article;

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

  const publishedDate = article.published_at
    ? new Date(
        article.published_at
      ).toLocaleDateString("en-CA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const backHref =
    article.primary_section === "Nutrition"
      ? "/nutrition"
      : article.primary_section === "Wellness"
        ? "/wellness"
        : "/articles";

  const backLabel =
    article.primary_section === "Nutrition"
      ? "← Back to Nutrition"
      : article.primary_section === "Wellness"
        ? "← Back to Wellness"
        : "← Back to Articles";

  return (
    <main className="article-page">
      <style>{`
        .article-page,
        .article-page * {
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
          display: inline-block;
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
          background: #fff;
          box-shadow: 0 8px 22px rgba(28,66,42,.045);
        }

        .article-hero-content {
          padding: 24px 30px 20px;
        }

        .article-eyebrow {
          margin: 0 0 7px;
          color: #287244;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .14em;
          text-transform: uppercase;
        }

        .article-title {
          max-width: 920px;
          margin: 0;
          color: #173d29;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(32px,3.8vw,46px);
          line-height: 1.08;
          letter-spacing: -.03em;
        }

        .article-excerpt {
          max-width: 880px;
          margin: 12px 0 0;
          color: #67756c;
          font-size: 15px;
          line-height: 1.6;
        }

        .article-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 7px 14px;
          margin-top: 13px;
          color: #7b887f;
          font-size: 11px;
          font-weight: 700;
        }

        .article-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 12px;
        }

        .article-tag {
          padding: 5px 9px;
          border-radius: 999px;
          background: #edf5ed;
          color: #2d7047;
          font-size: 10px;
          font-weight: 800;
        }

        .article-save-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 10px;
          margin-top: 16px;
        }

        .article-save-form {
          margin: 0;
        }

        .article-save-button {
          display: inline-flex;
          min-height: 38px;
          align-items: center;
          gap: 7px;
          padding: 0 15px;
          border: 1px solid #bfd2c2;
          border-radius: 999px;
          background: #fff;
          color: #23633d;
          font: inherit;
          font-size: 11px;
          font-weight: 900;
          cursor: pointer;
        }

        .article-save-button:hover {
          background: #f4f9f2;
        }

        .article-save-button.is-saved {
          background: #23633d;
          border-color: #23633d;
          color: #fff;
        }

        .article-save-note {
          color: #7b887f;
          font-size: 11px;
          font-weight: 700;
        }

        .article-image {
          background: #edf3ec;
        }

        .article-image img {
          display: block;
          width: 100%;
          height: min(320px,31vw);
          min-height: 210px;
          object-fit: cover;
        }

        .article-content {
          max-width: 1020px;
          margin: 20px auto 0;
          padding: 32px 38px;
          border: 1px solid #dce5dc;
          border-radius: 18px;
          background: #fff;
          box-shadow: 0 7px 18px rgba(26,65,40,.04);
        }

        .article-body {
          color: #31463a;
          font-size: 16px;
          line-height: 1.75;
          overflow-wrap: anywhere;
        }

        .article-body h2,
        .article-body h3 {
          color: #173d29;
          font-family: Georgia, "Times New Roman", serif;
          letter-spacing: -.015em;
        }

        .article-body h2 {
          margin: 32px 0 13px;
          font-size: 27px;
          line-height: 1.2;
        }

        .article-body h3 {
          margin: 24px 0 10px;
          font-size: 21px;
          line-height: 1.25;
        }

        .article-body > h2:first-child,
        .article-body > h3:first-child {
          margin-top: 0;
        }

        .article-body p {
          margin: 0 0 17px;
        }

        .article-body strong {
          color: #193e2a;
          font-weight: 800;
        }

        .article-body ul,
        .article-body ol {
          margin: 5px 0 20px;
          padding-left: 26px;
        }

        .article-body li {
          margin-bottom: 9px;
          padding-left: 3px;
        }

        .article-body li::marker {
          color: #287244;
          font-weight: 800;
        }

        .article-body blockquote {
          margin: 24px 0;
          padding: 18px 22px;
          border-left: 4px solid #2c7a4b;
          border-radius: 0 12px 12px 0;
          background: #f3f8f2;
          color: #365442;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 18px;
          line-height: 1.55;
          font-style: italic;
        }

        .article-body a {
          color: #216c41;
          font-weight: 700;
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        .article-body code {
          padding: 2px 5px;
          border-radius: 4px;
          background: #edf3ec;
          font-size: .9em;
        }

        .article-body pre {
          overflow-x: auto;
          padding: 18px;
          border-radius: 10px;
          background: #edf3ec;
        }

        .article-body pre code {
          padding: 0;
        }

        .article-body hr {
          height: 1px;
          margin: 28px 0;
          border: 0;
          background: #dce5dc;
        }

        .article-inline-image {
          width: 100%;
          margin: 28px 0;
        }

        .article-inline-image img,
        .article-inline-media {
          display: block;
          width: 100%;
          height: auto;
          max-height: 650px;
          object-fit: contain;
          border-radius: 14px;
        }

        .article-inline-image figcaption {
          margin-top: 10px;
          color: #718077;
          font-size: 12px;
          line-height: 1.5;
          text-align: center;
        }

        .article-table-wrap {
          width: 100%;
          margin: 24px 0;
          overflow-x: auto;
          border: 1px solid #dce5dc;
          border-radius: 12px;
        }

        .article-body table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
          line-height: 1.5;
        }

        .article-body th {
          padding: 13px 15px;
          background: #edf5ed;
          color: #173d29;
          font-weight: 800;
          text-align: left;
          vertical-align: top;
        }

        .article-body td {
          padding: 12px 15px;
          border-top: 1px solid #e2eae2;
          vertical-align: top;
        }

        .article-body tbody tr:nth-child(even) {
          background: #f8faf7;
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
          line-height: 1.2;
        }

        .related-wrap .wl-content-card-description {
          margin: 8px 0 11px;
          font-size: 13px;
          line-height: 1.45;
        }

        @media (max-width: 760px) {
          .article-shell {
            width: min(100% - 18px,1180px);
            padding-top: 16px;
          }

          .article-hero-content {
            padding: 20px 18px;
          }

          .article-title {
            font-size: clamp(30px,8.5vw,40px);
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
            line-height: 1.7;
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

          .article-body table {
            min-width: 580px;
          }

          .article-inline-image {
            margin: 20px 0;
          }

          .article-inline-image img {
            border-radius: 10px;
          }

          .related-wrap .wl-content-card-image img {
            height: 190px;
          }
        }

        @media print {
          @page {
            margin: .75in;
          }

          .article-page {
            background: #fff !important;
            color: #000 !important;
          }

          .article-shell {
            width: 100%;
            padding: 0;
          }

          .article-back,
          .article-save-row,
          .article-image,
          .article-tags,
          .related-wrap {
            display: none !important;
          }

          .article-hero,
          .article-content {
            margin: 0;
            padding: 0;
            border: 0;
            box-shadow: none;
          }

          .article-hero-content {
            padding: 0 0 16pt;
          }

          .article-title {
            color: #000;
            font-size: 24pt;
          }

          .article-body {
            color: #111;
            font-size: 10pt;
            line-height: 1.5;
          }

          .article-body h2 {
            font-size: 16pt;
          }

          .article-body h3 {
            font-size: 13pt;
          }

          .article-body h2,
          .article-body h3 {
            break-after: avoid-page;
          }

          .article-body p,
          .article-body li {
            orphans: 3;
            widows: 3;
          }

          .article-inline-image {
            break-inside: avoid-page;
          }

          .article-inline-image img {
            max-height: 4.5in;
          }

          .article-table-wrap {
            overflow: visible;
          }

          .article-body table {
            font-size: 9pt;
          }

          .article-body th,
          .article-body td {
            padding: 6pt;
          }

          .article-body a {
            color: #000;
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

              {article.excerpt && (
                <p className="article-excerpt">
                  {article.excerpt}
                </p>
              )}

              <div className="article-meta">
                {publishedDate && (
                  <span>{publishedDate}</span>
                )}

                {article.reading_minutes && (
                  <span>
                    {article.reading_minutes} min read
                  </span>
                )}

                {article.topic && (
                  <span>
                    Topic:{" "}
                    {article.topic.replace(/-/g, " ")}
                  </span>
                )}
              </div>

              {article.tags &&
                article.tags.length > 0 && (
                  <div className="article-tags">
                    {article.tags.map((tag) => (
                      <span
                        key={tag}
                        className="article-tag"
                      >
                        {tag.replace(/-/g, " ")}
                      </span>
                    ))}
                  </div>
                )}

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

            {article.image_url && (
              <div className="article-image">
                <img
                  src={article.image_url}
                  alt={article.title}
                />
              </div>
            )}
          </section>

          <section className="article-content">
            <ArticleBody
              body={
                article.body ||
                "Article content is coming soon."
              }
              articleTitle={article.title}
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
            currentTopic={article.topic}
            currentTags={article.tags || []}
            maxPerType={3}
          />
        </div>
      </div>
    </main>
  );
}
