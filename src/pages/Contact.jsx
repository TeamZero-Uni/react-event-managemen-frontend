import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, Clock, CheckCircle, AlertCircle, Loader } from "lucide-react";
import { contactEmail } from "../api/api";

function Contact() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.fullName || !formData.email || !formData.subject || !formData.message) {
      setStatus("error");
      setErrorMessage("Please fill in all fields before submitting.");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const formatData = {
        name: formData.fullName,
        from: formData.email,
        subject: formData.subject,
        body: formData.message,
      };

      const res = await contactEmail(formatData);
      console.log(res);
      setStatus("success");
      setFormData({ fullName: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error(error);
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again later.");
    }
  };

  return (
    <div className="py-12 space-y-16">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column */}
        <div className="space-y-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#c9a227] mb-4">
              Get in <span className="text-white">Touch.</span>
            </h1>
            <p className="text-slate-400 font-serif italic text-lg leading-relaxed">
              Have questions regarding a specific event or faculty partnership?
              Our administrative team is here to assist you.
            </p>
          </div>

          <div className="space-y-6">
            <h3 className="text-[10px] tracking-[0.3em] text-[#c9a227] font-bold uppercase">
              Direct Channels
            </h3>

            <div className="flex items-start gap-4 group">
              <div className="p-3 rounded-sm bg-[#c9a227]/5 border border-[#c9a227]/20 text-[#c9a227] group-hover:bg-[#c9a227] group-hover:text-[#0a1525] transition-all">
                <Mail size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Email Us</p>
                <p className="text-sm text-white font-serif">events@tec.ruh.ac.lk</p>
              </div>
            </div>

            <div className="flex items-start gap-4 group">
              <div className="p-3 rounded-sm bg-[#c9a227]/5 border border-[#c9a227]/20 text-[#c9a227] group-hover:bg-[#c9a227] group-hover:text-[#0a1525] transition-all">
                <Phone size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Call Us</p>
                <p className="text-sm text-white font-serif">+94 41 222 3344</p>
              </div>
            </div>

            <div className="flex items-start gap-4 group">
              <div className="p-3 rounded-sm bg-[#c9a227]/5 border border-[#c9a227]/20 text-[#c9a227] group-hover:bg-[#c9a227] group-hover:text-[#0a1525] transition-all">
                <MapPin size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Location</p>
                <p className="text-sm text-white font-serif">
                  Faculty of Technology, Karagoda-Uyangoda, Kamburupitiya.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-[#0d1f3c]/40 border border-[#c9a227]/10 rounded-sm space-y-3">
            <div className="flex items-center gap-2 text-[#c9a227]">
              <Clock size={16} />
              <span className="text-[10px] font-bold tracking-widest uppercase">Office Hours</span>
            </div>
            <p className="text-xs text-slate-400 font-serif leading-relaxed">
              Monday — Friday: 8:30 AM - 4:30 PM
              <br />
              Closed on Weekends & Public Holidays
            </p>
          </div>
        </div>

        {/* Right Column — Form */}
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSubmit}
            className="bg-[#0d1f3c]/20 border border-[#c9a227]/20 p-8 rounded-sm space-y-6"
          >
            {/* Success Banner */}
            {status === "success" && (
              <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-sm text-green-400">
                <CheckCircle size={16} />
                <p className="text-xs tracking-wide">
                  Your message has been sent successfully. We'll get back to you soon.
                </p>
              </div>
            )}

            {/* Error Banner */}
            {status === "error" && (
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-sm text-red-400">
                <AlertCircle size={16} />
                <p className="text-xs tracking-wide">{errorMessage}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] tracking-widest text-[#c9a227] uppercase">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full bg-[#060e1a]/50 border border-[#c9a227]/20 rounded-sm py-3 px-4 text-sm text-white outline-none focus:border-[#c9a227] transition-all"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] tracking-widest text-[#c9a227] uppercase">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-[#060e1a]/50 border border-[#c9a227]/20 rounded-sm py-3 px-4 text-sm text-white outline-none focus:border-[#c9a227] transition-all"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] tracking-widest text-[#c9a227] uppercase">
                Subject
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full bg-[#060e1a]/50 border border-[#c9a227]/20 rounded-sm py-3 px-4 text-sm text-white outline-none focus:border-[#c9a227] transition-all"
                placeholder="Inquiry regarding Robo-Challenge"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] tracking-widest text-[#c9a227] uppercase">
                Your Message
              </label>
              <textarea
                rows="5"
                name="message"
                value={formData.message}
                onChange={handleChange}
                className="w-full bg-[#060e1a]/50 border border-[#c9a227]/20 rounded-sm py-3 px-4 text-sm text-white outline-none focus:border-[#c9a227] transition-all resize-none"
                placeholder="How can we help you?"
              />
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              className="flex items-center gap-3 btn-color font-bold text-xs tracking-[0.2em] px-8 py-4 rounded-sm hover:scale-[1.02] transition-all active:scale-[0.98] shadow-[0_4px_20px_rgba(201,162,39,0.2)] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
            >
              {status === "loading" ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  SENDING...
                </>
              ) : (
                <>
                  <Send size={16} />
                  SEND DISPATCH
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Map */}
      <div className="h-96 w-full rounded-sm border border-[#c9a227]/20 grayscale hover:grayscale-0 transition-all duration-700 overflow-hidden relative group">
        <div className="absolute inset-0 bg-[#c9a227]/5 mix-blend-overlay pointer-events-none group-hover:opacity-0 transition-opacity" />
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4329.1179835870735!2d80.53943407537115!3d6.063483993922462!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae141585ad5987d%3A0x717cf948bd5444ff!2sFaculty%20of%20Technology%20-%20University%20of%20Ruhuna!5e1!3m2!1sen!2sus!4v1773233785029!5m2!1sen!2sus"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Faculty Location"
          className="opacity-80 group-hover:opacity-100 transition-opacity"
        ></iframe>
        <div className="absolute bottom-4 left-4 bg-primary/95 p-4 border border-[#c9a227]/30 backdrop-blur-md shadow-xl pointer-events-none">
          <p className="text-[10px] font-bold tracking-[0.2em] text-[#c9a227] uppercase mb-1">
            Main Campus Hub
          </p>
          <p className="text-[11px] text-white font-serif">
            Karagoda-Uyangoda, Kamburupitiya 81100
          </p>
        </div>
      </div>
    </div>
  );
}

export default Contact;