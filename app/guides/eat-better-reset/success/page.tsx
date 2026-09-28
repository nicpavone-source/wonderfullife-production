import Link from "next/link";
import "../../energy-reset/success/success.css";

import PurchaseConversion from "@/components/PurchaseConversion";

import {
  verifyEatBetterResetCheckout,
} from "@/lib/paid-guides/eat-better-reset";

type PageProps = {
  searchParams:
    | Promise<{ session_id?: string }>
    | { session_id?: string };
};

export const dynamic = "force-dynamic";

export default async function EatBetterResetSuccessPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const sessionId = params?.session_id ?? "";

  let paid = false;

  try {
    paid = await verifyEatBetterResetCheckout(sessionId);
  } catch (error) {
    console.error(
      "Eat Better Reset checkout verification failed:",
      error
    );
  }

  // IMPORTANT:
  // If Stripe does not verify the purchase,
  // no Google Ads purchase conversion is rendered.
  if (!paid) {
    return (
      <main className="energySuccessPage">
        <section className="energySuccessCard">
          <p className="energyEyebrow">
            WONDERFUL-LIFE
          </p>

          <h1>
            We couldn&apos;t verify this purchase.
          </h1>

          <p className="energyMessage">
            If you just completed checkout, please return
            to the payment page and try again. No download
            is available until Stripe confirms a successful
            payment.
          </p>

          <Link
            href="/eat-better-reset"
            className="energySecondaryButton"
          >
            Return to the Eat Better Reset
          </Link>
        </section>
      </main>
    );
  }

  const downloadHref =
    `/api/guides/eat-better-reset/download?session_id=` +
    encodeURIComponent(sessionId);

  return (
    <main className="energySuccessPage">

      {/* Google Ads purchase conversion.
          This component exists ONLY after Stripe
          has verified the purchase. */}
      <PurchaseConversion
        transactionId={sessionId}
      />

      <section className="energySuccessCard">
        <div
          className="energyCheck"
          aria-hidden="true"
        >
          ✓
        </div>

        <p className="energyEyebrow">
          PURCHASE CONFIRMED
        </p>

        <h1>
          Your 14-Day Eat Better Reset is ready.
        </h1>

        <p className="energyMessage">
          Thank you for choosing Wonderful-Life.
          Your complete printable PDF is ready
          to download.
        </p>

        <a
          href={downloadHref}
          className="energyPrimaryButton"
        >
          Download Your Guide
        </a>

        <p className="energySecurityNote">
          Your download is generated only after
          Stripe confirms your purchase.
        </p>

        <Link
          href="/"
          className="energyHomeLink"
        >
          Return to Wonderful-Life
        </Link>
      </section>
    </main>
  );
}