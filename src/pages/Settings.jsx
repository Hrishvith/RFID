import { useEffect, useState } from "react";
import { CheckCircle2, Save, Moon, Sun, Monitor } from "lucide-react";
import { Header } from "../components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { Button } from "../components/ui/button";
import { ProfileCard } from "../components/common/ProfileCard";
import { AttendanceSettingsCard } from "../components/settings/AttendanceSettingsCard";
import { HolidaySettingsCard } from "../components/settings/HolidaySettingsCard";
import { Skeleton } from "../components/ui/skeleton";
import { useAsync } from "../hooks/useAsync";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import { getSettings, updateSettings, getDepartments } from "../services/settingsService";
import { cn } from "../utils/cn";

const THEME_OPTIONS = [
  { key: "light", label: "Light", icon: Sun },
  { key: "dark", label: "Dark", icon: Moon },
  { key: "system", label: "System", icon: Monitor },
];

export default function Settings() {
  const { user } = useAuth();
  const isAdmin = user?.role === "Administrator";
  const { theme, setTheme } = useTheme();
  const { data: initialSettings, loading } = useAsync(() => getSettings(), []);
  const { data: departments } = useAsync(() => getDepartments(), []);

  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (initialSettings) setForm(initialSettings);
  }, [initialSettings]);

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    await updateSettings(form);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div>
      <Header
        title="Settings"
        description="Configure institute details and dashboard preferences."
        breadcrumbItems={[{ label: "Settings" }]}
      />

      {loading || !form ? (
        <div className="space-y-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-64" />
        </div>
      ) : (
        <div className="space-y-6">
          <ProfileCard profile={user} />

          <form onSubmit={handleSave} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Institute Details</CardTitle>
                <CardDescription>Shown across reports and exports.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Institute Name">
                  <Input value={form.instituteName} onChange={(e) => update("instituteName", e.target.value)} />
                </Field>
                <Field label="Semester">
                  <Input value={form.semester} onChange={(e) => update("semester", e.target.value)} />
                </Field>
                <Field label="Department">
                  <Select value={form.department} onChange={(e) => update("department", e.target.value)}>
                    {departments?.map((d) => (
                      <option key={d.code} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Academic Year">
                  <Input value={form.academicYear} onChange={(e) => update("academicYear", e.target.value)} />
                </Field>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Choose how the dashboard looks on this device.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {THEME_OPTIONS.map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        update("theme", key);
                        if (key !== "system") setTheme(key);
                      }}
                      className={cn(
                        "flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors",
                        (form.theme === key)
                          ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                      )}
                    >
                      <Icon className="h-4 w-4" /> {label}
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-xs text-slate-400">
                  Currently rendering in <span className="font-medium text-slate-600 dark:text-slate-300">{theme}</span> mode.
                </p>
              </CardContent>
            </Card>

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save changes"}
              </Button>
              {saved && (
                <span className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" /> Saved
                </span>
              )}
            </div>
          </form>

          {isAdmin && <AttendanceSettingsCard />}
          {isAdmin && <HolidaySettingsCard />}
        </div>
      )}
    </div>
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
