import { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";

export function ProtectedRoute({ children }: PropsWithChildren) {
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user, isLoading, signOut } = useAuth();

  if (isLoading) {
    return <div className="p-6 text-sm text-slate-600">Checking session...</div>;
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
    <div>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between p-4">
          <div className="text-sm text-slate-700">{user.email}</div>
          <button
            type="button"
            onClick={() => {
              void handleLogout();
            }}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Logout
          </button>
        </div>
      </header>
      {children}
    </div>
  );
}
