"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const habits = [
  ["hydration", "Hydration"],
  ["movement", "Movement"],
  ["nutrition", "Nutrition"],
  ["recovery", "Recovery"],
  ["mindset", "Mindset"]
];

export async function createJourneyAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const goal = String(formData.get("goal") || "More Energy");
  await supabase.from("wellness_journeys").insert({ user_id: user.id, title: `${goal} Journey`, goal, current_day: 1 });

  revalidatePath("/journey");
  redirect("/journey?message=Journey started.");
}

export async function saveCheckinAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const journey_id = Number(formData.get("journey_id"));
  const completed = habits.map(([key, label]) => ({ key, label, done: formData.get(key) === "on" }));
  const score = Math.round((completed.filter(h => h.done).length / completed.length) * 100);

  await supabase.from("habit_checkins").upsert({
    user_id: user.id,
    journey_id,
    checkin_date: new Date().toISOString().slice(0, 10),
    habits: completed,
    score,
    notes: String(formData.get("notes") || "")
  }, { onConflict: "user_id,journey_id,checkin_date" });

  revalidatePath("/dashboard");
  revalidatePath("/journey");
  redirect("/journey?message=Check-in saved.");
}
