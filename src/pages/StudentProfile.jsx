import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  User, Mail, Phone, Hash, CheckCircle, Camera, 
  Calendar, Info, Clock, AlertCircle, BellRing, Bell, X, CheckCircle2 
} from 'lucide-react';
import { useAuth } from "../hook/useAuth";
import { updateProfile, getMyEvents, getStudentProfile, getMyNotifications, markNotificationAsRead } from "../api/api";
import EventCard from "../components/EventCard";
import { uploadFile } from "../utils/mediaUpload";

function StudentProfile() {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  // Profile States
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [originalData, setOriginalData] = useState(null);

  // Events & Notifications States
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [notifications, setNotifications] = useState([]); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Form State
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    tel: user?.tel || "",
    department: user?.department || "",
    batch: user?.batch || "",
    tgNumber: user?.username || ""
  });

  // Fetch Dashboard Data & Setup Polling
  useEffect(() => {
    // Function to fetch only notifications silently in the background
    const fetchNotificationsSilent = async () => {
      try {
        const notifRes = await getMyNotifications();
        if (notifRes.success && notifRes.data) {
          // Sort notifications by date (newest first)
          const sortedNotifs = notifRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          // Limit the notifications to a maximum of 10
          setNotifications(sortedNotifs.slice(0, 10));
        }
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    // Function to fetch all initial data (Events + Notifications) on page load
    const fetchInitialData = async () => {
      try {
        setLoadingEvents(true);
        const eventRes = await getMyEvents();
        if (eventRes.success && eventRes.data) {
          setRegisteredEvents(eventRes.data);
        } else if (Array.isArray(eventRes)) {
          setRegisteredEvents(eventRes);
        }
        await fetchNotificationsSilent();
      } catch (err) {
        console.error("Error fetching initial dashboard data:", err);
      } finally {
        setLoadingEvents(false);
      }
    };
    
    // Load initial data
    fetchInitialData();

    // ── SHORT POLLING (Checks every 5 seconds) ──
    const intervalId = setInterval(() => {
      fetchNotificationsSilent();
    }, 5000); // 5000ms = 5 Seconds

    // Clear interval on component unmount to prevent memory leaks
    return () => clearInterval(intervalId);
  }, []);

  // Fetch Profile Data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const res = await getStudentProfile();
        if (res.success && res.data) {
          const profileData = res.data;
          setOriginalData(profileData); 
          
          setForm({
            name: profileData.name || "",
            email: profileData.email || "",
            tel: profileData.tel || "",
            department: profileData.department || "",
            batch: profileData.batch || "",
            tgNumber: profileData.tgNumber || ""
          });
          setAvatarPreview(profileData.avatar || null);
        }
      } catch (error) {
        console.error("Error fetching profile details:", error);
      }
    };
    fetchProfileData();
  }, []);

  // Handlers
  const getInitials = (name) => {
    if (!name) return "ST";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleMarkAsRead = async (e, notifId) => {
    e.stopPropagation(); 
    try {
      await markNotificationAsRead(notifId);
      // Immediately update the local state to hide the button and unread status
      setNotifications(prevNotifications => 
        prevNotifications.map(n => 
          n.id === notifId ? { ...n, isRead: true } : n
        )
      );
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  const validateForm = () => {
    let newErrors = {};
    if (!form.name.trim()) newErrors.name = "Full Name is required";
    else if (form.name.trim().length < 3) newErrors.name = "Name must be at least 3 characters";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!emailRegex.test(form.email)) newErrors.email = "Please enter a valid email format";

    const phoneRegex = /^0[0-9]{9}$/;
    if (!form.tel.trim()) newErrors.tel = "Contact Number is required";
    else if (!phoneRegex.test(form.tel)) newErrors.tel = "Must be a 10-digit number (e.g., 0712345678)";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setMessage({ type: 'error', text: 'Please fix the errors in the form' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }
    setIsUploading(true);
    try {
      let finalAvatarUrl = null;
      if (avatarFile) finalAvatarUrl = await uploadFile(avatarFile);
      
      const payload = new FormData();
      payload.append("name", form.name);
      payload.append("email", form.email);
      payload.append("tel", form.tel);
      if (finalAvatarUrl) payload.append("avatar", finalAvatarUrl);

      await updateProfile(payload);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
      setAvatarFile(null);
      setIsUploading(false);

      const res = await getStudentProfile();
      if (res.success && res.data) {
        setOriginalData(res.data);
        setForm({
          name: res.data.name || "",
          email: res.data.email || "",
          tel: res.data.tel || "",
          department: res.data.department || "",
          batch: res.data.batch || "",
          tgNumber: res.data.tgNumber || ""
        });
        setAvatarPreview(res.data.avatar || null);
      }
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error("Update Error:", error);
      setIsUploading(false);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrors({}); 
    setAvatarFile(null);
    setMessage({ type: '', text: '' });
    if (originalData) {
      setForm({
        name: originalData.name || "",
        email: originalData.email || "",
        tel: originalData.tel || "",
        department: originalData.department || "",
        batch: originalData.batch || "",
        tgNumber: originalData.tgNumber || ""
      });
      setAvatarPreview(originalData.avatar || null);
    }
  };

  const getDynamicInputClass = (editable, hasError) => {
    const baseClass = "w-full rounded-sm py-3 px-4 text-sm text-white outline-none transition-all duration-300 placeholder:text-slate-600";
    if (!isEditing || !editable) return `${baseClass} bg-[#060e1a]/40 border border-transparent opacity-50 cursor-not-allowed`;
    if (hasError) return `${baseClass} bg-red-500/5 border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.15)] focus:border-red-500 focus:bg-[#060e1a]`;
    return `${baseClass} bg-[#060e1a]/80 border border-[#c9a227]/60 shadow-[0_0_15px_rgba(201,162,39,0.15)] focus:border-[#c9a227] focus:bg-[#060e1a]`;
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="py-12 max-w-4xl mx-auto space-y-16 px-4">
      <div className="flex items-start justify-between">
        <div className="border-l-4 border-[#c9a227] pl-6 space-y-2">
          <h1 className="text-3xl font-serif font-bold text-white tracking-tight">
            Student <span className="text-[#c9a227]">Profile</span>
          </h1>
          <p className="text-slate-400 text-sm font-serif italic">
            Manage your academic identity and view your registered events.
          </p>
        </div>

        <div className="pr-2 pt-1">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="relative p-3 bg-[#c9a227]/10 hover:bg-[#c9a227]/20 border border-[#c9a227]/30 rounded-full transition-all group shadow-[0_0_15px_rgba(201,162,39,0.15)]"
            title="View Updates"
          >
            <Bell size={22} className="text-[#c9a227] group-hover:scale-110 transition-transform" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse border-2 border-[#060e1a]">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`p-4 border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-red-500/10 border-red-500/50 text-red-400'} rounded-sm flex items-center gap-3 text-xs uppercase tracking-widest transition-all duration-300`}>
          {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />} 
          {message.text}
        </div>
      )}

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
                <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#c9a227] flex items-center justify-center hover:bg-[#e8c547] transition-all shadow-lg animate-pulse">
                  <Camera size={14} className="text-[#060e1a]" />
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            <div className="text-center md:text-left space-y-1">
              <p className="text-white font-serif font-bold text-xl leading-tight">{form.name || "Loading..."}</p>
              <p className="text-[#c9a227] text-xs tracking-[0.2em] uppercase font-bold">{form.tgNumber}</p>
              <p className="text-slate-500 text-xs uppercase tracking-widest">{form.department || "Loading..."} {form.batch && `· Batch ${form.batch}`}</p>
            </div>
          </div>

          <div className="flex gap-3">
            {!isEditing ? (
              <button type="button" onClick={(e) => { e.preventDefault(); setIsEditing(true); }} className="bg-[#c9a227] text-[#060e1a] font-bold text-[10px] tracking-[0.3em] px-8 py-3.5 rounded-sm transition-all hover:bg-[#e8c547]">
                EDIT PROFILE
              </button>
            ) : (
              <>
                <button disabled={isUploading} type="submit" className="bg-[#c9a227] text-[#060e1a] font-bold text-[10px] tracking-[0.3em] px-8 py-3.5 rounded-sm transition-all hover:bg-[#e8c547] disabled:opacity-50 disabled:cursor-not-allowed">
                  {isUploading ? 'SAVING...' : 'SAVE'}
                </button>
                <button type="button" onClick={(e) => { e.preventDefault(); handleCancel(); }} className="px-6 py-3.5 border border-red-500/30 text-red-400 text-[10px] font-bold tracking-widest uppercase hover:bg-red-500/10 rounded-sm transition-all">
                  CANCEL
                </button>
              </>
            )}
          </div>
        </div>

        <SectionDivider label="Personal Information" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
          <Field label="Full Name" icon={<User size={14}/>}>
            <input name="name" value={form.name} onChange={handleChange} disabled={!isEditing} className={getDynamicInputClass(true, errors.name)} placeholder="Enter your full name" />
          </Field>
          <Field label="TG Number" icon={<Hash size={14}/>}>
            <input value={form.tgNumber} disabled className={getDynamicInputClass(false, false)} placeholder="Loading..." title="Cannot edit TG Number" />
          </Field>
          <Field label="University Email" icon={<Mail size={14}/>}>
            <input name="email" value={form.email} onChange={handleChange} disabled={!isEditing} className={getDynamicInputClass(true, errors.email)} placeholder="name@ems.com" />
          </Field>
          <Field label="Contact Number" icon={<Phone size={14}/>}>
            <input name="tel" value={form.tel} onChange={handleChange} disabled={!isEditing} className={getDynamicInputClass(true, errors.tel)} placeholder="07XXXXXXXX" />
          </Field>
        </div>
      </form>

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {registeredEvents.map((event, index) => (
              <div key={event.id || index} className="relative">
                <div className="absolute top-4 left-4 z-20 bg-[#060e1a]/90 backdrop-blur-md border border-green-500/50 px-3 py-1 rounded-sm shadow-xl pointer-events-none">
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
          </div>
        )}
      </div>

      {createPortal(
        <>
          <div 
            className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
            onClick={() => setIsSidebarOpen(false)}
          />

          <div 
            className={`fixed top-0 right-0 h-full w-80 md:w-[450px] bg-[#060e1a] border-l border-[#c9a227]/20 z-[9999] shadow-[[-20px_0_40px_rgba(0,0,0,0.8)]] transform transition-transform duration-300 ease-in-out flex flex-col ${
              isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="flex items-center justify-between p-6 border-b border-[#c9a227]/10 bg-[#0a1628] shrink-0">
              <div className="flex items-center gap-3">
                <BellRing size={20} className="text-[#c9a227]" />
                <h2 className="text-[#c9a227] font-serif font-bold tracking-[0.2em] uppercase text-xs">
                  Recent Updates
                </h2>
              </div>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {notifications.length > 0 ? (
                notifications.map((notif) => {
                  let badgeText = "SYSTEM";
                  let badgeStyle = "bg-blue-500/10 text-blue-400 border-blue-500/30";
                  
                  // STRICT ID LOGIC FOR BADGES
                  if (notif.eventId != null && notif.eventReferenceId != null) {
                    badgeText = "UPDATED";
                    badgeStyle = "bg-green-500/10 text-green-400 border-green-500/30";
                  } else if (notif.eventId == null && notif.eventReferenceId != null) {
                    badgeText = "DELETED";
                    badgeStyle = "bg-red-500/10 text-red-400 border-red-500/30";
                  } else if (notif.eventId != null && notif.eventReferenceId == null) {
                    badgeText = "EVENT INFO";
                    badgeStyle = "bg-[#c9a227]/10 text-[#c9a227] border-[#c9a227]/30";
                  }

                  return (
                    <div 
                      key={notif.id} 
                      className={`relative flex flex-col p-5 bg-[#0a1628]/40 border ${!notif.isRead ? 'border-[#c9a227]/50 shadow-[0_0_15px_rgba(201,162,39,0.1)]' : 'border-[#c9a227]/10'} rounded-sm hover:bg-[#0a1628] transition-all overflow-hidden group`}
                    >
                      {!notif.isRead && (
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#c9a227] shadow-[0_0_10px_#c9a227]" />
                      )}
                      
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          <Info size={18} className={!notif.isRead ? "text-[#c9a227]" : "text-slate-600"} />
                        </div>
                        
                        <div className="space-y-3 w-full">
                          <div className="flex items-center">
                             <span className={`text-[8px] px-2 py-0.5 border rounded-sm font-bold tracking-widest uppercase ${badgeStyle}`}>
                               {badgeText}
                             </span>
                          </div>

                          <p className={`text-sm leading-relaxed ${!notif.isRead ? 'text-white font-medium' : 'text-slate-400'}`}>
                            {notif.message}
                          </p>
                          
                          <div className="flex items-center gap-3 text-[9px] uppercase tracking-widest text-slate-500 font-bold">
                            <span className="flex items-center gap-1.5">
                              <Calendar size={10} className={!notif.isRead ? "text-[#c9a227]/70" : "text-slate-600"} />
                              {new Date(notif.createdAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1.5 border-l border-slate-700 pl-3">
                              <Clock size={10} className={!notif.isRead ? "text-[#c9a227]/70" : "text-slate-600"} />
                              {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                        </div>
                      </div>

                      {!notif.isRead && (
                        <div className="mt-4 pt-3 border-t border-[#c9a227]/10 flex justify-end">
                          <button 
                            onClick={(e) => handleMarkAsRead(e, notif.id)}
                            className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-[#c9a227] hover:text-white transition-colors"
                          >
                            <CheckCircle2 size={12} /> Mark as read
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center border border-dashed border-[#c9a227]/20 rounded-sm bg-[#0d1f3c]/10 m-2">
                  <p className="text-slate-500 font-serif italic text-sm">No new updates right now.</p>
                </div>
              )}
            </div>
          </div>
        </>,
        document.body
      )}

    </div>
  );
}

function Field({ label, icon, children }) {
  return (
    <div className="space-y-2 relative">
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