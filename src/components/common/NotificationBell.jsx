import { useEffect, useRef, useState } from "react";
import { Bell, CheckCircle2, Info, AlertTriangle, XCircle } from "lucide-react";
import { getLiveNotifications } from "../../services/notificationService";
import { cn } from "../../utils/cn";

const REFRESH_INTERVAL_MS = 60_000;
const SEEN_IDS_STORAGE_KEY = "rfid.notifications.seenIds";

const ICONS = {
  success: { Icon: CheckCircle2, cls: "text-emerald-500" },
  info: { Icon: Info, cls: "text-brand-500" },
  warning: { Icon: AlertTriangle, cls: "text-amber-500" },
  error: { Icon: XCircle, cls: "text-red-500" },
};

function loadSeenIds() {
  try {
    const raw = localStorage.getItem(SEEN_IDS_STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveSeenIds(ids) {
  try {
    localStorage.setItem(SEEN_IDS_STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // Storage unavailable (e.g. private browsing) - read state just won't persist.
  }
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  // getLiveNotifications() is recomputed fresh on every call and never sets
  // a `read` flag, so "unread" is tracked here instead: an id is unread
  // until that specific notification is clicked.
  const [seenIds, setSeenIds] = useState(loadSeenIds);
  const ref = useRef(null);

  useEffect(() => {
    let cancelled = false;

    function load() {
      getLiveNotifications().then((data) => {
        if (!cancelled) setNotifications(data);
      });
    }

    load();
    const interval = setInterval(load, REFRESH_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Also refresh the instant the bell is opened, rather than only on the
  // 60s interval - otherwise an action taken moments ago (e.g. an admin
  // adding a student) can look like it produced no notification at all.
  function refreshNow() {
    getLiveNotifications().then(setNotifications);
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggleOpen() {
    setOpen((wasOpen) => {
      const willOpen = !wasOpen;
      if (willOpen) refreshNow();
      return willOpen;
    });
  }

  function markAsRead(id) {
    setSeenIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      saveSeenIds(next);
      return next;
    });
  }

  const unreadCount = notifications.filter((n) => !seenIds.has(n.id)).length;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={toggleOpen}
        aria-label="Notifications"
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-brand-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-brand-400"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 origin-top-right animate-scale-in rounded-2xl border border-slate-200 bg-white shadow-soft-lg dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Notifications</p>
            <span className="text-xs text-slate-400">{unreadCount} unread</span>
          </div>
          <div className="max-h-80 overflow-y-auto scrollbar-thin">
            {notifications.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-slate-400">No notifications yet.</p>
            )}
            {notifications.map((n) => {
              const { Icon, cls } = ICONS[n.type] ?? ICONS.info;
              const isUnread = !seenIds.has(n.id);
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => markAsRead(n.id)}
                  className={cn(
                    "flex w-full gap-3 border-b border-slate-50 px-4 py-3 text-left last:border-0 hover:bg-slate-50 dark:border-slate-800/60 dark:hover:bg-slate-800/40",
                    isUnread && "bg-brand-50/40 dark:bg-brand-500/5"
                  )}
                >
                  <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", cls)} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{n.title}</p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">{n.message}</p>
                    <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                      {n.time}
                      {isUnread && (
                        <span className="ml-2 rounded-full bg-brand-100 px-1.5 py-0.5 text-[10px] font-medium text-brand-700 dark:bg-brand-500/15 dark:text-brand-400">
                          Unread
                        </span>
                      )}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
