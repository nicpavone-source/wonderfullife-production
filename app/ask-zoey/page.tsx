import ZoeyChat from "@/components/ZoeyChat";

export default function AskZoeyPage() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-16 md:px-10">
      <p className="text-center font-black uppercase tracking-[.13em] text-forest">Ask Zoey</p>
      <h1 className="mb-10 mt-3 text-center font-serif text-5xl md:text-7xl">Talk naturally with Zoey</h1>
      <ZoeyChat />
    </main>
  );
}
