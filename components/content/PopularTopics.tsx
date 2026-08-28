type PopularTopic = {
  name: string;
  count: number;
};

type PopularTopicsProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  topics: PopularTopic[];
  maxItems?: number;
};

function pretty(value: string) {
  return String(value || "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function PopularTopics({
  eyebrow = "Explore WonderfulLife",
  title = "Popular Wellness Topics",
  description = "Explore the subjects appearing most often throughout the WonderfulLife wellness library.",
  topics,
  maxItems = 8,
}: PopularTopicsProps) {
  const visibleTopics = topics.slice(0, maxItems);

  if (visibleTopics.length === 0) {
    return null;
  }

  return (
    <section className="popular-topics-section">
      <style>{`
        .popular-topics-section {
          width: min(100% - 48px, 1320px);
          margin: 76px auto 0;
        }

        .popular-topics-panel {
          padding: 34px;
          border: 1px solid #dce5dc;
          border-radius: 24px;
          background:
            linear-gradient(
              135deg,
              #f0f7ef 0%,
              #fbfdf9 100%
            );
        }

        .popular-topics-eyebrow {
          margin: 0 0 8px;
          color: #287244;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.17em;
          text-transform: uppercase;
        }

        .popular-topics-title {
          margin: 0;
          color: #173d29;
          font-family:
            Georgia,
            "Times New Roman",
            serif;
          font-size: clamp(32px, 4vw, 46px);
          line-height: 1.05;
          letter-spacing: -0.025em;
        }

        .popular-topics-description {
          max-width: 720px;
          margin: 10px 0 0;
          color: #748178;
          font-size: 14px;
          line-height: 1.65;
        }

        .popular-topics-grid {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 26px;
        }

        .popular-topic {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          min-height: 46px;
          padding: 10px 14px;
          border: 1px solid #d8e4d7;
          border-radius: 999px;
          background: #ffffff;
          color: #285f3e;
          font-size: 12px;
          font-weight: 850;
          box-shadow:
            0 3px 10px
            rgba(26, 68, 40, 0.025);
          transition:
            transform 0.16s ease,
            border-color 0.16s ease,
            box-shadow 0.16s ease;
        }

        .popular-topic:hover {
          transform: translateY(-2px);
          border-color: #aac5af;
          box-shadow:
            0 8px 16px
            rgba(26, 68, 40, 0.07);
        }

        .popular-topic-count {
          display: grid;
          min-width: 25px;
          height: 25px;
          padding: 0 7px;
          place-items: center;
          border-radius: 999px;
          background: #e7f2e6;
          color: #286d43;
          font-size: 9px;
          font-weight: 900;
        }

        @media (max-width: 650px) {
          .popular-topics-section {
            width: min(100% - 24px, 1320px);
            margin-top: 54px;
          }

          .popular-topics-panel {
            padding: 26px 22px;
          }

          .popular-topic {
            flex: 1 1 auto;
            justify-content: space-between;
          }
        }
      `}</style>

      <div className="popular-topics-panel">
        <p className="popular-topics-eyebrow">
          {eyebrow}
        </p>

        <h2 className="popular-topics-title">
          {title}
        </h2>

        {description ? (
          <p className="popular-topics-description">
            {description}
          </p>
        ) : null}

        <div className="popular-topics-grid">
          {visibleTopics.map((topic) => (
            <span
              key={topic.name}
              className="popular-topic"
            >
              {pretty(topic.name)}

              <span className="popular-topic-count">
                {topic.count}
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}