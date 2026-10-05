import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import JoinForm from "./JoinForm";

export const metadata: Metadata = {
  title: "Join Our Team | Wonderful-Life",
  description:
    "Explore the Wonderful-Life team and the USANA Brand Partner opportunity. Greater Vancouver is our primary focus, and inquiries from everywhere are welcome.",
};

export default function JoinPage() {
  return (
    <>
      <main className="join-page">
        {/* ZOEY HERO IMAGE */}
        <section className="join-photo">
          <div className="join-photo-inner">
            <Image
              src="/images/join/join-zoey-hero.png"
              alt="Zoey from Wonderful-Life"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 760px"
              className="join-photo-image"
            />

            <div className="join-photo-shade" />
          </div>
        </section>

        {/* MAIN CTA */}
        <section className="join-hero">
          <div className="join-shell">
            <div className="join-eyebrow">
              <span />
              JOIN OUR TEAM
            </div>

            <h1>
              Build something
              <br />
              <em>around your life.</em>
            </h1>

            <p className="join-hero-copy">
              Wonderful-Life is growing its{" "}
              <strong>Greater Vancouver team</strong> and introducing people
              to the <strong>USANA Brand Partner opportunity.</strong>
            </p>

            <p className="join-anywhere">
              Outside Vancouver? You're welcome to inquire too.
            </p>

            <a href="#join-form" className="join-main-button">
              I'm Interested
              <span aria-hidden="true">↓</span>
            </a>
          </div>
        </section>

        {/* INQUIRY FORM */}
        <section className="join-form-section" id="join-form">
          <div className="join-shell">
            <div className="join-form-heading">
              <span>LET'S TALK</span>

              <h2>Interested? Say hello.</h2>

              <p>
                No pressure. No obligation.
                <br />
                Just start the conversation.
              </p>
            </div>

            <div className="join-form-card">
              <JoinForm />
            </div>
          </div>
        </section>

        {/* MORE INFORMATION */}
        <section className="join-more">
          <div className="join-shell">
            <div className="join-brand-line">
              <span>WONDERFUL-LIFE</span>
              <b>×</b>
              <span>USANA</span>
            </div>

            <h2>Want to know more?</h2>

            <p>
              Wonderful-Life introduces interested people to USANA products
              and the independent Brand Partner opportunity.
            </p>

            <Link href="/join-our-team" className="join-more-link">
              Explore the Full Opportunity
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </main>

      <style>{`
        :root {
          --green: #123f32;
          --deep-green: #0b3027;
          --gold: #c6a15b;
          --cream: #f7f4ec;
          --text: #18332b;
          --muted: #697873;
        }

        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        .join-page {
          background: #ffffff;
          color: var(--text);
          overflow: hidden;
        }

        .join-shell {
          width: min(100% - 32px, 760px);
          margin: 0 auto;
        }

        /* =========================
           ZOEY PHOTO
        ========================= */

        .join-photo {
          background: var(--deep-green);
        }

        .join-photo-inner {
          position: relative;
          width: min(100%, 760px);
          height: min(58vh, 610px);
          min-height: 470px;
          margin: 0 auto;
          overflow: hidden;
          background: #e8e6df;
        }

        .join-photo-image {
          object-fit: cover;
          object-position: center 27%;
        }

        .join-photo-shade {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          background: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0) 65%,
            rgba(6, 33, 26, 0.12) 100%
          );
        }

        /* =========================
           CTA / INTRO
        ========================= */

        .join-hero {
          position: relative;
          padding: 40px 0 39px;
          background:
            radial-gradient(
              circle at 100% 0%,
              rgba(198, 161, 91, 0.13),
              transparent 32%
            ),
            linear-gradient(
              145deg,
              #faf7ef 0%,
              #fdfcf8 62%,
              #eef4ec 100%
            );
        }

        .join-eyebrow {
          display: flex;
          align-items: center;
          gap: 11px;
          margin-bottom: 15px;
          color: var(--green);
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.2em;
        }

        .join-eyebrow span {
          width: 29px;
          height: 2px;
          background: var(--gold);
        }

        .join-hero h1 {
          max-width: 690px;
          margin: 0;
          color: var(--deep-green);
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(45px, 11vw, 68px);
          font-weight: 500;
          line-height: 0.98;
          letter-spacing: -0.045em;
        }

        .join-hero h1 em {
          color: var(--gold);
          font-weight: 500;
        }

        .join-hero-copy {
          max-width: 610px;
          margin: 20px 0 0;
          color: #425c53;
          font-size: 16px;
          line-height: 1.55;
        }

        .join-hero-copy strong {
          color: var(--green);
        }

        .join-anywhere {
          margin: 7px 0 0;
          color: var(--muted);
          font-size: 12px;
          line-height: 1.5;
        }

        .join-main-button {
          width: 100%;
          min-height: 54px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          margin-top: 21px;
          border-radius: 999px;
          background: var(--green);
          color: #ffffff;
          text-decoration: none;
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 0.04em;
          box-shadow: 0 13px 28px rgba(18, 63, 50, 0.19);
          transition:
            transform 180ms ease,
            box-shadow 180ms ease;
        }

        .join-main-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 17px 34px rgba(18, 63, 50, 0.24);
        }

        /* =========================
           FORM
        ========================= */

        .join-form-section {
          padding: 40px 0 44px;
          background: var(--cream);
          scroll-margin-top: 8px;
        }

        .join-form-heading {
          margin-bottom: 17px;
          text-align: center;
        }

        .join-form-heading > span {
          color: var(--gold);
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.2em;
        }

        .join-form-heading h2 {
          margin: 6px 0 7px;
          color: var(--deep-green);
          font-family: Georgia, "Times New Roman", serif;
          font-size: 35px;
          font-weight: 500;
          line-height: 1;
          letter-spacing: -0.035em;
        }

        .join-form-heading p {
          margin: 0;
          color: var(--muted);
          font-size: 12px;
          line-height: 1.45;
        }

        .join-form-card {
          padding: 20px 18px;
          border: 1px solid rgba(18, 63, 50, 0.08);
          border-radius: 20px;
          background: #ffffff;
          box-shadow: 0 14px 38px rgba(18, 63, 50, 0.06);
        }

        .join-form {
          display: grid;
          gap: 12px;
        }

        .join-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 11px;
        }

        .join-field {
          display: grid;
          gap: 5px;
        }

        .join-field label {
          color: var(--green);
          font-size: 11px;
          font-weight: 850;
        }

        .join-optional {
          color: #98a29e;
          font-weight: 600;
        }

        .join-field input,
        .join-field select,
        .join-field textarea {
          width: 100%;
          border: 1px solid rgba(18, 63, 50, 0.15);
          border-radius: 11px;
          outline: none;
          background: #fbfcfa;
          color: var(--text);
          font: inherit;
          font-size: 16px;
          transition:
            border-color 160ms ease,
            box-shadow 160ms ease,
            background 160ms ease;
        }

        .join-field input,
        .join-field select {
          height: 46px;
          padding: 0 12px;
        }

        .join-field textarea {
          min-height: 68px;
          padding: 11px 12px;
          resize: vertical;
          line-height: 1.4;
        }

        .join-field input:focus,
        .join-field select:focus,
        .join-field textarea:focus {
          border-color: rgba(18, 63, 50, 0.52);
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(18, 63, 50, 0.055);
        }

        .join-submit {
          width: 100%;
          min-height: 50px;
          border: 0;
          border-radius: 999px;
          background: var(--green);
          color: #ffffff;
          cursor: pointer;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.04em;
          box-shadow: 0 10px 24px rgba(18, 63, 50, 0.16);
          transition:
            transform 180ms ease,
            box-shadow 180ms ease,
            opacity 180ms ease;
        }

        .join-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 14px 29px rgba(18, 63, 50, 0.21);
        }

        .join-submit:disabled {
          cursor: default;
          opacity: 0.7;
        }

        .join-success,
        .join-error {
          padding: 11px 13px;
          border-radius: 11px;
          text-align: center;
          font-size: 12px;
          line-height: 1.45;
        }

        .join-success {
          display: grid;
          gap: 2px;
          background: #edf7ef;
          color: #185d35;
        }

        .join-error {
          background: #fff1ef;
          color: #96392f;
          font-weight: 700;
        }

        .join-privacy {
          margin: -1px 0 0;
          color: #8c9793;
          text-align: center;
          font-size: 9px;
          line-height: 1.4;
        }

        /* =========================
           MORE INFORMATION
        ========================= */

        .join-more {
          padding: 38px 0 42px;
          background: var(--deep-green);
          color: #ffffff;
          text-align: center;
        }

        .join-brand-line {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 18px;
          color: rgba(255, 255, 255, 0.75);
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.12em;
        }

        .join-brand-line b {
          color: var(--gold);
          font-family: Georgia, "Times New Roman", serif;
          font-size: 20px;
          font-weight: 400;
        }

        .join-more h2 {
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 32px;
          font-weight: 500;
          letter-spacing: -0.025em;
        }

        .join-more p {
          max-width: 560px;
          margin: 11px auto 19px;
          color: rgba(255, 255, 255, 0.67);
          font-size: 12px;
          line-height: 1.55;
        }

        .join-more-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 13px;
          min-height: 46px;
          padding: 0 20px;
          border: 1px solid rgba(255, 255, 255, 0.22);
          border-radius: 999px;
          color: #ffffff;
          text-decoration: none;
          font-size: 12px;
          font-weight: 850;
        }

        /* =========================
           MOBILE — PRIMARY EXPERIENCE
        ========================= */

        @media (max-width: 600px) {
          .join-shell {
            width: calc(100% - 28px);
          }

          .join-photo-inner {
            width: 100%;
            height: 41vh;
            min-height: 300px;
            max-height: 390px;
          }

          .join-photo-image {
            object-position: center 25%;
          }

          .join-hero {
            padding: 25px 0 27px;
          }

          .join-eyebrow {
            margin-bottom: 11px;
            font-size: 9px;
          }

          .join-eyebrow span {
            width: 24px;
          }

          .join-hero h1 {
            font-size: clamp(39px, 11.4vw, 49px);
            line-height: 0.98;
          }

          .join-hero-copy {
            max-width: 98%;
            margin-top: 14px;
            font-size: 13px;
            line-height: 1.45;
          }

          .join-anywhere {
            margin-top: 5px;
            font-size: 10.5px;
          }

          .join-main-button {
            min-height: 50px;
            margin-top: 16px;
            font-size: 12px;
          }

          /* Compact mobile inquiry */

          .join-form-section {
            padding: 31px 0 36px;
          }

          .join-form-heading {
            margin-bottom: 14px;
          }

          .join-form-heading > span {
            font-size: 8px;
          }

          .join-form-heading h2 {
            margin-top: 5px;
            font-size: 32px;
          }

          .join-form-heading p {
            font-size: 11px;
          }

          .join-form-card {
            padding: 16px 14px;
            border-radius: 17px;
          }

          .join-form {
            gap: 10px;
          }

          .join-form-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .join-field {
            gap: 4px;
          }

          .join-field label {
            font-size: 10px;
          }

          /*
            Keep input text at 16px on mobile.
            This helps prevent iPhone Safari from zooming
            when a visitor taps a field.
          */

          .join-field input,
          .join-field select {
            height: 44px;
            font-size: 16px;
          }

          .join-field textarea {
            min-height: 62px;
            font-size: 16px;
          }

          .join-submit {
            min-height: 48px;
            font-size: 12px;
          }

          .join-privacy {
            font-size: 9px;
          }

          .join-more {
            padding: 33px 0 37px;
          }

          .join-brand-line {
            margin-bottom: 15px;
            font-size: 9px;
          }

          .join-more h2 {
            font-size: 29px;
          }

          .join-more p {
            font-size: 11px;
          }

          .join-more-link {
            width: 100%;
            min-height: 45px;
          }
        }

        /* =========================
           TABLET / DESKTOP
        ========================= */

        @media (min-width: 601px) {
          .join-photo {
            padding: 28px 0 0;
          }

          .join-photo-inner {
            border-radius: 28px 28px 0 0;
          }
        }
      `}</style>
    </>
  );
}