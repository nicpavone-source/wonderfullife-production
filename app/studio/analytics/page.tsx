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
  parent_id: number | null;
  created_at: string;
  is_hidden: boolean;
  is_pinned: boolean;
};

type LeadRow = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  source: string | null;
  page_path: string | null;
  subject: string | null;
  message: string | null;
  status: string;
  assigned_to: string | null;
  is_read: boolean;
  created_at: string;
};

type MessageRow = {
  id: number;
  name: string;
  email: string;
  recipient: string;
  subject: string | null;
  message: string;
  page_path: string | null;
  status: string;
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
  created_at: string;
};

type PurchaseRow = {
  id: number;
  event_type: string;
  event_label: string | null;
  user_email: string | null;
  product_name: string | null;
  amount_cents: number | null;
  currency: string | null;
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

function truncate(value: string, length = 80) {
  if (!value) return "";
  if (value.length <= length) return value;
  return `${value.slice(0, length)}…`;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "WL";

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function normalizePath(value: string) {
  const clean = value.split("?")[0].split("#")[0];

  if (clean === "/") return "/";

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
    .map((segment) => normalizeSlug(segment));

  for (let index = segments.length - 1; index >= 0; index -= 1) {
    const contentId = slugToContentId.get(segments[index]);

    if (contentId !== undefined) {
      return contentId;
    }
  }

  return null;
}

function pageLabel(path: string) {
  if (path === "/") return "Homepage /";
  return path;
}

function eventLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function recipientLabel(value: string) {
  if (value === "zoey") return "Zoey";
  if (value === "nick") return "Nick";
  return "General";
}

function contentTypeLabel(value: string | null) {
  if (!value) return "Content";

  return value.charAt(0).toUpperCase() + value.slice(1);
}

async function getCount(
  supabase: any,
  table: string,
  configure?: (query: any) => any
) {
  let query = supabase
    .from(table)
    .select("*", { count: "exact", head: true });

  if (configure) {
    query = configure(query);
  }

  const { count, error } = await query;

  if (error) {
    console.error(`Count failed for ${table}:`, error.message);
    return 0;
  }

  return count ?? 0;
}

export default async function AnalyticsPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold text-slate-900">
            Analytics Dashboard
          </h1>

          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            Analytics server configuration is missing.
          </div>
        </div>
      </main>
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const now = new Date();

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

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
      .select("*", { count: "exact", head: true })
      .eq("event_type", "page_view")
      .neq("page_path", "/studio")
      .not("page_path", "like", "/studio/%")
      .gte("created_at", startOfToday.toISOString()),

    supabase
      .from("analytics_events")
      .select("*", { count: "exact", head: true })
      .eq("event_type", "page_view")
      .neq("page_path", "/studio")
      .not("page_path", "like", "/studio/%")
      .gte("created_at", thirtyDaysAgo.toISOString()),

    supabase
      .from("analytics_events")
      .select("*", { count: "exact", head: true })
      .eq("event_type", "page_view")
      .neq("page_path", "/studio")
      .not("page_path", "like", "/studio/%"),

    getCount(supabase, "content_likes"),

    getCount(supabase, "content_comments"),

    getCount(supabase, "website_leads"),

    getCount(supabase, "contact_messages"),

    getCount(supabase, "website_leads", (query) =>
      query.eq("is_read", false)
    ),

    getCount(supabase, "contact_messages", (query) =>
      query.eq("is_read", false)
    ),

    supabase
      .from("analytics_events")
      .select(
        "id,event_type,user_id,page_path,content_id,content_type,source,metadata,created_at"
      )
      .neq("page_path", "/studio")
      .not("page_path", "like", "/studio/%")
      .order("created_at", { ascending: false })
      .limit(12),

    supabase
      .from("content_comments")
      .select(
        "id,content_item_id,user_id,content,parent_id,created_at,is_hidden,is_pinned"
      )
      .order("created_at", { ascending: false })
      .limit(8),

    supabase
      .from("website_leads")
      .select(
        "id,name,email,phone,source,page_path,subject,message,status,assigned_to,is_read,created_at"
      )
      .order("created_at", { ascending: false })
      .limit(6),

    supabase
      .from("contact_messages")
      .select(
        "id,name,email,recipient,subject,message,page_path,status,is_read,created_at"
      )
      .order("created_at", { ascending: false })
      .limit(8),

    supabase
      .from("analytics_events")
      .select("page_path")
      .eq("event_type", "page_view")
      .neq("page_path", "/studio")
      .not("page_path", "like", "/studio/%")
      .gte("created_at", thirtyDaysAgo.toISOString())
      .not("page_path", "is", null)
      .limit(10000),

    supabase
      .from("analytics_events")
      .select("created_at")
      .eq("event_type", "page_view")
      .neq("page_path", "/studio")
      .not("page_path", "like", "/studio/%")
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at", { ascending: true })
      .limit(10000),

    supabase
      .from("admin_events")
      .select(
        "id,event_type,event_label,user_email,product_name,amount_cents,currency,created_at"
      )
      .eq("event_type", "purchase")
      .order("created_at", { ascending: false }),

    supabase
      .from("content_likes")
      .select("id,content_item_id,created_at")
      .limit(10000),

    supabase
      .from("content_items")
      .select("id,title,slug,type")
      .limit(2000),
  ]);

  const todayViews = todayViewsResult.count ?? 0;
  const thirtyDayViews = thirtyDayViewsResult.count ?? 0;
  const totalViews = totalViewsResult.count ?? 0;

  const recentEvents =
    (recentEventsResult.data as AnalyticsEvent[] | null) ?? [];

  const recentComments =
    (recentCommentsResult.data as CommentRow[] | null) ?? [];

  const recentLeads =
    (recentLeadsResult.data as LeadRow[] | null) ?? [];

  const recentMessages =
    (recentMessagesResult.data as MessageRow[] | null) ?? [];

  const purchases =
    (purchaseResult.data as PurchaseRow[] | null) ?? [];

  const likes =
    (likesResult.data as LikeRow[] | null) ?? [];

  const contentItems =
    (contentResult.data as ContentRow[] | null) ?? [];

  const totalRevenueCents = purchases.reduce(
    (total, purchase) => total + (purchase.amount_cents ?? 0),
    0
  );

  const totalRevenue = totalRevenueCents / 100;

  const contentMap = new Map<number, ContentRow>();
  const slugToContentId = new Map<string, number>();

  for (const item of contentItems) {
    contentMap.set(item.id, item);

    if (item.slug) {
      slugToContentId.set(normalizeSlug(item.slug), item.id);
    }
  }

  const commenterIds = Array.from(
    new Set(
      recentComments
        .map((comment) => comment.user_id)
        .filter(Boolean)
    )
  );

  const profileMap = new Map<string, ProfileRow>();

  if (commenterIds.length > 0) {
    const profilesResult = await supabase
      .from("profiles")
      .select("id,display_name")
      .in("id", commenterIds);

    const profiles =
      (profilesResult.data as ProfileRow[] | null) ?? [];

    for (const profile of profiles) {
      profileMap.set(profile.id, profile);
    }
  }

  const pageCounts = new Map<string, number>();

  for (const row of topPageEventsResult.data ?? []) {
    if (!row.page_path) continue;

    const path = normalizePath(row.page_path);

    if (path === "/studio" || path.startsWith("/studio/")) {
      continue;
    }

    pageCounts.set(
      path,
      (pageCounts.get(path) ?? 0) + 1
    );
  }

  const topPages = Array.from(pageCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7);

  const contentViews = new Map<number, number>();
  const contentLikes = new Map<number, number>();
  const contentComments = new Map<number, number>();

  const contentViewResult = await supabase
    .from("analytics_events")
    .select("content_id,page_path")
    .eq("event_type", "page_view")
    .neq("page_path", "/studio")
    .not("page_path", "like", "/studio/%")
    .gte("created_at", thirtyDaysAgo.toISOString())
    .limit(10000);

  for (const row of contentViewResult.data ?? []) {
    let contentId =
      typeof row.content_id === "number"
        ? row.content_id
        : null;

    if (contentId === null && row.page_path) {
      contentId = findContentIdFromPath(
        row.page_path,
        slugToContentId
      );
    }

    if (contentId === null) continue;

    contentViews.set(
      contentId,
      (contentViews.get(contentId) ?? 0) + 1
    );
  }

  for (const like of likes) {
    contentLikes.set(
      like.content_item_id,
      (contentLikes.get(like.content_item_id) ?? 0) + 1
    );
  }

  const commentCountsResult = await supabase
    .from("content_comments")
    .select("content_item_id")
    .limit(10000);

  for (const row of commentCountsResult.data ?? []) {
    if (typeof row.content_item_id !== "number") continue;

    contentComments.set(
      row.content_item_id,
      (contentComments.get(row.content_item_id) ?? 0) + 1
    );
  }

  const topContent = contentItems
    .map((item) => ({
      ...item,
      views: contentViews.get(item.id) ?? 0,
      likes: contentLikes.get(item.id) ?? 0,
      comments: contentComments.get(item.id) ?? 0,
    }))
    .sort((a, b) => {
      if (b.views !== a.views) {
        return b.views - a.views;
      }

      if (b.comments !== a.comments) {
        return b.comments - a.comments;
      }

      return b.likes - a.likes;
    })
    .slice(0, 6);

  const chartCounts = new Map<string, number>();

  for (let index = 0; index < 30; index += 1) {
    const date = new Date(thirtyDaysAgo);
    date.setDate(thirtyDaysAgo.getDate() + index);

    chartCounts.set(
      date.toISOString().slice(0, 10),
      0
    );
  }

  for (const row of chartEventsResult.data ?? []) {
    const key = new Date(row.created_at)
      .toISOString()
      .slice(0, 10);

    if (!chartCounts.has(key)) continue;

    chartCounts.set(
      key,
      (chartCounts.get(key) ?? 0) + 1
    );
  }

  const chartData = Array.from(chartCounts.entries());

  const maxChartValue = Math.max(
    1,
    ...chartData.map(([, value]) => value)
  );

  const chartPoints = chartData
    .map(([, value], index) => {
      const x =
        chartData.length <= 1
          ? 0
          : (index / (chartData.length - 1)) * 100;

      const y =
        92 - (value / maxChartValue) * 78;

      return `${x},${y}`;
    })
    .join(" ");

  const secondaryStats = [
    {
      label: "Today",
      value: formatNumber(todayViews),
    },
    {
      label: "Likes",
      value: formatNumber(totalLikes),
    },
    {
      label: "Comments",
      value: formatNumber(totalComments),
    },
    {
      label: "Messages",
      value: formatNumber(totalMessages),
    },
  ];

  return (
    <main className="min-h-screen bg-[#f3f6f3] px-4 py-7 text-[#172c23] md:px-8 lg:px-10">
      <div className="mx-auto max-w-[1500px]">

        <header className="mb-6">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <div className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">
                Wonderful-Life Studio
              </div>

              <h1 className="text-3xl font-black tracking-[-0.03em] text-[#17382a] md:text-[40px]">
                Analytics Dashboard
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                A clear view of your audience, content, conversations and
                digital-product business.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="rounded-xl border border-[#dce5df] bg-white px-4 py-3 text-xs font-bold text-slate-500 shadow-sm">
                Last 30 days
              </div>

              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="rounded-xl bg-[#176b4b] px-5 py-3 text-xs font-black text-white shadow-sm transition hover:bg-[#12583e]"
              >
                View Website ↗
              </a>
            </div>
          </div>

          <div className="mt-6 grid overflow-hidden rounded-2xl border border-[#dce5df] bg-white shadow-sm sm:grid-cols-2 lg:grid-cols-4">
            {secondaryStats.map((stat) => (
              <div
                key={stat.label}
                className="border-b border-[#e8eeea] px-5 py-4 last:border-b-0 sm:border-r sm:last:border-r-0 lg:border-b-0"
              >
                <div className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
                  {stat.label}
                </div>

                <div className="mt-1 text-xl font-black text-[#243b31]">
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </header>

        <section className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-[24px] border border-[#dce5df] bg-white p-5 shadow-sm">
            <div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
              Public Page Views
            </div>

            <div className="mt-3 text-4xl font-black tracking-[-0.04em] text-[#17382a]">
              {formatNumber(thirtyDayViews)}
            </div>

            <div className="mt-2 text-[11px] font-bold text-emerald-700">
              {formatNumber(todayViews)} today
            </div>
          </article>

          <article className="rounded-[24px] border border-[#dce5df] bg-white p-5 shadow-sm">
            <div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
              Leads
            </div>

            <div className="mt-3 text-4xl font-black tracking-[-0.04em] text-[#17382a]">
              {formatNumber(totalLeads)}
            </div>

            <div className="mt-2 text-[11px] font-bold text-slate-400">
              {unreadLeads > 0
                ? `${formatNumber(unreadLeads)} unread`
                : "No unread leads"}
            </div>
          </article>

          <article className="rounded-[24px] border border-[#dce5df] bg-white p-5 shadow-sm">
            <div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
              Sales
            </div>

            <div className="mt-3 text-4xl font-black tracking-[-0.04em] text-[#17382a]">
              {formatNumber(purchases.length)}
            </div>

            <div className="mt-2 text-[11px] font-bold text-emerald-700">
              Verified purchases
            </div>
          </article>

          <article className="rounded-[24px] bg-[#17382a] p-5 text-white shadow-sm">
            <div className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-200">
              Revenue
            </div>

            <div className="mt-3 text-4xl font-black tracking-[-0.04em]">
              {formatMoney(totalRevenue)}
            </div>

            <div className="mt-2 text-[11px] font-bold text-emerald-100/70">
              Recorded purchase revenue
            </div>
          </article>
        </section>

        <section className="mb-5 grid gap-5 xl:grid-cols-[1.55fr_.65fr]">
          <article className="rounded-[24px] border border-[#dfe7e1] bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700">
                  Traffic
                </div>

                <h2 className="mt-1 text-xl font-black text-[#18382a]">
                  Visitor Activity
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Public page views only — Studio activity excluded
                </p>
              </div>

              <div className="rounded-full bg-emerald-50 px-3 py-2 text-[10px] font-black text-emerald-700">
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-500" />
                Live data
              </div>
            </div>

            <div className="mb-4 flex items-end justify-between">
              <div>
                <span className="text-4xl font-black tracking-[-0.04em] text-[#17382a]">
                  {formatNumber(thirtyDayViews)}
                </span>

                <span className="ml-2 text-xs font-bold text-slate-400">
                  views
                </span>
              </div>

              <div className="text-xs font-black text-emerald-700">
                {formatNumber(todayViews)} today
              </div>
            </div>

            <div className="relative h-[270px] overflow-hidden rounded-xl border-b border-l border-slate-200 bg-gradient-to-b from-[#fbfdfb] to-white">
              <div className="absolute left-0 right-0 top-1/4 border-t border-slate-100" />
              <div className="absolute left-0 right-0 top-1/2 border-t border-slate-100" />
              <div className="absolute left-0 right-0 top-3/4 border-t border-slate-100" />

              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="absolute inset-0 h-full w-full"
              >
                <polyline
                  points={chartPoints}
                  fill="none"
                  stroke="#177a54"
                  strokeWidth="2.5"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>

            <div className="mt-3 flex justify-between text-[9px] font-bold text-slate-400">
              <span>{formatShortDate(thirtyDaysAgo)}</span>
              <span>{formatShortDate(now)}</span>
            </div>
          </article>

          <article className="rounded-[24px] bg-[#17382a] p-6 text-white shadow-sm">
            <div className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-200">
              Business
            </div>

            <h2 className="mt-1 text-xl font-black">
              Sales & Revenue
            </h2>

            <p className="mt-1 text-xs text-emerald-100/60">
              Verified Wonderful-Life purchases
            </p>

            <div className="mt-7 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/10 p-4">
                <div className="text-3xl font-black">
                  {formatNumber(purchases.length)}
                </div>

                <div className="mt-1 text-[9px] font-black uppercase tracking-[0.12em] text-emerald-100/60">
                  Sales
                </div>
              </div>

              <div className="rounded-2xl bg-white/10 p-4">
                <div className="text-3xl font-black">
                  {formatNumber(totalLeads)}
                </div>

                <div className="mt-1 text-[9px] font-black uppercase tracking-[0.12em] text-emerald-100/60">
                  Leads
                </div>
              </div>
            </div>

            <div className="mt-3 rounded-2xl bg-white p-5 text-[#17382a]">
              <div className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                Revenue
              </div>

              <div className="mt-2 text-4xl font-black tracking-[-0.04em]">
                {formatMoney(totalRevenue)}
              </div>
            </div>

            {purchases.length > 0 && (
              <div className="mt-6 border-t border-white/15 pt-5">
                <div className="text-[9px] font-black uppercase tracking-[0.14em] text-emerald-200">
                  Latest purchase
                </div>

                <div className="mt-2 text-sm font-bold">
                  {purchases[0].product_name ||
                    purchases[0].event_label ||
                    "Digital Product"}
                </div>

                <div className="mt-1 text-[11px] text-emerald-100/70">
                  {formatMoney(
                    (purchases[0].amount_cents ?? 0) / 100
                  )}{" "}
                  • {formatDate(purchases[0].created_at)}
                </div>
              </div>
            )}
          </article>
        </section>

        <section className="mb-5 grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
          <article className="rounded-[24px] border border-[#dfe7e1] bg-white p-6 shadow-sm">
            <div className="mb-5">
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700">
                Content
              </div>

              <h2 className="mt-1 text-xl font-black text-[#18382a]">
                Top Content
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Most-viewed articles, recipes, videos and products
              </p>
            </div>

            <div className="grid grid-cols-[minmax(0,1fr)_70px_60px_80px] gap-3 border-b border-slate-100 pb-3 text-[9px] font-black uppercase tracking-[0.1em] text-slate-400">
              <div>Content</div>
              <div className="text-right">Views</div>
              <div className="text-right">Likes</div>
              <div className="text-right">Comments</div>
            </div>

            {topContent.map((item, index) => (
              <div
                key={item.id}
                className="grid grid-cols-[minmax(0,1fr)_70px_60px_80px] items-center gap-3 border-b border-slate-100 py-4 last:border-b-0"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#eef5f0] text-[10px] font-black text-emerald-700">
                    {index + 1}
                  </div>

                  <div className="min-w-0">
                    <div className="truncate text-[12px] font-extrabold text-slate-700">
                      {item.title}
                    </div>

                    <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.08em] text-slate-400">
                      {contentTypeLabel(item.type)}
                    </div>
                  </div>
                </div>

                <div className="text-right text-sm font-black text-[#243b31]">
                  {formatNumber(item.views)}
                </div>

                <div className="text-right text-xs font-bold text-slate-500">
                  {formatNumber(item.likes)}
                </div>

                <div className="text-right text-xs font-bold text-slate-500">
                  {formatNumber(item.comments)}
                </div>
              </div>
            ))}
          </article>

          <article className="rounded-[24px] border border-[#dfe7e1] bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700">
                  Traffic
                </div>

                <h2 className="mt-1 text-xl font-black text-[#18382a]">
                  Top Pages
                </h2>
              </div>

              <span className="text-[10px] font-bold text-slate-400">
                30 days
              </span>
            </div>

            {topPages.map(([path, count], index) => (
              <div key={path} className="mb-5 last:mb-0">
                <div className="mb-2 flex items-center gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[9px] font-black text-slate-500">
                    {index + 1}
                  </div>

                  <div className="min-w-0 flex-1 truncate text-[11px] font-bold text-slate-700">
                    {pageLabel(path)}
                  </div>

                  <div className="text-xs font-black text-[#243b31]">
                    {formatNumber(count)}
                  </div>
                </div>

                <div className="ml-9 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{
                      width: `${
                        topPages[0]?.[1]
                          ? Math.max(
                              7,
                              (count / topPages[0][1]) * 100
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </article>
        </section>

        <section className="mb-5 grid gap-5 xl:grid-cols-2">
          <article className="rounded-[24px] border border-[#dfe7e1] bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700">
                  Engagement
                </div>

                <h2 className="mt-1 text-xl font-black text-[#18382a]">
                  Recent Comments
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Latest conversations across your content
                </p>
              </div>

              <div className="rounded-full bg-emerald-50 px-3 py-2 text-[10px] font-black text-emerald-700">
                {formatNumber(totalComments)} total
              </div>
            </div>

            {recentComments.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                New comments will appear here.
              </div>
            ) : (
              recentComments.slice(0, 6).map((comment) => {
                const contentItem =
                  contentMap.get(comment.content_item_id);

                const profile =
                  profileMap.get(comment.user_id);

                const commenterName =
                  profile?.display_name?.trim() || "Member";

                return (
                  <div
                    key={comment.id}
                    className="flex gap-4 border-t border-slate-100 py-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eaf2ff] text-[10px] font-black text-blue-700">
                      {getInitials(commenterName)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <div className="text-[12px] font-black capitalize text-slate-700">
                            {commenterName}
                          </div>

                          <div className="mt-1 max-w-[520px] text-[10px] leading-4 text-slate-400">
                            {contentItem?.title ??
                              `Content #${comment.content_item_id}`}
                          </div>
                        </div>

                        <span className="whitespace-nowrap text-[9px] text-slate-400">
                          {formatDate(comment.created_at)}
                        </span>
                      </div>

                      <div className="mt-2 rounded-xl bg-[#f7f9f7] px-3 py-2 text-[11px] leading-5 text-slate-600">
                        “{truncate(comment.content, 120)}”
                      </div>

                      <div className="mt-2 text-[9px] font-bold text-emerald-700">
                        {comment.is_hidden
                          ? "Hidden"
                          : comment.is_pinned
                            ? "Pinned"
                            : "Visible"}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </article>

          <article className="rounded-[24px] border border-[#dfe7e1] bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700">
                  Communications
                </div>

                <h2 className="mt-1 text-xl font-black text-[#18382a]">
                  Messages & Leads
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Website enquiries for Zoey, Nick and the team
                </p>
              </div>

              {unreadMessages + unreadLeads > 0 && (
                <div className="rounded-full bg-rose-50 px-3 py-2 text-[10px] font-black text-rose-600">
                  {unreadMessages + unreadLeads} new
                </div>
              )}
            </div>

            {recentMessages.length === 0 &&
            recentLeads.length === 0 ? (
              <div className="flex min-h-[270px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-[#fbfcfb] text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-lg text-emerald-700">
                  ✉
                </div>

                <div className="text-sm font-black text-slate-700">
                  Inbox is clear
                </div>

                <div className="mt-1 max-w-xs text-[11px] leading-5 text-slate-400">
                  New website messages and Join Our Team leads will
                  appear here automatically.
                </div>
              </div>
            ) : (
              <div>
                {recentMessages.slice(0, 5).map((message) => (
                  <div
                    key={`message-${message.id}`}
                    className="flex gap-3 border-t border-slate-100 py-4"
                  >
                    <span
                      className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                        message.is_read
                          ? "bg-slate-200"
                          : "bg-rose-500"
                      }`}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between gap-3">
                        <div className="truncate text-[11px] font-black text-slate-700">
                          {message.name}
                        </div>

                        <div className="text-[9px] text-slate-400">
                          {formatDate(message.created_at)}
                        </div>
                      </div>

                      <div className="mt-1 truncate text-[10px] text-slate-500">
                        {message.subject ||
                          truncate(message.message, 70)}
                      </div>

                      <div className="mt-2 text-[9px] font-bold text-blue-700">
                        To {recipientLabel(message.recipient)}
                      </div>
                    </div>
                  </div>
                ))}

                {recentLeads.slice(0, 3).map((lead) => (
                  <div
                    key={`lead-${lead.id}`}
                    className="flex gap-3 border-t border-slate-100 py-4"
                  >
                    <span
                      className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                        lead.is_read
                          ? "bg-slate-200"
                          : "bg-violet-500"
                      }`}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between gap-3">
                        <div className="truncate text-[11px] font-black text-slate-700">
                          {lead.name}
                        </div>

                        <div className="text-[9px] text-slate-400">
                          {formatDate(lead.created_at)}
                        </div>
                      </div>

                      <div className="mt-1 truncate text-[10px] text-slate-500">
                        {lead.subject ||
                          lead.message ||
                          "Join Our Team lead"}
                      </div>

                      <div className="mt-2 text-[9px] font-bold text-violet-700">
                        Lead
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>
        </section>

        <article className="rounded-[24px] border border-[#dfe7e1] bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700">
                Live
              </div>

              <h2 className="mt-1 text-xl font-black text-[#18382a]">
                Recent Public Activity
              </h2>
            </div>

            <div className="text-[10px] text-slate-400">
              Studio visits excluded
            </div>
          </div>

          <div className="grid gap-x-8 lg:grid-cols-2">
            {recentEvents.slice(0, 8).map((event) => (
              <div
                key={event.id}
                className="grid grid-cols-[10px_minmax(0,1fr)_110px] items-center gap-3 border-t border-slate-100 py-3"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500" />

                <div className="min-w-0">
                  <div className="text-[10px] font-extrabold text-slate-700">
                    {eventLabel(event.event_type)}
                  </div>

                  <div className="mt-0.5 truncate text-[9px] text-slate-400">
                    {event.page_path
                      ? pageLabel(event.page_path)
                      : "Wonderful-Life"}
                  </div>
                </div>

                <div className="text-right text-[9px] text-slate-400">
                  {formatDate(event.created_at)}
                </div>
              </div>
            ))}
          </div>
        </article>

        <footer className="flex flex-wrap justify-center gap-2 py-6 text-[9px] text-slate-400">
          <span>Wonderful-Life first-party analytics</span>
          <span>•</span>
          <span>Supabase</span>
          <span>•</span>
          <span>
            {formatNumber(totalViews)} recorded public page views
          </span>
        </footer>
      </div>
    </main>
  );
}