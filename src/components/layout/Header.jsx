import { Breadcrumb } from "./Breadcrumb";

/**
 * Per-page header: title, breadcrumb trail, and a slot for page-level actions
 * (e.g. the Export button on Attendance, filters on Reports).
 * @param {{ title: string, description?: string, breadcrumbItems?: {label:string,to?:string}[], actions?: React.ReactNode }} props
 */
export function Header({ title, description, breadcrumbItems = [], actions }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between animate-fade-up">
      <div className="flex flex-col gap-1.5">
        <Breadcrumb items={breadcrumbItems} />
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
