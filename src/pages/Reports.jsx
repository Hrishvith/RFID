import { useMemo, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Header } from "../components/layout/Header";
import { ChartCard } from "../components/charts/ChartCard";
import { AttendanceMeter } from "../components/charts/AttendanceMeter";
import { PresentAbsentChart } from "../components/charts/PresentAbsentChart";
import { MonthlyAttendanceChart } from "../components/charts/MonthlyAttendanceChart";
import { DepartmentAttendanceChart } from "../components/charts/DepartmentAttendanceChart";
import { AttendanceRankList } from "../components/charts/AttendanceRankList";
import { Skeleton } from "../components/ui/skeleton";
import { cn } from "../utils/cn";
import { useAsync } from "../hooks/useAsync";
import { getReportData } from "../services/reportService";
import { getAttendance } from "../services/attendanceService";
import { filterRecordsByRange, computeRangeStats } from "../utils/attendanceUtils";

const RANGES = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
];

export default function Reports() {
  const [range, setRange] = useState("weekly");

  const { data: attendance, loading: loadingAttendance } = useAsync(() => getAttendance(), []);
  const { data: report, loading: loadingReport } = useAsync(() => getReportData(), []);

  const rangeStats = useMemo(() => {
    if (!attendance) return null;
    const rangeRecords = filterRecordsByRange(attendance, range);
    return computeRangeStats(rangeRecords);
  }, [attendance, range]);

  const loading = loadingAttendance || loadingReport;

  return (
    <div>
      <Header
        title="Reports"
        description="Daily, weekly and monthly attendance insights."
        breadcrumbItems={[{ label: "Reports" }]}
        actions={
          <div className="flex rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
            {RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  range === r.key
                    ? "bg-brand-600 text-white shadow-soft"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        }
      />

      {loading || !rangeStats || !report ? (
        <ReportsSkeleton />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartCard
              title="Attendance %"
              description={`${RANGES.find((r) => r.key === range).label} average`}
            >
              <AttendanceMeter value={rangeStats.attendancePercentage} />
            </ChartCard>
            <ChartCard title="Present vs Absent" description={`${RANGES.find((r) => r.key === range).label} totals`}>
              <PresentAbsentChart present={rangeStats.presentToday} absent={rangeStats.absentToday} />
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartCard title="Monthly Attendance" description="Attendance rate trend across months">
              <MonthlyAttendanceChart data={report.monthly} />
            </ChartCard>
            <ChartCard title="Department-wise Attendance" description="Average attendance rate by department">
              <DepartmentAttendanceChart data={report.byDepartment} />
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartCard
              title="Top Attendance"
              description="Highest attendance rate students"
              actions={<TrendingUp className="h-4 w-4 text-brand-500" />}
            >
              <AttendanceRankList students={report.top} tone="good" />
            </ChartCard>
            <ChartCard
              title="Lowest Attendance"
              description="Students who need follow-up"
              actions={<TrendingDown className="h-4 w-4 text-amber-500" />}
            >
              <AttendanceRankList students={report.lowest} tone="critical" />
            </ChartCard>
          </div>
        </div>
      )}
    </div>
  );
}

function ReportsSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, row) => (
        <div key={row} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      ))}
    </div>
  );
}
