import { useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../utils/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await apiRequest("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setDevResetUrl(data.resetUrl || "");
      setIsEmailSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Success state — email sent
  if (isEmailSent) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-surface-800 bg-surface-900 p-8 shadow-xl shadow-black/20 text-center">
            {/* Animated checkmark circle */}
            <div
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
              style={{
                background:
                  "linear-gradient(135deg, rgba(124,92,255,0.15) 0%, rgba(34,197,94,0.15) 100%)",
                animation: "forgotPulse 2s ease-in-out infinite",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-success-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>

            <h2 className="mb-2 text-xl font-bold text-white">
              Check your email
            </h2>
            <p className="mb-6 text-surface-400 text-sm leading-relaxed">
              If an account with <span className="text-primary-400 font-medium">{email}</span> exists,
              we've sent a password reset link. Please check your inbox
              and spam folder.
            </p>

            {devResetUrl && (
              <div className="mb-6 rounded-lg border border-accent-400/30 bg-accent-500/10 p-4 text-left">
                <p className="mb-2 text-sm font-medium text-accent-200">
                  Email is not configured locally. Use this development reset link:
                </p>
                <a
                  href={devResetUrl}
                  className="break-all text-sm text-primary-300 underline hover:text-primary-200"
                >
                  {devResetUrl}
                </a>
              </div>
            )}

            <Link
              to="/signin"
              className="inline-block rounded-lg bg-surface-800 px-6 py-2.5 text-sm font-medium text-surface-300 transition-colors hover:bg-surface-700 hover:text-white"
            >
              ← Back to Sign in
            </Link>
          </div>
        </div>

        <style>{`
          @keyframes forgotPulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.08); opacity: 0.85; }
          }
        `}</style>
      </div>
    );
  }

  // Form state
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-600/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7 text-primary-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">Forgot password?</h1>
          <p className="mt-2 text-surface-400">
            No worries, we'll send you a reset link
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-surface-800 bg-surface-900 p-8 shadow-xl shadow-black/20">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg border border-danger-500/30 bg-danger-500/10 px-4 py-3 text-sm text-danger-400">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="forgot-email"
                className="mb-1.5 block text-sm font-medium text-surface-300"
              >
                Email address
              </label>
              <input
                id="forgot-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                autoFocus
                className="w-full rounded-lg border border-surface-700 bg-surface-800 px-4 py-2.5 text-white placeholder-surface-500 outline-none transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full cursor-pointer rounded-lg bg-primary-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-surface-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Sending link…" : "Send reset link"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-surface-400">
            Remember your password?{" "}
            <Link
              to="/signin"
              className="font-medium text-primary-400 hover:text-primary-300 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
