import Link from "next/link";

import { signUpAction } from "@/lib/actions/auth";

type SignUpSearchParams = {
  message?: string;
};

export default async function SignUp({
  searchParams,
}: {
  searchParams: Promise<SignUpSearchParams>;
}) {
  const params = await searchParams;

  return (
    <main className="signup-page">
      <style>{`
        /* =====================================================
           WONDERFULLIFE SIGN UP
           Vancouver / Apple-inspired member experience
           ===================================================== */

        .signup-page {
          position: relative;
          height: calc(100vh - 108px);
          min-height: 620px;
          overflow: hidden;
          background: #eef4ef;
        }

        /* -----------------------------------------------------
           VANCOUVER BACKGROUND
           ----------------------------------------------------- */

        .signup-background {
          position: absolute;
          inset: 0;

          background-image:
            linear-gradient(
              90deg,
              rgba(248, 250, 246, 0.22) 0%,
              rgba(248, 250, 246, 0.08) 42%,
              rgba(248, 250, 246, 0.18) 100%
            ),
            url("/images/sign-in-vancouver.jpg");

          background-size: cover;
          background-position: center center;
          background-repeat: no-repeat;
        }

        .signup-background::after {
          content: "";
          position: absolute;
          inset: 0;

          background:
            linear-gradient(
              90deg,
              rgba(255,255,255,0.22) 0%,
              rgba(255,255,255,0.04) 46%,
              rgba(255,255,255,0.12) 100%
            );

          pointer-events: none;
        }

        /* -----------------------------------------------------
           MAIN LAYOUT
           ----------------------------------------------------- */

        .signup-shell {
          position: relative;
          z-index: 2;

          width: min(1380px, calc(100% - 56px));
          height: calc(100vh - 108px);
          min-height: 620px;

          margin: 0 auto;

          display: grid;
          grid-template-columns:
            minmax(0, 0.95fr)
            minmax(500px, 0.95fr);

          gap: clamp(42px, 6vw, 96px);

          align-items: center;

          padding: 20px 0 24px;

          box-sizing: border-box;
        }

        /* -----------------------------------------------------
           LEFT STORY
           ----------------------------------------------------- */

        .signup-story {
          max-width: 540px;

          padding-left: 38px;
        }

        .signup-eyebrow {
          margin: 0 0 12px;

          color: #176342;

          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.22em;
          text-transform: uppercase;
        }

        .signup-story-title {
          margin: 0;

          max-width: 530px;

          color: #123f2d;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size:
            clamp(46px, 4.25vw, 66px);

          font-weight: 500;
          line-height: 0.96;
          letter-spacing: -0.047em;
        }

        .signup-story-title em {
          position: relative;

          color: #4f8d43;

          font-weight: 400;
          font-style: italic;
        }

        .signup-story-title em::after {
          content: "";

          position: absolute;

          left: -3%;
          right: -3%;
          bottom: -5px;

          height: 4px;

          border-radius: 999px;

          background: #71a842;

          transform: rotate(-1deg);
        }

        .signup-story-copy {
          max-width: 460px;

          margin: 24px 0 0;

          color: #263d31;

          font-size: 15px;
          line-height: 1.55;
        }

        /* -----------------------------------------------------
           BENEFITS
           ----------------------------------------------------- */

        .signup-benefits {
          display: grid;

          gap: 10px;

          margin-top: 23px;
        }

        .signup-benefit {
          display: flex;

          align-items: center;

          gap: 11px;

          max-width: 410px;

          color: #ffffff;

          font-size: 13px;
          font-weight: 800;

          text-shadow:
            0 1px 5px
            rgba(0,0,0,0.32);
        }

        .signup-benefit-icon {
          width: 32px;
          height: 32px;

          flex: 0 0 32px;

          display: grid;

          place-items: center;

          border-radius: 50%;

          background:
            rgba(3, 91, 58, 0.94);

          color: #ffffff;

          box-shadow:
            0 7px 20px
            rgba(0,0,0,0.14);

          font-size: 13px;
        }

        /* -----------------------------------------------------
           SIGN UP CARD
           ----------------------------------------------------- */

        .signup-card {
          width: 100%;

          padding:
            28px 46px 26px;

          border:
            1px solid
            rgba(255,255,255,0.80);

          border-radius: 26px;

          background:
            rgba(255,255,255,0.93);

          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);

          box-shadow:
            0 24px 70px
            rgba(20,60,40,0.15);

          box-sizing: border-box;
        }

        .signup-card-eyebrow {
          margin: 0 0 7px;

          color: #126241;

          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.19em;
          text-transform: uppercase;
        }

        .signup-card-title {
          margin: 0;

          color: #123f2d;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 44px;

          font-weight: 500;
          line-height: 1;
          letter-spacing: -0.04em;
        }

        .signup-card-intro {
          margin: 10px 0 0;

          color: #5f6e65;

          font-size: 14px;
          line-height: 1.45;
        }

        /* -----------------------------------------------------
           FORM
           ----------------------------------------------------- */

        .signup-form {
          display: grid;

          gap: 12px;

          margin-top: 20px;
        }

        .signup-field {
          display: grid;

          gap: 5px;
        }

        .signup-field label {
          color: #163e2c;

          font-size: 12px;
          font-weight: 900;
        }

        .signup-input {
          width: 100%;
          height: 48px;

          padding: 0 17px;

          border:
            1px solid
            #cfdccf;

          border-radius: 14px;

          outline: none;

          background:
            rgba(248,251,248,0.94);

          color: #182c21;

          font: inherit;
          font-size: 15px;

          box-sizing: border-box;

          transition:
            border-color 150ms ease,
            box-shadow 150ms ease,
            background 150ms ease;
        }

        .signup-input:focus {
          border-color: #649b73;

          background: #ffffff;

          box-shadow:
            0 0 0 4px
            rgba(47,113,67,0.08);
        }

        .signup-password-note {
          margin: 1px 0 0;

          color: #89958d;

          font-size: 10px;
          line-height: 1.35;
        }

        /* -----------------------------------------------------
           CREATE ACCOUNT BUTTON
           ----------------------------------------------------- */

        .signup-button {
          width: 100%;
          height: 50px;

          margin-top: 2px;

          border: none;

          border-radius: 999px;

          background:
            linear-gradient(
              90deg,
              #075d3d 0%,
              #0b7048 100%
            );

          color: #ffffff;

          font-size: 15px;
          font-weight: 900;

          cursor: pointer;

          box-shadow:
            0 10px 24px
            rgba(5,91,57,0.17);

          transition:
            transform 150ms ease,
            box-shadow 150ms ease;
        }

        .signup-button:hover {
          transform: translateY(-1px);

          box-shadow:
            0 14px 28px
            rgba(5,91,57,0.22);
        }

        /* -----------------------------------------------------
           AUTH MESSAGE
           ----------------------------------------------------- */

        .signup-message {
          margin: 0;

          padding: 10px 12px;

          border:
            1px solid
            #dce5dc;

          border-radius: 10px;

          background: #f4f8f3;

          color: #245e3d;

          font-size: 11px;
          font-weight: 700;
          line-height: 1.4;
        }

        /* -----------------------------------------------------
           EXISTING MEMBER
           ----------------------------------------------------- */

        .signup-divider {
          display: flex;

          align-items: center;

          gap: 14px;

          margin: 16px 0 12px;

          color: #759080;

          font-size: 9px;
          font-weight: 700;

          letter-spacing: 0.12em;

          text-transform: uppercase;
        }

        .signup-divider::before,
        .signup-divider::after {
          content: "";

          flex: 1;

          height: 1px;

          background: #d8e2d9;
        }

        .signin-link {
          display: flex;

          width: 100%;
          min-height: 44px;

          align-items: center;
          justify-content: center;

          border:
            1px solid
            #367b55;

          border-radius: 999px;

          background:
            rgba(255,255,255,0.62);

          color: #126141;

          font-size: 13px;
          font-weight: 900;

          text-decoration: none;

          box-sizing: border-box;

          transition:
            background 150ms ease,
            transform 150ms ease;
        }

        .signin-link:hover {
          background: #f2f8f2;

          transform: translateY(-1px);
        }

        .signup-footnote {
          max-width: 430px;

          margin: 10px auto 0;

          color: #7d8982;

          font-size: 9.5px;
          line-height: 1.35;

          text-align: center;
        }

        /* -----------------------------------------------------
           SHORT DESKTOP SCREENS
           ----------------------------------------------------- */

        @media (max-height: 760px) and (min-width: 961px) {
          .signup-page,
          .signup-shell {
            min-height: 560px;
          }

          .signup-shell {
            padding-top: 10px;
            padding-bottom: 12px;
          }

          .signup-story-title {
            font-size: 52px;
          }

          .signup-story-copy {
            margin-top: 18px;
            font-size: 14px;
          }

          .signup-benefits {
            margin-top: 16px;
            gap: 7px;
          }

          .signup-card {
            padding: 21px 38px 20px;
          }

          .signup-card-title {
            font-size: 39px;
          }

          .signup-card-intro {
            margin-top: 7px;
          }

          .signup-form {
            margin-top: 14px;
            gap: 8px;
          }

          .signup-input {
            height: 43px;
          }

          .signup-button {
            height: 44px;
          }

          .signup-divider {
            margin: 11px 0 9px;
          }

          .signin-link {
            min-height: 40px;
          }

          .signup-footnote {
            margin-top: 7px;
          }
        }

        /* -----------------------------------------------------
           TABLET
           ----------------------------------------------------- */

        @media (max-width: 960px) {
          .signup-page {
            height: auto;
            min-height: calc(100vh - 90px);
            overflow: visible;
          }

          .signup-background {
            background-position: 36% center;
          }

          .signup-shell {
            width: min(calc(100% - 28px), 720px);

            height: auto;
            min-height: calc(100vh - 90px);

            grid-template-columns: 1fr;

            gap: 28px;

            padding: 34px 0 50px;
          }

          .signup-story {
            max-width: 600px;

            padding:
              36px 22px 10px;
          }

          .signup-story-title {
            font-size:
              clamp(44px, 10vw, 64px);
          }

          .signup-benefits {
            display: none;
          }

          .signup-card {
            max-width: 620px;

            margin: 0 auto;
          }
        }

        /* -----------------------------------------------------
           MOBILE
           ----------------------------------------------------- */

        @media (max-width: 600px) {
          .signup-background::after {
            background:
              rgba(247,250,246,0.48);
          }

          .signup-shell {
            width: calc(100% - 20px);

            padding:
              20px 0 38px;
          }

          .signup-story {
            padding:
              22px 14px 2px;
          }

          .signup-eyebrow {
            margin-bottom: 9px;

            font-size: 10px;
          }

          .signup-story-title {
            font-size: 43px;
          }

          .signup-story-copy {
            margin-top: 21px;

            font-size: 14px;
          }

          .signup-card {
            padding:
              27px 21px 29px;

            border-radius: 22px;
          }

          .signup-card-title {
            font-size: 39px;
          }

          .signup-form {
            margin-top: 20px;
          }

          .signup-input {
            height: 50px;
          }

          .signup-button {
            height: 50px;
          }
        }
      `}</style>

      <div className="signup-background" />

      <div className="signup-shell">
        {/* LEFT SIDE */}

        <section className="signup-story">
          <p className="signup-eyebrow">
            WonderfulLife
          </p>

          <h1 className="signup-story-title">
            Begin your
            <br />
            <em>healthier</em>
            <br />
            life today.
          </h1>

          <p className="signup-story-copy">
            Create your free WonderfulLife account and make your
            wellness experience more personal, useful, and connected.
          </p>

          <div className="signup-benefits">
            <div className="signup-benefit">
              <span className="signup-benefit-icon">
                ♡
              </span>

              <span>
                Save recipes, articles, and wellness favourites
              </span>
            </div>

            <div className="signup-benefit">
              <span className="signup-benefit-icon">
                ◉
              </span>

              <span>
                Join conversations with the WonderfulLife community
              </span>
            </div>

            <div className="signup-benefit">
              <span className="signup-benefit-icon">
                ✓
              </span>

              <span>
                Personalize your WonderfulLife wellness journey
              </span>
            </div>
          </div>
        </section>

        {/* RIGHT CARD */}

        <section className="signup-card">
          <p className="signup-card-eyebrow">
            Free Membership
          </p>

          <h2 className="signup-card-title">
            Join WonderfulLife
          </h2>

          <p className="signup-card-intro">
            Create your account in just a few seconds.
          </p>

          <form
            action={signUpAction}
            className="signup-form"
          >
            <div className="signup-field">
              <label htmlFor="display_name">
                Your name
              </label>

              <input
                id="display_name"
                name="display_name"
                type="text"
                className="signup-input"
                placeholder="How should we address you?"
                autoComplete="name"
                required
              />
            </div>

            <div className="signup-field">
              <label htmlFor="email">
                Email address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                className="signup-input"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="signup-field">
              <label htmlFor="password">
                Create a password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                className="signup-input"
                placeholder="Create your password"
                autoComplete="new-password"
                required
              />

              <p className="signup-password-note">
                Choose a password you'll remember and keep private.
              </p>
            </div>

            <button
              type="submit"
              className="signup-button"
            >
              Create My Free Account
            </button>

            {params.message ? (
              <p className="signup-message">
                {params.message}
              </p>
            ) : null}
          </form>

          <div className="signup-divider">
            Already a member?
          </div>

          <Link
            href="/sign-in"
            className="signin-link"
          >
            Sign In to WonderfulLife
          </Link>

          <p className="signup-footnote">
            Your account lets you save content, participate in
            conversations, and personalize your WonderfulLife experience.
          </p>
        </section>
      </div>
    </main>
  );
}