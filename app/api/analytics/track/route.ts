import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      event_type,
      page_path,
      content_id,
      content_type,
      source,
      metadata,
    } = body;

    if (!event_type || typeof event_type !== "string") {
      return NextResponse.json(
        { error: "event_type is required" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Analytics tracking environment variables are missing.");

      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    /*
     * Read the current signed-in user from the normal
     * Wonderful-Life Supabase session cookie.
     */
    const authSupabase = await createServerClient();

    const {
      data: { user },
    } = await authSupabase.auth.getUser();

    const userId = user?.id ?? null;

    /*
     * Service-role client is server-only and is used solely
     * to write the analytics record through RLS.
     */
    const adminSupabase = createAdminClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    const { error } = await adminSupabase
      .from("analytics_events")
      .insert({
        event_type,
        user_id: userId,

        page_path:
          typeof page_path === "string"
            ? page_path.substring(0, 500)
            : null,

        content_id:
          typeof content_id === "number"
            ? content_id
            : null,

        content_type:
          typeof content_type === "string"
            ? content_type.substring(0, 100)
            : null,

        source:
          typeof source === "string"
            ? source.substring(0, 200)
            : null,

        metadata:
          metadata &&
          typeof metadata === "object" &&
          !Array.isArray(metadata)
            ? metadata
            : {},
      });

    if (error) {
      console.error(
        "Analytics insert failed:",
        error.message
      );

      return NextResponse.json(
        { error: "Unable to record analytics event" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Analytics API error:", error);

    return NextResponse.json(
      { error: "Invalid analytics request" },
      { status: 400 }
    );
  }
}