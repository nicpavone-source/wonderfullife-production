import { NextRequest, NextResponse } from "next/server";
import {
  createEnergyResetSignedUrl,
  verifyEnergyResetCheckout,
} from "@/lib/paid-guides/energy-reset";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const sessionId =
    request.nextUrl.searchParams.get("session_id") ?? "";

  try {
    const paid =
      await verifyEnergyResetCheckout(sessionId);

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

    const signedUrl =
      await createEnergyResetSignedUrl(600);

    return NextResponse.redirect(signedUrl, 302);
  } catch (error) {
    console.error(
      "Energy Reset download failed:",
      error
    );

    return NextResponse.json(
      {
        error:
          "The download is temporarily unavailable.",
      },
      {
        status: 500,
      }
    );
  }
}