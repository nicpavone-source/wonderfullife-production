import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "../../../../lib/supabase/server";

type Product = {
  id: number;
  title: string;
  slug: string;
  status: string | null;
  category: string | null;
  image_url: string | null;
  video_url: string | null;
  featured: boolean | null;
  storefront_owner: string | null;
  usana_product_id: string | null;
  usana_product_slug: string | null;
  buy_url: string | null;
};

type SearchParams = {
  message?: string;
  search?: string;
  owner?: string;
  configuration?: string;
};

const STOREFRONTS = {
  nick: {
    label: "Nick",
    hostname: "nickpavone.usana.com",
    baseUrl: "https://nickpavone.usana.com",
  },

  zoey: {
    label: "Zoey",
    hostname: "shunwalau.usana.com",
    baseUrl: "https://shunwalau.usana.com",
  },
} as const;

/* -------------------------------------------------------
   BUILD PERSONALIZED USANA PRODUCT URL
------------------------------------------------------- */

function buildStorefrontUrl(
  owner: string,
  productId: string,
  productSlug: string
) {
  const storefront =
    owner === "zoey"
      ? STOREFRONTS.zoey
      : STOREFRONTS.nick;

  return `${storefront.baseUrl}/ux/cart/en-CA/product/${productId}/${productSlug}`;
}

/* -------------------------------------------------------
   READ EXISTING BUY URL
------------------------------------------------------- */

