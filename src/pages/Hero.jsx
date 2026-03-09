import { useEffect, useState } from "react";
import { GraduationCap, ChevronDown, Calendar, Users, Award } from "lucide-react";
import { Link } from "react-router-dom";

export default function Hero() {
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    setMounted(true);
    const p = Array.from({ length: 28 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 0.5,
      duration: Math.random() * 8 + 4,
      delay: Math.random() * 6,
      opacity: Math.random() * 0.5 + 0.1,
    }));
    setParticles(p);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden font-serif"
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: "#c9a227",
            opacity: mounted ? p.opacity : 0,
            animation: `twinkle ${p.duration}s ease-in-out ${p.delay}s infinite`,
            boxShadow: `0 0 ${p.size * 2}px #c9a227`,
          }}
        />
      ))}

      <div
        className="absolute pointer-events-none w-150 h-150 top-[20%] left-1/2 -translate-x-1/2"
        style={{ background: "radial-gradient(circle, rgba(201,162,39,0.07) 0%, transparent 70%)" }}
      />

      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(201,162,39,0.4), transparent)" }}
      />

      <div
        className={`flex flex-col items-center gap-10 z-10 transition-all duration-1000 ease-out ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        <div className="relative flex items-center justify-center">
          <div
            className="absolute w-45 h-45 rounded-full"
            style={{
              border: "1px solid rgba(201,162,39,0.12)",
              animation: "spin-slow 20s linear infinite",
            }}
          />
          {/* Outer ring 2 */}
          <div
            className="absolute w-39 h-39 rounded-full"
            style={{
              border: "1px solid rgba(201,162,39,0.18)",
              animation: "spin-slow 15s linear infinite reverse",
            }}
          />
          <div
            className="absolute w-32.5 h-32.5 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(201,162,39,0.15) 0%, transparent 70%)",
              boxShadow: "0 0 40px rgba(201,162,39,0.25), 0 0 80px rgba(201,162,39,0.1)",
              animation: "pulse-glow 3s ease-in-out infinite",
            }}
          />
          <div
            className="relative z-2 w-27.5 h-27.5 rounded-full flex items-center justify-center"
            style={{
              background: "radial-gradient(circle at 40% 40%, #1a2d4a, #0a1525)",
              border: "1.5px solid rgba(201,162,39,0.35)",
              boxShadow: "inset 0 0 30px rgba(0,0,0,0.5), 0 0 20px rgba(201,162,39,0.2)",
            }}
          >
            <GraduationCap
              size={46}
              style={{
                filter: "drop-shadow(0 0 8px rgba(201,162,39,0.8))",
                color: "#c9a227",
                animation: "float 4s ease-in-out infinite",
              }}
            />
          </div>
        </div>

        <div className="text-center flex flex-col items-center gap-3">
          <h1
            className="font-black tracking-widest m-0"
            style={{
              fontSize: "clamp(3rem, 8vw, 5.5rem)",
              color: "#c9a227",
              textShadow: "0 0 30px rgba(201,162,39,0.5), 0 0 60px rgba(201,162,39,0.2), 2px 2px 0px rgba(0,0,0,0.5)",
              fontFamily: "'Georgia', serif",
              animation: mounted ? "title-reveal 0.8s ease 0.3s both" : "none",
            }}
          >
            FOT EMS
          </h1>

          <div
            className="relative flex items-center gap-3 px-8 py-[0.45rem]"
            style={{ animation: mounted ? "title-reveal 0.8s ease 0.55s both" : "none" }}
          >
            <div
              className="absolute inset-0 rounded-sm"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(201,162,39,0.15), transparent)",
                border: "1px solid rgba(201,162,39,0.2)",
              }}
            />
            <div className="w-7.5 h-px" style={{ background: "linear-gradient(90deg, transparent, #c9a227)" }} />
            <span
              className="relative text-sm font-semibold tracking-[0.22em]"
              style={{ color: "#e8c84a", fontFamily: "'Georgia', serif" }}
            >
              Events Management System
            </span>
            <div className="w-7.5 h-px" style={{ background: "linear-gradient(90deg, #c9a227, transparent)" }} />
          </div>

          <p
            className="text-sm tracking-[0.18em] m-0"
            style={{
              color: "rgba(180,200,220,0.65)",
              fontFamily: "'Georgia', serif",
              animation: mounted ? "title-reveal 0.8s ease 0.75s both" : "none",
            }}
          >
            Faculty of Technology · University of Ruhuna
          </p>
        </div>

        <div
          className="flex gap-4 flex-wrap justify-center"
          style={{ animation: mounted ? "title-reveal 0.8s ease 1s both" : "none" }}
        >
          {[
            { icon: <Calendar size={14} />, label: "Event Scheduling" },
            { icon: <Users size={14} />, label: "Team Management" },
            { icon: <Award size={14} />, label: "Certificates" },
          ].map(({ icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-[0.4rem] px-4 py-[0.35rem] rounded-full text-[0.72rem] tracking-[0.12em] backdrop-blur-sm"
              style={{
                border: "1px solid rgba(201,162,39,0.2)",
                background: "rgba(201,162,39,0.05)",
                color: "rgba(201,162,39,0.75)",
              }}
            >
              {icon}
              {label}
            </div>
          ))}
        </div>

        <div style={{ animation: mounted ? "title-reveal 0.8s ease 1.2s both" : "none" }}>
          <Link to={"/home"}
            className="px-11 py-[0.85rem] font-bold tracking-[0.2em] text-[0.9rem] rounded-[3px] cursor-pointer transition-all duration-300 btn-color relative overflow-hidden border-none"
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 6px 30px rgba(201,162,39,0.55), 0 0 0 1px rgba(201,162,39,0.5)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(201,162,39,0.35), 0 0 0 1px rgba(201,162,39,0.3)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            GET STARTED
          </Link>
        </div>
      </div>

      <div
        className={`absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-[0.4rem] transition-opacity duration-1000 delay-[1.5s] ${mounted ? "opacity-40" : "opacity-0"}`}
        style={{ animation: "bounce 2s ease-in-out 2s infinite" }}
      >
        <span className="text-[0.6rem] tracking-[0.2em]" style={{ color: "#c9a227" }}>SCROLL</span>
        <ChevronDown size={14} color="#c9a227" />
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(201,162,39,0.3), transparent)" }}
      />
    </div>
  );
}