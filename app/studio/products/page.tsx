import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "../../../lib/supabase/server";

type Product = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string | null;
  status: string | null;
  image_url: string | null;
  video_url: string | null;
  featured: boolean | null;
  created_at: string;
  updated_at: string | null;
};

type ProductsPageProps = {
  searchParams: Promise<{
    message?: string;
  }>;
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
  yellowSoft: "#fff5d8",
  yellowText: "#735c16",
  redSoft: "#fff0f0",
  red: "#9f3838",
};

async function deleteProductAction(formData: FormData) {
  "use server";

  const productId = Number(formData.get("product_id"));
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
        "The product ID is missing."
      )}`
    );
  }

  const { error } = await supabase
    .from("content_items")
    .delete()
    .eq("id", productId)
    .eq("type", "product")
    .eq("created_by", user.id);

  if (error) {
    redirect(
      `/studio/products?message=${encodeURIComponent(error.message)}`
    );
  }

  redirect(
    `/studio/products?message=${encodeURIComponent(
      "Product deleted successfully."
    )}`
  );
}

export default async function StudioProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data: products, error } = await supabase
    .from("content_items")
    .select(
      `
        id,
        title,
        slug,
        excerpt,
        category,
        status,
        image_url,
        video_url,
        featured,
        created_at,
        updated_at
      `
    )
    .eq("type", "product")
    
    .order("created_at", { ascending: false });

  const productList = (products || []) as Product[];

  const publishedCount = productList.filter(
    (product) => product.status === "published"
  ).length;

  const draftCount = productList.filter(
    (product) => product.status !== "published"
  ).length;

  const featuredCount = productList.filter(
    (product) => product.featured
  ).length;

  const message = params.message || "";

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
          gap: "18px",
          alignItems: "flex-end",
          justifyContent: "space-between",
          flexWrap: "wrap",
          marginBottom: "20px",
        }}
      >
        <div>
          <p style={eyebrowStyle}>WonderfulLife Product Studio</p>

          <h1
            style={{
              margin: "8px 0 0",
              fontSize: "34px",
              lineHeight: 1.1,
            }}
          >
            Product Library
          </h1>

          <p
            style={{
              margin: "7px 0 0",
              color: colors.muted,
              fontSize: "14px",
            }}
          >
            Create, organize, edit, and publish educational USANA product
            pages.
          </p>
        </div>

        <Link href="/studio/products/new" style={createButtonStyle}>
          + Create New Product
        </Link>
      </header>

      {message ? (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px 14px",
            border: `1px solid ${colors.border}`,
            borderRadius: "10px",
            background: colors.greenSoft,
            color: colors.green,
            fontSize: "13px",
            fontWeight: 800,
          }}
        >
          ✓ {message}
        </div>
      ) : null}

      {error ? (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px 14px",
            border: "1px solid #e7c9c9",
            borderRadius: "10px",
            background: colors.redSoft,
            color: colors.red,
            fontSize: "13px",
            fontWeight: 700,
          }}
        >
          Unable to load products: {error.message}
        </div>
      ) : null}

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: "12px",
          marginBottom: "18px",
        }}
      >
        <StatCard label="Total Products" value={productList.length} />
        <StatCard label="Published" value={publishedCount} />
        <StatCard label="Drafts" value={draftCount} />
        <StatCard label="Featured" value={featuredCount} />
      </section>

      {productList.length === 0 ? (
        <section
          style={{
            padding: "64px 24px",
            border: `1px dashed ${colors.border}`,
            borderRadius: "16px",
            background: colors.panel,
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "grid",
              width: "62px",
              height: "62px",
              margin: "0 auto",
              placeItems: "center",
              borderRadius: "50%",
              background: colors.greenSoft,
              fontSize: "30px",
            }}
          >
            🌿
          </div>

          <h2
            style={{
              margin: "18px 0 0",
              fontSize: "26px",
              color: colors.text,
            }}
          >
            No products saved yet
          </h2>

          <p
            style={{
              maxWidth: "540px",
              margin: "10px auto 0",
              color: colors.muted,
              fontSize: "14px",
              lineHeight: 1.6,
            }}
          >
            Create your first USANA product page with a hero image, product
            description, main ingredients, uses, and wellness benefits.
          </p>

          <Link
            href="/studio/products/new"
            style={{
              ...createButtonStyle,
              display: "inline-flex",
              marginTop: "22px",
            }}
          >
            Create Your First Product
          </Link>
        </section>
      ) : (
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "16px",
          }}
        >
          {productList.map((product) => {
            const lastUpdated = new Date(
              product.updated_at || product.created_at
            ).toLocaleDateString("en-CA", {
              year: "numeric",
              month: "short",
              day: "numeric",
            });

            const isPublished = product.status === "published";

            return (
              <article
                key={product.id}
                style={{
                  overflow: "hidden",
                  border: `1px solid ${colors.border}`,
                  borderRadius: "15px",
                  background: colors.panel,
                }}
              >
                <div
                  style={{
                    position: "relative",
                    aspectRatio: "16 / 9",
                    overflow: "hidden",
                    background: "#edf1eb",
                  }}
                >
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        display: "grid",
                        width: "100%",
                        height: "100%",
                        placeItems: "center",
                        fontSize: "48px",
                      }}
                    >
                      🌱
                    </div>
                  )}

                  <div
                    style={{
                      position: "absolute",
                      top: "12px",
                      left: "12px",
                      display: "flex",
                      gap: "7px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        padding: "5px 9px",
                        borderRadius: "999px",
                        background: isPublished
                          ? colors.greenSoft
                          : colors.yellowSoft,
                        color: isPublished
                          ? colors.green
                          : colors.yellowText,
                        fontSize: "10px",
                        fontWeight: 900,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                      }}
                    >
                      {isPublished ? "Published" : "Draft"}
                    </span>

                    {product.featured ? (
                      <span
                        style={{
                          padding: "5px 9px",
                          borderRadius: "999px",
                          background: "#ffffff",
                          color: colors.green,
                          fontSize: "10px",
                          fontWeight: 900,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                        }}
                      >
                        Featured
                      </span>
                    ) : null}
                  </div>
                </div>

                <div style={{ padding: "18px" }}>
                  <p
                    style={{
                      margin: 0,
                      color: colors.green,
                      fontSize: "11px",
                      fontWeight: 900,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    {product.category || "USANA Product"}
                  </p>

                  <h2
                    style={{
                      margin: "8px 0 0",
                      color: colors.text,
                      fontSize: "21px",
                      lineHeight: 1.3,
                    }}
                  >
                    {product.title}
                  </h2>

                  <p
                    style={{
                      minHeight: "66px",
                      margin: "10px 0 0",
                      color: colors.muted,
                      fontSize: "13px",
                      lineHeight: 1.6,
                    }}
                  >
                    {product.excerpt ||
                      "No short product description has been added."}
                  </p>

                  <p
                    style={{
                      margin: "14px 0 0",
                      color: colors.muted,
                      fontSize: "11px",
                    }}
                  >
                    Last updated {lastUpdated}
                  </p>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isPublished
                        ? "repeat(2, minmax(0, 1fr))"
                        : "1fr",
                      gap: "8px",
                      marginTop: "16px",
                    }}
                  >
                    <Link
                      href={`/studio/products/edit/${product.id}`}
                      style={editButtonStyle}
                    >
                      Edit Product
                    </Link>

                    {isPublished ? (
                      <Link
                        href={`/shop/${product.slug}`}
                        style={viewButtonStyle}
                      >
                        View Product
                      </Link>
                    ) : null}

                    {product.video_url ? (
                      <a
                        href={product.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          ...watchVideoButtonStyle,
                          gridColumn: "1 / -1",
                        }}
                      >
                        <span aria-hidden="true">▶</span>
                        Watch Product Video
                      </a>
                    ) : null}

                    <form
                      action={deleteProductAction}
                      style={{
                        gridColumn: "1 / -1",
                      }}
                    >
                      <input
                        type="hidden"
                        name="product_id"
                        value={product.id}
                      />

                      <button
                        type="submit"
                        style={deleteButtonStyle}
                      >
                        Delete Product
                      </button>
                    </form>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div
      style={{
        padding: "16px",
        border: `1px solid ${colors.border}`,
        borderRadius: "13px",
        background: colors.panel,
      }}
    >
      <p
        style={{
          margin: 0,
          color: colors.muted,
          fontSize: "10px",
          fontWeight: 900,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </p>

      <p
        style={{
          margin: "7px 0 0",
          color: colors.text,
          fontSize: "28px",
          fontWeight: 900,
        }}
      >
        {value}
      </p>
    </div>
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

const createButtonStyle = {
  alignItems: "center",
  justifyContent: "center",
  padding: "11px 15px",
  border: "none",
  borderRadius: "9px",
  background: colors.green,
  color: "#ffffff",
  fontSize: "13px",
  fontWeight: 900,
  textDecoration: "none",
} as const;

const editButtonStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px 12px",
  borderRadius: "8px",
  background: colors.green,
  color: "#ffffff",
  fontSize: "12px",
  fontWeight: 900,
  textDecoration: "none",
} as const;

const viewButtonStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px 12px",
  border: `1px solid ${colors.border}`,
  borderRadius: "8px",
  background: "#ffffff",
  color: colors.green,
  fontSize: "12px",
  fontWeight: 900,
  textDecoration: "none",
} as const;

const watchVideoButtonStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  width: "100%",
  padding: "11px 12px",
  border: "none",
  borderRadius: "8px",
  background: "#2563eb",
  color: "#ffffff",
  fontSize: "13px",
  fontWeight: 900,
  textDecoration: "none",
  boxSizing: "border-box",
  boxShadow: "0 6px 16px rgba(37, 99, 235, 0.18)",
} as const;

const deleteButtonStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #e7c9c9",
  borderRadius: "8px",
  background: colors.redSoft,
  color: colors.red,
  fontFamily: "inherit",
  fontSize: "12px",
  fontWeight: 900,
  cursor: "pointer",
} as const;