import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

type AnalyticsEvent = {
  id: number;
  event_type: string;
  user_id: string | null;
  page_path: string | null;
  content_id: number | null;
  content_type: string | null;
  source: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

type CommentRow = {
  id: number;
  content_item_id: number;
  user_id: string;
  content: string;
  created_at: string;
  is_hidden: boolean;
  is_pinned: boolean;
};

type LeadRow = {
  id: number;
  name: string;
  subject: string | null;
  message: string | null;
  is_read: boolean;
  created_at: string;
};

type MessageRow = {
  id: number;
  name: string;
  recipient: string;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
};

type ContentRow = {
  id: number;
  title: string;
  slug: string | null;
  type: string | null;
};

type LikeRow = {
  id: number;
  content_item_id: number;
};

type PurchaseRow = {
  id: number;
  event_label: string | null;
  product_name: string | null;
  amount_cents: number | null;
  created_at: string;
};

type ProfileRow = {
  id: string;
  display_name: string | null;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-CA").format(value);
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatShortDate(value: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
  }).format(value);
}

function truncate(value: string, length = 90) {
  if (!value) {
    return "";
  }

  if (value.length <= length) {
    return value;
  }

  return `${value.slice(0, length)}…`;
}

function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "WL";
  }

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${parts[0][0]}${
    parts[parts.length - 1][0]
  }`.toUpperCase();
}

function normalizePath(value: string) {
  const clean = value
    .split("?")[0]
    .split("#")[0];

  if (clean === "/") {
    return "/";
  }

  return clean.replace(/\/+$/, "") || "/";
}

function normalizeSlug(value: string) {
  let decoded = value;

  try {
    decoded = decodeURIComponent(value);
  } catch {
    decoded = value;
  }

  return decoded
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, "");
}

function findContentIdFromPath(
  pagePath: string,
  slugToContentId: Map<string, number>
) {
  const cleanPath = normalizePath(pagePath);

  if (cleanPath === "/") {
    return null;
  }

  const segments = cleanPath
    .split("/")
    .filter(Boolean)
    .map((segment) =>
      normalizeSlug(segment)
    );

  for (
    let index = segments.length - 1;
    index >= 0;
    index -= 1
  ) {
    const contentId =
      slugToContentId.get(
        segments[index]
      );

    if (contentId !== undefined) {
      return contentId;
    }
  }

  return null;
}

function pageLabel(path: string) {
  if (path === "/") {
    return "Homepage";
  }

  if (path === "/energy-reset") {
    return "Energy Reset";
  }

  if (path === "/recipes") {
    return "Recipes";
  }

  if (path === "/wellness") {
    return "Wellness";
  }

  if (path === "/shop") {
    return "Shop";
  }

  if (path === "/ask-zoey") {
    return "Ask Zoey";
  }

  if (
    path ===
    "/guides/energy-reset/success"
  ) {
    return "Energy Reset Success";
  }

  return path;
}

function eventLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    );
}

function recipientLabel(value: string) {
  if (value === "zoey") {
    return "Zoey";
  }

  if (value === "nick") {
    return "Nick";
  }

  return "General";
}

function contentTypeLabel(
  value: string | null
) {
  if (!value) {
    return "Content";
  }

  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}

function contentTypeClass(
  value: string | null
) {
  switch (value?.toLowerCase()) {
    case "recipe":
      return "analytics-type analytics-type--recipe";

    case "video":
      return "analytics-type analytics-type--video";

    case "article":
      return "analytics-type analytics-type--article";

    case "product":
      return "analytics-type analytics-type--product";

    default:
      return "analytics-type analytics-type--default";
  }
}

async function getCount(
  supabase: any,
  table: string,
  configure?: (query: any) => any
) {
  let query = supabase
    .from(table)
    .select("*", {
      count: "exact",
      head: true,
    });

  if (configure) {
    query = configure(query);
  }

  const { count, error } =
    await query;

  if (error) {
    console.error(
      `Count failed for ${table}:`,
      error.message
    );

    return 0;
  }

  return count ?? 0;
}

export default async function AnalyticsPage() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (
    !supabaseUrl ||
    !serviceRoleKey
  ) {
    return (
      <div className="studio-card">
        <div
          style={{
            padding: 24,
            color: "#a84747",
          }}
        >
          Analytics server configuration
          is missing.
        </div>
      </div>
    );
  }

  const supabase = createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

  const now = new Date();

  const startOfToday =
    new Date(now);

  startOfToday.setHours(
    0,
    0,
    0,
    0
  );

  const thirtyDaysAgo =
    new Date(now);

  thirtyDaysAgo.setDate(
    thirtyDaysAgo.getDate() - 29
  );

  thirtyDaysAgo.setHours(
    0,
    0,
    0,
    0
  );

  const [
    todayViewsResult,
    thirtyDayViewsResult,
    totalViewsResult,
    totalLikes,
    totalComments,
    totalLeads,
    totalMessages,
    unreadLeads,
    unreadMessages,
    energyResetViewsResult,
    checkoutStartsResult,
    recentEventsResult,
    recentCommentsResult,
    recentLeadsResult,
    recentMessagesResult,
    topPageEventsResult,
    chartEventsResult,
    purchaseResult,
    likesResult,
    contentResult,
  ] = await Promise.all([
    supabase
      .from("analytics_events")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq(
        "event_type",
        "page_view"
      )
      .neq(
        "page_path",
        "/studio"
      )
      .not(
        "page_path",
        "like",
        "/studio/%"
      )
      .gte(
        "created_at",
        startOfToday.toISOString()
      ),

    supabase
      .from("analytics_events")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq(
        "event_type",
        "page_view"
      )
      .neq(
        "page_path",
        "/studio"
      )
      .not(
        "page_path",
        "like",
        "/studio/%"
      )
      .gte(
        "created_at",
        thirtyDaysAgo.toISOString()
      ),

    supabase
      .from("analytics_events")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq(
        "event_type",
        "page_view"
      )
      .neq(
        "page_path",
        "/studio"
      )
      .not(
        "page_path",
        "like",
        "/studio/%"
      ),

    getCount(
      supabase,
      "content_likes"
    ),

    getCount(
      supabase,
      "content_comments"
    ),

    getCount(
      supabase,
      "website_leads"
    ),

    getCount(
      supabase,
      "contact_messages"
    ),

    getCount(
      supabase,
      "website_leads",
      (query) =>
        query.eq(
          "is_read",
          false
        )
    ),

    getCount(
      supabase,
      "contact_messages",
      (query) =>
        query.eq(
          "is_read",
          false
        )
    ),

    supabase
      .from("analytics_events")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq(
        "event_type",
        "page_view"
      )
      .eq(
        "page_path",
        "/energy-reset"
      ),

    supabase
      .from("analytics_events")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq(
        "event_type",
        "checkout_start"
      ),

    supabase
      .from("analytics_events")
      .select(
        "id,event_type,user_id,page_path,content_id,content_type,source,metadata,created_at"
      )
      .neq(
        "page_path",
        "/studio"
      )
      .not(
        "page_path",
        "like",
        "/studio/%"
      )
      .order(
        "created_at",
        {
          ascending: false,
        }
      )
      .limit(20),

    supabase
      .from("content_comments")
      .select(
        "id,content_item_id,user_id,content,created_at,is_hidden,is_pinned"
      )
      .order(
        "created_at",
        {
          ascending: false,
        }
      )
      .limit(8),

    supabase
      .from("website_leads")
      .select(
        "id,name,subject,message,is_read,created_at"
      )
      .order(
        "created_at",
        {
          ascending: false,
        }
      )
      .limit(6),

    supabase
      .from("contact_messages")
      .select(
        "id,name,recipient,subject,message,is_read,created_at"
      )
      .order(
        "created_at",
        {
          ascending: false,
        }
      )
      .limit(8),

    supabase
      .from("analytics_events")
      .select("page_path")
      .eq(
        "event_type",
        "page_view"
      )
      .neq(
        "page_path",
        "/studio"
      )
      .not(
        "page_path",
        "like",
        "/studio/%"
      )
      .gte(
        "created_at",
        thirtyDaysAgo.toISOString()
      )
      .not(
        "page_path",
        "is",
        null
      )
      .limit(10000),

    supabase
      .from("analytics_events")
      .select("created_at")
      .eq(
        "event_type",
        "page_view"
      )
      .neq(
        "page_path",
        "/studio"
      )
      .not(
        "page_path",
        "like",
        "/studio/%"
      )
      .gte(
        "created_at",
        thirtyDaysAgo.toISOString()
      )
      .order(
        "created_at",
        {
          ascending: true,
        }
      )
      .limit(10000),

    supabase
      .from("admin_events")
      .select(
        "id,event_label,product_name,amount_cents,created_at"
      )
      .eq(
        "event_type",
        "purchase"
      )
      .order(
        "created_at",
        {
          ascending: false,
        }
      ),

    supabase
      .from("content_likes")
      .select(
        "id,content_item_id"
      )
      .limit(10000),

    supabase
      .from("content_items")
      .select(
        "id,title,slug,type"
      )
      .limit(2000),
  ]);

  const todayViews =
    todayViewsResult.count ?? 0;

  const thirtyDayViews =
    thirtyDayViewsResult.count ?? 0;

  const totalViews =
    totalViewsResult.count ?? 0;

  const energyResetViews =
    energyResetViewsResult.count ?? 0;

  const checkoutStarts =
    checkoutStartsResult.count ?? 0;

  const recentEvents =
    (recentEventsResult.data as
      | AnalyticsEvent[]
      | null) ?? [];

  const recentComments =
    (recentCommentsResult.data as
      | CommentRow[]
      | null) ?? [];

  const recentLeads =
    (recentLeadsResult.data as
      | LeadRow[]
      | null) ?? [];

  const recentMessages =
    (recentMessagesResult.data as
      | MessageRow[]
      | null) ?? [];

  const purchases =
    (purchaseResult.data as
      | PurchaseRow[]
      | null) ?? [];

  const likes =
    (likesResult.data as
      | LikeRow[]
      | null) ?? [];

  const contentItems =
    (contentResult.data as
      | ContentRow[]
      | null) ?? [];

  const totalRevenueCents =
    purchases.reduce(
      (total, purchase) =>
        total +
        (purchase.amount_cents ??
          0),
      0
    );

  const totalRevenue =
    totalRevenueCents / 100;

  const contentMap =
    new Map<
      number,
      ContentRow
    >();

  const slugToContentId =
    new Map<string, number>();

  for (
    const item of contentItems
  ) {
    contentMap.set(
      item.id,
      item
    );

    if (item.slug) {
      slugToContentId.set(
        normalizeSlug(
          item.slug
        ),
        item.id
      );
    }
  }

  const commenterIds =
    Array.from(
      new Set(
        recentComments
          .map(
            (comment) =>
              comment.user_id
          )
          .filter(Boolean)
      )
    );

  const profileMap =
    new Map<
      string,
      ProfileRow
    >();

  if (
    commenterIds.length > 0
  ) {
    const profilesResult =
      await supabase
        .from("profiles")
        .select(
          "id,display_name"
        )
        .in(
          "id",
          commenterIds
        );

    const profiles =
      (profilesResult.data as
        | ProfileRow[]
        | null) ?? [];

    for (
      const profile of profiles
    ) {
      profileMap.set(
        profile.id,
        profile
      );
    }
  }

  const pageCounts =
    new Map<
      string,
      number
    >();

  for (
    const row of
      topPageEventsResult.data ??
      []
  ) {
    if (!row.page_path) {
      continue;
    }

    const path =
      normalizePath(
        row.page_path
      );

    if (
      path === "/studio" ||
      path.startsWith(
        "/studio/"
      )
    ) {
      continue;
    }

    pageCounts.set(
      path,
      (pageCounts.get(path) ??
        0) + 1
    );
  }

  const topPages =
    Array.from(
      pageCounts.entries()
    )
      .sort(
        (a, b) =>
          b[1] - a[1]
      )
      .slice(0, 7);

  const contentViews =
    new Map<
      number,
      number
    >();

  const contentLikes =
    new Map<
      number,
      number
    >();

  const contentComments =
    new Map<
      number,
      number
    >();

  const contentViewResult =
    await supabase
      .from("analytics_events")
      .select(
        "content_id,page_path"
      )
      .eq(
        "event_type",
        "page_view"
      )
      .neq(
        "page_path",
        "/studio"
      )
      .not(
        "page_path",
        "like",
        "/studio/%"
      )
      .gte(
        "created_at",
        thirtyDaysAgo.toISOString()
      )
      .limit(10000);

  for (
    const row of
      contentViewResult.data ??
      []
  ) {
    let contentId =
      typeof row.content_id ===
      "number"
        ? row.content_id
        : null;

    if (
      contentId === null &&
      row.page_path
    ) {
      contentId =
        findContentIdFromPath(
          row.page_path,
          slugToContentId
        );
    }

    if (
      contentId === null
    ) {
      continue;
    }

    contentViews.set(
      contentId,
      (contentViews.get(
        contentId
      ) ?? 0) + 1
    );
  }

  for (
    const like of likes
  ) {
    contentLikes.set(
      like.content_item_id,
      (contentLikes.get(
        like.content_item_id
      ) ?? 0) + 1
    );
  }

  const commentCountsResult =
    await supabase
      .from("content_comments")
      .select(
        "content_item_id"
      )
      .limit(10000);

  for (
    const row of
      commentCountsResult.data ??
      []
  ) {
    if (
      typeof row.content_item_id !==
      "number"
    ) {
      continue;
    }

    contentComments.set(
      row.content_item_id,
      (contentComments.get(
        row.content_item_id
      ) ?? 0) + 1
    );
  }

  const topContent =
    contentItems
      .map((item) => ({
        ...item,
        views:
          contentViews.get(
            item.id
          ) ?? 0,
        likes:
          contentLikes.get(
            item.id
          ) ?? 0,
        comments:
          contentComments.get(
            item.id
          ) ?? 0,
      }))
      .sort((a, b) => {
        if (
          b.views !== a.views
        ) {
          return (
            b.views - a.views
          );
        }

        if (
          b.comments !==
          a.comments
        ) {
          return (
            b.comments -
            a.comments
          );
        }

        return (
          b.likes - a.likes
        );
      })
      .slice(0, 6);

  const chartCounts =
    new Map<
      string,
      number
    >();

  for (
    let index = 0;
    index < 30;
    index += 1
  ) {
    const date =
      new Date(
        thirtyDaysAgo
      );

    date.setDate(
      thirtyDaysAgo.getDate() +
        index
    );

    chartCounts.set(
      date
        .toISOString()
        .slice(0, 10),
      0
    );
  }

  for (
    const row of
      chartEventsResult.data ??
      []
  ) {
    const key =
      new Date(
        row.created_at
      )
        .toISOString()
        .slice(0, 10);

    if (
      !chartCounts.has(key)
    ) {
      continue;
    }

    chartCounts.set(
      key,
      (chartCounts.get(key) ??
        0) + 1
    );
  }

  const chartData =
    Array.from(
      chartCounts.entries()
    );

  const maxChartValue =
    Math.max(
      1,
      ...chartData.map(
        ([, value]) =>
          value
      )
    );

  const chartPoints =
    chartData
      .map(
        (
          [, value],
          index
        ) => {
          const x =
            chartData.length <= 1
              ? 0
              : (index /
                  (chartData.length -
                    1)) *
                100;

          const y =
            90 -
            (value /
              maxChartValue) *
              72;

          return `${x},${y}`;
        }
      )
      .join(" ");

  const chartAreaPoints =
    chartData.length > 0
      ? `0,100 ${chartPoints} 100,100`
      : "";

  const maxTopPageCount =
    topPages[0]?.[1] ?? 1;

  const kpis = [
    {
      label: "Page Views",
      value: formatNumber(
        thirtyDayViews
      ),
      note: `${formatNumber(
        todayViews
      )} today`,
      icon: "◉",
      tone: "green",
    },
    {
      label: "Energy Reset",
      value: formatNumber(
        energyResetViews
      ),
      note: "Landing views",
      icon: "↗",
      tone: "gold",
    },
    {
      label: "Likes",
      value: formatNumber(
        totalLikes
      ),
      note: "Content likes",
      icon: "♥",
      tone: "rose",
    },
    {
      label: "Comments",
      value: formatNumber(
        totalComments
      ),
      note: "Community",
      icon: "●",
      tone: "blue",
    },
    {
      label: "Leads",
      value: formatNumber(
        totalLeads
      ),
      note:
        unreadLeads > 0
          ? `${unreadLeads} new`
          : "Join Our Team",
      icon: "◎",
      tone: "violet",
    },
    {
      label: "Messages",
      value: formatNumber(
        totalMessages
      ),
      note:
        unreadMessages > 0
          ? `${unreadMessages} unread`
          : "Inbox clear",
      icon: "✉",
      tone: "cyan",
    },
    {
      label: "Sales",
      value: formatNumber(
        purchases.length
      ),
      note: formatMoney(
        totalRevenue
      ),
      icon: "$",
      tone: "mint",
    },
  ];

  return (
    <div className="analytics-page">
      {/* HEADER */}

      <header className="analytics-header">
        <div className="analytics-header__content">
          <p className="analytics-header__eyebrow">
            Wonderful-Life Studio
          </p>

          <h1 className="analytics-header__title">
            Analytics Dashboard
          </h1>

          <p className="analytics-header__description">
            Your audience, content and
            communications at a glance
          </p>
        </div>

        <div className="analytics-header__actions">
          <div className="analytics-period">
            <span className="analytics-period__icon">
              ◷
            </span>

            <span>
              Last 30 days
            </span>

            <span className="analytics-period__arrow">
              ▾
            </span>
          </div>

          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="analytics-website-button"
          >
            View on Website
            <span>↗</span>
          </a>
        </div>
      </header>

      {/* KPI STRIP */}

      <section className="analytics-kpi-grid">
        {kpis.map((kpi) => {
          const showBadge =
            (kpi.label ===
              "Messages" &&
              unreadMessages > 0) ||
            (kpi.label ===
              "Leads" &&
              unreadLeads > 0);

          const badgeValue =
            kpi.label ===
            "Messages"
              ? unreadMessages
              : unreadLeads;

          return (
            <article
              key={kpi.label}
              className={`analytics-kpi analytics-kpi--${kpi.tone}`}
            >
              <div className="analytics-kpi__top">
                <div className="analytics-kpi__icon">
                  {kpi.icon}
                </div>

                {showBadge && (
                  <span className="analytics-kpi__badge">
                    {badgeValue}
                  </span>
                )}
              </div>

              <div className="analytics-kpi__label">
                {kpi.label}
              </div>

              <div className="analytics-kpi__value">
                {kpi.value}
              </div>

              <div className="analytics-kpi__note">
                {kpi.note}
              </div>
            </article>
          );
        })}
      </section>

      {/* CHART + TOP CONTENT */}

      <section className="analytics-main-grid">
        <article className="analytics-card analytics-chart-card">
          <div className="analytics-chart-card__header">
            <div>
              <h2 className="analytics-card__title">
                Visitor Activity
              </h2>

              <p className="analytics-card__description">
                Public page views ·
                Studio activity excluded
              </p>
            </div>

            <div className="analytics-chart-card__total">
              <div className="analytics-chart-card__number">
                {formatNumber(
                  thirtyDayViews
                )}
              </div>

              <div className="analytics-chart-card__today">
                {formatNumber(
                  todayViews
                )}{" "}
                today
              </div>
            </div>
          </div>

          <div className="analytics-chart-legend">
            <span className="analytics-chart-legend__item">
              <span className="analytics-chart-legend__dot" />
              Page Views
            </span>

            <span>
              Last 30 days
            </span>
          </div>

          <div className="analytics-chart">
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-label="Page views over the last 30 days"
            >
              <defs>
                <linearGradient
                  id="analyticsArea"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#6da36b"
                    stopOpacity="0.24"
                  />

                  <stop
                    offset="100%"
                    stopColor="#6da36b"
                    stopOpacity="0.02"
                  />
                </linearGradient>
              </defs>

              {chartAreaPoints && (
                <polygon
                  points={
                    chartAreaPoints
                  }
                  fill="url(#analyticsArea)"
                />
              )}

              <polyline
                points={chartPoints}
                fill="none"
                stroke="#34794c"
                strokeWidth="2.25"
                vectorEffect="non-scaling-stroke"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="analytics-chart__dates">
            <span>
              {formatShortDate(
                thirtyDaysAgo
              )}
            </span>

            <span>
              {formatShortDate(now)}
            </span>
          </div>
        </article>

        <article className="analytics-card">
          <div className="analytics-card__header">
            <div>
              <h2 className="analytics-card__title">
                Top Content
              </h2>

              <p className="analytics-card__description">
                Best-performing content
              </p>
            </div>

            <span className="analytics-card__pill">
              30 DAYS
            </span>
          </div>

          <div className="analytics-table">
            <div className="analytics-table__head">
              <div>Content</div>
              <div>Type</div>
              <div
                style={{
                  textAlign: "right",
                }}
              >
                Views
              </div>
              <div
                style={{
                  textAlign: "right",
                }}
              >
                Likes
              </div>
            </div>

            {topContent.map(
              (item, index) => (
                <div
                  key={item.id}
                  className="analytics-table__row"
                >
                  <div className="analytics-table__content">
                    <div className="analytics-table__rank">
                      {index + 1}
                    </div>

                    <div className="analytics-table__copy">
                      <div className="analytics-table__title">
                        {item.title}
                      </div>

                      <div className="analytics-table__meta">
                        {formatNumber(
                          item.comments
                        )}{" "}
                        comments
                      </div>
                    </div>
                  </div>

                  <div>
                    <span
                      className={contentTypeClass(
                        item.type
                      )}
                    >
                      {contentTypeLabel(
                        item.type
                      )}
                    </span>
                  </div>

                  <div className="analytics-table__number">
                    {formatNumber(
                      item.views
                    )}
                  </div>

                  <div className="analytics-table__number analytics-table__number--soft">
                    {formatNumber(
                      item.likes
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        </article>
      </section>

      {/* COMMENTS + MESSAGES */}

      <section className="analytics-communication-grid">
        <article className="analytics-card">
          <div className="analytics-card__header">
            <div>
              <h2 className="analytics-card__title">
                Recent Comments
              </h2>

              <p className="analytics-card__description">
                Latest community
                conversations
              </p>
            </div>

            <span className="analytics-card__pill">
              {formatNumber(
                totalComments
              )}{" "}
              TOTAL
            </span>
          </div>

          {recentComments.length ===
          0 ? (
            <div className="analytics-inbox-empty">
              <div className="analytics-inbox-empty__icon">
                ●
              </div>

              <strong>
                No comments yet
              </strong>

              <p>
                New community comments
                will appear here.
              </p>
            </div>
          ) : (
            recentComments
              .slice(0, 4)
              .map((comment) => {
                const contentItem =
                  contentMap.get(
                    comment.content_item_id
                  );

                const profile =
                  profileMap.get(
                    comment.user_id
                  );

                const commenterName =
                  profile?.display_name?.trim() ||
                  "Member";

                return (
                  <div
                    key={comment.id}
                    className="analytics-comment"
                  >
                    <div className="analytics-avatar">
                      {getInitials(
                        commenterName
                      )}
                    </div>

                    <div className="analytics-comment__body">
                      <div className="analytics-comment__top">
                        <div
                          style={{
                            minWidth: 0,
                          }}
                        >
                          <div className="analytics-comment__name">
                            {
                              commenterName
                            }
                          </div>

                          <div className="analytics-comment__content-title">
                            {contentItem
                              ?.title ??
                              `Content #${comment.content_item_id}`}
                          </div>
                        </div>

                        <div className="analytics-comment__date">
                          {formatDate(
                            comment.created_at
                          )}
                        </div>
                      </div>

                      <p className="analytics-comment__text">
                        “
                        {truncate(
                          comment.content,
                          120
                        )}
                        ”
                      </p>

                      <div className="analytics-comment__statuses">
                        {comment.is_hidden ? (
                          <span className="analytics-status analytics-status--hidden">
                            HIDDEN
                          </span>
                        ) : (
                          <span className="analytics-status analytics-status--visible">
                            VISIBLE
                          </span>
                        )}

                        {comment.is_pinned && (
                          <span className="analytics-status analytics-status--pinned">
                            PINNED
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
          )}
        </article>

        <article className="analytics-card">
          <div className="analytics-card__header">
            <div>
              <h2 className="analytics-card__title">
                Messages & Leads
              </h2>

              <p className="analytics-card__description">
                Website enquiries and
                opportunities
              </p>
            </div>

            {unreadMessages +
              unreadLeads >
              0 && (
              <span className="analytics-kpi__badge">
                {unreadMessages +
                  unreadLeads}
              </span>
            )}
          </div>

          {recentMessages.length ===
            0 &&
          recentLeads.length ===
            0 ? (
            <div className="analytics-inbox-empty">
              <div className="analytics-inbox-empty__icon">
                ✉
              </div>

              <strong>
                Inbox is clear
              </strong>

              <p>
                New website messages and
                Join Our Team leads will
                appear here.
              </p>
            </div>
          ) : (
            <>
              {recentMessages
                .slice(0, 4)
                .map((message) => (
                  <div
                    key={`message-${message.id}`}
                    className="analytics-inbox-item"
                  >
                    <span
                      className={
                        message.is_read
                          ? "analytics-inbox-dot"
                          : "analytics-inbox-dot analytics-inbox-dot--new"
                      }
                    />

                    <div
                      style={{
                        minWidth: 0,
                      }}
                    >
                      <div className="analytics-inbox-item__name">
                        {message.name}
                      </div>

                      <div className="analytics-inbox-item__subject">
                        {message.subject ||
                          truncate(
                            message.message,
                            70
                          )}
                      </div>

                      <div className="analytics-inbox-item__type">
                        Message · To{" "}
                        {recipientLabel(
                          message.recipient
                        )}
                      </div>
                    </div>

                    <div className="analytics-inbox-item__date">
                      {formatDate(
                        message.created_at
                      )}
                    </div>
                  </div>
                ))}

              {recentLeads
                .slice(0, 3)
                .map((lead) => (
                  <div
                    key={`lead-${lead.id}`}
                    className="analytics-inbox-item"
                  >
                    <span
                      className={
                        lead.is_read
                          ? "analytics-inbox-dot"
                          : "analytics-inbox-dot analytics-inbox-dot--lead"
                      }
                    />

                    <div
                      style={{
                        minWidth: 0,
                      }}
                    >
                      <div className="analytics-inbox-item__name">
                        {lead.name}
                      </div>

                      <div className="analytics-inbox-item__subject">
                        {lead.subject ||
                          lead.message ||
                          "Join Our Team lead"}
                      </div>

                      <div className="analytics-inbox-item__type analytics-inbox-item__type--lead">
                        LEAD
                      </div>
                    </div>

                    <div className="analytics-inbox-item__date">
                      {formatDate(
                        lead.created_at
                      )}
                    </div>
                  </div>
                ))}
            </>
          )}
        </article>
      </section>

      {/* BOTTOM ROW */}

      <section className="analytics-bottom-grid">
        <article className="analytics-card analytics-bottom-card">
          <div className="analytics-bottom-card__header">
            <div>
              <h2 className="analytics-card__title">
                Sales & Conversions
              </h2>

              <p className="analytics-card__description">
                14-Day Energy Reset
              </p>
            </div>

            <span className="analytics-card__pill">
              {formatMoney(
                totalRevenue
              )}
            </span>
          </div>

          <div className="analytics-funnel-metrics">
            <div className="analytics-funnel-metric">
              <div className="analytics-funnel-metric__label">
                Views
              </div>

              <div className="analytics-funnel-metric__value">
                {formatNumber(
                  energyResetViews
                )}
              </div>
            </div>

            <div className="analytics-funnel-metric analytics-funnel-metric--checkout">
              <div className="analytics-funnel-metric__label">
                Checkout
              </div>

              <div className="analytics-funnel-metric__value">
                {formatNumber(
                  checkoutStarts
                )}
              </div>
            </div>

            <div className="analytics-funnel-metric analytics-funnel-metric--sales">
              <div className="analytics-funnel-metric__label">
                Sales
              </div>

              <div className="analytics-funnel-metric__value">
                {formatNumber(
                  purchases.length
                )}
              </div>
            </div>
          </div>

          <div className="analytics-funnel-line">
            <span className="analytics-funnel-line__dot" />
            <span className="analytics-funnel-line__bar" />

            <span className="analytics-funnel-line__dot analytics-funnel-line__dot--checkout" />
            <span className="analytics-funnel-line__bar" />

            <span className="analytics-funnel-line__dot analytics-funnel-line__dot--sales" />
          </div>

          <div className="analytics-funnel-note">
            Checkout tracking was enabled
            after page-view and purchase
            tracking. Historical purchases
            are shown for reference, so a
            conversion rate is not
            displayed yet.
          </div>
        </article>

        <article className="analytics-card analytics-bottom-card">
          <div className="analytics-bottom-card__header">
            <div>
              <h2 className="analytics-card__title">
                Where People Are Going
              </h2>

              <p className="analytics-card__description">
                Most visited public pages
              </p>
            </div>
          </div>

          <div className="analytics-pages-list">
            {topPages
              .slice(0, 5)
              .map(
                (
                  [path, count],
                  index
                ) => (
                  <div
                    key={path}
                    className="analytics-page-row"
                  >
                    <div className="analytics-page-row__top">
                      <span className="analytics-page-row__rank">
                        {index + 1}
                      </span>

                      <span className="analytics-page-row__name">
                        {pageLabel(
                          path
                        )}
                      </span>

                      <span className="analytics-page-row__count">
                        {formatNumber(
                          count
                        )}
                      </span>
                    </div>

                    <div className="analytics-page-row__track">
                      <div
                        className="analytics-page-row__bar"
                        style={{
                          width: `${Math.max(
                            5,
                            (count /
                              maxTopPageCount) *
                              100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                )
              )}
          </div>
        </article>

        <article className="analytics-card">
          <div className="analytics-card__header">
            <div>
              <h2 className="analytics-card__title">
                Recent Activity
              </h2>

              <p className="analytics-card__description">
                Latest public website
                events
              </p>
            </div>
          </div>

          <div className="analytics-activity-list">
            {recentEvents
              .slice(0, 6)
              .map((event) => (
                <div
                  key={event.id}
                  className="analytics-activity"
                >
                  <span
                    className={
                      event.event_type ===
                      "checkout_start"
                        ? "analytics-activity__dot analytics-activity__dot--checkout"
                        : "analytics-activity__dot"
                    }
                  />

                  <div
                    style={{
                      minWidth: 0,
                    }}
                  >
                    <div className="analytics-activity__type">
                      {eventLabel(
                        event.event_type
                      )}
                    </div>

                    <div className="analytics-activity__page">
                      {event.page_path
                        ? pageLabel(
                            event.page_path
                          )
                        : "Wonderful-Life"}
                    </div>
                  </div>

                  <div className="analytics-activity__date">
                    {formatDate(
                      event.created_at
                    )}
                  </div>
                </div>
              ))}
          </div>
        </article>
      </section>

      <footer className="analytics-footer">
        <span>
          Wonderful-Life first-party
          analytics
        </span>

        <span>•</span>

        <span>Supabase</span>

        <span>•</span>

        <span>
          {formatNumber(
            totalViews
          )}{" "}
          recorded public page views
        </span>

        <span>•</span>

        <span>
          Studio activity excluded
        </span>
      </footer>
    </div>
  );
}