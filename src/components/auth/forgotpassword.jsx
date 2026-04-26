import React, { useState } from "react";
import { Mail, User, ShieldAlert, ArrowLeft, Send } from "lucide-react";
import { FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../../api/api";

export default function ForgotPassword() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setIsSubmitting(true);
    try {
      await forgotPassword({ username, email });
      navigate("/verify-otp", { state: { username, email } });
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        "Request failed. Please check your details and try again.";
      setErrorMsg(msg);
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
          <div className="w-full space-y-6 font-serif">

            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#c9a227]/10 border border-[#c9a227]/20 mb-2">
                <ShieldAlert className="text-[#c9a227]" size={24} />
              </div>
              <p className="text-[10px] tracking-[0.2em] text-slate-400 uppercase">
                Account Recovery
              </p>
              <p className="text-[11px] text-slate-500 tracking-wide">
                Enter your username and registered email to receive reset instructions.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              <div className="space-y-1.5">
                <label className="text-xs tracking-widest text-[#c9a227]/80 uppercase ml-1">
                  Username
                </label>
                <div className="relative group">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#c9a227] transition-colors"
                    size={18}
                  />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setErrorMsg(""); setSuccessMsg(""); }}
                    className="w-full bg-[#060e1a]/50 border border-[#c9a227]/20 rounded-sm py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 outline-none focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227]/30 transition-all"
                    placeholder="e.g. TG12345"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs tracking-widest text-[#c9a227]/80 uppercase ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#c9a227] transition-colors"
                    size={18}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrorMsg(""); setSuccessMsg(""); }}
                    className="w-full bg-[#060e1a]/50 border border-[#c9a227]/20 rounded-sm py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 outline-none focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227]/30 transition-all"
                    placeholder="yourname@ruh.ac.lk"
                    required
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
                disabled={isSubmitting}
                className="w-full mt-4 flex items-center justify-center gap-2 btn-color font-bold py-3 rounded-sm text-xs tracking-[0.2em] shadow-[0_4px_15px_rgba(201,162,39,0.2)] hover:shadow-[0_6px_25px_rgba(201,162,39,0.4)] hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                <Send size={16} />
                {isSubmitting ? "SENDING..." : "SEND OTP"}
              </button>
            </form>

            <button
              onClick={() => navigate("/auth/login")}
              className="w-full flex items-center justify-center gap-2 text-[10px] tracking-[0.2em] text-[#c9a227]/60 hover:text-[#c9a227] uppercase transition-colors duration-300"
            >
              <ArrowLeft size={12} />
              Back to Login
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