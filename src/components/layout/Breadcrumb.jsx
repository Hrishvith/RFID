import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

/**
 * @param {{ items: { label: string, to?: string }[] }} props
 */
export function Breadcrumb({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-sm text-slate-500 dark:text-slate-400">
      <Link
        to="/dashboard"
        className="flex items-center gap-1 hover:text-brand-600 dark:hover:text-brand-400"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1">
          <ChevronRight className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600" />
          {item.to ? (
            <Link to={item.to} className="hover:text-brand-600 dark:hover:text-brand-400">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-slate-700 dark:text-slate-200">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
