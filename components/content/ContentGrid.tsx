import Link from "next/link";

export type ContentGridItem = {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  image_url?: string | null;
  primary_section?: string | null;
  category?: string | null;
  topic?: string | null;
  reading_minutes?: number | null;
  published_at?: string | null;
};

type ContentGridProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  items: ContentGridItem[];
  maxItems?: number;
  viewAllHref?: string;
  viewAllLabel?: string;
};

function pretty(value?: string | null) {
  return String(value || "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value?: string | null) {
  if (!value) return "";

  return new Date(value).toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ContentGrid({
  eyebrow = "WonderfulLife",
  title,
  description,
  items,
  maxItems = 6,
  viewAllHref,
  viewAllLabel = "View All",
}: ContentGridProps) {
  const visibleItems = items.slice(0, maxItems);

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <section className="content-grid-section">
      <style>{`
        .content-grid-section {
          width: min(100% - 48px, 1320px);
          margin: 76px auto 0;
        }

        .content-grid-header {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 28px;
          margin-bottom: 26px;
        }

        .content-grid-eyebrow {
          margin: 0 0 7px;
          color: #287244;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .17em;
          text-transform: uppercase;
        }

        .content-grid-title {
          margin: 0;
          color: #173d29;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(32px, 4vw, 46px);
          line-height: 1.05;
          letter-spacing: -.025em;
        }

        .content-grid-description {
          max-width: 650px;
          margin: 9px 0 0;
          color: #748178;
          font-size: 14px;
          line-height: 1.65;
        }

        .content-grid-view-all {
          color: #23633d;
          font-size: 12px;
          font-weight: 900;
          text-decoration: none;
          white-space: nowrap;
        }

        .content-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 22px;
        }

        .content-card {
          display: flex;
          min-width: 0;
          overflow: hidden;
          flex-direction: column;
          border: 1px solid #dce5dc;
          border-radius: 20px;
          background: #ffffff;
          color: inherit;
          text-decoration: none;
          box-shadow:
            0 8px 26px rgba(27, 67, 41, .06);
          transition:
            transform .18s ease,
            box-shadow .18s ease,
            border-color .18s ease;
        }

        .content-card:hover {
          transform: translateY(-5px);
          border-color: #b7cdb9;
          box-shadow:
            0 18px 38px rgba(27, 67, 41, .11);
        }

        .content-card-image-wrap {
          position: relative;
          overflow: hidden;
          aspect-ratio: 16 / 10;
          background:
            linear-gradient(
              135deg,
              #e9f1e7,
              #f7faf6
            );
        }

        .content-card-image {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform .3s ease;
        }

        .content-card:hover .content-card-image {
          transform: scale(1.035);
        }

        .content-card-placeholder {
          display: grid;
          width: 100%;
          height: 100%;
          place-items: center;
          color: #38724d;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 22px;
          font-weight: 700;
        }

        .content-card-topic {
          position: absolute;
          bottom: 12px;
          left: 12px;
          padding: 6px 10px;
          border-radius: 999px;
          background: rgba(255, 255, 255, .94);
          color: #23633d;
          font-size: 9px;
          font-weight: 900;
          box-shadow:
            0 4px 12px rgba(0, 0, 0, .08);
        }

        .content-card-body {
          display: flex;
          flex: 1;
          flex-direction: column;
          padding: 21px;
        }

        .content-card-section {
          margin: 0 0 7px;
          color: #2b7748;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .13em;
          text-transform: uppercase;
        }

        .content-card-title {
          margin: 0;
          color: #173d29;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 22px;
          line-height: 1.25;
        }

        .content-card-excerpt {
          display: -webkit-box;
          overflow: hidden;
          margin: 11px 0 0;
          color: #748178;
          font-size: 13px;
          line-height: 1.6;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 3;
        }

        .content-card-meta {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 15px;
          color: #919b94;
          font-size: 10px;
          font-weight: 700;
        }

        .content-card-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: auto;
          padding-top: 19px;
          color: #23633d;
          font-size: 11px;
          font-weight: 900;
        }

        @media (max-width: 950px) {
          .content-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 650px) {
          .content-grid-section {
            width: min(100% - 24px, 1320px);
            margin-top: 54px;
          }

          .content-grid-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .content-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="content-grid-header">
        <div>
          <p className="content-grid-eyebrow">
            {eyebrow}
          </p>

          <h2 className="content-grid-title">
            {title}
          </h2>

          {description ? (
            <p className="content-grid-description">
              {description}
            </p>
          ) : null}
        </div>

        {viewAllHref ? (
          <Link
            href={viewAllHref}
            className="content-grid-view-all"
          >
            {viewAllLabel} →
          </Link>
        ) : null}
      </div>

      <div className="content-grid">
        {visibleItems.map((item) => (
          <Link
            key={item.id}
            href={`/articles/${item.slug}`}
            className="content-card"
          >
            <div className="content-card-image-wrap">
              {item.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="content-card-image"
                />
              ) : (
                <div className="content-card-placeholder">
                  WonderfulLife
                </div>
              )}

              {item.topic ? (
                <span className="content-card-topic">
                  {pretty(item.topic)}
                </span>
              ) : null}
            </div>

            <div className="content-card-body">
              <p className="content-card-section">
                {item.primary_section ||
                  item.category ||
                  "Wellness"}
              </p>

              <h3 className="content-card-title">
                {item.title}
              </h3>

              {item.excerpt ? (
                <p className="content-card-excerpt">
                  {item.excerpt}
                </p>
              ) : null}

              <div className="content-card-meta">
                {item.published_at ? (
                  <span>
                    {formatDate(item.published_at)}
                  </span>
                ) : null}

                {item.reading_minutes ? (
                  <span>
                    {item.reading_minutes} min read
                  </span>
                ) : null}
              </div>

              <div className="content-card-link">
                <span>Read Article</span>
                <span>→</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}