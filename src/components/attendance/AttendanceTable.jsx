import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { SortableHeaderCell } from "../common/SortableHeaderCell";
import { Badge, statusVariant } from "../ui/badge";

/**
 * @param {{ records: import('../../types').AttendanceRecord[], sortConfig: any, onSort: (key: string) => void }} props
 */
export function AttendanceTable({ records, sortConfig, onSort }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <SortableHeaderCell
            label="Date"
            sortKey="date"
            sortConfig={sortConfig}
            onSort={onSort}
          />

          <TableHead>Login</TableHead>

          <TableHead>Logout</TableHead>

          <TableHead>Working Hours</TableHead>

          <SortableHeaderCell
            label="Student Name"
            sortKey="name"
            sortConfig={sortConfig}
            onSort={onSort}
          />

          <TableHead>USN</TableHead>

          <TableHead>Department</TableHead>

          <TableHead>UID</TableHead>

          <SortableHeaderCell
            label="Status"
            sortKey="status"
            sortConfig={sortConfig}
            onSort={onSort}
          />
        </TableRow>
      </TableHeader>

      <TableBody>
        {records.map((record, index) => (
          <TableRow key={record.id ?? index}>

            <TableCell>{record.date}</TableCell>

            <TableCell className="tabular-nums">
              {record.loginTime || "--"}
            </TableCell>

            <TableCell className="tabular-nums">
              {record.logoutTime || "--"}
            </TableCell>

            <TableCell className="font-semibold text-blue-600 dark:text-blue-400">
              {record.workingHours || "--"}
            </TableCell>

            <TableCell className="font-medium text-slate-900 dark:text-slate-100">
              {record.name}
            </TableCell>

            <TableCell className="font-mono text-xs">
              {record.usn}
            </TableCell>

            <TableCell>
              {record.department}
            </TableCell>

            <TableCell className="font-mono text-xs text-slate-500 dark:text-slate-400">
              {record.uid}
            </TableCell>

            <TableCell>
              <Badge variant={statusVariant(record.status)} dot>
                {record.status}
              </Badge>
            </TableCell>

          </TableRow>
        ))}

        {records.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={9}
              className="py-10 text-center text-slate-400"
            >
              No attendance records match your filters.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}