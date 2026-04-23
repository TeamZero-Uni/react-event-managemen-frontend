import React, { useState } from "react";
import {
  FileUp,
  ClipboardList,
  Calendar,
  Users,
  Send,
  Info,
  Clock,
  MapPin,
  Tag,
  AlignLeft,
  Image,
  DollarSign,
  FileText,
} from "lucide-react";
import api, { createEvent } from "../api/api.js";
import { uploadFile } from "../utils/mediaUpload.js";
import toast from "react-hot-toast";
import { useEvents } from "../hook/useEvents";

function RegisterNewEvent() {
  const { events, refetchEvents } = useEvents();

  const venues = events
    ? [
        ...new Map(
          events.filter((e) => e.venue).map((e) => [e.venue.id, e.venue]),
        ).values(),
      ]
    : [];

  const [posterFile, setPosterFile] = useState(null);
  const [posterName, setPosterName] = useState("");
  const [docFile, setDocFile] = useState(null);
  const [docName, setDocName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    eventDate: "",
    startTime: "",
    endTime: "",
    maxParticipants: "",
    budget: "",
    type: "",
    placeName: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePosterChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPosterFile(file);
      setPosterName(file.name);
    }
  };

  const handleDocChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDocFile(file);
      setDocName(file.name);
    }
  };

  const uploadPdf = async (file) => {
    const formData = new FormData();
    formData.append("file", file); 
    const res = await api.post("files/upload-pdf", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let posterUrl = null;
      if (posterFile) {
        posterUrl = await uploadFile(posterFile);
      }

      let docPath = "";
      if (docFile) {
        docPath = await uploadPdf(docFile);
      }

      const eventData = {
        eventTitle: form.title.trim(),
        description: form.description.trim(),
        eventDate: form.eventDate,
        startTime: form.startTime,
        endTime: form.endTime,
        maxParticipants: Number(form.maxParticipants),
        budget: Number(form.budget),
        posterUrl,
        docPath,
        status: "PENDING",
        eventType: form.type, 
        venueName: form.placeName,
      };

      await createEvent(eventData);
      await refetchEvents?.();

      toast.success("Event submitted for approval!");

      setForm({
        title: "",
        description: "",
        eventDate: "",
        startTime: "",
        endTime: "",
        maxParticipants: "",
        budget: "",
        type: "",
        placeName: "",
      });
      setPosterFile(null);
      setPosterName("");
      setDocFile(null);
      setDocName("");
    } catch (err) {
      console.error(err);
      toast.error(err?.message ?? "Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
          <strong className="text-[#c9a227]">Note:</strong> All event requests
          must be submitted at least 14 days prior to the proposed date. Ensure
          all details are accurate before submission.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-0 bg-[#0d1f3c]/20 border border-[#c9a227]/10 rounded-sm overflow-hidden"
      >
        <SectionDivider label="Basic Information" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8">
          <div className={`md:col-span-2 ${fieldClass}`}>
            <label className={labelClass}>
              <ClipboardList size={13} /> Event Title
            </label>
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
            <label className={labelClass}>
              <AlignLeft size={13} /> Description
            </label>
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
            <label className={labelClass}>
              <Tag size={13} /> Event Type
            </label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className={inputClass}
              required
            >
              <option value="" disabled>
                Select type…
              </option>
              <option value="FESTIVAL">FESTIVAL</option>
            </select>
          </div>

          <div className={fieldClass}>
            <label className={labelClass}>
              <DollarSign size={13} /> Budget (LKR)
            </label>
            <input
              type="number"
              name="budget"
              value={form.budget}
              onChange={handleChange}
              placeholder="e.g. 50000.00"
              min={0}
              step="0.01"
              className={inputClass}
              required
            />
          </div>
        </div>

        <SectionDivider label="Schedule & Capacity" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8">
          <div className={fieldClass}>
            <label className={labelClass}>
              <Calendar size={13} /> Event Date
            </label>
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
            <label className={labelClass}>
              <Clock size={13} /> Start Time
            </label>
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
            <label className={labelClass}>
              <Clock size={13} /> End Time
            </label>
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
            <label className={labelClass}>
              <Users size={13} /> Max Capacity
            </label>
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

          <div className={`md:col-span-2 ${fieldClass}`}>
            <label className={labelClass}>
              <MapPin size={13} /> Venue
            </label>
            <select
              name="placeName"
              value={form.placeName}
              onChange={handleChange}
              className={inputClass}
              required
            >
              <option value="" disabled>
                Select venue…
              </option>
              {venues.length > 0 ? (
                venues.map((venue) => (
                  <option key={venue.id} value={venue.placeName}>
                    {venue.placeName}
                  </option>
                ))
              ) : (
                <option disabled>Loading venues…</option>
              )}
            </select>
          </div>
        </div>

        <SectionDivider label="Attachments" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8">
          <div className={fieldClass}>
            <label className={labelClass}>
              <Image size={13} /> Event Poster (JPG / PNG)
            </label>
            <div className="relative group cursor-pointer">
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handlePosterChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="border-2 border-dashed border-[#c9a227]/20 rounded-sm p-8 flex flex-col items-center justify-center gap-3 group-hover:bg-[#c9a227]/5 group-hover:border-[#c9a227]/40 transition-all">
                <FileUp
                  size={26}
                  className="text-slate-500 group-hover:text-[#c9a227] transition-colors"
                />
                <div className="text-center">
                  <p className="text-xs text-white tracking-widest uppercase font-bold truncate max-w-32">
                    {posterName || "Upload Poster"}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">
                    JPG, PNG or WEBP · Max 5MB
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className={fieldClass}>
            <label className={labelClass}>
              <FileText size={13} /> Supporting Document (PDF)
            </label>
            <div className="relative group cursor-pointer">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleDocChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="border-2 border-dashed border-[#c9a227]/20 rounded-sm p-8 flex flex-col items-center justify-center gap-3 group-hover:bg-[#c9a227]/5 group-hover:border-[#c9a227]/40 transition-all">
                <FileUp
                  size={26}
                  className="text-slate-500 group-hover:text-[#c9a227] transition-colors"
                />
                <div className="text-center">
                  <p className="text-xs text-white tracking-widest uppercase font-bold truncate max-w-32">
                    {docName || "Upload Document"}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">
                    PDF or DOC · Max 10MB
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 pb-8 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-3 btn-color font-bold text-xs tracking-[0.3em] py-4 rounded-sm hover:shadow-[0_8px_30px_rgba(201,162,39,0.3)] hover:brightness-105 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={15} />
            {isSubmitting ? "SUBMITTING…" : "SUBMIT FOR APPROVAL"}
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
