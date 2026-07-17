import { forwardRef } from "react";
import { Check } from "lucide-react";
import { cn } from "../../utils/cn";

export const Checkbox = forwardRef(function Checkbox({ className, checked, ...props }, ref) {
  return (
    <span className="relative inline-flex h-4 w-4 shrink-0">
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        className={cn(
          "peer h-4 w-4 shrink-0 appearance-none rounded-md border border-slate-300 bg-white transition-colors checked:border-brand-600 checked:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:border-slate-600 dark:bg-slate-900",
          className
        )}
        {...props}
      />
      <Check className="pointer-events-none absolute left-0 top-0 h-4 w-4 scale-0 text-white transition-transform peer-checked:scale-100" />
    </span>
  );
});
