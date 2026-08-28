import PublicContentList from "@/components/content-studio/PublicContentList";

export const metadata = {
  title: "Articles | WonderfulLife.ca",
  description: "Practical wellness guidance from WonderfulLife.",
};

export default function ArticlesPage() {
  return (
    <PublicContentList
      type="article"
      title="Ideas for a wonderful life."
      lead="Approachable articles about nutrition, recovery, movement, mindset and healthy living."
    />
  );
}