import { useEffect, useState } from "react";
import { updateStudent } from "../../services/studentService";

const inputClass = "w-full rounded-lg border p-3";

/**
 * Edit modal for an existing student. Mirrors AddStudentModal's design
 * language (layout, spacing, field styling) so the two feel like one system.
 */
export function EditStudentModal({ open, student, onClose, onStudentUpdated, onError }) {
  const [form, setForm] = useState({
    name: "",
    usn: "",
    department: "",
    year: "",
    uid: "",
    phoneNo: "",
    address: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (student) {
      setForm({
        name: String(student.name ?? ""),
        usn: String(student.usn ?? ""),
        department: String(student.department ?? ""),
        // Google Sheets often returns a plain numeric cell (e.g. year 2)
        // as a JS number, not a string - .trim() below would throw on
        // that and silently kill the submit before any request fires.
        year: String(student.year ?? ""),
        uid: String(student.uid ?? ""),
        phoneNo: String(student.phoneNo ?? ""),
        address: String(student.address ?? ""),
      });
    }
  }, [student]);

  if (!open || !student) return null;

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (saving) return;

    try {
      if (
        !form.name.trim() ||
        !form.usn.trim() ||
        !form.department.trim() ||
        !form.year.trim() ||
        !form.uid.trim()
      ) {
        onError?.("Please fill all fields.");
        return;
      }

      setSaving(true);

      const res = await updateStudent(form);

      if (res.success) {
        onStudentUpdated?.();
        onClose();
      } else {
        onError?.(res.message || "Unable to update student.");
      }
    } catch (err) {
      console.error("updateStudent failed:", err);
      onError?.(err?.message || "Server Error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">

        <h2 className="mb-6 text-2xl font-bold">
          Edit Student
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            name="name"
            placeholder="Student Name"
            value={form.name}
            onChange={handleChange}
            className={inputClass}
            required
          />

          <input
            name="usn"
            placeholder="USN"
            value={form.usn}
            onChange={handleChange}
            className={inputClass}
            required
          />

          <input
            name="department"
            placeholder="Department"
            value={form.department}
            onChange={handleChange}
            className={inputClass}
            required
          />

          <input
            name="year"
            placeholder="Year"
            value={form.year}
            onChange={handleChange}
            className={inputClass}
            required
          />

          <input
            name="uid"
            placeholder="RFID UID"
            value={form.uid}
            onChange={handleChange}
            className={inputClass}
            required
          />

          <input
            name="phoneNo"
            type="tel"
            placeholder="Phone Number"
            value={form.phoneNo}
            onChange={handleChange}
            className={inputClass}
          />

          <textarea
            name="address"
            placeholder="Address"
            value={form.address}
            onChange={handleChange}
            rows={3}
            className={inputClass}
          />

          <div className="flex justify-end gap-3 pt-4">

            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border px-4 py-2 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}
