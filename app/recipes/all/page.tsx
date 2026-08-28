import { Suspense } from "react";
import PublicContentList from "@/components/content-studio/PublicContentList";

export const metadata = {
  title: "Recipes | WonderfulLife.ca",
  description: "Healthy recipes from WonderfulLife.",
};

function RecipesLoading() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "40px 20px",
      }}
    >
      <p style={{ margin: 0 }}>Loading recipes…</p>
    </main>
  );
}

export default function RecipesAllPage() {
  return (
    <Suspense fallback={<RecipesLoading />}>
      <PublicContentList
        type="recipe"
        title="Healthy Recipes Made Simple."
        lead="Discover delicious, nourishing recipes created to help you live your best life."
      />
    </Suspense>
  );
}