import { signInAction } from "@/lib/actions/auth";

export default async function SignIn({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const params = await searchParams;
  return (
    <main className="grid min-h-[75vh] place-items-center px-5">
      <form action={signInAction} className="w-full max-w-xl rounded-[2.5rem] bg-white p-10 shadow-wl">
        <h1 className="mb-6 font-serif text-5xl">Sign in</h1>
        <input name="email" type="email" placeholder="Email" className="mb-4 h-14 w-full rounded-2xl border px-5" required />
        <input name="password" type="password" placeholder="Password" className="mb-6 h-14 w-full rounded-2xl border px-5" required />
        <button className="h-14 w-full rounded-2xl bg-forest font-black text-white">Sign In</button>
        {params.message ? <p className="mt-4 font-bold text-forest">{params.message}</p> : null}
      </form>
    </main>
  );
}
