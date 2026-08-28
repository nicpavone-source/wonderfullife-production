import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "../../../lib/supabase/server";
import ProductBody from "./ProductBody";
import PrintButton from "@/components/content/PrintButton";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type Product = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string | null;
  category: string | null;
  image_url: string | null;
  video_url: string | null;
  buy_url: string | null;
  featured: boolean | null;
  status: string | null;
};

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { slug } = await params;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("content_items")
    .select(
      `
        id,
        title,
        slug,
        excerpt,
        body,
        category,
        image_url,
        video_url,
        buy_url,
        featured,
        status
      `
    )
    .eq("type", "product")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !data) {
    notFound();
  }

  const product = data as Product;

  return (
    <main className="product-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .product-page {
          min-height: 100vh;
          background: #f7f9f6;
          color: #173d29;
        }

        .product-shell {
          width: min(100% - 48px, 1220px);
          margin: 0 auto;
          padding: 28px 0 58px;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 18px;
          color: #23633d;
          font-size: 13px;
          font-weight: 900;
          text-decoration: none;
        }

        .product-grid {
          display: grid;
          grid-template-columns:
            minmax(330px, 0.82fr)
            minmax(0, 1.18fr);
          gap: 38px;
          align-items: start;
        }

        /* PRODUCT IMAGE */

        .product-image-column {
          display: flex;
          justify-content: center;
        }

        .product-image-card {
          width: 88%;
          max-width: 500px;
          overflow: hidden;
          border: 1px solid #dfe6dd;
          border-radius: 20px;
          background: #ffffff;
          box-shadow:
            0 12px 30px
            rgba(23, 61, 41, 0.07);
        }

        .product-image {
          display: block;
          width: 100%;
          aspect-ratio: 1 / 1;
          object-fit: cover;
          background: #eef3ec;
        }

        .product-image-placeholder {
          display: grid;
          aspect-ratio: 1 / 1;
          place-items: center;
          background: #eef3ec;
          font-size: 64px;
        }

        /* PRODUCT INFORMATION */

        .product-info {
          min-width: 0;
          padding-top: 4px;
        }

        .product-category {
          margin: 0 0 8px;
          color: #23633d;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.13em;
          text-transform: uppercase;
        }

        .product-title {
          margin: 0;
          max-width: 720px;
          color: #173d29;
          font-family:
            Georgia,
            "Times New Roman",
            serif;
          font-size: clamp(32px, 4vw, 46px);
          line-height: 1.06;
          letter-spacing: -0.03em;
        }

        .featured-badge {
          display: inline-flex;
          margin-top: 12px;
          padding: 5px 9px;
          border-radius: 999px;
          background: #eaf2e8;
          color: #23633d;
          font-size: 9px;
          font-weight: 900;
        }

        .product-excerpt {
          margin: 16px 0 0;
          max-width: 720px;
          color: #5f7065;
          font-size: 15px;
          line-height: 1.6;
        }

        .product-print-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 16px;
        }

        /* PURCHASE CARD */

        .purchase-card {
          margin-top: 20px;
          padding: 18px;
          border: 1px solid #d8e4d8;
          border-radius: 16px;
          background:
            linear-gradient(
              180deg,
              #ffffff 0%,
              #f7faf6 100%
            );
        }

        .purchase-label {
          margin: 0;
          color: #287244;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .purchase-title {
          margin: 5px 0 0;
          color: #173d29;
          font-family:
            Georgia,
            "Times New Roman",
            serif;
          font-size: 22px;
          line-height: 1.15;
        }

        .purchase-actions {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 9px;
          margin-top: 14px;
        }

        .buy-button,
        .secondary-button,
        .video-button,
        .zoey-button {
          display: inline-flex;
          min-height: 44px;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: 9px;
          font-size: 12px;
          font-weight: 900;
          text-decoration: none;
          text-align: center;
          transition:
            transform 0.15s ease,
            box-shadow 0.15s ease,
            background 0.15s ease;
        }

        .buy-button {
          grid-column: 1 / -1;
          min-height: 48px;
          background: #23633d;
          color: #ffffff;
          box-shadow:
            0 8px 18px
            rgba(35, 99, 61, 0.18);
        }

        .buy-button:hover {
          transform: translateY(-1px);
          background: #1b5232;
          box-shadow:
            0 10px 22px
            rgba(35, 99, 61, 0.22);
        }

        .secondary-button {
          border: 1px solid #d8e2d8;
          background: #ffffff;
          color: #23633d;
        }

        .video-button {
          border: 1px solid #d8e2d8;
          background: #ffffff;
          color: #2559a7;
        }

        .zoey-button {
          border: 1px solid #ded7ef;
          background: #ffffff;
          color: #6b4bb3;
        }

        .secondary-button:hover,
        .video-button:hover,
        .zoey-button:hover {
          transform: translateY(-1px);
          box-shadow:
            0 5px 14px
            rgba(23, 61, 41, 0.08);
        }

        .purchase-unavailable {
          grid-column: 1 / -1;
          margin: 4px 0;
          color: #7c877f;
          font-size: 12px;
          line-height: 1.5;
        }

        /* TRUST MESSAGE */

        .trust-row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 13px;
          color: #718077;
          font-size: 10px;
          font-weight: 800;
        }

        .trust-item {
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }

        /* PRODUCT DETAILS */

        .details-card {
          margin-top: 24px;
          padding: 26px 28px;
          border: 1px solid #dfe6dd;
          border-radius: 18px;
          background: #ffffff;
          box-shadow:
            0 8px 24px
            rgba(23, 61, 41, 0.035);
        }

        .details-eyebrow {
          margin: 0 0 5px;
          color: #287244;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .details-title {
          margin: 0 0 14px;
          color: #173d29;
          font-family:
            Georgia,
            "Times New Roman",
            serif;
          font-size: 26px;
        }

        @media print {
          @page {
            size: auto;
            margin: 0.72in 0.68in 0.78in;
          }

          html,
          body {
            width: auto !important;
            min-width: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: economy;
            print-color-adjust: economy;
          }

          /* Hide the WonderfulLife site chrome.
             The product page itself does not use semantic <header>/<nav>/<footer>
             elements, so this is safe for this print view. */
          header,
          nav,
          footer {
            display: none !important;
          }

          .product-page {
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            background: #ffffff !important;
            color: #000000 !important;
          }

          .product-shell {
            width: auto !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .back-link,
          .product-image-column,
          .product-print-row,
          .purchase-card {
            display: none !important;
          }

          .product-grid {
            display: block !important;
            margin: 0 !important;
          }

          .product-info {
            margin: 0 !important;
            padding: 0 0 12pt !important;
          }

          .product-category {
            margin: 0 0 4pt !important;
            color: #333333 !important;
            font-size: 8pt !important;
            line-height: 1.2 !important;
          }

          .product-title {
            max-width: none !important;
            margin: 0 !important;
            color: #000000 !important;
            font-size: 23pt !important;
            line-height: 1.08 !important;
            letter-spacing: -0.01em !important;
            break-after: avoid-page;
            page-break-after: avoid;
          }

          .featured-badge {
            margin: 5pt 0 0 !important;
            padding: 0 !important;
            border: 0 !important;
            border-radius: 0 !important;
            background: transparent !important;
            color: #444444 !important;
            font-size: 8pt !important;
          }

          .product-excerpt {
            max-width: none !important;
            margin: 7pt 0 0 !important;
            color: #333333 !important;
            font-size: 9.6pt !important;
            line-height: 1.38 !important;
            orphans: 3;
            widows: 3;
          }

          .details-card {
            margin: 0 !important;
            padding: 0 !important;
            border: 0 !important;
            border-radius: 0 !important;
            background: #ffffff !important;
            box-shadow: none !important;
          }

          .details-eyebrow {
            margin: 0 0 3pt !important;
            color: #444444 !important;
            font-size: 7.8pt !important;
          }

          .details-title {
            margin: 0 0 8pt !important;
            color: #000000 !important;
            font-size: 16pt !important;
            line-height: 1.16 !important;
            break-after: avoid-page;
            page-break-after: avoid;
          }

          .product-body {
            color: #111111 !important;
            font-size: 9.4pt !important;
            line-height: 1.42 !important;
          }

          .product-body-spacer {
            height: 5pt !important;
          }

          .product-body-divider {
            margin: 10pt 0 !important;
            border: 0 !important;
            border-top: 0.75pt solid #bdbdbd !important;
          }

          .product-body h2,
          .product-body h3 {
            color: #000000 !important;
            break-after: avoid-page;
            page-break-after: avoid;
          }

          .product-body-h2 {
            margin: 12pt 0 5pt !important;
            font-size: 14pt !important;
            line-height: 1.18 !important;
          }

          .product-body-h3 {
            margin: 10pt 0 4pt !important;
            font-size: 11.5pt !important;
            line-height: 1.2 !important;
          }

          .product-body-paragraph {
            margin: 0 0 6pt !important;
            orphans: 3;
            widows: 3;
          }

          .product-body-bullet {
            display: grid !important;
            grid-template-columns: 14pt minmax(0, 1fr) !important;
            gap: 5pt !important;
            margin: 2.5pt 0 !important;
            padding: 0 !important;
            border: 0 !important;
            border-radius: 0 !important;
            background: transparent !important;
            break-inside: avoid-page;
            page-break-inside: avoid;
          }

          .product-body-bullet-check {
            color: #000000 !important;
            font-size: 9pt !important;
            font-weight: 700 !important;
          }

          .product-body strong {
            color: #000000 !important;
          }

          .product-body a {
            color: #000000 !important;
            text-decoration: none !important;
          }
        }

        /* RESPONSIVE */

        @media (max-width: 900px) {
          .product-grid {
            grid-template-columns: 1fr;
            gap: 28px;
          }

          .product-image-column {
            justify-content: flex-start;
          }

          .product-image-card {
            width: 100%;
            max-width: 560px;
          }
        }

        @media (max-width: 650px) {
          .product-shell {
            width: min(100% - 24px, 1220px);
            padding-top: 22px;
          }

          .purchase-actions {
            grid-template-columns: 1fr;
          }

          .buy-button,
          .purchase-unavailable {
            grid-column: auto;
          }

          .product-title {
            font-size: 34px;
          }

          .details-card {
            margin-top: 20px;
            padding: 20px;
          }
        }
      `}</style>

      <section className="product-shell">
        <Link href="/shop" className="back-link">
          ← Back to Shop
        </Link>

        <div className="product-grid">

          {/* PRODUCT IMAGE */}

          <div className="product-image-column">
            <div className="product-image-card">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.title}
                  className="product-image"
                />
              ) : (
                <div className="product-image-placeholder">
                  🌱
                </div>
              )}
            </div>
          </div>

          {/* PRODUCT INFORMATION */}

          <div className="product-info">

            <p className="product-category">
              {product.category ||
                "WonderfulLife Product"}
            </p>

            <h1 className="product-title">
              {product.title}
            </h1>

            {product.featured ? (
              <span className="featured-badge">
                Featured Product
              </span>
            ) : null}

            {product.excerpt ? (
              <p className="product-excerpt">
                {product.excerpt}
              </p>
            ) : null}

            <div className="product-print-row">
              <PrintButton label="Print Product Details" />
            </div>

            {/* PURCHASE AREA */}

            <div className="purchase-card">

              <p className="purchase-label">
                WonderfulLife Shop
              </p>

              <h2 className="purchase-title">
                Interested in this product?
              </h2>

              <div className="purchase-actions">

                {product.buy_url ? (
                  <a
                    href={product.buy_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="buy-button"
                  >
                    <span aria-hidden="true">
                      🛒
                    </span>

                    Shop This Product
                  </a>
                ) : (
                  <p className="purchase-unavailable">
                    A direct purchase link is not
                    available for this product yet.
                    Explore the product information
                    below or ask Zoey about this
                    product.
                  </p>
                )}

                <a
                  href="#product-details"
                  className="secondary-button"
                >
                  Product Details
                </a>

                {product.video_url ? (
                  <a
                    href={product.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="video-button"
                  >
                    ▶ Watch Product Video
                  </a>
                ) : null}

                <Link
                  href={`/ask-zoey?product=${encodeURIComponent(
                    product.title
                  )}`}
                  className="zoey-button"
                >
                  Ask Zoey About This Product
                </Link>

              </div>

              {product.buy_url ? (
                <div className="trust-row">

                  <span className="trust-item">
                    ✓ Official USANA Store
                  </span>

                  <span className="trust-item">
                    ✓ Secure Checkout
                  </span>

                  <span className="trust-item">
                    ✓ Ships Direct from USANA
                  </span>

                </div>
              ) : null}

            </div>
          </div>
        </div>

        {/* PRODUCT DETAILS */}

        <section
          id="product-details"
          className="details-card"
        >
          <p className="details-eyebrow">
            Product Information
          </p>

          <h2 className="details-title">
            Product Details
          </h2>

          <ProductBody
            body={
              product.body ||
              "More product details are coming soon."
            }
          />

        </section>
      </section>
    </main>
  );
}