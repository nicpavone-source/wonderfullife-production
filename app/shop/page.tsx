import Image from "next/image";
import Link from "next/link";

import { createClient } from "../../lib/supabase/server";
import UniversalContentCard from "../../components/content/UniversalContentCard";

type Product = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string | null;
  image_url: string | null;
  video_url: string | null;
  featured: boolean | null;
  status: string | null;
  created_at: string;
  updated_at: string | null;
};

type ShopPageProps = {
  searchParams: Promise<{
    category?: string;
  }>;
};

const productCategories = [
  "Nutrition",
  "Supplements",
  "Skincare",
  "Fitness",
  "Wellness",
  "Lifestyle",
] as const;

function normalizeCategory(value?: string | null) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

export default async function ShopPage({
  searchParams,
}: ShopPageProps) {
  const params = await searchParams;

  const selectedCategory =
    params.category?.trim() || "";

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("content_items")
    .select(
      `
        id,
        title,
        slug,
        excerpt,
        category,
        image_url,
        video_url,
        featured,
        status,
        created_at,
        updated_at
      `
    )
    .eq("type", "product")
    .eq("status", "published")
    .order("featured", { ascending: false })
    .order("updated_at", { ascending: false });

  const products = (data || []) as Product[];

  const filteredProducts =
    selectedCategory
      ? products.filter(
          (product) =>
            normalizeCategory(
              product.category
            ) ===
            normalizeCategory(
              selectedCategory
            )
        )
      : products;

  return (
    <main className="shop-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .shop-page {
          min-height: 100vh;
          overflow: hidden;
          background: #f7f8f4;
          color: #173d29;
        }

        /* =====================================
           SHOP HERO
           ===================================== */

        .shop-hero {
          position: relative;
          width: 100%;
          height: clamp(420px, 34vw, 540px);
          margin: 0;
          overflow: hidden;
          background: #eef3eb;
        }

        .shop-hero-image {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 18%;
        }

        .shop-hero-image-desktop {
          display: block;
        }

        .shop-hero-image-mobile {
          display: none;
        }

        /* =====================================
           PRODUCT SECTION
           ===================================== */

        .shop-products {
          position: relative;
          z-index: 2;
          width: min(100% - 48px, 1320px);
          margin: 0 auto;
          padding: 24px 0 72px;
        }

        .shop-header {
          display: block;
          margin-bottom: 12px;
        }

        .shop-eyebrow {
          margin: 0 0 3px;
          color: #287244;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }

        .shop-title {
          margin: 0;
          color: #173d29;
          font-family:
            Georgia,
            "Times New Roman",
            serif;
          font-size: clamp(28px, 2.7vw, 36px);
          line-height: 1.02;
          letter-spacing: -0.025em;
        }

        .shop-description {
          max-width: 760px;
          margin: 5px 0 0;
          color: #6d7b72;
          font-size: 12px;
          line-height: 1.45;
        }

        /* =====================================
           CATEGORY FILTER
           ===================================== */

        .shop-filter-wrap {
          margin-bottom: 14px;
        }

        .shop-filter-label {
          margin: 0 0 7px;
          color: #56685d;
          font-size: 10px;
          font-weight: 850;
        }

        .shop-filter {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
        }

        .shop-filter-link {
          display: inline-flex;
          min-height: 34px;
          align-items: center;
          justify-content: center;
          padding: 0 13px;
          border: 1px solid #dbe4da;
          border-radius: 999px;
          background: #ffffff;
          color: #315b42;
          font-size: 10.5px;
          font-weight: 850;
          text-decoration: none;
          transition:
            background-color 150ms ease,
            border-color 150ms ease,
            color 150ms ease,
            transform 150ms ease;
        }

        .shop-filter-link:hover {
          transform: translateY(-1px);
          border-color: #a9c2ad;
        }

        .shop-filter-link-active {
          border-color: #23633d;
          background: #23633d;
          color: #ffffff;
        }

        .shop-filter-summary {
          margin: 7px 0 0;
          color: #758178;
          font-size: 10px;
        }

        /* =====================================
           PRODUCT GRID
           ===================================== */

        .product-grid {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 20px;
          align-items: stretch;
        }

        /* =====================================
           ERROR
           ===================================== */

        .error-box {
          padding: 22px;
          border: 1px solid #e7c9c9;
          border-radius: 14px;
          background: #fff0f0;
          color: #9f3838;
          font-size: 14px;
          font-weight: 700;
        }

        /* =====================================
           EMPTY STATE
           ===================================== */

        .empty-box {
          display: grid;
          min-height: 250px;
          place-items: center;
          padding: 36px;
          border: 1px solid #dfe6dd;
          border-radius: 20px;
          background: #ffffff;
          text-align: center;
        }

        .empty-icon {
          margin-bottom: 12px;
          font-size: 46px;
        }

        .empty-title {
          margin: 0;
          color: #173d29;
          font-family:
            Georgia,
            "Times New Roman",
            serif;
          font-size: 25px;
        }

        .empty-description {
          max-width: 520px;
          margin: 9px auto 0;
          color: #6f7e73;
          font-size: 14px;
          line-height: 1.65;
        }

        .empty-reset {
          display: inline-flex;
          margin-top: 16px;
          color: #23633d;
          font-size: 12px;
          font-weight: 900;
          text-decoration: none;
        }

        /* =====================================
           RESPONSIVE
           ===================================== */

        @media (max-width: 1000px) {
          .product-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 700px) {
          .shop-hero {
            height: 300px;
          }
.shop-filter {
  flex-wrap: nowrap;
  overflow-x: auto;
  gap: 7px;
  padding-bottom: 4px;
  scrollbar-width: none;
}

.shop-filter::-webkit-scrollbar {
  display: none;
}

.shop-filter-link {
  flex: 0 0 auto;
  white-space: nowrap;
}
          .shop-hero-image-desktop {
            display: none;
          }

          .shop-hero-image-mobile {
            display: block;
            object-fit: cover;
            object-position: center center;
          }

          .shop-products {
            width: min(100% - 24px, 1320px);
            margin: 0 auto;
            padding: 20px 0 56px;
          }

          .shop-header {
            align-items: flex-start;
            flex-direction: column;
            gap: 14px;
          }

          .product-grid {
            grid-template-columns: 1fr;
          }

          .shop-filter {
            gap: 7px;
          }
        }

        @media (max-width: 460px) {
          .shop-filter-link {
            min-height: 34px;
            padding: 0 11px;
            font-size: 10px;
            .shop-filter {
  flex-wrap: nowrap;
  overflow-x: auto;
  gap: 6px;
  padding-bottom: 3px;
  scrollbar-width: none;
}

.shop-filter::-webkit-scrollbar {
  display: none;
}

.shop-filter-link {
  flex: 0 0 auto;
  white-space: nowrap;
}
          }
        }
      `}</style>

      {/* =====================================
          SHOP HERO
          ===================================== */}

      <section
        className="shop-hero"
        aria-label="WonderfulLife Shop"
      >
        <Image
          src="/shop/wl-home-shop-v2-hero-approved.png"
          alt="Zoey presenting healthy lifestyle products in the WonderfulLife Shop."
          width={1536}
          height={864}
          priority
          sizes="(min-width: 701px) 100vw, 1px"
          className="shop-hero-image shop-hero-image-desktop"
        />

        <Image
          src="/images/wl-shop-mobile-zoey-kitchen.png"
          alt="Zoey in the WonderfulLife kitchen overlooking Vancouver."
          width={1536}
          height={1024}
          priority
          sizes="(max-width: 700px) 100vw, 1px"
          className="shop-hero-image shop-hero-image-mobile"
        />
      </section>

      {/* =====================================
          LIVE PRODUCT CATALOG
          ===================================== */}

      <section className="shop-products">
        <header className="shop-header">
          <div>
            <p className="shop-eyebrow">
              WonderfulLife Shop
            </p>

            <h1 className="shop-title">
              Featured Wellness Products
            </h1>

            <p className="shop-description">
              Carefully selected nutrition and wellness
              essentials to support healthier everyday living.
            </p>
          </div>

        </header>

        {/* =====================================
            CATEGORY FILTER
            ===================================== */}

        <div className="shop-filter-wrap">
          <p className="shop-filter-label">
            Browse by category
          </p>

          <nav
            className="shop-filter"
            aria-label="Product categories"
          >
            <Link
              href="/shop"
              className={
                !selectedCategory
                  ? "shop-filter-link shop-filter-link-active"
                  : "shop-filter-link"
              }
            >
              All Products
            </Link>

            {productCategories.map(
              (category) => (
                <Link
                  key={category}
                  href={`/shop?category=${encodeURIComponent(
                    category
                  )}`}
                  className={
                    normalizeCategory(
                      selectedCategory
                    ) ===
                    normalizeCategory(
                      category
                    )
                      ? "shop-filter-link shop-filter-link-active"
                      : "shop-filter-link"
                  }
                >
                  {category}
                </Link>
              )
            )}
          </nav>

          <p className="shop-filter-summary">
            {selectedCategory
              ? `${filteredProducts.length} ${
                  filteredProducts.length === 1
                    ? "product"
                    : "products"
                } in ${selectedCategory}`
              : `${filteredProducts.length} products`}
          </p>
        </div>

        {/* =====================================
            CATALOG
            ===================================== */}

        {error ? (
          <div className="error-box">
            Products could not be loaded:{" "}
            {error.message}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-box">
            <div>
              <div className="empty-icon">
                🌱
              </div>

              <h2 className="empty-title">
                {selectedCategory
                  ? `No ${selectedCategory} products yet`
                  : "Products are coming soon"}
              </h2>

              <p className="empty-description">
                {selectedCategory
                  ? "Choose another category or return to All Products."
                  : "New wellness products will appear here automatically when they are published in the WonderfulLife Product Studio."}
              </p>

              {selectedCategory ? (
                <Link
                  href="/shop"
                  className="empty-reset"
                >
                  ← All Products
                </Link>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="product-grid">
            {filteredProducts.map(
              (product) => (
                <UniversalContentCard
                  key={product.id}
                  type="product"
                  title={product.title}
                  href={`/shop/${product.slug}`}
                  excerpt={product.excerpt}
                  category={product.category}
                  imageUrl={product.image_url}
                  featured={Boolean(
                    product.featured
                  )}
                  secondaryHref={
                    product.video_url
                  }
                  secondaryLabel="Watch Product Video"
                />
              )
            )}
          </div>
        )}
      </section>
    </main>
  );
}