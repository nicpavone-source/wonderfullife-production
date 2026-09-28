import Image from "next/image";
import Link from "next/link";

/*
  TEMPORARY:
  Replace "#" with the Eat Better Stripe checkout URL
  only after the sales page is visually approved.
*/
const CHECKOUT_URL =
  "https://buy.stripe.com/aFaaEQe3PaWf5nZ3be1gs04";

export default function EatBetterResetPage() {
  return (
    <main className="eatBetterPage">

      {/* =========================================================
          HERO — LOCKED
      ========================================================= */}
      <section className="heroSection">
        <div className="heroFrame">
          <Image
            src="/eat-better-reset/ebcover.png"
            alt="The 14-Day Eat Better Reset"
            width={1024}
            height={1536}
            priority
            className="heroImage"
          />

          <a
            href={CHECKOUT_URL}
            className="heroPriceButton"
            aria-label="Buy the 14-Day Eat Better Reset for $19 CAD"
          >
            <span className="heroPrice">$19 CAD</span>

            <span className="heroBuy">
              BUY NOW <b>→</b>
            </span>
          </a>
        </div>
      </section>

      {/* =========================================================
          QUICK VALUE STRIP
      ========================================================= */}
      <section className="valueStrip">
        <div className="valueInner">

          <div className="valueItem">
            <span className="valueNumber">01</span>

            <div>
              <strong>Instant Download</strong>
              <span>Start whenever you&apos;re ready.</span>
            </div>
          </div>

          <div className="valueDivider" />

          <div className="valueItem">
            <span className="valueNumber">02</span>

            <div>
              <strong>Printable PDF</strong>
              <span>Keep it close. Make it yours.</span>
            </div>
          </div>

          <div className="valueDivider" />

          <div className="valueItem">
            <span className="valueNumber">03</span>

            <div>
              <strong>One-Time Payment</strong>
              <span>No subscription. No recurring fee.</span>
            </div>
          </div>

          <div className="valueDivider" />

          <div className="valueItem">
            <span className="valueNumber">04</span>

            <div>
              <strong>Yours to Keep</strong>
              <span>Return to the plan anytime.</span>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================
          TWO PRODUCT PREVIEWS
      ========================================================= */}
      <section className="insideSection">

        <div className="sectionHeading">
          <div className="sectionEyebrow">
            SEE WHAT&apos;S INSIDE
          </div>

          <h2>Real guidance for real life.</h2>

          <p>
            Actual pages from the 14-Day Eat Better Reset.
          </p>
        </div>

        <div className="previewGrid">

          {/* PREVIEW ONE */}
          <article className="previewCard">

            <div className="previewImageWrap">
              <Image
                src="/eat-better-reset/ebpage 14.png"
                alt="Day 09 Make Lunch Work for You"
                width={1024}
                height={1536}
                className="previewImage"
              />
            </div>

            <div className="previewCopy">

              <span className="previewTag">
                DAY 09
              </span>

              <h3>
                Make Lunch Work for You
              </h3>

              <p>
                Simple, realistic guidance for satisfying,
                energizing meals.
              </p>

            </div>

          </article>

          {/* PREVIEW TWO */}
          <article className="previewCard">

            <div className="previewImageWrap">
              <Image
                src="/eat-better-reset/ebpage 23.png"
                alt="The Eat Better Grocery Guide"
                width={1024}
                height={1536}
                className="previewImage"
              />
            </div>

            <div className="previewCopy">

              <span className="previewTag">
                PRACTICAL TOOL
              </span>

              <h3>
                The Eat Better Grocery Guide
              </h3>

              <p>
                A practical shopping companion for making
                better choices easier.
              </p>

            </div>

          </article>

        </div>

      </section>

      {/* =========================================================
          ADDITIONAL TOOLS
      ========================================================= */}
      <section className="toolsSection">

        <div className="toolsBox">

          <div className="toolsHeading">
            Plus, you&apos;ll also get:
          </div>

          <div className="toolsGrid">

            <div className="toolItem">

              <div className="toolIcon">
                ✓
              </div>

              <div>
                <h3>
                  Weekly Meal Planner
                </h3>

                <p>
                  Plan your week simply.
                </p>
              </div>

            </div>

            <div className="toolsDivider" />

            <div className="toolItem">

              <div className="toolIcon">
                ✓
              </div>

              <div>
                <h3>
                  Daily Habit Tracker
                </h3>

                <p>
                  Keep the small habits that make a big difference.
                </p>
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =========================================================
          FINAL PURCHASE CTA
      ========================================================= */}
      <section className="finalCta">

        <div className="finalInner">

          <div className="finalEyebrow">
            THE 14-DAY EAT BETTER RESET
          </div>

          <h2>
            Good Food.
            <br />
            Brighter Days.
          </h2>

          <p className="finalCopy">
            Real food. Simple habits. Zero dieting.
          </p>

          <div className="finalPurchase">

            <div className="finalPriceBadge">

              <span className="only">
                ONLY
              </span>

              <div className="finalPriceLine">

                <span className="finalDollar">
                  $
                </span>

                <strong>
                  19
                </strong>

                <span className="finalCad">
                  CAD
                </span>

              </div>

            </div>

            <a
              href={CHECKOUT_URL}
              className="finalBuyButton"
              aria-label="Buy the 14-Day Eat Better Reset for $19 CAD"
            >
              BUY NOW
              <span>→</span>
            </a>

          </div>

          <div className="finalTrust">
            <span>Instant digital download</span>
            <b>•</b>
            <span>Printable PDF</span>
            <b>•</b>
            <span>One-time payment</span>
            <b>•</b>
            <span>Yours to keep</span>
          </div>

        </div>

      </section>

      {/* =========================================================
          BACK HOME
      ========================================================= */}
      <div className="backHome">
        <Link href="/">
          ← Back to Wonderful-Life
        </Link>
      </div>

      {/* =========================================================
          STYLES
      ========================================================= */}
      <style>{`

        :global(*) {
          box-sizing: border-box;
        }

        .eatBetterPage {
          --green: #07513e;
          --deepGreen: #034536;
          --gold: #c9a34d;
          --goldLight: #dfc070;
          --cream: #fbf8ef;

          width: 100%;
          overflow-x: hidden;

          background: var(--cream);
          color: var(--green);
        }

        /* ======================================================
           HERO — LOCKED
        ====================================================== */

        .heroSection {
          width: 100%;

          display: flex;
          justify-content: center;

          background:
            radial-gradient(
              circle at center,
              #ffffff 0%,
              #fbf8ef 70%,
              #f1eadc 100%
            );
        }

        .heroFrame {
          position: relative;

          width: min(100%, 1024px);

          margin: 0 auto;

          line-height: 0;
        }

        .heroImage {
          display: block;

          width: 100%;
          height: auto;
        }

        /*
          LOCKED PRICE BADGE POSITION
        */

        .heroPriceButton {
          position: absolute;

          z-index: 10;

          top: 47.5%;
          right: 2.5%;

          width: 23%;

          aspect-ratio: 1 / 1;

          display: flex;
          flex-direction: column;

          align-items: center;
          justify-content: center;

          border-radius: 50%;

          border:
            3px solid rgba(255,255,255,0.65);

          background:
            linear-gradient(
              145deg,
              #d6b45e 0%,
              #bd943a 100%
            );

          box-shadow:
            0 12px 28px rgba(68,49,10,0.18),
            inset 0 1px 0 rgba(255,255,255,0.45);

          color: white;

          text-decoration: none;

          line-height: 1;

          transition:
            transform 160ms ease,
            box-shadow 160ms ease;
        }

        .heroPriceButton:hover {
          transform: scale(1.025);

          box-shadow:
            0 16px 34px rgba(68,49,10,0.22),
            inset 0 1px 0 rgba(255,255,255,0.45);
        }

        .heroPrice {
          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size:
            clamp(27px, 4.1vw, 53px);

          font-weight: 500;

          letter-spacing: -1px;
        }

        .heroBuy {
          margin-top: 10%;

          font-family:
            Arial,
            Helvetica,
            sans-serif;

          font-size:
            clamp(10px, 1.6vw, 19px);

          font-weight: 900;

          letter-spacing: 0.08em;
        }

        .heroBuy b {
          margin-left: 4px;

          font-size: 1.25em;
        }

        /* ======================================================
           VALUE STRIP
        ====================================================== */

        .valueStrip {
          border-top:
            1px solid rgba(7,81,62,0.12);

          border-bottom:
            1px solid rgba(7,81,62,0.12);

          background: #fffdf8;
        }

        .valueInner {
          max-width: 1024px;
          min-height: 94px;

          margin: 0 auto;

          padding:
            18px 28px;

          display: grid;

          grid-template-columns:
            1fr auto
            1fr auto
            1fr auto
            1fr;

          align-items: center;

          gap: 22px;
        }

        .valueItem {
          display: flex;

          align-items: center;
          justify-content: center;

          gap: 12px;
        }

        .valueNumber {
          display: block;

          color: var(--gold);

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 27px;

          font-style: italic;

          line-height: 1;
        }

        .valueItem strong,
        .valueItem div span {
          display: block;
        }

        .valueItem strong {
          color: var(--green);

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 15px;

          font-weight: 600;

          line-height: 1.15;
        }

        .valueItem div span {
          margin-top: 4px;

          color: #657069;

          font-family:
            Arial,
            Helvetica,
            sans-serif;

          font-size: 10px;

          line-height: 1.25;
        }

        .valueDivider {
          width: 1px;
          height: 44px;

          background:
            rgba(7,81,62,0.17);
        }

        /* ======================================================
           INSIDE
        ====================================================== */

        .insideSection {
          padding:
            54px 24px 38px;

          background:
            radial-gradient(
              circle at center top,
              #fffef9 0%,
              #fbf8ef 68%,
              #f6f0e4 100%
            );
        }

        .sectionHeading {
          max-width: 760px;

          margin:
            0 auto 28px;

          text-align: center;
        }

        .sectionEyebrow {
          margin-bottom: 8px;

          color: var(--gold);

          font-family:
            Arial,
            Helvetica,
            sans-serif;

          font-size: 13px;

          font-weight: 900;

          letter-spacing: 2.3px;
        }

        .sectionHeading h2 {
          margin: 0;

          color: var(--green);

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size:
            clamp(39px, 5vw, 57px);

          font-weight: 500;

          line-height: 1;
        }

        .sectionHeading p {
          margin:
            10px 0 0;

          color: #53615b;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 18px;
        }

        /* ======================================================
           TWO PREVIEWS
        ====================================================== */

        .previewGrid {
          max-width: 950px;

          margin: 0 auto;

          display: grid;

          grid-template-columns:
            repeat(2, minmax(0, 1fr));

          gap: 24px;
        }

        .previewCard {
          overflow: hidden;

          border:
            1px solid rgba(162,135,74,0.28);

          border-radius: 16px;

          background: #fffefa;

          box-shadow:
            0 12px 30px rgba(48,54,46,0.08);
        }

        .previewImageWrap {
          width: 100%;

          aspect-ratio:
            0.73 / 1;

          overflow: hidden;

          background: #eee9df;
        }

        .previewImage {
          display: block;

          width: 100%;
          height: 100%;

          object-fit: cover;

          object-position:
            top center;
        }

        .previewCopy {
          padding:
            16px 19px 20px;
        }

        .previewTag {
          display: inline-flex;

          min-height: 24px;

          padding:
            0 12px;

          align-items: center;

          border-radius: 999px;

          background: var(--green);

          color: white;

          font-family:
            Arial,
            Helvetica,
            sans-serif;

          font-size: 9px;

          font-weight: 900;

          letter-spacing: 0.08em;
        }

        .previewCopy h3 {
          margin:
            10px 0 5px;

          color: var(--green);

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 25px;

          line-height: 1.05;

          font-weight: 600;
        }

        .previewCopy p {
          margin: 0;

          color: #4b5953;

          font-family:
            Arial,
            Helvetica,
            sans-serif;

          font-size: 13px;

          line-height: 1.4;
        }

        /* ======================================================
           INCLUDED TOOLS
        ====================================================== */

        .toolsSection {
          padding:
            0 24px 52px;

          background: #f8f4e9;
        }

        .toolsBox {
          max-width: 950px;

          margin: 0 auto;

          padding:
            25px 35px;

          border-radius: 24px;

          background:
            #e8f0e2;
        }

        .toolsHeading {
          margin-bottom: 22px;

          color: var(--green);

          text-align: center;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 24px;

          font-style: italic;
        }

        .toolsGrid {
          display: grid;

          grid-template-columns:
            1fr auto 1fr;

          align-items: center;

          gap: 30px;
        }

        .toolItem {
          display: flex;

          align-items: center;

          gap: 14px;
        }

        .toolIcon {
          width: 45px;
          height: 45px;

          flex: 0 0 45px;

          display: flex;

          align-items: center;
          justify-content: center;

          border:
            2px solid var(--green);

          border-radius: 12px;

          color: var(--green);

          font-family:
            Arial,
            Helvetica,
            sans-serif;

          font-size: 23px;

          font-weight: 900;
        }

        .toolItem h3 {
          margin:
            0 0 3px;

          color: var(--green);

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 18px;
        }

        .toolItem p {
          margin: 0;

          color: #4b5953;

          font-family:
            Arial,
            Helvetica,
            sans-serif;

          font-size: 12px;
        }

        .toolsDivider {
          width: 1px;
          height: 48px;

          background:
            rgba(7,81,62,0.25);
        }

        /* ======================================================
           FINAL CTA
        ====================================================== */

        .finalCta {
          position: relative;

          overflow: hidden;

          padding:
            48px 24px 44px;

          background:
            radial-gradient(
              circle at 50% 0%,
              #0b6049 0%,
              #07513e 52%,
              #034536 100%
            );

          color: white;
        }

        .finalInner {
          position: relative;

          z-index: 2;

          max-width: 900px;

          margin: 0 auto;

          text-align: center;
        }

        .finalEyebrow {
          color: var(--goldLight);

          font-family:
            Arial,
            Helvetica,
            sans-serif;

          font-size: 12px;

          font-weight: 900;

          letter-spacing: 2.4px;
        }

        .finalCta h2 {
          margin:
            8px 0 10px;

          color: white;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size:
            clamp(47px, 6vw, 68px);

          line-height: 0.95;

          font-weight: 500;
        }

        .finalCopy {
          margin:
            0 0 22px;

          color:
            rgba(255,255,255,0.91);

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 19px;

          font-style: italic;
        }

        .finalPurchase {
          display: flex;

          align-items: center;
          justify-content: center;

          gap: 18px;
        }

        .finalPriceBadge {
          width: 124px;
          height: 124px;

          flex:
            0 0 124px;

          display: flex;

          flex-direction: column;

          align-items: center;
          justify-content: center;

          border-radius: 50%;

          border:
            3px solid rgba(255,255,255,0.48);

          background:
            linear-gradient(
              145deg,
              #d8b55d 0%,
              #bd943a 100%
            );

          box-shadow:
            0 10px 26px rgba(0,0,0,0.17);
        }

        .only {
          font-family:
            Arial,
            Helvetica,
            sans-serif;

          font-size: 10px;

          font-weight: 900;

          letter-spacing: 1.5px;
        }

        .finalPriceLine {
          display: flex;

          align-items: baseline;
        }

        .finalDollar {
          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 27px;
        }

        .finalPriceLine strong {
          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 49px;

          font-weight: 400;
        }

        .finalCad {
          margin-left: 4px;

          font-family:
            Arial,
            Helvetica,
            sans-serif;

          font-size: 11px;

          font-weight: 800;
        }

        .finalBuyButton {
          width:
            min(100%, 520px);

          min-height: 70px;

          padding:
            16px 28px;

          display: flex;

          align-items: center;
          justify-content: center;

          gap: 13px;

          border-radius: 999px;

          background:
            linear-gradient(
              180deg,
              #dfc16e 0%,
              #c7a04a 100%
            );

          color: #073e31;

          text-decoration: none;

          font-family:
            Arial,
            Helvetica,
            sans-serif;

          font-size: 21px;

          font-weight: 900;

          box-shadow:
            0 10px 26px rgba(0,0,0,0.16);

          transition:
            transform 160ms ease;
        }

        .finalBuyButton:hover {
          transform:
            translateY(-2px);
        }

        .finalBuyButton span {
          font-size: 29px;
        }

        .finalTrust {
          margin-top: 20px;

          display: flex;

          justify-content: center;
          flex-wrap: wrap;

          gap: 8px;

          color:
            rgba(255,255,255,0.88);

          font-family:
            Arial,
            Helvetica,
            sans-serif;

          font-size: 11px;
        }

        .finalTrust b {
          color: var(--goldLight);
        }

        /* ======================================================
           BACK HOME
        ====================================================== */

        .backHome {
          padding: 18px;

          background: #033d30;

          text-align: center;
        }

        .backHome a {
          color: white;

          text-decoration: none;

          font-family:
            Arial,
            Helvetica,
            sans-serif;

          font-size: 12px;
        }

        /* ======================================================
           MOBILE
        ====================================================== */

        @media (max-width: 650px) {

          /* HERO — LOCKED */

          .heroFrame {
            width: 100%;
          }

          .heroPriceButton {
            top: 47.5%;
            right: 2.5%;
            width: 23%;
          }

          .heroPrice {
            font-size:
              clamp(20px, 6vw, 30px);
          }

          .heroBuy {
            margin-top: 7%;

            font-size:
              clamp(7px, 2.5vw, 11px);
          }

          /* VALUE */

          .valueInner {
            min-height: auto;

            padding:
              16px 14px;

            grid-template-columns:
              1fr 1fr;

            gap:
              17px 12px;
          }

          .valueDivider {
            display: none;
          }

          .valueItem {
            justify-content: flex-start;
            align-items: flex-start;

            gap: 8px;
          }

          .valueNumber {
            font-size: 20px;
          }

          .valueItem strong {
            font-size: 11px;
          }

          .valueItem div span {
            margin-top: 2px;

            font-size: 8px;

            line-height: 1.2;
          }

          /* INSIDE */

          .insideSection {
            padding:
              32px 10px 25px;
          }

          .sectionHeading {
            margin-bottom: 19px;
          }

          .sectionEyebrow {
            font-size: 9px;

            letter-spacing: 1.6px;
          }

          .sectionHeading h2 {
            font-size: 31px;
          }

          .sectionHeading p {
            margin-top: 6px;

            font-size: 13px;
          }

          /* TWO PREVIEWS */

          .previewGrid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));

            gap: 7px;
          }

          .previewCard {
            border-radius: 9px;
          }

          .previewImageWrap {
            aspect-ratio:
              0.73 / 1;
          }

          .previewCopy {
            padding:
              9px 8px 11px;
          }

          .previewTag {
            min-height: 17px;

            padding:
              0 6px;

            font-size: 5.5px;
          }

          .previewCopy h3 {
            margin:
              6px 0 3px;

            font-size: 13px;
          }

          .previewCopy p {
            font-size: 8px;

            line-height: 1.3;
          }

          /* TOOLS */

          .toolsSection {
            padding:
              0 10px 29px;
          }

          .toolsBox {
            padding:
              17px 13px;

            border-radius: 15px;
          }

          .toolsHeading {
            margin-bottom: 14px;

            font-size: 17px;
          }

          .toolsGrid {
            grid-template-columns:
              1fr 1fr;

            gap: 10px;
          }

          .toolsDivider {
            display: none;
          }

          .toolItem {
            align-items: flex-start;

            gap: 7px;
          }

          .toolIcon {
            width: 31px;
            height: 31px;

            flex-basis: 31px;

            border-radius: 8px;

            font-size: 15px;
          }

          .toolItem h3 {
            font-size: 11px;
          }

          .toolItem p {
            font-size: 7.5px;

            line-height: 1.25;
          }

          /* FINAL CTA */

          .finalCta {
            padding:
              31px 12px 28px;
          }

          .finalEyebrow {
            font-size: 8px;

            letter-spacing: 1.5px;
          }

          .finalCta h2 {
            font-size: 39px;
          }

          .finalCopy {
            margin-bottom: 15px;

            font-size: 13px;
          }

          .finalPurchase {
            gap: 8px;
          }

          .finalPriceBadge {
            width: 87px;
            height: 87px;

            flex-basis: 87px;

            border-width: 2px;
          }

          .only {
            font-size: 6px;
          }

          .finalDollar {
            font-size: 18px;
          }

          .finalPriceLine strong {
            font-size: 34px;
          }

          .finalCad {
            margin-left: 2px;

            font-size: 7px;
          }

          .finalBuyButton {
            min-height: 55px;

            padding:
              12px 15px;

            font-size: 15px;
          }

          .finalBuyButton span {
            font-size: 21px;
          }

          .finalTrust {
            margin-top: 14px;

            gap: 4px;

            font-size: 7px;
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