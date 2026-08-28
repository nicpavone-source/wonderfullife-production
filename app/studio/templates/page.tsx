import Link from "next/link";

export default function StudioTemplatesPage() {
  return (
    <div className="studio-section">
      <div className="studio-section__heading">
        <div>
          <p className="studio-section__eyebrow">
            WonderfulLife Studio
          </p>

          <h1 className="studio-section__title">
            Templates
          </h1>

          <p className="studio-section__description">
            Organize reusable templates for articles, recipes, videos,
            product stories, and community posts.
          </p>
        </div>

        <div className="studio-section__aside">
          Version 1.0
        </div>
      </div>

      <div className="studio-card" style={{ padding: "28px" }}>
        <h2 style={{ marginTop: 0 }}>
          Content Templates
        </h2>

        <p>
          This section is connected to the WonderfulLife Studio and ready for
          reusable content templates.
        </p>

        <Link
          href="/studio"
          className="studio-button studio-button--primary"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}