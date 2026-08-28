import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

type JoinTeamContent = {
  id: number;
  type: string;
  title: string;
  slug: string;
  excerpt: string | null;
  topic: string | null;
  status: string | null;
  featured: boolean | null;
  created_at: string;
  updated_at: string | null;
  published_at: string | null;
};

function getFormatLabel(item: JoinTeamContent) {
  const topic = String(item.topic || "").trim();

  if (topic) {
    return topic
      .replace(/-/g, " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  }

  return item.type === "video"
    ? "Video"
    : "Article";
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  return new Date(value).toLocaleDateString(
    "en-CA",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );
}

export default async function JoinTeamLibraryPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("content_items")
    .select(
      `
        id,
        type,
        title,
        slug,
        excerpt,
        topic,
        status,
        featured,
        created_at,
        updated_at,
        published_at
      `
    )
    .eq("primary_section", "Join Our Team")
    .order("updated_at", {
      ascending: false,
    })
    .order("created_at", {
      ascending: false,
    });

  const items =
    (data || []) as JoinTeamContent[];

  return (
    <main className="join-library-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .join-library-page {
          min-height: 100vh;
          padding: 34px 38px 60px;
          background: #f4f7f2;
          color: #173d29;
        }

        .join-library-shell {
          width: min(100%, 1480px);
          margin: 0 auto;
        }

        .join-library-back {
          display: inline-flex;
          margin-bottom: 18px;
          color: #496a55;
          font-size: 14px;
          font-weight: 800;
          text-decoration: none;
        }

        .join-library-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 26px;
        }

        .join-library-eyebrow {
          margin: 0;
          color: #2b7748;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: .18em;
          text-transform: uppercase;
        }

        .join-library-title {
          margin: 7px 0 0;
          color: #173d29;
          font-size: 40px;
          line-height: 1.08;
          letter-spacing: -.03em;
        }

        .join-library-description {
          max-width: 760px;
          margin: 10px 0 0;
          color: #718077;
          font-size: 15px;
          line-height: 1.65;
        }

        .join-library-create {
          display: inline-flex;
          min-height: 44px;
          align-items: center;
          justify-content: center;
          padding: 0 18px;
          border-radius: 11px;
          background: #246b40;
          color: #fff;
          font-size: 13px;
          font-weight: 900;
          text-decoration: none;
          box-shadow:
            0 8px 18px
            rgba(36,107,64,.18);
        }

        .join-library-card {
          overflow: hidden;
          border: 1px solid #dbe4da;
          border-radius: 18px;
          background: #fff;
          box-shadow:
            0 8px 24px
            rgba(30,73,46,.06);
        }

        .join-library-summary {
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
          gap: 1px;
          margin-bottom: 22px;
          overflow: hidden;
          border: 1px solid #dbe4da;
          border-radius: 16px;
          background: #dbe4da;
        }

        .summary-item {
          padding: 18px;
          background: #fff;
        }

        .summary-label {
          margin: 0;
          color: #7a867f;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .12em;
          text-transform: uppercase;
        }

        .summary-value {
          margin: 5px 0 0;
          color: #173d29;
          font-size: 24px;
          font-weight: 900;
        }

        .join-library-table {
          width: 100%;
          border-collapse: collapse;
        }

        .join-library-table th {
          padding: 14px 16px;
          border-bottom: 1px solid #dbe4da;
          background: #f8faf7;
          color: #647269;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .11em;
          text-align: left;
          text-transform: uppercase;
        }

        .join-library-table td {
          padding: 16px;
          border-bottom: 1px solid #edf1eb;
          vertical-align: middle;
        }

        .join-library-table tr:last-child td {
          border-bottom: 0;
        }

        .content-format {
          display: inline-flex;
          padding: 5px 9px;
          border-radius: 999px;
          background: #edf5ed;
          color: #2d7047;
          font-size: 10px;
          font-weight: 900;
        }

        .content-status {
          display: inline-flex;
          padding: 5px 9px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 900;
          text-transform: capitalize;
        }

        .content-status--published {
          background: #e7f4e7;
          color: #23633d;
        }

        .content-status--draft {
          background: #f3f1e8;
          color: #6a5b24;
        }

        .content-title {
          margin: 0;
          color: #173d29;
          font-size: 15px;
          font-weight: 900;
        }

        .content-excerpt {
          display: -webkit-box;
          max-width: 520px;
          overflow: hidden;
          margin: 5px 0 0;
          color: #748078;
          font-size: 12px;
          line-height: 1.45;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }

        .content-date {
          color: #718077;
          font-size: 12px;
          white-space: nowrap;
        }

        .content-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
        }

        .content-action {
          display: inline-flex;
          min-height: 34px;
          align-items: center;
          justify-content: center;
          padding: 0 11px;
          border: 1px solid #dbe4da;
          border-radius: 9px;
          background: #fff;
          color: #31523c;
          font-size: 10px;
          font-weight: 900;
          text-decoration: none;
        }

        .content-action--primary {
          border-color: #246b40;
          background: #246b40;
          color: #fff;
        }

        .join-library-empty {
          padding: 54px 24px;
          text-align: center;
        }

        .join-library-empty h2 {
          margin: 0;
          color: #173d29;
          font-size: 24px;
        }

        .join-library-empty p {
          max-width: 560px;
          margin: 10px auto 20px;
          color: #718077;
          font-size: 14px;
          line-height: 1.6;
        }

        .join-library-error {
          padding: 20px;
          border: 1px solid #ebcaca;
          border-radius: 14px;
          background: #fff3f3;
          color: #9f3838;
          font-size: 13px;
          font-weight: 800;
        }

        @media (max-width: 900px) {
          .join-library-page {
            padding: 24px 18px 48px;
          }

          .join-library-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .join-library-summary {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .join-library-card {
            overflow-x: auto;
          }

          .join-library-table {
            min-width: 900px;
          }
        }

        @media (max-width: 520px) {
          .join-library-summary {
            grid-template-columns: 1fr;
          }

          .join-library-title {
            font-size: 34px;
          }
        }
      `}</style>

      <div className="join-library-shell">
        <Link
          href="/studio/community"
          className="join-library-back"
        >
          ← Back to Join Our Team
        </Link>

        <header className="join-library-header">
          <div>
            <p className="join-library-eyebrow">
              WonderfulLife Studio
            </p>

            <h1 className="join-library-title">
              Join Our Team Content
            </h1>

            <p className="join-library-description">
              Manage entrepreneurship articles, guides, videos,
              stories, FAQs, events, and opportunity resources
              from one place.
            </p>
          </div>

          <Link
            href="/studio/community/new?type=article"
            className="join-library-create"
          >
            + Create Content
          </Link>
        </header>

        <section className="join-library-summary">
          <div className="summary-item">
            <p className="summary-label">
              Total Content
            </p>
            <p className="summary-value">
              {items.length}
            </p>
          </div>

          <div className="summary-item">
            <p className="summary-label">
              Published
            </p>
            <p className="summary-value">
              {
                items.filter(
                  (item) =>
                    item.status ===
                    "published"
                ).length
              }
            </p>
          </div>

          <div className="summary-item">
            <p className="summary-label">
              Drafts
            </p>
            <p className="summary-value">
              {
                items.filter(
                  (item) =>
                    item.status !==
                    "published"
                ).length
              }
            </p>
          </div>

          <div className="summary-item">
            <p className="summary-label">
              Featured
            </p>
            <p className="summary-value">
              {
                items.filter(
                  (item) =>
                    Boolean(item.featured)
                ).length
              }
            </p>
          </div>
        </section>

        {error ? (
          <div className="join-library-error">
            Join Our Team content could not be loaded:
            {" "}
            {error.message}
          </div>
        ) : items.length === 0 ? (
          <section className="join-library-card join-library-empty">
            <h2>
              No Join Our Team content yet.
            </h2>

            <p>
              Your first article, guide, video, story,
              FAQ, event, or opportunity resource will
              appear here after you save it.
            </p>

            <Link
              href="/studio/community/new?type=article"
              className="join-library-create"
            >
              Create Your First Article
            </Link>
          </section>
        ) : (
          <section className="join-library-card">
            <table className="join-library-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Format</th>
                  <th>Title</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {items.map((item) => {
                  const publicHref =
                    item.type === "video"
                      ? `/videos/${item.slug}`
                      : `/articles/${item.slug}`;

                  return (
                    <tr key={item.id}>
                      <td>
                        <span
                          className={`content-status ${
                            item.status ===
                            "published"
                              ? "content-status--published"
                              : "content-status--draft"
                          }`}
                        >
                          {item.status ||
                            "draft"}
                        </span>
                      </td>

                      <td>
                        <span className="content-format">
                          {getFormatLabel(item)}
                        </span>
                      </td>

                      <td>
                        <p className="content-title">
                          {item.title}
                        </p>

                        {item.excerpt ? (
                          <p className="content-excerpt">
                            {item.excerpt}
                          </p>
                        ) : null}
                      </td>

                      <td className="content-date">
                        {formatDate(
                          item.updated_at ||
                            item.created_at
                        )}
                      </td>

                      <td>
                        <div className="content-actions">
                          <Link
                            href={`/studio/community/edit/${item.id}`}
                            className="content-action"
                          >
                            Edit
                          </Link>

                          {item.status ===
                          "published" ? (
                            <Link
                              href={publicHref}
                              className="content-action content-action--primary"
                            >
                              View
                            </Link>
                          ) : (
                            <span className="content-action">
                              Draft
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        )}
      </div>
    </main>
  );
}