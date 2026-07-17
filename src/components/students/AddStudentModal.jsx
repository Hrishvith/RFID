import { useState } from "react";
import { addStudent } from "../../services/studentService";

export function AddStudentModal({ open, onClose, onStudentAdded }) {
  const [form, setForm] = useState({
    name: "",
    usn: "",
    department: "",
    year: "",
    uid: "",
    phoneNo: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }
  async function handleSubmit(e) {

  e.preventDefault();
  if (
  !form.name.trim() ||
  !form.usn.trim() ||
  !form.department.trim() ||
  !form.year.trim() ||
  !form.uid.trim()
) {

  alert("Please fill all fields.");

  return;

}

  setLoading(true);

  try {

    const res = await addStudent(form);

    if (res.success) {

      if (onStudentAdded) {
        onStudentAdded();
      }

      alert("✅ Student Added Successfully");

      onClose();

      setForm({
        name: "",
        usn: "",
        department: "",
        year: "",
        uid: "",
        phoneNo: "",
        address: "",
      });

    } else {

      alert("❌ " + res.message);

    }

  } catch (err) {

    alert("Server Error");

  }

  setLoading(false);

}


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">

        <h2 className="mb-6 text-2xl font-bold">
          Add Student
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            name="name"
            placeholder="Student Name"
            value={form.name}
            onChange={handleChange}
            className="w-full rounded-lg border p-3"
            required
          />

          <input
            name="usn"
            placeholder="USN"
            value={form.usn}
            onChange={handleChange}
            className="w-full rounded-lg border p-3"
            required
          />

          <input
            name="department"
            placeholder="Department"
            value={form.department}
            onChange={handleChange}
            className="w-full rounded-lg border p-3"
            required
          />

          <input
            name="year"
            placeholder="Year"
            value={form.year}
            onChange={handleChange}
            className="w-full rounded-lg border p-3"
            required
          />

          <input
            name="uid"
            placeholder="RFID UID"
            value={form.uid}
            onChange={handleChange}
            className="w-full rounded-lg border p-3"
            required
          />

          <input
            name="phoneNo"
            type="tel"
            placeholder="Phone Number"
            value={form.phoneNo}
            onChange={handleChange}
            className="w-full rounded-lg border p-3"
          />

          <textarea
            name="address"
            placeholder="Address"
            value={form.address}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-lg border p-3"
          />

          <div className="flex justify-end gap-3 pt-4">

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-4 py-2"
            >
              Cancel
            
            </button>

            <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Student"}
              </button>

          </div>

        </form>

      </div>
    </div>
  );
}