import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Info, AlertTriangle, XCircle } from "lucide-react";
import { getLiveNotifications } from "../../services/notificationService";
import { cn } from "../../utils/cn";

const ICONS = {
  success: { Icon: CheckCircle2, cls: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" },
  info: { Icon: Info, cls: "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400" },
  warning: { Icon: AlertTriangle, cls: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400" },
  error: { Icon: XCircle, cls: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400" },
};

export function RecentActivity() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    getLiveNotifications().then(setItems);
  }, []);

  if (items.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-400">No recent activity yet.</p>;
  }

  return (
    <ul className="space-y-1">
      {items.map((item, i) => {
        const { Icon, cls } = ICONS[item.type] ?? ICONS.info;
        return (
          <motion.li
            key={item.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="flex items-start gap-3 rounded-xl px-2 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50"
          >
            <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", cls)}>
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{item.title}</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{item.message}</p>
            </div>
            <span className="shrink-0 text-xs text-slate-400">{item.time}</span>
          </motion.li>
        );
      })}
    </ul>
  );
}
