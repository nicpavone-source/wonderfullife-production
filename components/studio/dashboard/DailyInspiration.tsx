import Link from "next/link";

const inspirationIdeas = [
  "Create a simple morning routine article.",
  "Share one healthy recipe using seasonal ingredients.",
  "Write a short video script about building better daily habits.",
];

export default function DailyInspiration() {
  return (
    <section className="overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
          ✨
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
            Zoey&apos;s Idea of the Day
          </p>

          <h2 className="mt-1 text-2xl font-semibold text-slate-900">
            Inspire someone to live better today
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Start with one helpful idea, keep it simple, and create something
            your WonderfulLife community can use immediately.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {inspirationIdeas.map((idea) => (
          <div
            key={idea}
            className="flex items-start gap-3 rounded-2xl border border-white bg-white/80 p-4"
          >
            <span className="mt-0.5 text-emerald-600">✓</span>

            <p className="text-sm font-medium leading-6 text-slate-700">
              {idea}
            </p>
          </div>
        ))}
      </div>

      <Link
        href="/studio/ai"
        className="mt-6 inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
      >
        Create with Zoey
      </Link>
    </section>
  );
}