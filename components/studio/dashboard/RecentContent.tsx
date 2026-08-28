"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import "../styles/LiveDashboard.css";

type RecentItem = {
  id: number;
  title: string;
  type: string;
  status: string;
  slug: string;
  image_url: string | null;
  updated_at: string | null;
  published_at: string | null;
};

function getItemHref(item: RecentItem) {
  if (item.status === "published") {
    return `/content/${item.slug}`;
  }

  if (item.type === "recipe") {
    return "/studio/recipes";
  }

  if (item.type === "video") {
    return "/studio/videos";
  }

  return "/studio/articles";
}

function formatType(type: string) {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function formatStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatUpdatedDate(dateValue: string | null) {
  if (!dateValue) {
    return "Recently";
  }

  const date = new Date(dateValue);

  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getFallbackImage(type: string) {
  if (type === "recipe") {
    return "/images/wonderfullife-master-logo-v1.png";
  }

  if (type === "video") {
    return "/images/wonderfullife-master-logo-v1.png";
  }

  return "/images/wonderfullife-master-logo-v1.png";
}

export default function RecentContent() {
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadRecentContent() {
      setLoading(true);
      setErrorMessage("");

      const supabase = createClient();

      const { data, error } = await supabase
        .from("content_items")
        .select(
          `
          id,
          title,
          type,
          status,
          slug,
          image_url,
          updated_at,
          published_at
        `
        )
        .order("updated_at", { ascending: false })
        .limit(5);

      if (cancelled) return;

      if (error) {
        console.error(error);
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      setRecentItems(data || []);
      setLoading(false);
    }

    loadRecentContent();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="live-dashboard-card">
      <div className="live-dashboard-heading-row">
        <div>
          <p className="live-dashboard-eyebrow">Library</p>

          <h2 className="live-dashboard-title">Recent Content</h2>

          <p className="live-dashboard-description">
            Continue working on your latest creations.
          </p>
        </div>

        <Link href="/studio/articles" className="live-dashboard-link">
          View all
        </Link>
      </div>

      <div className="live-dashboard-list">
        {loading && (
          <p className="live-dashboard-message">
            Loading recent content…
          </p>
        )}

        {!loading && errorMessage && (
          <p className="live-dashboard-message live-dashboard-message-error">
            Unable to load recent content.
          </p>
        )}

        {!loading && !errorMessage && recentItems.length === 0 && (
          <p className="live-dashboard-message">
            No content has been created yet.
          </p>
        )}

        {!loading && !errorMessage && recentItems.length > 0 && (
          <div>
            {recentItems.map((item) => (
              <Link
                key={item.id}
                href={getItemHref(item)}
                className="live-dashboard-item"
              >
                <div className="live-dashboard-thumbnail">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image_url || getFallbackImage(item.type)}
                    alt={item.title}
                  />
                </div>

                <div className="live-dashboard-item-main">
                  <div className="live-dashboard-badges">
                    <span className="live-dashboard-badge live-dashboard-badge-type">
                      {formatType(item.type)}
                    </span>

                    <span
                      className={`live-dashboard-badge ${
                        item.status === "published"
                          ? "live-dashboard-badge-published"
                          : "live-dashboard-badge-draft"
                      }`}
                    >
                      {formatStatus(item.status)}
                    </span>
                  </div>

                  <h3 className="live-dashboard-item-title">
                    {item.title}
                  </h3>

                  <p className="live-dashboard-item-date">
                    Updated{" "}
                    {formatUpdatedDate(
                      item.updated_at || item.published_at
                    )}
                  </p>
                </div>

                <span className="live-dashboard-arrow">→</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}