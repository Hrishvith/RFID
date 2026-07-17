import { Mail, Phone, ShieldCheck, Building2 } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Avatar } from "../ui/avatar";

/**
 * @param {{ profile: import('../../types').Student | Record<string, any> }} props
 */
export function ProfileCard({ profile }) {
  if (!profile) return null;

  return (
    <Card className="animate-fade-up">
      <CardContent className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        <Avatar name={profile.name} src={profile.avatar} size="xl" />
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{profile.name}</h3>
          <p className="text-sm text-brand-600 dark:text-brand-400">{profile.role ?? "Administrator"}</p>

          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Mail className="h-4 w-4 shrink-0" />
              <span className="truncate">{profile.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Phone className="h-4 w-4 shrink-0" />
              <span className="truncate">{profile.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Building2 className="h-4 w-4 shrink-0" />
              <span className="truncate">{profile.department}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span className="truncate">Last login: {profile.lastLogin ?? "—"}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
