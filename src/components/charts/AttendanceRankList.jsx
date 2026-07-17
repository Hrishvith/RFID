import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

/**
 * Ranked horizontal bars for Top/Lowest attendance - magnitude comparison
 * across named students, so one hue per list (not per student).
 * @param {{ students: { usn: string, name: string, attendanceRate: number }[], tone?: "good"|"critical" }} props
 */
export function AttendanceRankList({ students, tone = "good" }) {
  const barColor = tone === "good" ? "bg-brand-600" : "bg-amber-500";
  const max = Math.max(...students.map((s) => s.attendanceRate), 1);

  return (
    <ul className="space-y-3">
      {students.map((s, i) => (
        <li key={s.usn} className="flex items-center gap-3">
          <span className="w-28 shrink-0 truncate text-xs font-medium text-slate-600 dark:text-slate-300">
            {s.name}
          </span>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(s.attendanceRate / max) * 100}%` }}
              transition={{ duration: 0.6, delay: i * 0.06, ease: "easeOut" }}
              className={cn("h-full rounded-full", barColor)}
            />
          </div>
          <span className="w-12 shrink-0 text-right text-xs font-semibold tabular-nums text-slate-700 dark:text-slate-200">
            {s.attendanceRate.toFixed(0)}%
          </span>
        </li>
      ))}
    </ul>
  );
}
