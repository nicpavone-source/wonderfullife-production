"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

function LeafIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none">
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

function UserIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none">
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

export default function Hero() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.volume = 0.04;

    let started = false;

    const removeListeners = () => {
      window.removeEventListener("pointerdown", startAudio);
      window.removeEventListener("touchstart", startAudio);
      window.removeEventListener("keydown", startAudio);
      window.removeEventListener("scroll", startAudio);
    };

    const startAudio = async () => {
      if (started) {
        return;
      }

      try {
        await audio.play();
        started = true;
        removeListeners();
      } catch {
        // Browser may require the visitor's first interaction.
      }
    };

    startAudio();

    window.addEventListener("pointerdown", startAudio, {
      passive: true,
    });

    window.addEventListener("touchstart", startAudio, {
      passive: true,
    });

    window.addEventListener("keydown", startAudio);

    window.addEventListener("scroll", startAudio, {
      passive: true,
    });

    const handleVisibility = () => {
      if (
        document.visibilityState === "visible" &&
        audio.paused
      ) {
        startAudio();
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {
      removeListeners();

      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, []);

  return (
    <section
      className="wl-hero"
      style={{
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        className="wl-hero-media"
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
        }}
      >
        {/* DESKTOP / TABLET HERO */}
        <Image
          src="/images/homepage-approved.png"
          alt="Zoey overlooking Vancouver Harbour from a bright terrace"
          fill
          priority
          sizes="100vw"
          className="wl-hero-image wl-hero-image-desktop"
        />

        {/* APPROVED CLEAN MOBILE HERO */}
        <Image
          src="/images/homepage-mobile-zoey-approved.png"
          alt="Zoey welcoming visitors to WonderfulLife overlooking Vancouver Harbour"
          fill
          priority
          sizes="(max-width: 640px) 100vw, 1px"
          className="wl-hero-image wl-hero-image-mobile"
        />

        <div
          className="wl-harbour-light"
          aria-hidden="true"
        />

        <div
          className="wl-harbour-water"
          aria-hidden="true"
        />

        <div
          className="wl-harbour-glow"
          aria-hidden="true"
        />
      </div>

      <div className="wl-hero-gradient" />

      <div className="wl-hero-content">
        <p className="wl-hero-eyebrow">
          <span aria-hidden="true" />
          Welcome to WonderfulLife
        </p>

        <h1 className="wl-hero-title">
          Discover your
          <br />
          path to a healthier,
          <br />
          <em>happier life.</em>
        </h1>

        <p className="wl-hero-description">
          Explore practical wellness guidance, nourishing recipes,
          inspiring stories and supportive tools created to help you
          become your best self.
        </p>

        <div className="wl-hero-actions">
          <Link
            href="/articles"
            className="wl-hero-button wl-hero-button-primary"
          >
            <LeafIcon />
            <span>Explore Wellness</span>
          </Link>

          <Link
            href="/meet-zoey"
            className="wl-hero-button wl-hero-button-light"
          >
            <UserIcon />
            <span>Meet Zoey</span>
          </Link>
        </div>
      </div>

      <audio
        ref={audioRef}
        src="/audio/wonderfullife-harbour.mp3"
        autoPlay
        loop
        preload="auto"
        playsInline
        aria-hidden="true"
      />
    </section>
  );
}