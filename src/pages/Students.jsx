import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Users, Download,Plus } from "lucide-react";
import { Header } from "../components/layout/Header";
import { Card } from "../components/ui/card";
import { Select } from "../components/ui/select";
import { Button } from "../components/ui/button";
import { SearchBar } from "../components/common/SearchBar";
import { Pagination } from "../components/common/Pagination";
import { StudentTable } from "../components/students/StudentTable";
import { Skeleton } from "../components/ui/skeleton";
import { useAsync } from "../hooks/useAsync";
import { useDebounce } from "../hooks/useDebounce";
import { usePagination } from "../hooks/usePagination";
import { useSortableData } from "../hooks/useSortableData";
import { getStudents } from "../services/studentService";
import { getDepartments } from "../services/settingsService";
import { exportToCsv } from "../utils/exportCsv";
import { AddStudentModal } from "../components/students/AddStudentModal";
import { EditStudentModal } from "../components/students/EditStudentModal";
import { DeleteStudentDialog } from "../components/students/DeleteStudentDialog";
import { Toast } from "../components/students/Toast";
import { useAuth } from "../hooks/useAuth";

const PAGE_SIZE = 8;

export default function Students() {
  const { user } = useAuth();
  const isAdmin = user?.role === "Administrator";
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [department, setDepartment] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [deletingStudent, setDeletingStudent] = useState(null);
  const [toast, setToast] = useState(null);
  const debouncedSearch = useDebounce(search, 250);

  function showToast(type, message) {
    setToast({ type, message });
  }

  const {
  data: students,
  loading,
  refetch,
} = useAsync(() => getStudents(), []);
  const { data: departments } = useAsync(() => getDepartments(), []);

  useEffect(() => {
    const q = searchParams.get("search");
    if (q) setSearch(q);
  }, [searchParams]);

  const filtered = useMemo(() => {
    if (!students) return [];
    const query = debouncedSearch.trim().toLowerCase();
    return students.filter((s) => {
      const matchesQuery =
        !query ||
        s.name.toLowerCase().includes(query) ||
        s.usn.toLowerCase().includes(query) ||
        s.uid.toLowerCase().includes(query);
      const matchesDept = department === "all" || s.department === department;
      return matchesQuery && matchesDept;
    });
  }, [students, debouncedSearch, department]);

  const { sortedItems, sortConfig, requestSort } = useSortableData(filtered, {
    key: "name",
    direction: "asc",
  });
  const { page, totalPages, setPage, nextPage, prevPage, paginatedItems, totalItems } =
    usePagination(sortedItems, PAGE_SIZE);

  function handleExport() {
    exportToCsv(
      "students.csv",
      sortedItems.map(({ id, name, usn, department, year, uid, phoneNo, address, status }) => ({
        id,
        name,
        usn,
        department,
        year,
        uid,
        phoneNo,
        address,
        status,
      }))
    );
  }

  return (
    <div>
      <Header
        title="Students"
        description="Manage every student registered to an RFID card."
        breadcrumbItems={[{ label: "Students" }]}
        actions={
  <div className="flex gap-2">
    {isAdmin && (
      <Button
        onClick={() => setShowAddModal(true)}
      >
        <Plus className="h-4 w-4" />
        Add Student
      </Button>
    )}

    <Button
      variant="outline"
      onClick={handleExport}
      disabled={!sortedItems.length}
    >
      <Download className="h-4 w-4" />
      Export CSV
    </Button>
  </div>
}

      />

      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Users className="h-4 w-4" />
            <span>{totalItems} students</span>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <SearchBar value={search} onChange={setSearch} placeholder="Search name, USN, UID..." className="sm:w-64" />
            <Select value={department} onChange={(e) => setDepartment(e.target.value)} className="sm:w-48">
              <option value="all">All departments</option>
              {departments?.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.code}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <>
            <StudentTable
              students={paginatedItems}
              sortConfig={sortConfig}
              onSort={requestSort}
              canManage={isAdmin}
              onEdit={setEditingStudent}
              onDelete={setDeletingStudent}
            />
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

      {isAdmin && (
        <>
          <AddStudentModal
            open={showAddModal}
            onClose={() => setShowAddModal(false)}
            onStudentAdded={refetch}
          />

          <EditStudentModal
            open={!!editingStudent}
            student={editingStudent}
            onClose={() => setEditingStudent(null)}
            onStudentUpdated={() => {
              refetch();
              showToast("success", "Student updated successfully.");
            }}
            onError={(message) => showToast("error", message)}
          />

          <DeleteStudentDialog
            open={!!deletingStudent}
            student={deletingStudent}
            onClose={() => setDeletingStudent(null)}
            onStudentDeleted={() => {
              refetch();
              showToast("success", "Student deleted successfully.");
            }}
            onError={(message) => showToast("error", message)}
          />
        </>
      )}

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
