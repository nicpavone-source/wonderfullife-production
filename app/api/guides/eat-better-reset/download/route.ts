import { NextRequest, NextResponse } from "next/server";

import {
  verifyEatBetterResetCheckout,
  createEatBetterResetSignedUrl,
} from "@/lib/paid-guides/eat-better-reset";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const sessionId =
    request.nextUrl.searchParams.get("session_id") ?? "";

  // Never provide a download unless a valid
  // Stripe Checkout Session was supplied.
  if (!sessionId) {
    return NextResponse.json(
      {
        error: "Missing checkout session.",
      },
      {
        status: 400,
      }
    );
  }

  let paid = false;

  try {
    paid = await verifyEatBetterResetCheckout(sessionId);
  } catch (error) {
    console.error(
      "Eat Better Reset checkout verification failed:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to verify purchase.",
      },
      {
        status: 500,
      }
    );
  }

  // Stripe must confirm:
  // 1. Payment status = paid
  // 2. Amount = CA$19.00
  // 3. Currency = CAD
  // 4. Correct Eat Better Reset Stripe Price ID
  if (!paid) {
    return NextResponse.json(
      {
        error: "Purchase could not be verified.",
      },
      {
        status: 403,
      }
    );
  }

  try {
    const signedUrl =
      await createEatBetterResetSignedUrl(600);

    // Redirect to a temporary Supabase signed URL.
    // The URL expires after 10 minutes.
    return NextResponse.redirect(signedUrl);
  } catch (error) {
    console.error(
      "Eat Better Reset signed download URL failed:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to generate download.",
      },
      {
        status: 500,
      }
    );
  }
}