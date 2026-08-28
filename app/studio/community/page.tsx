import Link from "next/link";

const contentTypes = [
  {
    icon: "✎",
    title: "Article",
    description:
      "Thoughtful articles about entrepreneurship, meaningful work, personal growth, and building something of your own.",
  },
  {
    icon: "▤",
    title: "Guide",
    description:
      "Clear, practical guides that help visitors understand opportunities, expectations, skills, and next steps.",
  },
  {
    icon: "▶",
    title: "Video",
    description:
      "Educational videos, Zoey introductions, conversations, presentations, and behind-the-scenes stories.",
  },
  {
    icon: "♡",
    title: "Story",
    description:
      "Share authentic experiences, personal journeys, lessons learned, and perspectives from people in the community.",
  },
  {
    icon: "?",
    title: "FAQ",
    description:
      "Answer the questions people naturally have before considering entrepreneurship or a partnership.",
  },
  {
    icon: "◷",
    title: "Event",
    description:
      "Create information sessions, online presentations, workshops, meetups, and other upcoming events.",
  },
  {
    icon: "◇",
    title: "Opportunity",
    description:
      "Explain the USANA Brand Partner opportunity clearly, including how it works, support, expectations, and considerations.",
  },
];

const principles = [
  {
    title: "Information",
    text: "Give people clear, useful information so they can understand what an opportunity actually involves.",
  },
  {
    title: "Support",
    text: "Provide education, resources, encouragement, and practical help without creating pressure.",
  },
  {
    title: "Freedom to Decide",
    text: "Give people the space to decide whether an opportunity fits their life, interests, and goals.",
  },
];

export default function StudioCommunityPage() {
  return (
    <div className="studio-section">
      {/* HEADER */}
      <div className="studio-section__heading">
        <div>
          <p className="studio-section__eyebrow">
            WonderfulLife Studio
          </p>

          <h1 className="studio-section__title">
            Join Our Team
          </h1>

          <p className="studio-section__description">
            Create thoughtful entrepreneurship resources, educational
            articles, videos, guides, stories, FAQs, events, and opportunity
            information for the WonderfulLife Join Our Team experience.
          </p>
        </div>

        <div className="studio-section__aside">
          Version 1.0
        </div>
      </div>

      {/* PHILOSOPHY */}
      <div
        className="studio-card"
        style={{
          padding: "34px",
          marginBottom: "24px",
          background:
            "linear-gradient(135deg, #f4f8f2 0%, #ffffff 100%)",
        }}
      >
        <p
          style={{
            margin: "0 0 8px",
            color: "#287244",
            fontSize: "12px",
            fontWeight: 900,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
          }}
        >
          Our Publishing Philosophy
        </p>

        <h2
          style={{
            margin: "0 0 12px",
            color: "#173d29",
            fontSize: "30px",
          }}
        >
          Information. Support. Freedom to Decide.
        </h2>

        <p
          style={{
            margin: 0,
            maxWidth: "850px",
            color: "#5d6c63",
            fontSize: "16px",
            lineHeight: 1.75,
          }}
        >
          People should have the opportunity to do something they enjoy —
          and, more importantly, enjoy what they do. Our role is to provide
          honest information, practical support, and useful resources so
          visitors can make their own informed decisions.
        </p>
      </div>

      {/* PRINCIPLES */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        {principles.map((principle) => (
          <div
            key={principle.title}
            className="studio-card"
            style={{
              padding: "24px",
            }}
          >
            <h3
              style={{
                margin: "0 0 8px",
                color: "#173d29",
                fontSize: "19px",
              }}
            >
              {principle.title}
            </h3>

            <p
              style={{
                margin: 0,
                color: "#68766d",
                fontSize: "14px",
                lineHeight: 1.65,
              }}
            >
              {principle.text}
            </p>
          </div>
        ))}
      </div>

      {/* CREATOR */}
      <div style={{ marginBottom: "18px" }}>
        <p className="studio-section__eyebrow">
          Create
        </p>

        <h2
          style={{
            margin: "4px 0 8px",
            color: "#173d29",
            fontSize: "28px",
          }}
        >
          What would you like to create?
        </h2>

        <p
          style={{
            margin: 0,
            color: "#68766d",
            fontSize: "15px",
          }}
        >
          Build the educational library behind the WonderfulLife Join Our
          Team experience.
        </p>
      </div>

      {/* CONTENT TYPES */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "18px",
          marginBottom: "36px",
        }}
      >
        {contentTypes.map((item) => (
          <div
            key={item.title}
            className="studio-card"
            style={{
              padding: "26px",
              display: "flex",
              flexDirection: "column",
              minHeight: "210px",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "14px",
                background: "#edf5ea",
                color: "#287244",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                fontWeight: 800,
                marginBottom: "18px",
              }}
            >
              {item.icon}
            </div>

            <h3
              style={{
                margin: "0 0 9px",
                color: "#173d29",
                fontSize: "20px",
              }}
            >
              {item.title}
            </h3>

            <p
              style={{
                margin: "0 0 20px",
                color: "#68766d",
                fontSize: "14px",
                lineHeight: 1.6,
                flex: 1,
              }}
            >
              {item.description}
            </p>

            <Link
              href={`/studio/community/new?type=${item.title.toLowerCase()}`}
              className="studio-button studio-button--primary"
              style={{
                alignSelf: "flex-start",
              }}
            >
              Create {item.title}
            </Link>
          </div>
        ))}
      </div>

      {/* CONTENT LIBRARY */}
      <div
        className="studio-card"
        style={{
          padding: "30px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <p
              style={{
                margin: "0 0 6px",
                color: "#287244",
                fontSize: "11px",
                fontWeight: 900,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              Library
            </p>

            <h2
              style={{
                margin: "0 0 6px",
                color: "#173d29",
                fontSize: "24px",
              }}
            >
              Join Our Team Content
            </h2>

            <p
              style={{
                margin: 0,
                color: "#68766d",
                fontSize: "14px",
              }}
            >
              Your published resources, drafts, events, stories, and
              opportunity information will appear here.
            </p>
          </div>

          <Link
            href="/studio/community/library"
            className="studio-button"
          >
            View Content Library
          </Link>
        </div>
      </div>

      {/* PUBLIC PAGE */}
      <div
        className="studio-card"
        style={{
          padding: "30px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <p
              style={{
                margin: "0 0 6px",
                color: "#287244",
                fontSize: "11px",
                fontWeight: 900,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              Public Experience
            </p>

            <h2
              style={{
                margin: "0 0 6px",
                color: "#173d29",
                fontSize: "24px",
              }}
            >
              Join Our Team Homepage
            </h2>

            <p
              style={{
                margin: 0,
                color: "#68766d",
                fontSize: "14px",
              }}
            >
              Preview the public Join Our Team experience and see how your
              educational content fits into the visitor journey.
            </p>
          </div>

          <Link
            href="/community"
            className="studio-button studio-button--primary"
          >
            View Public Page →
          </Link>
        </div>
      </div>
    </div>
  );
}