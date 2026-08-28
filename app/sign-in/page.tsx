import Link from "next/link";

import { signInAction } from "@/lib/actions/auth";

type SignInSearchParams = {
  message?: string;
};

export default async function SignIn({
  searchParams,
}: {
  searchParams: Promise<SignInSearchParams>;
}) {
  const params = await searchParams;

  return (
    <main className="signin-page">
      <style>{`
        /* =====================================================
           WONDERFULLIFE SIGN IN
           Compact Vancouver / Apple-inspired experience
           ===================================================== */

        .signin-page {
          position: relative;
          height: calc(100vh - 108px);
          min-height: 620px;
          overflow: hidden;
          background: #eef4ef;
        }

        /* -----------------------------------------------------
           VANCOUVER BACKGROUND
           ----------------------------------------------------- */

        .signin-background {
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

        .signin-background::after {
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

        .signin-shell {
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

        .signin-story {
          max-width: 540px;

          padding-left: 38px;
          padding-top: 0;
        }

        .signin-eyebrow {
          margin: 0 0 12px;

          color: #176342;

          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.22em;
          text-transform: uppercase;
        }

        .signin-story-title {
          margin: 0;

          max-width: 520px;

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

        .signin-story-title em {
          position: relative;

          color: #4f8d43;

          font-weight: 400;
          font-style: italic;
        }

        .signin-story-title em::after {
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

        .signin-story-copy {
          max-width: 455px;

          margin: 24px 0 0;

          color: #263d31;

          font-size: 15px;
          line-height: 1.55;
        }

        /* -----------------------------------------------------
           BENEFITS
           ----------------------------------------------------- */

        .signin-benefits {
          display: grid;

          gap: 10px;

          margin-top: 23px;
        }

        .signin-benefit {
          display: flex;

          align-items: center;

          gap: 11px;

          max-width: 390px;

          color: #ffffff;

          font-size: 13px;
          font-weight: 800;

          text-shadow:
            0 1px 5px
            rgba(0,0,0,0.32);
        }

        .signin-benefit-icon {
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
           LOGIN CARD
           ----------------------------------------------------- */

        .signin-card {
          width: 100%;

          padding:
            30px 46px 28px;

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

        .signin-card-eyebrow {
          margin: 0 0 7px;

          color: #126241;

          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.19em;
          text-transform: uppercase;
        }

        .signin-card-title {
          margin: 0;

          color: #123f2d;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 46px;

          font-weight: 500;
          line-height: 1;
          letter-spacing: -0.04em;
        }

        .signin-card-intro {
          margin: 11px 0 0;

          color: #5f6e65;

          font-size: 14px;
          line-height: 1.45;
        }

        /* -----------------------------------------------------
           FORM
           ----------------------------------------------------- */

        .signin-form {
          display: grid;

          gap: 13px;

          margin-top: 22px;
        }

        .signin-field {
          display: grid;

          gap: 6px;
        }

        .signin-label-row {
          display: flex;

          align-items: center;
          justify-content: space-between;

          gap: 18px;
        }

        .signin-field label {
          color: #163e2c;

          font-size: 12px;
          font-weight: 900;
        }

        .signin-input {
          width: 100%;
          height: 50px;

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

        .signin-input:focus {
          border-color: #649b73;

          background: #ffffff;

          box-shadow:
            0 0 0 4px
            rgba(47,113,67,0.08);
        }

        .forgot-placeholder {
          color: #226444;

          font-size: 11px;
          font-weight: 700;

          opacity: 0.72;
        }

        /* -----------------------------------------------------
           SIGN IN BUTTON
           ----------------------------------------------------- */

        .signin-button {
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

        .signin-button:hover {
          transform: translateY(-1px);

          box-shadow:
            0 14px 28px
            rgba(5,91,57,0.22);
        }

        /* -----------------------------------------------------
           AUTH MESSAGE
           ----------------------------------------------------- */

        .signin-message {
          margin: 0;

          padding: 10px 12px;

          border:
            1px solid
            #ead7d7;

          border-radius: 10px;

          background: #fff6f6;

          color: #8c4f4f;

          font-size: 11px;
          line-height: 1.4;
        }

        /* -----------------------------------------------------
           NEW ACCOUNT
           ----------------------------------------------------- */

        .signin-divider {
          display: flex;

          align-items: center;

          gap: 14px;

          margin: 17px 0 13px;

          color: #759080;

          font-size: 9px;
          font-weight: 700;

          letter-spacing: 0.12em;

          text-transform: uppercase;
        }

        .signin-divider::before,
        .signin-divider::after {
          content: "";

          flex: 1;

          height: 1px;

          background: #d8e2d9;
        }

        .create-account {
          display: flex;

          width: 100%;
          min-height: 46px;

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

        .create-account:hover {
          background: #f2f8f2;

          transform: translateY(-1px);
        }

        .signin-footnote {
          max-width: 430px;

          margin: 12px auto 0;

          color: #7d8982;

          font-size: 9.5px;
          line-height: 1.35;

          text-align: center;
        }

        /* -----------------------------------------------------
           SHORTER DESKTOP SCREENS
           ----------------------------------------------------- */

        @media (max-height: 760px) and (min-width: 961px) {
          .signin-page,
          .signin-shell {
            min-height: 560px;
          }

          .signin-shell {
            padding-top: 12px;
            padding-bottom: 14px;
          }

          .signin-story-title {
            font-size: 54px;
          }

          .signin-story-copy {
            margin-top: 19px;
            font-size: 14px;
          }

          .signin-benefits {
            margin-top: 18px;
            gap: 8px;
          }

          .signin-card {
            padding: 24px 40px 22px;
          }

          .signin-card-title {
            font-size: 42px;
          }

          .signin-card-intro {
            margin-top: 8px;
          }

          .signin-form {
            margin-top: 17px;
            gap: 10px;
          }

          .signin-input {
            height: 46px;
          }

          .signin-button {
            height: 46px;
          }

          .signin-divider {
            margin: 13px 0 10px;
          }

          .create-account {
            min-height: 42px;
          }

          .signin-footnote {
            margin-top: 9px;
          }
        }

        /* -----------------------------------------------------
           TABLET
           ----------------------------------------------------- */

        @media (max-width: 960px) {
          .signin-page {
            height: auto;
            min-height: calc(100vh - 90px);
            overflow: visible;
          }

          .signin-background {
            background-position: 36% center;
          }

          .signin-shell {
            width: min(calc(100% - 28px), 720px);

            height: auto;
            min-height: calc(100vh - 90px);

            grid-template-columns: 1fr;

            gap: 28px;

            padding: 34px 0 50px;
          }

          .signin-story {
            max-width: 600px;

            padding:
              36px 22px 10px;
          }

          .signin-story-title {
            font-size:
              clamp(44px, 10vw, 64px);
          }

          .signin-benefits {
            display: none;
          }

          .signin-card {
            max-width: 620px;

            margin: 0 auto;
          }
        }

        /* -----------------------------------------------------
           MOBILE
           ----------------------------------------------------- */

        @media (max-width: 600px) {
          .signin-background::after {
            background:
              rgba(247,250,246,0.48);
          }

          .signin-shell {
            width: calc(100% - 20px);

            padding:
              20px 0 38px;
          }

          .signin-story {
            padding:
              22px 14px 2px;
          }

          .signin-eyebrow {
            margin-bottom: 9px;

            font-size: 10px;
          }

          .signin-story-title {
            font-size: 43px;
          }

          .signin-story-copy {
            margin-top: 21px;

            font-size: 14px;
          }

          .signin-card {
            padding:
              28px 21px 30px;

            border-radius: 22px;
          }

          .signin-card-title {
            font-size: 40px;
          }

          .signin-form {
            margin-top: 23px;
          }

          .signin-input {
            height: 52px;
          }

          .signin-button {
            height: 52px;
          }
        }
      `}</style>

      <div className="signin-background" />

      <div className="signin-shell">
        {/* LEFT SIDE */}

        <section className="signin-story">
          <p className="signin-eyebrow">
            WonderfulLife
          </p>

          <h1 className="signin-story-title">
            Welcome back
            <br />
            to your
            <br />
            <em>healthier</em> life.
          </h1>

          <p className="signin-story-copy">
            Sign in to continue your WonderfulLife journey,
            save content, join conversations, and personalize
            your wellness experience.
          </p>

          <div className="signin-benefits">
            <div className="signin-benefit">
              <span className="signin-benefit-icon">
                ♡
              </span>

              <span>
                Save your favourite recipes and articles
              </span>
            </div>

            <div className="signin-benefit">
              <span className="signin-benefit-icon">
                ◉
              </span>

              <span>
                Join WonderfulLife community conversations
              </span>
            </div>

            <div className="signin-benefit">
              <span className="signin-benefit-icon">
                ✓
              </span>

              <span>
                Build your personalized wellness journey
              </span>
            </div>
          </div>
        </section>

        {/* RIGHT CARD */}

        <section className="signin-card">
          <p className="signin-card-eyebrow">
            Member Sign In
          </p>

          <h2 className="signin-card-title">
            Sign in
          </h2>

          <p className="signin-card-intro">
            Enter your email and password to continue.
          </p>

          <form
            action={signInAction}
            className="signin-form"
          >
            <div className="signin-field">
              <label htmlFor="email">
                Email address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                className="signin-input"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="signin-field">
              <div className="signin-label-row">
                <label htmlFor="password">
                  Password
                </label>

                <span className="forgot-placeholder">
                  Forgot password?
                </span>
              </div>

              <input
                id="password"
                name="password"
                type="password"
                className="signin-input"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              className="signin-button"
            >
              Sign In
            </button>

            {params.message ? (
              <p className="signin-message">
                {params.message}
              </p>
            ) : null}
          </form>

          <div className="signin-divider">
            New to WonderfulLife?
          </div>

          <Link
            href="/sign-up"
            className="create-account"
          >
            Create a Free Account
          </Link>

          <p className="signin-footnote">
            Your WonderfulLife account lets you personalize your
            experience and participate in the community.
          </p>
        </section>
      </div>
    </main>
  );
}