function parseUsanaUrl(value: string) {
  try {
    const url = new URL(value);

    let owner = "";

    if (url.hostname === STOREFRONTS.nick.hostname) {
      owner = "nick";
    }

    if (url.hostname === STOREFRONTS.zoey.hostname) {
      owner = "zoey";
    }

    if (!owner) {
      return null;
    }

    const match = url.pathname.match(
      /\/product\/([^/]+)\/([^/?#]+)/
    );

    if (!match) {
      return null;
    }

    return {
      owner,
      productId: decodeURIComponent(match[1]),
      productSlug: decodeURIComponent(match[2]),
      url: value,
    };
  } catch {
    return null;
  }
}

/* -------------------------------------------------------
   GET MANAGER VALUES

   Allows older products such as HealthPak to populate
   their fields from an already-saved buy_url.
------------------------------------------------------- */

function getProductManagerValues(product: Product) {
  let owner = product.storefront_owner || "";
  let productId = product.usana_product_id || "";
  let productSlug = product.usana_product_slug || "";

  if (product.buy_url) {
    const parsed = parseUsanaUrl(product.buy_url);

    if (parsed) {
      if (!owner) {
        owner = parsed.owner;
      }

      if (!productId) {
        productId = parsed.productId;
      }

      if (!productSlug) {
        productSlug = parsed.productSlug;
      }
    }
  }

  return {
    owner: owner || "nick",
    productId,
    productSlug,
  };
}

/* -------------------------------------------------------
   SAVE PRODUCT STOREFRONT
------------------------------------------------------- */

async function saveUsanaProduct(formData: FormData) {
  "use server";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const id = Number(formData.get("id"));

  let storefrontOwner = String(
    formData.get("storefront_owner") || "nick"
  ).trim();

  let usanaProductId = String(
    formData.get("usana_product_id") || ""
  ).trim();

  let usanaProductSlug = String(
    formData.get("usana_product_slug") || ""
  )
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");

  const manualBuyUrl = String(
    formData.get("manual_buy_url") || ""
  ).trim();

  if (!id) {
    redirect(
      `/studio/products/usana-manager?message=${encodeURIComponent(
        "Product ID is missing."
      )}`
    );
  }

  let buyUrl = "";

  /* -----------------------------------------------
     MANUAL URL MODE

     A manually pasted personalized URL wins.
  ------------------------------------------------ */

  if (manualBuyUrl) {
    const parsed = parseUsanaUrl(manualBuyUrl);

    if (!parsed) {
      redirect(
        `/studio/products/usana-manager?message=${encodeURIComponent(
          "The purchase URL must use nickpavone.usana.com or shunwalau.usana.com and must be a valid USANA product URL."
        )}`
      );
    }

    storefrontOwner = parsed.owner;
    usanaProductId = parsed.productId;
    usanaProductSlug = parsed.productSlug;
    buyUrl = parsed.url;
  } else {
    /* -----------------------------------------------
       AUTOMATIC URL MODE
    ------------------------------------------------ */

    if (
      storefrontOwner !== "nick" &&
      storefrontOwner !== "zoey"
    ) {
      redirect(
        `/studio/products/usana-manager?message=${encodeURIComponent(
          "Please select Nick or Zoey as the storefront."
        )}`
      );
    }

    if (!usanaProductId) {
      redirect(
        `/studio/products/usana-manager?message=${encodeURIComponent(
          "USANA Product ID is required."
        )}`
      );
    }

    if (!usanaProductSlug) {
      redirect(
        `/studio/products/usana-manager?message=${encodeURIComponent(
          "USANA URL Name is required."
        )}`
      );
    }

    buyUrl = buildStorefrontUrl(
      storefrontOwner,
      usanaProductId,
      usanaProductSlug
    );
  }

  /* -----------------------------------------------
     BLOCK GENERIC USANA LINKS
  ------------------------------------------------ */

  if (buyUrl.includes("://www.usana.com")) {
    redirect(
      `/studio/products/usana-manager?message=${encodeURIComponent(
        "Generic www.usana.com links are not allowed. Please use Nick's or Zoey's personalized storefront."
      )}`
    );
  }

  const { data: updatedProduct, error } = await supabase
    .from("content_items")
    .update({
      storefront_owner: storefrontOwner,
      usana_product_id: usanaProductId,
      usana_product_slug: usanaProductSlug,
      buy_url: buyUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("type", "product")
    .select("slug")
    .single();

  if (error) {
    redirect(
      `/studio/products/usana-manager?message=${encodeURIComponent(
        error.message
      )}`
    );
  }

  revalidatePath("/studio/products/usana-manager");
  revalidatePath("/studio/products");
  revalidatePath("/shop");

  if (updatedProduct?.slug) {
    revalidatePath(`/shop/${updatedProduct.slug}`);
  }

  redirect(
    `/studio/products/usana-manager?message=${encodeURIComponent(
      "Storefront saved successfully."
    )}`
  );
}

/* -------------------------------------------------------
   REMOVE STOREFRONT LINK
------------------------------------------------------- */

async function removeStorefrontLink(formData: FormData) {
  "use server";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const id = Number(formData.get("id"));

  if (!id) {
    redirect("/studio/products/usana-manager");
  }

  const { data: updatedProduct } = await supabase
    .from("content_items")
    .update({
      storefront_owner: null,
      usana_product_id: null,
      usana_product_slug: null,
      buy_url: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("type", "product")
    .select("slug")
    .single();

  revalidatePath("/studio/products/usana-manager");
  revalidatePath("/shop");

  if (updatedProduct?.slug) {
    revalidatePath(`/shop/${updatedProduct.slug}`);
  }

  redirect(
    `/studio/products/usana-manager?message=${encodeURIComponent(
      "Storefront link removed."
    )}`
  );
}

/* -------------------------------------------------------
   PAGE
------------------------------------------------------- */

export default async function UsanaProductManagerPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data, error } = await supabase
    .from("content_items")
    .select(
      `
        id,
        title,
        slug,
        status,
        category,
        image_url,
        video_url,
        featured,
        storefront_owner,
        usana_product_id,
        usana_product_slug,
        buy_url
      `
    )
    .eq("type", "product")
    .order("title", { ascending: true });

  const products = (data || []) as Product[];

  /* -----------------------------------------------------
     COUNTS
  ----------------------------------------------------- */

  const configuredProducts = products.filter(
    (product) => Boolean(product.buy_url)
  );

  const nickProducts = products.filter((product) => {
    const values = getProductManagerValues(product);

    return product.buy_url && values.owner === "nick";
  });

  const zoeyProducts = products.filter((product) => {
    const values = getProductManagerValues(product);

    return product.buy_url && values.owner === "zoey";
  });

  const missingProducts =
    products.length - configuredProducts.length;

  /* -----------------------------------------------------
     FILTERS
  ----------------------------------------------------- */

  const search = (params.search || "").trim().toLowerCase();

  const ownerFilter = params.owner || "all";

  const configurationFilter =
    params.configuration || "all";

  const filteredProducts = products.filter((product) => {
    const managerValues =
      getProductManagerValues(product);

    const matchesSearch =
      !search ||
      product.title.toLowerCase().includes(search) ||
      product.slug.toLowerCase().includes(search) ||
      managerValues.productId
        .toLowerCase()
        .includes(search) ||
      managerValues.productSlug
        .toLowerCase()
        .includes(search);

    const matchesOwner =
      ownerFilter === "all" ||
      (ownerFilter === "nick" &&
        product.buy_url &&
        managerValues.owner === "nick") ||
      (ownerFilter === "zoey" &&
        product.buy_url &&
        managerValues.owner === "zoey") ||
      (ownerFilter === "unassigned" &&
        !product.buy_url);

    const matchesConfiguration =
      configurationFilter === "all" ||
      (configurationFilter === "ready" &&
        Boolean(product.buy_url)) ||
      (configurationFilter === "missing" &&
        !product.buy_url);

    return (
      matchesSearch &&
      matchesOwner &&
      matchesConfiguration
    );
  });

  return (
    <main className="manager-page">
      <style>{`

        * {
          box-sizing: border-box;
        }

        .manager-page {
          min-height: 100vh;
          padding: 38px 28px 80px;
          background: #f5f8f4;
          color: #173d29;
        }

        .manager {
          width: 100%;
          max-width: 1320px;
          margin: 0 auto;
        }

        .eyebrow {
          margin: 0 0 8px;
          color: #287244;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }

        .manager-title {
          margin: 0;
          color: #173d29;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(38px, 5vw, 56px);
          line-height: 1;
          letter-spacing: -0.035em;
        }

        .description {
          max-width: 840px;
          margin: 14px 0 0;
          color: #68766d;
          font-size: 16px;
          line-height: 1.65;
        }

        .top-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 20px;
        }

        .top-link {
          display: inline-flex;
          min-height: 42px;
          align-items: center;
          justify-content: center;
          padding: 0 16px;
          border: 1px solid #d4dfd4;
          border-radius: 10px;
          background: #ffffff;
          color: #23633d;
          font-size: 13px;
          font-weight: 900;
          text-decoration: none;
        }

        .dashboard {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 12px;
          margin-top: 28px;
        }

        .stat {
          padding: 18px;
          border: 1px solid #dde6dd;
          border-radius: 16px;
          background: #ffffff;
        }

        .stat-value {
          margin: 0;
          color: #173d29;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 32px;
          font-weight: 700;
          line-height: 1;
        }

        .stat-label {
          margin: 7px 0 0;
          color: #718077;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .message {
          margin-top: 22px;
          padding: 14px 18px;
          border: 1px solid #cfe3d2;
          border-radius: 12px;
          background: #edf7ee;
          color: #23633d;
          font-size: 14px;
          font-weight: 800;
        }

        .filters {
          display: grid;
          grid-template-columns:
            minmax(240px, 1fr)
            190px
            190px
            auto;
          gap: 12px;
          margin-top: 24px;
          padding: 16px;
          border: 1px solid #dde6dd;
          border-radius: 16px;
          background: #ffffff;
        }

        .filter-input,
        .filter-select {
          min-height: 44px;
          width: 100%;
          padding: 9px 12px;
          border: 1px solid #d9e2d9;
          border-radius: 9px;
          background: #ffffff;
          color: #263b2e;
          font: inherit;
        }

        .filter-button {
          min-height: 44px;
          padding: 0 20px;
          border: 0;
          border-radius: 9px;
          background: #23633d;
          color: #ffffff;
          cursor: pointer;
          font-weight: 900;
        }

        .filter-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin: 14px 0 20px;
        }

        .result-count {
          margin: 0;
          color: #718077;
          font-size: 13px;
        }

        .clear-link {
          color: #23633d;
          font-size: 13px;
          font-weight: 900;
          text-decoration: none;
        }

        .error {
          padding: 20px;
          border: 1px solid #e6c8c8;
          border-radius: 14px;
          background: #fff2f2;
          color: #a13c3c;
          font-weight: 800;
        }

        .product-list {
          display: grid;
          gap: 18px;
        }

        .product-card {
          overflow: hidden;
          border: 1px solid #dce5dc;
          border-radius: 20px;
          background: #ffffff;
          box-shadow:
            0 8px 26px rgba(23, 61, 41, 0.055);
        }

        .product-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 20px 22px;
          border-bottom: 1px solid #e5ebe5;
          background: #fbfcfa;
        }

        .product-identity {
          display: flex;
          align-items: center;
          gap: 15px;
          min-width: 0;
        }

        .product-thumbnail {
          width: 58px;
          height: 58px;
          flex: 0 0 auto;
          overflow: hidden;
          border: 1px solid #dfe7df;
          border-radius: 11px;
          background: #eef3ec;
        }

        .product-thumbnail img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .thumbnail-placeholder {
          display: grid;
          width: 100%;
          height: 100%;
          place-items: center;
          font-size: 24px;
        }

        .product-name {
          margin: 0;
          color: #173d29;
          font-size: 20px;
          font-weight: 900;
        }

        .product-meta {
          margin: 5px 0 0;
          color: #809087;
          font-size: 12px;
        }

        .badges {
          display: flex;
          gap: 7px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .badge {
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 900;
        }

        .badge-ready {
          background: #e7f6eb;
          color: #18703a;
        }

        .badge-missing {
          background: #fff5df;
          color: #9a6719;
        }

        .badge-status {
          background: #edf5eb;
          color: #23633d;
          text-transform: capitalize;
        }

        .badge-featured {
          background: #edf1ff;
          color: #4059a7;
        }

        .product-form {
          padding: 22px;
        }

        .form-grid {
          display: grid;
          grid-template-columns:
            minmax(285px, 1fr)
            minmax(220px, 0.9fr)
            minmax(220px, 0.9fr);
          gap: 14px;
        }

        .field {
          display: flex;
          min-width: 0;
          flex-direction: column;
          gap: 7px;
        }

        .field label {
          color: #234b35;
          font-size: 12px;
          font-weight: 900;
        }

        .field input,
        .field select {
          width: 100%;
          min-height: 48px;
          padding: 10px 14px;
          border: 1px solid #dbe4db;
          border-radius: 10px;
          outline: none;
          background: #ffffff;
          color: #24392d;
          font: inherit;
        }

        .field input:focus,
        .field select:focus {
          border-color: #2e7b4a;
          box-shadow:
            0 0 0 3px rgba(46, 123, 74, 0.08);
        }

        .manual-url {
          margin-top: 15px;
        }

        .helper {
          margin: 0;
          color: #829087;
          font-size: 11px;
          line-height: 1.5;
        }

        .url-box {
          margin-top: 18px;
          padding: 15px 16px;
          border: 1px solid #dce7dc;
          border-radius: 12px;
          background: #f7faf6;
        }

        .url-label {
          margin: 0 0 6px;
          color: #23633d;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .url-value {
          overflow-wrap: anywhere;
          margin: 0;
          color: #5f6e64;
          font-size: 13px;
          line-height: 1.55;
        }

        .not-configured {
          margin: 0;
          color: #9a7139;
          font-size: 13px;
          font-weight: 800;
        }

        .product-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 18px;
        }

        .save-button,
        .remove-button {
          min-height: 44px;
          padding: 0 18px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 900;
        }

        .save-button {
          border: 0;
          background: #23633d;
          color: #ffffff;
        }

        .remove-button {
          border: 1px solid #ecd4d4;
          background: #ffffff;
          color: #a34848;
        }

        .action-link {
          display: inline-flex;
          min-height: 44px;
          align-items: center;
          justify-content: center;
          padding: 0 16px;
          border: 1px solid #cfdacf;
          border-radius: 10px;
          background: #ffffff;
          color: #23633d;
          font-size: 13px;
          font-weight: 900;
          text-decoration: none;
        }

        .owner-display {
          margin-left: auto;
          color: #6d7d73;
          font-size: 12px;
          font-weight: 800;
        }

        @media (max-width: 1050px) {
          .dashboard {
            grid-template-columns:
              repeat(3, minmax(0, 1fr));
          }

          .filters {
            grid-template-columns: 1fr 1fr;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 650px) {
          .manager-page {
            padding: 26px 16px 60px;
          }

          .dashboard {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .filters {
            grid-template-columns: 1fr;
          }

          .product-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .badges {
            justify-content: flex-start;
          }

          .product-identity {
            align-items: flex-start;
          }
        }
      `}</style>

      <div className="manager">

        {/* HEADER */}

        <header>
          <p className="eyebrow">
            WonderfulLife Studio
          </p>

          <h1 className="manager-title">
            USANA Product Manager
          </h1>

          <p className="description">
            Manage the personalized USANA storefront used by
            every WonderfulLife product. Assign products to
            Nick or Zoey, generate purchase links automatically,
            or paste a personalized USANA product URL manually.
          </p>

          <div className="top-actions">
            <Link
              href="/studio/products"
              className="top-link"
            >
              ← Product Library
            </Link>

            <Link
              href="/shop"
              target="_blank"
              className="top-link"
            >
              View WonderfulLife Shop ↗
            </Link>
          </div>
        </header>

        {/* DASHBOARD */}

        <section className="dashboard">
          <div className="stat">
            <p className="stat-value">
              {products.length}
            </p>

            <p className="stat-label">
              Products
            </p>
          </div>

          <div className="stat">
            <p className="stat-value">
              {configuredProducts.length}
            </p>

            <p className="stat-label">
              Configured
            </p>
          </div>

          <div className="stat">
            <p className="stat-value">
              {missingProducts}
            </p>

            <p className="stat-label">
              Missing Links
            </p>
          </div>

          <div className="stat">
            <p className="stat-value">
              {nickProducts.length}
            </p>

            <p className="stat-label">
              Nick
            </p>
          </div>

          <div className="stat">
            <p className="stat-value">
              {zoeyProducts.length}
            </p>

            <p className="stat-label">
              Zoey
            </p>
          </div>
        </section>

        {/* MESSAGE */}

        {params.message ? (
          <div className="message">
            {params.message}
          </div>
        ) : null}

        {/* SEARCH + FILTER */}

        <form
          method="GET"
          className="filters"
        >
          <input
            className="filter-input"
            type="search"
            name="search"
            defaultValue={params.search || ""}
            placeholder="Search products..."
          />

          <select
            name="owner"
            defaultValue={ownerFilter}
            className="filter-select"
          >
            <option value="all">
              All Storefronts
            </option>

            <option value="nick">
              Nick
            </option>

            <option value="zoey">
              Zoey
            </option>

            <option value="unassigned">
              Unassigned
            </option>
          </select>

          <select
            name="configuration"
            defaultValue={configurationFilter}
            className="filter-select"
          >
            <option value="all">
              All Products
            </option>

            <option value="ready">
              Storefront Ready
            </option>

            <option value="missing">
              Missing Buy Link
            </option>
          </select>

          <button
            type="submit"
            className="filter-button"
          >
            Filter
          </button>
        </form>

        <div className="filter-footer">
          <p className="result-count">
            Showing {filteredProducts.length} of{" "}
            {products.length} products
          </p>

          <Link
            href="/studio/products/usana-manager"
            className="clear-link"
          >
            Clear Filters
          </Link>
        </div>

        {/* PRODUCTS */}

        {error ? (
          <div className="error">
            Products could not be loaded:{" "}
            {error.message}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="error">
            No products match the current filters.
          </div>
        ) : (
          <div className="product-list">

            {filteredProducts.map((product) => {
              const values =
                getProductManagerValues(product);

              const ownerName =
                values.owner === "zoey"
                  ? "Zoey"
                  : "Nick";

              return (
                <article
                  key={product.id}
                  className="product-card"
                >
                  {/* PRODUCT HEADER */}

                  <div className="product-header">
                    <div className="product-identity">

                      <div className="product-thumbnail">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt=""
                          />
                        ) : (
                          <div className="thumbnail-placeholder">
                            🌱
                          </div>
                        )}
                      </div>

                      <div>
                        <h2 className="product-name">
                          {product.title}
                        </h2>

                        <p className="product-meta">
                          {product.category ||
                            "USANA Product"}
                          {" • "}
                          {product.slug}
                        </p>
                      </div>
                    </div>

                    <div className="badges">

                      {product.buy_url ? (
                        <span className="badge badge-ready">
                          ✓ Storefront Ready
                        </span>
                      ) : (
                        <span className="badge badge-missing">
                          Needs Buy Link
                        </span>
                      )}

                      {product.featured ? (
                        <span className="badge badge-featured">
                          Featured
                        </span>
                      ) : null}

                      <span className="badge badge-status">
                        {product.status || "draft"}
                      </span>
                    </div>
                  </div>

                  {/* PRODUCT MANAGER FORM */}

                  <form
                    action={saveUsanaProduct}
                    className="product-form"
                  >
                    <input
                      type="hidden"
                      name="id"
                      value={product.id}
                    />

                    <div className="form-grid">

                      {/* STOREFRONT */}

                      <div className="field">
                        <label
                          htmlFor={`owner-${product.id}`}
                        >
                          Storefront
                        </label>

                        <select
                          id={`owner-${product.id}`}
                          name="storefront_owner"
                          defaultValue={values.owner}
                        >
                          <option value="nick">
                            Nick — nickpavone.usana.com
                          </option>

                          <option value="zoey">
                            Zoey — shunwalau.usana.com
                          </option>
                        </select>
                      </div>

                      {/* PRODUCT ID */}

                      <div className="field">
                        <label
                          htmlFor={`id-${product.id}`}
                        >
                          USANA Product ID
                        </label>

                        <input
                          id={`id-${product.id}`}
                          name="usana_product_id"
                          type="text"
                          defaultValue={
                            values.productId
                          }
                          placeholder="e.g. 122-020104"
                        />

                        <p className="helper">
                          Example: 122-020104
                        </p>
                      </div>

                      {/* URL NAME */}

                      <div className="field">
                        <label
                          htmlFor={`slug-${product.id}`}
                        >
                          USANA URL Name
                        </label>

                        <input
                          id={`slug-${product.id}`}
                          name="usana_product_slug"
                          type="text"
                          defaultValue={
                            values.productSlug
                          }
                          placeholder="e.g. biomega"
                        />

                        <p className="helper">
                          Final word from the USANA
                          product URL.
                        </p>
                      </div>
                    </div>

                    {/* MANUAL URL */}

                    <div className="field manual-url">
                      <label
                        htmlFor={`manual-${product.id}`}
                      >
                        Paste Personalized Product URL
                        — Optional
                      </label>

                      <input
                        id={`manual-${product.id}`}
                        name="manual_buy_url"
                        type="url"
                        placeholder="https://nickpavone.usana.com/... or https://shunwalau.usana.com/..."
                      />

                      <p className="helper">
                        Leave this blank to generate the
                        link automatically. If you paste a
                        personalized USANA product URL here,
                        it will be used instead and the
                        Product ID, URL Name and storefront
                        will be detected automatically.
                      </p>
                    </div>

                    {/* CURRENT URL */}

                    <div className="url-box">
                      <p className="url-label">
                        Current Purchase URL
                      </p>

                      {product.buy_url ? (
                        <p className="url-value">
                          {product.buy_url}
                        </p>
                      ) : (
                        <p className="not-configured">
                          No personalized storefront URL
                          configured yet.
                        </p>
                      )}
                    </div>

                    {/* ACTIONS */}

                    <div className="product-actions">

                      <button
                        type="submit"
                        className="save-button"
                      >
                        Save Storefront Link
                      </button>

                      {product.buy_url ? (
                        <a
                          href={product.buy_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="action-link"
                        >
                          Test Buy Link ↗
                        </a>
                      ) : null}

                      <Link
                        href={`/shop/${product.slug}`}
                        target="_blank"
                        className="action-link"
                      >
                        Open Product ↗
                      </Link>

                      <Link
                        href={`/studio/products/edit/${product.id}`}
                        className="action-link"
                      >
                        Edit Product
                      </Link>

                      {product.buy_url ? (
                        <span className="owner-display">
                          Storefront: {ownerName}
                        </span>
                      ) : null}
                    </div>
                  </form>

                  {/* REMOVE LINK */}

                  {product.buy_url ? (
                    <form
                      action={removeStorefrontLink}
                      style={{
                        padding:
                          "0 22px 22px 22px",
                      }}
                    >
                      <input
                        type="hidden"
                        name="id"
                        value={product.id}
                      />

                      <button
                        type="submit"
                        className="remove-button"
                      >
                        Remove Storefront Link
                      </button>
                    </form>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}