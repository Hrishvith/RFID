import { cva } from "class-variance-authority";
import { cn } from "../../utils/cn";

export const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300",
        good: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
        warning: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
        critical: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
        neutral: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export function Badge({ className, variant, dot = false, children, ...props }) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />}
      {children}
    </span>
  );
}

/** Maps an attendance status string to the right badge variant. */
export function statusVariant(status) {
  if (status === "Present") return "good";
  if (status === "Late") return "warning";
  if (status === "Absent") return "critical";
  return "neutral";
}
