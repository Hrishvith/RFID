import { motion } from "framer-motion";

/**
 * Part-to-whole for a single day: one stacked bar, not a two-slice pie.
 * @param {{ present: number, absent: number }} props
 */
export function PresentAbsentChart({ present, absent }) {
  const total = present + absent || 1;
  const presentPct = (present / total) * 100;
  const absentPct = (absent / total) * 100;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex h-8 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${presentPct}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="flex items-center justify-end bg-emerald-500 pr-2"
        >
          {presentPct > 12 && (
            <span className="text-xs font-semibold text-white">{presentPct.toFixed(0)}%</span>
          )}
        </motion.div>
        {absentPct > 0 && <div className="w-0.5 shrink-0 bg-white dark:bg-slate-900" />}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${absentPct}%` }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
          className="flex items-center justify-end bg-red-500 pr-2"
        >
          {absentPct > 12 && (
            <span className="text-xs font-semibold text-white">{absentPct.toFixed(0)}%</span>
          )}
        </motion.div>
      </div>

      <div className="flex items-center gap-6 text-sm">
        <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          Present <span className="font-semibold text-slate-900 dark:text-white">{present}</span>
        </span>
        <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
          Absent <span className="font-semibold text-slate-900 dark:text-white">{absent}</span>
        </span>
      </div>
    </div>
  );
}
