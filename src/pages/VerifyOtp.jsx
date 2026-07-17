import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { verifyOtp, resendOtp } from "../services/authService";

const RESEND_COOLDOWN_S = 30;

export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_S);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  if (!email) {
    return (
      <div className="text-center">
        <p className="text-sm text-blue-100/70">No registration in progress.</p>
        <Link
          to="/register"
          className="mt-3 inline-block text-sm font-medium text-blue-300 hover:text-blue-200 hover:underline"
        >
          Go to registration
        </Link>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await verifyOtp({ email, otp });
      navigate("/login", { state: { verified: true } });
    } catch (err) {
      setError(err.message ?? "Unable to verify code.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError("");
    setResendMessage("");
    setResending(true);
    try {
      await resendOtp(email);
      setResendMessage("A new code has been sent.");
      setCooldown(RESEND_COOLDOWN_S);
    } catch (err) {
      setError(err.message ?? "Unable to resend code.");
    } finally {
      setResending(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Link
        to="/register"
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-blue-100/70 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-blue-200">
        <ShieldCheck className="h-5 w-5" />
      </span>

      <h1 className="mt-4 text-2xl font-bold text-white">Verify your email</h1>
      <p className="mt-1.5 text-sm text-blue-100/70">
        Enter the 6-digit code we sent to{" "}
        <span className="font-medium text-white">{email}</span>.
      </p>
      <p className="mt-1 text-xs text-blue-100/50">
        Don&apos;t see it? Check your spam or junk folder — it can take a minute to arrive.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="otp" className="text-sm font-medium text-blue-50/90">
            Verification code
          </label>
          <input
            id="otp"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            placeholder="123456"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            autoFocus
            required
            className="w-full rounded-xl border border-white/15 bg-white/5 py-3 px-3 text-center text-lg tracking-[0.5em] text-white placeholder:text-blue-100/40 outline-none transition focus:border-blue-400/60 focus:bg-white/10"
          />
        </div>

        {error && (
          <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}
        {resendMessage && !error && (
          <p className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
            {resendMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-b from-[#3B82F6] to-[#1D4ED8] text-[15px] font-semibold text-white shadow-lg shadow-blue-900/40 transition hover:from-[#4C8DF7] hover:to-[#1E40AF] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Verifying..." : "Verify account"}
        </button>

        <p className="text-center text-sm text-blue-100/70">
          Didn&apos;t get the code?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={resending || cooldown > 0}
            className="font-medium text-blue-300 hover:text-blue-200 hover:underline disabled:cursor-not-allowed disabled:text-blue-100/40 disabled:no-underline"
          >
            {resending ? "Resending..." : cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
          </button>
        </p>
      </form>
    </motion.div>
  );
}
