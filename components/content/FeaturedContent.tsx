"use client";

import Link from "next/link";

type FeaturedContentProps = {
  category: string;
  title: string;
  description: string;
  image: string;
  href: string;
};

export default function FeaturedContent({
  category,
  title,
  description,
  image,
  href,
}: FeaturedContentProps) {
  return (
    <section
      style={{
        display: "grid",
        gridTemplateColumns: "1.35fr 1fr",
        gap: "40px",
        alignItems: "center",
        background: "#ffffff",
        borderRadius: "28px",
        overflow: "hidden",
        boxShadow: "0 12px 40px rgba(0,0,0,.06)",
        marginBottom: "80px",
      }}
    >
      <img
        src={image}
        alt={title}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          minHeight: "520px",
        }}
      />

      <div
        style={{
          padding: "60px",
        }}
      >
        <div
          style={{
            color: "#0f6b47",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: ".12em",
            marginBottom: "18px",
            fontSize: "13px",
          }}
        >
          {category}
        </div>

        <h2
          style={{
            fontSize: "3.4rem",
            lineHeight: 1.05,
            color: "#143f2e",
            marginBottom: "24px",
            fontWeight: 800,
          }}
        >
          {title}
        </h2>

        <p
          style={{
            fontSize: "1.2rem",
            lineHeight: 1.8,
            color: "#667085",
            marginBottom: "34px",
          }}
        >
          {description}
        </p>

        <Link
          href={href}
          style={{
            display: "inline-block",
            background: "#0f6b47",
            color: "#fff",
            padding: "16px 34px",
            borderRadius: "999px",
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          Read Article →
        </Link>
      </div>
    </section>
  );
}