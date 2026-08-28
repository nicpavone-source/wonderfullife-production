import Link from "next/link";

export const metadata = {
  title: "Contact WonderfulLife | WonderfulLife.ca",
  description:
    "Contact the WonderfulLife team with questions about wellness, WonderfulLife, or the opportunity.",
};

export default function ContactPage() {
  return (
    <main className="wl-contact-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .wl-contact-page {
          min-height: 100vh;
          padding: 54px 20px 80px;
          background:
            radial-gradient(
              circle at 80% 10%,
              rgba(224, 239, 224, 0.8),
              transparent 34%
            ),
            linear-gradient(
              180deg,
              #fbfcfa 0%,
              #f3f7f1 100%
            );
          color: #173d29;
        }

        .wl-contact-shell {
          width: min(100%, 1080px);
          margin: 0 auto;
        }

        .wl-contact-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 28px;
          color: #23633d;
          font-size: 13px;
          font-weight: 900;
          text-decoration: none;
        }

        .wl-contact-header {
          max-width: 760px;
          margin-bottom: 34px;
        }

        .wl-contact-eyebrow {
          margin: 0 0 9px;
          color: #287244;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.17em;
          text-transform: uppercase;
        }

        .wl-contact-title {
          margin: 0;
          color: #123f2a;
          font-family:
            Georgia,
            "Times New Roman",
            serif;
          font-size: clamp(42px, 6vw, 68px);
          line-height: 0.98;
          letter-spacing: -0.035em;
        }

        .wl-contact-intro {
          max-width: 690px;
          margin: 18px 0 0;
          color: #627168;
          font-size: 17px;
          line-height: 1.65;
        }

        .wl-contact-grid {
          display: grid;
          grid-template-columns:
            minmax(0, 1.35fr)
            minmax(280px, 0.65fr);
          gap: 24px;
          align-items: start;
        }

        .wl-contact-form-card,
        .wl-contact-info-card {
          border: 1px solid #dce6db;
          border-radius: 26px;
          background: #ffffff;
          box-shadow:
            0 16px 45px
            rgba(20, 61, 41, 0.06);
        }

        .wl-contact-form-card {
          padding: 32px;
        }

        .wl-contact-form-title {
          margin: 0;
          color: #173d29;
          font-family:
            Georgia,
            "Times New Roman",
            serif;
          font-size: 31px;
          line-height: 1.08;
        }

        .wl-contact-form-note {
          margin: 10px 0 24px;
          color: #718077;
          font-size: 13px;
          line-height: 1.6;
        }

        .wl-contact-form {
          display: grid;
          gap: 17px;
        }

        .wl-contact-two-column {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .wl-contact-field {
          display: grid;
          gap: 7px;
        }

        .wl-contact-field label {
          color: #31533c;
          font-size: 12px;
          font-weight: 900;
        }

        .wl-contact-field input,
        .wl-contact-field select,
        .wl-contact-field textarea {
          width: 100%;
          border: 1px solid #d5e0d4;
          border-radius: 14px;
          background: #fbfcfa;
          color: #173d29;
          font: inherit;
          font-size: 15px;
          outline: none;
          transition:
            border-color 160ms ease,
            box-shadow 160ms ease,
            background 160ms ease;
        }

        .wl-contact-field input,
        .wl-contact-field select {
          min-height: 50px;
          padding: 0 15px;
        }

        .wl-contact-field textarea {
          min-height: 165px;
          padding: 14px 15px;
          resize: vertical;
          line-height: 1.55;
        }

        .wl-contact-field input:focus,
        .wl-contact-field select:focus,
        .wl-contact-field textarea:focus {
          border-color: #6fa47c;
          background: #ffffff;
          box-shadow:
            0 0 0 3px
            rgba(35, 115, 67, 0.09);
        }

        .wl-contact-submit {
          display: inline-flex;
          width: 100%;
          min-height: 54px;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 3px;
          border: 0;
          border-radius: 999px;
          background: #237343;
          color: #ffffff;
          font: inherit;
          font-size: 15px;
          font-weight: 900;
          cursor: pointer;
          box-shadow:
            0 12px 28px
            rgba(35, 115, 67, 0.19);
          transition:
            background 160ms ease,
            transform 160ms ease;
        }

        .wl-contact-submit:hover {
          background: #185d35;
          transform: translateY(-1px);
        }

        .wl-contact-submit:active {
          transform: scale(0.985);
        }

        .wl-contact-privacy {
          margin: 3px 0 0;
          color: #89938c;
          font-size: 10px;
          line-height: 1.5;
          text-align: center;
        }

        .wl-contact-info-card {
          overflow: hidden;
        }

        .wl-contact-info-top {
          padding: 30px 28px;
          background:
            linear-gradient(
              145deg,
              #174a30 0%,
              #236c43 100%
            );
          color: #ffffff;
        }

        .wl-contact-info-eyebrow {
          margin: 0 0 8px;
          color: #bde4c4;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }

        .wl-contact-info-top h2 {
          margin: 0;
          font-family:
            Georgia,
            "Times New Roman",
            serif;
          font-size: 30px;
          line-height: 1.08;
        }

        .wl-contact-info-top p {
          margin: 13px 0 0;
          color: rgba(255, 255, 255, 0.83);
          font-size: 13px;
          line-height: 1.6;
        }

        .wl-contact-people {
          display: grid;
        }

        .wl-contact-person {
          padding: 23px 26px;
          border-bottom: 1px solid #e3eae2;
        }

        .wl-contact-person:last-child {
          border-bottom: 0;
        }

        .wl-contact-person-label {
          margin: 0;
          color: #829086;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.13em;
          text-transform: uppercase;
        }

        .wl-contact-person-name {
          margin: 5px 0 0;
          color: #173d29;
          font-size: 17px;
          font-weight: 900;
        }

        .wl-contact-email {
          display: inline-flex;
          margin-top: 7px;
          color: #237343;
          font-size: 13px;
          font-weight: 800;
          text-decoration: none;
          word-break: break-word;
        }

        .wl-contact-email:hover {
          text-decoration: underline;
        }

        .wl-contact-expectation {
          margin-top: 22px;
          padding: 22px 24px;
          border: 1px solid #dce6db;
          border-radius: 22px;
          background: rgba(255,255,255,.76);
        }

        .wl-contact-expectation strong {
          display: block;
          color: #23633d;
          font-size: 12px;
        }

        .wl-contact-expectation p {
          margin: 7px 0 0;
          color: #718077;
          font-size: 12px;
          line-height: 1.55;
        }

        @media (max-width: 800px) {
          .wl-contact-page {
            padding-top: 34px;
          }

          .wl-contact-grid {
            grid-template-columns: 1fr;
          }

          .wl-contact-info-card {
            order: 2;
          }
        }

        @media (max-width: 600px) {
          .wl-contact-page {
            padding:
              28px
              12px
              calc(
                60px +
                env(safe-area-inset-bottom)
              );
          }

          .wl-contact-back {
            margin-bottom: 22px;
          }

          .wl-contact-title {
            font-size: 43px;
          }

          .wl-contact-intro {
            font-size: 15px;
          }

          .wl-contact-form-card {
            padding: 25px 20px;
            border-radius: 23px;
          }

          .wl-contact-form-title {
            font-size: 27px;
          }

          .wl-contact-two-column {
            grid-template-columns: 1fr;
          }

          .wl-contact-info-card {
            border-radius: 23px;
          }
        }
      `}</style>

      <div className="wl-contact-shell">
        <Link
          href="/community/resources"
          className="wl-contact-back"
        >
          ← Back to Join Our Team
        </Link>

        <header className="wl-contact-header">
          <p className="wl-contact-eyebrow">
            WONDERFULLIFE
          </p>

          <h1 className="wl-contact-title">
            Contact Us
          </h1>

          <p className="wl-contact-intro">
            Have a question about WonderfulLife, wellness,
            or the opportunity? We&apos;re happy to help.
            Ask what you need to know, take your time, and
            decide what feels right for you.
          </p>
        </header>

        <div className="wl-contact-grid">
          <section className="wl-contact-form-card">
            <h2 className="wl-contact-form-title">
              Send us a message.
            </h2>

            <p className="wl-contact-form-note">
              Fill in the form below and your email program
              will prepare the message for you.
            </p>

            <form
              className="wl-contact-form"
              action="mailto:nick@wonderful-life.ca"
              method="post"
              encType="text/plain"
            >
              <div className="wl-contact-two-column">
                <div className="wl-contact-field">
                  <label htmlFor="contact-name">
                    Your Name
                  </label>

                  <input
                    id="contact-name"
                    name="Name"
                    type="text"
                    placeholder="Your name"
                    required
                  />
                </div>

                <div className="wl-contact-field">
                  <label htmlFor="contact-email">
                    Email Address
                  </label>

                  <input
                    id="contact-email"
                    name="Email"
                    type="email"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div className="wl-contact-field">
                <label htmlFor="contact-subject">
                  What can we help with?
                </label>

                <select
                  id="contact-subject"
                  name="Subject"
                  defaultValue=""
                  required
                >
                  <option value="" disabled>
                    Choose a subject
                  </option>

                  <option value="WonderfulLife Question">
                    WonderfulLife Question
                  </option>

                  <option value="Join Our Team">
                    Join Our Team
                  </option>

                  <option value="USANA Opportunity">
                    USANA Opportunity
                  </option>

                  <option value="Wellness or Nutrition">
                    Wellness or Nutrition
                  </option>

                  <option value="Website Support">
                    Website Support
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </select>
              </div>

              <div className="wl-contact-field">
                <label htmlFor="contact-message">
                  Message
                </label>

                <textarea
                  id="contact-message"
                  name="Message"
                  placeholder="Tell us how we can help..."
                  required
                />
              </div>

              <button
                type="submit"
                className="wl-contact-submit"
              >
                Send Message →
              </button>

              <p className="wl-contact-privacy">
                Your information is used only to respond
                to your inquiry.
              </p>
            </form>
          </section>

          <aside>
            <div className="wl-contact-info-card">
              <div className="wl-contact-info-top">
                <p className="wl-contact-info-eyebrow">
                  TALK TO US
                </p>

                <h2>
                  A real conversation starts here.
                </h2>

                <p>
                  No pressure. No obligation. Just clear
                  information and a chance to ask questions.
                </p>
              </div>

              <div className="wl-contact-people">
                <div className="wl-contact-person">
                  <p className="wl-contact-person-label">
                    WonderfulLife Team
                  </p>

                  <p className="wl-contact-person-name">
                    Nick
                  </p>

                  <a
                    href="mailto:nick@wonderful-life.ca"
                    className="wl-contact-email"
                  >
                    nick@wonderful-life.ca
                  </a>
                </div>

                <div className="wl-contact-person">
                  <p className="wl-contact-person-label">
                    WonderfulLife Guide
                  </p>

                  <p className="wl-contact-person-name">
                    Zoey
                  </p>

                  <a
                    href="mailto:zoey@wonderful-life.ca"
                    className="wl-contact-email"
                  >
                    zoey@wonderful-life.ca
                  </a>
                </div>
              </div>
            </div>

            <div className="wl-contact-expectation">
              <strong>
                What happens next?
              </strong>

              <p>
                We&apos;ll review your question and respond
                personally. There&apos;s no commitment simply
                because you contacted us.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}