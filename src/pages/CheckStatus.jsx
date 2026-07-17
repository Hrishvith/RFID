import { useState } from "react";
import { Search, IdCard, AlertCircle, Percent, CalendarCheck, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { Header } from "../components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Avatar } from "../components/ui/avatar";
import { StatCard } from "../components/dashboard/StatCard";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table";
import { getStudentByUid } from "../services/studentService";
import { getAttendanceByStudent } from "../services/attendanceService";
import { recentScans } from "../utils/attendanceUtils";

/** Maps an attendance record's status (not a student's) to a badge variant. */
function scanStatusVariant(status) {
  if (status === "Completed") return "good";
  if (status === "Inside") return "warning";
  if (status === "Unknown") return "critical";
  return "neutral";
}

function minutesFromWorkingHours(workingHours) {
  const parts = String(workingHours || "").split(":");
  if (parts.length !== 2) return null;
  const hours = Number(parts[0]);
  const mins = Number(parts[1]);
  if (Number.isNaN(hours) || Number.isNaN(mins)) return null;
  return hours * 60 + mins;
}

function computeSummary(records) {
  const presentDays = records.filter((r) => r.status === "Completed" || r.status === "Inside").length;
  const attendanceRate = records.length > 0 ? Number(((presentDays / records.length) * 100).toFixed(1)) : 0;

  const minutesList = records.map((r) => minutesFromWorkingHours(r.workingHours)).filter((m) => m !== null && m > 0);
  const avgMinutes =
    minutesList.length > 0 ? Math.round(minutesList.reduce((sum, m) => sum + m, 0) / minutesList.length) : 0;
  const avgWorkingHours = `${String(Math.floor(avgMinutes / 60)).padStart(2, "0")}:${String(avgMinutes % 60).padStart(2, "0")}`;

  return { presentDays, attendanceRate, avgWorkingHours };
}

export default function CheckStatus() {
  const [uid, setUid] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = uid.trim();
    if (!trimmed) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const student = await getStudentByUid(trimmed);
      if (!student) {
        setError(`No student is registered to UID "${trimmed}".`);
        return;
      }

      const records = await getAttendanceByStudent(student.usn);
      const history = recentScans(records, records.length);
      setResult({ student, latest: history[0], history, summary: computeSummary(records) });
    } catch (err) {
      setError(err.message ?? "Unable to check that UID right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Header
        title="Check RFID Status"
        description="Enter a card's RFID UID to see that student's own dashboard, attendance and report - nothing else."
        breadcrumbItems={[{ label: "Check Status" }]}
      />

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <IdCard className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={uid}
                onChange={(e) => setUid(e.target.value)}
                placeholder="Enter RFID UID (e.g. 6A135F1A)"
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={loading || !uid.trim()}>
              <Search className="h-4 w-4" /> {loading ? "Checking..." : "Check Status"}
            </Button>
          </form>

          {error && (
            <p className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" /> {error}
            </p>
          )}
        </CardContent>
      </Card>

      {result && (
        <div className="mt-6 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Avatar name={result.student.name} src={result.student.photo} size="lg" />
                <div>
                  <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {result.student.name}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {result.student.usn} · {result.student.department}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <InfoTile label="Latest Status">
                  {result.latest ? (
                    <Badge variant={scanStatusVariant(result.latest.status)} dot>
                      {result.latest.status}
                    </Badge>
                  ) : (
                    <span className="text-sm text-slate-400">No scans yet</span>
                  )}
                </InfoTile>
                <InfoTile label="Login Time">{result.latest?.loginTime || "—"}</InfoTile>
                <InfoTile label="Logout Time">{result.latest?.logoutTime || "—"}</InfoTile>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              index={0}
              label="Attendance Rate"
              value={result.summary.attendanceRate}
              suffix="%"
              decimals={1}
              icon={Percent}
              accent="brand"
            />
            <StatCard
              index={1}
              label="Days Present"
              value={result.summary.presentDays}
              icon={CalendarCheck}
              accent="good"
            />
            <TextStatCard
              index={2}
              label="Avg Working Hours"
              value={result.summary.avgWorkingHours}
              icon={Clock}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Attendance History</CardTitle>
              <CardDescription>Every recorded scan for this UID.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Login</TableHead>
                    <TableHead>Logout</TableHead>
                    <TableHead>Working Hours</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.history.map((r, i) => (
                    <TableRow key={`${r.date}-${r.loginTime ?? i}`}>
                      <TableCell>{r.date}</TableCell>
                      <TableCell>{r.loginTime || "—"}</TableCell>
                      <TableCell>{r.logoutTime || "—"}</TableCell>
                      <TableCell>{r.workingHours || "—"}</TableCell>
                      <TableCell>
                        <Badge variant={scanStatusVariant(r.status)} dot>
                          {r.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {result.history.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center text-slate-400">
                        No attendance records for this UID yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

/** Same look as StatCard, but for a plain string value (e.g. "01:20") instead of an animated count-up number. */
function TextStatCard({ label, value, icon: Icon, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
      whileHover={{ y: -3 }}
      className="card-surface p-5"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</p>
        </div>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </motion.div>
  );
}

function InfoTile({ label, children }) {
  return (
    <div className="rounded-xl border border-slate-100 p-4 dark:border-slate-800">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <div className="mt-1.5 text-sm font-medium text-slate-800 dark:text-slate-200">{children}</div>
    </div>
  );
}
