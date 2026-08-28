import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "../../../../lib/supabase/server";
import ProductImageUpload from "./ProductImageUpload";

const colors = {
  page: "#f6f8f5",
  panel: "#ffffff",
  border: "#dfe6dd",
  text: "#173d29",
  muted: "#6f7e73",
  green: "#23633d",
  greenDark: "#194d2f",
  greenSoft: "#eaf2e8",
  redSoft: "#fff0f0",
  red: "#9f3838",
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

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeUsanaProductSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

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

async function createProductAction(formData: FormData) {
  "use server";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const title = String(
    formData.get("title") || ""
  ).trim();

  const submittedSlug = String(
    formData.get("slug") || ""
  ).trim();

  const excerpt = String(
    formData.get("excerpt") || ""
  ).trim();

  const body = String(
    formData.get("body") || ""
  ).trim();

  const category = String(
    formData.get("category") || ""
  ).trim();

  const status = String(
    formData.get("status") || "draft"
  );

  const featured =
    formData.get("featured") === "on";

  const imageUrl = String(
    formData.get("image_url") || ""
  ).trim();

  const videoUrl = String(
    formData.get("video_url") || ""
  ).trim();

  /*
   * USANA STOREFRONT
   */

  let storefrontOwner = String(
    formData.get("storefront_owner") || "nick"
  ).trim();

  let usanaProductId = String(
    formData.get("usana_product_id") || ""
  ).trim();

  let usanaProductSlug =
    normalizeUsanaProductSlug(
      String(
        formData.get("usana_product_slug") || ""
      )
    );

  const manualBuyUrl = String(
    formData.get("manual_buy_url") || ""
  ).trim();

  if (!title) {
    redirect(
      `/studio/products/new?message=${encodeURIComponent(
        "Please enter a product name."
      )}`
    );
  }

  const slug = slugify(
    submittedSlug || title
  );

  let buyUrl: string | null = null;

  /*
   * MANUAL PERSONALIZED URL
   *
   * If a personalized USANA URL is pasted,
   * it takes priority and automatically fills
   * the storefront owner, product ID and slug.
   */

  if (manualBuyUrl) {
    const parsed =
      parseUsanaUrl(manualBuyUrl);

    if (!parsed) {
      redirect(
        `/studio/products/new?message=${encodeURIComponent(
          "The purchase URL must use nickpavone.usana.com or shunwalau.usana.com and must be a valid personalized USANA product URL."
        )}`
      );
    }

    storefrontOwner = parsed.owner;
    usanaProductId = parsed.productId;
    usanaProductSlug =
      parsed.productSlug;
    buyUrl = parsed.url;
  }

  /*
   * AUTOMATIC BUY URL
   *
   * If Product ID + URL Name are supplied,
   * WonderfulLife automatically creates
   * the personalized USANA purchase URL.
   */

  if (
    !buyUrl &&
    usanaProductId &&
    usanaProductSlug
  ) {
    if (
      storefrontOwner !== "nick" &&
      storefrontOwner !== "zoey"
    ) {
      redirect(
        `/studio/products/new?message=${encodeURIComponent(
          "Please select Nick or Zoey as the storefront."
        )}`
      );
    }

    buyUrl = buildStorefrontUrl(
      storefrontOwner,
      usanaProductId,
      usanaProductSlug
    );
  }

  /*
   * Prevent partially configured storefront.
   */

  if (
    (usanaProductId &&
      !usanaProductSlug) ||
    (!usanaProductId &&
      usanaProductSlug)
  ) {
    redirect(
      `/studio/products/new?message=${encodeURIComponent(
        "To create a Buy button, enter both the USANA Product ID and USANA URL Name."
      )}`
    );
  }

  /*
   * Block generic USANA links.
   */

  if (
    buyUrl &&
    buyUrl.includes("://www.usana.com")
  ) {
    redirect(
      `/studio/products/new?message=${encodeURIComponent(
        "Generic www.usana.com links are not allowed. Use Nick's or Zoey's personalized storefront."
      )}`
    );
  }

  const { error } = await supabase
    .from("content_items")
    .insert({
      created_by: user.id,

      type: "product",

      title,
      slug,

      excerpt:
        excerpt || null,

      body:
        body || null,

      category:
        category || null,

      status,

      image_url:
        imageUrl || null,

      video_url:
        videoUrl || null,

      featured,

      /*
       * USANA STOREFRONT FIELDS
       */

      storefront_owner:
        buyUrl
          ? storefrontOwner
          : null,

      usana_product_id:
        buyUrl
          ? usanaProductId
          : null,

      usana_product_slug:
        buyUrl
          ? usanaProductSlug
          : null,

      buy_url:
        buyUrl,
    });

  if (error) {
    redirect(
      `/studio/products/new?message=${encodeURIComponent(
        error.message
      )}`
    );
  }

  redirect(
    `/studio/products?message=${encodeURIComponent(
      buyUrl
        ? "Product created successfully with storefront Buy link."
        : "Product created successfully. Storefront Buy link can be added later."
    )}`
  );
}

type NewProductPageProps = {
  searchParams: Promise<{
    message?: string;
  }>;
};

export default async function NewProductPage({
  searchParams,
}: NewProductPageProps) {
  const params = await searchParams;

  const message =
    params.message || "";

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "28px 32px 60px",
        background: colors.page,
        color: colors.text,
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent:
            "space-between",
          gap: "18px",
          flexWrap: "wrap",
          marginBottom: "22px",
        }}
      >
        <div>
          <p style={eyebrowStyle}>
            WonderfulLife Product Studio
          </p>

          <h1
            style={{
              margin: "8px 0 0",
              fontSize: "34px",
              lineHeight: 1.1,
            }}
          >
            Create New Product
          </h1>

          <p
            style={{
              margin: "8px 0 0",
              color: colors.muted,
              fontSize: "14px",
            }}
          >
            Add a new wellness product
            to your WonderfulLife library.
          </p>
        </div>

        <Link
          href="/studio/products"
          style={secondaryButtonStyle}
        >
          ← Back to Products
        </Link>
      </header>

      {message ? (
        <div
          style={{
            marginBottom: "18px",
            padding: "12px 14px",
            border:
              "1px solid #e7c9c9",
            borderRadius: "10px",
            background:
              colors.redSoft,
            color: colors.red,
            fontSize: "13px",
            fontWeight: 700,
          }}
        >
          {message}
        </div>
      ) : null}

      <form
        action={createProductAction}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(0, 1fr) 350px",
            gap: "18px",
            alignItems: "start",
          }}
        >
          {/* LEFT COLUMN */}

          <div
            style={{
              display: "grid",
              gap: "18px",
            }}
          >
            <section
              style={panelStyle}
            >
              <h2
                style={sectionTitleStyle}
              >
                Product Details
              </h2>

              <div
                style={fieldGroupStyle}
              >
                <label
                  htmlFor="title"
                  style={labelStyle}
                >
                  Product Name
                </label>

                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  placeholder="Example: USANA BiOmega"
                  style={inputStyle}
                />
              </div>

              <div
                style={fieldGroupStyle}
              >
                <label
                  htmlFor="slug"
                  style={labelStyle}
                >
                  Product Slug
                </label>

                <input
                  id="slug"
                  name="slug"
                  type="text"
                  placeholder="Leave blank to create automatically"
                  style={inputStyle}
                />

                <p
                  style={helpTextStyle}
                >
                  Used in the public
                  product page address.
                </p>
              </div>

              <div
                style={fieldGroupStyle}
              >
                <label
                  htmlFor="excerpt"
                  style={labelStyle}
                >
                  Short Description
                </label>

                <textarea
                  id="excerpt"
                  name="excerpt"
                  rows={4}
                  placeholder="Write a short summary for product cards and search results."
                  style={textareaStyle}
                />
              </div>

              <div
                style={fieldGroupStyle}
              >
                <label
                  htmlFor="body"
                  style={labelStyle}
                >
                  Full Product Description
                </label>

                <textarea
                  id="body"
                  name="body"
                  rows={14}
                  placeholder="Describe the product, its features, ingredients, benefits, and suggested use."
                  style={textareaStyle}
                />
              </div>
            </section>

            {/* PURCHASE + STOREFRONT */}

            <section
              style={storefrontPanelStyle}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "space-between",
                  gap: "16px",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <p
                    style={{
                      ...eyebrowStyle,
                      marginBottom: "5px",
                    }}
                  >
                    USANA Storefront
                  </p>

                  <h2
                    style={{
                      ...sectionTitleStyle,
                      marginBottom: 0,
                    }}
                  >
                    🛒 Purchase & Buy Button
                  </h2>
                </div>

                <span
                  style={automaticBadgeStyle}
                >
                  Automatic
                </span>
              </div>

              <p
                style={{
                  margin:
                    "10px 0 18px",
                  color: colors.muted,
                  fontSize: "13px",
                  lineHeight: 1.6,
                }}
              >
                Configure the personalized
                USANA purchase link now and
                WonderfulLife will save the
                Buy button with the product.
              </p>

              <div
                style={storefrontGridStyle}
              >
                <div>
                  <label
                    htmlFor="storefront_owner"
                    style={labelStyle}
                  >
                    Storefront
                  </label>

                  <select
                    id="storefront_owner"
                    name="storefront_owner"
                    defaultValue="nick"
                    style={inputStyle}
                  >
                    <option value="nick">
                      Nick —
                      nickpavone.usana.com
                    </option>

                    <option value="zoey">
                      Zoey —
                      shunwalau.usana.com
                    </option>
                  </select>

                  <p
                    style={helpTextStyle}
                  >
                    Choose which personalized
                    USANA storefront receives
                    the purchase.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="usana_product_id"
                    style={labelStyle}
                  >
                    USANA Product ID
                  </label>

                  <input
                    id="usana_product_id"
                    name="usana_product_id"
                    type="text"
                    placeholder="Example: 122-020104"
                    style={inputStyle}
                  />

                  <p
                    style={helpTextStyle}
                  >
                    Enter the product ID
                    shown in the USANA
                    product URL.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="usana_product_slug"
                    style={labelStyle}
                  >
                    USANA URL Name
                  </label>

                  <input
                    id="usana_product_slug"
                    name="usana_product_slug"
                    type="text"
                    placeholder="Example: biomega"
                    style={inputStyle}
                  />

                  <p
                    style={helpTextStyle}
                  >
                    Usually the final product
                    name in the USANA URL.
                  </p>
                </div>
              </div>

              <div
                style={{
                  marginTop: "18px",
                }}
              >
                <label
                  htmlFor="manual_buy_url"
                  style={labelStyle}
                >
                  Personalized Purchase URL
                  — Optional
                </label>

                <input
                  id="manual_buy_url"
                  name="manual_buy_url"
                  type="url"
                  placeholder="https://nickpavone.usana.com/... or https://shunwalau.usana.com/..."
                  style={inputStyle}
                />

                <p
                  style={helpTextStyle}
                >
                  If you already have the
                  complete personalized USANA
                  product URL, paste it here.
                  It will override the fields
                  above and WonderfulLife will
                  detect the storefront,
                  Product ID and URL name
                  automatically.
                </p>
              </div>

              <div
                style={buyInfoStyle}
              >
                <strong
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    color:
                      colors.greenDark,
                    fontSize: "12px",
                  }}
                >
                  How the Buy button works
                </strong>

                <span
                  style={{
                    color: colors.muted,
                    fontSize: "12px",
                    lineHeight: 1.55,
                  }}
                >
                  Enter both the USANA Product
                  ID and URL Name and
                  WonderfulLife will generate
                  the personalized Buy link
                  automatically. You may also
                  leave these fields blank and
                  configure the product later
                  in USANA Product Manager.
                </span>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN */}

          <aside
            style={{
              display: "grid",
              gap: "18px",
            }}
          >
            <section
              style={panelStyle}
            >
              <h2
                style={sectionTitleStyle}
              >
                Product Image
              </h2>

              <ProductImageUpload />

              <p
                style={{
                  ...helpTextStyle,
                  marginTop: "12px",
                  textAlign: "center",
                }}
              >
                Upload a product image before
                creating the product. The
                image URL will be saved with
                the product record.
              </p>
            </section>

            <section
              style={panelStyle}
            >
              <h2
                style={sectionTitleStyle}
              >
                Resource Center
              </h2>

              <div
                style={fieldGroupStyle}
              >
                <label
                  htmlFor="video_url"
                  style={labelStyle}
                >
                  🎥 Product Video URL
                </label>

                <input
                  id="video_url"
                  name="video_url"
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  style={inputStyle}
                />

                <p
                  style={helpTextStyle}
                >
                  Paste a YouTube, USANA,
                  or WonderfulLife video link.
                </p>
              </div>
            </section>

            <section
              style={panelStyle}
            >
              <h2
                style={sectionTitleStyle}
              >
                Organization
              </h2>

              <div
                style={fieldGroupStyle}
              >
                <label
                  htmlFor="category"
                  style={labelStyle}
                >
                  Category
                </label>

                <select
                  id="category"
                  name="category"
                  defaultValue=""
                  style={inputStyle}
                >
                  <option value="">
                    Select category
                  </option>

                  <option value="Nutrition">
                    Nutrition
                  </option>

                  <option value="Supplements">
                    Supplements
                  </option>

                  <option value="Skincare">
                    Skincare
                  </option>

                  <option value="Fitness">
                    Fitness
                  </option>

                  <option value="Wellness">
                    Wellness
                  </option>

                  <option value="Lifestyle">
                    Lifestyle
                  </option>
                </select>
              </div>
            </section>

            <section
              style={panelStyle}
            >
              <h2
                style={sectionTitleStyle}
              >
                Publishing
              </h2>

              <div
                style={fieldGroupStyle}
              >
                <label
                  htmlFor="status"
                  style={labelStyle}
                >
                  Status
                </label>

                <select
                  id="status"
                  name="status"
                  defaultValue="draft"
                  style={inputStyle}
                >
                  <option value="draft">
                    Draft
                  </option>

                  <option value="published">
                    Published
                  </option>
                </select>
              </div>

              <label
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  marginTop: "16px",
                  padding: "13px",
                  border: `1px solid ${colors.border}`,
                  borderRadius: "9px",
                  cursor: "pointer",
                }}
              >
                <input
                  name="featured"
                  type="checkbox"
                  style={{
                    width: "16px",
                    height: "16px",
                    marginTop: "2px",
                  }}
                />

                <span>
                  <strong
                    style={{
                      display: "block",
                      fontSize: "13px",
                    }}
                  >
                    Featured Product
                  </strong>

                  <span
                    style={{
                      display: "block",
                      marginTop: "3px",
                      color:
                        colors.muted,
                      fontSize: "12px",
                      lineHeight: 1.5,
                    }}
                  >
                    Display this product in
                    featured sections.
                  </span>
                </span>
              </label>
            </section>

            <button
              type="submit"
              style={submitButtonStyle}
            >
              Create Product
            </button>

            <Link
              href="/studio/products"
              style={cancelButtonStyle}
            >
              Cancel
            </Link>
          </aside>
        </div>
      </form>
    </main>
  );
}

