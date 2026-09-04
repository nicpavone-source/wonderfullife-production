import Link from "next/link";

export default function MoreEnergyPage() {
  return (
    <main className="energy-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .energy-page {
          min-height: 100vh;
          background: #ffffff;
          color: #173d29;
          font-family: Arial, Helvetica, sans-serif;
        }

        .energy-shell {
          width: 100%;
          max-width: 1380px;
          margin: 0 auto;
          padding: 30px 42px 80px;
        }

        /* =========================================================
           HERO
           ========================================================= */

        .energy-hero {
          position: relative;
          min-height: 520px;
          overflow: hidden;
          border-radius: 30px;
          background: #173d29;
        }

        .energy-hero img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .energy-overlay {
          position: absolute;
          inset: 0;

          background:
            linear-gradient(
              90deg,
              rgba(10, 42, 27, 0.88) 0%,
              rgba(10, 42, 27, 0.67) 42%,
              rgba(10, 42, 27, 0.12) 75%
            );
        }

        .energy-hero-content {
          position: relative;
          z-index: 2;

          display: flex;
          flex-direction: column;
          justify-content: center;

          min-height: 520px;
          max-width: 700px;

          padding: 60px;

          color: white;
        }

        .back-link {
          position: absolute;
          top: 30px;
          left: 60px;

          color: rgba(255, 255, 255, 0.92);

          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
        }

        .energy-eyebrow {
          margin: 0 0 13px;

          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .energy-title {
          max-width: 650px;
          margin: 0;

          font-size: clamp(45px, 5vw, 68px);
          font-weight: 700;
          letter-spacing: -0.045em;
          line-height: 1;
        }

        .energy-lead {
          max-width: 590px;
          margin: 22px 0 0;

          color: rgba(255, 255, 255, 0.92);

          font-size: 18px;
          line-height: 1.6;
        }

        /* =========================================================
           MAIN CONTENT
           ========================================================= */

        .content {
          max-width: 1000px;
          margin: 58px auto 0;
        }

        .section-label {
          margin: 0 0 10px;

          color: #287148;

          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .content h2 {
          margin: 0 0 18px;

          color: #173d29;

          font-size: 35px;
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1.1;
        }

        .answer {
          color: #59685f;

          font-size: 17px;
          line-height: 1.75;
        }

        .answer p {
          margin: 0 0 18px;
        }

        /* =========================================================
           TRY THIS TODAY
           ========================================================= */

        .today {
          margin-top: 42px;
          padding: 32px;

          background: #f3f7f0;
          border: 1px solid #dce7d8;
          border-radius: 22px;
        }

        .today-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;

          margin-top: 22px;
        }

        .today-card {
          padding: 22px;

          background: white;
          border: 1px solid #e0e8de;
          border-radius: 16px;
        }

        .today-number {
          display: flex;
          align-items: center;
          justify-content: center;

          width: 34px;
          height: 34px;

          margin-bottom: 14px;

          border-radius: 50%;

          background: #173d29;
          color: white;

          font-size: 12px;
          font-weight: 700;
        }

        .today-card h3 {
          margin: 0 0 8px;

          color: #173d29;

          font-size: 17px;
          font-weight: 700;
        }

        .today-card p {
          margin: 0;

          color: #65736a;

          font-size: 14px;
          line-height: 1.55;
        }

        /* =========================================================
           ENERGY FACTORS
           ========================================================= */

        .contributors {
          margin-top: 52px;
        }

        .factor-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;

          margin-top: 22px;
        }

        .factor {
          padding: 18px 20px;

          border: 1px solid #e0e7de;
          border-radius: 14px;

          color: #42574a;

          font-size: 15px;
          line-height: 1.45;
        }

        .factor strong {
          display: block;

          margin-bottom: 4px;

          color: #173d29;
        }

        /* =========================================================
           DIGITAL PRODUCT
           ========================================================= */

        .product {
          display: grid;
          grid-template-columns: 0.85fr 1.15fr;
          gap: 40px;
          align-items: center;

          margin-top: 70px;
          padding: 42px;

          background: #f4f7f1;
          border: 1px solid #dce6d9;
          border-radius: 28px;
        }

        .guide-preview {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .guide-page {
          min-height: 330px;

          padding: 26px 20px;

          background: white;
          border-radius: 10px;

          box-shadow:
            0 12px 30px rgba(20, 61, 41, 0.1);
        }

        .guide-cover {
          display: flex;
          flex-direction: column;
          justify-content: space-between;

          background:
            linear-gradient(
              145deg,
              #174c32,
              #28764b
            );

          color: white;
        }

        .guide-brand {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .guide-cover h3 {
          margin: 0;

          font-size: 28px;
          line-height: 1.05;
        }

        .guide-cover p {
          margin: 10px 0 0;

          color: rgba(255, 255, 255, 0.8);

          font-size: 12px;
          line-height: 1.45;
        }

        .sample-label {
          color: #287148;

          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }

        .sample-page h4 {
          margin: 15px 0 12px;

          color: #173d29;

          font-size: 19px;
          line-height: 1.15;
        }

        .sample-page p,
        .sample-page li {
          color: #66736b;

          font-size: 11px;
          line-height: 1.55;
        }

        .sample-page ul {
          padding-left: 17px;
        }

        .product-copy h2 {
          margin-bottom: 15px;
        }

        .product-copy > p {
          color: #607067;

          font-size: 16px;
          line-height: 1.65;
        }

        .includes {
          margin: 22px 0;
          padding: 0;

          list-style: none;
        }

        .includes li {
          margin: 9px 0;

          color: #405649;

          font-size: 14px;
        }

        .includes li::before {
          content: "✓";

          margin-right: 10px;

          color: #287148;

          font-weight: 700;
        }

        .price {
          margin: 22px 0 4px;

          color: #173d29;

          font-size: 27px;
          font-weight: 700;
        }

        .coming-button {
          display: inline-block;

          margin-top: 14px;
          padding: 14px 22px;

          border-radius: 999px;

          background: #173d29;
          color: white;

          font-size: 13px;
          font-weight: 700;
        }

        /* =========================================================
           MEDICAL NOTE
           ========================================================= */

        .medical {
          max-width: 850px;

          margin: 42px auto 0;

          color: #78837c;

          font-size: 12px;
          line-height: 1.6;
          text-align: center;
        }

        /* =========================================================
           MOBILE
           ========================================================= */

        @media (max-width: 760px) {
          .energy-shell {
            padding: 14px 12px 50px;
          }

          .energy-hero {
            min-height: 480px;

            border-radius: 22px;
          }

          .energy-hero img {
            object-position: 48% center;
          }

          .energy-overlay {
            background:
              linear-gradient(
                to top,
                rgba(8, 35, 21, 0.93) 0%,
                rgba(8, 35, 21, 0.60) 55%,
                rgba(8, 35, 21, 0.10) 100%
              );
          }

          .energy-hero-content {
            justify-content: flex-end;

            min-height: 480px;

            padding: 28px 24px 34px;
          }

          .back-link {
            top: 22px;
            left: 24px;
          }

          .energy-title {
            font-size: 38px;
          }

          .energy-lead {
            margin-top: 14px;

            font-size: 14px;
            line-height: 1.55;
          }

          .content {
            margin-top: 36px;
            padding: 0 6px;
          }

          .section-label {
            font-size: 10px;
          }

          .content h2 {
            margin-bottom: 14px;

            font-size: 26px;
            line-height: 1.1;
          }

          .answer {
            font-size: 15px;
            line-height: 1.65;
          }

          .answer p {
            margin-bottom: 15px;
          }

          /* TRY THIS TODAY */

          .today {
            margin-top: 30px;
            padding: 20px 16px;

            border-radius: 18px;
          }

          .today-grid {
            grid-template-columns: 1fr;
            gap: 8px;

            margin-top: 16px;
          }

          .today-card {
            padding: 15px 16px;
          }

          .today-number {
            width: 30px;
            height: 30px;

            margin-bottom: 10px;

            font-size: 11px;
          }

          .today-card h3 {
            margin-bottom: 5px;

            font-size: 15px;
          }

          .today-card p {
            font-size: 13px;
            line-height: 1.5;
          }

          /* ENERGY FACTORS */

          .contributors {
            margin-top: 38px;
          }

          .factor-grid {
            grid-template-columns: 1fr;
            gap: 8px;

            margin-top: 16px;
          }

          .factor {
            padding: 14px 16px;

            border-radius: 13px;

            font-size: 13.5px;
            line-height: 1.45;
          }

          .factor strong {
            margin-bottom: 3px;

            font-size: 14px;
          }

          /* PRODUCT */

          .product {
            display: block;

            margin-top: 46px;
            padding: 22px 16px;

            border-radius: 20px;
          }

          .guide-preview {
            max-width: 430px;

            margin: 0 auto 30px;

            gap: 8px;
          }

          .guide-page {
            min-height: 270px;

            padding: 18px 14px;
          }

          .guide-cover h3 {
            font-size: 21px;
          }

          .sample-page h4 {
            font-size: 15px;
          }

          .sample-page p,
          .sample-page li {
            font-size: 9px;
          }

          .product-copy h2 {
            font-size: 27px;
          }

          .product-copy > p {
            font-size: 14px;
            line-height: 1.6;
          }

          .includes {
            margin: 18px 0;
          }

          .includes li {
            margin: 8px 0;

            font-size: 13px;
          }

          .price {
            margin-top: 18px;

            font-size: 26px;
          }

          .medical {
            margin-top: 30px;

            font-size: 11px;
          }
        }

        /* =========================================================
           SMALL PHONES
           ========================================================= */

        @media (max-width: 390px) {
          .energy-shell {
            padding-left: 10px;
            padding-right: 10px;
          }

          .energy-hero {
            min-height: 450px;
          }

          .energy-hero-content {
            min-height: 450px;
            padding-left: 20px;
            padding-right: 20px;
          }

          .energy-title {
            font-size: 34px;
          }

          .content h2 {
            font-size: 24px;
          }

          .guide-cover h3 {
            font-size: 19px;
          }
        }
      `}</style>

      <div className="energy-shell">

        {/* HERO */}
        <section className="energy-hero">
          <img
            src="/images/editorial/jogging.png"
            alt="Active man jogging outdoors"
          />

          <div className="energy-overlay" />

          <div className="energy-hero-content">
            <Link
              href="/ask-zoey"
              className="back-link"
            >
              ← Ask Zoey
            </Link>

            <p className="energy-eyebrow">
              More Energy
            </p>

            <h1 className="energy-title">
              Why am I tired all the time?
            </h1>

            <p className="energy-lead">
              Feeling drained every day doesn't always mean you need
              another cup of coffee. Start by looking at the everyday
              habits that help your body produce and maintain steady
              energy.
            </p>
          </div>
        </section>

        <section className="content">

          {/* ZOEY ANSWER */}
          <p className="section-label">
            Zoey&apos;s Answer
          </p>

          <h2>
            Start with the fundamentals.
          </h2>

          <div className="answer">
            <p>
              Energy is influenced by much more than how many hours
              you spend in bed. Sleep quality, hydration, the foods
              you eat, meal timing, physical activity and stress can
              all affect how energetic you feel throughout the day.
            </p>

            <p>
              Instead of trying to fix everything at once, look for
              patterns. Do you skip breakfast and feel exhausted by
              mid-morning? Do you rely on caffeine to compensate for
              poor sleep? Are long periods of sitting leaving you
              sluggish? Small clues can point toward practical
              changes.
            </p>

            <p>
              Start with the basics and give them time to work.
              Consistent sleep, nutritious meals containing protein,
              adequate fluids and regular movement provide a strong
              foundation for everyday energy.
            </p>
          </div>

          {/* TRY THIS TODAY */}
          <section className="today">
            <p className="section-label">
              Try This Today
            </p>

            <h2>
              Three simple places to start.
            </h2>

            <div className="today-grid">

              <div className="today-card">
                <span className="today-number">
                  1
                </span>

                <h3>
                  Start with water
                </h3>

                <p>
                  Have a glass of water when you wake up and keep
                  fluids within reach during the day.
                </p>
              </div>

              <div className="today-card">
                <span className="today-number">
                  2
                </span>

                <h3>
                  Add protein
                </h3>

                <p>
                  Include a useful protein source in your first
                  substantial meal instead of relying mainly on
                  refined carbohydrates.
                </p>
              </div>

              <div className="today-card">
                <span className="today-number">
                  3
                </span>

                <h3>
                  Move for 10 minutes
                </h3>

                <p>
                  Take a brisk walk outdoors. Movement and daylight
                  are simple ways to break up a sluggish day.
                </p>
              </div>

            </div>
          </section>

          {/* ENERGY FACTORS */}
          <section className="contributors">
            <p className="section-label">
              Look At The Whole Day
            </p>

            <h2>
              What may be affecting your energy?
            </h2>

            <div className="factor-grid">

              <div className="factor">
                <strong>
                  Sleep
                </strong>

                Irregular schedules and poor-quality sleep can leave
                you tired even after spending enough time in bed.
              </div>

              <div className="factor">
                <strong>
                  Food
                </strong>

                Skipped meals and meals that aren&apos;t satisfying can
                contribute to energy swings.
              </div>

              <div className="factor">
                <strong>
                  Hydration
                </strong>

                Your fluid needs vary, but regularly forgetting to
                drink can leave you feeling below your best.
              </div>

              <div className="factor">
                <strong>
                  Movement
                </strong>

                Long periods of inactivity can make an already tired
                day feel even more sluggish.
              </div>

              <div className="factor">
                <strong>
                  Stress
                </strong>

                Constant mental load can be exhausting even when
                you&apos;re not doing strenuous physical work.
              </div>

              <div className="factor">
                <strong>
                  Health
                </strong>

                Persistent fatigue can sometimes have an underlying
                medical cause and shouldn&apos;t simply be ignored.
              </div>

            </div>
          </section>

          {/* DIGITAL PRODUCT */}
          <section className="product">

            <div className="guide-preview">

              {/* COVER */}
              <div className="guide-page guide-cover">
                <span className="guide-brand">
                  Wonderful-Life
                </span>

                <div>
                  <p className="guide-brand">
                    14-Day Guide
                  </p>

                  <h3>
                    Energy
                    <br />
                    Reset
                  </h3>

                  <p>
                    Simple everyday habits for more consistent
                    energy.
                  </p>
                </div>

                <span className="guide-brand">
                  Ask Zoey
                </span>
              </div>

              {/* SAMPLE PAGE */}
              <div className="guide-page sample-page">
                <span className="sample-label">
                  Sample Page
                </span>

                <h4>
                  Day 3
                  <br />
                  Build a Better Breakfast
                </h4>

                <p>
                  Build your first substantial meal around protein,
                  fibre and foods you genuinely enjoy.
                </p>

                <strong>
                  Try today:
                </strong>

                <ul>
                  <li>Add a protein source.</li>
                  <li>Include fruit or vegetables.</li>
                  <li>Drink water with your meal.</li>
                </ul>

                <p>
                  <strong>
                    Today&apos;s goal:
                  </strong>

                  <br />

                  Notice how your energy feels before lunch.
                </p>
              </div>

            </div>

            {/* PRODUCT COPY */}
            <div className="product-copy">
              <p className="section-label">
                Go Deeper
              </p>

              <h2>
                14-Day Energy Reset
              </h2>

              <p>
                Want some structure? The Energy Reset turns these
                fundamentals into a simple two-week plan you can
                follow one day at a time.
              </p>

              <ul className="includes">
                <li>14-day daily action plan</li>
                <li>Simple meal ideas</li>
                <li>Protein and breakfast guide</li>
                <li>Hydration tracker</li>
                <li>Sleep routine checklist</li>
                <li>Daily energy tracker</li>
                <li>Printable worksheets</li>
              </ul>

             <div className="price">
  $19 CAD
</div>

<Link
  href="/energy-reset"
  className="coming-button"
>
  GET THE ENERGY RESET
</Link> 
            </div>

          </section>

          {/* MEDICAL NOTE */}
          <p className="medical">
            Persistent or unexplained fatigue can have many causes.
            If tiredness is severe, new, worsening or interfering
            with your daily life, speak with a qualified healthcare
            professional. Wonderful-Life provides general
            educational wellness information and does not diagnose
            or treat medical conditions.
          </p>

        </section>
      </div>
    </main>
  );
}