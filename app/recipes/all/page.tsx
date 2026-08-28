import PublicContentList from "@/components/content-studio/PublicContentList";

export const metadata = {
  title: "Recipes | WonderfulLife.ca",
  description: "Healthy recipes from WonderfulLife.",
};

export default function RecipesAllPage() {
  return (
    <PublicContentList
      type="recipe"
      title="Healthy Recipes Made Simple."
      lead="Discover delicious, nourishing recipes created to help you live your best life."
    />
  );
}