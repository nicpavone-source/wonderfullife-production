"use client";

import { useEffect, useState } from "react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > 500);
    }

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <>
      <style>{`
        .wl-back-to-top {
          position: fixed;
          right: 22px;
          bottom: 24px;
          z-index: 9999;

          display: grid;
          width: 50px;
          height: 50px;
          place-items: center;

          border: 1px solid rgba(255, 255, 255, 0.75);
          border-radius: 50%;

          background: rgba(24, 103, 63, 0.94);
          color: #ffffff;

          font-size: 24px;
          font-weight: 700;
          line-height: 1;

          cursor: pointer;

          box-shadow:
            0 10px 30px rgba(20, 61, 41, 0.22);

          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);

          opacity: 0;
          visibility: hidden;

          transform: translateY(12px);

          transition:
            opacity 180ms ease,
            transform 180ms ease,
            visibility 180ms ease,
            background 180ms ease;

          -webkit-tap-highlight-color: transparent;
        }

        .wl-back-to-top.visible {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .wl-back-to-top:hover {
          background: #145b38;
          transform: translateY(-2px);
        }

        .wl-back-to-top:active {
          transform: scale(0.96);
        }

        .wl-back-to-top:focus-visible {
          outline: 3px solid rgba(90, 168, 68, 0.4);
          outline-offset: 3px;
        }

        @media (max-width: 760px) {
          .wl-back-to-top {
            right: 16px;

            /*
             * Keeps the button above the bottom
             * of the mobile viewport.
             */
            bottom: calc(
              20px + env(safe-area-inset-bottom)
            );

            width: 48px;
            height: 48px;

            font-size: 22px;
          }
        }

        @media print {
          .wl-back-to-top {
            display: none !important;
          }
        }
      `}</style>

      <button
        type="button"
        className={`wl-back-to-top ${
          visible ? "visible" : ""
        }`}
        onClick={scrollToTop}
        aria-label="Back to top"
        title="Back to top"
      >
        ↑
      </button>
    </>
  );
}