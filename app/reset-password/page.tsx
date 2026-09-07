"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [ready, setReady] =
    useState(false);

  useEffect(() => {
    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setReady(true);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      setReady(Boolean(user));
    }

    checkSession();

    const { data: subscription } =
      supabase.auth.onAuthStateChange(
        (_event, session) => {
          if (session) {
            setReady(true);
          }
        }
      );

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");

    if (password.length < 8) {
      setMessage(
        "Please choose a password with at least 8 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setMessage(
        "The two passwords do not match."
      );
      return;
    }

    setLoading(true);

    const { error } =
      await supabase.auth.updateUser({
        password,
      });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage(
      "Your password has been updated successfully."
    );

    setLoading(false);

    setTimeout(() => {
      window.location.href =
        "/sign-in?message=Password updated. Please sign in with your new password.";
    }, 1200);
  }

  return (
    <main className="reset-page">
      <style>{`
        .reset-page {
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

        .reset-card {
          width: min(100%, 460px);
          padding: 34px;
          border: 1px solid rgba(255,255,255,.8);
          border-radius: 24px;
          background: rgba(255,255,255,.94);
          backdrop-filter: blur(18px);
          box-shadow:
            0 24px 70px
            rgba(20,60,40,.16);
          box-sizing: border-box;
        }

        .eyebrow {
          margin: 0 0 8px;
          color: #126241;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: .18em;
          text-transform: uppercase;
        }

        .reset-title {
          margin: 0;
          color: #123f2d;
          font-family:
            Georgia,
            "Times New Roman",
            serif;
          font-size: 42px;
          font-weight: 500;
          line-height: 1.05;
          letter-spacing: -.03em;
        }

        .intro {
          margin: 12px 0 24px;
          color: #617067;
          font-size: 14px;
          line-height: 1.55;
        }

        .reset-form {
          display: grid;
          gap: 14px;
        }

        .field {
          display: grid;
          gap: 6px;
        }

        .field label {
          color: #163e2c;
          font-size: 12px;
          font-weight: 800;
        }

        .password-wrap {
          position: relative;
          width: 100%;
        }

        .reset-input {
          width: 100%;
          height: 52px;
          padding: 0 58px 0 16px;
          border: 1px solid #cfdccf;
          border-radius: 14px;
          background: #f8fbf8;
          color: #182c21;
          font-size: 15px;
          outline: none;
          box-sizing: border-box;
        }

        .reset-input:focus {
          border-color: #649b73;
          background: #fff;
          box-shadow:
            0 0 0 4px
            rgba(47,113,67,.08);
        }

        .password-toggle {
          position: absolute;
          top: 50%;
          right: 13px;
          transform: translateY(-50%);
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          padding: 0;
          border: 0;
          border-radius: 50%;
          background: transparent;
          color: #567063;
          cursor: pointer;
        }

        .password-toggle:hover {
          background:
            rgba(18,98,65,.08);
          color: #126241;
        }

        .password-toggle svg {
          width: 21px;
          height: 21px;
        }

        .reset-button {
          width: 100%;
          height: 52px;
          margin-top: 2px;
          border: none;
          border-radius: 999px;
          background:
            linear-gradient(
              90deg,
              #075d3d,
              #0b7048
            );
          color: white;
          font-size: 15px;
          font-weight: 900;
          cursor: pointer;
        }

        .reset-button:disabled {
          opacity: .6;
          cursor: default;
        }

        .message {
          padding: 11px 12px;
          border-radius: 12px;
          background: #eef7ef;
          color: #24613d;
          font-size: 12px;
          line-height: 1.45;
        }

        .invalid-link {
          text-align: center;
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
          .reset-page {
            min-height:
              calc(100vh - 72px);
            padding: 20px 14px;
          }

          .reset-card {
            padding: 28px 22px;
            border-radius: 22px;
          }

          .reset-title {
            font-size: 36px;
          }
        }
      `}</style>

      <section className="reset-card">
        <p className="eyebrow">
          WonderfulLife Member
        </p>

        <h1 className="reset-title">
          Choose a new password
        </h1>

        <p className="intro">
          Enter your new WonderfulLife password
          below.
        </p>

        {ready ? (
          <form
            className="reset-form"
            onSubmit={handleSubmit}
          >
            <div className="field">
              <label htmlFor="password">
                New password
              </label>

              <div className="password-wrap">
                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  className="reset-input"
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (current) => !current
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  <EyeIcon
                    hidden={showPassword}
                  />
                </button>
              </div>
            </div>

            <div className="field">
              <label htmlFor="confirm-password">
                Confirm new password
              </label>

              <div className="password-wrap">
                <input
                  id="confirm-password"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  className="reset-input"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value
                    )
                  }
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      (current) => !current
                    )
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  <EyeIcon
                    hidden={
                      showConfirmPassword
                    }
                  />
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="reset-button"
              disabled={loading}
            >
              {loading
                ? "Updating..."
                : "Update Password"}
            </button>

            {message ? (
              <div className="message">
                {message}
              </div>
            ) : null}
          </form>
        ) : (
          <div className="invalid-link">
            <div className="message">
              This password reset link is
              invalid or has expired. Please
              request a new one.
            </div>

            <Link
              href="/forgot-password"
              className="back"
            >
              Request a New Reset Link
            </Link>
          </div>
        )}

        {ready ? (
          <Link
            href="/sign-in"
            className="back"
          >
            ← Back to Sign In
          </Link>
        ) : null}
      </section>
    </main>
  );
}

function EyeIcon({
  hidden,
}: {
  hidden: boolean;
}) {
  if (hidden) {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 4.2A10.7 10.7 0 0112 4c5.5 0 9.5 5.2 9.5 5.2a13.8 13.8 0 01-3.1 3.5M6.2 6.2C3.9 7.7 2.5 9.2 2.5 9.2S6.5 16 12 16c1.4 0 2.7-.4 3.8-.9"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M2.5 12S6.5 5.5 12 5.5 21.5 12 21.5 12 17.5 18.5 12 18.5 2.5 12 2.5 12Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle
        cx="12"
        cy="12"
        r="2.7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}