import Link from "next/link";

export type UniversalContentType =
  | "article"
  | "recipe"
  | "video"
  | "product";

type UniversalContentCardProps = {
  type: UniversalContentType;
  title: string;
  href: string;
  excerpt?: string | null;
  category?: string | null;
  imageUrl?: string | null;
  featured?: boolean;
  secondaryHref?: string | null;
  secondaryLabel?: string;
};

const typeSettings: Record<
  UniversalContentType,
  {
    primaryLabel: string;
    fallbackIcon: string;
    badgeLabel: string;
  }
> = {
  article: {
    primaryLabel: "Read Article",
    fallbackIcon: "📖",
    badgeLabel: "Article",
  },
  recipe: {
    primaryLabel: "View Recipe",
    fallbackIcon: "🍽️",
    badgeLabel: "Recipe",
  },
  video: {
    primaryLabel: "Watch Video",
    fallbackIcon: "▶",
    badgeLabel: "Video",
  },
  product: {
    primaryLabel: "View Product",
    fallbackIcon: "🌿",
    badgeLabel: "Product",
  },
};

export default function UniversalContentCard({
  type,
  title,
  href,
  excerpt,
  category,
  imageUrl,
  featured = false,
  secondaryHref,
  secondaryLabel = "Watch Product Video",
}: UniversalContentCardProps) {
  const settings = typeSettings[type];

  return (
    <article className="universal-content-card">
      <style>{`
        .universal-content-card {
          display: flex;
          min-width: 0;
          overflow: hidden;
          flex-direction: column;
          border: 1px solid #dfe6dd;
          border-radius: 18px;
          background: #ffffff;
          box-shadow: 0 12px 30px rgba(23, 61, 41, 0.07);
          transition:
            transform 180ms ease,
            box-shadow 180ms ease;
        }

        .universal-content-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 18px 40px rgba(23, 61, 41, 0.12);
        }

        .universal-card-image-link {
          position: relative;
          display: block;
          overflow: hidden;
          background: #eef3ec;
          text-decoration: none;
        }

        .universal-card-image {
          display: block;
          width: 100%;
          aspect-ratio: 16 / 10;
          object-fit: cover;
          transition: transform 180ms ease;
        }

        .universal-content-card:hover .universal-card-image {
          transform: scale(1.025);
        }

        .universal-card-placeholder {
          display: grid;
          width: 100%;
          aspect-ratio: 16 / 10;
          place-items: center;
          background: linear-gradient(135deg, #e4eee7, #f3f7f4);
          color: #23633d;
          font-size: 50px;
        }

        .universal-card-featured {
          position: absolute;
          top: 12px;
          left: 12px;
          padding: 6px 10px;
          border-radius: 999px;
          background: #ffffff;
          color: #23633d;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          box-shadow: 0 5px 15px rgba(23, 61, 41, 0.1);
        }

        .universal-card-body {
          display: flex;
          flex: 1;
          flex-direction: column;
          padding: 18px;
        }

        .universal-card-category {
          margin: 0;
          color: #23633d;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.11em;
          text-transform: uppercase;
        }

        .universal-card-title {
          margin: 8px 0 0;
          color: #173d29;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 22px;
          line-height: 1.25;
        }

        .universal-card-excerpt {
          display: -webkit-box;
          overflow: hidden;
          margin: 10px 0 0;
          color: #65746a;
          font-size: 14px;
          line-height: 1.6;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 3;
        }

        .universal-card-actions {
          display: grid;
          gap: 9px;
          margin-top: auto;
          padding-top: 18px;
        }

        .universal-card-primary {
          display: inline-flex;
          width: 100%;
          box-sizing: border-box;
          align-items: center;
          justify-content: center;
          padding: 12px 16px;
          border-radius: 10px;
          background: #23633d;
          color: #ffffff;
          font-size: 13px;
          font-weight: 900;
          text-decoration: none;
        }

        .universal-card-secondary {
          display: inline-flex;
          width: 100%;
          box-sizing: border-box;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 11px 16px;
          border-radius: 10px;
          background: #2563eb;
          color: #ffffff;
          font-size: 13px;
          font-weight: 900;
          text-decoration: none;
        }
      `}</style>

      <Link
        href={href}
        aria-label={`${settings.primaryLabel}: ${title}`}
        className="universal-card-image-link"
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="universal-card-image"
          />
        ) : (
          <div className="universal-card-placeholder">
            {settings.fallbackIcon}
          </div>
        )}

        {featured ? (
          <span className="universal-card-featured">Featured</span>
        ) : null}
      </Link>

      <div className="universal-card-body">
        <p className="universal-card-category">
          {category || `WonderfulLife ${settings.badgeLabel}`}
        </p>

        <h2 className="universal-card-title">{title}</h2>

        <p className="universal-card-excerpt">
          {excerpt ||
            `Discover this WonderfulLife ${settings.badgeLabel.toLowerCase()}.`}
        </p>

        <div className="universal-card-actions">
          <Link href={href} className="universal-card-primary">
            {settings.primaryLabel}
          </Link>

          {secondaryHref ? (
            <a
              href={secondaryHref}
              target="_blank"
              rel="noopener noreferrer"
              className="universal-card-secondary"
            >
              <span aria-hidden="true">▶</span>
              {secondaryLabel}
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}