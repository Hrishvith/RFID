import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Mail, Lock, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { requestPasswordReset } from "../../services/authService";

/**
 * Shared login UI for both the Admin and User portals. Only the copy, the
 * `portal` value sent to the backend, and which links show differ between
 * the two - the form, validation and forgot-password flow are identical.
 *
 * @param {{
 *   portal: "admin" | "user",
 *   heading: string,
 *   subheading: string,
 *   showRegisterLink?: boolean,
 *   switchPortal?: { to: string, label: string }
 * }} props
 */
export function AuthPortalLogin({ portal, heading, subheading, showRegisterLink, switchPortal }) {
  const [view, setView] = useState("login"); // "login" | "forgot"
  const location = useLocation();
  const justVerified = Boolean(location.state?.verified);

  return (
    <div className="animate-fade-up">
      {justVerified && view === "login" && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Account verified. You can now sign in.
        </div>
      )}

      <AnimatePresence mode="wait">
        {view === "login" ? (
          <motion.div
            key="login"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.2 }}
          >
            <LoginForm
              portal={portal}
              heading={heading}
              subheading={subheading}
              showRegisterLink={showRegisterLink}
              switchPortal={switchPortal}
              onForgotPassword={() => setView("forgot")}
            />
          </motion.div>
        ) : (
          <motion.div
            key="forgot"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
          >
            <ForgotPasswordForm onBack={() => setView("login")} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LoginForm({ portal, heading, subheading, showRegisterLink, switchPortal, onForgotPassword }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login({ email, password, rememberMe, portal });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message ?? "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <img
        src="/assets/iiitdm-logo-crop.png"
        alt="IIITDM Kurnool"
        className="mx-auto h-[110px] w-[110px] rounded-full object-cover shadow-lg sm:h-[120px] sm:w-[120px]"
      />
      <h1 className="mt-5 text-center text-[28px] font-bold leading-tight text-white sm:text-[34px]">
        {heading}
      </h1>
      <p className="mt-1.5 text-center text-[15px] text-blue-100/70">{subheading}</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-blue-50/90">
            Email
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-200/60" />
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              className="w-full rounded-xl border border-white/15 bg-white/5 py-3 pl-10 pr-3 text-[15px] text-white placeholder:text-blue-100/40 outline-none transition focus:border-blue-400/60 focus:bg-white/10"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium text-blue-50/90">
            Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-200/60" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="w-full rounded-xl border border-white/15 bg-white/5 py-3 pl-10 pr-10 text-[15px] text-white placeholder:text-blue-100/40 outline-none transition focus:border-blue-400/60 focus:bg-white/10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-blue-200/60 hover:text-white"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-blue-50/80">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-white/30 bg-white/10 accent-blue-600"
            />
            Remember me
          </label>
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm font-medium text-blue-300 hover:text-blue-200 hover:underline"
          >
            Forgot password?
          </button>
        </div>

        {error && (
          <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#3B82F6] to-[#1D4ED8] text-[15px] font-semibold text-white shadow-lg shadow-blue-900/40 transition hover:from-[#4C8DF7] hover:to-[#1E40AF] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            "Signing in..."
          ) : (
            <>
              <ArrowRight className="h-4 w-4" /> Sign in
            </>
          )}
        </button>

        {showRegisterLink && (
          <p className="text-center text-sm text-blue-100/70">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="font-medium text-blue-300 hover:text-blue-200 hover:underline">
              Register
            </Link>
          </p>
        )}

        {switchPortal && (
          <p className="text-center text-sm text-blue-100/70">
            <Link
              to={switchPortal.to}
              className="font-medium text-blue-300 hover:text-blue-200 hover:underline"
            >
              {switchPortal.label}
            </Link>
          </p>
        )}
      </form>
    </>
  );
}

function ForgotPasswordForm({ onBack }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(err.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={onBack}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-blue-100/70 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Back to sign in
      </button>

      <h1 className="text-2xl font-bold text-white">Reset your password</h1>
      <p className="mt-1.5 text-sm text-blue-100/70">
        Enter your institute email and we&apos;ll send you a reset link.
      </p>

      {sent ? (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-emerald-400/25 bg-emerald-500/10 p-6 text-center">
          <CheckCircle2 className="h-8 w-8 text-emerald-400" />
          <p className="text-sm font-medium text-emerald-300">Reset link sent to {email}</p>
          <p className="text-xs text-emerald-400/70">(Demo only - no email is actually sent.)</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="reset-email" className="text-sm font-medium text-blue-50/90">
              Email
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-200/60" />
              <input
                id="reset-email"
                type="email"
                placeholder="admin@drait.edu.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-white/15 bg-white/5 py-3 pl-10 pr-3 text-[15px] text-white placeholder:text-blue-100/40 outline-none transition focus:border-blue-400/60 focus:bg-white/10"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-b from-[#3B82F6] to-[#1D4ED8] text-[15px] font-semibold text-white shadow-lg shadow-blue-900/40 transition hover:from-[#4C8DF7] hover:to-[#1E40AF] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>
      )}
    </>
  );
}
