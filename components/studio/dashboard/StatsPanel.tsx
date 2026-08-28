"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import "../styles/LiveDashboard.css";

type Stats = {
  published: number;
  drafts: number;
  videos: number;
  recipes: number;
};

export default function StatsPanel() {
  const [stats, setStats] = useState<Stats>({
    published: 0,
    drafts: 0,
    videos: 0,
    recipes: 0,
  });

  useEffect(() => {
    async function loadStats() {
      const supabase = createClient();

      const { data } = await supabase
        .from("content_items")
        .select("type,status");

      if (!data) return;

      setStats({
        published: data.filter((x) => x.status === "published").length,
        drafts: data.filter((x) => x.status === "draft").length,
        videos: data.filter((x) => x.type === "video").length,
        recipes: data.filter((x) => x.type === "recipe").length,
      });
    }

    loadStats();
  }, []);

  const cards = [
    {
      label: "Published",
      value: stats.published,
      className: "live-dashboard-stat-published",
    },
    {
      label: "Drafts",
      value: stats.drafts,
      className: "live-dashboard-stat-draft",
    },
    {
      label: "Videos",
      value: stats.videos,
      className: "live-dashboard-stat-video",
    },
    {
      label: "Recipes",
      value: stats.recipes,
      className: "live-dashboard-stat-recipe",
    },
  ];

  return (
    <section className="live-dashboard-card">
      <p className="live-dashboard-eyebrow">
        Overview
      </p>

      <h2 className="live-dashboard-title">
        Content Statistics
      </h2>

      <div className="live-dashboard-stats-grid">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`live-dashboard-stat ${card.className}`}
          >
            <div>{card.label}</div>

            <div className="live-dashboard-stat-value">
              {card.value}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 32,
          borderTop: "1px solid rgba(7,63,42,.10)",
          paddingTop: 24,
        }}
      >
        <p
          style={{
            color: "#c88719",
            fontWeight: 700,
            marginBottom: 10,
          }}
        >
          ✨ Zoey's Idea of the Day
        </p>

        <h3
          style={{
            margin: 0,
            color: "#102018",
            fontSize: 20,
            fontWeight: 800,
          }}
        >
          Inspire someone to live better today
        </h3>

        <p
          style={{
            color: "#68756e",
            lineHeight: 1.6,
          }}
        >
          Start with one helpful idea, keep it simple,
          and create something your WonderfulLife
          community can use immediately.
        </p>

        <ul
          style={{
            marginTop: 18,
            paddingLeft: 20,
            lineHeight: 2,
            color: "#26462f",
          }}
        >
          <li>Create a simple morning routine article.</li>
          <li>Share one healthy recipe using seasonal ingredients.</li>
          <li>Write a short video script about building better daily habits.</li>
        </ul>
      </div>
    </section>
  );
}