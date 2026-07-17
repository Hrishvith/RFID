import { apiRequest, API_BASE_URL } from "./apiClient";
import { registerNewStudent } from "./newStudentStore";
import { cached, invalidateCache } from "../utils/requestCache";

/**
 * @typedef {import('../types').Student} Student
 */

const STUDENTS_CACHE_KEY = "students";
const STUDENTS_CACHE_TTL_MS = 30_000;

/**
 * Returns every registered student. Cached briefly (see requestCache.js) so
 * switching between pages doesn't re-fetch from the slow Apps Script API
 * every single time.
 *
 * An empty array is never cached: confirmed live that Apps Script can
 * transiently return [] even when students genuinely exist (a one-off
 * upstream hiccup) - caching that would turn a single bad response into up
 * to 30s of the whole site incorrectly showing zero students everywhere.
 * @returns {Promise<Student[]>}
 */
export async function getStudents() {
  return cached(
    STUDENTS_CACHE_KEY,
    STUDENTS_CACHE_TTL_MS,
    () => apiRequest("students"),
    (data) => Array.isArray(data) && data.length > 0
  );
}

/**
 * @param {number} id
 */
export async function getStudentById(id) {
  const students = await getStudents();
  return students.find((s) => Number(s.id) === Number(id));
}

/**
 * @param {string} uid
 */
export async function getStudentByUid(uid) {
  const students = await getStudents();

  return students.find(
    (s) => String(s.uid).trim().toUpperCase() === String(uid).trim().toUpperCase()
  );
}

/**
 * Returns total registered students.
 */
export async function getStudentCount() {
  const students = await getStudents();

  return {
    total: students.length,
  };
}
/**
 * Add a new student.
 * @param {{
 *   name: string,
 *   usn: string,
 *   department: string,
 *   year: string,
 *   uid: string,
 *   phoneNo: string,
 *   address: string
 * }} student
 */
export async function addStudent(student) {

  const params = new URLSearchParams({

    action: "addStudent",

    name: student.name,

    usn: student.usn,

    department: student.department,

    year: student.year,

    uid: student.uid,

    phoneNo: student.phoneNo ?? "",

    address: student.address ?? ""

  });

  const response = await fetch(
    `${API_BASE_URL}?${params.toString()}`
  );

  const data = await response.json();

  if (data?.success) {
    invalidateCache(STUDENTS_CACHE_KEY);
    // Apps Script echoes back the registered UID (and name) in data -
    // surface it as a "New Student Added" notification in the panel.
    registerNewStudent(data.data?.uid ?? student.uid, data.data?.name ?? student.name);
  }

  return data;

}

/**
 * Update an existing student's details.
 * @param {{
 *   name: string,
 *   usn: string,
 *   department: string,
 *   year: string,
 *   uid: string,
 *   phoneNo: string,
 *   address: string
 * }} student
 */
export async function updateStudent(student) {

  const params = new URLSearchParams({

    action: "updateStudent",

    name: student.name,

    usn: student.usn,

    department: student.department,

    year: student.year,

    uid: student.uid,

    phoneNo: student.phoneNo ?? "",

    address: student.address ?? ""

  });

  const response = await fetch(
    `${API_BASE_URL}?${params.toString()}`
  );

  const data = await response.json();

  if (data?.success) {
    invalidateCache(STUDENTS_CACHE_KEY);
  }

  return data;

}

/**
 * Delete a student identified by RFID UID.
 * @param {string} uid
 */
export async function deleteStudent(uid) {

  const params = new URLSearchParams({

    action: "deleteStudent",

    uid

  });

  const response = await fetch(
    `${API_BASE_URL}?${params.toString()}`
  );

  const data = await response.json();

  if (data?.success) {
    invalidateCache(STUDENTS_CACHE_KEY);
  }

  return data;

}