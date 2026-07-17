import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTheme } from "../../hooks/useTheme";
import { getChartColors } from "../../utils/chartTheme";
import { ChartTooltip } from "./ChartTooltip";

/**
 * Magnitude comparison across categories -> sequential single hue, not
 * categorical colors (the departments aren't "identity", the rate is what
 * matters).
 * @param {{ data: { department: string, attendanceRate: number }[] }} props
 */
export function DepartmentAttendanceChart({ data }) {
  const { theme } = useTheme();
  const c = getChartColors(theme);
  const sorted = [...data].sort((a, b) => b.attendanceRate - a.attendanceRate);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={sorted}
        layout="vertical"
        margin={{ top: 8, right: 24, left: 8, bottom: 0 }}
      >
        <CartesianGrid horizontal={false} stroke={c.grid} />
        <XAxis
          type="number"
          domain={[0, 100]}
          tickFormatter={(v) => `${v}%`}
          axisLine={{ stroke: c.axis }}
          tickLine={false}
          tick={{ fill: c.inkMuted, fontSize: 12 }}
        />
        <YAxis
          type="category"
          dataKey="department"
          axisLine={false}
          tickLine={false}
          width={56}
          tick={{ fill: c.inkSecondary, fontSize: 12 }}
        />
        <Tooltip content={<ChartTooltip formatter={(v) => `${v}%`} />} cursor={{ fill: "rgba(148,163,184,0.08)" }} />
        <Bar dataKey="attendanceRate" name="Attendance" radius={[0, 4, 4, 0]} maxBarSize={20}>
          {sorted.map((entry) => (
            <Cell key={entry.department} fill={c.brand} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
