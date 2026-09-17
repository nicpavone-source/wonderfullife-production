import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

type AnalyticsEvent = {
  id: number;
  event_type: string;
  user_id: string | null;
  page_path: string | null;
  content_type: string | null;
  source: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-CA").format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

async function getCount(
  supabase: any,
  table: string
) {
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error(`Analytics count failed for ${table}:`, error.message);
    return 0;
  }

  return count ?? 0;
}

export default async function AnalyticsPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return (
      <main style={styles.page}>
        <div style={styles.container}>
          <h1 style={styles.title}>Analytics</h1>
          <div style={styles.errorBox}>
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

  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalMembers,
    totalComments,
    totalPosts,
    totalSaved,
    totalChats,
    totalContent,
  ] = await Promise.all([
    getCount(supabase, "profiles"),
    getCount(supabase, "community_comments"),
    getCount(supabase, "community_posts"),
    getCount(supabase, "saved_content"),
    getCount(supabase, "chat_sessions"),
    getCount(supabase, "content_items"),
  ]);

  const [
    todayViewsResult,
    sevenDayViewsResult,
    thirtyDayViewsResult,
    totalViewsResult,
    recentEventsResult,
    topPagesResult,
    purchaseEventsResult,
  ] = await Promise.all([
    supabase
      .from("analytics_events")
      .select("*", { count: "exact", head: true })
      .eq("event_type", "page_view")
      .gte("created_at", startOfToday.toISOString()),

    supabase
      .from("analytics_events")
      .select("*", { count: "exact", head: true })
      .eq("event_type", "page_view")
      .gte("created_at", sevenDaysAgo.toISOString()),

    supabase
      .from("analytics_events")
      .select("*", { count: "exact", head: true })
      .eq("event_type", "page_view")
      .gte("created_at", thirtyDaysAgo.toISOString()),

    supabase
      .from("analytics_events")
      .select("*", { count: "exact", head: true })
      .eq("event_type", "page_view"),

    supabase
      .from("analytics_events")
      .select(
        "id,event_type,user_id,page_path,content_type,source,metadata,created_at"
      )
      .order("created_at", { ascending: false })
      .limit(12),

    supabase
      .from("analytics_events")
      .select("page_path")
      .eq("event_type", "page_view")
      .gte("created_at", thirtyDaysAgo.toISOString())
      .not("page_path", "is", null)
      .limit(5000),

    supabase
      .from("analytics_events")
      .select(
        "id,event_type,user_id,page_path,content_type,source,metadata,created_at"
      )
      .in("event_type", [
        "guide_purchase",
        "purchase_completed",
        "checkout_completed",
      ])
      .order("created_at", { ascending: false }),
  ]);

  const todayViews = todayViewsResult.count ?? 0;
  const sevenDayViews = sevenDayViewsResult.count ?? 0;
  const thirtyDayViews = thirtyDayViewsResult.count ?? 0;
  const totalViews = totalViewsResult.count ?? 0;

  const recentEvents =
    (recentEventsResult.data as AnalyticsEvent[] | null) ?? [];

  const purchaseEvents =
    (purchaseEventsResult.data as AnalyticsEvent[] | null) ?? [];

  const pageCounts = new Map<string, number>();

  for (const row of topPagesResult.data ?? []) {
    const path = row.page_path;

    if (!path) continue;

    pageCounts.set(path, (pageCounts.get(path) ?? 0) + 1);
  }

  const topPages = Array.from(pageCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  let totalRevenueCents = 0;

  for (const event of purchaseEvents) {
    const metadata = event.metadata;

    if (!metadata) continue;

    const possibleAmount =
      metadata.amount_total ??
      metadata.amount ??
      metadata.total_amount ??
      metadata.revenue;

    if (typeof possibleAmount === "number") {
      totalRevenueCents += possibleAmount;
    }
  }

  const totalRevenue = totalRevenueCents / 100;

  const cards = [
    {
      label: "Page Views Today",
      value: formatNumber(todayViews),
      note: `${formatNumber(sevenDayViews)} in the last 7 days`,
    },
    {
      label: "30-Day Views",
      value: formatNumber(thirtyDayViews),
      note: `${formatNumber(totalViews)} recorded all-time`,
    },
    {
      label: "Members",
      value: formatNumber(totalMembers),
      note: "Registered Wonderful-Life members",
    },
    {
      label: "Comments",
      value: formatNumber(totalComments),
      note: `${formatNumber(totalPosts)} community posts`,
    },
    {
      label: "Sales",
      value: formatNumber(purchaseEvents.length),
      note: "Recorded digital purchases",
    },
    {
      label: "Revenue",
      value: `$${totalRevenue.toFixed(2)}`,
      note: "CAD from recorded purchases",
    },
  ];

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <div style={styles.eyebrow}>WONDERFUL-LIFE STUDIO</div>
            <h1 style={styles.title}>Analytics Dashboard</h1>
            <p style={styles.subtitle}>
              Traffic, members, engagement and business activity in one place.
            </p>
          </div>

          <div style={styles.liveBadge}>
            <span style={styles.liveDot} />
            Live data
          </div>
        </div>

        <section style={styles.cardGrid}>
          {cards.map((card) => (
            <article key={card.label} style={styles.metricCard}>
              <div style={styles.metricLabel}>{card.label}</div>
              <div style={styles.metricValue}>{card.value}</div>
              <div style={styles.metricNote}>{card.note}</div>
            </article>
          ))}
        </section>

        <section style={styles.secondaryGrid}>
          <article style={styles.panel}>
            <div style={styles.panelHeader}>
              <div>
                <div style={styles.panelEyebrow}>TRAFFIC</div>
                <h2 style={styles.panelTitle}>Top Pages</h2>
              </div>

              <div style={styles.periodLabel}>Last 30 days</div>
            </div>

            {topPages.length === 0 ? (
              <div style={styles.emptyState}>
                Page activity will appear here as visitors browse the site.
              </div>
            ) : (
              <div style={styles.list}>
                {topPages.map(([path, count], index) => (
                  <div key={path} style={styles.listRow}>
                    <div style={styles.rank}>{index + 1}</div>

                    <div style={styles.pathWrap}>
                      <div style={styles.path}>{path}</div>

                      <div style={styles.barTrack}>
                        <div
                          style={{
                            ...styles.barFill,
                            width: `${
                              topPages[0][1] > 0
                                ? Math.max(
                                    8,
                                    (count / topPages[0][1]) * 100
                                  )
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    <div style={styles.count}>{formatNumber(count)}</div>
                  </div>
                ))}
              </div>
            )}
          </article>

          <article style={styles.panel}>
            <div style={styles.panelHeader}>
              <div>
                <div style={styles.panelEyebrow}>ENGAGEMENT</div>
                <h2 style={styles.panelTitle}>Member Activity</h2>
              </div>
            </div>

            <div style={styles.activityStats}>
              <div style={styles.activityStat}>
                <span style={styles.activityNumber}>
                  {formatNumber(totalSaved)}
                </span>
                <span style={styles.activityLabel}>Saved content</span>
              </div>

              <div style={styles.activityStat}>
                <span style={styles.activityNumber}>
                  {formatNumber(totalChats)}
                </span>
                <span style={styles.activityLabel}>Ask Zoey sessions</span>
              </div>

              <div style={styles.activityStat}>
                <span style={styles.activityNumber}>
                  {formatNumber(totalContent)}
                </span>
                <span style={styles.activityLabel}>Content items</span>
              </div>

              <div style={styles.activityStat}>
                <span style={styles.activityNumber}>
                  {formatNumber(totalPosts)}
                </span>
                <span style={styles.activityLabel}>Community posts</span>
              </div>
            </div>
          </article>
        </section>

        <section style={styles.panel}>
          <div style={styles.panelHeader}>
            <div>
              <div style={styles.panelEyebrow}>LIVE ACTIVITY</div>
              <h2 style={styles.panelTitle}>Recent Activity</h2>
            </div>
          </div>

          {recentEvents.length === 0 ? (
            <div style={styles.emptyState}>
              New visitor and member activity will appear here.
            </div>
          ) : (
            <div style={styles.eventTable}>
              <div style={styles.tableHeader}>
                <div>Event</div>
                <div>Page</div>
                <div>Visitor</div>
                <div>Time</div>
              </div>

              {recentEvents.map((event) => (
                <div key={event.id} style={styles.tableRow}>
                  <div>
                    <span style={styles.eventPill}>
                      {event.event_type.replaceAll("_", " ")}
                    </span>
                  </div>

                  <div style={styles.tablePath}>
                    {event.page_path ?? "—"}
                  </div>

                  <div style={styles.tableMuted}>
                    {event.user_id ? "Member" : "Anonymous"}
                  </div>

                  <div style={styles.tableMuted}>
                    {formatDate(event.created_at)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div style={styles.footerNote}>
          Wonderful-Life first-party analytics • Supabase
        </div>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f4f6f2",
    padding: "34px 24px 60px",
    color: "#183428",
  },

  container: {
    width: "100%",
    maxWidth: "1450px",
    margin: "0 auto",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "24px",
    marginBottom: "28px",
  },

  eyebrow: {
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "0.18em",
    color: "#6a806f",
    marginBottom: "8px",
  },

  title: {
    fontSize: "34px",
    lineHeight: 1.1,
    margin: 0,
    color: "#173d2d",
    fontWeight: 800,
  },

  subtitle: {
    margin: "9px 0 0",
    fontSize: "15px",
    color: "#68766e",
  },

  liveBadge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#ffffff",
    padding: "9px 13px",
    borderRadius: "999px",
    border: "1px solid #dfe5df",
    fontSize: "12px",
    fontWeight: 700,
    color: "#456150",
  },

  liveDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#6fa744",
  },

  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "14px",
    marginBottom: "18px",
  },

  metricCard: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "20px",
    border: "1px solid #e1e6e0",
    boxShadow: "0 2px 10px rgba(29, 54, 39, 0.04)",
  },

  metricLabel: {
    fontSize: "12px",
    fontWeight: 800,
    color: "#66766c",
    marginBottom: "10px",
  },

  metricValue: {
    fontSize: "31px",
    lineHeight: 1,
    fontWeight: 800,
    color: "#173d2d",
    marginBottom: "9px",
  },

  metricNote: {
    fontSize: "11px",
    color: "#88938c",
    lineHeight: 1.4,
  },

  secondaryGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.5fr) minmax(320px, 0.8fr)",
    gap: "18px",
    marginBottom: "18px",
  },

  panel: {
    background: "#ffffff",
    borderRadius: "18px",
    padding: "22px",
    border: "1px solid #e1e6e0",
    boxShadow: "0 2px 10px rgba(29, 54, 39, 0.04)",
    overflow: "hidden",
  },

  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "20px",
    gap: "20px",
  },

  panelEyebrow: {
    fontSize: "10px",
    letterSpacing: "0.15em",
    fontWeight: 800,
    color: "#7c8d82",
    marginBottom: "4px",
  },

  panelTitle: {
    margin: 0,
    fontSize: "20px",
    color: "#183d2e",
  },

  periodLabel: {
    fontSize: "11px",
    fontWeight: 700,
    color: "#849088",
  },

  emptyState: {
    padding: "32px 10px",
    textAlign: "center",
    color: "#87928a",
    fontSize: "13px",
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },

  listRow: {
    display: "grid",
    gridTemplateColumns: "24px minmax(0, 1fr) 55px",
    gap: "10px",
    alignItems: "center",
  },

  rank: {
    fontSize: "11px",
    fontWeight: 800,
    color: "#8b968f",
  },

  pathWrap: {
    minWidth: 0,
  },

  path: {
    fontSize: "12px",
    fontWeight: 700,
    color: "#344b3e",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    marginBottom: "6px",
  },

  barTrack: {
    width: "100%",
    height: "5px",
    background: "#edf1ed",
    borderRadius: "999px",
    overflow: "hidden",
  },

  barFill: {
    height: "100%",
    borderRadius: "999px",
    background: "#779c51",
  },

  count: {
    textAlign: "right",
    fontSize: "12px",
    fontWeight: 800,
    color: "#40594a",
  },

  activityStats: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },

  activityStat: {
    display: "flex",
    flexDirection: "column",
    background: "#f6f8f4",
    borderRadius: "13px",
    padding: "17px",
    minHeight: "90px",
    justifyContent: "center",
  },

  activityNumber: {
    fontSize: "24px",
    fontWeight: 800,
    color: "#244b36",
    marginBottom: "5px",
  },

  activityLabel: {
    fontSize: "11px",
    fontWeight: 700,
    color: "#78857c",
  },

  eventTable: {
    width: "100%",
  },

  tableHeader: {
    display: "grid",
    gridTemplateColumns: "180px minmax(220px, 1fr) 120px 170px",
    gap: "16px",
    padding: "0 10px 10px",
    fontSize: "10px",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    fontWeight: 800,
    color: "#89938d",
  },

  tableRow: {
    display: "grid",
    gridTemplateColumns: "180px minmax(220px, 1fr) 120px 170px",
    gap: "16px",
    alignItems: "center",
    padding: "13px 10px",
    borderTop: "1px solid #edf0ec",
    fontSize: "12px",
  },

  eventPill: {
    display: "inline-block",
    padding: "5px 9px",
    borderRadius: "999px",
    background: "#edf4e9",
    color: "#496b3d",
    fontWeight: 800,
    textTransform: "capitalize",
  },

  tablePath: {
    fontWeight: 700,
    color: "#3c5045",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  tableMuted: {
    color: "#7f8b84",
  },

  errorBox: {
    marginTop: "25px",
    padding: "20px",
    background: "#fff4f1",
    border: "1px solid #ead4cd",
    borderRadius: "14px",
    color: "#834738",
  },

  footerNote: {
    textAlign: "center",
    paddingTop: "22px",
    color: "#96a098",
    fontSize: "11px",
  },
};