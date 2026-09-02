"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type HomeTile = {
  category: string;
  title: string;
  subtitle?: string;
  href: string;
  image: string;
  imagePool?: string[];
  position?: string;
  video?: boolean;
};

const tiles: HomeTile[] = [
  {
    category: "Wellness",
    title: "5-Minute Morning Reset",
    subtitle: "Start your day with intention",
    href: "/wellness",
    image: "/images/editorial/downward dog.jpg",
    imagePool: [
      "/images/editorial/downward dog.jpg",
      "/images/editorial/warrior2.png",
      "/images/editorial/walking.png",
      "/images/editorial/jogging.png",
      "/images/editorial/stress free.png",
    ],
    position: "center center",
    video: true,
  },

  {
    category: "Recipes",
    title: "Fresh Mediterranean Recipes",
    subtitle: "Simple. Beautiful. Delicious.",
    href: "/recipes",
    image: "/images/editorial/spaghetti pomodoro.png",
    imagePool: [
      "/images/editorial/spaghetti pomodoro.png",
      "/images/editorial/Authentic Trofie al Pesto Genovese.jpg",
      "/images/editorial/linguine vongole.png",
      "/images/editorial/pizza margherita.png",
      "/images/editorial/cannelloni.png",
    ],
    position: "center center",
  },

  {
    category: "Nutrition",
    title: "Eat Better. Feel Better.",
    subtitle: "Everyday nutrition made simpler",
    href: "/nutrition",
    image: "/images/editorial/avocado toast with egg.png",
    imagePool: [
      "/images/editorial/avocado toast with egg.png",
      "/images/editorial/blueberry banana smoothie bowl.png",
      "/images/editorial/Creamy Yam Chocolate Pudding.png",
      "/images/editorial/grilled chicken pesto and farro salad.jpg",
      "/images/editorial/baked cod.png",
    ],
    position: "center center",
  },

  {
    category: "Wellness",
    title: "Simple Ways to Feel Better",
    subtitle: "Small habits. Real difference.",
    href: "/wellness",
    image: "/images/editorial/walking.png",
    imagePool: [
      "/images/editorial/walking.png",
      "/images/editorial/jogging.png",
      "/images/editorial/stress free.png",
      "/images/editorial/microbreaks.png",
      "/images/editorial/downward dog.jpg",
    ],
    position: "center center",
  },

  {
    category: "Meet Zoey",
    title: "Meet Zoey",
    subtitle: "Your guide to living well",
    href: "/meet-zoey",
    image: "/images/editorial/meet-zoey-mobile.png",
    imagePool: [
      "/images/editorial/meet-zoey-mobile.png",
      "/images/editorial/zoey-day-morning.png",
      "/images/editorial/zoey-day-midday.png",
      "/images/editorial/zoey-day-afternoon.png",
      "/images/editorial/zoey-day-evening.png",
      "/images/editorial/joinzoey.jpg",
    ],
    position: "center center",
    video: true,
  },

  {
    category: "Shop",
    title: "Shop Wellness",
    subtitle: "Products for your best life",
    href: "/shop",
    image: "/images/editorial/nutrimeal.png",
    imagePool: [
      "/images/editorial/nutrimeal.png",
      "/images/editorial/cellsentials.png",
      "/images/editorial/biomega.png",
      "/images/editorial/healthpak.png",
      "/images/editorial/probiotic.png",
      "/images/editorial/procosa.png",
    ],
    position: "center center",
  },

  {
    category: "Videos",
    title: "Watch & Learn",
    subtitle: "Wellness inspiration in motion",
    href: "/videos",
    image: "/images/editorial/zoey-day-afternoon.png",
    imagePool: [
      "/images/editorial/zoey-day-afternoon.png",
      "/images/editorial/zoey-day-morning.png",
      "/images/editorial/warrior2.png",
      "/images/editorial/downward dog.jpg",
      "/images/editorial/zoey-day-midday.png",
    ],
    position: "center center",
    video: true,
  },

  {
    category: "Wellness",
    title: "Your Afternoon Reset",
    subtitle: "A better way to recharge",
    href: "/wellness",
    image: "/images/editorial/jogging.png",
    imagePool: [
      "/images/editorial/jogging.png",
      "/images/editorial/walking.png",
      "/images/editorial/stress free.png",
      "/images/editorial/microbreaks.png",
      "/images/editorial/warrior2.png",
    ],
    position: "center center",
  },

  {
    category: "Nutrition",
    title: "Everyday Nutrition",
    subtitle: "Practical guidance for real life",
    href: "/nutrition",
    image: "/images/editorial/blueberry banana smoothie bowl.png",
    imagePool: [
      "/images/editorial/blueberry banana smoothie bowl.png",
      "/images/editorial/avocado toast with egg.png",
      "/images/editorial/Creamy Yam Chocolate Pudding.png",
      "/images/editorial/grilled chicken pesto and farro salad.jpg",
      "/images/editorial/lemon salmon.png",
    ],
    position: "center center",
  },

  {
    category: "Recipes",
    title: "What’s for Dinner?",
    subtitle: "Fresh ideas worth making",
    href: "/recipes",
    image: "/images/editorial/chicken thighs.png",
    imagePool: [
      "/images/editorial/chicken thighs.png",
      "/images/editorial/lasagna.png",
      "/images/editorial/cannelloni.png",
      "/images/editorial/eggplant.jpg",
      "/images/editorial/baked cod.png",
      "/images/editorial/pizza margherita.png",
    ],
    position: "center center",
  },

  {
    category: "Mind",
    title: "Wind Down Tonight",
    subtitle: "Create a calmer evening",
    href: "/wellness",
    image: "/images/editorial/person sleeping.png",
    imagePool: [
      "/images/editorial/person sleeping.png",
      "/images/editorial/stress free.png",
      "/images/editorial/microbreaks.png",
      "/images/editorial/walking.png",
    ],
    position: "center center",
  },

  {
    category: "Join Our Team",
    title: "Build Something Wonderful",
    subtitle: "Explore the opportunity",
    href: "/join-our-team",
    image: "/images/editorial/wl-join-team-zoey.jpg",
    imagePool: [
      "/images/editorial/wl-join-team-zoey.jpg",
      "/images/editorial/joinzoey.jpg",
      "/images/editorial/outdoor eating.png",
      "/images/editorial/usana o.png",
    ],
    position: "center center",
  },
];

