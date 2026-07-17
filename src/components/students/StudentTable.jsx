import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { SortableHeaderCell } from "../common/SortableHeaderCell";
import { Avatar } from "../ui/avatar";
import { Badge, statusVariant } from "../ui/badge";
import { Button } from "../ui/button";
import { Pencil, Trash2 } from "lucide-react";

/**
 * @param {{
 *   students: import('../../types').Student[],
 *   sortConfig: any,
 *   onSort: (key: string) => void,
 *   canManage?: boolean,
 *   onEdit?: (student: import('../../types').Student) => void,
 *   onDelete?: (student: import('../../types').Student) => void
 * }} props
 */
export function StudentTable({ students, sortConfig, onSort, canManage = false, onEdit, onDelete }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Photo</TableHead>
          <SortableHeaderCell label="Name" sortKey="name" sortConfig={sortConfig} onSort={onSort} />
          <SortableHeaderCell label="USN" sortKey="usn" sortConfig={sortConfig} onSort={onSort} />
          <SortableHeaderCell label="Department" sortKey="department" sortConfig={sortConfig} onSort={onSort} />
          <SortableHeaderCell label="Year" sortKey="year" sortConfig={sortConfig} onSort={onSort} />
          <TableHead>RFID UID</TableHead>
          <TableHead>Phone Number</TableHead>
          <TableHead>Address</TableHead>
          <SortableHeaderCell label="Status" sortKey="status" sortConfig={sortConfig} onSort={onSort} />
          {canManage && <TableHead>Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.map((student) => (
          <TableRow key={student.usn}>
            <TableCell>
              <Avatar name={student.name} src={student.photo} size="sm" />
            </TableCell>
            <TableCell className="font-medium text-slate-900 dark:text-slate-100">
              {student.name}
            </TableCell>
            <TableCell className="font-mono text-xs">{student.usn}</TableCell>
            <TableCell>{student.department}</TableCell>
            <TableCell>{student.year}</TableCell>
            <TableCell className="font-mono text-xs text-slate-500 dark:text-slate-400">
              {student.uid}
            </TableCell>
            <TableCell>{student.phoneNo || "—"}</TableCell>
            <TableCell className="max-w-[220px] truncate" title={student.address || ""}>
              {student.address || "—"}
            </TableCell>
            <TableCell>
              <Badge variant={statusVariant(student.status)} dot>
                {student.status}
              </Badge>
            </TableCell>
            {canManage && (
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Edit ${student.name}`}
                    onClick={() => onEdit?.(student)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${student.name}`}
                    onClick={() => onDelete?.(student)}
                    className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/40"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
        {students.length === 0 && (
          <TableRow>
            <TableCell colSpan={canManage ? 10 : 9} className="py-10 text-center text-slate-400">
              No students match your search.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
