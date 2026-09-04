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
           PREMIUM ENERGY RESET PRODUCT — FINAL OVERRIDE
           ========================================================= */
        .product { grid-template-columns:minmax(0,1.35fr) minmax(360px,.85fr); gap:46px; align-items:stretch; padding:34px; background:linear-gradient(135deg,#f5f7f1 0%,#fbfcf8 100%); }
        .guide-preview { grid-template-columns:1.08fr .92fr; gap:14px; min-width:0; }
        .guide-page { min-height:470px; padding:0; overflow:hidden; border:1px solid rgba(23,61,41,.08); border-radius:14px; box-shadow:0 16px 38px rgba(20,61,41,.10); }
        .guide-cover { position:relative; display:block; background:linear-gradient(145deg,#fff 0%,#f4f1e8 100%); color:#173d29; }
        .guide-cover-image { position:absolute; right:-9%; bottom:0; width:76%; height:91%; object-fit:contain; object-position:bottom right; z-index:1; }
        .guide-cover-shade { position:absolute; inset:0; z-index:2; background:linear-gradient(90deg,rgba(255,255,255,.98) 0%,rgba(255,255,255,.90) 39%,rgba(255,255,255,.10) 70%); }
        .guide-cover-content { position:relative; z-index:3; display:flex; flex-direction:column; height:100%; padding:28px 24px 24px; }
        .guide-brand { color:#173d29; font-size:10px; font-weight:800; letter-spacing:.15em; text-transform:uppercase; }
        .guide-cover-title { max-width:185px; margin:76px 0 0; color:#173d29; font-size:34px; font-weight:800; letter-spacing:-.045em; line-height:.96; }
        .guide-cover-title .gold { color:#b6933d; }
        .guide-cover-subtitle { max-width:170px; margin:18px 0 0; color:#53675b; font-size:12px; line-height:1.5; }
        .guide-cover-footer { margin-top:auto; color:#287148; font-size:9px; font-weight:800; letter-spacing:.15em; text-transform:uppercase; }
        .sample-page { padding:28px 22px; }
        .sample-page h4 { margin:18px 0 14px; font-size:22px; }
        .sample-page p,.sample-page li { font-size:12px; line-height:1.6; }
        .sample-callout { margin-top:18px; padding:14px; background:#f1f5ed; border-radius:10px; }
        .product-copy { display:flex; flex-direction:column; justify-content:center; min-width:0; padding:8px 8px 8px 0; }
        .product-copy h2 { margin:0 0 14px; font-size:clamp(34px,3.2vw,48px); line-height:1.02; }
        .product-copy > p { margin:0; font-size:16px; line-height:1.58; }
        .includes { display:grid; gap:8px; margin:22px 0 20px; }
        .includes li { margin:0; font-size:14px; }
        .purchase-block { padding-top:18px; border-top:1px solid #d9e2d5; }
        .price { margin:0 0 14px; font-size:34px; letter-spacing:-.025em; }
        .coming-button { display:flex; align-items:center; justify-content:center; width:100%; max-width:390px; margin:0; padding:16px 24px; font-size:13px; text-decoration:none; }
        .purchase-note { margin-top:12px !important; color:#617168 !important; font-size:12px !important; line-height:1.45 !important; }

        /* =========================================================
           REAL PRODUCT ASSETS — COVER + DAY 3
           ========================================================= */
        .guide-preview { grid-template-columns: .86fr 1.14fr; gap:16px; align-items:stretch; }
        .guide-page { min-height:0; aspect-ratio:auto; padding:0; background:#fff; }
        .guide-asset { display:block; width:100%; height:100%; object-fit:cover; }
        .guide-cover-asset { object-position:center; }
        .guide-day3-asset { object-fit:contain; background:#fff; }

        @media (max-width:760px) {
          .guide-preview { grid-template-columns:1fr 1fr; max-width:560px; gap:8px; }
          .guide-page { min-height:0; }
          .guide-asset { height:auto; }
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

        @media (max-width:760px) {
          .product { display:block; padding:18px 14px 22px; }
          .guide-preview { grid-template-columns:1.08fr .92fr; max-width:520px; margin:0 auto 28px; gap:8px; }
          .guide-page { min-height:315px; }
          .guide-cover-content { padding:18px 14px 16px; }
          .guide-cover-image { right:-15%; width:86%; height:88%; }
          .guide-cover-title { max-width:112px; margin-top:48px; font-size:23px; }
          .guide-cover-subtitle { max-width:108px; margin-top:12px; font-size:9px; }
          .guide-brand,.guide-cover-footer { font-size:7px; }
          .sample-page { padding:18px 13px; }
          .sample-page h4 { margin-top:12px; font-size:16px; }
          .sample-page p,.sample-page li { font-size:9px; line-height:1.45; }
          .product-copy { padding:0 3px; }
          .product-copy h2 { font-size:30px; }
          .price { font-size:30px; }
          .coming-button { max-width:none; }
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

        /* COMPACT TOP — hero + answer + actions + factors */
        .top-combo { display:grid; grid-template-columns: 46% 54%; min-height:620px; border:1px solid #dce7d8; border-radius:30px; overflow:hidden; background:#fbfcf8; }
        .top-combo .energy-hero { min-height:620px; border-radius:0; }
        .top-combo .energy-hero-content { min-height:620px; padding:54px 44px; }
        .top-combo .back-link { left:44px; top:28px; }
        .top-combo .energy-title { font-size:clamp(44px,4.2vw,64px); max-width:520px; }
        .top-combo .energy-lead { max-width:470px; font-size:16px; line-height:1.5; }
        .quick-panel { padding:34px 34px 28px; display:flex; flex-direction:column; justify-content:center; }
        .quick-panel h2 { margin:0 0 10px; font-size:34px; line-height:1.06; letter-spacing:-.035em; }
        .quick-answer { margin:0 0 20px; color:#59685f; font-size:15px; line-height:1.55; }
        .quick-rule { border:0; border-top:1px solid #d6e1d3; margin:0 0 18px; }
        .quick-panel .today { margin:0; padding:0; background:transparent; border:0; }
        .quick-panel .today h2 { font-size:25px; margin-bottom:12px; }
        .quick-panel .today-grid { margin:0; gap:10px; }
        .quick-panel .today-card { padding:0 0 12px; overflow:hidden; position:relative; }
        .today-thumb { width:100%; height:105px; object-fit:cover; display:block; }
        .quick-panel .today-number { position:absolute; top:86px; left:12px; width:30px; height:30px; margin:0; }
        .quick-panel .today-card h3 { margin:20px 12px 5px; font-size:15px; }
        .quick-panel .today-card p { margin:0 12px; font-size:12px; line-height:1.4; }
        .quick-panel .contributors { margin-top:18px; padding-top:16px; border-top:1px solid #d6e1d3; }
        .quick-panel .contributors .section-label { margin-bottom:10px; }
        .quick-panel .contributors h2 { display:none; }
        .quick-panel .factor-grid { grid-template-columns:repeat(3,1fr); gap:8px; margin-top:0; }
        .quick-panel .factor { padding:10px 11px; font-size:11px; line-height:1.35; min-height:72px; }
        .quick-panel .factor strong { font-size:13px; margin-bottom:3px; }
        .content { margin-top:32px; }
        @media (max-width: 900px) { .top-combo{display:block;} .top-combo .energy-hero,.top-combo .energy-hero-content{min-height:470px;} .quick-panel{padding:28px 20px;} .quick-panel .factor-grid{grid-template-columns:repeat(2,1fr);} }
        @media (max-width: 620px) { .quick-panel .today-grid{grid-template-columns:1fr;} .quick-panel .today-card{display:grid;grid-template-columns:115px 1fr;min-height:105px;padding:0;} .today-thumb{height:100%;min-height:105px;} .quick-panel .today-number{top:10px;left:98px;} .quick-panel .today-card h3{margin:18px 12px 4px 20px;} .quick-panel .today-card p{margin:0 12px 12px 20px;} }
      `}</style>

      <div className="energy-shell">

        {/* COMPACT HERO + ANSWER + ACTIONS */}
        <section className="top-combo">
          <section className="energy-hero">
            <img src="/images/editorial/jogging.png" alt="Jogger beside the Vancouver waterfront" />
            <div className="energy-overlay" />
            <div className="energy-hero-content">
              <Link href="/ask-zoey" className="back-link">← Ask Zoey</Link>
              <p className="energy-eyebrow">More Energy</p>
              <h1 className="energy-title">Why am I tired all the time?</h1>
              <p className="energy-lead">Feeling drained every day doesn&apos;t always mean you need more caffeine. Start by looking at what&apos;s really going on — and the simple habits that can help.</p>
            </div>
          </section>

          <div className="quick-panel">
            <p className="section-label">Zoey&apos;s Answer</p>
            <h2>Start with the fundamentals.</h2>
            <p className="quick-answer">Energy is influenced by sleep, nutrition, hydration, movement, stress and overall health. Look for patterns, start with the basics, and give small changes time to work.</p>
            <hr className="quick-rule" />

            <section className="today">
              <p className="section-label">Try This Today</p>
              <h2>Three simple places to start.</h2>
              <div className="today-grid">
                <div className="today-card"><img className="today-thumb" src="/images/editorial/hydration (2).png" alt="Hydration"/><span className="today-number">1</span><h3>Start with water</h3><p>Have a glass when you wake up and keep water nearby.</p></div>
                <div className="today-card"><img className="today-thumb" src="/images/editorial/avocado toast with egg.png" alt="Protein-rich breakfast"/><span className="today-number">2</span><h3>Add protein</h3><p>Include a protein source in your first substantial meal.</p></div>
                <div className="today-card"><img className="today-thumb" src="/images/editorial/walking.png" alt="Walking outdoors"/><span className="today-number">3</span><h3>Move for 10 minutes</h3><p>Take a brisk walk outdoors to break up a sluggish day.</p></div>
              </div>
            </section>

            <section className="contributors">
              <p className="section-label">What may be affecting your energy?</p>
              <h2>What may be affecting your energy?</h2>
              <div className="factor-grid">
                <div className="factor"><strong>Sleep</strong>Poor-quality sleep can leave you tired even after enough hours.</div>
                <div className="factor"><strong>Food</strong>Skipped or unsatisfying meals can contribute to energy swings.</div>
                <div className="factor"><strong>Hydration</strong>Not drinking enough fluids can leave you feeling sluggish.</div>
                <div className="factor"><strong>Movement</strong>Long periods of inactivity can make a tired day feel worse.</div>
                <div className="factor"><strong>Stress</strong>Constant mental load can be exhausting without physical work.</div>
                <div className="factor"><strong>Health</strong>Persistent fatigue can sometimes have an underlying medical cause.</div>
              </div>
            </section>
          </div>
        </section>

        <section className="content">
          {/* DIGITAL PRODUCT */}
          <section className="product">

            <div className="guide-preview">

              {/* FINISHED ENERGY RESET COVER */}
              <div className="guide-page">
                <img
                  className="guide-asset guide-cover-asset"
                  src="/images/energy-reset-cover.png"
                  alt="Wonderful-Life 14-Day Energy Reset guide cover featuring Zoey"
                />
              </div>

              {/* ACTUAL DAY 3 PAGE FROM THE GUIDE */}
              <div className="guide-page">
                <img
                  className="guide-asset guide-day3-asset"
                  src="/images/energy-reset-day-3.png"
                  alt="Day 3 Build a Better Breakfast sample page from the 14-Day Energy Reset"
                />
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

              <div className="purchase-block">
                <div className="price">$19 CAD</div>
                <Link href="/energy-reset" className="coming-button">
                  GET THE ENERGY RESET →
                </Link>
                <p className="purchase-note">Instant digital download • PDF guide • Works on all devices</p>
              </div> 
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