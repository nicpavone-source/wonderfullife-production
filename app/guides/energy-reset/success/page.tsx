import Link from "next/link";
import "./success.css";

import {
  verifyEnergyResetCheckout,
} from "@/lib/paid-guides/energy-reset";

type PageProps = {
  searchParams:
    | Promise<{ session_id?: string }>
    | { session_id?: string };
};

export const dynamic = "force-dynamic";

export default async function EnergyResetSuccessPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const sessionId = params?.session_id ?? "";

  let paid = false;

  try {
    paid = await verifyEnergyResetCheckout(sessionId);
  } catch (error) {
    console.error(
      "Energy Reset checkout verification failed:",
      error
    );
  }

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
            href="/energy-reset"
            className="energySecondaryButton"
          >
            Return to the Energy Reset
          </Link>
        </section>
      </main>
    );
  }

  const downloadHref =
    `/api/guides/energy-reset/download?session_id=` +
    encodeURIComponent(sessionId);

  return (
    <main className="energySuccessPage">
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
          Your 14-Day Energy Reset is ready.
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