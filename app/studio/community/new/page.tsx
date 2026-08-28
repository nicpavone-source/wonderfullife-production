import Link from "next/link";
import type { CSSProperties } from "react";

import FeaturedImageUpload from "@/components/studio/articles/FeaturedImageUpload";
import RichTextEditor from "@/components/studio/articles/RichTextEditor";
import VideoUpload from "@/components/studio/VideoUpload";
import { createContentAction } from "@/lib/actions/content";

type NewJoinTeamPageProps = {
  searchParams: Promise<{
    type?: string;
  }>;
};

type CreatorConfig = {
  label: string;
  databaseType: "article" | "video";
  description: string;
  bodyLabel: string;
  bodyHelp: string;
  readingMinutes: number;
};

const creatorConfigs: Record<string, CreatorConfig> = {
  article: {
    label: "Article",
    databaseType: "article",
    description:
      "Create a thoughtful entrepreneurship or meaningful-work article that informs before it persuades.",
    bodyLabel: "Article Content",
    bodyHelp:
      "Use headings, lists, examples, and practical guidance. Keep the tone clear, useful, and pressure-free.",
    readingMinutes: 5,
  },
  guide: {
    label: "Guide",
    databaseType: "article",
    description:
      "Create a practical guide that helps visitors understand a topic, process, expectation, or decision.",
    bodyLabel: "Guide Content",
    bodyHelp:
      "Organize the guide into clear sections, practical steps, considerations, and a balanced conclusion.",
    readingMinutes: 7,
  },
  video: {
    label: "Video",
    databaseType: "video",
    description:
      "Publish an educational Join Our Team video with a clear summary and supporting written context.",
    bodyLabel: "Video Notes / Transcript",
    bodyHelp:
      "Add the key ideas, transcript, supporting notes, or a short written summary for visitors who prefer reading.",
    readingMinutes: 3,
  },
  story: {
    label: "Story",
    databaseType: "article",
    description:
      "Share an authentic personal story, lesson, or entrepreneurial journey without hype or exaggerated claims.",
    bodyLabel: "Story",
    bodyHelp:
      "Focus on the person, their choices, what they learned, and what others may find useful.",
    readingMinutes: 5,
  },
  faq: {
    label: "FAQ",
    databaseType: "article",
    description:
      "Answer one important question clearly and directly so visitors can make a better-informed decision.",
    bodyLabel: "Answer",
    bodyHelp:
      "Start with the direct answer, then explain the details, considerations, and any important limitations.",
    readingMinutes: 3,
  },
  event: {
    label: "Event",
    databaseType: "article",
    description:
      "Create an event information page for an introduction, workshop, meetup, or educational session.",
    bodyLabel: "Event Details",
    bodyHelp:
      "Include date, time, location or online details, what attendees can expect, who it is for, and how to participate.",
    readingMinutes: 2,
  },
  opportunity: {
    label: "Opportunity",
    databaseType: "article",
    description:
      "Explain an aspect of the USANA Brand Partner opportunity clearly, realistically, and without pressure.",
    bodyLabel: "Opportunity Information",
    bodyHelp:
      "Cover what it is, how it works, expectations, effort, support, costs or considerations, and who it may or may not suit.",
    readingMinutes: 6,
  },
};

const colors = {
  page: "#f4f7f2",
  card: "#ffffff",
  green: "#246b40",
  darkGreen: "#173d29",
  muted: "#718077",
  border: "#dbe4da",
  softGreen: "#edf5ed",
};

const cardStyle: CSSProperties = {
  overflow: "hidden",
  border: `1px solid ${colors.border}`,
  borderRadius: "18px",
  background: colors.card,
  boxShadow: "0 8px 24px rgba(30, 73, 46, 0.06)",
};

const labelStyle: CSSProperties = {
  display: "block",
  marginBottom: "8px",
  color: "#294c36",
  fontSize: "14px",
  fontWeight: 700,
};

