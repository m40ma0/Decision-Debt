"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { CheckCircle2, CircleAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Toast = {
  id: number;
  title: string;
  tone: "success" | "error";
};

type ToastContextValue = {
  toast: (toast: Omit<Toast, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    (value: Omit<Toast, "id">) => {
      const id = Date.now();
      setToasts((current) => [...current, { ...value, id }]);
      window.setTimeout(() => dismiss(id), 3800);
    },
    [dismiss]
  );

  const contextValue = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
        {toasts.map((item) => {
          const Icon = item.tone === "success" ? CheckCircle2 : CircleAlert;
          return (
            <div
              key={item.id}
              className={cn(
                "flex items-center gap-3 rounded-lg border bg-white p-3 text-sm shadow-soft",
                item.tone === "success"
                  ? "border-moss/20 text-ink"
                  : "border-coral/25 text-ink"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5",
                  item.tone === "success" ? "text-moss" : "text-coral"
                )}
              />
              <p className="min-w-0 flex-1">{item.title}</p>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label="Dismiss"
                onClick={() => dismiss(item.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const value = useContext(ToastContext);
  if (!value) throw new Error("useToast must be used inside ToastProvider");
  return value;
}
