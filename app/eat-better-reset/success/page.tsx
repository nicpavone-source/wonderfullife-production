import { redirect } from "next/navigation";

type PageProps = {
  searchParams: Promise<{
    session_id?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function EatBetterResetSuccessRedirect({
  searchParams,
}: PageProps) {
  const params = await searchParams;

  const sessionId = params.session_id;

  if (!sessionId) {
    redirect("/eat-better-reset");
  }

  redirect(
    `/guides/eat-better-reset/success?session_id=${encodeURIComponent(
      sessionId
    )}`
  );
}