"use client";

import type { MouseEvent, ReactNode } from "react";

const STRIPE_CHECKOUT_URL =
  "https://buy.stripe.com/7sY9AM0cZ6FZ4jVbHK1gs03";

type EnergyResetCheckoutLinkProps = {
  children: ReactNode;
  className?: string;
};

export default function EnergyResetCheckoutLink({
  children,
  className = "",
}: EnergyResetCheckoutLinkProps) {
  async function handleCheckout(
    event: MouseEvent<HTMLAnchorElement>
  ) {
    event.preventDefault();

    try {
      await Promise.race([
        fetch("/api/analytics/track", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            event_type: "checkout_start",
            page_path: "/energy-reset",
            content_id: null,
            content_type: "digital_product",
            source: "energy_reset",
            metadata: {
              product_name: "14-Day Energy Reset",
              price: 19,
              currency: "CAD",
              destination: "stripe_payment_link",
            },
          }),
          keepalive: true,
        }),

        new Promise((resolve) =>
          setTimeout(resolve, 1000)
        ),
      ]);
    } catch (error) {
      console.error(
        "Unable to record checkout start:",
        error
      );
    } finally {
      window.location.href = STRIPE_CHECKOUT_URL;
    }
  }

  return (
    <a
      href={STRIPE_CHECKOUT_URL}
      className={className}
      onClick={handleCheckout}
    >
      {children}
    </a>
  );
}