const eyebrowStyle = {
  margin: 0,
  color: colors.green,
  fontSize: "11px",
  fontWeight: 900,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
} as const;

const panelStyle = {
  padding: "22px",
  border: `1px solid ${colors.border}`,
  borderRadius: "15px",
  background: colors.panel,
} as const;

const storefrontPanelStyle = {
  ...panelStyle,
  border:
    "1px solid #cfe0d0",
  background:
    "linear-gradient(180deg, #ffffff 0%, #f8fbf7 100%)",
} as const;

const sectionTitleStyle = {
  margin: "0 0 18px",
  color: colors.text,
  fontSize: "20px",
} as const;

const fieldGroupStyle = {
  marginTop: "16px",
} as const;

const labelStyle = {
  display: "block",
  marginBottom: "7px",
  color: colors.text,
  fontSize: "12px",
  fontWeight: 900,
} as const;

const inputStyle = {
  width: "100%",
  padding: "11px 12px",
  border: `1px solid ${colors.border}`,
  borderRadius: "8px",
  background: "#ffffff",
  color: colors.text,
  fontFamily: "inherit",
  fontSize: "13px",
  boxSizing: "border-box",
} as const;

const textareaStyle = {
  ...inputStyle,
  resize: "vertical",
  lineHeight: 1.6,
} as const;

