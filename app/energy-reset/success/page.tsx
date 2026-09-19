import { redirect } from "next/navigation";

type PageProps = {
  searchParams: Promise<{
    session_id?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function EnergyResetSuccessRedirect({
  searchParams,
}: PageProps) {
  const params = await searchParams;

  const sessionId = params.session_id;

  if (!sessionId) {
    redirect("/energy-reset");
  }

  redirect(
    `/guides/energy-reset/success?session_id=${encodeURIComponent(
      sessionId
    )}`
  );
}