import Link from "next/link";
import StudioCard from "../ui/StudioCard";
import "../styles/LiveDashboard.css";

const quickCreateItems = [
  {
    title: "New Article",
    description: "Write and publish a wellness article.",
    href: "/studio/articles/new",
    icon: "📝",
    tone: "article",
  },
  {
    title: "New Recipe",
    description: "Create a healthy recipe with Zoey.",
    href: "/studio/recipes/new",
    icon: "🥗",
    tone: "recipe",
  },
  {
    title: "New Video",
    description: "Plan a video script or presentation.",
    href: "/studio/videos/new",
    icon: "🎥",
    tone: "video",
  },
  {
    title: "Ask Zoey",
    description: "Generate fresh wellness content ideas.",
    href: "/studio/ai",
    icon: "✨",
    tone: "zoey",
  },
];

export default function QuickCreate() {
  return (
    <StudioCard className="quick-create" padding="large">
      <div className="quick-create__header">
        <div>
          <p className="quick-create__eyebrow">Create</p>

          <h2 className="quick-create__title">
            Quick Create
          </h2>

          <p className="quick-create__description">
            Start creating new WonderfulLife content.
          </p>
        </div>
      </div>

      <div className="quick-create__grid">
        {quickCreateItems.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className={`quick-create__item quick-create__item--${item.tone}`}
          >
            <div className="quick-create__icon">
              {item.icon}
            </div>

            <div className="quick-create__content">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>

            <span
              className="quick-create__arrow"
              aria-hidden="true"
            >
              →
            </span>
          </Link>
        ))}
      </div>
    </StudioCard>
  );
}