import React, { useState } from 'react';
import { FileUp, ClipboardList, Calendar, Users, Send, Info, Clock, MapPin, Tag, AlignLeft, Image } from 'lucide-react';

function RegisterNewEvent() {
  const [posterName, setPosterName] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    eventDate: "",
    startTime: "",
    endTime: "",
    maxParticipants: "",
    posterUrl: "",
    status: "PENDING",
    type: "",
    venueId: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePosterChange = (e) => {
    if (e.target.files[0]) {
      setPosterName(e.target.files[0].name);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting:", form);
  };

  const inputClass =
    "w-full bg-[#060e1a]/60 border border-[#c9a227]/20 rounded-sm py-3 px-4 text-sm text-white outline-none focus:border-[#c9a227]/60 focus:bg-[#060e1a]/80 transition-all placeholder:text-slate-600 [color-scheme:dark]";

  const labelClass =
    "text-[10px] tracking-widest text-[#c9a227] font-bold uppercase flex items-center gap-2";

  const fieldClass = "space-y-2";

  return (
    <div className="py-12 max-w-4xl mx-auto space-y-10 px-4">

      <div className="border-l-4 border-[#c9a227] pl-6 space-y-2">
        <h1 className="text-3xl font-serif font-bold text-white tracking-tight">
          Event <span className="text-[#c9a227]">Requisition</span>
        </h1>
        <p className="text-slate-400 text-sm font-serif italic">
          Submit a formal proposal for faculty review and approval.
        </p>
      </div>

      <div className="flex gap-4 p-4 bg-[#c9a227]/5 border border-[#c9a227]/20 rounded-sm">
        <Info className="text-[#c9a227] shrink-0 mt-0.5" size={18} />
        <p className="text-[11px] text-slate-400 leading-relaxed uppercase tracking-wider">
          <strong className="text-[#c9a227]">Note:</strong> All event requests must be submitted at least 14 days prior to the proposed date. Ensure all details are accurate before submission.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-0 bg-[#0d1f3c]/20 border border-[#c9a227]/10 rounded-sm overflow-hidden">

        <SectionDivider label="Basic Information" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8">

          <div className={`md:col-span-2 ${fieldClass}`}>
            <label className={labelClass}><ClipboardList size={13} /> Event Title</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Annual Tech Symposium"
              className={inputClass}
              required
            />
          </div>

          <div className={`md:col-span-2 ${fieldClass}`}>
            <label className={labelClass}><AlignLeft size={13} /> Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Provide a detailed overview of the event objectives, activities, and expected outcomes..."
              rows={4}
              className={`${inputClass} resize-none leading-relaxed`}
              required
            />
          </div>

          <div className={fieldClass}>
            <label className={labelClass}><Tag size={13} /> Event Type</label>
            <select name="type" value={form.type} onChange={handleChange} className={inputClass} required>
              <option value="" disabled>Select type…</option>
              <option value="WORKSHOP">Workshop</option>
              <option value="SEMINAR">Seminar</option>
              <option value="CONFERENCE">Conference</option>
              <option value="COMPETITION">Competition</option>
              <option value="CULTURAL">Cultural</option>
              <option value="SPORTS">Sports</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className={fieldClass}>
            <label className={labelClass}><Info size={13} /> Status</label>
            <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

        </div>

        <SectionDivider label="Schedule & Capacity" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8">

          <div className={fieldClass}>
            <label className={labelClass}><Calendar size={13} /> Event Date</label>
            <input
              type="date"
              name="eventDate"
              value={form.eventDate}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>

          <div className={fieldClass}>
            <label className={labelClass}><Clock size={13} /> Start Time</label>
            <input
              type="time"
              name="startTime"
              value={form.startTime}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>

          <div className={fieldClass}>
            <label className={labelClass}><Clock size={13} /> End Time</label>
            <input
              type="time"
              name="endTime"
              value={form.endTime}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>

          <div className={fieldClass}>
            <label className={labelClass}><Users size={13} /> Max Capacity</label>
            <input
              type="number"
              name="maxParticipants"
              value={form.maxParticipants}
              onChange={handleChange}
              placeholder="e.g. 150"
              min={1}
              className={inputClass}
              required
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className={labelClass}><MapPin size={13} /> Venue</label>
            <select name="venueId" value={form.venueId} onChange={handleChange} className={inputClass} required>
              <option value="" disabled>Select venue…</option>
              <option value="1">Main Auditorium</option>
              <option value="2">Lecture Hall A</option>
              <option value="3">Open Grounds</option>
              <option value="4">IT Lab Complex</option>
            </select>
          </div>

        </div>

        <SectionDivider label="Event Poster" />

        <div className="p-8 space-y-2">
          <label className={labelClass}><Image size={13} /> Upload Poster (JPG / PNG)</label>
          <div className="relative group cursor-pointer">
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={handlePosterChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="border-2 border-dashed border-[#c9a227]/20 rounded-sm p-10 flex flex-col items-center justify-center gap-3 group-hover:bg-[#c9a227]/5 group-hover:border-[#c9a227]/40 transition-all">
              <FileUp
                size={30}
                className="text-slate-500 group-hover:text-[#c9a227] transition-colors"
              />
              <div className="text-center">
                <p className="text-xs text-white tracking-widest uppercase font-bold">
                  {posterName ? posterName : "Click to upload poster"}
                </p>
                <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">
                  JPG, PNG or WEBP · Max 5MB
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 pb-8 pt-2">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-3 btn-color font-bold text-xs tracking-[0.3em] py-4 rounded-sm hover:shadow-[0_8px_30px_rgba(201,162,39,0.3)] hover:brightness-105 transition-all active:scale-[0.98]"
          >
            <Send size={15} />
            SUBMIT FOR APPROVAL
          </button>
        </div>

      </form>
    </div>
  );
}

function SectionDivider({ label }) {
  return (
    <div className="flex items-center gap-4 px-8 py-3 bg-[#c9a227]/5 border-y border-[#c9a227]/10">
      <div className="w-1 h-4 bg-[#c9a227] rounded-full" />
      <span className="text-[10px] tracking-[0.25em] uppercase text-[#c9a227] font-bold">
        {label}
      </span>
      <div className="flex-1 h-px bg-[#c9a227]/10" />
    </div>
  );
}

export default RegisterNewEvent;