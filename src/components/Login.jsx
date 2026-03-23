import React, { useState } from "react";
import { Mail, Lock, LogIn, ShieldCheck } from "lucide-react";
import { useAuth } from "../hook/useAuth";
import { FiX } from "react-icons/fi";
import { Navigate, useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { loginUser } = useAuth();

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const credentials = { username, password };
      await loginUser(credentials);
      navigate("/home");
    } catch (error) {
      console.error("Login error", error);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-[#060e1a]/80 backdrop-blur-md px-4">
      <div
        className="relative w-full max-w-md rounded-sm border border-[#c9a227]/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0a1628 0%, #0d1f3c 100%)",
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-[#c9a227]/50 to-transparent" />

        <div className="flex items-center justify-between p-5 border-b border-[#c9a227]/10 bg-[#0a1525]/50">
          <h2 className="text-sm font-serif font-bold tracking-[0.15em] text-[#c9a227] uppercase">
            Login to Faculty Portal
          </h2>
          <button 
          onClick={() => navigate("/home")}
          className="p-1.5 rounded-sm hover:bg-[#c9a227]/10 text-[#c9a227]/70 hover:text-[#c9a227] transition-all duration-300 border border-transparent hover:border-[#c9a227]/20">
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
                Secure Faculty Access
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs tracking-widest text-[#c9a227]/80 uppercase ml-1">
                  Username
                </label>
                <div className="relative group">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#c9a227] transition-colors"
                    size={18}
                  />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-[#060e1a]/50 border border-[#c9a227]/20 rounded-sm py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 outline-none focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227]/30 transition-all"
                    placeholder="e.g. TG12345"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-end">
                  <label className="text-xs tracking-widest text-[#c9a227]/80 uppercase ml-1">
                    Password
                  </label>
                </div>
                <div className="relative group">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#c9a227] transition-colors"
                    size={18}
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#060e1a]/50 border border-[#c9a227]/20 rounded-sm py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 outline-none focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227]/30 transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 flex items-center justify-center gap-2 btn-color font-bold py-3 rounded-sm text-xs tracking-[0.2em] shadow-[0_4px_15px_rgba(201,162,39,0.2)] hover:shadow-[0_6px_25px_rgba(201,162,39,0.4)] hover:-translate-y-0.5 transition-all active:scale-[0.98]"
              >
                <LogIn size={16} />
                AUTHENTICATE
              </button>
            </form>

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
