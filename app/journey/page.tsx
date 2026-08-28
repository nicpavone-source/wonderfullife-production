import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import {
  createJourneyAction,
  saveCheckinAction,
} from "@/lib/actions/journey";

export default async function JourneyPage({
  searchParams,
}: {
  searchParams: Promise<{
    message?: string;
  }>;
}) {
  const params = await searchParams;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: journey } = await supabase
    .from("wellness_journeys")
    .select("*")
    .eq("user_id", user?.id)
    .eq("status", "active")
    .limit(1)
    .single();

  const habits = [
    {
      name: "hydration",
      icon: "💧",
      label: "Hydration",
    },
    {
      name: "movement",
      icon: "🚶",
      label: "Movement",
    },
    {
      name: "nutrition",
      icon: "🥗",
      label: "Nutrition",
    },
    {
      name: "recovery",
      icon: "🌙",
      label: "Recovery",
    },
    {
      name: "mindset",
      icon: "🌿",
      label: "Mindset",
    },
  ];

  const currentDay =
    Number(journey?.current_day || 1);

  const progress =
    Math.min(
      Math.max(
        (currentDay / 30) * 100,
        0
      ),
      100
    );

  return (
    <main className="journey-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .journey-page {
          min-height: calc(100vh - 100px);
          padding: 18px 24px 34px;

          background:
            radial-gradient(
              circle at 82% 6%,
              rgba(220, 239, 215, 0.82),
              transparent 32%
            ),
            linear-gradient(
              135deg,
              #f8faf6 0%,
              #eef5ec 56%,
              #f8faf7 100%
            );

          color: #173d29;
        }

        .journey-shell {
          width: 100%;
          max-width: 1320px;
          margin: 0 auto;
        }

        /* ==============================
           TOP NAV
           ============================== */

        .journey-topline {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 12px;
        }

        .journey-back {
          color: #23633d;
          font-size: 11px;
          font-weight: 900;
          text-decoration: none;
        }

        .journey-status {
          color: #758178;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        /* ==============================
           HERO
           ============================== */

        .journey-hero {
          padding: 22px 30px;
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
            rgba(20,61,41,.055);
        }

        .journey-eyebrow {
          margin: 0 0 6px;
          color: #287244;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .18em;
          text-transform: uppercase;
        }

        .journey-title {
          margin: 0;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size:
            clamp(34px, 4vw, 52px);

          font-weight: 500;
          line-height: 1;
          letter-spacing: -.035em;
        }

        .journey-lead {
          max-width: 760px;
          margin: 9px 0 0;
          color: #69786f;
          font-size: 13px;
          line-height: 1.5;
        }

        /* ==============================
           MESSAGE
           ============================== */

        .journey-message {
          margin: 12px 0 0;
          padding: 11px 14px;

          border: 1px solid #cfe0ce;
          border-radius: 14px;

          background: #edf6e9;
          color: #23633d;

          font-size: 12px;
          font-weight: 800;
          text-align: center;
        }

        /* ==============================
           MAIN PANEL
           ============================== */

        .journey-panel {
          margin-top: 14px;
          padding: 24px 28px;

          border: 1px solid #dce6dc;
          border-radius: 24px;

          background:
            rgba(255,255,255,.97);

          box-shadow:
            0 14px 38px
            rgba(20,61,41,.05);
        }

        .journey-panel-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 18px;
        }

        .journey-panel-title {
          margin: 0;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 30px;
          line-height: 1.05;
        }

        .journey-panel-copy {
          margin: 6px 0 0;
          color: #6d7b72;
          font-size: 12px;
          line-height: 1.5;
        }

        /* ==============================
           START JOURNEY
           ============================== */

        .journey-start-grid {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr)
            auto;

          gap: 12px;
          align-items: end;
        }

        .journey-field {
          display: grid;
          gap: 7px;
        }

        .journey-label {
          color: #173d29;
          font-size: 11px;
          font-weight: 900;
        }

        .journey-select {
          width: 100%;
          height: 46px;

          padding: 0 14px;

          border: 1px solid #cfddcf;
          border-radius: 14px;

          background: #fbfdf9;
          color: #173d29;

          font: inherit;
          font-size: 13px;
          font-weight: 700;

          outline: none;
        }

        .journey-select:focus {
          border-color: #77a184;

          box-shadow:
            0 0 0 4px
            rgba(59,119,75,.08);
        }

        .journey-primary-button {
          min-height: 46px;

          padding: 0 20px;

          border: none;
          border-radius: 999px;

          background: #237343;
          color: #ffffff;

          font-size: 11px;
          font-weight: 900;

          cursor: pointer;

          box-shadow:
            0 9px 20px
            rgba(35,115,67,.16);
        }

        .journey-primary-button:hover {
          background: #1b6339;
        }

        /* ==============================
           ACTIVE JOURNEY SUMMARY
           ============================== */

        .journey-progress-card {
          padding: 16px 18px;

          border: 1px solid #dbe6da;
          border-radius: 18px;

          background:
            linear-gradient(
              135deg,
              #f3f8f0,
              #fbfdf9
            );

          margin-bottom: 16px;
        }

        .journey-progress-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
        }

        .journey-progress-title {
          margin: 0;
          font-size: 12px;
          font-weight: 900;
        }

        .journey-day {
          color: #267047;
          font-size: 11px;
          font-weight: 900;
        }

        .journey-progress-track {
          width: 100%;
          height: 8px;
          overflow: hidden;

          margin-top: 10px;

          border-radius: 999px;

          background: #dfe9dc;
        }

        .journey-progress-fill {
          height: 100%;
          border-radius: 999px;
          background:
            linear-gradient(
              90deg,
              #237343,
              #7cac55
            );
        }

        /* ==============================
           HABITS
           ============================== */

        .habits-label {
          margin: 0 0 8px;
          color: #173d29;
          font-size: 11px;
          font-weight: 900;
        }

        .habit-grid {
          display: grid;
          grid-template-columns:
            repeat(5, minmax(0, 1fr));

          gap: 9px;
        }

        .habit-card {
          position: relative;

          display: flex;
          min-height: 78px;

          align-items: center;
          gap: 10px;

          padding: 12px;

          border: 1px solid #d9e4d8;
          border-radius: 16px;

          background: #f6faf3;

          color: #173d29;
          cursor: pointer;
        }

        .habit-card input {
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }

        .habit-icon {
          display: grid;
          width: 34px;
          height: 34px;
          flex: 0 0 34px;

          place-items: center;

          border-radius: 10px;

          background: #e8f2e4;
          font-size: 16px;
        }

        .habit-name {
          font-size: 11px;
          font-weight: 900;
        }

        .habit-card:has(input:checked) {
          border-color: #6a9d77;
          background: #e8f4e5;
          box-shadow:
            inset 0 0 0 1px
            rgba(58,124,75,.08);
        }

        /* ==============================
           NOTES
           ============================== */

        .journey-notes {
          width: 100%;
          min-height: 74px;

          margin-top: 12px;
          padding: 12px 14px;

          resize: vertical;

          border: 1px solid #cfddcf;
          border-radius: 14px;

          background: #fbfdf9;
          color: #173d29;

          font: inherit;
          font-size: 12px;
          line-height: 1.5;

          outline: none;
        }

        .journey-notes:focus {
          border-color: #77a184;

          box-shadow:
            0 0 0 4px
            rgba(59,119,75,.08);
        }

        .journey-form-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;

          margin-top: 12px;
        }

        .journey-helper {
          margin: 0;
          color: #7a867e;
          font-size: 10px;
        }

        /* ==============================
           RESPONSIVE
           ============================== */

        @media (max-width: 900px) {
          .habit-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 700px) {
          .journey-page {
            padding: 12px;
          }

          .journey-hero,
          .journey-panel {
            padding: 20px;
            border-radius: 20px;
          }

          .journey-start-grid {
            grid-template-columns: 1fr;
          }

          .journey-primary-button {
            width: 100%;
          }

          .journey-form-footer {
            align-items: stretch;
            flex-direction: column;
          }
        }

        @media (max-width: 460px) {
          .habit-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="journey-shell">
        <div className="journey-topline">
          <Link
            href="/dashboard"
            className="journey-back"
          >
            ← Member Dashboard
          </Link>

          <span className="journey-status">
            30-Day Wellness Journey
          </span>
        </div>

        <section className="journey-hero">
          <p className="journey-eyebrow">
            WonderfulLife Wellness Journey
          </p>

          <h1 className="journey-title">
            Track your healthy habits.
          </h1>

          <p className="journey-lead">
            Build consistency one day at a time with simple
            daily check-ins for hydration, movement, nutrition,
            recovery, and mindset.
          </p>
        </section>

        {params.message ? (
          <div className="journey-message">
            {params.message}
          </div>
        ) : null}

        {!journey ? (
          <form
            action={createJourneyAction}
            className="journey-panel"
          >
            <div className="journey-panel-header">
              <div>
                <h2 className="journey-panel-title">
                  Start your journey
                </h2>

                <p className="journey-panel-copy">
                  Choose the area you would most like to improve
                  over the next 30 days.
                </p>
              </div>
            </div>

            <div className="journey-start-grid">
              <div className="journey-field">
                <label
                  htmlFor="goal"
                  className="journey-label"
                >
                  Your primary goal
                </label>

                <select
                  id="goal"
                  name="goal"
                  className="journey-select"
                >
                  <option>
                    More Energy
                  </option>

                  <option>
                    Better Sleep
                  </option>

                  <option>
                    Daily Nutrition
                  </option>

                  <option>
                    Recovery
                  </option>
                </select>
              </div>

              <button
                type="submit"
                className="journey-primary-button"
              >
                Start My Journey →
              </button>
            </div>
          </form>
        ) : (
          <form
            action={saveCheckinAction}
            className="journey-panel"
          >
            <input
              type="hidden"
              name="journey_id"
              value={journey.id}
            />

            <div className="journey-panel-header">
              <div>
                <p className="journey-eyebrow">
                  Today&apos;s Check-In
                </p>

                <h2 className="journey-panel-title">
                  {journey.title}
                </h2>

                <p className="journey-panel-copy">
                  Check off the healthy habits you completed
                  today.
                </p>
              </div>
            </div>

            <div className="journey-progress-card">
              <div className="journey-progress-top">
                <p className="journey-progress-title">
                  Your 30-day progress
                </p>

                <span className="journey-day">
                  Day {currentDay} of 30
                </span>
              </div>

              <div className="journey-progress-track">
                <div
                  className="journey-progress-fill"
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>
            </div>

            <p className="habits-label">
              Which habits did you complete today?
            </p>

            <div className="habit-grid">
              {habits.map((habit) => (
                <label
                  key={habit.name}
                  className="habit-card"
                >
                  <input
                    type="checkbox"
                    name={habit.name}
                  />

                  <span className="habit-icon">
                    {habit.icon}
                  </span>

                  <span className="habit-name">
                    {habit.label}
                  </span>
                </label>
              ))}
            </div>

            <textarea
              name="notes"
              placeholder="Add a short reflection about today..."
              className="journey-notes"
            />

            <div className="journey-form-footer">
              <p className="journey-helper">
                Small daily actions create meaningful long-term
                change.
              </p>

              <button
                type="submit"
                className="journey-primary-button"
              >
                Save Today&apos;s Check-In →
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}