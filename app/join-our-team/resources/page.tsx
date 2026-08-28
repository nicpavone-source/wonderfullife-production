import Link from "next/link";
import JoinTeamResourceList from "@/components/community/JoinTeamResourceList";

export const metadata = {
  title: "Join Our Team Resources | WonderfulLife.ca",
  description:
    "Explore WonderfulLife entrepreneurship articles, guides, videos, stories, FAQs, events, and opportunity information.",
};

export default function JoinOurTeamResourcesPage() {
  return (
    <>
      <JoinTeamResourceList />

      <section className="wl-team-contact">
        <div className="wl-team-contact-inner">
          <p className="wl-team-contact-eyebrow">
            HAVE A QUESTION?
          </p>

          <h2>We&apos;d love to hear from you.</h2>

          <p className="wl-team-contact-copy">
            If you&apos;d like to learn more about WonderfulLife,
            the opportunity, or simply have a question, get in
            touch. There&apos;s no pressure and no obligation.
          </p>

          <Link
            href="/contact"
            className="wl-team-contact-button"
          >
            Contact Us →
          </Link>
        </div>
      </section>

      <style>{`
        .wl-team-contact {
          width: 100%;
          padding: 32px 20px 70px;
          background: #f7faf5;
        }

        .wl-team-contact-inner {
          width: min(760px, 100%);
          margin: 0 auto;
          padding: 38px 34px;
          text-align: center;
          border: 1px solid #d9e5d7;
          border-radius: 28px;
          background: #ffffff;
          box-shadow:
            0 14px 40px rgba(20, 61, 41, 0.06);
        }

        .wl-team-contact-eyebrow {
          margin: 0 0 10px;
          color: #237343;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.15em;
        }

        .wl-team-contact h2 {
          margin: 0;
          color: #123f2a;
          font-family:
            Georgia,
            "Times New Roman",
            serif;
          font-size: clamp(30px, 5vw, 44px);
          line-height: 1.08;
        }

        .wl-team-contact-copy {
          max-width: 590px;
          margin: 16px auto 24px;
          color: #65756b;
          font-size: 16px;
          line-height: 1.65;
        }

        .wl-team-contact-button {
          display: inline-flex;
          min-height: 52px;
          align-items: center;
          justify-content: center;
          padding: 0 27px;
          border-radius: 999px;
          background: #237343;
          color: #ffffff;
          font-size: 15px;
          font-weight: 900;
          text-decoration: none;
          box-shadow:
            0 10px 24px rgba(35, 115, 67, 0.18);
          transition:
            transform 160ms ease,
            background 160ms ease;
        }

        .wl-team-contact-button:hover {
          background: #185d35;
          transform: translateY(-2px);
        }

        .wl-team-contact-button:active {
          transform: scale(0.98);
        }

        @media (max-width: 650px) {
          .wl-team-contact {
            padding: 24px 16px 55px;
          }

          .wl-team-contact-inner {
            padding: 30px 22px;
            border-radius: 24px;
          }

          .wl-team-contact-copy {
            font-size: 15px;
          }

          .wl-team-contact-button {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}