import Link from "next/link";

export type ContentItem = {
  id: number;
  type: string;
  title: string;
  slug: string;
  excerpt?: string;
  category?: string;
  image_url?: string;
  reading_minutes?: number;
};

function getContentHref(item: ContentItem) {
  const type = (item.type || "")
    .toLowerCase()
    .trim();

  switch (type) {
    case "recipe":
    case "recipes":
      return `/recipes/${item.slug}`;

    case "article":
    case "articles":
      return `/articles/${item.slug}`;

    case "video":
    case "videos":
      return `/videos/${item.slug}`;

    case "product":
    case "products":
      return `/shop/${item.slug}`;

    default:
      return `/content/${item.slug}`;
  }
}

function getContentLabel(type: string) {
  const normalized = (type || "")
    .toLowerCase()
    .trim();

  switch (normalized) {
    case "recipe":
    case "recipes":
      return "Recipe";

    case "article":
    case "articles":
      return "Article";

    case "video":
    case "videos":
      return "Video";

    case "product":
    case "products":
      return "Product";

    default:
      return type || "Content";
  }
}

function getActionLabel(type: string) {
  const normalized = (type || "")
    .toLowerCase()
    .trim();

  switch (normalized) {
    case "recipe":
    case "recipes":
      return "View Recipe";

    case "video":
    case "videos":
      return "Watch Video";

    case "product":
    case "products":
      return "View Product";

    default:
      return "Read Article";
  }
}

export default function ContentCard({
  item,
}: {
  item: ContentItem;
}) {
  const href = getContentHref(item);
  const label = getContentLabel(item.type);
  const actionLabel = getActionLabel(
    item.type
  );

  const normalizedType = (
    item.type || ""
  )
    .toLowerCase()
    .trim();

  const showReadingTime =
    normalizedType !== "product" &&
    normalizedType !== "products" &&
    normalizedType !== "video" &&
    normalizedType !== "videos";

  return (
    <Link
      href={href}
      className="wl-saved-card"
    >
      <style>{`
        .wl-saved-card {
          display: flex;
          min-width: 0;
          overflow: hidden;
          flex-direction: column;
          border: 1px solid #dce6dc;
          border-radius: 20px;
          background: #ffffff;
          color: #173d29;
          text-decoration: none;
          box-shadow:
            0 12px 30px
            rgba(20, 61, 41, 0.06);
          transition:
            transform 170ms ease,
            box-shadow 170ms ease,
            border-color 170ms ease;
        }

        .wl-saved-card:hover {
          transform: translateY(-3px);
          border-color: #bfd2c2;
          box-shadow:
            0 18px 40px
            rgba(20, 61, 41, 0.10);
        }

        .wl-saved-card-image-wrap {
          position: relative;
          width: 100%;
          overflow: hidden;
          aspect-ratio: 16 / 9;
          background: #edf4eb;
        }

        .wl-saved-card-image {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition:
            transform 220ms ease;
        }

        .wl-saved-card:hover
        .wl-saved-card-image {
          transform: scale(1.025);
        }

        .wl-saved-card-placeholder {
          display: grid;
          width: 100%;
          height: 100%;
          place-items: center;
          background:
            linear-gradient(
              135deg,
              #e5f0e2,
              #f4f8f2
            );
          font-size: 38px;
        }

        .wl-saved-card-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          z-index: 2;
          display: inline-flex;
          min-height: 28px;
          align-items: center;
          padding: 0 10px;
          border-radius: 999px;
          background:
            rgba(255, 255, 255, 0.94);
          color: #237343;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.10em;
          text-transform: uppercase;
          box-shadow:
            0 5px 15px
            rgba(20,61,41,.08);
        }

        .wl-saved-card-body {
          display: flex;
          flex: 1;
          flex-direction: column;
          padding: 17px 18px 18px;
        }

        .wl-saved-card-category {
          margin: 0;
          color: #6d7b72;
          font-size: 9.5px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .wl-saved-card-title {
          display: -webkit-box;
          overflow: hidden;
          margin: 7px 0 0;
          color: #173d29;
          font-family:
            Georgia,
            "Times New Roman",
            serif;
          font-size: 20px;
          font-weight: 700;
          line-height: 1.16;
          letter-spacing: -0.015em;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }

        .wl-saved-card-excerpt {
          display: -webkit-box;
          overflow: hidden;
          margin: 9px 0 0;
          color: #68776e;
          font-size: 12.5px;
          line-height: 1.46;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 3;
        }

        .wl-saved-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: auto;
          padding-top: 14px;
        }

        .wl-saved-card-time {
          color: #89938c;
          font-size: 10px;
          font-weight: 700;
        }

        .wl-saved-card-action {
          margin-left: auto;
          color: #237343;
          font-size: 11px;
          font-weight: 900;
        }

        @media (max-width: 650px) {
          .wl-saved-card-title {
            font-size: 19px;
          }

          .wl-saved-card-body {
            padding: 16px;
          }
        }
      `}</style>

      <div className="wl-saved-card-image-wrap">
        {item.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image_url}
            alt={item.title}
            className="wl-saved-card-image"
          />
        ) : (
          <div className="wl-saved-card-placeholder">
            🌿
          </div>
        )}

        <span className="wl-saved-card-badge">
          {label}
        </span>
      </div>

      <div className="wl-saved-card-body">
        {item.category ? (
          <p className="wl-saved-card-category">
            {item.category}
          </p>
        ) : null}

        <h3 className="wl-saved-card-title">
          {item.title}
        </h3>

        {item.excerpt ? (
          <p className="wl-saved-card-excerpt">
            {item.excerpt}
          </p>
        ) : null}

        <div className="wl-saved-card-footer">
          {showReadingTime ? (
            <span className="wl-saved-card-time">
              {item.reading_minutes || 5} min read
            </span>
          ) : (
            <span />
          )}

          <span className="wl-saved-card-action">
            {actionLabel} →
          </span>
        </div>
      </div>
    </Link>
  );
}