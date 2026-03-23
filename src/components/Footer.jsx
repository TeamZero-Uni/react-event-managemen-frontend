import React from 'react';
import { GraduationCap, Mail, Phone, MapPin, Facebook, Linkedin, Globe } from 'lucide-react';

function Footer() {
  return (
    <footer className="relative mt-20 border-t border-[#c9a227]/20 bg-[#060e1a]">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-linear-to-r from-transparent via-[#c9a227]/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[radial-gradient(circle_at_40%_40%,#1a2d4a,#0a1525)] border border-[#c9a227]/30 shadow-[0_0_15px_rgba(201,162,39,0.1)]">
                <GraduationCap size={20} className="text-[#c9a227]" />
              </div>
              <div className="font-serif">
                <p className="text-sm font-black tracking-widest text-[#c9a227]">FOT <span className="text-[#e8c84a]">EMS</span></p>
                <p className="text-[8px] uppercase tracking-widest text-slate-500">University of Ruhuna</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-serif italic">
              Empowering the next generation of engineers through seamless event integration and academic collaboration.
            </p>
            <div className="flex gap-4">
              <Facebook size={16} className="text-slate-500 hover:text-[#c9a227] cursor-pointer transition-colors" />
              <Linkedin size={16} className="text-slate-500 hover:text-[#c9a227] cursor-pointer transition-colors" />
              <Globe size={16} className="text-slate-500 hover:text-[#c9a227] cursor-pointer transition-colors" />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-bold tracking-[0.25em] text-[#c9a227] uppercase">Navigation</h4>
            <ul className="space-y-2 text-xs text-slate-400 font-serif">
              <li className="hover:text-[#c9a227] cursor-pointer transition-colors">Upcoming Events</li>
              <li className="hover:text-[#c9a227] cursor-pointer transition-colors">Past Symposiums</li>
              <li className="hover:text-[#c9a227] cursor-pointer transition-colors">Resource Center</li>
              <li className="hover:text-[#c9a227] cursor-pointer transition-colors">Faculty Portal</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-bold tracking-[0.25em] text-[#c9a227] uppercase">Support</h4>
            <ul className="space-y-2 text-xs text-slate-400 font-serif">
              <li className="hover:text-[#c9a227] cursor-pointer transition-colors">Event Guidelines</li>
              <li className="hover:text-[#c9a227] cursor-pointer transition-colors">Privacy Policy</li>
              <li className="hover:text-[#c9a227] cursor-pointer transition-colors">Terms of Service</li>
              <li className="hover:text-[#c9a227] cursor-pointer transition-colors">Contact Admin</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-bold tracking-[0.25em] text-[#c9a227] uppercase">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-xs text-slate-400">
                <MapPin size={14} className="text-[#c9a227] shrink-0" />
                <span>Faculty of Technology,<br />University of Ruhuna, Sri Lanka.</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <Mail size={14} className="text-[#c9a227]" />
                <span>events@tec.ruh.ac.lk</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <Phone size={14} className="text-[#c9a227]" />
                <span>+94 41 222 3344</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#c9a227]/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[9px] tracking-widest text-slate-600 uppercase">
            © 2026 Faculty of Technology. All Rights Reserved.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <p className="text-[9px] tracking-widest text-slate-600 uppercase">System Status: Operational</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;