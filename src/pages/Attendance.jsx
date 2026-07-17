import { useMemo, useState } from "react";
import { ClipboardList, Download } from "lucide-react";
import { Header } from "../components/layout/Header";
import { Card } from "../components/ui/card";
import { Select } from "../components/ui/select";
import { Button } from "../components/ui/button";
import { SearchBar } from "../components/common/SearchBar";
import { Pagination } from "../components/common/Pagination";
import { AttendanceTable } from "../components/attendance/AttendanceTable";
import { Skeleton } from "../components/ui/skeleton";
import { useAsync } from "../hooks/useAsync";
import { useDebounce } from "../hooks/useDebounce";
import { usePagination } from "../hooks/usePagination";
import { useSortableData } from "../hooks/useSortableData";
import { getAttendance } from "../services/attendanceService";
import { filterRecordsByRange } from "../utils/attendanceUtils";
import { exportToCsv } from "../utils/exportCsv";

const PAGE_SIZE = 10;

export default function Attendance() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [range, setRange] = useState("all");
  const debouncedSearch = useDebounce(search, 250);

  const { data: attendance, loading } = useAsync(() => getAttendance(), []);

  const filtered = useMemo(() => {
    if (!attendance) return [];
    const query = debouncedSearch.trim().toLowerCase();
    let records = filterRecordsByRange(attendance, range);
    return records.filter((r) => {
      const matchesQuery =
        !query ||
        r.name.toLowerCase().includes(query) ||
        r.usn.toLowerCase().includes(query) ||
        r.uid.toLowerCase().includes(query);
      const matchesStatus = status === "all" || r.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [attendance, debouncedSearch, status, range]);

  const { sortedItems, sortConfig, requestSort } = useSortableData(filtered, {
    key: "id",
    direction: "desc",
  });
  const { page, totalPages, setPage, nextPage, prevPage, paginatedItems, totalItems } =
    usePagination(sortedItems, PAGE_SIZE);

  function handleExport() {
    exportToCsv(
      "attendance.csv",
      sortedItems.map(
  ({
    date,
    loginTime,
    logoutTime,
    workingHours,
    name,
    usn,
    uid,
    department,
    status,
  }) => ({
    Date: date,
    Login: loginTime,
    Logout: logoutTime,
    "Working Hours": workingHours,
    Name: name,
    USN: usn,
    UID: uid,
    Department: department,
    Status: status,
  })
)
    );
  }

  return (
    <div>
      <Header
        title="Attendance"
        description="Every RFID scan logged across the institute."
        breadcrumbItems={[{ label: "Attendance" }]}
        actions={
          <Button variant="outline" onClick={handleExport} disabled={!sortedItems.length}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        }
      />

      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <ClipboardList className="h-4 w-4" />
            <span>{totalItems} records</span>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <SearchBar value={search} onChange={setSearch} placeholder="Search name, USN, UID..." className="sm:w-64" />
            <Select value={status} onChange={(e) => setStatus(e.target.value)} className="sm:w-40">
              <option value="all">All statuses</option>
              <option value="Inside">Inside</option>
              <option value="Completed">Completed</option>
              <option value="Absent">Absent</option>
            </Select>
            <Select value={range} onChange={(e) => setRange(e.target.value)} className="sm:w-44">
              <option value="all">All time</option>
              <option value="daily">Today</option>
              <option value="weekly">Last 7 days</option>
              <option value="monthly">Last 30 days</option>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <>
            <AttendanceTable records={paginatedItems} sortConfig={sortConfig} onSort={requestSort} />
            <Pagination
              page={page}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={PAGE_SIZE}
              onPrev={prevPage}
              onNext={nextPage}
              onPage={setPage}
            />
          </>
        )}
      </Card>
    </div>
  );
}
