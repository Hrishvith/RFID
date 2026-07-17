import { Outlet } from "react-router-dom";
import { FlaskConical, ShieldCheck } from "lucide-react";

export function CampusAuthLayout() {
  return (
    <div className="relative min-h-svh w-full overflow-hidden bg-slate-950">
      <img
        src="/assets/campus-bg.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover saturate-125 contrast-105"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[rgba(6,14,35,0.4)] via-[rgba(6,14,35,0.22)] to-[rgba(4,10,28,0.62)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,transparent_30%,rgba(2,6,18,0.55)_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(2,6,18,0.55)] via-transparent to-transparent" />

      <div className="relative z-10 flex min-h-svh flex-col">
        <div className="flex items-center justify-between gap-3 px-6 pt-6 md:px-10 md:pt-10">
          <div className="hidden items-center gap-3 sm:flex">
            <img
              src="/assets/iiitdm-logo-crop.png"
              alt="IIITDM Kurnool"
              className="h-[72px] w-[72px] rounded-full object-cover shadow-lg"
            />
            <div>
              <p className="text-2xl font-bold leading-tight text-white md:text-[28px]">
                IIITDMK, Kurnool
              </p>
              <p className="text-sm text-blue-100/75">Smart Attendance System</p>
            </div>
          </div>

          <div className="ml-auto hidden items-center gap-3 rounded-full border border-white/20 bg-white/10 px-5 py-3 backdrop-blur-md sm:flex">
            <FlaskConical className="h-5 w-5 shrink-0 text-white" />
            <div className="text-sm font-semibold leading-tight text-white">
              <p>Advanced Manufacturing</p>
              <p>Research Laboratory</p>
            </div>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 py-8 sm:justify-end sm:px-10 md:px-20 lg:px-28">
          <div className="w-full max-w-[440px] rounded-[20px] border border-white/15 bg-[#0b1730]/70 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-10">
            <Outlet />
          </div>
        </div>

        <div className="hidden items-center gap-2 px-6 pb-6 text-xs text-blue-100/70 sm:flex md:px-10 md:pb-8">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          <span>© 2026 IIITDMK, Kurnool Smart Attendance System</span>
        </div>
      </div>
    </div>
  );
}
