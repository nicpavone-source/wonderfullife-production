export default function ContentFilters({ basePath, search, category }: { basePath: string; search?: string; category?: string }) {
  return (
    <form action={basePath} className="mb-10 rounded-[2rem] bg-white p-5 shadow-wl md:p-6">
      <div className="grid gap-3 md:grid-cols-[1fr_240px_auto]">
        <input name="q" defaultValue={search || ""} placeholder="Search..." className="h-14 rounded-2xl border border-gray-200 px-5 text-lg" />
        <input name="category" defaultValue={category || ""} placeholder="Category" className="h-14 rounded-2xl border border-gray-200 px-5 text-lg" />
        <button className="h-14 rounded-2xl bg-forest px-8 font-black text-white">Search</button>
      </div>
    </form>
  );
}
