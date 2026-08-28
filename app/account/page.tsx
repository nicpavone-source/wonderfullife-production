import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export default async function AccountPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const displayName =
    profile?.display_name ||
    profile?.full_name ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    "WonderfulLife Member";

  const initials = displayName
    .split(" ")
    .map((word: string) => word.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <main className="account-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .account-page {
          min-height: calc(100vh - 100px);
          padding: 18px 24px 34px;

          background:
            radial-gradient(
              circle at 82% 5%,
              rgba(221, 239, 217, 0.82),
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

        .account-shell {
          width: 100%;
          max-width: 1320px;
          margin: 0 auto;
        }

        /* ==============================
           TOP LINE
           ============================== */

        .account-topline {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 12px;
        }

        .account-back {
          color: #23633d;
          font-size: 11px;
          font-weight: 900;
          text-decoration: none;
        }

        .account-status {
          color: #758178;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        /* ==============================
           HERO
           ============================== */

        .account-hero {
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

        .account-eyebrow {
          margin: 0 0 6px;
          color: #287244;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .18em;
          text-transform: uppercase;
        }

        .account-title {
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

        .account-lead {
          max-width: 760px;
          margin: 9px 0 0;
          color: #69786f;
          font-size: 13px;
          line-height: 1.5;
        }

        /* ==============================
           MAIN GRID
           ============================== */

        .account-grid {
          display: grid;

          grid-template-columns:
            minmax(0, 1.25fr)
            minmax(300px, .75fr);

          gap: 14px;
          margin-top: 14px;
        }

        .account-card {
          border: 1px solid #dce6dc;
          border-radius: 22px;
          background: rgba(255,255,255,.97);

          box-shadow:
            0 12px 32px
            rgba(20,61,41,.05);
        }

        /* ==============================
           PROFILE
           ============================== */

        .profile-card {
          padding: 24px 28px;
        }

        .profile-header {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .profile-avatar {
          display: grid;
          width: 68px;
          height: 68px;
          flex: 0 0 68px;

          place-items: center;

          border-radius: 50%;

          background: #e7f2e3;
          color: #237343;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 21px;
          font-weight: 800;
        }

        .profile-label {
          margin: 0;
          color: #287244;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .15em;
          text-transform: uppercase;
        }

        .profile-name {
          margin: 5px 0 0;

          color: #173d29;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 30px;
          line-height: 1.05;
        }

        .profile-email {
          margin: 5px 0 0;
          color: #718078;
          font-size: 12px;
        }

        .profile-divider {
          height: 1px;
          margin: 20px 0;
          background: #e1e9df;
        }

        .profile-details {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .profile-detail {
          padding: 15px 16px;

          border: 1px solid #e0e9de;
          border-radius: 15px;

          background: #f5f9f3;
        }

        .profile-detail-label {
          margin: 0;
          color: #7a877f;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .12em;
          text-transform: uppercase;
        }

        .profile-detail-value {
          margin: 6px 0 0;
          color: #173d29;
          font-size: 13px;
          font-weight: 800;
          line-height: 1.35;
          word-break: break-word;
        }

        .membership-box {
          margin-top: 14px;
          padding: 16px 18px;

          border: 1px solid #dce6dc;
          border-radius: 16px;

          background:
            linear-gradient(
              135deg,
              #f3f8f0,
              #fbfdf9
            );
        }

        .membership-title {
          margin: 0;

          color: #173d29;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 21px;
        }

        .membership-copy {
          margin: 7px 0 0;
          color: #68776e;
          font-size: 11.5px;
          line-height: 1.5;
        }

        /* ==============================
           MEMBER LINKS
           ============================== */

        .member-card {
          padding: 22px;
        }

        .member-title {
          margin: 0;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 25px;
          line-height: 1.05;
        }

        .member-copy {
          margin: 7px 0 15px;
          color: #6d7b72;
          font-size: 11px;
          line-height: 1.45;
        }

        .member-links {
          display: grid;
          gap: 8px;
        }

        .member-link {
          display: flex;
          min-height: 44px;

          align-items: center;
          justify-content: space-between;

          padding: 0 14px;

          border: 1px solid #dce6dc;
          border-radius: 13px;

          background: #f5f9f3;
          color: #173d29;

          font-size: 11px;
          font-weight: 900;
          text-decoration: none;

          transition:
            transform 150ms ease,
            background 150ms ease;
        }

        .member-link:hover {
          transform: translateY(-1px);
          background: #eaf3e6;
        }

        /* ==============================
           PRIVACY
           ============================== */

        .privacy-box {
          margin-top: 10px;
          padding: 14px 15px;

          border-radius: 14px;
          background: #eef5ec;
        }

        .privacy-title {
          margin: 0;
          color: #173d29;
          font-size: 11px;
          font-weight: 900;
        }

        .privacy-copy {
          margin: 5px 0 0;
          color: #718078;
          font-size: 10px;
          line-height: 1.45;
        }

        /* ==============================
           RESPONSIVE
           ============================== */

        @media (max-width: 850px) {
          .account-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .account-page {
            padding: 12px;
          }

          .account-hero,
          .profile-card,
          .member-card {
            border-radius: 19px;
          }

          .account-hero {
            padding: 20px;
          }

          .profile-card {
            padding: 20px;
          }

          .profile-details {
            grid-template-columns: 1fr;
          }

          .profile-name {
            font-size: 26px;
          }

          .account-status {
            display: none;
          }
        }
      `}</style>

      <div className="account-shell">
        <div className="account-topline">
          <Link
            href="/dashboard"
            className="account-back"
          >
            ← Member Dashboard
          </Link>

          <span className="account-status">
            WonderfulLife Member Account
          </span>
        </div>

        <section className="account-hero">
          <p className="account-eyebrow">
            WonderfulLife Member
          </p>

          <h1 className="account-title">
            Your Account
          </h1>

          <p className="account-lead">
            Your personal WonderfulLife profile and member
            experience in one place.
          </p>
        </section>

        <section className="account-grid">
          {/* PROFILE */}

          <article className="account-card profile-card">
            <div className="profile-header">
              <div className="profile-avatar">
                {initials}
              </div>

              <div>
                <p className="profile-label">
                  Member Profile
                </p>

                <h2 className="profile-name">
                  {displayName}
                </h2>

                <p className="profile-email">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="profile-divider" />

            <div className="profile-details">
              <div className="profile-detail">
                <p className="profile-detail-label">
                  Name
                </p>

                <p className="profile-detail-value">
                  {displayName}
                </p>
              </div>

              <div className="profile-detail">
                <p className="profile-detail-label">
                  Email
                </p>

                <p className="profile-detail-value">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="membership-box">
              <h3 className="membership-title">
                Your WonderfulLife Membership
              </h3>

              <p className="membership-copy">
                Your account connects your wellness journey,
                saved articles, recipes and videos, community
                participation, and conversations with Zoey.
              </p>
            </div>
          </article>

          {/* MEMBER AREA */}

          <aside className="account-card member-card">
            <p className="account-eyebrow">
              Quick Access
            </p>

            <h2 className="member-title">
              Member Area
            </h2>

            <p className="member-copy">
              Continue your WonderfulLife experience.
            </p>

            <div className="member-links">
              <Link
                href="/dashboard"
                className="member-link"
              >
                Dashboard
                <span>→</span>
              </Link>

              <Link
                href="/journey"
                className="member-link"
              >
                Wellness Journey
                <span>→</span>
              </Link>

              <Link
                href="/saved"
                className="member-link"
              >
                Saved Content
                <span>→</span>
              </Link>

              <Link
                href="/ask-zoey"
                className="member-link"
              >
                Ask Zoey
                <span>→</span>
              </Link>
            </div>

            <div className="privacy-box">
              <p className="privacy-title">
                Privacy
              </p>

              <p className="privacy-copy">
                Your WonderfulLife member account is private
                and personalized to your experience.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}