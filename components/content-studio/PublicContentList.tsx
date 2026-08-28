"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type ContentType = "article" | "recipe" | "video";

type PublicContentItem = {
  id: number;
  type: ContentType;
  title: string;
  slug: string;
  summary: string;
  category: string;
  author: string;
  imageUrl: string;
  topic: string;
  tags: string[];
};

type PublicContentListProps = {
  type: ContentType;
  title: string;
  lead: string;
};

function getContentLabel(type: ContentType) {
  if (type === "recipe") return "recipes";
  if (type === "video") return "videos";
  return "articles";
}

function getActionLabel(type: ContentType) {
  if (type === "recipe") return "View recipe";
  if (type === "video") return "Watch video";
  return "Read article";
}

function getFallbackSummary(type: ContentType) {
  if (type === "recipe") {
    return "Discover a healthy and delicious WonderfulLife recipe.";
  }

  if (type === "video") {
    return "Watch this helpful WonderfulLife wellness video.";
  }

  return "Explore practical guidance for living a healthier, happier life.";
}

function getContentHref(
  type: ContentType,
  slug: string
) {
  if (type === "recipe") {
    return `/recipes/${slug}`;
  }

  if (type === "video") {
    return `/videos/${slug}`;
  }

  return `/articles/${slug}`;
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function pretty(value: string) {
  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

export default function PublicContentList({
  type,
  title,
  lead,
}: PublicContentListProps) {
  const searchParams = useSearchParams();

  const selectedTopic =
    searchParams.get("topic")?.trim() || "";

  const selectedCategory =
    searchParams.get("category")?.trim() || "";

  const [items, setItems] =
    useState<PublicContentItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const contentLabel =
    getContentLabel(type);

  useEffect(() => {
    let cancelled = false;

    async function loadContent() {
      setLoading(true);
      setErrorMessage("");

      const supabase = createClient();

      const { data, error } =
        await supabase
          .from("content_items")
          .select(
            `
              id,
              type,
              title,
              slug,
              summary,
              excerpt,
              category,
              author,
              image_url,
              topic,
              tags
            `
          )
          .eq("type", type)
          .eq("status", "published")
          .order("created_at", {
            ascending: false,
          });

      if (cancelled) {
        return;
      }

      if (error) {
        console.error(
          "Unable to load public content:",
          error
        );

        setErrorMessage(
          `Unable to load ${contentLabel}: ${error.message}`
        );

        setLoading(false);
        return;
      }

      const formattedItems:
        PublicContentItem[] =
        (data ?? []).map((item) => ({
          id: item.id,
          type: item.type as ContentType,
          title: item.title ?? "",
          slug: item.slug ?? "",

          summary:
            item.summary ||
            item.excerpt ||
            "",

          category:
            item.category ||
            "WonderfulLife",

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
        }));

      setItems(formattedItems);
      setLoading(false);
    }

    loadContent();

    return () => {
      cancelled = true;
    };
  }, [type, contentLabel]);

  const filteredItems =
    useMemo(() => {
      const wantedTopic =
        normalize(selectedTopic);

      const wantedCategory =
        normalize(selectedCategory);

      return items.filter((item) => {
        const topicMatches =
          !wantedTopic ||
          normalize(item.topic) === wantedTopic ||
          item.tags.some(
            (tag) =>
              normalize(tag) === wantedTopic
          );

        const categoryMatches =
          !wantedCategory ||
          normalize(item.category) ===
            wantedCategory;

        return (
          topicMatches &&
          categoryMatches
        );
      });
    }, [
      items,
      selectedTopic,
      selectedCategory,
    ]);

  const activeFilter =
    selectedCategory || selectedTopic;

  const displayTitle =
    activeFilter
      ? pretty(activeFilter)
      : title;

  const displayLead =
    selectedCategory
      ? `Explore WonderfulLife ${pretty(
          selectedCategory
        )} recipes.`
      : selectedTopic
        ? `Explore WonderfulLife ${pretty(
            selectedTopic
          )} articles and practical guidance.`
        : lead;

  return (
    <main className="wl-content-page">
      <header className="wl-content-hero">
        <div className="wl-content-hero-inner">
          <p className="wl-studio-eyebrow">
            WonderfulLife
          </p>

          <h1>{displayTitle}</h1>

          <p>{displayLead}</p>

          {activeFilter ? (
            <Link
              href={`/${contentLabel}`}
              style={{
                display: "inline-flex",
                marginTop: "14px",
                color: "#23633d",
                fontWeight: 800,
                textDecoration: "none",
              }}
            >
              ← View all {contentLabel}
            </Link>
          ) : null}
        </div>
      </header>

      {loading && (
        <div className="wl-content-loading">
          <h2>
            Loading {contentLabel}…
          </h2>
        </div>
      )}

      {!loading &&
        errorMessage && (
          <div className="wl-content-empty">
            <h2>
              Unable to load{" "}
              {contentLabel}
            </h2>

            <p>{errorMessage}</p>
          </div>
        )}

      {!loading &&
        !errorMessage &&
        filteredItems.length === 0 && (
          <div className="wl-content-empty">
            <h2>
              {activeFilter
                ? `No ${pretty(
                    activeFilter
                  )} ${contentLabel} found yet.`
                : `No published ${contentLabel} yet.`}
            </h2>

            {activeFilter ? (
              <p>
                Try another category or
                view all {contentLabel}.
              </p>
            ) : null}
          </div>
        )}

      {!loading &&
        !errorMessage &&
        filteredItems.length > 0 && (
          <section className="wl-content-grid">
            {filteredItems.map(
              (item) => (
                <Link
                  className="wl-content-card"
                  href={getContentHref(
                    item.type,
                    item.slug
                  )}
                  key={item.id}
                >
                  {item.imageUrl && (
                    <div className="wl-content-card-image">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        loading="lazy"
                      />
                    </div>
                  )}

                  <div className="wl-content-card-body">
                    <p className="wl-content-card-category">
                      {item.topic
                        ? pretty(
                            item.topic
                          )
                        : item.category}
                    </p>

                    <h2>
                      {item.title}
                    </h2>

                    <p className="wl-content-card-description">
                      {item.summary ||
                        getFallbackSummary(
                          item.type
                        )}
                    </p>

                    <div className="wl-content-card-meta">
                      <span>
                        {item.author}
                      </span>

                      <span>
                        {item.type}
                      </span>
                    </div>

                    <span className="wl-content-card-link">
                      {getActionLabel(
                        item.type
                      )}{" "}
                      →
                    </span>
                  </div>
                </Link>
              )
            )}
          </section>
        )}
    </main>
  );
}