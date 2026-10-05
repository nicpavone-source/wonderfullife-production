import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

type ContactMessage = {
  id: number;
  name: string;
  email: string;
  recipient: string;
  subject: string | null;
  message: string;
  status: string | null;
  is_read: boolean;
  created_at: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
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
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${
    parts[parts.length - 1][0]
  }`.toUpperCase();
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

export default async function MessagesPage() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return (
      <div
        style={{
          padding: 40,
        }}
      >
        <h1>Messages</h1>

        <p>
          Message Center server configuration is
          missing.
        </p>
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

  const { data, error } = await supabase
    .from("contact_messages")
    .select(
      "id,name,email,recipient,subject,message,status,is_read,created_at"
    )
    .order("created_at", {
      ascending: false,
    })
    .limit(100);

  const messages =
    (data as ContactMessage[] | null) ?? [];

  const unreadCount = messages.filter(
    (message) => !message.is_read
  ).length;

  return (
    <main
      style={{
        width: "100%",
        minHeight: "100vh",
        padding: "48px 42px 70px",
        background:
          "linear-gradient(180deg, #f1f8ee 0%, #f8faf6 100%)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1180,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 24,
            flexWrap: "wrap",
            marginBottom: 34,
          }}
        >
          <div>
            <p
              style={{
                margin: "0 0 8px",
                color: "#398452",
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: ".14em",
                textTransform: "uppercase",
              }}
            >
              Wonderful-Life Studio
            </p>

            <h1
              style={{
                margin: 0,
                color: "#153c29",
                fontSize: "clamp(34px, 5vw, 54px)",
                lineHeight: 1.05,
                letterSpacing: "-.035em",
              }}
            >
              Message Center
            </h1>

            <p
              style={{
                margin: "12px 0 0",
                color: "#718078",
                fontSize: 16,
                lineHeight: 1.6,
              }}
            >
              Review inquiries before deciding how
              you&apos;d like to respond.
            </p>
          </div>

          <Link
            href="/studio/analytics"
            style={{
              padding: "12px 18px",
              borderRadius: 12,
              background: "#ffffff",
              border:
                "1px solid rgba(20,61,41,.12)",
              color: "#245d3d",
              textDecoration: "none",
              fontSize: 13,
              fontWeight: 800,
            }}
          >
            ← Back to Analytics
          </Link>
        </div>

        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(3, minmax(0, 1fr))",
            gap: 14,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              padding: 20,
              borderRadius: 18,
              background: "#ffffff",
              border:
                "1px solid rgba(20,61,41,.10)",
            }}
          >
            <div
              style={{
                color: "#7a8880",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: ".08em",
                textTransform: "uppercase",
              }}
            >
              Total Messages
            </div>

            <div
              style={{
                marginTop: 6,
                color: "#153c29",
                fontSize: 30,
                fontWeight: 900,
              }}
            >
              {messages.length}
            </div>
          </div>

          <div
            style={{
              padding: 20,
              borderRadius: 18,
              background: "#eef8f0",
              border:
                "1px solid rgba(35,115,67,.15)",
            }}
          >
            <div
              style={{
                color: "#52705d",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: ".08em",
                textTransform: "uppercase",
              }}
            >
              Unread
            </div>

            <div
              style={{
                marginTop: 6,
                color: "#237343",
                fontSize: 30,
                fontWeight: 900,
              }}
            >
              {unreadCount}
            </div>
          </div>

          <div
            style={{
              padding: 20,
              borderRadius: 18,
              background: "#fff8e8",
              border:
                "1px solid rgba(200,135,25,.18)",
            }}
          >
            <div
              style={{
                color: "#806e48",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: ".08em",
                textTransform: "uppercase",
              }}
            >
              For Zoey
            </div>

            <div
              style={{
                marginTop: 6,
                color: "#9a6b18",
                fontSize: 30,
                fontWeight: 900,
              }}
            >
              {
                messages.filter(
                  (message) =>
                    message.recipient === "zoey"
                ).length
              }
            </div>
          </div>
        </section>

        <section
          style={{
            background: "#ffffff",
            border:
              "1px solid rgba(20,61,41,.10)",
            borderRadius: 22,
            overflow: "hidden",
            boxShadow:
              "0 18px 45px rgba(20,61,41,.06)",
          }}
        >
          <div
            style={{
              padding: "22px 24px",
              borderBottom:
                "1px solid rgba(20,61,41,.08)",
            }}
          >
            <h2
              style={{
                margin: 0,
                color: "#153c29",
                fontSize: 20,
                fontWeight: 900,
              }}
            >
              Inbox
            </h2>

            <p
              style={{
                margin: "6px 0 0",
                color: "#7a8880",
                fontSize: 13,
              }}
            >
              Select a message to read the complete
              inquiry.
            </p>
          </div>

          {error ? (
            <div
              style={{
                padding: 28,
                color: "#a84747",
              }}
            >
              We couldn&apos;t load the messages.
            </div>
          ) : messages.length === 0 ? (
            <div
              style={{
                padding: 40,
                textAlign: "center",
                color: "#7a8880",
              }}
            >
              No messages yet.
            </div>
          ) : (
            <div>
              {messages.map((message) => (
                <Link
                  key={message.id}
                  href={`/studio/messages/${message.id}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "52px minmax(0, 1fr) auto",
                    alignItems: "center",
                    gap: 16,
                    padding: "18px 24px",
                    borderBottom:
                      "1px solid rgba(20,61,41,.07)",
                    background: message.is_read
                      ? "#ffffff"
                      : "#f4faf5",
                    color: "inherit",
                    textDecoration: "none",
                  }}
                >
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: message.is_read
                        ? "#edf1ee"
                        : "#dfeee2",
                      color: "#2d6542",
                      fontSize: 13,
                      fontWeight: 900,
                    }}
                  >
                    {getInitials(message.name)}
                  </div>

                  <div
                    style={{
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 8,
                      }}
                    >
                      <strong
                        style={{
                          color: "#153c29",
                          fontSize: 14,
                        }}
                      >
                        {message.name}
                      </strong>

                      {!message.is_read && (
                        <span
                          style={{
                            padding: "3px 7px",
                            borderRadius: 999,
                            background: "#237343",
                            color: "#ffffff",
                            fontSize: 9,
                            fontWeight: 900,
                            letterSpacing: ".05em",
                            textTransform:
                              "uppercase",
                          }}
                        >
                          New
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        marginTop: 4,
                        color: "#52645a",
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      {message.subject ||
                        "General message"}
                    </div>

                    <div
                      style={{
                        marginTop: 5,
                        color: "#849088",
                        fontSize: 11,
                      }}
                    >
                      To:{" "}
                      {recipientLabel(
                        message.recipient
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      textAlign: "right",
                      color: "#829087",
                      fontSize: 11,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatDate(
                      message.created_at
                    )}

                    <div
                      style={{
                        marginTop: 7,
                        color: "#2c7046",
                        fontSize: 18,
                        fontWeight: 800,
                      }}
                    >
                      →
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}