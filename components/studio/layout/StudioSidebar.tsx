
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const mainNavigation = [
  {
    label: "Dashboard",
    href: "/studio",
    icon: "⌂",
  },
  {
    label: "Articles",
    href: "/studio/articles",
    icon: "✎",
  },
  {
    label: "Recipes",
    href: "/studio/recipes",
    icon: "⌘",
  },
  {
    label: "Videos",
    href: "/studio/videos",
    icon: "▶",
  },
  {
    label: "Products",
    href: "/studio/products",
    icon: "◇",
  },
  {
    label: "Community",
    href: "/studio/community",
    icon: "♡",
  },
];

const secondaryNavigation = [
  {
    label: "Media Library",
    href: "/studio/media",
    icon: "▧",
  },
  {
    label: "Templates",
    href: "/studio/templates",
    icon: "▤",
  },
  {
    label: "Settings",
    href: "/studio/settings",
    icon: "⚙",
  },
];

export default function StudioSidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/studio") {
      return pathname === "/studio";
    }

    return pathname.startsWith(href);
  }

  return (
    <aside className="studio-sidebar">
      <div className="studio-sidebar__content">
        <div className="studio-sidebar__section">
          <p className="studio-sidebar__label">Create</p>

          <nav
            className="studio-sidebar__navigation"
            aria-label="Studio content navigation"
          >
            {mainNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={
                  isActive(item.href)
                    ? "studio-sidebar__link studio-sidebar__link--active"
                    : "studio-sidebar__link"
                }
              >
                <span
                  className="studio-sidebar__icon"
                  aria-hidden="true"
                >
                  {item.icon}
                </span>

                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="studio-sidebar__divider" />

        <div className="studio-sidebar__section">
          <p className="studio-sidebar__label">Manage</p>

          <nav
            className="studio-sidebar__navigation"
            aria-label="Studio management navigation"
          >
            {secondaryNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={
                  isActive(item.href)
                    ? "studio-sidebar__link studio-sidebar__link--active"
                    : "studio-sidebar__link"
                }
              >
                <span
                  className="studio-sidebar__icon"
                  aria-hidden="true"
                >
                  {item.icon}
                </span>

                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="studio-sidebar__zoey-card">
        <div className="studio-sidebar__zoey-avatar">Z</div>

        <div>
          <strong>Need inspiration?</strong>
          <p>Ask Zoey to help create your next piece of content.</p>
        </div>

        <Link
          href="/studio"
          className="studio-sidebar__zoey-button"
        >
          Ask Zoey
        </Link>
      </div>
    </aside>
  );
}