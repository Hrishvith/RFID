import { cn } from "../../utils/cn";

export function Table({ className, ...props }) {
  return (
    <div className="w-full overflow-x-auto scrollbar-thin">
      <table className={cn("w-full border-collapse text-left text-sm", className)} {...props} />
    </div>
  );
}

export function TableHeader({ className, ...props }) {
  return (
    <thead
      className={cn(
        "border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400",
        className
      )}
      {...props}
    />
  );
}

export function TableBody({ className, ...props }) {
  return <tbody className={cn("divide-y divide-slate-100 dark:divide-slate-800/70", className)} {...props} />;
}

export function TableRow({ className, ...props }) {
  return (
    <tr
      className={cn(
        "transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40",
        className
      )}
      {...props}
    />
  );
}

export function TableHead({ className, ...props }) {
  return <th className={cn("whitespace-nowrap px-4 py-3 font-medium", className)} {...props} />;
}

export function TableCell({ className, ...props }) {
  return (
    <td
      className={cn("whitespace-nowrap px-4 py-3 text-slate-700 dark:text-slate-300", className)}
      {...props}
    />
  );
}
