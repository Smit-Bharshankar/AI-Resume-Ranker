import { FormEvent, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const toUiError = (error: unknown): string => {
  if (error instanceof Error) {
    const message = error.message.trim();
    if (!message) {
      return "Unable to sign in. Please try again.";
    }
    if (message.toLowerCase().includes("fetch")) {
      return "Network error. Please check your connection and try again.";
    }
    return message;
  }

  return "Unable to sign in. Please try again.";
};

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading, signInWithPassword, signInWithGoogle } = useAuth();
  const redirectPath =
    typeof (location.state as { from?: unknown } | null)?.from === "string"
      ? (location.state as { from: string }).from
      : "/jobs";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      navigate(redirectPath, { replace: true });
    }
  }, [isLoading, navigate, redirectPath, user]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await signInWithPassword(email.trim(), password);
      navigate(redirectPath, { replace: true });
    } catch (submitError) {
      setError(toUiError(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsGoogleSubmitting(true);

    try {
      await signInWithGoogle();
    } catch (submitError) {
      setError(toUiError(submitError));
      setIsGoogleSubmitting(false);
    }
  };

  return (
    <div className="mx-auto mt-20 max-w-md space-y-6 rounded-md border border-slate-200 bg-white p-6 shadow-sm">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-900">Login</h1>
        <p className="text-sm text-slate-600">Sign in to continue to your jobs and candidates.</p>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block space-y-1">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium text-slate-700">Password</span>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </label>

        <button
          type="submit"
          disabled={isSubmitting || isGoogleSubmitting}
          className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Signing in..." : "Sign in with email"}
        </button>
      </form>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isSubmitting || isGoogleSubmitting}
        className="w-full rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isGoogleSubmitting ? "Redirecting..." : "Continue with Google"}
      </button>

      <p className="text-sm text-slate-600">
        Do not have an account?{" "}
        <Link className="font-medium text-slate-900 underline" to="/signup">
          Sign up
        </Link>
      </p>
    </div>
  );
}
