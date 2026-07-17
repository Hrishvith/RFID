import { getStudents } from "./studentService";
import { getAttendance } from "./attendanceService";
import {
  computeTodayStats,
  recordsForDate,
  dailyAttendanceSeries,
  monthlyAttendanceSeries,
  departmentAttendance,
  topAttendance,
  lowestAttendance,
} from "../utils/attendanceUtils";

export async function getDashboardSummary(referenceDate = new Date()) {

  const students = await getStudents();

  const attendance = await getAttendance();

  const todaysRecords = recordsForDate(attendance, referenceDate);

  return {

    students,

    attendance,

    todaysRecords,

    stats: computeTodayStats(
      students,
      todaysRecords
    ),

    weekly: dailyAttendanceSeries(
      students,
      attendance,
      7,
      referenceDate
    ),

  };

}

export async function getReportData(referenceDate = new Date()) {

  const students = await getStudents();

  const attendance = await getAttendance();

  return {

    daily: dailyAttendanceSeries(
      students,
      attendance,
      7,
      referenceDate
    ),

    monthly: monthlyAttendanceSeries(
      attendance
    ),

    byDepartment: departmentAttendance(
      students,
      attendance
    ),

    top: topAttendance(
      students,
      attendance,
      5
    ),

    lowest: lowestAttendance(
      students,
      attendance,
      5
    )

  };

}