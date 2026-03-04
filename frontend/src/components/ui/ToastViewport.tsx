import { useEffect, useState } from "react";
import { subscribeToToasts, ToastMessage } from "../../utils/toast";

const toneClasses: Record<ToastMessage["tone"], string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-red-200 bg-red-50 text-red-800",
  info: "border-blue-200 bg-blue-50 text-blue-800",
};

export function ToastViewport() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToToasts((incoming) => {
      setToasts((current) => [...current, incoming]);

      window.setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== incoming.id));
      }, incoming.durationMs);
    });

    return unsubscribe;
  }, []);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          aria-live="polite"
          className={`pointer-events-auto rounded-md border px-3 py-2 text-sm shadow-sm ${toneClasses[toast.tone]}`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
