import React, { useState, useEffect } from 'react'
import { GraduationCap, User } from 'lucide-react'
import Modal from './model/Modal'
import Login from './Login'

function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [modal, setModal] = useState(null)
  const closeModal = () => setModal(null);
  
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    setMounted(true)
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-3 pb-2 transition-all duration-700">
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-[#c9a227]/35 to-transparent" />

        <div className={`w-full max-w-5xl transition-all duration-700 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'}`}>
          <div className={`flex items-center justify-between px-5 py-3 rounded-full border transition-all duration-400 backdrop-blur-xl saturate-150 
            ${scrolled 
              ? 'bg-[#091223]/88 border-[#c9a227]/30 shadow-[0_8px_48px_rgba(0,0,0,0.4),0_0_20px_rgba(201,162,39,0.06),inset_0_1px_0_rgba(201,162,39,0.12)]' 
              : 'bg-[#0a1628]/65 border-[#c9a227]/20 shadow-[0_4px_32px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(201,162,39,0.08)]'}`}>

            <div className="flex items-center gap-3 select-none">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-[radial-gradient(circle_at_40%_40%,#1a2d4a,#0a1525)] border border-[#c9a227]/30 shadow-[inset_0_0_12px_rgba(0,0,0,0.4),0_0_12px_rgba(201,162,39,0.15)]">
                <GraduationCap size={20} className="text-[#c9a227] drop-shadow-[0_0_8px_rgba(201,162,39,0.6)] animate-float" />
              </div>

              <div className="flex flex-col leading-none gap-0.5 font-serif">
                <span className="text-base font-black tracking-widest text-[#c9a227] [text-shadow:0_0_12px_rgba(201,162,39,0.4)]">
                  FOT <span className="text-[#e8c84a]">EMS</span>
                </span>
                <span className="text-[8px] tracking-[0.22em] uppercase text-slate-400/50">
                  Events Management
                </span>
              </div>
            </div>

            <div className="hidden sm:block flex-1 mx-8 h-px bg-linear-to-r from-[#c9a227]/10 via-[#c9a227]/20 to-[#c9a227]/10" />

            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <button 
                  className="group relative flex items-center justify-center w-10 h-10 rounded-full bg-[#c9a227]/10 border border-[#c9a227]/40 transition-all hover:bg-[#c9a227]/20 hover:border-[#c9a227] overflow-hidden"
                  onClick={() => console.log("Open Profile/Logout Menu")}
                >
                  <User size={20} className="text-[#c9a227] group-hover:scale-110 transition-transform" />
                  <div className="absolute inset-0 rounded-full shadow-[0_0_15px_rgba(201,162,39,0.2)]" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setModal("login")}
                className="btn-color font-bold text-xs px-6 py-2.5 rounded-sm tracking-[0.18em] shadow-[0_4px_18px_rgba(201,162,39,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.03] active:scale-[0.97]"
              >
                LOGIN
              </button>
            )}

          </div>
        </div>
      </header>

      {modal === "login" && (
        <Modal title="Login" onClose={closeModal}>
          <Login isLogged={setIsLoggedIn} onClose={closeModal}/>
        </Modal>
      )}

      <div className="h-20" />
    </>
  )
}

export default Header