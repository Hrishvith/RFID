import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTheme } from "../../hooks/useTheme";
import { getChartColors } from "../../utils/chartTheme";
import { ChartTooltip } from "./ChartTooltip";

/**
 * Trend-over-time, single series -> no legend box needed (title already
 * names what's plotted).
 * @param {{ data: { label: string, present: number, absent: number }[] }} props
 */
export function MonthlyAttendanceChart({ data }) {
  const { theme } = useTheme();
  const c = getChartColors(theme);

  const series = data.map((d) => {
    const total = d.present + d.absent;
    return { label: d.label, rate: total ? Math.round((d.present / total) * 1000) / 10 : 0 };
  });

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={series} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <defs>
          <linearGradient id="monthlyFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c.brand} stopOpacity={0.22} />
            <stop offset="100%" stopColor={c.brand} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={c.grid} />
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
          width={40}
          domain={[0, 100]}
          ticks={[0, 25, 50, 75, 100]}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip content={<ChartTooltip formatter={(v) => `${v}%`} />} cursor={{ stroke: c.axis }} />
        <Area
          type="monotone"
          dataKey="rate"
          name="Attendance"
          stroke={c.brand}
          strokeWidth={2}
          fill="url(#monthlyFill)"
          dot={{ r: 4, fill: c.brand, strokeWidth: 2, stroke: c.surface }}
          activeDot={{ r: 5 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
