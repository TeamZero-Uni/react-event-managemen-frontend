import React from 'react';
import { Target, Users, Shield, Award, ChevronRight } from 'lucide-react';

function About() {
  return (
    <div className="py-12 space-y-20">
      
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#c9a227]">
              Defining the Future of <br /> 
              <span className="text-white">Event Excellence.</span>
            </h1>
            <div className="h-1.5 w-24 bg-linear-to-r from-[#c9a227] to-transparent" />
          </div>
          <p className="text-slate-300 font-serif text-lg leading-relaxed italic">
            "The Faculty of Technology Events Management System (FOT EMS) is the digital backbone for academic and professional gatherings at the University of Ruhuna."
          </p>
          <p className="text-slate-400 text-sm leading-relaxed">
            Established to streamline the coordination of symposiums, workshops, and competitions, our platform ensures that the spirit of innovation is never hindered by administrative complexity. We bridge the gap between student creativity and industrial partnership.
          </p>
          <button className="flex items-center gap-2 text-[#c9a227] text-xs font-bold tracking-[0.2em] uppercase hover:gap-4 transition-all">
            View Our Faculty Charter <ChevronRight size={16} />
          </button>
        </div>

        <div className="relative group">
          <div className="absolute -inset-4 border border-[#c9a227]/20 rounded-sm translate-x-2 translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-500" />
          <div className="relative h-100 w-full rounded-sm overflow-hidden border border-[#c9a227]/30">
            <img 
              src="https://images.unsplash.com/photo-1523050335102-c89997d5b5c7?q=80&w=1000" 
              alt="University Campus" 
              className="w-full h-full object-cover grayscale-50% hover:grayscale-0 transition-all duration-700"
            />
            <div className="absolute inset-0 bg-linear-to-t from-[#0a1628] via-transparent to-transparent" />
          </div>
        </div>
      </section>

      <section className="space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-[10px] tracking-[0.4em] text-[#c9a227] uppercase font-bold">Our Pillars</h2>
          <h3 className="text-3xl font-serif text-white">Core Values & Commitment</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: <Target />, title: "Precision", desc: "Meticulous planning for every academic milestone." },
            { icon: <Users />, title: "Community", desc: "Fostering collaboration between students and industry." },
            { icon: <Shield />, title: "Integrity", desc: "Ensuring secure and transparent event management." },
            { icon: <Award />, title: "Excellence", desc: "Setting the gold standard for university functions." }
          ].map((item, idx) => (
            <div key={idx} className="p-8 bg-[#0d1f3c]/30 border border-[#c9a227]/10 rounded-sm hover:border-[#c9a227]/40 transition-colors group text-center">
              <div className="inline-flex p-3 rounded-full bg-[#c9a227]/5 text-[#c9a227] mb-4 group-hover:scale-110 transition-transform">
                {React.cloneElement(item.icon, { size: 24 })}
              </div>
              <h4 className="text-[#c9a227] font-serif font-bold mb-2 uppercase tracking-widest text-sm">{item.title}</h4>
              <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-sm bg-linear-to-br from-[#0d1f3c] to-[#060e1a] border border-[#c9a227]/10 p-12 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#c9a227]/5 rounded-full blur-3xl -mr-32 -mt-32" />
        
        <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-4xl font-serif font-bold text-[#c9a227]">50+</p>
            <p className="text-[10px] tracking-widest text-slate-500 uppercase mt-2">Annual Events</p>
          </div>
          <div>
            <p className="text-4xl font-serif font-bold text-[#c9a227]">2500+</p>
            <p className="text-[10px] tracking-widest text-slate-500 uppercase mt-2">Participants</p>
          </div>
          <div>
            <p className="text-4xl font-serif font-bold text-[#c9a227]">15+</p>
            <p className="text-[10px] tracking-widest text-slate-500 uppercase mt-2">Industry Partners</p>
          </div>
          <div>
            <p className="text-4xl font-serif font-bold text-[#c9a227]">100%</p>
            <p className="text-[10px] tracking-widest text-slate-500 uppercase mt-2">Digital Workflow</p>
          </div>
        </div>
      </section>

    </div>
  );
}

export default About;