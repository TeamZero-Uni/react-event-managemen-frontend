import React, { useState } from "react";
import { Lock, ShieldCheck, Eye, EyeOff, ArrowLeft, CheckCircle2 } from "lucide-react";
import { FiX } from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import { resetPassword } from "../../api/api";

const rules = [
  { label: "At least 8 characters", test: (v) => v.length >= 8 },
  { label: "One uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { label: "One lowercase letter", test: (v) => /[a-z]/.test(v) },
  { label: "One number", test: (v) => /\d/.test(v) },
  { label: "One special character", test: (v) => /[^A-Za-z0-9]/.test(v) },
];

function getStrength(password) {
  const passed = rules.filter((r) => r.test(password)).length;
  if (passed <= 1) return { level: 0, label: "Very Weak", color: "#ef4444" };
  if (passed === 2) return { level: 1, label: "Weak", color: "#f97316" };
  if (passed === 3) return { level: 2, label: "Fair", color: "#eab308" };
  if (passed === 4) return { level: 3, label: "Strong", color: "#84cc16" };
  return { level: 4, label: "Very Strong", color: "#22c55e" };
}

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { username = "", email = "" } = location.state || {};

  const strength = getStrength(password);
  const allRulesPassed = rules.every((r) => r.test(password));
  const passwordsMatch = password && confirm && password === confirm;
  const canSubmit = allRulesPassed && passwordsMatch && !isSubmitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!allRulesPassed) { setErrorMsg("Password does not meet all requirements."); return; }
    if (password !== confirm) { setErrorMsg("Passwords do not match."); return; }
    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await resetPassword({ username, newPassword:password });
      setSuccessMsg("Password reset successfully! Redirecting to login...");
      setTimeout(() => navigate("/auth/login"), 2000);
    } catch (error) {
      const msg = error.response?.data?.message || "Reset failed. Please try again.";
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-[#060e1a]/80 backdrop-blur-md px-4">
      <div
        className="relative w-full max-w-md rounded-sm border border-[#c9a227]/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0a1628 0%, #0d1f3c 100%)" }}
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-[#c9a227]/50 to-transparent" />

        <div className="flex items-center justify-between p-5 border-b border-[#c9a227]/10 bg-[#0a1525]/50">
          <h2 className="text-sm font-serif font-bold tracking-[0.15em] text-[#c9a227] uppercase">
            Reset Password
          </h2>
          <button
            onClick={() => navigate("/home")}
            className="p-1.5 rounded-sm hover:bg-[#c9a227]/10 text-[#c9a227]/70 hover:text-[#c9a227] transition-all duration-300 border border-transparent hover:border-[#c9a227]/20"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="p-6 text-slate-300 font-serif leading-relaxed">
          <div className="w-full space-y-5 font-serif">

            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#c9a227]/10 border border-[#c9a227]/20 mb-2">
                <Lock className="text-[#c9a227]" size={24} />
              </div>
              <p className="text-[10px] tracking-[0.2em] text-slate-400 uppercase">
                Create New Password
              </p>
              {username && (
                <p className="text-[11px] text-slate-500 tracking-wide">
                  Resetting password for{" "}
                  <span className="text-[#c9a227]/70">{username}</span>
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs tracking-widest text-[#c9a227]/80 uppercase ml-1">
                  New Password
                </label>
                <div className="relative group">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#c9a227] transition-colors"
                    size={18}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrorMsg(""); }}
                    className="w-full bg-[#060e1a]/50 border border-[#c9a227]/20 rounded-sm py-2.5 pl-10 pr-10 text-sm text-white placeholder:text-slate-600 outline-none focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227]/30 transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#c9a227] transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {password.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex gap-1">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="h-1 flex-1 rounded-full transition-all duration-300"
                          style={{
                            backgroundColor: i <= strength.level ? strength.color : "rgba(201,162,39,0.1)",
                          }}
                        />
                      ))}
                    </div>
                    <p
                      className="text-[10px] tracking-widest uppercase ml-0.5 transition-colors duration-300"
                      style={{ color: strength.color }}
                    >
                      {strength.label}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs tracking-widest text-[#c9a227]/80 uppercase ml-1">
                  Confirm Password
                </label>
                <div className="relative group">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#c9a227] transition-colors"
                    size={18}
                  />
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => { setConfirm(e.target.value); setErrorMsg(""); }}
                    className={`w-full bg-[#060e1a]/50 border rounded-sm py-2.5 pl-10 pr-10 text-sm text-white placeholder:text-slate-600 outline-none transition-all ${
                      confirm
                        ? passwordsMatch
                          ? "border-emerald-500/50 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
                          : "border-red-500/40 focus:border-red-500/60 focus:ring-1 focus:ring-red-500/20"
                        : "border-[#c9a227]/20 focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227]/30"
                    }`}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#c9a227] transition-colors"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {confirm && !passwordsMatch && (
                  <p className="text-[10px] text-red-400/80 tracking-wider ml-1">Passwords do not match</p>
                )}
                {passwordsMatch && (
                  <p className="text-[10px] text-emerald-400/80 tracking-wider ml-1 flex items-center gap-1">
                    <CheckCircle2 size={11} /> Passwords match
                  </p>
                )}
              </div>
              {password.length > 0 && (
                <div className="bg-[#060e1a]/40 border border-[#c9a227]/10 rounded-sm px-3 py-3 space-y-1.5">
                  {rules.map((rule) => {
                    const passed = rule.test(password);
                    return (
                      <div key={rule.label} className="flex items-center gap-2">
                        <CheckCircle2
                          size={12}
                          className={`shrink-0 transition-colors duration-300 ${passed ? "text-emerald-400" : "text-slate-600"}`}
                        />
                        <span className={`text-[10px] tracking-wide transition-colors duration-300 ${passed ? "text-emerald-400/80" : "text-slate-600"}`}>
                          {rule.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {errorMsg && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-sm border border-red-500/30 bg-red-500/10">
                  <span className="text-red-400 text-[10px] tracking-widest uppercase">{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-sm border border-emerald-500/30 bg-emerald-500/10">
                  <span className="text-emerald-400 text-[10px] tracking-widest uppercase">{successMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full mt-2 flex items-center justify-center gap-2 btn-color font-bold py-3 rounded-sm text-xs tracking-[0.2em] shadow-[0_4px_15px_rgba(201,162,39,0.2)] hover:shadow-[0_6px_25px_rgba(201,162,39,0.4)] hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[0_4px_15px_rgba(201,162,39,0.2)]"
              >
                <ShieldCheck size={16} />
                {isSubmitting ? "RESETTING..." : "RESET PASSWORD"}
              </button>
            </form>

            <button
              onClick={() => navigate("/verify-otp", { state: { username, email } })}
              className="w-full flex items-center justify-center gap-2 text-[10px] tracking-[0.2em] text-[#c9a227]/60 hover:text-[#c9a227] uppercase transition-colors duration-300"
            >
              <ArrowLeft size={12} />
              Back to Verification
            </button>

            <p className="text-center text-[9px] text-slate-500 tracking-wider">
              Authorized personnel only. University of Ruhuna © 2026
            </p>
          </div>
        </div>

        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-linear-to-r from-transparent via-[#c9a227]/20 to-transparent" />
      </div>
    </div>
  );
}