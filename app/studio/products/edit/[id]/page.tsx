import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "../../../../../lib/supabase/server";
import ProductImageUpload from "../../new/ProductImageUpload";

type EditProductPageProps = {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    message?: string;
  }>;
};

type Product = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string | null;
  category: string | null;
  status: string | null;
  image_url: string | null;
  video_url: string | null;
  featured: boolean | null;

  storefront_owner: string | null;
  usana_product_id: string | null;
  usana_product_slug: string | null;
  buy_url: string | null;
};

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

/* -------------------------------------------------------
   BASIC HELPERS
------------------------------------------------------- */

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

/* -------------------------------------------------------
   BUILD PERSONALIZED USANA PURCHASE URL
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
   PARSE EXISTING / MANUAL USANA URL
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
   LOAD STOREFRONT VALUES

   Older products may only have buy_url populated.
   This extracts the owner, product ID and URL name
   automatically so the Edit screen still works.
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
   UPDATE PRODUCT
------------------------------------------------------- */

async function updateProductAction(formData: FormData) {
  "use server";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const productId = Number(
    formData.get("product_id")
  );

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

  const imageUrl = String(
    formData.get("image_url") || ""
  ).trim();

  const videoUrl = String(
    formData.get("video_url") || ""
  ).trim();

  const featured =
    formData.get("featured") === "on";

  /* -----------------------------------------------------
     USANA STOREFRONT FIELDS
  ----------------------------------------------------- */

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

  if (!productId) {
    redirect(
      `/studio/products?message=${encodeURIComponent(
        "The product ID is missing."
      )}`
    );
  }

  if (!title) {
    redirect(
      `/studio/products/edit/${productId}?message=${encodeURIComponent(
        "Please enter a product name."
      )}`
    );
  }

  const slug = slugify(
    submittedSlug || title
  );

  let buyUrl: string | null = null;

  /* -----------------------------------------------------
     MANUAL PERSONALIZED URL

     If a full personalized USANA product URL is pasted,
     it overrides the Storefront / Product ID / URL Name
     fields and fills them automatically.
  ----------------------------------------------------- */

  if (manualBuyUrl) {
    const parsed =
      parseUsanaUrl(manualBuyUrl);

    if (!parsed) {
      redirect(
        `/studio/products/edit/${productId}?message=${encodeURIComponent(
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

  /* -----------------------------------------------------
     AUTOMATIC PURCHASE URL
  ----------------------------------------------------- */

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
        `/studio/products/edit/${productId}?message=${encodeURIComponent(
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

  /* -----------------------------------------------------
     PREVENT PARTIAL CONFIGURATION
  ----------------------------------------------------- */

  if (
    (usanaProductId &&
      !usanaProductSlug) ||
    (!usanaProductId &&
      usanaProductSlug)
  ) {
    redirect(
      `/studio/products/edit/${productId}?message=${encodeURIComponent(
        "To create a Buy button, enter both the USANA Product ID and USANA URL Name."
      )}`
    );
  }

  /* -----------------------------------------------------
     BLOCK GENERIC USANA LINKS
  ----------------------------------------------------- */

  if (
    buyUrl &&
    buyUrl.includes("://www.usana.com")
  ) {
    redirect(
      `/studio/products/edit/${productId}?message=${encodeURIComponent(
        "Generic www.usana.com links are not allowed. Use Nick's or Zoey's personalized storefront."
      )}`
    );
  }

  /* -----------------------------------------------------
     UPDATE DATABASE
  ----------------------------------------------------- */

  const { error } = await supabase
    .from("content_items")
    .update({
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

      updated_at:
        new Date().toISOString(),
    })
    .eq("id", productId)
    .eq("type", "product")
    

  if (error) {
    redirect(
      `/studio/products/edit/${productId}?message=${encodeURIComponent(
        error.message
      )}`
    );
  }

  /* -----------------------------------------------------
     REFRESH STUDIO + PUBLIC SHOP
  ----------------------------------------------------- */

  revalidatePath("/studio/products");

  revalidatePath(
    "/studio/products/usana-manager"
  );

  revalidatePath("/shop");

  revalidatePath(`/shop/${slug}`);

  redirect(
    `/studio/products?message=${encodeURIComponent(
      buyUrl
        ? "Product updated successfully with storefront Buy link."
        : "Product updated successfully."
    )}`
  );
}

/* -------------------------------------------------------
   PAGE
------------------------------------------------------- */

export default async function EditProductPage({
  params,
  searchParams,
}: EditProductPageProps) {
  const { id } = await params;

  const query = await searchParams;

  const productId = Number(id);

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  if (!productId) {
    redirect(
      `/studio/products?message=${encodeURIComponent(
        "The product ID is invalid."
      )}`
    );
  }

  /* -----------------------------------------------------
     LOAD PRODUCT
  ----------------------------------------------------- */

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
        status,
        image_url,
        video_url,
        featured,
        storefront_owner,
        usana_product_id,
        usana_product_slug,
        buy_url
      `
    )
    .eq("id", productId)
    .eq("type", "product")
    
    .single();

  if (error || !data) {
    redirect(
      `/studio/products?message=${encodeURIComponent(
        "Product could not be found."
      )}`
    );
  }

  const product =
    data as Product;

  const managerValues =
    getProductManagerValues(product);

  const message =
    query.message || "";

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "28px 32px 60px",
        background: colors.page,
        color: colors.text,
      }}
    >
      {/* --------------------------------------------------
          HEADER
      -------------------------------------------------- */}

      <header
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
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
            Edit Product
          </h1>

          <p
            style={{
              margin: "8px 0 0",
              color: colors.muted,
              fontSize: "14px",
            }}
          >
            Update product information,
            storefront, media and publishing
            settings.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <Link
            href={`/shop/${product.slug}`}
            target="_blank"
            style={secondaryButtonStyle}
          >
            View Product ↗
          </Link>

          <Link
            href="/studio/products"
            style={secondaryButtonStyle}
          >
            ← Back to Products
          </Link>
        </div>
      </header>

      {/* --------------------------------------------------
          MESSAGE
      -------------------------------------------------- */}

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

      {/* --------------------------------------------------
          FORM
      -------------------------------------------------- */}

      <form
        action={updateProductAction}
      >
        <input
          type="hidden"
          name="product_id"
          value={product.id}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(0, 1fr) 350px",
            gap: "18px",
            alignItems: "start",
          }}
        >
          {/* =================================================
              LEFT COLUMN
          ================================================= */}

          <div
            style={{
              display: "grid",
              gap: "18px",
            }}
          >
            {/* PRODUCT DETAILS */}

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
                  defaultValue={
                    product.title
                  }
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
                  defaultValue={
                    product.slug
                  }
                  style={inputStyle}
                />

                <p
                  style={helpTextStyle}
                >
                  Used in the public product
                  page address.
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
                  defaultValue={
                    product.excerpt || ""
                  }
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
                  defaultValue={
                    product.body || ""
                  }
                  placeholder="Describe the product, its ingredients, benefits, and suggested use."
                  style={textareaStyle}
                />
              </div>
            </section>

            {/* =================================================
                PURCHASE + BUY BUTTON
            ================================================= */}

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

                {product.buy_url ? (
                  <span
                    style={readyBadgeStyle}
                  >
                    ✓ Storefront Ready
                  </span>
                ) : (
                  <span
                    style={automaticBadgeStyle}
                  >
                    Needs Buy Link
                  </span>
                )}
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
                USANA storefront for this
                product. WonderfulLife will
                use it for the public Buy
                button.
              </p>

              <div
                style={storefrontGridStyle}
              >
                {/* STOREFRONT */}

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
                    defaultValue={
                      managerValues.owner
                    }
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

                {/* PRODUCT ID */}

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
                    defaultValue={
                      managerValues.productId
                    }
                    placeholder="Example: 122-020104"
                    style={inputStyle}
                  />

                  <p
                    style={helpTextStyle}
                  >
                    Enter the Product ID from
                    the USANA product URL.
                  </p>
                </div>

                {/* URL NAME */}

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
                    defaultValue={
                      managerValues.productSlug
                    }
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

              {/* OPTIONAL MANUAL URL */}

              <div
                style={{
                  marginTop: "18px",
                }}
              >
                <label
                  htmlFor="manual_buy_url"
                  style={labelStyle}
                >
                  Paste Personalized Purchase
                  URL — Optional
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
                  Leave this blank if the
                  Storefront, Product ID and
                  URL Name above are correct.
                  If you paste a personalized
                  USANA product URL here, it
                  will override those fields
                  and WonderfulLife will
                  detect the values
                  automatically.
                </p>
              </div>

              {/* CURRENT BUY URL */}

              <div
                style={buyInfoStyle}
              >
                <strong
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    color:
                      colors.greenDark,
                    fontSize: "12px",
                  }}
                >
                  Current Purchase URL
                </strong>

                {product.buy_url ? (
                  <>
                    <div
                      style={{
                        overflowWrap:
                          "anywhere",
                        color:
                          colors.muted,
                        fontSize: "12px",
                        lineHeight: 1.55,
                      }}
                    >
                      {product.buy_url}
                    </div>

                    <a
                      href={
                        product.buy_url
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display:
                          "inline-flex",
                        marginTop: "10px",
                        color:
                          colors.green,
                        fontSize: "12px",
                        fontWeight: 900,
                        textDecoration:
                          "none",
                      }}
                    >
                      Test Buy Link ↗
                    </a>
                  </>
                ) : (
                  <span
                    style={{
                      color: "#9a7139",
                      fontSize: "12px",
                      fontWeight: 800,
                    }}
                  >
                    No personalized Buy link
                    has been configured yet.
                  </span>
                )}
              </div>

              <div
                style={{
                  marginTop: "12px",
                  padding: "11px 13px",
                  borderRadius: "9px",
                  background: "#ffffff",
                  border:
                    "1px solid #e0e8df",
                }}
              >
                <span
                  style={{
                    color: colors.muted,
                    fontSize: "11px",
                    lineHeight: 1.55,
                  }}
                >
                  To remove an existing
                  storefront link, clear both
                  the USANA Product ID and
                  USANA URL Name, leave the
                  manual URL blank, and save
                  the product.
                </span>
              </div>
            </section>
          </div>

          {/* =================================================
              RIGHT COLUMN
          ================================================= */}

          <aside
            style={{
              display: "grid",
              gap: "18px",
            }}
          >
            {/* PRODUCT IMAGE */}

            <section
              style={panelStyle}
            >
              <h2
                style={sectionTitleStyle}
              >
                Product Image
              </h2>

              <ProductImageUpload
                defaultImageUrl={
                  product.image_url || ""
                }
              />

              <p
                style={{
                  ...helpTextStyle,
                  marginTop: "12px",
                  textAlign: "center",
                }}
              >
                Replace or remove the current
                image, then click Save Changes.
              </p>
            </section>

            {/* RESOURCE CENTER */}

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
                  defaultValue={
                    product.video_url || ""
                  }
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

            {/* ORGANIZATION */}

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
                  defaultValue={
                    product.category || ""
                  }
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

            {/* PUBLISHING */}

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
                  defaultValue={
                    product.status || "draft"
                  }
                  style={inputStyle}
                >
                  <option value="draft">
                    Draft
                  </option>

                  <option value="published">
                    Published
                  </option>

                  <option value="archived">
                    Archived
                  </option>
                </select>
              </div>

              <label
                style={{
                  display: "flex",
                  alignItems:
                    "flex-start",
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
                  defaultChecked={Boolean(
                    product.featured
                  )}
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

            {/* SAVE */}

            <button
              type="submit"
              style={submitButtonStyle}
            >
              Save Changes
            </button>

            {/* USANA MANAGER */}

            <Link
              href="/studio/products/usana-manager"
              style={secondaryButtonFullStyle}
            >
              USANA Product Manager
            </Link>

            {/* CANCEL */}

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

/* =======================================================
   STYLES
======================================================= */

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
  background: "#fff5df",
  color: "#9a6719",
  fontSize: "10px",
  fontWeight: 900,
} as const;

const readyBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  padding: "6px 10px",
  borderRadius: "999px",
  background: "#e7f6eb",
  color: "#18703a",
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

const secondaryButtonFullStyle = {
  ...secondaryButtonStyle,
  width: "100%",
  boxSizing: "border-box",
} as const;

const cancelButtonStyle = {
  ...secondaryButtonStyle,
  width: "100%",
  boxSizing: "border-box",
} as const;