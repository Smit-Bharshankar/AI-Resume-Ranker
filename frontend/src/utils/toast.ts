export type ToastTone = "success" | "error" | "info";

export type ToastMessage = {
  id: string;
  message: string;
  tone: ToastTone;
  durationMs: number;
};

type ToastInput = {
  message: string;
  tone?: ToastTone;
  durationMs?: number;
};

type ToastListener = (toast: ToastMessage) => void;

const listeners = new Set<ToastListener>();

const createToastId = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const subscribeToToasts = (listener: ToastListener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const showToast = ({ message, tone = "info", durationMs = 3500 }: ToastInput): void => {
  const toast: ToastMessage = {
    id: createToastId(),
    message,
    tone,
    durationMs,
  };

  listeners.forEach((listener) => {
    listener(toast);
  });
};
