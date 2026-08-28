import Link from "next/link";

import ContentCard from "@/components/ContentCard";
import { getPublishedContent } from "@/lib/content";

export const metadata = {
  title: "Search | WonderfulLife.ca",
  description:
    "Search WonderfulLife recipes, wellness guidance, nutrition, videos and more.",
};

type SearchParams = {
  q?: string;
  category?: string;
  type?: string;
};

function buildSearchUrl({
  q,
  category,
  type,
}: {
  q?: string;
  category?: string;
  type?: string;
}) {
  const params = new URLSearchParams();

  if (q) params.set("q", q);
  if (category) params.set("category", category);
  if (type) params.set("type", type);

  const query = params.toString();

  return query ? `/search?${query}` : "/search";
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const searchTerm = params.q?.trim() || "";
  const category = params.category?.trim() || "";
  const type = params.type?.trim() || "";

  const hasSearch = Boolean(searchTerm || category || type);

  const items = hasSearch
    ? await getPublishedContent({
        q: searchTerm || undefined,
        category: category || undefined,
        type: type || undefined,
        limit: 60,
      })
    : [];

  /*
   * Select a background image from the current search results.
   * A new search can therefore display a different relevant image.
   */
  const heroImages = items
    .map((item) => item.image_url)
    .filter((image): image is string => Boolean(image));

  const heroImage =
    heroImages.length > 0
      ? heroImages[Math.floor(Math.random() * heroImages.length)]
      : null;

  const activeTab =
    type === "recipe"
      ? "recipes"
      : type === "video"
        ? "videos"
        : category.toLowerCase() === "wellness"
          ? "wellness"
          : category.toLowerCase() === "nutrition"
            ? "nutrition"
            : "all";

  const tabs = [
    {
      label: "All",
      id: "all",
      href: buildSearchUrl({
        q: searchTerm || undefined,
      }),
    },
    {
      label: "Wellness",
      id: "wellness",
      href: buildSearchUrl({
        q: searchTerm || undefined,
        category: "wellness",
      }),
    },
    {
      label: "Nutrition",
      id: "nutrition",
      href: buildSearchUrl({
        q: searchTerm || undefined,
        category: "nutrition",
      }),
    },
    {
      label: "Recipes",
      id: "recipes",
      href: buildSearchUrl({
        q: searchTerm || undefined,
        type: "recipe",
      }),
    },
    {
      label: "Videos",
      id: "videos",
      href: buildSearchUrl({
        q: searchTerm || undefined,
        type: "video",
      }),
    },
  ];

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#fbfcfa",
      }}
    >
      {/* SEARCH HERO */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        {/* Bright clean background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(120deg, #f7faf6 0%, #ffffff 48%, #f4f8f5 100%)",
          }}
        />

        {/* Dynamic faded search image */}
        {heroImage ? (
          <div
            key={`${searchTerm}-${heroImage}`}
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url("${heroImage}")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 0.2,
              animation: "searchHeroFade 800ms ease-out both",
            }}
          />
        ) : null}

        {/* White veil for maximum readability */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(255,255,255,.94) 0%, rgba(255,255,255,.78) 50%, rgba(255,255,255,.94) 100%)",
          }}
        />

        {/* HERO CONTENT */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            width: "100%",
            maxWidth: "1180px",
            margin: "0 auto",
            padding: "34px 24px 24px",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "900px",
              margin: "0 auto",
              textAlign: "center",
            }}
          >
            <h1
              style={{
                margin: 0,
                color: "#123f2d",
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: "clamp(44px, 5vw, 72px)",
                fontWeight: 500,
                lineHeight: 1.05,
                letterSpacing: "-0.035em",
              }}
            >
              Search WonderfulLife
            </h1>

            <p
              style={{
                maxWidth: "700px",
                margin: "20px auto 0",
                color: "rgba(18,35,27,0.68)",
                fontSize: "18px",
                lineHeight: 1.6,
              }}
            >
              Find recipes, wellness advice, nutrition tips, videos and more.
            </p>

            {/* SEARCH BAR */}
            <form
              action="/search"
              method="get"
              style={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                maxWidth: "850px",
                margin: "20px auto 0",
                padding: "8px",
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: "999px",
                background: "#ffffff",
                boxShadow: "0 16px 45px rgba(25,60,40,0.10)",
                boxSizing: "border-box",
              }}
            >
              {category ? (
                <input
                  type="hidden"
                  name="category"
                  value={category}
                />
              ) : null}

              {type ? (
                <input
                  type="hidden"
                  name="type"
                  value={type}
                />
              ) : null}

              {/* CSS MAGNIFYING GLASS */}
              <span
                aria-hidden="true"
                style={{
                  marginLeft: "18px",
                  width: "22px",
                  height: "22px",
                  minWidth: "22px",
                  display: "inline-block",
                  position: "relative",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    width: "13px",
                    height: "13px",
                    border: "2px solid #173f2e",
                    borderRadius: "50%",
                    left: "1px",
                    top: "1px",
                    boxSizing: "border-box",
                  }}
                />

                <span
                  style={{
                    position: "absolute",
                    width: "8px",
                    height: "2px",
                    background: "#173f2e",
                    transform: "rotate(45deg)",
                    transformOrigin: "left center",
                    left: "13px",
                    top: "14px",
                    borderRadius: "2px",
                  }}
                />
              </span>

              <input
                type="search"
                name="q"
                defaultValue={searchTerm}
                placeholder="What are you looking for?"
                aria-label="Search WonderfulLife"
                style={{
                  flex: 1,
                  minWidth: 0,
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  padding: "16px 18px",
                  color: "#17251e",
                  fontSize: "18px",
                  lineHeight: 1.3,
                }}
              />

              <button
                type="submit"
                style={{
                  flexShrink: 0,
                  border: "none",
                  borderRadius: "999px",
                  background: "#075d3d",
                  color: "#ffffff",
                  padding: "16px 34px",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: 700,
                }}
              >
                Search
              </button>
            </form>

            {/* FILTERS */}
            <nav
              aria-label="Search categories"
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px 22px",
                marginTop: "14px",
              }}
            >
              {tabs.map((tab) => {
                const selected = activeTab === tab.id;

                return (
                  <Link
                    key={tab.id}
                    href={tab.href}
                    style={{
                      position: "relative",
                      padding: "9px 8px",
                      color: selected
                        ? "#075d3d"
                        : "rgba(20,35,28,0.62)",
                      textDecoration: "none",
                      fontSize: "15px",
                      fontWeight: selected ? 700 : 500,
                      borderBottom: selected
                        ? "2px solid #075d3d"
                        : "2px solid transparent",
                    }}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </section>

      {/* SEARCH RESULTS */}
      {hasSearch ? (
        <section
          style={{
            width: "100%",
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "22px 24px 70px",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              marginBottom: "30px",
            }}
          >
            <h2
              style={{
                margin: 0,
                color: "#123f2d",
                fontSize: "30px",
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              {searchTerm
                ? `Results for “${searchTerm}”`
                : "Search Results"}
            </h2>

            <p
              style={{
                margin: "8px 0 0",
                color: "rgba(0,0,0,0.5)",
                fontSize: "15px",
              }}
            >
              {items.length}{" "}
              {items.length === 1 ? "result" : "results"} found
            </p>
          </div>

          {items.length ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "28px",
              }}
            >
              {items.map((item) => (
                <ContentCard
                  key={item.id}
                  item={item}
                />
              ))}
            </div>
          ) : (
            <div
              style={{
                padding: "60px 24px",
                border: "1px solid rgba(0,0,0,0.06)",
                borderRadius: "28px",
                background: "#ffffff",
                textAlign: "center",
                boxShadow:
                  "0 12px 40px rgba(30,60,40,0.06)",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  color: "#123f2d",
                  fontSize: "26px",
                  fontWeight: 700,
                }}
              >
                No results found
              </h3>

              <p
                style={{
                  maxWidth: "520px",
                  margin: "12px auto 0",
                  color: "rgba(0,0,0,0.55)",
                  lineHeight: 1.6,
                }}
              >
                Try another word or choose a different category.
              </p>
            </div>
          )}
        </section>
      ) : (
        <div style={{ height: "120px" }} />
      )}

      <style>{`
        @keyframes searchHeroFade {
          from {
            opacity: 0;
            transform: scale(1.015);
          }

          to {
            opacity: 0.20;
            transform: scale(1);
          }
        }

        @media (max-width: 640px) {
          form[action="/search"] button {
            padding-left: 22px !important;
            padding-right: 22px !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          [style*="searchHeroFade"] {
            animation: none !important;
          }
        }
      `}</style>
    </main>
  );
}