const helpTextStyle = {
  margin: "7px 0 0",
  color: colors.muted,
  fontSize: "11px",
  lineHeight: 1.5,
} as const;

const storefrontGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(3, minmax(0, 1fr))",
  gap: "14px",
} as const;

const automaticBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  padding: "6px 10px",
  borderRadius: "999px",
  background: colors.greenSoft,
  color: colors.green,
  fontSize: "10px",
  fontWeight: 900,
} as const;

const buyInfoStyle = {
  marginTop: "18px",
  padding: "13px 14px",
  border:
    "1px solid #d7e6d6",
  borderRadius: "10px",
  background: colors.greenSoft,
} as const;

const submitButtonStyle = {
  width: "100%",
  padding: "12px 15px",
  border: "none",
  borderRadius: "9px",
  background: colors.green,
  color: "#ffffff",
  fontFamily: "inherit",
  fontSize: "13px",
  fontWeight: 900,
  cursor: "pointer",
} as const;

const secondaryButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px 14px",
  border: `1px solid ${colors.border}`,
  borderRadius: "9px",
  background: "#ffffff",
  color: colors.green,
  fontSize: "13px",
  fontWeight: 900,
  textDecoration: "none",
} as const;

const cancelButtonStyle = {
  ...secondaryButtonStyle,
  width: "100%",
  boxSizing: "border-box",
} as const;