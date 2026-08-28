"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { createClient } from "@/lib/supabase/client";

type ContentType = "article" | "video";

type JoinTeamItem = {
  id: number;
  type: ContentType;
  title: string;
  slug: string;
  summary: string;
  author: string;
  imageUrl: string;
  topic: string;
  tags: string[];
  readingMinutes: number;
};

const filters = [
  { value: "all", label: "All" },
  { value: "article", label: "Articles" },
  { value: "guide", label: "Guides" },
  { value: "video", label: "Videos" },
  { value: "story", label: "Stories" },
  { value: "faq", label: "FAQs" },
  { value: "event", label: "Events" },
  { value: "opportunity", label: "Opportunity" },
];

function pretty(value: string) {
  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getContentHref(item: JoinTeamItem) {
  return item.type === "video"
    ? `/videos/${item.slug}`
    : `/articles/${item.slug}`;
}

function getFormat(item: JoinTeamItem) {
  if (item.topic) {
    return item.topic.toLowerCase();
  }

  return item.type;
}

function getFormatLabel(item: JoinTeamItem) {
  const format = getFormat(item);

  if (format === "faq") return "FAQ";

  return pretty(format);
}

function getActionLabel(item: JoinTeamItem) {
  const format = getFormat(item);

  if (format === "video") return "Watch video";
  if (format === "event") return "View event";
  if (format === "faq") return "Read answer";
  if (format === "guide") return "Read guide";
  if (format === "story") return "Read story";
  if (format === "opportunity") return "Learn more";

  return "Read article";
}

export default function JoinTeamResourceList() {
  const [items, setItems] = useState<JoinTeamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    let cancelled = false;

    async function loadResources() {
      setLoading(true);
      setErrorMessage("");

      const supabase = createClient();

      const { data, error } = await supabase
        .from("content_items")
        .select(`
          id,
          type,
          title,
          slug,
          summary,
          excerpt,
          author,
          image_url,
          topic,
          tags,
          reading_minutes,
          published_at
        `)
        .eq("primary_section", "Join Our Team")
        .eq("status", "published")
        .in("type", ["article", "video"])
        .order("published_at", {
          ascending: false,
        });

      if (cancelled) return;

      if (error) {
        console.error(
          "Unable to load Join Our Team resources:",
          error
        );

        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      const formattedItems: JoinTeamItem[] =
        (data ?? []).map((item) => ({
          id: item.id,
          type: item.type as ContentType,
          title: item.title ?? "",
          slug: item.slug ?? "",
          summary:
            item.summary ||
            item.excerpt ||
            "",
          author:
            item.author ||
            "WonderfulLife",
          imageUrl:
            item.image_url ||
            "",
          topic:
            item.topic ||
            "",
          tags:
            Array.isArray(item.tags)
              ? item.tags
              : [],
          readingMinutes:
            Number(item.reading_minutes || 5),
        }));

      setItems(formattedItems);
      setLoading(false);
    }

    loadResources();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredItems = useMemo(() => {
    if (activeFilter === "all") {
      return items;
    }

    return items.filter((item) => {
      const format = getFormat(item);

      if (activeFilter === "article") {
        return (
          item.type === "article" &&
          (!item.topic ||
            item.topic.toLowerCase() === "article")
        );
      }

      return format === activeFilter;
    });
  }, [items, activeFilter]);

  return (
    <main className="jt-resources">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .jt-resources {
          min-height: 100vh;
          background: #f6f8f4;
          color: #173d29;
        }

        .jt-resources-hero {
          padding: 70px 24px 54px;
          border-bottom: 1px solid #e1e8df;
          background:
            radial-gradient(
              circle at 80% 20%,
              rgba(224,239,224,.9),
              transparent 34%
            ),
            linear-gradient(
              135deg,
              #ffffff 0%,
              #f2f7f0 100%
            );
        }

        .jt-resources-shell {
          width: min(100% - 48px, 1380px);
          margin: 0 auto;
        }

        .jt-eyebrow {
          margin: 0 0 10px;
          color: #287244;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: .17em;
          text-transform: uppercase;
        }

        .jt-resources-hero h1 {
          max-width: 900px;
          margin: 0;
          color: #173d29;
          font-family:
            Georgia,
            "Times New Roman",
            serif;
          font-size: clamp(46px, 6vw, 76px);
          line-height: .98;
          letter-spacing: -.04em;
        }

        .jt-resources-hero p {
          max-width: 800px;
          margin: 18px 0 0;
          color: #617067;
          font-size: 18px;
          line-height: 1.65;
        }

        .jt-principle {
          display: inline-flex;
          margin-top: 24px;
          padding: 10px 14px;
          border: 1px solid #d4e2d4;
          border-radius: 999px;
          background: rgba(255,255,255,.82);
          color: #27683f;
          font-size: 12px;
          font-weight: 900;
        }

        .jt-filter-area {
          padding: 30px 0 10px;
        }

        .jt-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
        }

        .jt-filter {
          min-height: 40px;
          padding: 0 16px;
          border: 1px solid #d5e0d4;
          border-radius: 999px;
          background: #fff;
          color: #31533c;
          font: inherit;
          font-size: 12px;
          font-weight: 900;
          cursor: pointer;
        }

        .jt-filter--active {
          border-color: #246b40;
          background: #246b40;
          color: #fff;
        }

        .jt-contact-link {
          display: inline-flex;
          min-height: 40px;
          align-items: center;
          justify-content: center;
          padding: 0 16px;
          border: 1px solid #246b40;
          border-radius: 999px;
          background: #ffffff;
          color: #246b40;
          font-size: 12px;
          font-weight: 900;
          text-decoration: none;
          transition:
            background .16s ease,
            color .16s ease,
            transform .16s ease;
        }

        .jt-contact-link:hover {
          background: #246b40;
          color: #ffffff;
          transform: translateY(-1px);
        }

        .jt-contact-link:active {
          transform: scale(.98);
        }

        .jt-count {
          margin: 14px 0 0;
          color: #829086;
          font-size: 12px;
        }

        .jt-grid-wrap {
          padding: 20px 0 70px;
        }

        .jt-grid {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 20px;
        }

        .jt-card {
          display: flex;
          overflow: hidden;
          min-height: 430px;
          flex-direction: column;
          border: 1px solid #dfe7dd;
          border-radius: 20px;
          background: #fff;
          color: inherit;
          text-decoration: none;
          box-shadow:
            0 10px 30px
            rgba(23,61,41,.045);
          transition:
            transform .18s ease,
            box-shadow .18s ease;
        }

        .jt-card:hover {
          transform: translateY(-3px);
          box-shadow:
            0 16px 36px
            rgba(23,61,41,.085);
        }

        .jt-card-image {
          position: relative;
          height: 220px;
          overflow: hidden;
          background:
            linear-gradient(
              135deg,
              #dcebdd,
              #f7faf6
            );
        }

        .jt-card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .jt-card-placeholder {
          display: grid;
          height: 220px;
          place-items: center;
          background:
            radial-gradient(
              circle at 35% 35%,
              #ffffff,
              transparent 38%
            ),
            linear-gradient(
              135deg,
              #dcebdd,
              #eef5ec
            );
          color: #4f765c;
          font-family:
            Georgia,
            "Times New Roman",
            serif;
          font-size: 42px;
        }

        .jt-card-body {
          display: flex;
          flex: 1;
          flex-direction: column;
          padding: 22px;
        }

        .jt-card-type {
          margin: 0;
          color: #287244;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .15em;
          text-transform: uppercase;
        }

        .jt-card h2 {
          margin: 9px 0 0;
          color: #173d29;
          font-family:
            Georgia,
            "Times New Roman",
            serif;
          font-size: 27px;
          line-height: 1.08;
        }

        .jt-card-description {
          margin: 13px 0 0;
          color: #6c786f;
          font-size: 14px;
          line-height: 1.6;
        }

        .jt-card-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 8px 14px;
          margin-top: auto;
          padding-top: 22px;
          color: #8a958d;
          font-size: 11px;
        }

        .jt-card-action {
          display: inline-flex;
          margin-top: 14px;
          color: #23633d;
          font-size: 12px;
          font-weight: 900;
        }

        .jt-state {
          padding: 70px 24px;
          border: 1px solid #dfe7dd;
          border-radius: 20px;
          background: #fff;
          text-align: center;
        }

        .jt-state h2 {
          margin: 0;
          font-family:
            Georgia,
            "Times New Roman",
            serif;
          font-size: 32px;
        }

        .jt-state p {
          max-width: 620px;
          margin: 12px auto 0;
          color: #718077;
          line-height: 1.6;
        }

        .jt-back {
          display: inline-flex;
          margin-top: 26px;
          color: #23633d;
          font-size: 13px;
          font-weight: 900;
          text-decoration: none;
        }

        @media (max-width: 1000px) {
          .jt-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 650px) {
          .jt-resources-shell {
            width: min(100% - 24px, 1380px);
          }

          .jt-resources-hero {
            padding: 48px 12px 38px;
          }

          .jt-grid {
            grid-template-columns: 1fr;
          }

          .jt-contact-link {
            min-height: 40px;
            padding: 0 16px;
          }
        }
      `}</style>

      <header className="jt-resources-hero">
        <div className="jt-resources-shell">
          <p className="jt-eyebrow">
            Join Our Team Resources
          </p>

          <h1>
            Learn before you decide.
          </h1>

          <p>
            Explore articles, guides, videos, stories,
            FAQs, events, and opportunity information
            designed to help you understand
            entrepreneurship clearly and at your own pace.
          </p>

          <span className="jt-principle">
            Information · Support · Freedom to Decide
          </span>
        </div>
      </header>

      <div className="jt-resources-shell">
        <section className="jt-filter-area">
          <div className="jt-filters">
            {filters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                className={`jt-filter ${
                  activeFilter === filter.value
                    ? "jt-filter--active"
                    : ""
                }`}
                onClick={() =>
                  setActiveFilter(filter.value)
                }
              >
                {filter.label}
              </button>
            ))}

            <Link
              href="/contact"
              className="jt-contact-link"
            >
              Contact Us
            </Link>
          </div>

          {!loading && !errorMessage ? (
            <p className="jt-count">
              {filteredItems.length}{" "}
              {filteredItems.length === 1
                ? "resource"
                : "resources"}
            </p>
          ) : null}
        </section>

        <section className="jt-grid-wrap">
          {loading ? (
            <div className="jt-state">
              <h2>Loading resources…</h2>
            </div>
          ) : errorMessage ? (
            <div className="jt-state">
              <h2>
                Unable to load resources.
              </h2>

              <p>{errorMessage}</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="jt-state">
              <h2>
                No resources in this section yet.
              </h2>

              <p>
                New WonderfulLife resources will appear
                here as they are published.
              </p>
            </div>
          ) : (
            <div className="jt-grid">
              {filteredItems.map((item) => (
                <Link
                  href={getContentHref(item)}
                  className="jt-card"
                  key={item.id}
                >
                  {item.imageUrl ? (
                    <div className="jt-card-image">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="jt-card-placeholder">
                      W
                    </div>
                  )}

                  <div className="jt-card-body">
                    <p className="jt-card-type">
                      {getFormatLabel(item)}
                    </p>

                    <h2>{item.title}</h2>

                    <p className="jt-card-description">
                      {item.summary ||
                        "Explore this WonderfulLife Join Our Team resource."}
                    </p>

                    <div className="jt-card-meta">
                      <span>
                        {item.author}
                      </span>

                      {item.type === "article" ? (
                        <span>
                          {item.readingMinutes} min read
                        </span>
                      ) : (
                        <span>
                          Video
                        </span>
                      )}
                    </div>

                    <span className="jt-card-action">
                      {getActionLabel(item)} →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <Link
            href="/community"
            className="jt-back"
          >
            ← Back to Join Our Team
          </Link>
        </section>
      </div>
    </main>
  );
}