import { useEffect } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "../../utils/cn";

/**
 * Lightweight, self-dismissing toast used by the Students module for
 * success/error feedback in place of browser alert().
 * @param {{ toast: { type: "success" | "error", message: string } | null, onDismiss: () => void }} props
 */
export function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const isError = toast.type === "error";

  return (
    <div
      role="status"
      className={cn(
        "fixed bottom-5 right-5 z-[60] flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium shadow-xl",
        isError
          ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
          : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
      )}
    >
      {isError ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
      <span>{toast.message}</span>
    </div>
  );
}
