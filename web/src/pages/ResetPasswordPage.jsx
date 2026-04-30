import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../utils/api";

const SPECIAL_CHAR_REGEX = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/;
const MIN_PASSWORD_LENGTH = 6;

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isResetComplete, setIsResetComplete] = useState(false);

  // Verify the token when the page loads
  useEffect(() => {
    async function verifyToken() {
      try {
        const data = await apiRequest(
          `/api/auth/verify-reset-token/${token}`
        );
        setIsTokenValid(data.valid);
      } catch {
        setIsTokenValid(false);
      } finally {
        setIsVerifying(false);
      }
    }
    verifyToken();
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!password) {
      setError("New password is required");
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
      return;
    }

    if (!SPECIAL_CHAR_REGEX.test(password)) {
      setError("Password must contain at least one special character");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      await apiRequest("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });
      setIsResetComplete(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Loading state — verifying token
  if (isVerifying) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-3 border-accent-500 border-t-transparent" />
          <p className="text-surface-500 text-sm">Verifying your reset link...</p>
        </div>
      </div>
    );
  }

  // Invalid / expired token
  if (!isTokenValid) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-surface-200 bg-white p-8 text-center shadow-xl shadow-surface-200/70">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-danger-500/15">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7 text-danger-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-bold text-surface-900">
              Link expired or invalid
            </h2>
            <p className="mb-6 text-surface-500 text-sm leading-relaxed">
              This password reset link has expired or is invalid.
              Please request a new one.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                to="/forgot-password"
                className="rounded-lg bg-accent-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-600"
              >
                Request new link
              </Link>
              <Link
                to="/signin"
                className="rounded-lg border border-surface-200 bg-white px-6 py-2.5 text-sm font-medium text-surface-600 transition-colors hover:bg-surface-50 hover:text-surface-900"
              >
                Back to Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state — password was reset
  if (isResetComplete) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-surface-200 bg-white p-8 text-center shadow-xl shadow-surface-200/70">
            <div
              className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full"
              style={{
                background:
                  "linear-gradient(135deg, rgba(34,197,94,0.2) 0%, rgba(74,222,128,0.1) 100%)",
                animation: "resetSuccessPulse 2s ease-in-out infinite",
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-bold text-surface-900">
              Password reset successful!
            </h2>
            <p className="mb-6 text-surface-500 text-sm leading-relaxed">
              Your password has been updated. You can now sign in with your new password.
            </p>
            <button
              onClick={() => navigate("/signin", { replace: true })}
              className="cursor-pointer rounded-lg bg-accent-500 px-8 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-300 focus:ring-offset-2 focus:ring-offset-white"
            >
              Go to Sign in
            </button>
          </div>
        </div>

        <style>{`
          @keyframes resetSuccessPulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.06); opacity: 0.9; }
          }
        `}</style>
      </div>
    );
  }

  // Reset form
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7 text-accent-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-surface-900">Set new password</h1>
          <p className="mt-2 text-surface-500">
            Min 6 chars, one special character
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-surface-200 bg-white p-8 shadow-xl shadow-surface-200/70">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg border border-danger-500/30 bg-danger-500/10 px-4 py-3 text-sm text-danger-400">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="reset-password"
                className="mb-1.5 block text-sm font-medium text-surface-700"
              >
                New password
              </label>
              <input
                id="reset-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 chars, one special character"
                autoComplete="new-password"
                autoFocus
                className="w-full rounded-lg border border-surface-200 bg-white px-4 py-2.5 text-surface-900 placeholder-surface-400 outline-none transition-colors focus:border-accent-400 focus:ring-2 focus:ring-accent-100"
              />
            </div>

            <div>
              <label
                htmlFor="reset-confirm-password"
                className="mb-1.5 block text-sm font-medium text-surface-700"
              >
                Confirm password
              </label>
              <input
                id="reset-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                autoComplete="new-password"
                className="w-full rounded-lg border border-surface-200 bg-white px-4 py-2.5 text-surface-900 placeholder-surface-400 outline-none transition-colors focus:border-accent-400 focus:ring-2 focus:ring-accent-100"
              />
            </div>

            {/* Password strength hint */}
            {password && (
              <div className="flex items-center gap-2 text-xs">
                <div className="flex gap-1 flex-1">
                  <div
                    className="h-1 flex-1 rounded-full transition-colors"
                    style={{
                      backgroundColor:
                        password.length >= 6 ? "#22c55e" : "#e4e4ec",
                    }}
                  />
                  <div
                    className="h-1 flex-1 rounded-full transition-colors"
                    style={{
                      backgroundColor:
                        password.length >= 8 ? "#22c55e" : "#e4e4ec",
                    }}
                  />
                  <div
                    className="h-1 flex-1 rounded-full transition-colors"
                    style={{
                      backgroundColor:
                        password.length >= 10 &&
                        SPECIAL_CHAR_REGEX.test(password)
                          ? "#22c55e"
                          : "#e4e4ec",
                    }}
                  />
                </div>
                <span className="text-surface-500">
                  {password.length < 6
                    ? "Too short"
                    : password.length < 8
                    ? "Fair"
                    : password.length < 10
                    ? "Good"
                    : "Strong"}
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full cursor-pointer rounded-lg bg-accent-500 px-4 py-2.5 font-medium text-white transition-colors hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-300 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Resetting..." : "Reset password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
