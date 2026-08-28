"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  { label: "Dashboard", href: "/studio" },
  { label: "Articles", href: "/studio/articles" },
  { label: "Recipes", href: "/studio/recipes" },
  { label: "Videos", href: "/studio/videos" },
  { label: "Products", href: "/studio/products" },
  { label: "Community", href: "/studio/community" },
];

export default function StudioHeader() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/studio") {
      return pathname === "/studio";
    }

    return pathname.startsWith(href);
  }

  return (
    <header className="studio-header">
      <Link href="/studio" className="studio-header__brand">
        <span className="studio-header__brand-mark">◆</span>

        <span className="studio-header__brand-copy">
          <strong>WONDERFULLIFE</strong>
          <small>STUDIO</small>
        </span>
      </Link>

      <nav
        className="studio-header__navigation"
        aria-label="Studio navigation"
      >
        {navigationItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={
              isActive(item.href)
                ? "studio-header__link studio-header__link--active"
                : "studio-header__link"
            }
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="studio-header__profile">
        <span className="studio-header__avatar">Z</span>

        <div className="studio-header__profile-copy">
          <small>Welcome back</small>
          <strong>Hi Zoey!</strong>
        </div>
      </div>
    </header>
  );
}