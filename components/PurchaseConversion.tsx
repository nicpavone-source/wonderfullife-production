"use client";

import { useEffect } from "react";

type PurchaseConversionProps = {
  transactionId: string;
};

export default function PurchaseConversion({
  transactionId,
}: PurchaseConversionProps) {
  useEffect(() => {
    if (!transactionId) return;

    const sendConversion = () => {
      const gtag = (
        window as typeof window & {
          gtag?: (
            command: string,
            eventName: string,
            parameters: Record<string, unknown>
          ) => void;
        }
      ).gtag;

      if (typeof gtag !== "function") {
        return false;
      }

      gtag("event", "conversion", {
        send_to:
          "AW-18453200451/9l6DCP7E9_kcEMP8ld9E",
        value: 19.0,
        currency: "CAD",
        transaction_id: transactionId,
      });

      return true;
    };

    if (sendConversion()) {
      return;
    }

    const interval = window.setInterval(() => {
      if (sendConversion()) {
        window.clearInterval(interval);
      }
    }, 250);

    const timeout = window.setTimeout(() => {
      window.clearInterval(interval);
    }, 5000);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [transactionId]);

  return null;
}