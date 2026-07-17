import { motion } from "framer-motion";
import { cn } from "../../utils/cn";
import { useCountUp } from "../../hooks/useCountUp";

const ACCENTS = {
  brand: "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400",
  good: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  critical: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
  warning: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
};

/**
 * @param {{ label: string, value: number, suffix?: string, decimals?: number, icon: React.ElementType, accent?: keyof ACCENTS, delta?: string, index?: number }} props
 */
export function StatCard({ label, value, suffix = "", decimals = 0, icon: Icon, accent = "brand", delta, index = 0 }) {
  const animated = useCountUp(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
      whileHover={{ y: -3 }}
      className="card-surface p-5"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {animated.toFixed(decimals)}
            {suffix}
          </p>
          {delta && (
            <p className="mt-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">{delta}</p>
          )}
        </div>
        <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", ACCENTS[accent])}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </motion.div>
  );
}
