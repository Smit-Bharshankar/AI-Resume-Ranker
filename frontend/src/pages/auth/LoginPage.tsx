import { FormEvent, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ThemeToggle } from "../../components/ui/ThemeToggle";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import webDarkLogo from "../../../assests/web_dark_sq_ctn.svg";
import webLightLogo from "../../../assests/web_light_sq_ctn.svg";

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
  const { resolvedTheme } = useTheme();
  const redirectPath =
    typeof (location.state as { from?: unknown } | null)?.from === "string"
      ? (location.state as { from: string }).from
      : "/jobs";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const googleButtonSrc = resolvedTheme === "dark" ? webDarkLogo : webLightLogo;

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
    <div className="relative min-h-screen bg-linear-to-b from-muted/40 to-background px-4 py-12">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="mx-auto mt-8 max-w-md space-y-6 rounded-xl border bg-card p-7 shadow-sm">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Welcome Back
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Sign in</h1>
          <p className="text-sm text-muted-foreground">
            Continue to your jobs and candidate pipeline.
          </p>
        </div>

        {error ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-foreground">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-md border border-border/80 bg-slate-100/70 px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-ring focus:ring-2 focus:ring-ring/20 dark:bg-secondary/60"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-foreground">Password</span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-md border border-border/80 bg-slate-100/70 px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-ring focus:ring-2 focus:ring-ring/20 dark:bg-secondary/60"
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting || isGoogleSubmitting}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Signing in..." : "Sign in with email"}
          </button>
        </form>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isSubmitting || isGoogleSubmitting}
          aria-label="Continue with Google"
          className="w-full rounded-md transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          {/* {isGoogleSubmitting ? (
            <span className="inline-block py-2 text-sm text-muted-foreground">Redirecting...</span>
          ) : ( */}
            <img
              src={googleButtonSrc}
              alt="Continue with Google"
              className="h-10 w-full"
            />
          {/* )} */}
        </button>

        <p className="text-sm text-muted-foreground">
          Do not have an account?{" "}
          <Link className="font-medium text-foreground underline" to="/signup">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
