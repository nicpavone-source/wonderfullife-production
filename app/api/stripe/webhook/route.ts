import { NextResponse } from "next/server";
import Stripe from "stripe";

import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripeSecretKey =
  process.env.STRIPE_SECRET_KEY;

const webhookSecret =
  process.env.STRIPE_WEBHOOK_SECRET;

function getStripe() {
  if (!stripeSecretKey) {
    throw new Error(
      "Missing STRIPE_SECRET_KEY"
    );
  }

  return new Stripe(stripeSecretKey);
}

async function recordSuccessfulPurchase(
  session: Stripe.Checkout.Session
) {
  /*
   * Only record an actual successful payment.
   */
  if (session.payment_status !== "paid") {
    return;
  }

  const stripe = getStripe();
  const supabase = createAdminClient();

  /*
   * Prevent Stripe webhook retries from
   * recording the same sale twice.
   */
  const { data: existingEvent } =
    await supabase
      .from("admin_events")
      .select("id")
      .eq("event_type", "purchase")
      .filter(
        "metadata->>stripe_session_id",
        "eq",
        session.id
      )
      .maybeSingle();

  if (existingEvent) {
    return;
  }

  /*
   * Retrieve what the customer bought.
   */
  const lineItems =
    await stripe.checkout.sessions.listLineItems(
      session.id,
      {
        limit: 10,
      }
    );

  const productNames =
    lineItems.data
      .map((item) => item.description)
      .filter(Boolean);

  const productName =
    productNames.join(", ") ||
    "Wonderful-Life Purchase";

  const customerEmail =
    session.customer_details?.email ||
    session.customer_email ||
    null;

  const customerName =
    session.customer_details?.name ||
    null;

  const amountCents =
    session.amount_total || 0;

  const currency =
    (session.currency || "cad").toUpperCase();

  const { error } = await supabase
    .from("admin_events")
    .insert({
      event_type: "purchase",
      event_label: "New purchase",

      user_email: customerEmail,
      user_name: customerName,

      product_name: productName,

      amount_cents: amountCents,
      currency,

      page_path: "/shop",

      metadata: {
        stripe_session_id: session.id,
        stripe_payment_intent:
          typeof session.payment_intent ===
          "string"
            ? session.payment_intent
            : null,
        stripe_customer:
          typeof session.customer === "string"
            ? session.customer
            : null,
        payment_status:
          session.payment_status,
        products: productNames,
      },
    });

  if (error) {
    throw new Error(
      `Could not record purchase: ${error.message}`
    );
  }
}

export async function POST(
  request: Request
) {
  try {
    if (!webhookSecret) {
      console.error(
        "Missing STRIPE_WEBHOOK_SECRET"
      );

      return NextResponse.json(
        {
          error:
            "Webhook secret is not configured",
        },
        {
          status: 500,
        }
      );
    }

    const stripe = getStripe();

    /*
     * Stripe signature verification requires
     * the original raw request body.
     */
    const body = await request.text();

    const signature =
      request.headers.get(
        "stripe-signature"
      );

    if (!signature) {
      return NextResponse.json(
        {
          error:
            "Missing Stripe signature",
        },
        {
          status: 400,
        }
      );
    }

    let event: Stripe.Event;

    try {
      event =
        stripe.webhooks.constructEvent(
          body,
          signature,
          webhookSecret
        );
    } catch (error) {
      console.error(
        "Stripe webhook verification failed:",
        error
      );

      return NextResponse.json(
        {
          error:
            "Invalid webhook signature",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Normal card / Apple Pay / Link payments.
     */
    if (
      event.type ===
      "checkout.session.completed"
    ) {
      const session =
        event.data
          .object as Stripe.Checkout.Session;

      await recordSuccessfulPurchase(
        session
      );
    }

    /*
     * Handles payment methods that can finish
     * asynchronously after Checkout.
     */
    if (
      event.type ===
      "checkout.session.async_payment_succeeded"
    ) {
      const session =
        event.data
          .object as Stripe.Checkout.Session;

      await recordSuccessfulPurchase(
        session
      );
    }

    return NextResponse.json({
      received: true,
    });
  } catch (error) {
    console.error(
      "Stripe webhook error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Webhook processing failed",
      },
      {
        status: 500,
      }
    );
  }
}