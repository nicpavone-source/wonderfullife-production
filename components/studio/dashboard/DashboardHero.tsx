import StudioButton from "../ui/StudioButton";

export default function DashboardHero() {
  return (
    <section className="dashboard-hero">
      <div className="dashboard-hero__content">
        <p className="dashboard-hero__eyebrow">
          Zoey AI Content Studio
        </p>

        <h1 className="dashboard-hero__title">
          Create meaningful wellness content with confidence.
        </h1>

        <p className="dashboard-hero__description">
          Plan, write, organize, and publish WonderfulLife articles,
          recipes, videos, products, and community stories from one
          beautiful workspace.
        </p>

        <div className="dashboard-hero__actions">
          <StudioButton href="/studio/articles/new">
            Create New Article
          </StudioButton>

          <StudioButton
            href="/studio/templates"
            variant="secondary"
          >
            Browse Templates
          </StudioButton>
        </div>
      </div>

      <div className="dashboard-hero__visual">
        <div className="dashboard-hero__glow" />

        <div className="dashboard-hero__zoey">
          <div className="dashboard-hero__avatar">Z</div>

          <div>
            <span className="dashboard-hero__status">
              Zoey is ready
            </span>

            <h2>Your creative wellness partner</h2>

            <p>
              Start with an idea and Zoey will help shape it into
              polished WonderfulLife content.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}