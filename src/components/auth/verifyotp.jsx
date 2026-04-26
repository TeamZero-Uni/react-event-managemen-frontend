import React, { useState, useRef, useEffect } from "react";
import { ShieldCheck, ArrowLeft, RotateCcw } from "lucide-react";
import { FiX } from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import { verifyOtp, forgotPassword } from "../../api/api"; // ✅ correct imports

const OTP_LENGTH = 6;
const RESEND_COUNTDOWN = 60;

export default function VerifyOtp() {
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_COUNTDOWN);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();

  const { username = "", email = "" } = location.state || {};

  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return; }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setErrorMsg("");
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const newOtp = [...otp];
    pasted.split("").forEach((char, i) => { newOtp[i] = char; });
    setOtp(newOtp);
    const nextEmpty = newOtp.findIndex((v) => !v);
    inputRefs.current[nextEmpty === -1 ? OTP_LENGTH - 1 : nextEmpty]?.focus();
  };

  const handleResend = async () => {
    if (!canResend) return;
    setCanResend(false);
    setCountdown(RESEND_COUNTDOWN);
    setErrorMsg("");
    setSuccessMsg("");
    setOtp(Array(OTP_LENGTH).fill(""));
    inputRefs.current[0]?.focus();
    try {
      await forgotPassword({ username, email }); 
      setSuccessMsg("A new OTP has been sent to your email.");
    } catch {
      setErrorMsg("Failed to resend OTP. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < OTP_LENGTH) { setErrorMsg("Please enter all 6 digits."); return; }
    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await verifyOtp({ otp: code, username }); 
      navigate("/reset-password", { state: { username, email } });
    } catch (error) {
      const msg = error.response?.data?.message || "Invalid OTP. Please try again.";
      setErrorMsg(msg);
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  const filled = otp.filter(Boolean).length;
  const progress = (filled / OTP_LENGTH) * 100;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-[#060e1a]/80 backdrop-blur-md px-4">
      <div
        className="relative w-full max-w-md rounded-sm border border-[#c9a227]/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0a1628 0%, #0d1f3c 100%)" }}
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-[#c9a227]/50 to-transparent" />

        <div className="flex items-center justify-between p-5 border-b border-[#c9a227]/10 bg-[#0a1525]/50">
          <h2 className="text-sm font-serif font-bold tracking-[0.15em] text-[#c9a227] uppercase">
            OTP Verification
          </h2>
          <button
            onClick={() => navigate("/home")}
            className="p-1.5 rounded-sm hover:bg-[#c9a227]/10 text-[#c9a227]/70 hover:text-[#c9a227] transition-all duration-300 border border-transparent hover:border-[#c9a227]/20"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="p-6 text-slate-300 font-serif leading-relaxed">
          <div className="w-full space-y-6 font-serif">

            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#c9a227]/10 border border-[#c9a227]/20 mb-2">
                <ShieldCheck className="text-[#c9a227]" size={24} />
              </div>
              <p className="text-[10px] tracking-[0.2em] text-slate-400 uppercase">
                One-Time Password
              </p>
              <p className="text-[11px] text-slate-500 tracking-wide leading-relaxed">
                Enter the 6-digit code sent to{" "}
                <span className="text-[#c9a227]/70 tracking-normal">{email || "your registered email"}</span>.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              <div className="space-y-3">
                <label className="text-xs tracking-widest text-[#c9a227]/80 uppercase ml-1">
                  Verification Code
                </label>
                <div className="flex justify-between gap-2" onPaste={handlePaste}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className={`
                        w-full aspect-square max-w-[52px] text-center text-lg font-bold font-mono
                        bg-[#060e1a]/50 rounded-sm border transition-all duration-200
                        outline-none caret-[#c9a227]
                        ${digit
                          ? "border-[#c9a227]/60 shadow-[0_0_10px_rgba(201,162,39,0.15)] text-[#c9a227]"
                          : "border-[#c9a227]/20 text-white"
                        }
                        focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227]/30
                        focus:shadow-[0_0_14px_rgba(201,162,39,0.25)]
                      `}
                    />
                  ))}
                </div>

                <div className="h-px w-full bg-[#c9a227]/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#c9a227]/50 transition-all duration-300 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

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
                disabled={isSubmitting || filled < OTP_LENGTH}
                className="w-full flex items-center justify-center gap-2 btn-color font-bold py-3 rounded-sm text-xs tracking-[0.2em] shadow-[0_4px_15px_rgba(201,162,39,0.2)] hover:shadow-[0_6px_25px_rgba(201,162,39,0.4)] hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[0_4px_15px_rgba(201,162,39,0.2)]"
              >
                <ShieldCheck size={16} />
                {isSubmitting ? "VERIFYING..." : "VERIFY CODE"}
              </button>
            </form>

            <div className="text-center space-y-1">
              <p className="text-[10px] text-slate-500 tracking-wider">
                Didn't receive the code?
              </p>
              <button
                onClick={handleResend}
                disabled={!canResend}
                className={`inline-flex items-center gap-1.5 text-[10px] tracking-[0.2em] uppercase transition-colors duration-300 ${
                  canResend
                    ? "text-[#c9a227] hover:text-[#c9a227]/80 cursor-pointer"
                    : "text-slate-600 cursor-not-allowed"
                }`}
              >
                <RotateCcw size={11} />
                {canResend ? "Resend OTP" : `Resend in ${countdown}s`}
              </button>
            </div>

            <button
              onClick={() => navigate("/forgot-password")}
              className="w-full flex items-center justify-center gap-2 text-[10px] tracking-[0.2em] text-[#c9a227]/60 hover:text-[#c9a227] uppercase transition-colors duration-300"
            >
              <ArrowLeft size={12} />
              Back to Recovery
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