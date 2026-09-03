const STRIPE_PRICE_ID =
  "price_1UBTCJFUKrFnqHsXRSgtyUdV";

const EXPECTED_AMOUNT = 1900;

const EXPECTED_CURRENCY = "cad";

const GUIDE_BUCKET = "paid-guides";

const GUIDE_PATH =
  "energy-reset/Wonderful-Life_14-Day_Energy_Reset_FINAL_PRODUCTION_COMPRESSED.pdf";

type StripeLineItem = {
  price?:
    | {
        id?: string;
      }
    | string
    | null;
};

type StripeCheckoutSession = {
  id: string;
  payment_status?: string;
  amount_total?: number | null;
  currency?: string | null;
  line_items?: {
    data?: StripeLineItem[];
  };
};

function getStripeSecretKey() {
  const key =
    process.env.STRIPE_SANDBOX_SECRET_KEY;

  if (!key) {
    throw new Error(
      "Missing STRIPE_SANDBOX_SECRET_KEY environment variable."
    );
  }

  return key;
}

function getSupabaseSettings() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL environment variable."
    );
  }

  if (!serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY environment variable."
    );
  }

  return {
    url: url.replace(/\/$/, ""),
    serviceRoleKey,
  };
}

export async function verifyEnergyResetCheckout(
  sessionId: string
): Promise<boolean> {
  if (!sessionId || !sessionId.startsWith("cs_")) {
    return false;
  }

  const secretKey = getStripeSecretKey();

  const endpoint =
    `https://api.stripe.com/v1/checkout/sessions/` +
    `${encodeURIComponent(
      sessionId
    )}?expand[]=line_items`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${secretKey}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return false;
  }

  const session =
    (await response.json()) as StripeCheckoutSession;

  if (session.payment_status !== "paid") {
    return false;
  }

  if (session.amount_total !== EXPECTED_AMOUNT) {
    return false;
  }

  if (
    (session.currency ?? "").toLowerCase() !==
    EXPECTED_CURRENCY
  ) {
    return false;
  }

  const lineItems =
    session.line_items?.data ?? [];

  const hasExpectedPrice = lineItems.some(
    (item) => {
      if (typeof item.price === "string") {
        return item.price === STRIPE_PRICE_ID;
      }

      return item.price?.id === STRIPE_PRICE_ID;
    }
  );

  return hasExpectedPrice;
}

export async function createEnergyResetSignedUrl(
  expiresInSeconds = 600
): Promise<string> {
  const { url, serviceRoleKey } =
    getSupabaseSettings();

  const encodedPath = GUIDE_PATH
    .split("/")
    .map(encodeURIComponent)
    .join("/");

  const endpoint =
    `${url}/storage/v1/object/sign/` +
    `${GUIDE_BUCKET}/${encodedPath}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      expiresIn: expiresInSeconds,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Could not create signed guide URL (${response.status}).`
    );
  }

  const data = (await response.json()) as {
    signedURL?: string;
    signedUrl?: string;
  };

  const signedPath =
    data.signedURL ?? data.signedUrl;

  if (!signedPath) {
    throw new Error(
      "Supabase did not return a signed URL."
    );
  }

  if (signedPath.startsWith("http")) {
    return signedPath;
  }

  const normalizedPath =
    signedPath.startsWith("/")
      ? signedPath
      : `/${signedPath}`;

  return `${url}/storage/v1${normalizedPath}`;
}