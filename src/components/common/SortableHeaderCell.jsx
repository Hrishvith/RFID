import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { TableHead } from "../ui/table";
import { cn } from "../../utils/cn";

export function SortableHeaderCell({ label, sortKey, sortConfig, onSort, className }) {
  const isActive = sortConfig?.key === sortKey;
  const Icon = isActive ? (sortConfig.direction === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;

  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn(
          "flex items-center gap-1.5 hover:text-slate-700 dark:hover:text-slate-200",
          isActive && "text-brand-600 dark:text-brand-400"
        )}
      >
        {label}
        <Icon className="h-3.5 w-3.5" />
      </button>
    </TableHead>
  );
}