const inputStyle: CSSProperties = {
  boxSizing: "border-box",
  width: "100%",
  padding: "13px 15px",
  border: `1px solid ${colors.border}`,
  borderRadius: "11px",
  background: "#ffffff",
  color: colors.darkGreen,
  fontFamily: "inherit",
  fontSize: "15px",
  outline: "none",
};

const sectionLabelStyle: CSSProperties = {
  margin: 0,
  color: "#2b7748",
  fontSize: "11px",
  fontWeight: 800,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
};

const buttonStyle: CSSProperties = {
  padding: "12px 20px",
  borderRadius: "11px",
  fontFamily: "inherit",
  fontSize: "14px",
  fontWeight: 800,
  cursor: "pointer",
};

const tagOptions = [
  ["entrepreneurship", "Entrepreneurship"],
  ["meaningful-work", "Meaningful Work"],
  ["business-basics", "Business Basics"],
  ["personal-growth", "Personal Growth"],
  ["social-media", "Social Media"],
  ["personal-brand", "Personal Brand"],
  ["usana", "USANA"],
  ["brand-partner", "Brand Partner"],
  ["training-support", "Training & Support"],
  ["team-story", "Team Story"],
  ["events", "Events"],
  ["freedom-to-decide", "Freedom to Decide"],
];

