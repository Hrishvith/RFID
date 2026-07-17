/**
 * Validated chart color tokens (see dataviz skill palette + validator run).
 * Keep chart components reading from here rather than hardcoding hex so the
 * whole dashboard's charts stay one system in both light and dark mode.
 */
export const chartColors = {
  light: {
    surface: "#ffffff",
    plane: "#f8fafc",
    ink: "#0f172a",
    inkSecondary: "#475569",
    inkMuted: "#94a3b8",
    grid: "#e2e8f0",
    axis: "#cbd5e1",
    good: "#0ca30c",
    warning: "#d97706",
    critical: "#dc2626",
    sequential: ["#cde2fb", "#9ec5f4", "#5598e7", "#2a78d6", "#184f95"],
    brand: "#2563eb",
  },
  dark: {
    surface: "#0f172a",
    plane: "#020617",
    ink: "#f1f5f9",
    inkSecondary: "#cbd5e1",
    inkMuted: "#64748b",
    grid: "#1e293b",
    axis: "#334155",
    good: "#22c55e",
    warning: "#f59e0b",
    critical: "#f87171",
    sequential: ["#184f95", "#256abf", "#3987e5", "#6da7ec", "#9ec5f4"],
    brand: "#60a5fa",
  },
};

export function getChartColors(theme) {
  return theme === "dark" ? chartColors.dark : chartColors.light;
}
