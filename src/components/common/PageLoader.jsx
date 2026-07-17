import { Loader2 } from "lucide-react";

export function PageLoader() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-slate-50 dark:bg-slate-950">
      <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
    </div>
  );
}
