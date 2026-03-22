import React, { useState, useRef, useEffect } from 'react';
import { 
  User, Mail, Phone, Hash, BookOpen, 
  Building2, Save, CheckCircle, Camera, 
  UserCircle2, Calendar, MapPin, Clock 
} from 'lucide-react';
import { useAuth } from "../hook/useAuth";
import { updateProfile, getMyEvents } from "../api/api"; // Added getMyEvents
import EventCard from "../components/EventCard";

function StudentProfile() {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  // Profile States
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [avatarFile, setAvatarFile] = useState(null);

  // Events States
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    tel: user?.tel || "",
    department: user?.department || "",
    batch: user?.batch || "",
    tgNumber: user?.username || ""
  });

  // Fetch registered events on load
  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const data = await getMyEvents();
        setRegisteredEvents(data);
      } catch (err) {
        console.error("Error fetching registered events:", err);
      } finally {
        setLoadingEvents(false);
      }
    };
    fetchRegistrations();
  }, []);

  const getInitials = (name) => {
    if (!name) return "ST";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = new FormData();
      payload.append("name", form.name);
      payload.append("email", form.email);
      payload.append("tel", form.tel);
      if (avatarFile) payload.append("avatar", avatarFile);

      await updateProfile(payload);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
      setAvatarFile(null);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setAvatarPreview(user?.avatar || null);
    setAvatarFile(null);
    setForm({
      name: user?.name || "",
      email: user?.email || "",
      tel: user?.tel || "",
      department: user?.department || "",
      batch: user?.batch || "",
      tgNumber: user?.username || ""
    });
    setMessage({ type: '', text: '' });
  };

  const inputClass = "w-full bg-[#060e1a]/60 border border-[#c9a227]/20 rounded-sm py-3 px-4 text-sm text-white outline-none focus:border-[#c9a227]/60 focus:bg-[#060e1a]/80 transition-all placeholder:text-slate-600";
  const labelClass = "text-[10px] tracking-widest text-[#c9a227] font-bold uppercase flex items-center gap-2";

  return (
    <div className="py-12 max-w-4xl mx-auto space-y-16 px-4">

      {/* ── HEADER SECTION ── */}
      <div className="border-l-4 border-[#c9a227] pl-6 space-y-2">
        <h1 className="text-3xl font-serif font-bold text-white tracking-tight">
          Student <span className="text-[#c9a227]">Profile</span>
        </h1>
        <p className="text-slate-400 text-sm font-serif italic">
          Manage your academic identity and viewed your registered events.
        </p>
      </div>

      {/* ── MESSAGE TOAST ── */}
      {message.text && (
        <div className={`p-4 border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-red-500/10 border-red-500/50 text-red-400'} rounded-sm flex items-center gap-3 text-xs uppercase tracking-widest`}>
          <CheckCircle size={16} /> {message.text}
        </div>
      )}

      {/* ── PROFILE CARD ── */}
      <form onSubmit={handleSubmit} className="bg-[#0d1f3c]/20 border border-[#c9a227]/10 rounded-sm overflow-hidden shadow-2xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-8 py-8 border-b border-[#c9a227]/10 bg-[#0a1628]/30">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative w-fit">
              <div className="w-24 h-24 rounded-full border-2 border-[#c9a227]/40 overflow-hidden bg-[#060e1a]/60 flex items-center justify-center shadow-[0_0_20px_rgba(201,162,39,0.15)]">
                {avatarPreview 
                  ? <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                  : <span className="text-2xl font-bold text-[#c9a227] font-serif">{getInitials(form.name)}</span>
                }
              </div>
              {isEditing && (
                <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#c9a227] flex items-center justify-center hover:bg-[#e8c547] transition-all shadow-lg">
                  <Camera size={14} className="text-[#060e1a]" />
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            <div className="text-center md:text-left space-y-1">
              <p className="text-white font-serif font-bold text-xl leading-tight">{form.name}</p>
              <p className="text-[#c9a227] text-xs tracking-[0.2em] uppercase font-bold">{form.tgNumber}</p>
              <p className="text-slate-500 text-xs uppercase tracking-widest">{form.department} · Batch {form.batch}</p>
            </div>
          </div>

          <div className="flex gap-3">
            {!isEditing ? (
              <button type="button" onClick={() => setIsEditing(true)} className="btn-color font-bold text-[10px] tracking-[0.3em] px-8 py-3.5 rounded-sm transition-all">EDIT PROFILE</button>
            ) : (
              <>
                <button type="submit" className="btn-color font-bold text-[10px] tracking-[0.3em] px-8 py-3.5 rounded-sm transition-all">SAVE</button>
                <button type="button" onClick={handleCancel} className="px-6 py-3.5 border border-red-500/30 text-red-400 text-[10px] font-bold tracking-widest uppercase hover:bg-red-500/10 rounded-sm transition-all">CANCEL</button>
              </>
            )}
          </div>
        </div>

        <SectionDivider label="Personal Information" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
          <Field label="Full Name" icon={<User size={14}/>}><input name="name" value={form.name} onChange={handleChange} disabled={!isEditing} className={`${inputClass} ${!isEditing && 'opacity-50 cursor-not-allowed'}`} /></Field>
          <Field label="TG Number" icon={<Hash size={14}/>}><input value={form.tgNumber} disabled className={`${inputClass} opacity-50 cursor-not-allowed`} /></Field>
          <Field label="University Email" icon={<Mail size={14}/>}><input name="email" value={form.email} onChange={handleChange} disabled={!isEditing} className={`${inputClass} ${!isEditing && 'opacity-50 cursor-not-allowed'}`} /></Field>
          <Field label="Contact Number" icon={<Phone size={14}/>}><input name="tel" value={form.tel} onChange={handleChange} disabled={!isEditing} className={`${inputClass} ${!isEditing && 'opacity-50 cursor-not-allowed'}`} /></Field>
        </div>

        {/* --- ACADEMIC DETAILS (Matched to your image) --- */}
        <div className="px-8 py-4 bg-[#c9a227]/5 border-y border-[#c9a227]/10 flex items-center gap-4">
            <div className="w-[3px] h-4 bg-[#c9a227]" />
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#c9a227] font-bold">Academic Details</span>
            <div className="flex-1 h-px bg-[#c9a227]/10" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
          <div>
            <label className={labelClass}><Building2 size={12} /> Department</label>
            <input value={form.department} disabled className={`${inputClass} opacity-40 cursor-not-allowed`} />
          </div>
          <div>
            <label className={labelClass}><BookOpen size={12} /> Academic Batch</label>
            <input value={form.batch} disabled className={`${inputClass} opacity-40 cursor-not-allowed`} />
          </div>
        </div>
      </form>

      {/* ── REGISTERED EVENTS SECTION ── */}
      <div className="space-y-8">
        <div className="flex items-center justify-between border-b border-[#c9a227]/10 pb-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#c9a227]/10 flex items-center justify-center border border-[#c9a227]/30">
              <Calendar size={18} className="text-[#c9a227]" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-white tracking-wide">My <span className="text-[#c9a227]">Registrations</span></h2>
              <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">Events you have joined</p>
            </div>
          </div>
          <span className="text-[10px] bg-[#c9a227]/10 text-[#c9a227] px-3 py-1 border border-[#c9a227]/20 rounded-full font-bold uppercase tracking-widest">
            {registeredEvents.length} Active
          </span>
        </div>
        

        {loadingEvents ? (
          <div className="py-20 text-center flex flex-col items-center gap-4 border border-dashed border-[#c9a227]/10">
            <div className="w-8 h-8 border-2 border-[#c9a227] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] tracking-[0.3em] text-[#c9a227] uppercase">Retrieving your schedule...</p>
          </div>
        ) : registeredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {registeredEvents.map((event) => (
              <div key={event.id} className="relative transition-transform hover:-translate-y-1 duration-300">
                <div className="absolute top-4 right-4 z-20 bg-[#060e1a]/90 backdrop-blur-md border border-green-500/50 px-3 py-1 rounded-sm shadow-xl">
                  <p className="text-[9px] text-green-400 font-black uppercase tracking-[0.2em] flex items-center gap-1.5">
                    <CheckCircle size={10} /> Registered
                  </p>
                </div>
                <EventCard event={event} isRegistered={true} />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center border border-dashed border-[#c9a227]/20 rounded-sm bg-[#0d1f3c]/10">
            <p className="text-slate-500 font-serif italic text-sm mb-6">No active registrations found in your portal.</p>
            <button className="text-[#c9a227] text-[10px] tracking-[0.3em] font-black border border-[#c9a227]/30 px-6 py-3 hover:bg-[#c9a227] hover:text-[#060e1a] transition-all uppercase">
              Explore Events
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── UI HELPERS ──
function Field({ label, icon, children }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] tracking-widest text-[#c9a227] font-bold uppercase flex items-center gap-2">
        {icon} {label}
      </label>
      {children}
    </div>
  );
}

function SectionDivider({ label }) {
  return (
    <div className="flex items-center gap-4 px-8 py-3 bg-[#c9a227]/5 border-y border-[#c9a227]/10">
      <div className="w-1 h-4 bg-[#c9a227] rounded-full" />
      <span className="text-[10px] tracking-[0.25em] uppercase text-[#c9a227] font-bold">{label}</span>
      <div className="flex-1 h-px bg-[#c9a227]/10" />
    </div>
  );
}

export default StudentProfile;