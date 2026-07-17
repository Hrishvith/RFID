import { Link } from "react-router-dom";
import { Radio } from "lucide-react";
import { Button } from "../components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center dark:bg-slate-950">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white">
        <Radio className="h-7 w-7" />
      </span>
      <h1 className="text-4xl font-bold text-slate-900 dark:text-white">404</h1>
      <p className="max-w-sm text-slate-500 dark:text-slate-400">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Button as={Link} to="/dashboard">
        Back to dashboard
      </Button>
    </div>
  );
}
