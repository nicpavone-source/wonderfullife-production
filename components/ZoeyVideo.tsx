"use client";

import { useRef, useState } from "react";

export default function ZoeyVideo() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [started, setStarted] = useState(false);

  async function startVideo() {
    const video = videoRef.current;

    if (!video) return;

    video.muted = false;

    try {
      await video.play();
      setStarted(true);
    } catch {
      // Native video controls remain available if playback is blocked.
    }
  }

  return (
    <section className="zoey-video-card">
      <style>{`
        .zoey-video-card {
          position: relative;
          width: 100%;
          min-height: 650px;
          overflow: hidden;
          border-radius: 30px;
          background: #173d29;
          box-shadow: 0 24px 70px rgba(20, 61, 41, 0.12);
        }

        .zoey-video-element {
          position: absolute;
          inset: 0;
          z-index: 0;
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: 60% center;
          background: #173d29;
        }

        .zoey-video-overlay {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          background:
            linear-gradient(
              to top,
              rgba(8, 38, 25, 0.46) 0%,
              rgba(8, 38, 25, 0.08) 28%,
              rgba(8, 38, 25, 0) 55%
            );
        }

        .zoey-video-start {
          position: absolute;
          top: 50%;
          left: 50%;
          z-index: 3;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 0;
          border: 0;
          background: transparent;
          color: #ffffff;
          cursor: pointer;
          transform: translate(-50%, -50%);
          -webkit-tap-highlight-color: transparent;
        }

        .zoey-video-play-circle {
          display: grid;
          width: 88px;
          height: 88px;
          place-items: center;
          border: 3px solid rgba(255,255,255,.92);
          border-radius: 50%;
          background: rgba(20, 105, 65, .94);
          color: #ffffff;
          font-size: 31px;
          box-shadow: 0 18px 50px rgba(0,0,0,.28);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }

        .zoey-video-start-label {
          font-family: Georgia, "Times New Roman", serif;
          font-size: 21px;
          font-weight: 700;
          text-shadow: 0 3px 16px rgba(0,0,0,.42);
        }

        /*
         * MOBILE
         * Large enough to make the native video controls
         * clearly visible without pushing the conversation
         * section too far below the screen.
         */
        @media (max-width: 760px) {
          .zoey-video-card {
            min-height: 0;
            height: 520px;
            border-radius: 24px;
          }

          .zoey-video-element {
            object-position: 60% center;
          }

          .zoey-video-play-circle {
            width: 82px;
            height: 82px;
            font-size: 29px;
          }

          .zoey-video-start-label {
            font-size: 20px;
          }
        }

        @media (max-width: 430px) {
          .zoey-video-card {
            height: 500px;
          }
        }
      `}</style>

      <video
        ref={videoRef}
        className="zoey-video-element"
        controls
        playsInline
        preload="metadata"
        aria-label="Zoey, your WonderfulLife guide"
        onPlay={() => setStarted(true)}
        onEnded={() => setStarted(false)}
      >
        <source
          src="/videos/zoey-ask.aac.mp4"
          type="video/mp4"
        />
      </video>

      <div className="zoey-video-overlay" />

      {!started ? (
        <button
          type="button"
          className="zoey-video-start"
          onClick={startVideo}
          aria-label="Meet Zoey and play video with sound"
        >
          <span className="zoey-video-play-circle">
            ▶
          </span>

          <span className="zoey-video-start-label">
            Meet Zoey
          </span>
        </button>
      ) : null}
    </section>
  );
}