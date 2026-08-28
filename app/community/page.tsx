import Image from "next/image";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

type JoinTeamResource = {
  id: number;
  type: string;
  title: string;
  slug: string;
  topic: string | null;
  reading_minutes: number | null;
  image_url: string | null;
  excerpt: string | null;
  summary: string | null;
  published_at: string | null;
  featured: boolean | null;
};

function getResourceLabel(item: JoinTeamResource) {
  const topic = String(item.topic || "").trim();

  if (topic) {
    return topic
      .replace(/-/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  return item.type === "video" ? "Video" : "Article";
}

function getResourceHref(item: JoinTeamResource) {
  return item.type === "video"
    ? `/videos/${item.slug}`
    : `/articles/${item.slug}`;
}

const values = [
  ["Wellness", "A healthier, more vibrant you.", "◉"],
  ["People", "Meaningful connections.", "◎"],
  ["Opportunity", "Build something of your own.", "▥"],
  ["Freedom", "A life on your terms.", "♥"],
];

const featureCards = [
  {
    eyebrow: "Perspective",
    title: "A Different Way to Think About Work",
    text:
      "People should have the opportunity to do something they enjoy — and, more importantly, enjoy what they do.",
    cta: "Discover a New Perspective",
    href: "#philosophy",
    image: "/images/join-team/jt-work-perspective.jpg",
  },
  {
    eyebrow: "Entrepreneurship",
    title: "Explore Entrepreneurship",
    text:
      "Entrepreneurship offers flexibility, personal growth, and the potential to create a life you love — along with real responsibility and effort.",
    cta: "What Does It Really Mean?",
    href: "#entrepreneurship",
    image: "/images/join-team/jt-entrepreneurship.jpg",
  },
  {
    eyebrow: "WonderfulLife",
    title: "The WonderfulLife Approach",
    text:
      "Wellness, relationships, education, content, and entrepreneurship — all working together for a more meaningful future.",
    cta: "Our Vision and Values",
    href: "#philosophy",
    image: "/images/join-team/jt-wonderfullife-approach.jpg",
  },
];

export default async function CommunityPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("content_items")
    .select(
      "id,type,title,slug,topic,reading_minutes,image_url,excerpt,summary,published_at,featured"
    )
    .in("primary_section", ["Join Our Team", "Community"])
    .eq("status", "published")
    .in("type", ["article", "video"])
    .order("published_at", { ascending: false })
    .limit(50);

  const allResources = (data || []) as JoinTeamResource[];

  // Keep the section fresh:
  // 1 newest + 1 featured + 2 rotating items.
  const recentResource = allResources[0];

  const featuredResource = allResources.find(
    (item) =>
      item.featured === true &&
      item.id !== recentResource?.id
  );

  const rotatingPool = allResources.filter(
    (item) =>
      item.id !== recentResource?.id &&
      item.id !== featuredResource?.id
  );

  const shuffledRotating = [...rotatingPool].sort(
    () => Math.random() - 0.5
  );

  const resources = [
    ...(recentResource ? [recentResource] : []),
    ...(featuredResource ? [featuredResource] : []),
    ...shuffledRotating.slice(
      0,
      featuredResource ? 2 : 3
    ),
  ].slice(0, 4);

  return (
    <main className="join-team-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .join-team-page {
          background: #f7f8f5;
          color: #153d29;
        }

        .jt-shell {
          width: min(100% - 48px, 1500px);
          margin: 0 auto;
        }

        .jt-hero {
          position: relative;
          width: 100%;
          aspect-ratio: 2048 / 758;
          overflow: hidden;
          background: #153d29;
        }

        .jt-hero-image {
          position: absolute;
          inset: 0;
        }

        .jt-hero-image img {
          object-fit: cover;
          object-position: 50% center;
        }

        .jt-hero-hotspot {
          position: absolute;
          z-index: 2;
          left: 6.4%;
          bottom: 18.5%;
          width: 22%;
          height: 11%;
          border-radius: 999px;
          text-indent: -9999px;
          overflow: hidden;
        }

        .jt-hero-hotspot:focus-visible {
          outline: 3px solid #ffffff;
          outline-offset: 3px;
        }

        @media (max-width: 820px) {
          .jt-hero {
            aspect-ratio: 16 / 9;
          }

          .jt-hero-image img {
            object-position: 15% center;
          }

          .jt-hero-hotspot {
            left: 5%;
            bottom: 13%;
            width: 38%;
            height: 12%;
          }
        }

        .jt-hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 22px;
        }

        .jt-button {
          display: inline-flex;
          min-height: 46px;
          align-items: center;
          justify-content: center;
          padding: 0 20px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 900;
          text-decoration: none;
          transition:
            transform .18s ease,
            box-shadow .18s ease;
        }

        .jt-button:hover {
          transform: translateY(-1px);
        }

        .jt-button-primary {
          border: 1px solid #2d7a45;
          background: linear-gradient(180deg, #55a84b, #327f42);
          color: #fff;
          box-shadow: 0 8px 18px rgba(36,107,64,.18);
        }

        .jt-values {
          border-bottom: 1px solid #e3e8e1;
          background: #fff;
        }

        .jt-values-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0,1fr));
        }

        .jt-value {
          display: grid;
          grid-template-columns: 52px 1fr;
          gap: 13px;
          align-items: center;
          padding: 21px 24px;
          border-right: 1px solid #e8ece6;
        }

        .jt-value:last-child {
          border-right: 0;
        }

        .jt-value-icon {
          display: grid;
          width: 52px;
          height: 52px;
          place-items: center;
          border: 1px solid #d8e4d6;
          border-radius: 50%;
          background: #f6faf4;
          color: #2d7a49;
          font-size: 23px;
          font-weight: 900;
        }

        .jt-value h3 {
          margin: 0;
          font-size: 15px;
        }

        .jt-value p {
          margin: 3px 0 0;
          color: #6d7971;
          font-size: 11px;
        }

        .jt-section {
          padding: 22px 0;
        }

        #entrepreneurship {
          padding-top: 20px;
        }

        .jt-section-white {
          background: #fff;
        }

        .jt-feature-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0,1fr));
          gap: 20px;
        }

        .jt-feature-card {
          overflow: hidden;
          min-height: 405px;
          border: 1px solid #dce5da;
          border-radius: 18px;
          background: #fff;
          box-shadow: 0 10px 28px rgba(23,61,41,.055);
          transition:
            transform .18s ease,
            box-shadow .18s ease;
        }

        .jt-feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 18px 40px rgba(23,61,41,.09);
        }

        .jt-feature-image {
          position: relative;
          height: 185px;
          overflow: hidden;
          background: #e6eee3;
        }

        .jt-feature-image img {
          object-fit: cover;
          object-position: 50% center;
          transition: transform .35s ease;
        }

        .jt-feature-card:hover .jt-feature-image img {
          transform: scale(1.025);
        }

        .jt-feature-body {
          display: flex;
          min-height: 220px;
          flex-direction: column;
          padding: 22px;
        }

        .jt-feature-eyebrow {
          margin: 0 0 8px;
          color: #287244;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .14em;
          text-transform: uppercase;
        }

        .jt-feature-card h2 {
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 29px;
          line-height: 1.04;
          letter-spacing: -.02em;
        }

        .jt-feature-card p {
          margin: 11px 0 0;
          color: #67746c;
          font-size: 13px;
          line-height: 1.58;
        }

        .jt-feature-card a {
          display: inline-flex;
          margin-top: auto;
          padding-top: 17px;
          color: #23633d;
          font-size: 12px;
          font-weight: 900;
          text-decoration: none;
        }

        .jt-section-head {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 14px;
        }

        .jt-section-eyebrow {
          margin: 0 0 5px;
          color: #287244;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .16em;
          text-transform: uppercase;
        }

        .jt-section-title {
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(34px, 4vw, 52px);
          line-height: 1.02;
          letter-spacing: -.03em;
        }

        .jt-section-copy {
          max-width: 760px;
          margin: 8px 0 0;
          color: #69766e;
          font-size: 15px;
          line-height: 1.6;
        }

        .jt-text-link {
          color: #23633d;
          font-size: 12px;
          font-weight: 900;
          text-decoration: none;
          white-space: nowrap;
        }

        .jt-opportunity {
          display: grid;
          grid-template-columns: 1.05fr 1.35fr .9fr;
          overflow: hidden;
          border: 1px solid #dbe4d9;
          border-radius: 20px;
          background: #fff;
          box-shadow: 0 10px 30px rgba(23,61,41,.05);
        }

        .jt-opportunity-visual {
          position: relative;
          min-height: 320px;
          overflow: hidden;
          background: #eef3eb;
        }

        .jt-opportunity-visual img {
          object-fit: cover;
          object-position: 50% center;
        }

        .jt-opportunity-copy {
          padding: 34px;
        }

        .jt-opportunity-copy h2 {
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 40px;
        }

        .jt-opportunity-copy p {
          margin: 12px 0 0;
          color: #69766e;
          font-size: 14px;
          line-height: 1.62;
        }

        .jt-opportunity-copy .jt-hero-actions {
          flex-wrap: nowrap;
          align-items: center;
          gap: 10px;
        }

        .jt-opportunity-copy .jt-button {
          min-height: 44px;
          padding: 0 16px;
          font-size: 11px;
          white-space: nowrap;
        }

        .jt-checks {
          display: grid;
          align-content: center;
          gap: 12px;
          padding: 30px;
          background: #f5f8f3;
        }

        .jt-check {
          display: grid;
          grid-template-columns: 20px 1fr;
          gap: 9px;
          color: #31533d;
          font-size: 12px;
          line-height: 1.4;
        }

        .jt-check b {
          color: #2c7f48;
        }

        .jt-resource-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0,1fr));
          gap: 17px;
        }

        .jt-resource-card {
          display: flex;
          min-height: 330px;
          overflow: hidden;
          flex-direction: column;
          border: 1px solid #dde5da;
          border-radius: 17px;
          background: #fff;
          color: inherit;
          text-decoration: none;
          box-shadow: 0 8px 22px rgba(23,61,41,.04);
        }

        .jt-resource-image {
          position: relative;
          height: 165px;
          overflow: hidden;
          background: linear-gradient(135deg,#dcebdd,#f4f7f2);
        }

        .jt-resource-image img {
          object-fit: cover;
          object-position: center 28%;
        }

        .jt-resource-body {
          display: flex;
          flex: 1;
          flex-direction: column;
          padding: 17px;
        }

        .jt-resource-type {
          margin: 0;
          color: #287244;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .13em;
          text-transform: uppercase;
        }

        .jt-resource-card h3 {
          margin: 7px 0 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 22px;
          line-height: 1.08;
        }

        .jt-resource-card p {
          display: -webkit-box;
          overflow: hidden;
          margin: 10px 0 0;
          color: #6e7971;
          font-size: 12px;
          line-height: 1.5;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }

        .jt-resource-meta {
          margin-top: auto;
          padding-top: 15px;
          color: #819087;
          font-size: 10px;
          font-weight: 800;
        }

        .jt-bottom-band {
          padding: 52px 0;
          background: linear-gradient(135deg,#e7efe4,#f5f8f3);
        }

        .jt-bottom-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 30px;
        }

        .jt-bottom-band h2 {
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 42px;
        }

        .jt-bottom-band p {
          margin: 8px 0 0;
          color: #67746b;
          font-size: 14px;
        }

        .jt-signoff {
          color: #486150;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 18px;
          font-style: italic;
          line-height: 1.5;
          text-align: right;
        }

        @media (max-width: 1050px) {
          .jt-values-grid,
          .jt-resource-grid {
            grid-template-columns: repeat(2, minmax(0,1fr));
          }

          .jt-opportunity {
            grid-template-columns: 1fr;
          }

          .jt-opportunity-visual {
            min-height: 220px;
          }

          .jt-opportunity-copy .jt-hero-actions {
            flex-wrap: wrap;
          }
        }

        @media (max-width: 820px) {
          .jt-feature-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 560px) {
          .jt-shell {
            width: min(100% - 24px, 1500px);
          }

          .jt-values-grid,
          .jt-resource-grid {
            grid-template-columns: 1fr;
          }

          .jt-value {
            border-right: 0;
            border-bottom: 1px solid #e8ece6;
          }
/* Compact mobile value rows */
.jt-value {
  grid-template-columns: 44px 1fr;
  gap: 11px;
  padding: 16px 12px;
}

.jt-value-icon {
  width: 44px;
  height: 44px;
  font-size: 19px;
}

.jt-value h3 {
  font-size: 14px;
}

.jt-value p {
  margin-top: 2px;
  font-size: 10px;
}
  .jt-feature-image {
  height: 150px;
}

.jt-feature-body {
  padding: 20px 26px 24px;
}

.jt-feature-card h2 {
  font-size: 21px;
}
          .jt-section-head,
          .jt-bottom-inner {
            align-items: flex-start;
            flex-direction: column;
          }

          .jt-signoff {
            text-align: left;
          }
        }
      `}</style>

      <section className="jt-hero" aria-label="Join Our Team">
        <div className="jt-hero-image">
          <Image
            src="/images/join-team/wl-join-team-hero-v2-approved.png"
            alt="Join Our Team — Information. Support. Freedom to Decide."
            fill
            priority
            sizes="100vw"
          />
        </div>

        <Link
          href="#opportunity"
          className="jt-hero-hotspot"
          aria-label="Explore the Opportunity"
        >
          Explore the Opportunity
        </Link>
      </section>

      <section className="jt-values">
        <div className="jt-shell jt-values-grid">
          {values.map(([title, text, icon]) => (
            <div className="jt-value" key={title}>
              <div className="jt-value-icon">{icon}</div>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="jt-section jt-section-white" id="entrepreneurship">
        <div className="jt-shell">
          <div className="jt-feature-grid">
            {featureCards.map((item) => (
              <article className="jt-feature-card" key={item.title}>
                <div className="jt-feature-image">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 820px) 100vw, 33vw"
                  />
                </div>

                <div className="jt-feature-body">
                  <p className="jt-feature-eyebrow">{item.eyebrow}</p>
                  <h2>{item.title}</h2>
                  <p>{item.text}</p>
                  <Link href={item.href}>{item.cta} →</Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="jt-section" id="philosophy">
        <div className="jt-shell">
          <p className="jt-section-eyebrow">Our Philosophy</p>
          <h2 className="jt-section-title">
            A different way to think about work.
          </h2>
          <p className="jt-section-copy">
            People should have the opportunity to do something they enjoy —
            and, more importantly, enjoy what they do. Good decisions begin
            with good information, honest expectations, and room to think.
          </p>
        </div>
      </section>

      <section className="jt-section jt-section-white" id="opportunity">
        <div className="jt-shell">
          <div className="jt-opportunity">
            <div className="jt-opportunity-visual">
              <Image
                src="/images/join-team/usana-opportunity-products.png"
                alt="USANA wellness products"
                fill
                sizes="(max-width: 1050px) 100vw, 33vw"
              />
            </div>

            <div className="jt-opportunity-copy">
              <p className="jt-section-eyebrow">WonderfulLife × USANA</p>
              <h2>Explore the Opportunity</h2>
              <p>
                USANA offers science-based wellness products and a global
                business opportunity. Learn what being a Brand Partner
                actually involves, how the business works, what support is
                available, and whether it fits your goals.
              </p>

              <div className="jt-hero-actions">
                <Link
                  href="/join-our-team/resources"
                  className="jt-button jt-button-primary"
                >
                  Learn About the Opportunity →
                </Link>

                <Link
                  href="/shop"
                  className="jt-button"
                  style={{
                    border: "1px solid #d4dfd2",
                    background: "#fff",
                    color: "#23633d",
                  }}
                >
                  View Wellness Products
                </Link>
              </div>
            </div>

            <div className="jt-checks">
              {[
                "Trusted wellness products",
                "Global company with decades of experience",
                "Flexible, home-based business model",
                "Training and support resources",
                "Opportunity to build something of your own",
              ].map((item) => (
                <div className="jt-check" key={item}>
                  <b>✓</b>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="jt-section" id="learn">
        <div className="jt-shell">
          <div className="jt-section-head">
            <div>
              <p className="jt-section-eyebrow">Learn Before You Decide</p>
              <h2 className="jt-section-title">Information first.</h2>
              <p className="jt-section-copy">
                Articles, videos, guides, stories, and practical resources
                designed to help you understand entrepreneurship before making
                any commitment.
              </p>
            </div>

            <Link href="/join-our-team/resources" className="jt-text-link">
              View All Content →
            </Link>
          </div>

          <div className="jt-resource-grid">
            {resources.length > 0 ? (
              resources.map((item) => (
                <Link
                  href={getResourceHref(item)}
                  className="jt-resource-card"
                  key={item.id}
                >
                  <div className="jt-resource-image">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.title}
                        fill
                        sizes="(max-width: 1050px) 50vw, 25vw"
                      />
                    ) : null}
                  </div>

                  <div className="jt-resource-body">
                    <p className="jt-resource-type">
                      {getResourceLabel(item)}
                    </p>

                    <h3>{item.title}</h3>

                    <p>
                      {item.summary ||
                        item.excerpt ||
                        "Explore this WonderfulLife Join Our Team resource."}
                    </p>

                    <div className="jt-resource-meta">
                      {item.type === "video"
                        ? "Watch video"
                        : `${item.reading_minutes || 5} min read`}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <article className="jt-resource-card">
                <div className="jt-resource-image" />
                <div className="jt-resource-body">
                  <p className="jt-resource-type">Resources</p>
                  <h3>More resources are coming soon.</h3>
                </div>
              </article>
            )}
          </div>
        </div>
      </section>

      <section className="jt-bottom-band">
        <div className="jt-shell jt-bottom-inner">
          <div>
            <h2>Interested in learning more?</h2>
            <p>No pressure. No obligation. Take the time you need.</p>

            <div className="jt-hero-actions">
              <Link
                href="/join-our-team/resources"
                className="jt-button jt-button-primary"
              >
                Explore the Opportunity →
              </Link>

              <Link
                href="/ask-zoey"
                className="jt-button"
                style={{
                  border: "1px solid #d5e0d4",
                  background: "#fff",
                  color: "#23633d",
                }}
              >
                Ask a Question
              </Link>
            </div>
          </div>

          <div className="jt-signoff">
            Your journey.<br />
            Your decision.<br />
            I&apos;m here to help.
            <br /><br />
            — Zoey
          </div>
        </div>
      </section>
    </main>
  );
}