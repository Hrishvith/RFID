import { useEffect, useState } from "react";
import { Clock, Save, RotateCcw, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import {
  getAttendanceSettings,
  saveAttendanceSettings,
  DEFAULT_ATTENDANCE_TIMING,
} from "../../services/settingsService";

function validateTiming({ loginStartTime, loginEndTime, logoutStartTime }) {
  if (!loginStartTime || !loginEndTime || !logoutStartTime) return "All three times are required.";
  if (loginStartTime >= loginEndTime) return "Login Start Time must be earlier than Login End Time.";
  if (logoutStartTime <= loginEndTime) return "Logout Start Time must be after Login End Time.";
  return "";
}

/**
 * Admin-only panel for configuring the RFID login/logout timing window.
 * Visibility is gated by the caller (Settings.jsx) - this component assumes
 * it should only ever be rendered for an administrator.
 */
export function AttendanceSettingsCard() {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getAttendanceSettings().then((data) => {
      if (!cancelled) {
        setForm(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
    setError("");
  }

  function handleReset() {
    setForm({ ...DEFAULT_ATTENDANCE_TIMING });
    setSaved(false);
    setError("");
  }

  const validationError = form ? validateTiming(form) : "";

  async function handleSave(e) {
    e.preventDefault();
    if (validationError) {
      setError(validationError);
      return;
    }
    setSaving(true);
    setError("");
    try {
      await saveAttendanceSettings(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.message ?? "Unable to save attendance timing.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-brand-500" /> Attendance Timing
        </CardTitle>
        <CardDescription>Configure RFID attendance timings.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading || !form ? (
          <Skeleton className="h-24" />
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="Login Start Time">
                <Input
                  type="time"
                  value={form.loginStartTime}
                  onChange={(e) => update("loginStartTime", e.target.value)}
                />
              </Field>
              <Field label="Login End Time">
                <Input
                  type="time"
                  value={form.loginEndTime}
                  onChange={(e) => update("loginEndTime", e.target.value)}
                />
              </Field>
              <Field label="Logout Start Time">
                <Input
                  type="time"
                  value={form.logoutStartTime}
                  onChange={(e) => update("logoutStartTime", e.target.value)}
                />
              </Field>
            </div>

            {error && (
              <p className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" /> {error}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" disabled={saving || Boolean(validationError)}>
                <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Settings"}
              </Button>
              <Button type="button" variant="outline" onClick={handleReset} disabled={saving}>
                <RotateCcw className="h-4 w-4" /> Reset Default
              </Button>
              {saved && (
                <span className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" /> Settings Updated Successfully
                </span>
              )}
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
