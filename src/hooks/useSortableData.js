import { useMemo, useState } from "react";

/**
 * @param {Array} items
 * @param {{ key: string, direction: "asc"|"desc" }} [initialSort]
 */
export function useSortableData(items, initialSort = null) {
  const [sortConfig, setSortConfig] = useState(initialSort);

  const sortedItems = useMemo(() => {
    if (!sortConfig) return items;
    const { key, direction } = sortConfig;
    const sorted = [...items].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      if (typeof aVal === "number" && typeof bVal === "number") return aVal - bVal;
      return String(aVal).localeCompare(String(bVal));
    });
    return direction === "asc" ? sorted : sorted.reverse();
  }, [items, sortConfig]);

  function requestSort(key) {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  }

  return { sortedItems, sortConfig, requestSort };
}
