# RFID Smart Attendance Dashboard

A frontend-only admin dashboard for an IoT Smart RFID Attendance System.
Built with **React (Vite)**, **Tailwind CSS v4**, hand-rolled **shadcn/ui-style**
primitives, **React Router**, **Recharts**, **Framer Motion** and **Lucide Icons**.

This dashboard currently runs entirely on **mock data**. It is deliberately
structured so the mock services can be swapped for real HTTP calls later
without touching a single component or page:

```
ESP32  →  Google Apps Script (HTTP POST)  →  Google Sheets  →  This Dashboard
```

## Getting started

```bash
npm install
npm run dev:all    # start the Vite dev server AND the local mock auth API together
npm run build       # production build
npm run preview     # preview the production build locally
```

`npm run dev:all` runs both processes with labeled output. You can also run
them separately: `npm run dev` (Vite, port 5173) and `npm run server` (mock
API, port 4000).

There is no seeded/demo account — **register your own** at `/register` (see
[Authentication](#authentication) below). Everything else in the app still
runs on mock data.

## Authentication

Registration and login are the parts of this dashboard that are **real HTTP
calls**, not JSON imports, served by a tiny Express app in `/server`:

- `POST /api/auth/register` — takes `{ name, email, password }`, hashes the
  password (bcrypt), generates a 6-digit OTP, and emails it via Gmail SMTP
  (`server/mailer.js`, needs `.env` - see below). The account is **not**
  created yet at this point; the registration sits in memory
  (`pendingRegistrations` in `server/userStore.js`) until verified.
- `POST /api/auth/verify-otp` — checks the code (10-minute expiry). On
  success, the account is written to `server/users.json` (a flat-file mock
  "database") and the pending record is cleared.
- `POST /api/auth/resend-otp` — regenerates and re-emails the code for a
  still-pending registration.
- `POST /api/auth/login` — looks up the user by email in `users.json` and
  compares the bcrypt hash. Returns the safe profile (no password hash) plus
  a random session token on success, or a real `401` on failure.
- If the API isn't running at all, `apiClient.apiRequest` catches the failed
  `fetch` and surfaces "Unable to reach the server."

**Gmail SMTP setup** (required for OTP emails to actually send): copy
`.env.example` to `.env` at the project root and fill in a Gmail address +
an [App Password](https://myaccount.google.com/apppasswords) (requires
2-Step Verification on that account). `.env` is gitignored - never commit
real credentials. Sending many OTPs in quick succession to different
recipients can trip Gmail's spam heuristics even though the send itself
succeeds - check spam/junk if a code doesn't show up in the primary inbox.

This is still a stand-in for the real backend - one JSON file instead of a
database, personal Gmail SMTP instead of a transactional email provider, no
HTTPS. When the ESP32 → Apps Script → Sheets pipeline is ready, only
`VITE_API_BASE_URL` and the routes in `server/index.js` need to change (or
`server/` can be deleted entirely once Apps Script issues real sessions).

## Project structure

```
server/
  index.js        Express app: register/verify-otp/resend-otp/login, GET /api/health
  mailer.js       nodemailer + Gmail SMTP transport for OTP emails
  userStore.js    users.json read/write + in-memory pending-registration/OTP map
  users.json      verified accounts (mock "database", gitignored contents change at runtime)

src/
  components/
    ui/           shadcn-style primitives (Button, Card, Input, Table, Badge, ...)
    layout/       Sidebar, Navbar, Header, Footer, Breadcrumb
    common/       SearchBar, Pagination, ThemeSwitch, NotificationBell, ProfileCard/Menu...
    dashboard/    StatCard, RecentScans, RecentActivity
    students/     StudentTable
    attendance/   AttendanceTable
    charts/       AttendanceMeter, WeeklyAttendanceChart, MonthlyAttendanceChart,
                  DepartmentAttendanceChart, PresentAbsentChart, AttendanceRankList
  pages/          Login, Register, VerifyOtp, Dashboard, Students, Attendance,
                  Reports, Settings, NotFound
  layouts/        AuthLayout, DashboardLayout
  context/        ThemeContext, AuthContext
  hooks/          useAuth, useTheme, useClock, useDebounce, usePagination,
                  useSortableData, useAsync, useCountUp
  services/       studentService, attendanceService, reportService, authService,
                  settingsService, notificationService, apiClient
  data/           students.json, attendance.json, settings.json, notifications.json,
                  departments.json  (all mock data lives here — never hardcoded
                  inside components)
  utils/          cn, dateUtils, attendanceUtils, chartTheme, exportCsv, mockDelay
  types/          JSDoc typedefs (Student, AttendanceRecord, Notification, ...)
```

## Swapping mock data for the real API

Every page talks to a **service**, never to `fetch`, JSON, or Google Sheets
directly. To go live:

1. Point `VITE_API_BASE_URL` (see `services/apiClient.js`) at the deployed
   Apps Script web app URL.
2. Replace the body of each function in `services/*.js` with a call to
   `apiRequest("/students")`, `apiRequest("/attendance")`, etc. — the return
   shape already matches what the Apps Script endpoint is expected to send.
3. Nothing in `components/`, `pages/`, or `hooks/` needs to change.

## Pages

- **Login** — email/password, remember me, forgot-password flow (forgot-password
  is still UI-only mock; login itself is a real API call)
- **Register / Verify email** — name/email/password, then a 6-digit OTP emailed
  via Gmail SMTP; the account is only created once the code is verified
- **Dashboard** — stat cards, attendance meter, present/absent split, weekly
  chart, recent RFID scans, recent activity feed
- **Students** — searchable/sortable/paginated roster with CSV export
- **Attendance** — searchable/filterable/sortable scan log with CSV export
- **Reports** — daily/weekly/monthly toggle, monthly trend, department-wise
  attendance, top & lowest attendance
- **Settings** — institute details, attendance window, theme, admin profile

## Notes

- Dark mode is a first-class theme (class-based, persisted to `localStorage`),
  not an afterthought — every component was built against both.
- Chart colors and mark specs follow a validated categorical/sequential/status
  palette so they stay legible and colorblind-safe in both themes.
- Mock data (32 students, ~84 school days of attendance) is generated once and
  committed as static JSON in `src/data` — no runtime dependency on a seed
  script.
