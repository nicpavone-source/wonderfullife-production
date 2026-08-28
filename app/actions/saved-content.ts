"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function toggleSavedContentAction(
  formData: FormData
) {
  const contentId = Number(
    formData.get("content_id")
  );

  const returnPath =
    String(
      formData.get("return_path") || "/"
    );

  if (!contentId) {
    redirect(
      `${returnPath}?message=Unable%20to%20save%20this%20content.`
    );
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data: existing } =
    await supabase
      .from("saved_content")
      .select("id")
      .eq("user_id", user.id)
      .eq("content_id", contentId)
      .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("saved_content")
      .delete()
      .eq("id", existing.id)
      .eq("user_id", user.id);

    if (error) {
      console.error(
        "Unable to remove saved content:",
        error
      );

      redirect(
        `${returnPath}?message=Unable%20to%20remove%20saved%20content.`
      );
    }
  } else {
    const { error } = await supabase
      .from("saved_content")
      .insert({
        user_id: user.id,
        content_id: contentId,
      });

    if (error) {
      console.error(
        "Unable to save content:",
        error
      );

      redirect(
        `${returnPath}?message=Unable%20to%20save%20this%20content.`
      );
    }
  }

  revalidatePath("/saved");
  revalidatePath(returnPath);

  redirect(returnPath);
}