import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

function severity(pct) {
  if (pct >= 85) return { fill: "bg-brand-600", track: "bg-brand-100 dark:bg-brand-500/15", label: "text-brand-700 dark:text-brand-300" };
  if (pct >= 70) return { fill: "bg-amber-500", track: "bg-amber-100 dark:bg-amber-500/15", label: "text-amber-700 dark:text-amber-300" };
  return { fill: "bg-red-500", track: "bg-red-100 dark:bg-red-500/15", label: "text-red-700 dark:text-red-300" };
}

/**
 * A single ratio against a target (today's attendance %) - deliberately a
 * meter, not a two-slice pie, per the data-viz guidance for "one ratio".
 * @param {{ value: number, target?: number }} props
 */
export function AttendanceMeter({ value, target = 75 }) {
  const pct = Math.min(100, Math.max(0, value));
  const { fill, track, label } = severity(pct);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end justify-between">
        <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {pct.toFixed(1)}%
        </span>
        <span className={cn("text-xs font-medium", label)}>
          Target {target}%
        </span>
      </div>

      <div className={cn("relative h-3 w-full overflow-hidden rounded-full", track)}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={cn("h-full rounded-full", fill)}
        />
        <div
          className="absolute top-0 h-full w-px bg-slate-400/60 dark:bg-slate-300/40"
          style={{ left: `${target}%` }}
          title={`Target: ${target}%`}
        />
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        {pct >= target
          ? `${(pct - target).toFixed(1)}pt above target`
          : `${(target - pct).toFixed(1)}pt below target`}
      </p>
    </div>
  );
}