const STORAGE_KEY = "wonderfullife-editorial-images-v1";

function chooseRandomImage(pool: string[], fallback: string) {
  if (!pool || pool.length === 0) {
    return fallback;
  }

  const index = Math.floor(Math.random() * pool.length);

  return pool[index];
}

export default function HomeEditorialGrid() {
  const [activeImages, setActiveImages] = useState<string[]>(
    tiles.map((tile) => tile.image)
  );

  useEffect(() => {
    try {
      const savedImages = sessionStorage.getItem(STORAGE_KEY);

      if (savedImages) {
        const parsedImages = JSON.parse(savedImages);

        if (
          Array.isArray(parsedImages) &&
          parsedImages.length === tiles.length
        ) {
          setActiveImages(parsedImages);
          return;
        }
      }

      const newImages = tiles.map((tile) =>
        chooseRandomImage(
          tile.imagePool ?? [tile.image],
          tile.image
        )
      );

      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(newImages)
      );

      setActiveImages(newImages);
    } catch {
      setActiveImages(tiles.map((tile) => tile.image));
    }
  }, []);

  return (
    <section
      className="wl-editorial"
      aria-label="Explore WonderfulLife"
    >
      <div className="wl-editorial-heading">
        <p className="wl-editorial-kicker">
          Discover WonderfulLife
        </p>

        <h2 className="wl-editorial-title">
          Find something that feels right for you.
        </h2>
      </div>

      <div className="wl-editorial-grid">
        {tiles.map((tile, index) => (
          <Link
            key={`${tile.category}-${tile.title}`}
            href={tile.href}
            className="wl-editorial-card"
            style={{
              position: "relative",
              display: "block",
            }}
          >
            <Image
              src={activeImages[index] ?? tile.image}
              alt={tile.title}
              fill
              sizes="(max-width: 640px) 50vw, 33vw"
              className="wl-editorial-card-image"
              style={{
                objectFit: "cover",
                objectPosition:
                  tile.position ?? "center center",
              }}
            />

            <div
              className="wl-editorial-card-shade"
              aria-hidden="true"
            />

            <div className="wl-editorial-card-top">
              <span className="wl-editorial-category">
                {tile.category}
              </span>

              {tile.video && (
                <span
                  className="wl-editorial-play"
                  aria-hidden="true"
                >
                  ▶
                </span>
              )}
            </div>

            <div className="wl-editorial-card-copy">
              <h3>{tile.title}</h3>

              {tile.subtitle && (
                <p>{tile.subtitle}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}