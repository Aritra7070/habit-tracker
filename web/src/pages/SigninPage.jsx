import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";

export default function SigninPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signin, googleSignIn } = useAuth();
  const navigate = useNavigate();
  const forgotPasswordPath = email.trim()
    ? `/forgot-password?email=${encodeURIComponent(email.trim())}`
    : "/forgot-password";

  const googleLogin = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      try {
        setError("");
        setIsSubmitting(true);
        console.log("Google login successful, sending token to backend...");
        await googleSignIn(codeResponse.access_token);
        console.log("Backend authentication successful");
        navigate("/dashboard", { replace: true });
      } catch (err) {
        console.error("Google signin error:", err);
        setError(err.message || "Google sign in failed");
      } finally {
        setIsSubmitting(false);
      }
    },
    onError: (error) => {
      console.error("Google login error:", error);
      setError("Google sign in failed. Please try again.");
    },
  });

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!password) {
      setError("Password is required");
      return;
    }

    setIsSubmitting(true);

    try {
      await signin(email, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">Welcome back</h1>
          <p className="mt-2 text-surface-400">
            Sign in to continue tracking your habits
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-surface-800 bg-surface-900 p-8 shadow-xl shadow-black/20">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={() => googleLogin()}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 rounded-lg border border-surface-700 bg-surface-800 px-4 py-2.5 font-medium text-white transition-colors hover:bg-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-surface-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 border-t border-surface-700"></div>
              <span className="text-xs text-surface-400">OR</span>
              <div className="flex-1 border-t border-surface-700"></div>
            </div>

            {error && (
              <div className="rounded-lg border border-danger-500/30 bg-danger-500/10 px-4 py-3 text-sm text-danger-400">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="signin-email"
                className="mb-1.5 block text-sm font-medium text-surface-300"
              >
                Email
              </label>
              <input
                id="signin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full rounded-lg border border-surface-700 bg-surface-800 px-4 py-2.5 text-white placeholder-surface-500 outline-none transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              />
            </div>

            <div>
              <label
                htmlFor="signin-password"
                className="mb-1.5 block text-sm font-medium text-surface-300"
              >
                Password
              </label>
              <input
                id="signin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                className="w-full rounded-lg border border-surface-700 bg-surface-800 px-4 py-2.5 text-white placeholder-surface-500 outline-none transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              />
            </div>

            <div>
              <Link
                to={forgotPasswordPath}
                className="block w-full rounded-lg border border-surface-700 bg-surface-800 px-4 py-2.5 text-center text-sm font-medium text-surface-300 transition-colors hover:bg-surface-700 hover:text-white"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full cursor-pointer rounded-lg bg-primary-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-surface-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-surface-400">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              className="font-medium text-primary-400 hover:text-primary-300 transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
