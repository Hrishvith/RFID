import { useState } from "react";
import { deleteStudent } from "../../services/studentService";

/**
 * Confirmation dialog for deleting a student. Mirrors the modal design
 * language used by AddStudentModal / EditStudentModal.
 */
export function DeleteStudentDialog({ open, student, onClose, onStudentDeleted, onError }) {
  const [deleting, setDeleting] = useState(false);

  if (!open || !student) return null;

  async function handleDelete() {
    if (deleting) return;

    setDeleting(true);

    try {
      const res = await deleteStudent(student.uid);

      if (res.success) {
        onStudentDeleted?.();
        onClose();
      } else {
        onError?.(res.message || "Unable to delete student.");
      }
    } catch (err) {
      console.error("deleteStudent failed:", err);
      onError?.(err?.message || "Server Error");
    }

    setDeleting(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">

        <h2 className="mb-3 text-xl font-bold">
          Delete Student
        </h2>

        <p className="text-sm text-slate-600">
          Are you sure you want to delete this student?
        </p>

        <p className="mb-6 mt-1 text-sm font-medium text-slate-900">
          {student.name} ({student.usn})
        </p>

        <div className="flex justify-end gap-3">

          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="rounded-lg border px-4 py-2 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-lg bg-red-600 px-4 py-2 text-white disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>

        </div>

      </div>
    </div>
  );
}
