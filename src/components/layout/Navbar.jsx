import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { SearchBar } from "../common/SearchBar";
import { NotificationBell } from "../common/NotificationBell";
import { ThemeSwitch } from "../common/ThemeSwitch";
import { ProfileMenu } from "../common/ProfileMenu";
import { useAuth } from "../../hooks/useAuth";

export function Navbar({ onMenuClick }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "Administrator";

  function handleSubmit(e) {
    e.preventDefault();
    if (query.trim()) navigate(`/students?search=${encodeURIComponent(query.trim())}`);
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md sm:px-6 dark:border-slate-800 dark:bg-slate-950/80">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden dark:text-slate-400 dark:hover:bg-slate-800"
        aria-label="Open sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      {isAdmin && (
        <form onSubmit={handleSubmit} className="hidden flex-1 max-w-sm md:block">
          <SearchBar value={query} onChange={setQuery} placeholder="Search students, USN, UID..." />
        </form>
      )}

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <ThemeSwitch />
        {isAdmin && <NotificationBell />}
        <div className="hidden h-8 w-px bg-slate-200 sm:block dark:bg-slate-800" />
        <ProfileMenu />
      </div>
    </header>
  );
}
