import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id)
    .single();

  const { data: journey } = await supabase
    .from("wellness_journeys")
    .select("*")
    .eq("user_id", user?.id)
    .eq("status", "active")
    .limit(1)
    .single();

  const displayName =
    profile?.display_name || "friend";

  return (
    <main className="member-dashboard">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .member-dashboard {
          min-height: calc(100vh - 100px);
          padding: 14px 24px 14px;
          background:
            radial-gradient(
              circle at 85% 5%,
              rgba(221, 239, 217, 0.8),
              transparent 32%
            ),
            linear-gradient(
              135deg,
              #f8faf6 0%,
              #eef5ec 55%,
              #f8faf7 100%
            );
          color: #173d29;
        }

        .dashboard-inner {
          width: 100%;
          max-width: 1540px;
          margin: 0 auto;
        }

        /* ==============================
           WELCOME
           ============================== */

        .dashboard-welcome {
          padding: 16px 28px 17px;
          border: 1px solid #dce6dc;
          border-radius: 22px;
          background:
            linear-gradient(
              115deg,
              rgba(255, 255, 255, 0.98),
              rgba(246, 251, 244, 0.94)
            );
          box-shadow:
            0 12px 32px rgba(20, 61, 41, 0.05);
        }

        .dashboard-eyebrow {
          margin: 0 0 4px;
          color: #267047;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.17em;
          text-transform: uppercase;
        }

        .dashboard-title {
          margin: 0;
          color: #173d29;
          font-family:
            Georgia,
            "Times New Roman",
            serif;
          font-size: clamp(31px, 3.4vw, 45px);
          font-weight: 500;
          line-height: 1;
          letter-spacing: -0.035em;
        }

        .dashboard-intro {
          max-width: 1100px;
          margin: 7px 0 0;
          color: #68786e;
          font-size: 13px;
          line-height: 1.4;
        }

        /* ==============================
           GRID
           ============================== */

        .dashboard-grid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 10px;
          margin-top: 10px;
        }

        /* ==============================
           CARDS
           ============================== */

        .dashboard-card {
          display: flex;
          min-height: 145px;
          flex-direction: column;
          justify-content: space-between;
          padding: 15px 18px;
          border: 1px solid #dce6dc;
          border-radius: 19px;
          background: rgba(255, 255, 255, 0.97);
          box-shadow:
            0 10px 26px rgba(20, 61, 41, 0.045);
        }

        .dashboard-card-top {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .dashboard-icon {
          display: grid;
          width: 34px;
          height: 34px;
          place-items: center;
          border-radius: 10px;
          background: #eef6ea;
          font-size: 16px;
        }

        .dashboard-card-title {
          margin: 7px 0 0;
          color: #173d29;
          font-family:
            Georgia,
            "Times New Roman",
            serif;
          font-size: 21px;
          font-weight: 700;
          line-height: 1.05;
        }

        .dashboard-card-copy {
          max-width: 650px;
          margin: 4px 0 0;
          color: #69786f;
          font-size: 11.5px;
          line-height: 1.35;
        }

        /* ==============================
           BUTTONS
           ============================== */

        .dashboard-card-action {
          display: inline-flex;
          width: fit-content;
          min-height: 32px;
          align-items: center;
          justify-content: center;
          margin-top: 9px;
          padding: 0 14px;
          border-radius: 999px;
          background: #237343;
          color: #ffffff;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.01em;
          text-decoration: none;
          transition:
            transform 160ms ease,
            background 160ms ease,
            box-shadow 160ms ease;
        }

        .dashboard-card-action:hover {
          transform: translateY(-1px);
          background: #195f35;
          box-shadow:
            0 7px 16px rgba(25, 95, 53, 0.14);
        }

        .dashboard-card-action.secondary {
          border: 1px solid #cfe0ce;
          background: #ffffff;
          color: #237343;
        }

        .dashboard-card-action.secondary:hover {
          background: #f5faf3;
        }

        /* ==============================
           BOTTOM NOTE
           ============================== */

        .dashboard-note {
          margin: 8px 0 0;
          color: #78857d;
          font-size: 9px;
          font-weight: 600;
          text-align: center;
        }

        /* ==============================
           RESPONSIVE
           ============================== */

        @media (max-width: 900px) {
          .member-dashboard {
            padding: 14px;
          }

          .dashboard-grid {
            grid-template-columns: 1fr;
          }

          .dashboard-card {
            min-height: 140px;
          }
        }

        @media (max-width: 600px) {
          .member-dashboard {
            padding: 10px;
          }

          .dashboard-welcome {
            padding: 18px;
            border-radius: 18px;
          }

          .dashboard-title {
            font-size: 35px;
          }

          .dashboard-intro {
            font-size: 12px;
          }

          .dashboard-grid {
            gap: 9px;
            margin-top: 9px;
          }

          .dashboard-card {
            min-height: 136px;
            padding: 15px;
            border-radius: 18px;
          }
        }
      `}</style>

      <div className="dashboard-inner">
        {/* WELCOME */}

        <section className="dashboard-welcome">
          <p className="dashboard-eyebrow">
            WonderfulLife Member
          </p>

          <h1 className="dashboard-title">
            Welcome back, {displayName}.
          </h1>

          <p className="dashboard-intro">
            Your personal WonderfulLife space for your wellness
            journey, conversations with Zoey, saved content, and
            account access.
          </p>
        </section>

        {/* DASHBOARD CARDS */}

        <section className="dashboard-grid">
          {/* WELLNESS JOURNEY */}

          <article className="dashboard-card">
            <div className="dashboard-card-top">
              <div className="dashboard-icon">
                🌿
              </div>

              <h2 className="dashboard-card-title">
                Wellness Journey
              </h2>

              <p className="dashboard-card-copy">
                {journey
                  ? `${journey.title}, day ${journey.current_day}`
                  : "Start your first 30-day WonderfulLife wellness journey."}
              </p>
            </div>

            <Link
              href="/journey"
              className="dashboard-card-action"
            >
              {journey
                ? "Open Journey"
                : "Start Journey"}{" "}
              →
            </Link>
          </article>

          {/* ASK ZOEY */}

          <article className="dashboard-card">
            <div className="dashboard-card-top">
              <div className="dashboard-icon">
                🎙
              </div>

              <h2 className="dashboard-card-title">
                Ask Zoey
              </h2>

              <p className="dashboard-card-copy">
                Talk with your WonderfulLife AI guide about
                wellness, nutrition, sleep, recipes, products,
                or where to begin.
              </p>
            </div>

            <Link
              href="/ask-zoey"
              className="dashboard-card-action"
            >
              Talk to Zoey →
            </Link>
          </article>

          {/* SAVED CONTENT */}

          <article className="dashboard-card">
            <div className="dashboard-card-top">
              <div className="dashboard-icon">
                🔖
              </div>

              <h2 className="dashboard-card-title">
                Saved Content
              </h2>

              <p className="dashboard-card-copy">
                Return to the articles, recipes, and videos you
                have saved for later.
              </p>
            </div>

            <Link
              href="/saved"
              className="dashboard-card-action"
            >
              Open Saved Content →
            </Link>
          </article>

          {/* ACCOUNT */}

          <article className="dashboard-card">
            <div className="dashboard-card-top">
              <div className="dashboard-icon">
                👤
              </div>

              <h2 className="dashboard-card-title">
                Your Account
              </h2>

              <p className="dashboard-card-copy">
                Manage your WonderfulLife profile and your
                personalized member experience.
              </p>
            </div>

            <Link
              href="/account"
              className="dashboard-card-action secondary"
            >
              Account Settings →
            </Link>
          </article>
        </section>

        <p className="dashboard-note">
          Your WonderfulLife account is private and personalized
          to your experience.
        </p>
      </div>
    </main>
  );
}