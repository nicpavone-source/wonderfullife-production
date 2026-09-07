import Link from "next/link";

import { requestPasswordResetAction } from "@/lib/actions/auth";

type ForgotPasswordSearchParams = {
  message?: string;
};

export default async function ForgotPassword({
  searchParams,
}: {
  searchParams: Promise<ForgotPasswordSearchParams>;
}) {
  const params = await searchParams;

  return (
    <main className="forgot-page">
      <style>{`
        .forgot-page {
          min-height: calc(100vh - 108px);
          display: grid;
          place-items: center;
          padding: 40px 20px;
          background:
            linear-gradient(
              rgba(238,244,239,0.82),
              rgba(238,244,239,0.92)
            ),
            url("/images/sign-in-vancouver.jpg");
          background-size: cover;
          background-position: center;
        }

        .forgot-card {
          width: min(100%, 460px);
          padding: 34px;
          border: 1px solid rgba(255,255,255,.8);
          border-radius: 24px;
          background: rgba(255,255,255,.94);
          backdrop-filter: blur(18px);
          box-shadow: 0 24px 70px rgba(20,60,40,.16);
        }

        .eyebrow {
          margin: 0 0 8px;
          color: #126241;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: .18em;
          text-transform: uppercase;
        }

        h1 {
          margin: 0;
          color: #123f2d;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 42px;
          font-weight: 500;
          letter-spacing: -.03em;
        }

        .intro {
          margin: 12px 0 24px;
          color: #617067;
          font-size: 14px;
          line-height: 1.55;
        }

        form {
          display: grid;
          gap: 14px;
        }

        label {
          color: #163e2c;
          font-size: 12px;
          font-weight: 800;
        }

        input {
          width: 100%;
          height: 52px;
          padding: 0 16px;
          border: 1px solid #cfdccf;
          border-radius: 14px;
          background: #f8fbf8;
          font-size: 15px;
          outline: none;
          box-sizing: border-box;
        }

        input:focus {
          border-color: #649b73;
          background: #fff;
          box-shadow: 0 0 0 4px rgba(47,113,67,.08);
        }

        button {
          height: 52px;
          border: none;
          border-radius: 999px;
          background: linear-gradient(90deg,#075d3d,#0b7048);
          color: white;
          font-size: 15px;
          font-weight: 900;
          cursor: pointer;
        }

        .message {
          padding: 12px;
          border-radius: 12px;
          background: #eef7ef;
          color: #24613d;
          font-size: 13px;
          line-height: 1.45;
        }

        .back {
          display: block;
          margin-top: 18px;
          color: #226444;
          font-size: 13px;
          font-weight: 800;
          text-align: center;
          text-decoration: none;
        }

        @media (max-width: 600px) {
          .forgot-page {
            min-height: calc(100vh - 72px);
            padding: 20px 14px;
          }

          .forgot-card {
            padding: 28px 22px;
            border-radius: 22px;
          }

          h1 {
            font-size: 36px;
          }
        }
      `}</style>

      <section className="forgot-card">
        <p className="eyebrow">WonderfulLife Member</p>

        <h1>Reset your password</h1>

        <p className="intro">
          Enter the email address associated with your WonderfulLife account.
          We'll send you a secure link to create a new password.
        </p>

        <form action={requestPasswordResetAction}>
          <div>
            <label htmlFor="email">Email address</label>

            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <button type="submit">
            Send Reset Link
          </button>

          {params.message ? (
            <div className="message">
              {params.message}
            </div>
          ) : null}
        </form>

        <Link href="/sign-in" className="back">
          ← Back to Sign In
        </Link>
      </section>
    </main>
  );
}