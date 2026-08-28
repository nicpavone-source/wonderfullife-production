"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { signOutAction } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/client";

type IconProps = {
  size?: number;
};

type Member = {
  id: string;
  email: string | null;
  displayName: string;
  avatarUrl: string | null;
};

/* =========================================================
   ICONS
   ========================================================= */

function HomeIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M3 11.5 12 4l9 7.5M5.5 10v10h13V10M9.5 20v-6h5v6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LeafIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M19.5 4.5C12 5 7.5 9.5 7.5 16.5c5.5.5 10-3.5 12-12Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M5 20c2.5-5 6-8.5 11-11"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function NutritionIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M6 3v8M3.5 3v5.5A2.5 2.5 0 0 0 6 11v10M8.5 3v5.5A2.5 2.5 0 0 1 6 11M16 3v18M16 3c3 2.5 4 6.5 0 10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function VideoIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="m10 9 5 3-5 3V9Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CommunityIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle
        cx="9"
        cy="8"
        r="3"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle
        cx="17"
        cy="9"
        r="2.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M3.5 20c0-4 2.3-6.5 5.5-6.5s5.5 2.5 5.5 6.5M14 14.5c3.6-.8 6.5 1.5 6.5 5.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function AskZoeyIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M5 17.5V7.5A2.5 2.5 0 0 1 7.5 5h9A2.5 2.5 0 0 1 19 7.5v6A2.5 2.5 0 0 1 16.5 16H10l-5 3v-1.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 10h6M9 13h4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ShopIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M5 8h14l-1 12H6L5 8Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M9 9V6a3 3 0 0 1 6 0v3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SearchIcon({ size = 21 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle
        cx="11"
        cy="11"
        r="6.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="m16 16 4 4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UserIcon({ size = 21 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle
        cx="12"
        cy="8"
        r="3.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M5.5 21c.5-4.2 2.8-6.5 6.5-6.5s6 2.3 6.5 6.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MenuIcon({ size = 25 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon({ size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M6 6l12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* =========================================================
   NAVIGATION
   ========================================================= */

const links = [
  { label: "Home", href: "/", icon: HomeIcon },
  { label: "Wellness", href: "/wellness", icon: LeafIcon },
  { label: "Nutrition", href: "/nutrition", icon: NutritionIcon },
  { label: "Recipes", href: "/recipes", icon: NutritionIcon },
  { label: "Videos", href: "/videos", icon: VideoIcon },
  { label: "Join Our Team", href: "/community", icon: CommunityIcon },
  { label: "Ask Zoey", href: "/ask-zoey", icon: AskZoeyIcon },
  { label: "Shop", href: "/shop", icon: ShopIcon },
];

function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (!parts.length) return "WL";

  return parts
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

/* =========================================================
   HEADER
   ========================================================= */

export default function Header() {
  const pathname = usePathname();
  const mobileMenuRef = useRef<HTMLDetailsElement | null>(null);

  const [member, setMember] =
    useState<Member | null>(null);

  const [authLoaded, setAuthLoaded] =
    useState(false);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function loadMember() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!active) return;

      if (!user) {
        setMember(null);
        setAuthLoaded(true);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      if (!active) return;

      const displayName =
        profile?.display_name?.trim() ||
        user.user_metadata?.display_name ||
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "WonderfulLife Member";

      setMember({
        id: user.id,
        email: user.email || null,
        displayName,
        avatarUrl:
          profile?.avatar_url ||
          user.user_metadata?.avatar_url ||
          user.user_metadata?.picture ||
          null,
      });

      setAuthLoaded(true);
    }

    loadMember();

    const { data: subscription } =
      supabase.auth.onAuthStateChange(() => {
        loadMember();
      });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (mobileMenuRef.current) {
      mobileMenuRef.current.open = false;
    }
  }, [pathname]);

  return (
    <header className="site-header">
      <style>{`
        .site-header {
          position: relative;
          z-index: 10000;
          overflow: visible;
          background: #ffffff;
          border-bottom: 1px solid rgba(30,70,45,.08);
        }

        .site-header .nav {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 0 20px;
          box-sizing: border-box;
          background: #ffffff;
        }

        .site-header .brand {
          flex: 0 0 auto;
          font-size: clamp(34px, 2.7vw, 48px);
          line-height: .86;
          white-space: nowrap;
          text-decoration: none;
        }

        .site-header .brand small {
          display: block;
          margin-top: 9px;
          font-size: 11px;
          letter-spacing: .24em;
          white-space: nowrap;
        }

        .site-header .links {
          flex: 1 1 auto;
          min-width: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .site-header .links > a {
          flex: 0 0 auto;
          white-space: nowrap;
        }

        .site-header .iconbar {
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        /* ACCOUNT */

        .header-account {
          position: relative;
          display: flex;
          align-items: center;
        }

        .header-account-details {
          position: relative;
        }

        .header-account-summary {
          display: flex;
          width: 38px;
          height: 38px;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border: 0;
          border-radius: 50%;
          background: transparent;
          cursor: pointer;
          list-style: none;
          -webkit-tap-highlight-color: transparent;
        }

        .header-account-summary::-webkit-details-marker {
          display: none;
        }

        .header-avatar {
          display: flex;
          width: 32px;
          height: 32px;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border-radius: 50%;
          background: #e6f0e5;
          color: #23633d;
          font-size: 10px;
          font-weight: 900;
        }

        .header-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .header-account-menu {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          z-index: 100000;
          width: 230px;
          padding: 10px;
          border: 1px solid #dce5dc;
          border-radius: 16px;
          background: #fff;
          box-shadow: 0 18px 50px rgba(25,65,40,.14);
        }

        .header-member {
          padding: 11px 12px 12px;
          border-bottom: 1px solid #e5ebe5;
        }

        .header-member-name {
          margin: 0;
          color: #173d29;
          font-size: 13px;
          font-weight: 900;
        }

        .header-member-email {
          margin: 3px 0 0;
          overflow: hidden;
          color: #7a877f;
          font-size: 10px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .header-account-links {
          display: grid;
          gap: 2px;
          padding-top: 7px;
        }

        .header-account-link,
        .header-signout-button {
          display: flex;
          width: 100%;
          min-height: 38px;
          align-items: center;
          padding: 0 11px;
          border: 0;
          border-radius: 9px;
          background: transparent;
          color: #365343;
          font: inherit;
          font-size: 12px;
          font-weight: 800;
          text-decoration: none;
          cursor: pointer;
          box-sizing: border-box;
        }

        .header-signout-button {
          color: #8a5454;
        }

        .header-auth-loading {
          width: 32px;
          height: 32px;
        }

        /* MOBILE NATIVE MENU */

        .mobile-nav-details {
          display: none;
        }

        @media (max-width: 1450px) {
          .site-header .nav {
            gap: 14px;
            padding-left: 16px;
            padding-right: 16px;
          }

          .site-header .brand {
            font-size: 38px;
          }

          .site-header .links > a {
            font-size: 14px;
          }
        }

        @media (max-width: 1200px) {
          .site-header .brand {
            font-size: 32px;
          }

          .site-header .brand small {
            font-size: 9px;
          }

          .site-header .links > a {
            font-size: 13px;
          }
        }

        @media (max-width: 760px) {
          .site-header {
            z-index: 2147483000;
          }

          .site-header .nav {
            display: grid;
            grid-template-columns: 44px minmax(0,1fr) auto;
            align-items: center;
            gap: 8px;
            min-height: 72px;
            padding: 0 14px;
          }

          .site-header .links {
            display: none !important;
          }

          .mobile-nav-details {
            position: relative;
            display: block;
            width: 42px;
            height: 42px;
            z-index: 2147483005;
          }

          .mobile-nav-summary {
            display: flex;
            width: 42px;
            height: 42px;
            align-items: center;
            justify-content: center;
            padding: 0;
            border-radius: 11px;
            color: #173d29;
            cursor: pointer;
            list-style: none;
            -webkit-tap-highlight-color: transparent;
          }

          .mobile-nav-summary::-webkit-details-marker {
            display: none;
          }

          .mobile-nav-summary::marker {
            display: none;
            content: "";
          }

          .mobile-nav-summary:active {
            background: #eef5ee;
          }

          .mobile-menu-open-icon {
            display: block;
          }

          .mobile-menu-close-icon {
            display: none;
          }

          .mobile-nav-details[open]
          .mobile-menu-open-icon {
            display: none;
          }

          .mobile-nav-details[open]
          .mobile-menu-close-icon {
            display: block;
          }

          .mobile-menu-panel {
            position: fixed;
            top: 72px;
            left: 0;
            right: 0;
            z-index: 2147483640;
            width: 100%;
            max-height: calc(100dvh - 72px);
            overflow-y: auto;
            padding: 10px 14px 18px;
            border-top: 1px solid #edf1ed;
            background: #ffffff;
            box-shadow: 0 20px 38px rgba(29,65,42,.16);
            box-sizing: border-box;
            -webkit-overflow-scrolling: touch;
          }

          .mobile-menu-links {
            display: grid;
            gap: 3px;
            width: 100%;
          }

          .mobile-menu-link {
            display: flex;
            width: 100%;
            min-height: 49px;
            align-items: center;
            gap: 12px;
            padding: 0 14px;
            border-radius: 12px;
            box-sizing: border-box;
            color: #274535;
            font-size: 15px;
            font-weight: 800;
            text-decoration: none;
            -webkit-tap-highlight-color: transparent;
          }

          .mobile-menu-link:active {
            background: #edf5ec;
          }

          .mobile-menu-link[aria-current="page"] {
            background: #f0f6ef;
            color: #1f633d;
          }

          .mobile-menu-link.join-team {
            color: #0072ce;
          }

          .site-header .brand {
            min-width: 0;
            justify-self: center;
            font-size: clamp(26px, 7.7vw, 34px);
            line-height: .9;
            text-align: center;
          }

          .site-header .brand small {
            margin-top: 6px;
            font-size: 8px;
            letter-spacing: .22em;
            color: #536d5c;
            font-weight: 700;
          }

          .site-header .iconbar {
            justify-self: end;
            gap: 7px;
            margin: 0;
          }

          .site-header .iconbar > a {
            display: inline-flex;
            width: 36px;
            height: 36px;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
          }

          .header-account-summary {
            width: 36px;
            height: 36px;
          }

          .header-avatar {
            width: 34px;
            height: 34px;
            font-size: 11px;
          }

          .header-account-menu {
            position: fixed;
            top: 68px;
            right: 10px;
          }
        }
      `}</style>

      <div className="nav">
        {/* NATIVE MOBILE HAMBURGER */}

        <details ref={mobileMenuRef} className="mobile-nav-details">
          <summary
            className="mobile-nav-summary"
            aria-label="Navigation menu"
          >
            <span className="mobile-menu-open-icon">
              <MenuIcon />
            </span>

            <span className="mobile-menu-close-icon">
              <CloseIcon />
            </span>
          </summary>

          <div className="mobile-menu-panel">
            <nav
              className="mobile-menu-links"
              aria-label="Mobile navigation"
            >
              {links.map(({ label, href, icon: Icon }) => {
                const active =
                  href === "/"
                    ? pathname === "/"
                    : pathname === href ||
                      pathname.startsWith(`${href}/`);

                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`mobile-menu-link ${
                      label === "Join Our Team"
                        ? "join-team"
                        : ""
                    }`}
                    onClick={() => {
                      if (mobileMenuRef.current) {
                        mobileMenuRef.current.open = false;
                      }
                    }}
                  >
                    <Icon size={19} />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </details>

        {/* BRAND */}

        <Link
          href="/"
          className="brand"
          aria-label="WonderfulLife home"
        >
          Wonder
          <span className="leaf">ful</span>
          Life

          <small>Live your best life</small>
        </Link>

        {/* DESKTOP NAV */}

        <nav className="links" aria-label="Main navigation">
          {links.map(({ label, href, icon: Icon }) => {
            const active =
              href === "/"
                ? pathname === "/"
                : pathname === href ||
                  pathname.startsWith(`${href}/`);

            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  whiteSpace: "nowrap",
                  color:
                    label === "Join Our Team"
                      ? "#0072CE"
                      : active
                        ? "var(--wl-green)"
                        : undefined,
                }}
              >
                <Icon />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* SEARCH + ACCOUNT */}

        <div className="iconbar">
          <Link href="/search" aria-label="Search">
            <SearchIcon />
          </Link>

          {!authLoaded ? (
            <span
              className="header-auth-loading"
              aria-hidden="true"
            />
          ) : member ? (
            <div className="header-account">
              <details className="header-account-details">
                <summary
                  className="header-account-summary"
                  aria-label="Member account"
                >
                  <span className="header-avatar">
                    {member.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={member.avatarUrl}
                        alt=""
                      />
                    ) : (
                      getInitials(member.displayName)
                    )}
                  </span>
                </summary>

                <div className="header-account-menu">
                  <div className="header-member">
                    <p className="header-member-name">
                      {member.displayName}
                    </p>

                    {member.email ? (
                      <p className="header-member-email">
                        {member.email}
                      </p>
                    ) : null}
                  </div>

                  <div className="header-account-links">
                    <Link
                      href="/dashboard"
                      className="header-account-link"
                    >
                      Dashboard
                    </Link>

                    <Link
                      href="/saved"
                      className="header-account-link"
                    >
                      Saved Content
                    </Link>

                    <form action={signOutAction}>
                      <button
                        type="submit"
                        className="header-signout-button"
                      >
                        Sign Out
                      </button>
                    </form>
                  </div>
                </div>
              </details>
            </div>
          ) : (
            <Link href="/sign-in" aria-label="Sign in">
              <UserIcon />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}