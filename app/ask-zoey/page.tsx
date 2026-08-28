import ZoeyChat from "@/components/ZoeyChat";
import ZoeyVideo from "@/components/ZoeyVideo";

export default function AskZoeyPage() {
  return (
    <main className="ask-zoey-page">
      <style>{`
        /* =========================================================
           ASK ZOEY — RESPONSIVE PAGE
           ========================================================= */

        .ask-zoey-page {
          min-height: calc(100vh - 110px);
          background:
            linear-gradient(
              135deg,
              #f7faf6 0%,
              #eef5ec 48%,
              #f8faf7 100%
            );
          color: #173d29;
          overflow-x: hidden;
        }

        .ask-zoey-shell {
          width: 100%;
          max-width: 1500px;
          margin: 0 auto;
          padding: 24px 48px 50px;
          box-sizing: border-box;
        }

        .ask-zoey-grid {
          display: grid;
          grid-template-columns:
            minmax(0, 1.12fr)
            minmax(420px, 0.88fr);
          gap: 26px;
          align-items: stretch;
        }

        .ask-zoey-video {
          min-width: 0;
        }

        .ask-zoey-conversation {
          min-width: 0;
          min-height: 650px;

          padding: 34px;

          border: 1px solid #dce6dc;
          border-radius: 30px;

          background: rgba(255, 255, 255, 0.94);

          box-shadow:
            0 24px 70px
            rgba(20, 61, 41, 0.08);

          box-sizing: border-box;
        }

        .ask-zoey-eyebrow {
          margin: 0;

          color: #267047;

          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.16em;
          line-height: 1.4;
          text-transform: uppercase;
        }

        .ask-zoey-title {
          margin: 10px 0 10px;

          color: #173d29;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 34px;
          line-height: 1.12;
        }

        .ask-zoey-intro {
          margin: 0 0 25px;

          color: #69776e;

          font-size: 15px;
          line-height: 1.65;
        }

        .ask-zoey-trust {
          display: flex;
          justify-content: center;
          gap: 26px;
          flex-wrap: wrap;

          margin-top: 24px;

          color: #738078;

          font-size: 12px;
          font-weight: 700;
        }

        /* =========================================================
           TABLET
           ========================================================= */

        @media (max-width: 1000px) {
          .ask-zoey-shell {
            padding-left: 28px;
            padding-right: 28px;
          }

          .ask-zoey-grid {
            grid-template-columns:
              minmax(0, 1fr)
              minmax(360px, 0.9fr);

            gap: 20px;
          }

          .ask-zoey-conversation {
            padding: 28px;
          }
        }

        /* =========================================================
           MOBILE
           ========================================================= */

        @media (max-width: 760px) {
          .ask-zoey-page {
            min-height: calc(100vh - 72px);
          }

          .ask-zoey-shell {
            width: 100%;
            max-width: none;

            padding:
              18px
              16px
              34px;

            margin: 0;

            box-sizing: border-box;
          }

          .ask-zoey-grid {
            display: block;
            width: 100%;
          }

          /*
            On mobile the conversation is the primary experience.
            The large desktop Zoey video is removed so visitors can
            immediately begin chatting without excessive scrolling.
          */
          .ask-zoey-video {
  display: block;
  width: 100%;
  height: 300px;
  margin-bottom: 16px;
  overflow: hidden;
  border-radius: 22px;
}

          .ask-zoey-conversation {
            width: 100%;
            min-width: 0;
            max-width: 100%;

            min-height: 0;

            margin: 0;
            padding: 24px 20px 26px;

            border-radius: 24px;

            box-sizing: border-box;

            overflow: hidden;
          }

          .ask-zoey-eyebrow {
            font-size: 10px;
            letter-spacing: 0.15em;
          }

          .ask-zoey-title {
            width: 100%;
            max-width: 100%;

            margin-top: 9px;
            margin-bottom: 10px;

            font-size: clamp(
              2rem,
              9vw,
              2.65rem
            );

            line-height: 1.05;

            overflow-wrap: break-word;
          }

          .ask-zoey-intro {
            width: 100%;
            max-width: 100%;

            margin-bottom: 22px;

            font-size: 14px;
            line-height: 1.55;
          }

          .ask-zoey-trust {
            gap: 8px 18px;

            margin-top: 18px;

            padding: 0 4px;

            font-size: 10px;
            line-height: 1.45;
            text-align: center;
          }
        }

        /* =========================================================
           SMALL PHONES
           ========================================================= */

        @media (max-width: 390px) {
          .ask-zoey-shell {
            padding-left: 12px;
            padding-right: 12px;
          }

          .ask-zoey-conversation {
            padding:
              22px
              16px
              24px;

            border-radius: 21px;
          }

          .ask-zoey-title {
            font-size: 2rem;
          }

          .ask-zoey-intro {
            font-size: 13.5px;
          }
        }
      `}</style>

      <section className="ask-zoey-shell">
        <div className="ask-zoey-grid">
          {/* ZOEY VIDEO — DESKTOP / TABLET */}
          <div className="ask-zoey-video">
            <ZoeyVideo />
          </div>

          {/* CONVERSATION */}
          <section className="ask-zoey-conversation">
            <p className="ask-zoey-eyebrow">
              Private Conversation
            </p>

            <h1 className="ask-zoey-title">
              What can I help you with today?
            </h1>

            <p className="ask-zoey-intro">
              Ask about wellness, nutrition, sleep, healthy aging,
              recipes, products—or simply where to begin.
            </p>

            <ZoeyChat />
          </section>
        </div>

        <div className="ask-zoey-trust">
          <span>✦ Personalized guidance</span>
          <span>✦ Available anytime</span>
          <span>✦ Powered by WonderfulLife AI</span>
        </div>
      </section>
    </main>
  );
}