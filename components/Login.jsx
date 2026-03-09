import React, { useState } from 'react';
import { Mail, Lock, LogIn, ShieldCheck } from 'lucide-react';

export default function Login({ isLogged, onClose }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Authenticating:", username);
    isLogged(true);
    onClose();
  };

  return (
    <div className="w-full space-y-6 font-serif">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#c9a227]/10 border border-[#c9a227]/20 mb-2">
          <ShieldCheck className="text-[#c9a227]" size={24} />
        </div>
        <p className="text-[10px] tracking-[0.2em] text-slate-400 uppercase">Secure Faculty Access</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs tracking-widest text-[#c9a227]/80 uppercase ml-1">Username</label>
          <div className="relative group">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#c9a227] transition-colors" size={18} />
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
            <label className="text-xs tracking-widest text-[#c9a227]/80 uppercase ml-1">Password</label>
          </div>
          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#c9a227] transition-colors" size={18} />
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
  );
}