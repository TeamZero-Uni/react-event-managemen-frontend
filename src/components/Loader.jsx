export default function Loader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#060e1a]">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(201,162,39,0.07) 0%, transparent 70%)",
        }}
      />

      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-[#c9a227]/40 to-transparent" />

      <div className="relative flex flex-col items-center gap-6">
        <div className="relative flex items-center justify-center">
          <div
            className="absolute w-24 h-24 rounded-full border border-dashed border-[#c9a227]/30 animate-spin"
            style={{ animationDuration: "8s" }}
          />
          <div className="absolute w-16 h-16 rounded-full border border-[#c9a227]/20 animate-pulse" />
          <div className="w-12 h-12 rounded-full border border-[#c9a227]/50 bg-[#c9a227]/10 flex items-center justify-center">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#c9a227"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
        </div>

        <div className="text-center mt-5 space-y-1">
          <h1 className="text-[#c9a227] font-serif text-base font-bold tracking-[0.25em] uppercase">
            University of Ruhuna
          </h1>
          <p className="text-slate-500 text-[10px] tracking-[0.3em] uppercase font-serif">
            Faculty Portal
          </p>
        </div>

        <div className="w-48 h-px bg-[#c9a227]/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-transparent via-[#c9a227] to-transparent rounded-full"
            style={{
              animation: "slide 1.8s ease-in-out infinite",
              width: "50%",
            }}
          />
        </div>

        <p className="text-[10px] tracking-[0.3em] text-slate-500 uppercase font-serif animate-pulse">
          Authenticating…
        </p>
      </div>

      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-linear-to-r from-transparent via-[#c9a227]/20 to-transparent" />

      <style>{`
        @keyframes slide {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  );
}
