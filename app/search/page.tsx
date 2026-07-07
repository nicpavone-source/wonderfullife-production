import ContentCard from "@/components/ContentCard";
import ContentFilters from "@/components/ContentFilters";
import { getPublishedContent } from "@/lib/content";

export const metadata = { title: "Search | WonderfulLife.ca" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string }> }) {
  const params = await searchParams;
  const items = await getPublishedContent({ q: params.q, category: params.category, limit: 60 });

  return (
    <main className="mx-auto max-w-7xl px-5 py-16 md:px-10">
      <p className="text-center font-black uppercase tracking-[.13em] text-forest">Search</p>
      <h1 className="mt-3 text-center font-serif text-5xl md:text-7xl">Search WonderfulLife</h1>
      <div className="mt-10"><ContentFilters basePath="/search" search={params.q} category={params.category} /></div>
      {items.length ? <div className="grid gap-6 md:grid-cols-3">{items.map((item) => <ContentCard key={item.id} item={item} />)}</div> : <div className="rounded-[2rem] bg-white p-10 text-center shadow-wl">Start searching or publish more content.</div>}
    </main>
  );
}
