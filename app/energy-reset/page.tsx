import Image from "next/image";
import Link from "next/link";

const previewCards = [
  {
    image: "/energy-reset/day-3.png",
    eyebrow: "DAY 3",
    title: "Build a Better Breakfast",
    text: "Simple, nourishing choices designed to support steadier energy.",
  },
  {
    image: "/energy-reset/day-7.png",
    eyebrow: "DAY 7",
    title: "Your First Check-In",
    text: "Pause, notice what is working and make small adjustments.",
  },
  {
    image: "/energy-reset/energy-plate.png",
    eyebrow: "ENERGY PLATE",
    title: "Balanced. Nourishing. Simple.",
    text: "A visual guide to building satisfying, balanced meals.",
  },
  {
    image: "/energy-reset/energy-tracker.png",
    eyebrow: "TRACKER",
    title: "See Your Progress",
    text: "Track the habits that influence how you feel over 14 days.",
  },
];

export default function EnergyResetPage() {
  return (
    <main className="energyPage">
      {/* HERO */}
      <section className="hero">
        <div className="heroInner">
          <div className="coverWrap">
            <Image
              src="/energy-reset/cover.png"
              alt="Wonderful-Life 14-Day Energy Reset"
              width={850}
              height={1200}
              priority
              className="coverImage"
            />
          </div>

          <div className="heroCopy">
            <div className="eyebrow">
              WONDERFUL-LIFE WELLNESS GUIDES
            </div>

            <h1>
              14-Day
              <br />
              Energy Reset
            </h1>

            <h2>
              14 days. Small changes.
              <br />
              More consistent energy.
            </h2>

            <p className="heroDescription">
              A practical wellness guide to help you explore the everyday
              habits affecting your energy and build simple routines you can
              actually maintain.
            </p>

            <div className="priceRow">
              <strong>$19</strong>
              <span>CAD</span>
            </div>

            <a
  href="https://buy.stripe.com/test_4gMeVd3KG0fz5xc295fUQ01"
  className="primaryButton"
>
  GET THE ENERGY RESET
</a>

            <div className="purchaseNotes">
              <span>Instant PDF access</span>
              <span>•</span>
              <span>Printable</span>
              <span>•</span>
              <span>Yours to keep</span>
            </div>
          </div>
        </div>
      </section>

      {/* ACTUAL GUIDE PREVIEWS */}
      <section className="insideSection">
        <div className="sectionHeading">
          <div className="eyebrow">TAKE A LOOK INSIDE</div>

          <h2>Real guidance. Beautifully presented.</h2>

          <p>Actual pages from the 14-Day Energy Reset.</p>
        </div>

        <div className="previewGrid">
          {previewCards.map((card) => (
            <article className="previewCard" key={card.title}>
              <div className="previewImageWrap">
                <Image
                  src={card.image}
                  alt={card.title}
                  width={700}
                  height={1050}
                  className="previewImage"
                />
              </div>

              <div className="previewCopy">
                <div className="cardEyebrow">{card.eyebrow}</div>

                <h3>{card.title}</h3>

                <p>{card.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* WIDE VISUAL */}
      <section className="wideSection">
        <div className="wideCard">
          <div className="wideImageWrap">
            <Image
              src="/energy-reset/listen-to-your-body.png"
              alt="Listen to Your Body"
              width={1200}
              height={850}
              className="wideImage"
            />
          </div>

          <div className="wideCopy">
            <div className="eyebrow">DAY 14 + BEYOND</div>

            <h2>Listen to your body.</h2>

            <p>
              Learn what supports your energy, what drains it and which
              everyday habits are worth carrying forward.
            </p>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="finalCta">
        <div className="finalCtaInner">
          <div className="finalCopy">
            <div className="ctaEyebrow">
              14-DAY ENERGY RESET
            </div>

            <h2>Ready to reset your routine?</h2>

            <p>
              Start today with the complete 25-page Wonderful-Life guide.
            </p>
          </div>

          <div className="ctaPurchase">
            <div className="finalPrice">
              <strong>$19</strong>
              <span>CAD</span>
            </div>

            <button type="button" className="goldButton">
              START MY 14-DAY RESET
            </button>

            <small>
              One payment · Instant access · Printable · Yours to keep
            </small>
          </div>
        </div>
      </section>

      <div className="backHome">
        <Link href="/">← Back to Wonderful-Life</Link>
      </div>

      {/* MOBILE STICKY CTA */}
     

      <style>{`
        .energyPage {
          background: #f8f5ee;
          color: #263d32;
          font-family: Arial, Helvetica, sans-serif;
        }

        /* =========================
           HERO
        ========================= */

        .hero {
          overflow: hidden;
          background:
            radial-gradient(
              circle at 87% 36%,
              rgba(106, 138, 86, 0.11),
              transparent 22%
            ),
            linear-gradient(
              110deg,
              #f7f3e9 0%,
              #fbfaf6 65%,
              #f4efe4 100%
            );
        }

        .heroInner {
          max-width: 1220px;
          margin: 0 auto;
          padding: 34px 30px 38px;

          display: grid;
          grid-template-columns: 360px 1fr;
          gap: 62px;
          align-items: center;
        }

        .coverWrap {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .coverImage {
          width: 100%;
          height: auto;
          max-width: 330px;

          border-radius: 7px;

          box-shadow:
            0 18px 42px rgba(40, 60, 47, 0.18);
        }

        .eyebrow {
          color: #a68127;

          font-size: 11px;
          line-height: 1.2;

          letter-spacing: 2.6px;

          font-weight: 800;
        }

        .heroCopy h1 {
          margin: 13px 0 14px;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: clamp(48px, 4.5vw, 68px);

          line-height: 0.96;

          letter-spacing: -2px;

          font-weight: 500;

          color: #164d37;
        }

        .heroCopy h2 {
          margin: 0 0 14px;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 24px;

          line-height: 1.25;

          font-weight: 500;

          color: #275743;
        }

        .heroDescription {
          max-width: 610px;

          margin: 0 0 16px;

          font-size: 16px;

          line-height: 1.55;

          color: #586760;
        }

        .priceRow {
          display: flex;

          gap: 9px;

          align-items: baseline;

          margin: 0 0 14px;
        }

        .priceRow strong,
        .finalPrice strong {
          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 40px;

          line-height: 1;

          color: #164d37;
        }

        .priceRow span,
        .finalPrice span {
          color: #657269;

          font-size: 14px;
        }

        .primaryButton,
        .goldButton {
          border: 0;

          border-radius: 999px;

          min-height: 50px;

          padding: 0 32px;

          font-size: 14px;

          font-weight: 800;

          letter-spacing: 0.6px;

          cursor: pointer;
        }

        .primaryButton {
          min-width: 365px;

          background: #1f5a42;

          color: white;

          box-shadow:
            0 7px 18px rgba(31, 90, 66, 0.16);
        }

        .purchaseNotes {
          margin-top: 12px;

          display: flex;

          gap: 9px;

          flex-wrap: wrap;

          font-size: 12px;

          color: #6d776f;
        }

        /* =========================
           GUIDE PREVIEW
        ========================= */

        .insideSection {
          padding: 44px 24px 48px;

          background: #fbfaf6;
        }

        .sectionHeading {
          text-align: center;

          max-width: 720px;

          margin: 0 auto 28px;
        }

        .sectionHeading h2,
        .wideCopy h2,
        .finalCta h2 {
          font-family:
            Georgia,
            "Times New Roman",
            serif;

          color: #174f39;

          font-weight: 500;
        }

        .sectionHeading h2 {
          margin: 9px 0 7px;

          font-size: clamp(31px, 3vw, 42px);
        }

        .sectionHeading p {
          margin: 0;

          font-size: 15px;

          color: #69756e;
        }

        .previewGrid {
          max-width: 1240px;

          margin: 0 auto;

          display: grid;

          grid-template-columns: repeat(4, 1fr);

          gap: 15px;
        }

        .previewCard {
          overflow: hidden;

          background: white;

          border-radius: 13px;

          border: 1px solid #ece7dc;

          box-shadow:
            0 8px 20px rgba(50, 62, 54, 0.06);
        }

        .previewImageWrap {
          width: 100%;

          aspect-ratio: 9 / 12;

          overflow: hidden;

          background: #eeeae1;
        }

        .previewImage {
          width: 100%;

          height: 100%;

          object-fit: cover;

          object-position: top;
        }

        .previewCopy {
          padding: 14px 15px 16px;
        }

        .cardEyebrow {
          margin-bottom: 6px;

          color: #a68127;

          font-size: 9px;

          letter-spacing: 1.6px;

          font-weight: 800;
        }

        .previewCopy h3 {
          margin: 0 0 6px;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          color: #174f39;

          font-size: 19px;

          line-height: 1.08;

          font-weight: 500;
        }

        .previewCopy p {
          margin: 0;

          color: #657269;

          font-size: 12px;

          line-height: 1.45;
        }

        /* =========================
           LISTEN TO YOUR BODY
        ========================= */

        .wideSection {
          padding: 0 24px 48px;

          background: #fbfaf6;
        }

        .wideCard {
          max-width: 1240px;

          height: 310px;

          margin: 0 auto;

          overflow: hidden;

          display: grid;

          grid-template-columns: 1.35fr 0.65fr;

          background: #edf3ee;

          border-radius: 18px;
        }

        .wideImageWrap {
          height: 310px;

          overflow: hidden;
        }

        .wideImage {
          width: 100%;

          height: 100%;

          object-fit: cover;

          object-position: center top;
        }

        .wideCopy {
          padding: 34px 38px;

          display: flex;

          flex-direction: column;

          justify-content: center;
        }

        .wideCopy h2 {
          margin: 10px 0 13px;

          font-size: 36px;

          line-height: 1.02;
        }

        .wideCopy p {
          margin: 0;

          color: #58685f;

          font-size: 15px;

          line-height: 1.55;
        }

        /* =========================
           FINAL CTA
        ========================= */

        .finalCta {
          padding: 36px 26px;

          background: #154d37;

          color: white;
        }

        .finalCtaInner {
          max-width: 1120px;

          margin: 0 auto;

          display: grid;

          grid-template-columns: 1fr 410px;

          gap: 45px;

          align-items: center;
        }

        .ctaEyebrow {
          margin-bottom: 8px;

          color: #dbb65a;

          font-size: 10px;

          letter-spacing: 2.2px;

          font-weight: 800;
        }

        .finalCta h2 {
          margin: 0 0 7px;

          color: white;

          font-size: 36px;
        }

        .finalCta p {
          margin: 0;

          color: #d7e3dc;

          font-size: 15px;
        }

        .ctaPurchase {
          text-align: center;
        }

        .finalPrice {
          margin-bottom: 11px;
        }

        .finalPrice strong {
          color: white;

          font-size: 36px;
        }

        .finalPrice span {
          color: #d3ded7;
        }

        .goldButton {
          width: 100%;

          background: #d7a92d;

          color: white;
        }

        .ctaPurchase small {
          display: block;

          margin-top: 9px;

          color: #d2ddd7;

          font-size: 10px;
        }

        .backHome {
          padding: 17px;

          text-align: center;

          background: #103e2d;
        }

        .backHome a {
          color: #e3ece6;

          text-decoration: none;

          font-size: 12px;
        }

        /* =========================
           MOBILE STICKY CTA
        ========================= */

        .mobileSticky {
          display: none;
        }

        /* =========================
           TABLET
        ========================= */

        @media (max-width: 900px) {
          .heroInner {
            grid-template-columns: 285px 1fr;

            gap: 32px;
          }

          .coverImage {
            max-width: 270px;
          }

          .previewGrid {
            grid-template-columns: repeat(2, 1fr);
          }

          .wideCard {
            grid-template-columns: 1fr 0.75fr;
          }

          .finalCtaInner {
            grid-template-columns: 1fr;
            gap: 20px;
          }
        }

        /* =========================
           MOBILE
        ========================= */

        @media (max-width: 650px) {
  .energyPage {
    padding-bottom: 65px;
  }

  .heroInner {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 18px 14px 22px;
    align-items: center;
  }

  .coverWrap {
    width: 100%;
  }

  .coverImage {
    max-width: 340px;
    width: 100%;
    height: auto;
    border-radius: 5px;
  }

  .heroCopy {
    width: 100%;
    text-align: center;
  }

  .eyebrow {
    font-size: 8px;
    letter-spacing: 1.4px;
  }

  .heroCopy h1 {
    margin: 8px 0 8px;
    font-size: 38px;
    line-height: 0.95;
    letter-spacing: -1px;
  }

  .heroCopy h2 {
    margin-bottom: 8px;
    font-size: 17px;
  }

  .heroDescription {
    display: none;
  }

  .priceRow {
    justify-content: center;
    margin-bottom: 8px;
  }

  .priceRow strong {
    font-size: 30px;
  }

  .priceRow span {
    font-size: 11px;
  }

  .primaryButton {
    width: 100%;
    min-width: 0;
    min-height: 43px;
    padding: 0 10px;
    font-size: 11px;
  }

  .purchaseNotes {
    justify-content: center;
    margin-top: 7px;
    gap: 5px;
    font-size: 9px;
  }
}

          .insideSection {
            padding: 30px 10px 30px;
          }

          .sectionHeading {
            margin-bottom: 18px;
          }

          .sectionHeading h2 {
            margin: 7px 0 5px;

            font-size: 28px;

            line-height: 1;
          }

          .sectionHeading p {
            font-size: 12px;
          }

          .previewGrid {
            grid-template-columns: repeat(2, 1fr);

            gap: 8px;
          }

          .previewCard {
            border-radius: 9px;
          }

          .previewImageWrap {
            aspect-ratio: 9 / 12;
          }

          .previewCopy {
            padding: 10px 9px 11px;
          }

          .cardEyebrow {
            font-size: 8px;
          }

          .previewCopy h3 {
            font-size: 15px;
          }

          .previewCopy p {
            font-size: 10px;

            line-height: 1.35;
          }

          .wideSection {
            padding: 0 10px 30px;
          }

          .wideCard {
            height: auto;

            display: grid;

            grid-template-columns: 1.2fr 0.8fr;

            border-radius: 11px;
          }

          .wideImageWrap {
            height: 220px;
          }

          .wideCopy {
            padding: 18px 14px;
          }

          .wideCopy h2 {
            margin: 7px 0 8px;

            font-size: 24px;
          }

          .wideCopy p {
            font-size: 11px;

            line-height: 1.4;
          }

          .finalCta {
            padding: 26px 16px;
          }

          .finalCtaInner {
            gap: 18px;

            text-align: center;
          }

          .finalCta h2 {
            font-size: 30px;
          }

          .finalCta p {
            font-size: 13px;
          }

          .finalPrice {
            margin-bottom: 8px;
          }

          .finalPrice strong {
            font-size: 32px;
          }

          .goldButton {
            min-height: 46px;

            font-size: 12px;
          }

          .backHome {
            padding: 14px;
          }

          .mobileSticky {
            position: fixed;

            left: 0;
            right: 0;
            bottom: 0;

            z-index: 999;

            height: 64px;

            padding: 8px 12px;

            display: flex;

            justify-content: space-between;

            align-items: center;

            background: rgba(20, 77, 55, 0.97);

            box-shadow:
              0 -4px 18px rgba(0, 0, 0, 0.14);

            backdrop-filter: blur(8px);
          }

          .mobileSticky > div {
            display: flex;

            flex-direction: column;

            color: white;
          }

          .mobileSticky strong {
            font-size: 12px;
          }

          .mobileSticky span {
            margin-top: 2px;

            color: #e3c66d;

            font-size: 12px;

            font-weight: 700;
          }

          .mobileSticky button {
            min-width: 92px;

            min-height: 42px;

            border: 0;

            border-radius: 999px;

            background: #d7a92d;

            color: white;

            font-size: 12px;

            font-weight: 800;

            cursor: pointer;
          }
        }
      `}</style>
    </main>
  );
}