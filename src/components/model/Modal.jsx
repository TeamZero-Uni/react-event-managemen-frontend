import { FiX } from "react-icons/fi";

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-[#060e1a]/80 backdrop-blur-md px-4">
      <div 
        className="relative w-full max-w-2xl rounded-sm border border-[#c9a227]/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0a1628 0%, #0d1f3c 100%)",
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-[#c9a227]/50 to-transparent" />

        <div className="flex items-center justify-between p-5 border-b border-[#c9a227]/10 bg-[#0a1525]/50">
          <h2 className="text-sm font-serif font-bold tracking-[0.15em] text-[#c9a227] uppercase">
            {title}
          </h2>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-sm hover:bg-[#c9a227]/10 text-[#c9a227]/70 hover:text-[#c9a227] transition-all duration-300 border border-transparent hover:border-[#c9a227]/20"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="p-6 text-slate-300 font-serif leading-relaxed">
          {children}
        </div>

        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-linear-to-r from-transparent via-[#c9a227]/20 to-transparent" />
      </div>
    </div>
  );
}

export default Modal;