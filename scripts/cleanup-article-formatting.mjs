import fs from "node:fs";
import path from "node:path";
import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;
import { createClient } from "@supabase/supabase-js";

loadEnvConfig(process.cwd());

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL in .env.local"
  );
  process.exit(1);
}

if (!SERVICE_ROLE_KEY) {
  console.error(
    "Missing SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
  console.error(
    "Do not use your public anon key for this cleanup."
  );
  process.exit(1);
}

const supabase = createClient(
  SUPABASE_URL,
  SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

const APPLY =
  process.argv.includes("--apply");

const REPORT_DIRECTORY =
  path.join(
    process.cwd(),
    "article-cleanup-reports"
  );

fs.mkdirSync(
  REPORT_DIRECTORY,
  {
    recursive: true,
  }
);

function normalizeLineEndings(value) {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
}

function cleanArticleBody(body) {
  let value =
    normalizeLineEndings(body);

  const original = value;

  /*
   * ---------------------------------------
   * BASIC WHITESPACE
   * ---------------------------------------
   */

  value = value
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n");

  /*
   * ---------------------------------------
   * MARKDOWN HEADINGS
   * ---------------------------------------
   *
   * Make sure embedded headings begin
   * on a new line.
   */

  value = value.replace(
    /([.!?])\s*(?=#{1,3}\s)/g,
    "$1\n\n"
  );

  /*
   * Remove common horizontal dividers
   * immediately before headings.
   */

  value = value.replace(
    /(?:\n|^)\s*---\s*(?=#{1,3}\s)/g,
    "\n\n"
  );

  /*
   * ---------------------------------------
   * KNOWN WONDERFULLIFE SECTIONS
   * ---------------------------------------
   */

  const knownSections = [
    "References",
    "Scientific References",
    "Scientific References & Sources",
    "Sources",
    "Further Reading",
    "Recommended Reading",
    "Medical Disclaimer",
    "Disclaimer",
    "The Bottom Line",
    "Key Takeaways",
    "Final Thoughts",
    "Practical Takeaways",
  ];

  for (const section of knownSections) {
    const escaped =
      section.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

    /*
     * Example:
     *
     * food.Scientific References & SourcesJow...
     *
     * becomes:
     *
     * food.
     *
     * ## Scientific References & Sources
     *
     * Jow...
     */

    const regex =
      new RegExp(
        `([.!?])\\s*${escaped}(?=[A-Z0-9])`,
        "gi"
      );

    value = value.replace(
      regex,
      `$1\n\n## ${section}\n\n`
    );

    /*
     * If the heading already exists with ##
     * but the following content is glued to it,
     * separate known heading titles.
     */

    const headingRegex =
      new RegExp(
        `(##\\s+${escaped})(?=[A-Z0-9])`,
        "gi"
      );

    value = value.replace(
      headingRegex,
      "$1\n\n"
    );
  }

  /*
   * ---------------------------------------
   * REFERENCES
   * ---------------------------------------
   *
   * Separate numbered references that were
   * accidentally glued together.
   *
   * Example:
   *
   * ...2017).2. Kelley...
   */

  value = value.replace(
    /([.)\]])(?=\d+[.)]\s+[A-Z])/g,
    "$1\n"
  );

  /*
   * References heading followed immediately
   * by "1."
   */

  value = value.replace(
    /(##\s+(?:References|Scientific References|Scientific References & Sources|Sources|Further Reading))\s*(?=1[.)]\s*)/gi,
    "$1\n\n"
  );

  /*
   * ---------------------------------------
   * NUMBERED SECTION HEADINGS
   * ---------------------------------------
   *
   * Some articles contain:
   *
   * 4. Safety, Quality Control...When selecting...
   *
   * We only modify numbered lines that appear
   * to be section headings rather than normal
   * short list items.
   */

  value = value.replace(
    /^(\d+\.\s+[A-Z][^\n.!?]{8,100})(?=When |Why |How |The |This |These |For |In |USANA |Your |A |An )/gm,
    "$1\n\n"
  );

  /*
   * ---------------------------------------
   * MARKDOWN HEADING + PARAGRAPH
   * ---------------------------------------
   *
   * Repair older bodies like:
   *
   * ## HeadingYour body...
   *
   * This is intentionally conservative.
   */

  value = value.replace(
    /^(#{1,3}\s+.{4,100}?[a-z0-9)])(?=(?:Your|The|This|These|When|While|Because|For|In|At|A|An|USANA)\s)/gm,
    "$1\n\n"
  );

  /*
   * Another common case:
   *
   * ## HeadingYour
   *
   * with no space.
   */

  value = value.replace(
    /^(#{1,3}\s+.{4,100}?[a-z0-9)])(Your|The|This|These|When|While|Because|For|In|At|USANA)(?=\s|[A-Z])/gm,
    "$1\n\n$2"
  );

  /*
   * ---------------------------------------
   * STRAY MARKDOWN MARKERS
   * ---------------------------------------
   */

  value = value
    .replace(
      /^\s*#\s*$/gm,
      ""
    )
    .replace(
      /^\s*---\s*$/gm,
      ""
    );

  /*
   * ---------------------------------------
   * PARAGRAPH CLEANUP
   * ---------------------------------------
   */

  value = value
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return {
    original,
    cleaned: value,
    changed:
      original.trim() !==
      value.trim(),
  };
}

function createPreview(original, cleaned) {
  const originalLines =
    original.split("\n");

  const cleanedLines =
    cleaned.split("\n");

  return {
    before_lines:
      originalLines.length,
    after_lines:
      cleanedLines.length,
    before_preview:
      original.slice(0, 1200),
    after_preview:
      cleaned.slice(0, 1200),
  };
}

async function loadArticles() {
  const {
    data,
    error,
  } = await supabase
    .from("content_items")
    .select(
      `
        id,
        title,
        slug,
        body,
        status,
        primary_section,
        updated_at
      `
    )
    .eq("type", "article")
    .order(
      "id",
      {
        ascending: true,
      }
    );

  if (error) {
    throw error;
  }

  return data || [];
}

async function main() {
  console.log("");
  console.log(
    "WonderfulLife Article Formatting Cleanup"
  );
  console.log(
    "-----------------------------------------"
  );

  console.log(
    APPLY
      ? "MODE: APPLY"
      : "MODE: PREVIEW ONLY"
  );

  console.log("");

  const articles =
    await loadArticles();

  console.log(
    `Articles found: ${articles.length}`
  );

  const changedArticles = [];

  for (const article of articles) {
    const result =
      cleanArticleBody(
        article.body || ""
      );

    if (!result.changed) {
      continue;
    }

    changedArticles.push({
      id: article.id,
      title: article.title,
      slug: article.slug,
      status: article.status,
      primary_section:
        article.primary_section,
      original_body:
        result.original,
      cleaned_body:
        result.cleaned,
      preview:
        createPreview(
          result.original,
          result.cleaned
        ),
    });
  }

  console.log(
    `Articles needing cleanup: ${changedArticles.length}`
  );

  const timestamp =
    new Date()
      .toISOString()
      .replace(
        /[:.]/g,
        "-"
      );

  /*
   * ALWAYS CREATE BACKUP
   */

  const backupPath =
    path.join(
      REPORT_DIRECTORY,
      `article-backup-${timestamp}.json`
    );

  fs.writeFileSync(
    backupPath,
    JSON.stringify(
      changedArticles.map(
        (article) => ({
          id: article.id,
          title:
            article.title,
          slug:
            article.slug,
          body:
            article.original_body,
        })
      ),
      null,
      2
    )
  );

  /*
   * CREATE PREVIEW REPORT
   */

  const previewPath =
    path.join(
      REPORT_DIRECTORY,
      `article-cleanup-preview-${timestamp}.json`
    );

  fs.writeFileSync(
    previewPath,
    JSON.stringify(
      changedArticles.map(
        (article) => ({
          id: article.id,
          title:
            article.title,
          slug:
            article.slug,
          status:
            article.status,
          primary_section:
            article.primary_section,
          ...article.preview,
        })
      ),
      null,
      2
    )
  );

  console.log("");
  console.log(
    `Backup created:`
  );

  console.log(
    backupPath
  );

  console.log("");
  console.log(
    `Preview report created:`
  );

  console.log(
    previewPath
  );

  /*
   * CONSOLE PREVIEW
   */

  console.log("");
  console.log(
    "Articles flagged:"
  );

  for (
    const article of
    changedArticles
  ) {
    console.log(
      `- ${article.id}: ${article.title}`
    );
  }

  /*
   * STOP HERE DURING PREVIEW
   */

  if (!APPLY) {
    console.log("");
    console.log(
      "No Supabase records were changed."
    );

    console.log("");
    console.log(
      "Review the preview report before running apply mode."
    );

    return;
  }

  /*
   * APPLY CHANGES
   */

  console.log("");
  console.log(
    "Applying formatting cleanup..."
  );

  let updated = 0;
  let failed = 0;

  for (
    const article of
    changedArticles
  ) {
    const {
      error,
    } = await supabase
      .from(
        "content_items"
      )
      .update({
        body:
          article.cleaned_body,
        updated_at:
          new Date()
            .toISOString(),
      })
      .eq(
        "id",
        article.id
      )
      .eq(
        "type",
        "article"
      );

    if (error) {
      failed += 1;

      console.error(
        `FAILED ${article.id}: ${article.title}`
      );

      console.error(
        error.message
      );

      continue;
    }

    updated += 1;

    console.log(
      `UPDATED ${article.id}: ${article.title}`
    );
  }

  console.log("");
  console.log(
    "Cleanup finished."
  );

  console.log(
    `Updated: ${updated}`
  );

  console.log(
    `Failed: ${failed}`
  );

  console.log("");
  console.log(
    "Your backup file remains available in article-cleanup-reports."
  );
}

main().catch(
  (error) => {
    console.error("");
    console.error(
      "Cleanup stopped:"
    );

    console.error(
      error
    );

    process.exit(1);
  }
);