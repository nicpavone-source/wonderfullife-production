import Link from "next/link";

export default function WellnessHero() {
  return (
    <section className="wellness-hero">
      <style>{`
        .wellness-hero {
          position: relative;
          width: 100%;
          overflow: hidden;
          background: #ffffff;
        }

        .wellness-hero-image {
          display: block;
          width: 100%;
          height: auto;
        }

        .wellness-hero-overlay-link {
          position: absolute;
          z-index: 2;
          border-radius: 14px;
        }

        .wellness-hero-overlay-link:focus-visible {
          outline: 3px solid #ffffff;
          outline-offset: 3px;
          box-shadow: 0 0 0 5px rgba(89, 38, 183, 0.55);
        }

        /*
         * Invisible clickable areas positioned over the
         * buttons already built into the hero artwork.
         */

        .explore-wellness-link {
          left: 3.8%;
          top: 65.6%;
          width: 12%;
          height: 6.8%;
        }

        .watch-zoey-link {
          left: 17.1%;
          top: 65.6%;
          width: 14.8%;
          height: 6.8%;
        }

        .studio-link {
          left: 64%;
          top: 85%;
          width: 13%;
          height: 6%;
        }

        @media (max-width: 900px) {
          .wellness-hero {
            overflow-x: auto;
          }

          .wellness-hero-inner {
            position: relative;
            min-width: 900px;
          }

          .wellness-hero-image {
            min-width: 900px;
          }
        }
      `}</style>

      <div className="wellness-hero-inner">
        <img
          src="/images/wellness-homepage-v2.png"
          alt="WonderfulLife wellness homepage featuring Zoey, wellness guidance, and the WonderfulLife Studio"
          className="wellness-hero-image"
        />

        <Link
          href="#wellness-content"
          className="wellness-hero-overlay-link explore-wellness-link"
          aria-label="Explore Wellness"
        />

        <Link
          href="/meet-zoey"
          className="wellness-hero-overlay-link watch-zoey-link"
          aria-label="Watch Zoey's Story"
        />

        <Link
          href="/ai-studio"
          className="wellness-hero-overlay-link studio-link"
          aria-label="Explore the WonderfulLife Studio"
        />
      </div>
    </section>
  );
}