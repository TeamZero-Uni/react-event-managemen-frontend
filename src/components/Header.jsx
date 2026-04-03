import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { GraduationCap, User, PlusCircle, Menu, X, LogOut } from "lucide-react";
import { useAuth } from "../hook/useAuth";

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, logoutUser } = useAuth();
  const { user } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logoutUser();
    navigate("/home");
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-3 pb-2 transition-all duration-700">
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-[#c9a227]/35 to-transparent" />

        <div
          className={`w-full max-w-6xl transition-all duration-700 ease-out ${mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"}`}
        >
          <div
            className={`flex items-center justify-between px-5 py-3 rounded-full border transition-all duration-400 backdrop-blur-xl saturate-150 
            ${
              scrolled
                ? "bg-[#091223]/90 border-[#c9a227]/30 shadow-[0_8px_48px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(201,162,39,0.1)]"
                : "bg-primary/70 border-[#c9a227]/20 shadow-[0_4px_32px_rgba(0,0,0,0.3)]"
            }`}
          >
            <Link
              to="/home"
              className="flex items-center gap-3 select-none group"
            >
              <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-[radial-gradient(circle_at_40%_40%,#1a2d4a,#0a1525)] border border-[#c9a227]/30 shadow-[inset_0_0_12px_rgba(0,0,0,0.4)] group-hover:border-[#c9a227]/60 transition-all">
                <GraduationCap
                  size={20}
                  className="text-[#c9a227] drop-shadow-[0_0_8px_rgba(201,162,39,0.6)] animate-float"
                />
              </div>
              <div className="flex flex-col leading-none gap-0.5 font-serif">
                <span className="text-base font-black tracking-widest text-[#c9a227]">
                  FOT <span className="text-[#e8c84a]">EMS</span>
                </span>
                <span className="text-[8px] tracking-[0.22em] uppercase text-slate-400/60">
                  Events Management
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              {[
                { name: "Home", path: "/home" },
                { name: "About", path: "/about" },
                { name: "Contact", path: "/contact" },
              ].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-[10px] tracking-[0.25em] uppercase font-bold transition-all hover:text-[#c9a227] relative
                    ${isActive(link.path) ? "text-[#c9a227]" : "text-slate-400"}`}
                >
                  {link.name}
                  {isActive(link.path) && (
                    <span className="absolute -bottom-1 left-0 right-0 h-px bg-[#c9a227] shadow-[0_0_8px_#c9a227]" />
                  )}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => navigate("/register-event")}
                    className="hidden lg:flex items-center gap-2 px-4 py-2 border border-[#c9a227]/40 rounded-sm text-[9px] font-bold tracking-[0.2em] text-[#c9a227] hover:bg-[#c9a227]/10 transition-all uppercase"
                  >
                    <PlusCircle size={14} /> Req Event
                  </button>

                  <button
                    onClick={handleLogout}
                    className="hidden lg:flex items-center gap-2 px-4 py-2 border border-red-500/30 rounded-sm text-[9px] font-bold tracking-[0.2em] text-red-400/80 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400 transition-all uppercase"
                  >
                    <LogOut size={14} />
                  </button>

                  <div className="flex items-center gap-3 border-l border-slate-700/50 pl-3">
                    <button
                      className="group relative flex items-center justify-center w-10 h-10 rounded-full bg-[#c9a227]/10 border border-[#c9a227]/40 transition-all hover:bg-[#c9a227]/20"
                      onClick={() => {
                        if (user?.role === "STUDENT")
                          navigate("/student-profile");
                        else if (user?.role === "ORGANIZER")
                          navigate("/organizer");
                        else if (user?.role === "ADMIN")
                          navigate("/admin/profile");
                      }}
                    >
                      <User
                        size={18}
                        className="text-[#c9a227] group-hover:scale-110 transition-transform"
                      />
                      <div className="absolute inset-0 rounded-full shadow-[inset_0_0_10px_rgba(201,162,39,0.1)]" />
                    </button>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => navigate("/auth/login")}
                  className="btn-color font-serif font-bold text-[10px] px-6 py-2.5 rounded-sm tracking-[0.2em] shadow-[0_4px_20px_rgba(201,162,39,0.3)] transition-all hover:-translate-y-0.5 active:scale-95"
                >
                  LOGIN
                </button>
              )}

              <button
                className="md:hidden p-2 text-[#c9a227]"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden mt-4 mx-4 p-6 rounded-2xl bg-primary/95 border border-[#c9a227]/20 backdrop-blur-2xl animate-in fade-in slide-in-from-top-4">
              <div className="flex flex-col gap-6 items-center">
                <Link
                  to="/home"
                  className="text-xs tracking-[0.3em] font-bold text-[#c9a227] uppercase"
                >
                  Home
                </Link>
                <Link
                  to="/about"
                  className="text-xs tracking-[0.3em] font-bold text-slate-400 uppercase"
                >
                  About
                </Link>
                <Link
                  to="/contact"
                  className="text-xs tracking-[0.3em] font-bold text-slate-400 uppercase"
                >
                  Contact
                </Link>
                {isAuthenticated && (
                  <>
                    <button
                      onClick={() => navigate("/register-event")}
                      className="w-full py-3 border border-[#c9a227]/40 text-[#c9a227] text-xs font-bold tracking-widest uppercase"
                    >
                      Request New Event
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full py-3 border border-red-500/30 text-red-400/80 text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-red-500/10 transition-all"
                    >
                      <LogOut size={14} /> Logout
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>
      <div className="h-24" />
    </>
  );
}

export default Header;
