import Link from "next/link";
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

  if (path === "/eat-better-reset") {
    return "Eat Better Reset";
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
    eatBetterResetViewsResult,
    energyResetBuyClicksResult,
    eatBetterResetBuyClicksResult,
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
        "page_view"
      )
      .eq(
        "page_path",
        "/eat-better-reset"
      ),

    supabase
      .from("analytics_events")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq(
        "event_type",
        "buy_click"
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
        "buy_click"
      )
      .eq(
        "page_path",
        "/eat-better-reset"
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

  const eatBetterResetViews =
    eatBetterResetViewsResult.count ?? 0;

  const energyResetBuyClicks =
    energyResetBuyClicksResult.count ?? 0;

  const eatBetterResetBuyClicks =
    eatBetterResetBuyClicksResult.count ?? 0;

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

  function purchaseSearchText(
    purchase: PurchaseRow
  ) {
    return [
      purchase.product_name,
      purchase.event_label,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
  }

  const eatBetterPurchases =
    purchases.filter((purchase) => {
      const text =
        purchaseSearchText(purchase);

      return (
        text.includes("eat better") ||
        text.includes("eat-better") ||
        text.includes("eat_better")
      );
    });

  const energyResetPurchases =
    purchases.filter((purchase) => {
      const text =
        purchaseSearchText(purchase);

      if (
        text.includes("eat better") ||
        text.includes("eat-better") ||
        text.includes("eat_better")
      ) {
        return false;
      }

      return (
        text.includes("energy reset") ||
        text.includes("energy-reset") ||
        text.includes("energy_reset")
      );
    });

  const energyResetRevenueCents =
    energyResetPurchases.reduce(
      (total, purchase) =>
        total +
        (purchase.amount_cents ?? 0),
      0
    );

  const eatBetterResetRevenueCents =
    eatBetterPurchases.reduce(
      (total, purchase) =>
        total +
        (purchase.amount_cents ?? 0),
      0
    );

  const totalRevenueCents =
    purchases.reduce(
      (total, purchase) =>
        total +
        (purchase.amount_cents ?? 0),
      0
    );

  const energyResetRevenue =
    energyResetRevenueCents / 100;

  const eatBetterResetRevenue =
    eatBetterResetRevenueCents / 100;

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
           <Link
  key={kpi.label}
  href={kpi.label === "Messages" ? "/studio/messages" : "#"}
  className={`analytics-kpi analytics-kpi--${kpi.tone}`}
  style={{
    textDecoration: "none",
    color: "inherit",
    cursor: kpi.label === "Messages" ? "pointer" : "default",
    pointerEvents: kpi.label === "Messages" ? "auto" : "none",
  }}
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
            </Link>
          );
        })}
      </section>
            {/* TRAFFIC OVERVIEW */}

      <section className="analytics-main-grid">
        <article className="analytics-card analytics-traffic-card">
          <div className="analytics-card__header">
            <div>
              <h2 className="analytics-card__title">
                Traffic Overview
              </h2>

              <p className="analytics-card__subtitle">
                Public page views over the last 30 days
              </p>
            </div>

            <div className="analytics-card__metric">
              <strong>
                {formatNumber(thirtyDayViews)}
              </strong>
              <span>views</span>
            </div>
          </div>

          <div className="analytics-chart">
            <div className="analytics-chart__labels">
              <span>
                {formatNumber(maxChartValue)}
              </span>

              <span>
                {formatNumber(
                  Math.round(
                    maxChartValue * 0.5
                  )
                )}
              </span>

              <span>0</span>
            </div>

            <div className="analytics-chart__canvas">
              <div className="analytics-chart__grid analytics-chart__grid--top" />
              <div className="analytics-chart__grid analytics-chart__grid--middle" />
              <div className="analytics-chart__grid analytics-chart__grid--bottom" />

              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="analytics-chart__svg"
                aria-label="Traffic over the last 30 days"
              >
                <defs>
                  <linearGradient
                    id="trafficGradient"
                    x1="0"
                    x2="0"
                    y1="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="currentColor"
                      stopOpacity="0.22"
                    />

                    <stop
                      offset="100%"
                      stopColor="currentColor"
                      stopOpacity="0"
                    />
                  </linearGradient>
                </defs>

                {chartAreaPoints && (
                  <polygon
                    points={
                      chartAreaPoints
                    }
                    className="analytics-chart__area"
                    fill="url(#trafficGradient)"
                  />
                )}

                {chartPoints && (
                  <polyline
                    points={chartPoints}
                    className="analytics-chart__line"
                    vectorEffect="non-scaling-stroke"
                  />
                )}
              </svg>
            </div>
          </div>

          <div className="analytics-chart__dates">
            <span>
              {formatShortDate(
                thirtyDaysAgo
              )}
            </span>

            <span>
              {formatShortDate(
                new Date(
                  thirtyDaysAgo.getTime() +
                    14 *
                      24 *
                      60 *
                      60 *
                      1000
                )
              )}
            </span>

            <span>
              {formatShortDate(now)}
            </span>
          </div>

          <div className="analytics-traffic-summary">
            <div>
              <span className="analytics-traffic-summary__label">
                Today
              </span>

              <strong>
                {formatNumber(
                  todayViews
                )}
              </strong>
            </div>

            <div>
              <span className="analytics-traffic-summary__label">
                Last 30 days
              </span>

              <strong>
                {formatNumber(
                  thirtyDayViews
                )}
              </strong>
            </div>

            <div>
              <span className="analytics-traffic-summary__label">
                All time
              </span>

              <strong>
                {formatNumber(
                  totalViews
                )}
              </strong>
            </div>
          </div>
        </article>

        {/* TOP CONTENT */}

        <article className="analytics-card analytics-top-content-card">
          <div className="analytics-card__header">
            <div>
              <h2 className="analytics-card__title">
                Top Content
              </h2>

              <p className="analytics-card__subtitle">
                Most viewed content in the last 30 days
              </p>
            </div>
          </div>

          <div className="analytics-top-content">
            {topContent.length ===
            0 ? (
              <div className="analytics-empty">
                No content activity yet.
              </div>
            ) : (
              topContent.map(
                (item, index) => (
                  <div
                    key={item.id}
                    className="analytics-content-row"
                  >
                    <div className="analytics-content-row__rank">
                      {index + 1}
                    </div>

                    <div className="analytics-content-row__main">
                      <div className="analytics-content-row__title-line">
                        <span className="analytics-content-row__title">
                          {item.title}
                        </span>

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

                      <div className="analytics-content-row__stats">
                        <span>
                          ◉{" "}
                          {formatNumber(
                            item.views
                          )}{" "}
                          views
                        </span>

                        <span>
                          ♥{" "}
                          {formatNumber(
                            item.likes
                          )}
                        </span>

                        <span>
                          ●{" "}
                          {formatNumber(
                            item.comments
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              )
            )}
          </div>
        </article>
      </section>

      {/* COMMENTS / LEADS / MESSAGES */}

      <section className="analytics-communication-grid">
        <article className="analytics-card">
          <div className="analytics-card__header">
            <div>
              <h2 className="analytics-card__title">
                Latest Comments
              </h2>

              <p className="analytics-card__subtitle">
                Recent community activity
              </p>
            </div>

            <span className="analytics-card__count">
              {formatNumber(
                totalComments
              )}
            </span>
          </div>

          <div className="analytics-feed">
            {recentComments.length ===
            0 ? (
              <div className="analytics-empty">
                No comments yet.
              </div>
            ) : (
              recentComments.map(
                (comment) => {
                  const contentItem =
                    contentMap.get(
                      comment.content_item_id
                    );

                  const profile =
                    profileMap.get(
                      comment.user_id
                    );

                  const displayName =
                    profile?.display_name ||
                    "Member";

                  return (
                    <div
                      key={comment.id}
                      className="analytics-feed-item"
                    >
                      <div className="analytics-avatar">
                        {getInitials(
                          displayName
                        )}
                      </div>

                      <div className="analytics-feed-item__content">
                        <div className="analytics-feed-item__top">
                          <strong>
                            {
                              displayName
                            }
                          </strong>

                          <span>
                            {formatDate(
                              comment.created_at
                            )}
                          </span>
                        </div>

                        <p>
                          {truncate(
                            comment.content,
                            100
                          )}
                        </p>

                        {contentItem && (
                          <small>
                            On:{" "}
                            {
                              contentItem.title
                            }
                          </small>
                        )}
                      </div>
                    </div>
                  );
                }
              )
            )}
          </div>
        </article>

        <article className="analytics-card">
          <div className="analytics-card__header">
            <div>
              <h2 className="analytics-card__title">
                Join Our Team Leads
              </h2>

              <p className="analytics-card__subtitle">
                Latest opportunity inquiries
              </p>
            </div>

            {unreadLeads > 0 && (
              <span className="analytics-unread-pill">
                {unreadLeads} new
              </span>
            )}
          </div>

          <div className="analytics-feed">
            {recentLeads.length ===
            0 ? (
              <div className="analytics-empty">
                No leads yet.
              </div>
            ) : (
              recentLeads.map(
                (lead) => (
                  <div
                    key={lead.id}
                    className={`analytics-feed-item ${
                      !lead.is_read
                        ? "analytics-feed-item--unread"
                        : ""
                    }`}
                  >
                    <div className="analytics-avatar analytics-avatar--lead">
                      {getInitials(
                        lead.name
                      )}
                    </div>

                    <div className="analytics-feed-item__content">
                      <div className="analytics-feed-item__top">
                        <strong>
                          {lead.name}
                        </strong>

                        <span>
                          {formatDate(
                            lead.created_at
                          )}
                        </span>
                      </div>

                      {lead.subject && (
                        <small className="analytics-feed-item__subject">
                          {lead.subject}
                        </small>
                      )}

                      {lead.message && (
                        <p>
                          {truncate(
                            lead.message,
                            100
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                )
              )
            )}
          </div>
        </article>

        <article className="analytics-card">
          <div className="analytics-card__header">
            <div>
              <h2 className="analytics-card__title">
                Messages
              </h2>

              <p className="analytics-card__subtitle">
                Latest contact messages
              </p>
            </div>

            {unreadMessages >
              0 && (
              <span className="analytics-unread-pill">
                {unreadMessages} unread
              </span>
            )}
          </div>

          <div className="analytics-feed">
            {recentMessages.length ===
            0 ? (
              <div className="analytics-empty">
                No messages yet.
              </div>
            ) : (
              recentMessages.map(
                (message) => (
                  <div
                    key={message.id}
                    className={`analytics-feed-item ${
                      !message.is_read
                        ? "analytics-feed-item--unread"
                        : ""
                    }`}
                  >
                    <div className="analytics-avatar analytics-avatar--message">
                      {getInitials(
                        message.name
                      )}
                    </div>

                    <div className="analytics-feed-item__content">
                      <div className="analytics-feed-item__top">
                        <strong>
                          {
                            message.name
                          }
                        </strong>

                        <span>
                          {formatDate(
                            message.created_at
                          )}
                        </span>
                      </div>

                      <small className="analytics-feed-item__subject">
                        To:{" "}
                        {recipientLabel(
                          message.recipient
                        )}
                        {message.subject
                          ? ` · ${message.subject}`
                          : ""}
                      </small>

                      <p>
                        {truncate(
                          message.message,
                          100
                        )}
                      </p>
                    </div>
                  </div>
                )
              )
            )}
          </div>
        </article>
      </section>

      {/* SALES AND CONVERSIONS */}

      <section className="analytics-bottom-grid">
        <article className="analytics-card analytics-bottom-card">
          <div className="analytics-card__header">
            <div>
              <h2 className="analytics-card__title">
                Sales &amp; Conversions
              </h2>

              <p className="analytics-card__subtitle">
                14-Day Energy Reset
              </p>
            </div>

            <span className="analytics-revenue-pill">
              {formatMoney(
                energyResetRevenue
              )}
            </span>
          </div>

          <div className="analytics-funnel">
            <div className="analytics-funnel-metrics">
              <div>
                <strong>
                  {formatNumber(
                    energyResetViews
                  )}
                </strong>
                <span>Views</span>
              </div>

              <div>
                <strong>
                  {formatNumber(
                    energyResetBuyClicks
                  )}
                </strong>
                <span>
                  Buy Clicks
                </span>
              </div>

              <div>
                <strong>
                  {formatNumber(
                    energyResetPurchases.length
                  )}
                </strong>
                <span>Sales</span>
              </div>
            </div>

            <div className="analytics-funnel-line">
              <span className="analytics-funnel-dot analytics-funnel-dot--active" />
              <span className="analytics-funnel-segment" />
              <span className="analytics-funnel-dot analytics-funnel-dot--active" />
              <span className="analytics-funnel-segment" />
              <span className="analytics-funnel-dot analytics-funnel-dot--active" />
            </div>

            <div className="analytics-funnel-note">
              <strong>
                Revenue:{" "}
                {formatMoney(
                  energyResetRevenue
                )}
              </strong>
              <span>
                Historical purchases
                are shown separately
                from newer buy-click
                tracking.
              </span>
            </div>
          </div>
        </article>

        <article className="analytics-card analytics-bottom-card">
          <div className="analytics-card__header">
            <div>
              <h2 className="analytics-card__title">
                Sales &amp; Conversions
              </h2>

              <p className="analytics-card__subtitle">
                The 14-Day Eat Better
                Reset Plan
              </p>
            </div>

            <span className="analytics-revenue-pill">
              {formatMoney(
                eatBetterResetRevenue
              )}
            </span>
          </div>

          <div className="analytics-funnel">
            <div className="analytics-funnel-metrics">
              <div>
                <strong>
                  {formatNumber(
                    eatBetterResetViews
                  )}
                </strong>
                <span>Views</span>
              </div>

              <div>
                <strong>
                  {formatNumber(
                    eatBetterResetBuyClicks
                  )}
                </strong>
                <span>
                  Buy Clicks
                </span>
              </div>

              <div>
                <strong>
                  {formatNumber(
                    eatBetterPurchases.length
                  )}
                </strong>
                <span>Sales</span>
              </div>
            </div>

            <div className="analytics-funnel-line">
              <span className="analytics-funnel-dot analytics-funnel-dot--active" />
              <span className="analytics-funnel-segment" />
              <span className="analytics-funnel-dot analytics-funnel-dot--active" />
              <span className="analytics-funnel-segment" />
              <span className="analytics-funnel-dot analytics-funnel-dot--active" />
            </div>

            <div className="analytics-funnel-note">
              <strong>
                Revenue:{" "}
                {formatMoney(
                  eatBetterResetRevenue
                )}
              </strong>
              <span>
                Eat Better purchases
                are tracked independently
                from Energy Reset.
              </span>
            </div>
          </div>
        </article>
                {/* WHERE PEOPLE ARE GOING */}

        <article className="analytics-card analytics-bottom-card">
          <div className="analytics-card__header">
            <div>
              <h2 className="analytics-card__title">
                Where People Are Going
              </h2>

              <p className="analytics-card__subtitle">
                Most visited public pages in the last 30 days
              </p>
            </div>
          </div>

          <div className="analytics-page-list">
            {topPages.length === 0 ? (
              <div className="analytics-empty">
                No page-view data yet.
              </div>
            ) : (
              topPages.map(
                ([path, count], index) => {
                  const percentage =
                    maxTopPageCount > 0
                      ? Math.max(
                          4,
                          (count /
                            maxTopPageCount) *
                            100
                        )
                      : 0;

                  return (
                    <div
                      key={path}
                      className="analytics-page-row"
                    >
                      <div className="analytics-page-row__top">
                        <div className="analytics-page-row__name">
                          <span className="analytics-page-row__rank">
                            {index + 1}
                          </span>

                          <span>
                            {pageLabel(
                              path
                            )}
                          </span>
                        </div>

                        <strong>
                          {formatNumber(
                            count
                          )}
                        </strong>
                      </div>

                      <div className="analytics-page-row__bar">
                        <span
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                }
              )
            )}
          </div>
        </article>

        {/* RECENT ACTIVITY */}

        <article className="analytics-card analytics-bottom-card">
          <div className="analytics-card__header">
            <div>
              <h2 className="analytics-card__title">
                Recent Activity
              </h2>

              <p className="analytics-card__subtitle">
                Latest website events
              </p>
            </div>
          </div>

          <div className="analytics-activity-list">
            {recentEvents.length ===
            0 ? (
              <div className="analytics-empty">
                No recent activity yet.
              </div>
            ) : (
              recentEvents
                .slice(0, 10)
                .map((event) => {
                  const contentItem =
                    event.content_id
                      ? contentMap.get(
                          event.content_id
                        )
                      : null;

                  let activityTitle =
                    eventLabel(
                      event.event_type
                    );

                  let activityDetail =
                    "";

                  if (
                    event.event_type ===
                    "page_view"
                  ) {
                    activityTitle =
                      "Page View";

                    activityDetail =
                      event.page_path
                        ? pageLabel(
                            normalizePath(
                              event.page_path
                            )
                          )
                        : "Website";
                  } else if (
                    event.event_type ===
                    "buy_click"
                  ) {
                    activityTitle =
                      "Buy Click";

                    activityDetail =
                      event.page_path
                        ? pageLabel(
                            normalizePath(
                              event.page_path
                            )
                          )
                        : "Product";
                  } else if (
                    contentItem
                  ) {
                    activityDetail =
                      contentItem.title;
                  } else if (
                    event.page_path
                  ) {
                    activityDetail =
                      pageLabel(
                        normalizePath(
                          event.page_path
                        )
                      );
                  }

                  return (
                    <div
                      key={event.id}
                      className="analytics-activity-item"
                    >
                      <div className="analytics-activity-item__dot" />

                      <div className="analytics-activity-item__content">
                        <div className="analytics-activity-item__top">
                          <strong>
                            {
                              activityTitle
                            }
                          </strong>

                          <span>
                            {formatDate(
                              event.created_at
                            )}
                          </span>
                        </div>

                        {activityDetail && (
                          <small>
                            {
                              activityDetail
                            }
                          </small>
                        )}
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </article>
      </section>

      {/* FOOTER SUMMARY */}

      <section className="analytics-summary-strip">
        <div className="analytics-summary-strip__item">
          <span>
            Public Page Views
          </span>

          <strong>
            {formatNumber(
              totalViews
            )}
          </strong>
        </div>

        <div className="analytics-summary-strip__divider" />

        <div className="analytics-summary-strip__item">
          <span>
            Total Sales
          </span>

          <strong>
            {formatNumber(
              purchases.length
            )}
          </strong>
        </div>

        <div className="analytics-summary-strip__divider" />

        <div className="analytics-summary-strip__item">
          <span>
            Total Revenue
          </span>

          <strong>
            {formatMoney(
              totalRevenue
            )}
          </strong>
        </div>

        <div className="analytics-summary-strip__divider" />

        <div className="analytics-summary-strip__item">
          <span>
            Eat Better Views
          </span>

          <strong>
            {formatNumber(
              eatBetterResetViews
            )}
          </strong>
        </div>
      </section>
    </div>
  );
}