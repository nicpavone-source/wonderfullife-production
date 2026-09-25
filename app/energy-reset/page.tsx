import Image from "next/image";
import Link from "next/link";
import EnergyResetCheckoutLink from "@/components/analytics/EnergyResetCheckoutLink";

const previewCards = [
  {
    image: "/energy-reset/day-3.png",
    eyebrow: "DAY 3",
    title: "Build a Better Breakfast",
    text: "A great morning starts with the right fuel.",
  },
  {
    image: "/energy-reset/day-7.png",
    eyebrow: "DAY 7",
    title: "Your First Check-In",
    text: "Celebrate progress. Build momentum for the week ahead.",
  },
  {
    image: "/energy-reset/energy-tracker.png",
    eyebrow: "TOOLS & TRACKERS",
    title: "14-Day Energy Tracker",
    text: "One minute a day can reveal patterns you would otherwise miss.",
  },
];

const pillars = [
  { icon: "✦", title: "FOOD" },
  { icon: "◯", title: "HYDRATION" },
  { icon: "♙", title: "MOVEMENT" },
  { icon: "☾", title: "SLEEP" },
];

export default function EnergyResetPage() {
  return (
    <main className="energyPage">
      {/* ======================================================
          FULL-BLEED PHOTOGRAPHIC HERO
      ====================================================== */}

      <section className="hero">
        <div className="heroShade" />

        <div className="heroInner">
          <div className="heroCopy">
            <div className="eyebrow">
              <span className="eyebrowLine" />
              <span>14-DAY GUIDED WELLNESS PLAN</span>
              <span className="eyebrowLine" />
            </div>

            <h1>
              <span className="titleGreen">14-Day</span>
              <span className="titleGold">Energy Reset</span>
            </h1>

            <p className="heroPromise">
              14 days. Small changes.
              <br />
              More consistent energy.
            </p>

            <div className="benefits">
              <div className="benefit">
                <div className="benefitIcon">ϟ</div>

                <div className="benefitText">
                  <strong>Beat the 2 PM afternoon crash</strong>
                  <span>without extra coffee</span>
                </div>
              </div>

              <div className="benefit">
                <div className="benefitIcon">▦</div>

                <div className="benefitText">
                  <strong>Follow a simple 14-day action plan</strong>
                  <span>(15 mins/day)</span>
                </div>
              </div>

              <div className="benefit">
                <div className="benefitIcon">▤</div>

                <div className="benefitText">
                  <strong>Track the habits that affect how you feel</strong>
                  <span>with a printable daily tracker</span>
                </div>
              </div>
            </div>

            <div className="heroPrice">
              <strong>$19</strong>
              <span>CAD</span>
            </div>

            <EnergyResetCheckoutLink className="primaryButton">
              <span>START MY 14-DAY RESET — $19 CAD</span>
              <span className="buttonArrow">→</span>
            </EnergyResetCheckoutLink>

            <div className="deliveryRow">
              <div className="deliveryItem">
                <div className="deliveryIcon pdfIcon">PDF</div>

                <div>
                  <strong>Instant</strong>
                  <span>PDF access</span>
                </div>
              </div>

              <div className="deliveryDivider" />

              <div className="deliveryItem">
                <div className="deliveryIcon">▣</div>

                <div>
                  <strong>Printable</strong>
                </div>
              </div>

              <div className="deliveryDivider" />

              <div className="deliveryItem">
                <div className="deliveryIcon">↓</div>

                <div>
                  <strong>Yours</strong>
                  <span>to keep</span>
                </div>
              </div>
            </div>

            <div className="trustRow">
              <span>Secure checkout</span>
              <i>•</i>
              <span>Instant access</span>
              <i>•</i>
              <span>One-time payment</span>
            </div>
          </div>

          <div className="heroVisual">
            <Image
              src="/energy-reset/energy-reset-3d.png"
              alt="Wonderful-Life 14-Day Energy Reset guide"
              width={900}
              height={1200}
              priority
              className="heroBook"
            />
          </div>
        </div>
      </section>

      {/* ======================================================
          FOUR PILLARS
      ====================================================== */}

      <section className="pillars">
        <div className="pillarsInner">
          {pillars.map((pillar, index) => (
            <div className="pillarGroup" key={pillar.title}>
              <div className="pillar">
                <div className="pillarIcon">{pillar.icon}</div>
                <strong>{pillar.title}</strong>
              </div>

              {index < pillars.length - 1 && (
                <div className="pillarDivider" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ======================================================
          LOOK INSIDE
      ====================================================== */}

      <section className="inside">
        <div className="sectionHeading">
          <div className="sectionEyebrow">
            TAKE A LOOK INSIDE
          </div>

          <h2>Real guidance. Beautifully presented.</h2>

          <p>Actual pages from the 14-Day Energy Reset.</p>
        </div>

        <div className="previewGrid">
          {previewCards.map((card) => (
            <article className="previewCard" key={card.title}>
              <div className="previewImage">
                <Image
                  src={card.image}
                  alt={card.title}
                  width={760}
                  height={1000}
                />
              </div>

              <div className="previewContent">
                <div className="previewLabel">
                  {card.eyebrow}
                </div>

                <h3>{card.title}</h3>

                <p>{card.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ======================================================
          FINAL PURCHASE CTA
      ====================================================== */}

      <section className="finalCta">
        <div className="finalInner">
          <div className="finalEyebrow">
            14-DAY ENERGY RESET
          </div>

          <h2>Ready to reset your routine?</h2>

          <p>
            Start today with the complete 25-page
            Wonderful-Life guide.
          </p>

          <div className="finalPrice">
            <strong>$19</strong>
            <span>CAD</span>
          </div>

          <EnergyResetCheckoutLink className="finalButton">
            <span>START MY 14-DAY RESET — $19 CAD</span>
            <span>→</span>
          </EnergyResetCheckoutLink>

          <div className="finalTrust">
            <span>One payment</span>
            <i>•</i>
            <span>Instant access</span>
            <i>•</i>
            <span>Printable</span>
            <i>•</i>
            <span>Yours to keep</span>
          </div>
        </div>
      </section>

      <div className="backHome">
        <Link href="/">
          ← Back to Wonderful-Life
        </Link>
      </div>

      <style>{`
        .energyPage {
          --green: #073f31;
          --deep-green: #064332;
          --gold: #c68a13;
          --bright-gold: #e5ae28;
          --cream: #fbf8ef;

          overflow: hidden;

          background: var(--cream);

          color: var(--green);

          font-family: Arial, Helvetica, sans-serif;
        }

        /* ====================================================
           HERO
        ==================================================== */

        .hero {
          position: relative;

          min-height: 720px;

          overflow: hidden;

          background-image:
            url("/energy-reset/hero-background.png");

          background-size: cover;

          background-position: center 46%;

          background-repeat: no-repeat;
        }

        /*
         * Readability layer only.
         * The photograph remains visible across the whole hero.
         */

        .heroShade {
          position: absolute;
          inset: 0;

          pointer-events: none;

          background:
            linear-gradient(
              90deg,
              rgba(251, 248, 239, 0.93) 0%,
              rgba(251, 248, 239, 0.86) 31%,
              rgba(251, 248, 239, 0.55) 48%,
              rgba(251, 248, 239, 0.12) 68%,
              rgba(251, 248, 239, 0.02) 100%
            );
        }

        .heroInner {
          position: relative;
          z-index: 2;

          max-width: 1180px;

          min-height: 720px;

          margin: 0 auto;

          padding: 36px 30px 25px;

          display: grid;

          grid-template-columns:
            minmax(0, 56%)
            minmax(360px, 44%);

          align-items: center;
        }

        /* ====================================================
           HERO COPY
        ==================================================== */

        .heroCopy {
          position: relative;
          z-index: 5;

          max-width: 650px;
        }

        .eyebrow {
          margin-bottom: 14px;

          display: flex;
          align-items: center;

          gap: 11px;

          color: var(--gold);

          font-size: 11px;
          font-weight: 800;

          letter-spacing: 1.5px;
        }

        .eyebrowLine {
          width: 40px;
          height: 1px;

          background: var(--gold);
        }

        .hero h1 {
          margin: 0;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-weight: 400;

          line-height: 0.85;

          letter-spacing: -3px;
        }

        .hero h1 span {
          display: block;
        }

        .titleGreen {
          color: var(--green);

          font-size:
            clamp(68px, 6vw, 90px);
        }

        .titleGold {
          color: var(--gold);

          font-size:
            clamp(68px, 6vw, 90px);
        }

        .heroPromise {
          margin: 21px 0 21px;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          color: #123f31;

          font-size: 28px;

          line-height: 1.07;

          font-style: italic;

          text-shadow:
            0 1px 1px rgba(255,255,255,0.7);
        }

        /* ====================================================
           BENEFITS
        ==================================================== */

        .benefits {
          max-width: 555px;

          margin-bottom: 12px;

          display: grid;

          gap: 11px;
        }

        .benefit {
          display: grid;

          grid-template-columns: 54px 1fr;

          align-items: center;

          gap: 13px;
        }

        .benefitIcon {
          width: 54px;
          height: 54px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background:
            rgba(242, 245, 216, 0.88);

          border:
            1px solid rgba(255,255,255,0.45);

          color: #07553b;

          font-size: 27px;

          font-weight: 800;

          backdrop-filter: blur(4px);
        }

        .benefitText strong,
        .benefitText span {
          display: block;

          font-family:
            Georgia,
            "Times New Roman",
            serif;
        }

        .benefitText strong {
          color: #0b3f30;

          font-size: 20px;

          line-height: 1.06;

          text-shadow:
            0 1px 1px rgba(255,255,255,0.75);
        }

        .benefitText span {
          margin-top: 2px;

          color: #324e43;

          font-size: 16px;

          line-height: 1.08;
        }

        /* ====================================================
           PRICE
        ==================================================== */

        .heroPrice {
          margin: 10px 0;

          display: flex;
          align-items: baseline;

          gap: 7px;
        }

        .heroPrice strong {
          color: #064735;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 63px;

          line-height: 0.9;

          font-weight: 400;
        }

        .heroPrice span {
          color: #3e574c;

          font-size: 20px;
        }

        /* ====================================================
           HERO CTA
        ==================================================== */

        .primaryButton,
        .finalButton {
          text-decoration: none;
        }

        .primaryButton {
          width: min(100%, 610px);

          min-height: 60px;

          padding: 0 24px;

          display: flex;

          align-items: center;
          justify-content: center;

          gap: 17px;

          border-radius: 999px;

          background:
            linear-gradient(
              180deg,
              #0b8d49 0%,
              #06763f 100%
            );

          color: white;

          font-size: 17px;

          font-weight: 800;

          box-shadow:
            0 9px 22px
            rgba(4, 78, 46, 0.25);

          transition:
            transform 160ms ease,
            box-shadow 160ms ease;
        }

        .primaryButton:hover {
          transform: translateY(-2px);

          box-shadow:
            0 12px 27px
            rgba(4, 78, 46, 0.31);
        }

        .buttonArrow {
          font-size: 26px;

          font-weight: 400;
        }

        /* ====================================================
           DELIVERY
        ==================================================== */

        .deliveryRow {
          max-width: 600px;

          margin-top: 16px;

          display: grid;

          grid-template-columns:
            1fr auto
            1fr auto
            1fr;

          align-items: center;

          gap: 13px;
        }

        .deliveryItem {
          display: flex;

          align-items: center;
          justify-content: center;

          gap: 8px;
        }

        .deliveryIcon {
          width: 41px;
          height: 41px;

          flex: 0 0 41px;

          display: flex;

          align-items: center;
          justify-content: center;

          border:
            1.5px solid #07553d;

          border-radius: 50%;

          background:
            rgba(251,248,239,0.5);

          color: #07553d;

          font-size: 18px;

          font-weight: 800;
        }

        .pdfIcon {
          border-radius: 5px;

          font-size: 9px;
        }

        .deliveryItem strong,
        .deliveryItem span {
          display: block;
        }

        .deliveryItem strong {
          color: #123f31;

          font-size: 14px;
        }

        .deliveryItem span {
          color: #40564c;

          font-size: 12px;
        }

        .deliveryDivider {
          width: 1px;
          height: 38px;

          background:
            rgba(7,63,49,0.23);
        }

        .trustRow {
          max-width: 600px;

          margin-top: 10px;

          display: flex;

          align-items: center;
          justify-content: center;

          flex-wrap: wrap;

          gap: 7px;

          color: #354e43;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 13px;
        }

        .trustRow i {
          color: #73837b;

          font-style: normal;
        }

        /* ====================================================
           3D PRODUCT
        ==================================================== */

        .heroVisual {
          position: relative;

          min-height: 600px;

          display: flex;

          align-items: center;
          justify-content: center;
        }

        .heroBook {
          position: relative;

          z-index: 3;

          width: 100%;

          max-width: 500px;

          height: auto;

          object-fit: contain;

          filter:
            drop-shadow(
              0 24px 27px
              rgba(8, 39, 29, 0.30)
            );
        }

        /* ====================================================
           PILLARS
        ==================================================== */

        .pillars {
          border-top:
            1px solid #e1dccf;

          border-bottom:
            1px solid #ded9cd;

          background:
            rgba(250,247,237,0.98);
        }

        .pillarsInner {
          max-width: 1000px;

          min-height: 86px;

          margin: 0 auto;

          padding: 0 22px;

          display: flex;

          align-items: center;
          justify-content: center;
        }

        .pillarGroup {
          flex: 1;

          display: flex;

          align-items: center;
        }

        .pillar {
          flex: 1;

          display: flex;

          align-items: center;
          justify-content: center;

          gap: 9px;
        }

        .pillarIcon {
          width: 43px;
          height: 43px;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background: #e8eedc;

          color: #07553b;

          font-size: 19px;
        }

        .pillar strong {
          color: #17473a;

          font-size: 10px;

          letter-spacing: 1.3px;
        }

        .pillarDivider {
          width: 1px;
          height: 43px;

          background: #d3cec1;
        }

        /* ====================================================
           LOOK INSIDE
        ==================================================== */

        .inside {
          padding:
            38px 24px 52px;

          background:
            linear-gradient(
              180deg,
              #fbf8ef 0%,
              #f8f4e9 100%
            );
        }

        .sectionHeading {
          margin:
            0 auto 22px;

          text-align: center;
        }

        .sectionEyebrow {
          color: var(--gold);

          font-size: 11px;

          font-weight: 800;

          letter-spacing: 2.3px;
        }

        .sectionHeading h2 {
          margin: 8px 0 4px;

          color: #094838;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 42px;

          line-height: 1;

          font-weight: 400;
        }

        .sectionHeading p {
          margin: 0;

          color: #58665f;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 18px;
        }

        .previewGrid {
          max-width: 1090px;

          margin: 0 auto;

          display: grid;

          grid-template-columns:
            repeat(3, 1fr);

          gap: 17px;
        }

        .previewCard {
          overflow: hidden;

          border:
            1px solid #dfd9cc;

          border-radius: 10px;

          background: #fffefa;

          box-shadow:
            0 10px 27px
            rgba(49,60,52,0.08);
        }

        .previewImage {
          height: 325px;

          overflow: hidden;

          background: #f3efe5;
        }

        .previewImage img {
          width: 100%;
          height: 100%;

          object-fit: cover;

          object-position: top;
        }

        .previewContent {
          padding:
            14px 16px 18px;
        }

        .previewLabel {
          display: inline-flex;

          min-height: 23px;

          padding: 0 12px;

          align-items: center;

          border-radius: 999px;

          background: #07603f;

          color: white;

          font-size: 8px;

          font-weight: 800;

          letter-spacing: 0.7px;
        }

        .previewContent h3 {
          margin: 9px 0 5px;

          color: #0b4637;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 24px;

          line-height: 1;

          font-weight: 600;
        }

        .previewContent p {
          margin: 0;

          color: #526158;

          font-size: 12px;

          line-height: 1.4;
        }

        /* ====================================================
           FINAL CTA
        ==================================================== */

        .finalCta {
          position: relative;

          padding:
            53px 24px 50px;

          background:
            linear-gradient(
              135deg,
              #0c503b 0%,
              #07503a 50%,
              #064330 100%
            );

          color: white;
        }

        .finalInner {
          max-width: 750px;

          margin: 0 auto;

          text-align: center;
        }

        .finalEyebrow {
          color: #e4ad27;

          font-size: 11px;

          font-weight: 800;

          letter-spacing: 2.4px;
        }

        .finalCta h2 {
          margin: 10px 0 9px;

          color: white;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 44px;

          line-height: 1;

          font-weight: 400;
        }

        .finalCta p {
          margin: 0 0 17px;

          color: #e2ede7;

          font-size: 15px;
        }

        .finalPrice {
          margin-bottom: 17px;

          display: flex;

          justify-content: center;
          align-items: baseline;

          gap: 5px;
        }

        .finalPrice strong {
          color: white;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 52px;

          font-weight: 400;

          line-height: 0.9;
        }

        .finalPrice span {
          color: #d9e6df;

          font-size: 17px;
        }

        .finalButton {
          width:
            min(100%, 540px);

          min-height: 56px;

          margin: 0 auto;

          padding: 0 25px;

          display: flex;

          align-items: center;
          justify-content: center;

          gap: 16px;

          border-radius: 999px;

          background:
            linear-gradient(
              180deg,
              #ebb62e 0%,
              #dda51e 100%
            );

          color: white;

          font-size: 14px;

          font-weight: 800;

          box-shadow:
            0 8px 21px
            rgba(0,0,0,0.16);
        }

        .finalTrust {
          margin-top: 14px;

          display: flex;

          justify-content: center;

          flex-wrap: wrap;

          gap: 7px;

          color: #dbe7e1;

          font-size: 11px;
        }

        .finalTrust i {
          color: #92b1a2;

          font-style: normal;
        }

        .backHome {
          padding: 16px;

          background: #053b2d;

          text-align: center;
        }

        .backHome a {
          color: #dce9e2;

          text-decoration: none;

          font-size: 12px;
        }

        /* ====================================================
           TABLET
        ==================================================== */

        @media (
          min-width: 651px
        ) and (
          max-width: 900px
        ) {
          .heroInner {
            grid-template-columns:
              56% 44%;

            padding-left: 20px;

            padding-right: 15px;
          }

          .hero h1 span {
            font-size: 64px;
          }

          .heroBook {
            width: 110%;
          }
        }

        /* ====================================================
           MOBILE
           
           IMPORTANT:
           The photograph does NOT create the hero height.
           The content creates the height.
           background-size: cover fills that height.
        ==================================================== */

        @media (max-width: 650px) {
          .hero {
            min-height: auto;

            background-image:
              url("/energy-reset/hero-background.png");

            background-size: cover;

            /*
             * Vertical source image:
             * keep the mountains / water visible
             * rather than anchoring to the bottom rocks.
             */
            background-position:
              center 32%;

            background-repeat:
              no-repeat;
          }

          .heroShade {
            background:
              linear-gradient(
                90deg,
                rgba(251,248,239,0.90) 0%,
                rgba(251,248,239,0.82) 43%,
                rgba(251,248,239,0.34) 68%,
                rgba(251,248,239,0.08) 100%
              );
          }

          .heroInner {
            min-height: auto;

            margin: 0;

            padding:
              23px 10px 20px;

            grid-template-columns:
              57% 43%;

            align-items: center;
          }

          .heroCopy {
            max-width: none;
          }

          .eyebrow {
            margin-bottom: 8px;

            gap: 5px;

            white-space: nowrap;

            font-size: 6.3px;

            letter-spacing: 0.55px;
          }

          .eyebrowLine {
            width: 18px;
          }

          .hero h1 {
            line-height: 0.87;

            letter-spacing: -1.25px;
          }

          .titleGreen,
          .titleGold {
            font-size:
              clamp(
                40px,
                11.2vw,
                51px
              );
          }

          .heroPromise {
            margin:
              10px 0 12px;

            font-size: 17px;

            line-height: 1.04;
          }

          .benefits {
            gap: 8px;

            margin-bottom: 7px;
          }

          .benefit {
            grid-template-columns:
              34px 1fr;

            gap: 7px;
          }

          .benefitIcon {
            width: 34px;
            height: 34px;

            font-size: 17px;

            backdrop-filter:
              blur(3px);
          }

          .benefitText strong {
            font-size: 11.7px;

            line-height: 1.03;
          }

          .benefitText span {
            margin-top: 1px;

            font-size: 9.8px;

            line-height: 1.03;
          }

          .heroPrice {
            margin: 7px 0;

            gap: 4px;
          }

          .heroPrice strong {
            font-size: 46px;
          }

          .heroPrice span {
            font-size: 13px;
          }

          .primaryButton {
            min-height: 43px;

            padding: 0 8px;

            gap: 6px;

            font-size: 9.2px;
          }

          .buttonArrow {
            font-size: 18px;
          }

          /* PRODUCT */

          .heroVisual {
            min-height: 0;

            align-self: center;

            display: flex;

            align-items: center;

            justify-content: center;
          }

          .heroBook {
            width: 108%;

            max-width: none;

            transform:
              translateX(3%);

            filter:
              drop-shadow(
                0 12px 14px
                rgba(7,37,27,0.29)
              );
          }

          /* DELIVERY */

          .deliveryRow {
            margin-top: 11px;

            gap: 5px;
          }

          .deliveryItem {
            gap: 4px;
          }

          .deliveryIcon {
            width: 29px;
            height: 29px;

            flex-basis: 29px;

            font-size: 12px;

            background:
              rgba(251,248,239,0.62);
          }

          .pdfIcon {
            font-size: 6px;
          }

          .deliveryItem strong {
            font-size: 8.7px;
          }

          .deliveryItem span {
            font-size: 7.7px;
          }

          .deliveryDivider {
            height: 27px;
          }

          .trustRow {
            margin-top: 7px;

            gap: 4px;

            font-size: 7.8px;
          }

          /* PILLARS */

          .pillarsInner {
            min-height: 60px;

            padding: 0 5px;
          }

          .pillar {
            gap: 4px;
          }

          .pillarIcon {
            width: 29px;
            height: 29px;

            font-size: 13px;
          }

          .pillar strong {
            font-size: 6px;

            letter-spacing: 0.45px;
          }

          .pillarDivider {
            height: 31px;
          }

          /* LOOK INSIDE */

          .inside {
            padding:
              22px 7px 29px;
          }

          .sectionHeading {
            margin-bottom: 14px;
          }

          .sectionEyebrow {
            font-size: 7px;

            letter-spacing: 1.4px;
          }

          .sectionHeading h2 {
            margin: 5px 0 3px;

            font-size: 25px;
          }

          .sectionHeading p {
            font-size: 11px;
          }

          .previewGrid {
            grid-template-columns:
              repeat(3, 1fr);

            gap: 6px;
          }

          .previewCard {
            border-radius: 7px;
          }

          .previewImage {
            height: 150px;
          }

          .previewContent {
            padding:
              7px 6px 9px;
          }

          .previewLabel {
            min-height: 16px;

            padding: 0 6px;

            font-size: 5px;

            letter-spacing: 0.3px;
          }

          .previewContent h3 {
            margin: 5px 0 3px;

            font-size: 11px;
          }

          .previewContent p {
            font-size: 6.4px;

            line-height: 1.25;
          }

          /* FINAL CTA */

          .finalCta {
            padding:
              33px 14px 30px;
          }

          .finalEyebrow {
            font-size: 7px;

            letter-spacing: 1.5px;
          }

          .finalCta h2 {
            margin: 7px 0;

            font-size: 31px;
          }

          .finalCta p {
            margin-bottom: 13px;

            font-size: 11px;
          }

          .finalPrice {
            margin-bottom: 13px;
          }

          .finalPrice strong {
            font-size: 43px;
          }

          .finalPrice span {
            font-size: 13px;
          }

          .finalButton {
            min-height: 49px;

            padding: 0 11px;

            gap: 8px;

            font-size: 10.3px;
          }

          .finalTrust {
            margin-top: 11px;

            gap: 4px;

            font-size: 7.8px;
          }

          .backHome {
            padding: 14px;
          }

          .backHome a {
            font-size: 10px;
          }
        }
      `}</style>
    </main>
  );
}