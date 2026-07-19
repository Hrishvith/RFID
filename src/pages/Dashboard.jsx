import { Users, UserCheck, UserX, Percent, Calendar, Clock, AlertTriangle, CalendarOff } from "lucide-react";
import { Header } from "../components/layout/Header";
import { StatCard } from "../components/dashboard/StatCard";
import { RecentScans } from "../components/dashboard/RecentScans";
import { RecentActivity } from "../components/dashboard/RecentActivity";
import { ChartCard } from "../components/charts/ChartCard";
import { AttendanceMeter } from "../components/charts/AttendanceMeter";
import { PresentAbsentChart } from "../components/charts/PresentAbsentChart";
import { WeeklyAttendanceChart } from "../components/charts/WeeklyAttendanceChart";
import { Card, CardContent } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { Button } from "../components/ui/button";
import { useAsync } from "../hooks/useAsync";
import { useClock } from "../hooks/useClock";
import { useAuth } from "../hooks/useAuth";
import { getDashboardSummary } from "../services/reportService";
import { recentScans } from "../utils/attendanceUtils";
import { formatFriendlyDate, formatTime } from "../utils/dateUtils";

export default function Dashboard() {
  const now = useClock();
  const { user } = useAuth();
  const { data, loading, error, refetch } = useAsync(
  () => getDashboardSummary(now),
  [],
  5000
);

  return (
    <div>
      <Header
        title={`Welcome back${user ? `, ${user.name.split(" ")[0]}` : ""}`}
        description="Here's what's happening with attendance today."
        breadcrumbItems={[{ label: "Dashboard" }]}
        actions={
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm dark:border-slate-800 dark:bg-slate-900">
            <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <Calendar className="h-4 w-4" /> {formatFriendlyDate(now)}
            </span>
            <span className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
            <span className="flex items-center gap-1.5 font-medium tabular-nums text-slate-700 dark:text-slate-200">
              <Clock className="h-4 w-4" /> {formatTime(now)}
            </span>
          </div>
        }
      />

      {error ? (
        <DashboardError message={error.message} onRetry={refetch} />
      ) : loading || !data ? (
        <DashboardSkeleton />
      ) : (
        <div className="space-y-6">
          {data.stats.isHoliday && (
            <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400">
              <CalendarOff className="h-4 w-4" /> Today is a holiday — attendance is not being marked absent.
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              index={0}
              label="Total Registered Students"
              value={data.stats.totalStudents}
              icon={Users}
              accent="brand"
            />
            <StatCard
              index={1}
              label="Present Today"
              value={data.stats.presentToday}
              icon={UserCheck}
              accent="good"
            />
            <StatCard
              index={2}
              label="Absent Today"
              value={data.stats.absentToday}
              icon={UserX}
              accent="critical"
            />
            <StatCard
              index={3}
              label="Attendance Percentage"
              value={data.stats.attendancePercentage}
              suffix="%"
              decimals={2}
              icon={Percent}
              accent="warning"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <ChartCard title="Attendance %" description="Today vs. institute target" className="xl:col-span-1">
              <AttendanceMeter value={data.stats.attendancePercentage} />
            </ChartCard>

            <ChartCard title="Present vs Absent" description="Today's breakdown" className="xl:col-span-1">
              <PresentAbsentChart present={data.stats.presentToday} absent={data.stats.absentToday} />
            </ChartCard>

            <ChartCard
              title="Weekly Attendance"
              description="Last 7 days"
              className="xl:col-span-1"
            >
              <div className="-ml-2">
                <WeeklyAttendanceChart data={data.weekly} />
              </div>
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardContent className="p-5">
                <div className="mb-1 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Recent RFID Scans
                  </h3>
                  <span className="text-xs text-slate-400">Live from RFID feed</span>
                </div>
                <RecentScans scans={recentScans(data.todaysRecords, 8)} />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="mb-1 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Recent Activity
                  </h3>
                </div>
                <RecentActivity />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardError({ message, onRetry }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
          <AlertTriangle className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Couldn't load dashboard data
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {message || "The attendance database is unreachable. Please try again."}
          </p>
        </div>
        <Button onClick={onRetry}>Retry</Button>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-72" />
        ))}
      </div>
    </div>
  );
}
