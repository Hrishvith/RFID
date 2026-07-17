import { motion } from "framer-motion";
import { Radio } from "lucide-react";
import { Badge, statusVariant } from "../ui/badge";
import { Avatar } from "../ui/avatar";

/**
 * @param {{ scans: import('../../types').AttendanceRecord[] }} props
 */
export function RecentScans({ scans }) {
  if (scans.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-400">No scans logged yet today.</p>;
  }

  return (
    <ul className="space-y-1">
      {scans.map((scan, i) => (
        <motion.li
          key={scan.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
          className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
        >
          <Avatar name={scan.name} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
              {scan.name} <span className="text-slate-400">· {scan.usn}</span>
            </p>
            <p className="flex items-center gap-1 truncate text-xs text-slate-400">
              <Radio className="h-3 w-3" /> {scan.uid}
            </p>
          </div>
          <div className="text-right">
            <Badge variant={statusVariant(scan.status)}>{scan.status}</Badge>
            <p className="mt-1 text-xs tabular-nums text-slate-400">
              {scan.loginTime || scan.logoutTime || "--"}
            </p>
          </div>
        </motion.li>
      ))}
    </ul>
  );
}
