import Link from "next/link";

export type ContentItem = {
  id: number;
  type: string;
  title: string;
  slug: string;
  excerpt?: string;
  category?: string;
  image_url?: string;
  reading_minutes?: number;
};

export default function ContentCard({ item }: { item: ContentItem }) {
  return (
    <Link href={`/content/${item.type}/${item.slug}`} className="group block overflow-hidden rounded-[1.75rem] bg-white text-left shadow-wl transition hover:-translate-y-1">
      {item.image_url ? (
        <img src={item.image_url} alt="" className="h-56 w-full object-cover transition group-hover:scale-[1.02]" />
      ) : (
        <div className="grid h-56 place-items-center bg-sage text-5xl">🌿</div>
      )}
      <div className="p-6">
        <div className="text-xs font-black uppercase tracking-[.13em] text-forest">
          {item.type} • {item.category || "Wellness"}
        </div>
        <h3 className="mt-2 text-2xl font-bold leading-tight">{item.title}</h3>
        {item.excerpt ? <p className="mt-3 leading-relaxed text-muted">{item.excerpt}</p> : null}
        <p className="mt-4 text-sm font-bold text-muted">{item.reading_minutes || 5} min read</p>
      </div>
    </Link>
  );
}
