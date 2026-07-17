import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight, User, Mail, Lock } from "lucide-react";
import { register } from "../services/authService";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await register({ name, email, password });
      navigate("/verify-otp", { state: { email } });
    } catch (err) {
      setError(err.message ?? "Unable to register.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <img
        src="/assets/iiitdm-logo-crop.png"
        alt="IIITDM Kurnool"
        className="mx-auto h-[110px] w-[110px] rounded-full object-cover shadow-lg sm:h-[120px] sm:w-[120px]"
      />
      <h1 className="mt-5 text-center text-[28px] font-bold leading-tight text-white sm:text-[34px]">
        Create an account
      </h1>
      <p className="mt-1.5 text-center text-[15px] text-blue-100/70">
        We&apos;ll email you a verification code to activate it.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-medium text-blue-50/90">
            Full name
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-200/60" />
            <input
              id="name"
              placeholder="Suman Patil"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
              className="w-full rounded-xl border border-white/15 bg-white/5 py-3 pl-10 pr-3 text-[15px] text-white placeholder:text-blue-100/40 outline-none transition focus:border-blue-400/60 focus:bg-white/10"
            />
          </div>
        </div>

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
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              minLength={6}
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

        <div className="space-y-1.5">
          <label htmlFor="confirm-password" className="text-sm font-medium text-blue-50/90">
            Confirm password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-200/60" />
            <input
              id="confirm-password"
              type={showPassword ? "text" : "password"}
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
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
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#3B82F6] to-[#1D4ED8] text-[15px] font-semibold text-white shadow-lg shadow-blue-900/40 transition hover:from-[#4C8DF7] hover:to-[#1E40AF] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            "Sending code..."
          ) : (
            <>
              <ArrowRight className="h-4 w-4" /> Create account
            </>
          )}
        </button>

        <p className="text-center text-sm text-blue-100/70">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-blue-300 hover:text-blue-200 hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </motion.div>
  );
}
