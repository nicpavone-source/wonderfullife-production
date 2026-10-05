import Link from "next/link";
import { notFound } from "next/navigation";
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
  updated_at: string | null;
};

type MessagePageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    month: "long",
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

export default async function MessagePage({
  params,
}: MessagePageProps) {
  const { id } = await params;

  const messageId = Number(id);

  if (
    !Number.isInteger(messageId) ||
    messageId <= 0
  ) {
    notFound();
  }

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return (
      <main
        style={{
          padding: 40,
        }}
      >
        <h1>Message Center</h1>

        <p>
          Message Center server configuration is
          missing.
        </p>
      </main>
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
      "id,name,email,recipient,subject,message,status,is_read,created_at,updated_at"
    )
    .eq("id", messageId)
    .maybeSingle();

  if (error) {
    console.error(
      "Unable to load contact message:",
      error.message
    );

    return (
      <main
        style={{
          padding: 40,
        }}
      >
        <h1>Message Center</h1>

        <p>
          We couldn&apos;t load this message.
        </p>

        <Link href="/studio/messages">
          ← Back to Messages
        </Link>
      </main>
    );
  }

  if (!data) {
    notFound();
  }

  const message =
    data as ContactMessage;

  if (!message.is_read) {
    const { error: updateError } =
      await supabase
        .from("contact_messages")
        .update({
          is_read: true,
          status: "read",
        })
        .eq("id", message.id);

    if (updateError) {
      console.error(
        "Unable to mark message as read:",
        updateError.message
      );
    }

    message.is_read = true;
    message.status = "read";
  }

  const replySubject = message.subject
    ? `Re: ${message.subject}`
    : "Re: Your Wonderful-Life message";

    const replyHref =
    `https://mail.google.com/mail/?view=cm&fs=1` +
    `&to=${encodeURIComponent(message.email)}` +
    `&su=${encodeURIComponent(replySubject)}`;

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
          maxWidth: 980,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 20,
            flexWrap: "wrap",
            marginBottom: 30,
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
                fontSize:
                  "clamp(34px, 5vw, 52px)",
                lineHeight: 1.05,
                letterSpacing: "-.035em",
              }}
            >
              Message
            </h1>

            <p
              style={{
                margin: "12px 0 0",
                color: "#718078",
                fontSize: 15,
              }}
            >
              Review the complete inquiry before
              deciding how to respond.
            </p>
          </div>

          <Link
            href="/studio/messages"
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
            ← Back to Messages
          </Link>
        </div>

        <article
          style={{
            background: "#ffffff",
            border:
              "1px solid rgba(20,61,41,.10)",
            borderRadius: 24,
            overflow: "hidden",
            boxShadow:
              "0 18px 50px rgba(20,61,41,.07)",
          }}
        >
          <header
            style={{
              padding: "26px 28px",
              borderBottom:
                "1px solid rgba(20,61,41,.08)",
              display: "flex",
              alignItems: "flex-start",
              gap: 18,
            }}
          >
            <div
              style={{
                width: 54,
                height: 54,
                flex: "0 0 54px",
                borderRadius: "50%",
                background: "#dfeee2",
                color: "#2d6542",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                fontWeight: 900,
              }}
            >
              {getInitials(message.name)}
            </div>

            <div
              style={{
                flex: 1,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "flex-start",
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <h2
                    style={{
                      margin: 0,
                      color: "#153c29",
                      fontSize: 22,
                      fontWeight: 900,
                    }}
                  >
                    {message.name}
                  </h2>

                  <p
                    style={{
                      margin: "5px 0 0",
                      color: "#718078",
                      fontSize: 13,
                    }}
                  >
                    {message.email}
                  </p>
                </div>

                <span
                  style={{
                    padding: "6px 10px",
                    borderRadius: 999,
                    background: "#e7f3e9",
                    color: "#237343",
                    fontSize: 10,
                    fontWeight: 900,
                    letterSpacing: ".06em",
                    textTransform: "uppercase",
                  }}
                >
                  Read
                </span>
              </div>
            </div>
          </header>

          <section
            style={{
              padding: "26px 28px",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(2, minmax(0, 1fr))",
                gap: 18,
                paddingBottom: 24,
                borderBottom:
                  "1px solid rgba(20,61,41,.08)",
              }}
            >
              <div>
                <div
                  style={{
                    color: "#849088",
                    fontSize: 10,
                    fontWeight: 900,
                    letterSpacing: ".08em",
                    textTransform: "uppercase",
                  }}
                >
                  Sent To
                </div>

                <div
                  style={{
                    marginTop: 6,
                    color: "#254c35",
                    fontSize: 14,
                    fontWeight: 800,
                  }}
                >
                  {recipientLabel(
                    message.recipient
                  )}
                </div>
              </div>

              <div>
                <div
                  style={{
                    color: "#849088",
                    fontSize: 10,
                    fontWeight: 900,
                    letterSpacing: ".08em",
                    textTransform: "uppercase",
                  }}
                >
                  Received
                </div>

                <div
                  style={{
                    marginTop: 6,
                    color: "#254c35",
                    fontSize: 14,
                    fontWeight: 800,
                  }}
                >
                  {formatDate(
                    message.created_at
                  )}
                </div>
              </div>
            </div>

            <div
              style={{
                paddingTop: 26,
              }}
            >
              <div
                style={{
                  color: "#849088",
                  fontSize: 10,
                  fontWeight: 900,
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                }}
              >
                Subject
              </div>

              <h3
                style={{
                  margin: "8px 0 0",
                  color: "#153c29",
                  fontSize: 22,
                  lineHeight: 1.35,
                  fontWeight: 900,
                }}
              >
                {message.subject ||
                  "General message"}
              </h3>
            </div>

            <div
              style={{
                marginTop: 26,
                padding: "24px 26px",
                borderRadius: 18,
                background: "#f8faf7",
                border:
                  "1px solid rgba(20,61,41,.08)",
              }}
            >
              <div
                style={{
                  color: "#849088",
                  fontSize: 10,
                  fontWeight: 900,
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                  marginBottom: 12,
                }}
              >
                Message
              </div>

              <p
                style={{
                  margin: 0,
                  color: "#253c2f",
                  fontSize: 16,
                  lineHeight: 1.8,
                  whiteSpace: "pre-wrap",
                  overflowWrap: "anywhere",
                }}
              >
                {message.message}
              </p>
            </div>

            <div
              style={{
                marginTop: 28,
                display: "flex",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <a
                href={replyHref}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "13px 20px",
                  borderRadius: 12,
                  background: "#237343",
                  color: "#ffffff",
                  textDecoration: "none",
                  fontSize: 13,
                  fontWeight: 900,
                }}
              >
                Reply by Email →
              </a>

              <Link
                href="/studio/messages"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "13px 20px",
                  borderRadius: 12,
                  background: "#ffffff",
                  border:
                    "1px solid rgba(20,61,41,.13)",
                  color: "#245d3d",
                  textDecoration: "none",
                  fontSize: 13,
                  fontWeight: 800,
                }}
              >
                Back to Inbox
              </Link>
            </div>
          </section>
        </article>
      </div>
    </main>
  );
}