import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";

export function Pagination({ page, totalPages, totalItems, pageSize, onPrev, onNext, onPage }) {
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1
  );

  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Showing <span className="font-medium text-slate-700 dark:text-slate-300">{start}</span>
        {"–"}
        <span className="font-medium text-slate-700 dark:text-slate-300">{end}</span> of{" "}
        <span className="font-medium text-slate-700 dark:text-slate-300">{totalItems}</span>
      </p>

      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon" onClick={onPrev} disabled={page === 1} aria-label="Previous page">
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {pageNumbers.map((n, idx) => {
          const prev = pageNumbers[idx - 1];
          const showEllipsis = prev !== undefined && n - prev > 1;
          return (
            <span key={n} className="flex items-center gap-1">
              {showEllipsis && <span className="px-1 text-slate-400">...</span>}
              <Button
                variant={n === page ? "default" : "outline"}
                size="sm"
                className="h-8 w-8 px-0"
                onClick={() => onPage(n)}
              >
                {n}
              </Button>
            </span>
          );
        })}

        <Button
          variant="outline"
          size="icon"
          onClick={onNext}
          disabled={page === totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
