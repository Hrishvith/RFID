import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTheme } from "../../hooks/useTheme";
import { getChartColors } from "../../utils/chartTheme";
import { ChartTooltip } from "./ChartTooltip";

/**
 * @param {{ data: { label: string, present: number, absent: number }[] }} props
 */
export function WeeklyAttendanceChart({ data }) {
  const { theme } = useTheme();
  const c = getChartColors(theme);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} barGap={4} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={c.grid} strokeDasharray="0" />
        <XAxis
          dataKey="label"
          axisLine={{ stroke: c.axis }}
          tickLine={false}
          tick={{ fill: c.inkMuted, fontSize: 12 }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: c.inkMuted, fontSize: 12 }}
          width={32}
          domain={[0, "dataMax"]}
          allowDecimals={false}
        />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: c.inkSecondary }} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(148,163,184,0.08)" }} />
        <Bar dataKey="present" name="Present" fill={c.good} radius={[4, 4, 0, 0]} maxBarSize={22} />
        <Bar dataKey="absent" name="Absent" fill={c.critical} radius={[4, 4, 0, 0]} maxBarSize={22} />
      </BarChart>
    </ResponsiveContainer>
  );
}
