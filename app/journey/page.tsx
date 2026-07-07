import { createClient } from "@/lib/supabase/server";
import { createJourneyAction, saveCheckinAction } from "@/lib/actions/journey";

export default async function JourneyPage({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: journey } = await supabase.from("wellness_journeys").select("*").eq("user_id", user?.id).eq("status", "active").limit(1).single();

  return (
    <main className="mx-auto max-w-7xl px-5 py-16 md:px-10">
      <p className="text-center font-black uppercase tracking-[.13em] text-forest">Wellness Journey</p>
      <h1 className="mt-3 text-center font-serif text-5xl md:text-7xl">Track your healthy habits</h1>
      {params.message ? <div className="mx-auto my-8 max-w-2xl rounded-2xl bg-sage p-4 text-center font-bold text-forest">{params.message}</div> : null}

      {!journey ? (
        <form action={createJourneyAction} className="mx-auto mt-10 max-w-2xl rounded-[2rem] bg-white p-8 shadow-wl">
          <h2 className="mb-4 font-serif text-4xl">Start a journey</h2>
          <select name="goal" className="mb-5 h-14 w-full rounded-2xl border px-5">
            <option>More Energy</option>
            <option>Better Sleep</option>
            <option>Daily Nutrition</option>
            <option>Recovery</option>
          </select>
          <button className="h-14 rounded-2xl bg-forest px-8 font-black text-white">Start Journey</button>
        </form>
      ) : (
        <form action={saveCheckinAction} className="mx-auto mt-10 max-w-4xl rounded-[2rem] bg-white p-8 shadow-wl">
          <input type="hidden" name="journey_id" value={journey.id} />
          <h2 className="mb-5 font-serif text-4xl">{journey.title}</h2>
          <div className="grid gap-4 md:grid-cols-5">
            {["hydration", "movement", "nutrition", "recovery", "mindset"].map((h) => (
              <label key={h} className="rounded-3xl bg-sage p-5 font-black capitalize text-forest">
                <input type="checkbox" name={h} className="mr-2" /> {h}
              </label>
            ))}
          </div>
          <input name="notes" placeholder="Reflection notes" className="mt-5 h-14 w-full rounded-2xl border px-5" />
          <button className="mt-5 h-14 rounded-2xl bg-forest px-8 font-black text-white">Save Check-in</button>
        </form>
      )}
    </main>
  );
}
