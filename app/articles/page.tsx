import { Suspense } from "react";
import PublicContentList from "@/components/content-studio/PublicContentList";

export const metadata = {
  title: "Articles | WonderfulLife.ca",
  description: "Practical wellness guidance from WonderfulLife.",
};

function ArticlesLoading() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "40px 20px",
      }}
    >
      <p style={{ margin: 0 }}>Loading articles…</p>
    </main>
  );
}

export default function ArticlesPage() {
  return (
    <Suspense fallback={<ArticlesLoading />}>
      <PublicContentList
        type="article"
        title="Ideas for a wonderful life."
        lead="Approachable articles about nutrition, recovery, movement, mindset and healthy living."
      />
    </Suspense>
  );
}