export default async function NewJoinTeamPage({
  searchParams,
}: NewJoinTeamPageProps) {
  const params = await searchParams;
  const requestedType = String(params.type || "article").toLowerCase();

  const config =
    creatorConfigs[requestedType] ||
    creatorConfigs.article;

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "34px 38px 60px",
        background: colors.page,
      }}
    >
      <form action={createContentAction}>
        <input
          type="hidden"
          name="type"
          value={config.databaseType}
        />
        <input
          type="hidden"
          name="studio_context"
          value="community"
        />
        <input
          type="hidden"
          name="primary_section"
          value="Join Our Team"
        />
        <input
          type="hidden"
          name="topic"
          value={requestedType}
        />
        <input
          type="hidden"
          name="category"
          value="Join Our Team"
        />
        <input
          type="hidden"
          name="reading_minutes"
          value={config.readingMinutes}
        />
        <input type="hidden" name="image_url" value="" />

        {config.databaseType !== "video" ? (
          <input type="hidden" name="video_url" value="" />
        ) : null}

        <div
          style={{
            maxWidth: "1480px",
            margin: "0 auto",
          }}
        >
          <header
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "24px",
              marginBottom: "28px",
            }}
          >
            <div>
              <Link
                href="/studio/community"
                style={{
                  display: "inline-block",
                  marginBottom: "18px",
                  color: "#496a55",
                  fontSize: "14px",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                ← Back to Join Our Team
              </Link>

              <p style={sectionLabelStyle}>
                WonderfulLife Studio
              </p>

              <h1
                style={{
                  margin: "8px 0 0",
                  color: colors.darkGreen,
                  fontSize: "40px",
                  lineHeight: 1.1,
                  letterSpacing: "-0.03em",
                }}
              >
                Create {config.label}
              </h1>

              <p
                style={{
                  maxWidth: "760px",
                  margin: "12px 0 0",
                  color: colors.muted,
                  fontSize: "15px",
                  lineHeight: 1.7,
                }}
              >
                {config.description}
              </p>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                paddingTop: "32px",
              }}
            >
              <button
                type="submit"
                name="status"
                value="draft"
                style={{
                  ...buttonStyle,
                  border: "1px solid #bcd2c0",
                  background: "#eaf3ea",
                  color: colors.green,
                }}
              >
                Save Draft
              </button>

              <button
                type="submit"
                name="status"
                value="published"
                style={{
                  ...buttonStyle,
                  padding: "12px 22px",
                  border: "none",
                  background: colors.green,
                  color: "#ffffff",
                  boxShadow:
                    "0 8px 18px rgba(36, 107, 64, 0.2)",
                }}
              >
                Publish {config.label}
              </button>
            </div>
          </header>

          <div
            style={{
              marginBottom: "24px",
              padding: "18px 20px",
              border: "1px solid #d5e3d4",
              borderRadius: "14px",
              background:
                "linear-gradient(135deg, #edf5ed, #ffffff)",
            }}
          >
            <p style={sectionLabelStyle}>
              Publishing Standard
            </p>

            <strong
              style={{
                display: "block",
                marginTop: "5px",
                color: colors.darkGreen,
                fontSize: "18px",
              }}
            >
              Information. Support. Freedom to Decide.
            </strong>

            <p
              style={{
                margin: "6px 0 0",
                color: colors.muted,
                fontSize: "13px",
                lineHeight: 1.6,
              }}
            >
              Explain clearly. Set realistic expectations.
              Offer support. Never manufacture urgency or
              pressure someone toward a decision.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(0, 1fr) minmax(300px, 360px)",
              alignItems: "start",
              gap: "24px",
            }}
          >
            <section
              style={{
                display: "flex",
                minWidth: 0,
                flexDirection: "column",
                gap: "24px",
              }}
            >
              <div
                style={{
                  ...cardStyle,
                  padding: "26px",
                }}
              >
                <p style={sectionLabelStyle}>
                  {config.label} Details
                </p>

                <h2
                  style={{
                    margin: "6px 0 22px",
                    color: colors.darkGreen,
                    fontSize: "22px",
                  }}
                >
                  Start with the essentials
                </h2>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                  }}
                >
                  <div>
                    <label
                      htmlFor="join-title"
                      style={labelStyle}
                    >
                      {config.label} title
                    </label>

                    <input
                      id="join-title"
                      name="title"
                      type="text"
                      required
                      placeholder={`Enter a clear ${config.label.toLowerCase()} title`}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="join-slug"
                      style={labelStyle}
                    >
                      URL slug
                    </label>

                    <div
                      style={{
                        display: "flex",
                        overflow: "hidden",
                        border: `1px solid ${colors.border}`,
                        borderRadius: "11px",
                        background: "#ffffff",
                      }}
                    >
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          padding: "0 14px",
                          borderRight:
                            `1px solid ${colors.border}`,
                          background: "#f4f7f3",
                          color: colors.muted,
                          fontSize: "13px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        wonderfullife.ca/
                        {config.databaseType === "video"
                          ? "videos/"
                          : "articles/"}
                      </span>

                      <input
                        id="join-slug"
                        name="slug"
                        type="text"
                        placeholder="Leave blank to generate from title"
                        style={{
                          minWidth: 0,
                          flex: 1,
                          padding: "13px 14px",
                          border: "none",
                          color: colors.darkGreen,
                          fontFamily: "inherit",
                          fontSize: "14px",
                          outline: "none",
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="join-excerpt"
                      style={labelStyle}
                    >
                      Short description
                    </label>

                    <textarea
                      id="join-excerpt"
                      name="excerpt"
                      rows={4}
                      placeholder="Write a clear, useful summary for visitors."
                      style={{
                        ...inputStyle,
                        resize: "vertical",
                        lineHeight: 1.6,
                      }}
                    />
                  </div>

                  {config.databaseType === "video" ? (
                    <div>
                      <label style={labelStyle}>
                        Video
                      </label>

                      <VideoUpload />
                    </div>
                  ) : null}
                </div>
              </div>

              <div style={cardStyle}>
                <div
                  style={{
                    padding: "22px 26px",
                    borderBottom:
                      `1px solid ${colors.border}`,
                  }}
                >
                  <p style={sectionLabelStyle}>
                    {config.bodyLabel}
                  </p>

                  <h2
                    style={{
                      margin: "6px 0 0",
                      color: colors.darkGreen,
                      fontSize: "22px",
                    }}
                  >
                    Create useful, decision-friendly content
                  </h2>

                  <p
                    style={{
                      margin: "8px 0 0",
                      color: colors.muted,
                      fontSize: "13px",
                      lineHeight: 1.6,
                    }}
                  >
                    {config.bodyHelp}
                  </p>
                </div>

                <div
                  style={{
                    padding: "24px 26px 26px",
                  }}
                >
                  <RichTextEditor />
                </div>
              </div>
            </section>

            <aside
              style={{
                display: "flex",
                minWidth: 0,
                flexDirection: "column",
                gap: "24px",
              }}
            >
              <div
                style={{
                  ...cardStyle,
                  padding: "22px",
                }}
              >
                <p style={sectionLabelStyle}>
                  Featured Image
                </p>

                <h2
                  style={{
                    margin: "6px 0 0",
                    color: colors.darkGreen,
                    fontSize: "20px",
                  }}
                >
                  {config.label} cover
                </h2>

                <FeaturedImageUpload />
              </div>

              <div
                style={{
                  ...cardStyle,
                  padding: "22px",
                }}
              >
                <p style={sectionLabelStyle}>
                  Classification
                </p>

                <div
                  style={{
                    marginTop: "18px",
                  }}
                >
                  <label
                    htmlFor="primary-section"
                    style={labelStyle}
                  >
                    Primary Section
                  </label>

                  <select
                    id="primary-section"
                    name="primary_section"
                    defaultValue="Join Our Team"
                    style={inputStyle}
                  >
                    <option value="Join Our Team">
                      Join Our Team
                    </option>
                  </select>

                  <p
                    style={{
                      margin: "7px 0 0",
                      color: colors.muted,
                      fontSize: "11px",
                      lineHeight: 1.45,
                    }}
                  >
                    Determines where this content appears on WonderfulLife.
                  </p>
                </div>

                <div
                  style={{
                    marginTop: "18px",
                    padding: "14px",
                    borderRadius: "12px",
                    background: colors.softGreen,
                  }}
                >
                  <strong
                    style={{
                      display: "block",
                      color: colors.darkGreen,
                      fontSize: "14px",
                    }}
                  >
                    Join Our Team
                  </strong>

                  <span
                    style={{
                      display: "block",
                      marginTop: "4px",
                      color: colors.muted,
                      fontSize: "12px",
                    }}
                  >
                    Content format: {config.label}
                  </span>
                </div>

                <label
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "11px",
                    marginTop: "16px",
                    padding: "14px",
                    border: `1px solid ${colors.border}`,
                    borderRadius: "12px",
                    background: "#fafcf9",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    name="featured"
                    style={{
                      marginTop: "3px",
                      accentColor: colors.green,
                    }}
                  />

                  <span>
                    <strong
                      style={{
                        display: "block",
                        color: "#294c36",
                        fontSize: "14px",
                      }}
                    >
                      Feature this content
                    </strong>

                    <span
                      style={{
                        display: "block",
                        marginTop: "4px",
                        color: colors.muted,
                        fontSize: "12px",
                        lineHeight: 1.5,
                      }}
                    >
                      Prioritize it in Join Our Team
                      featured areas.
                    </span>
                  </span>
                </label>
              </div>

              <div
                style={{
                  ...cardStyle,
                  padding: "22px",
                }}
              >
                <p style={sectionLabelStyle}>
                  Tags
                </p>

                <h2
                  style={{
                    margin: "6px 0 4px",
                    color: colors.darkGreen,
                    fontSize: "20px",
                  }}
                >
                  Help organize this resource
                </h2>

                <p
                  style={{
                    margin: "0 0 16px",
                    color: colors.muted,
                    fontSize: "12px",
                    lineHeight: 1.5,
                  }}
                >
                  Choose any tags that apply.
                </p>

                <select
                  name="tags"
                  multiple
                  size={9}
                  style={{
                    ...inputStyle,
                    minHeight: "220px",
                  }}
                >
                  {tagOptions.map(
                    ([value, label]) => (
                      <option
                        key={value}
                        value={value}
                      >
                        {label}
                      </option>
                    )
                  )}
                </select>

                <p
                  style={{
                    margin: "8px 0 0",
                    color: colors.muted,
                    fontSize: "11px",
                    lineHeight: 1.45,
                  }}
                >
                  Hold Ctrl while clicking to choose
                  multiple tags.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </form>
    </main>
  );
}