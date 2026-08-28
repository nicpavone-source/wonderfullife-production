
import Link from "next/link";

import ContentCard from "@/components/ContentCard";
import { createClient } from "@/lib/supabase/server";

export default async function SavedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: rows } = await supabase
    .from("saved_content")
    .select("content_items(*)")
    .eq("user_id", user?.id);

  const items = (rows || [])
    .map((row: any) => row.content_items)
    .filter(Boolean);

  return (
    <main className="saved-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .saved-page {
          min-height: calc(100vh - 100px);
          padding: 20px 24px 56px;
          background:
            linear-gradient(
              135deg,
              #f8faf6 0%,
              #eef5ec 50%,
              #f8faf7 100%
            );
          color: #173d29;
        }

        .saved-shell {
          width: 100%;
          max-width: 1320px;
          margin: 0 auto;
        }

        .saved-topline {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 12px;
        }

        .saved-back {
          color: #23633d;
          font-size: 11px;
          font-weight: 900;
          text-decoration: none;
        }

        .saved-count {
          color: #758178;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .saved-hero {
          padding: 22px 28px;
          border: 1px solid #dce6dc;
          border-radius: 24px;
          background:
            linear-gradient(
              120deg,
              rgba(255,255,255,.98),
              rgba(246,251,244,.94)
            );
          box-shadow:
            0 14px 38px
            rgba(20,61,41,.05);
        }

        .saved-eyebrow {
          margin: 0 0 6px;
          color: #287244;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .18em;
          text-transform: uppercase;
        }

        .saved-title {
          margin: 0;
          font-family:
            Georgia,
            "Times New Roman",
            serif;
          font-size:
            clamp(34px, 4vw, 50px);
          font-weight: 500;
          line-height: 1;
          letter-spacing: -.035em;
        }

        .saved-lead {
          max-width: 760px;
          margin: 9px 0 0;
          color: #69786f;
          font-size: 13px;
          line-height: 1.5;
        }

        .saved-grid {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 18px;
          margin-top: 16px;
        }

        .saved-empty {
          display: grid;
          min-height: 230px;
          place-items: center;
          margin-top: 16px;
          padding: 32px;
          border: 1px solid #dce6dc;
          border-radius: 22px;
          background: rgba(255,255,255,.96);
          text-align: center;
          box-shadow:
            0 12px 30px
            rgba(20,61,41,.04);
        }

        .saved-empty-icon {
          font-size: 42px;
        }

        .saved-empty h2 {
          margin: 10px 0 0;
          font-family:
            Georgia,
            "Times New Roman",
            serif;
          font-size: 26px;
        }

        .saved-empty p {
          max-width: 520px;
          margin: 8px auto 0;
          color: #6d7b72;
          font-size: 13px;
          line-height: 1.5;
        }

        .saved-empty-link {
          display: inline-flex;
          min-height: 38px;
          align-items: center;
          justify-content: center;
          margin-top: 15px;
          padding: 0 16px;
          border-radius: 999px;
          background: #237343;
          color: #ffffff;
          font-size: 11px;
          font-weight: 900;
          text-decoration: none;
        }

        .saved-grid > * {
          min-width: 0;
        }

        .saved-grid img {
          width: 100%;
          height: 210px;
          object-fit: cover;
        }

        @media (max-width: 1000px) {
          .saved-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 650px) {
          .saved-page {
            padding: 14px 14px 44px;
          }

          .saved-grid {
            grid-template-columns: 1fr;
          }

          .saved-hero {
            padding: 20px;
            border-radius: 20px;
          }
        }
      `}</style>

      <div className="saved-shell">
        <div className="saved-topline">
          <Link
            href="/dashboard"
            className="saved-back"
          >
            ← Member Dashboard
          </Link>

          <span className="saved-count">
            {items.length}{" "}
            {items.length === 1
              ? "Saved Item"
              : "Saved Items"}
          </span>
        </div>

        <section className="saved-hero">
          <p className="saved-eyebrow">
            WonderfulLife Member Library
          </p>

          <h1 className="saved-title">
            Saved Content
          </h1>

          <p className="saved-lead">
            Keep your favorite articles, recipes, and videos
            together in one place so you can return to them
            anytime.
          </p>
        </section>

        {items.length ? (
          <section className="saved-grid">
            {items.map((item: any) => (
              <ContentCard
                key={item.id}
                item={item}
              />
            ))}
          </section>
        ) : (
          <section className="saved-empty">
            <div>
              <div className="saved-empty-icon">
                🔖
              </div>

              <h2>
                Your library is ready.
              </h2>

              <p>
                Save articles, recipes, and videos while you
                explore WonderfulLife and they will appear here.
              </p>

              <Link
                href="/wellness"
                className="saved-empty-link"
              >
                Explore Wellness →
              </Link>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}