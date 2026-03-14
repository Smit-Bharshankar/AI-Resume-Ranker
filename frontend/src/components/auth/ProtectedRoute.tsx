import { PropsWithChildren } from "react";
import { Link, Navigate, NavLink, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/Button";
import { ThemeToggle } from "../ui/ThemeToggle";
import { cn } from "@/lib/utils";

export function ProtectedRoute({ children }: PropsWithChildren) {
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user, isLoading, signOut } = useAuth();

  if (isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Checking session...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const handleLogout = async () => {
    try {
      await signOut();
    } finally {
      queryClient.clear();
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-muted/40 to-background">
      <header className="sticky top-0 z-20 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link
            to="/jobs"
            className="font-dream-avenue px-2 py-1 rounded-2xl bg-[#f6e9cf] dark:bg-[#222222] dark:text-[#f6e9cf] text-3xl leading-none tracking-wide text-foreground"
          >
            Sortres
          </Link>

          <nav className="hidden items-center gap-2 sm:flex">
            {[
              { to: "/jobs", label: "Jobs" },
              { to: "/jobs/create", label: "Create Job" },
            ].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "rounded-full px-3 py-1.5 text-sm transition-colors",
                    isActive
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground sm:block">
              {user.email}
            </div>
            <ThemeToggle />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                void handleLogout();
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="pb-10">
        {children}
      </main>
    </div>
  );
}
