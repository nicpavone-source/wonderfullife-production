import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/journey/:path*",
    "/saved/:path*",
    "/studio/:path*",
    "/community/:path*",
    "/ask-zoey/:path*",
    "/((?!_next/static|_next/image|favicon.ico).*)"
  ]
};
