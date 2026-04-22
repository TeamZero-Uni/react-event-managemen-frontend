import { useEffect, useState } from "react";
import {
  User,
  Hash,
  BookOpen,
  Building2,
  Mail,
  Phone,
  GraduationCap,
  ArrowRight,
  Calendar,
  MapPin,
  Users,
  CheckCircle,
  Lock,
} from "lucide-react";
import { useAuth } from "../hook/useAuth";
import api, { registerForEvent, getAllRegistrations, conformMail } from "../api/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const DEPARTMENTS = [
  "Department of Engineering Technology",
  "Department of Information & Communication Technology",
  "Department of Biosystems Technology",
];

const BATCHES = ["2021", "2022", "2023", "2024", "2025"];

function RegisterForm({ event, onClose }) {
  const { user, isAuthenticated } = useAuth();

  const [form, setForm] = useState({
    tgNumber: "",
    name: "",
    batch: "",
    department: "",
    email: "",
    tel: "",
  });
  const [focused, setFocused] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [registrationCount, setRegistrationCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isClosed, setIsClosed] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  useEffect(() => {
    const fetchRegistrationCount = async () => {
      try {
        setIsLoading(true);
        const res = await getAllRegistrations();

        const registrations = res.data || [];
        const eventRegistrations = registrations.filter(
          (r) => r.eventId === event?.id,
        );
        const count = eventRegistrations.length;

        setRegistrationCount(count);

        const eventDate = new Date(event?.eventDate);
        const now = new Date();

        const closingDate = new Date(
          eventDate.getTime() - 2 * 24 * 60 * 60 * 1000,
        );

        if (now >= closingDate) {
          setIsClosed(true);
        } else {
          setIsClosed(false);
        }

        if (event?.maxParticipants && count >= event.maxParticipants) {
          setIsClosed(true);
        }
      } catch (error) {
        console.error("Error fetching registration count:", error);
        toast.error("Failed to load registration status");
      } finally {
        setIsLoading(false);
      }
    };

    if (event?.id) {
      fetchRegistrationCount();
    }
  }, [event?.id, event?.maxParticipants, event?.eventDate]);

  const sendmail = async () => {
    navigate("/contact")
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isClosed) {
      toast.error("Registration for this event is closed");
      return;
    }

    const payload = {
      event_id: event?.id,
      username: user?.username,
      email: form.email,
      telNumber: form.tel,
      status: "APPROVED",
    };

    try {
      const res = await registerForEvent(payload);
      console.log(user);
      console.log(event);
      
      
      if (res.data?.success) {
        
        const conformData = {
          eventTitle: event.title,
          eventDate: event.eventDate,
          eventLocation: event.venue.placeName,
          studentName: user.fullname,
          studentEmail: form.email,
          studentTel: form.tel,
        }

        const emailsRes = await conformMail(conformData);

        toast.success(res.data.message || "Registration successful! Check your email for confirmation.");
        setSubmitted(true);

        if (typeof onClose === "function") {
          onClose();
        }
      } else {
        toast.error(res.data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  const inputBase =
    "w-full bg-[#060e1a]/80 text-white text-sm outline-none transition-all duration-300 placeholder:text-white/20 py-3 px-4 pl-11";

  const fieldBorder = (name) =>
    focused === name
      ? "border-[#c9a227]/60 shadow-[0_0_0_1px_rgba(201,162,39,0.15)] bg-[#060e1a]"
      : "border-[#c9a227]/15 hover:border-[#c9a227]/30";

  if (isLoading) {
    return (
      <div className="font-dm justify-center">
        <div
          className="relative p-8 backdrop-blur-xl flex items-center justify-center min-h-96"
          style={{
            background: "rgba(10,22,40,0.7)",
            border: "1px solid rgba(201,162,39,0.12)",
          }}
        >
          <div className="text-center">
            <div className="inline-block animate-spin">
              <CheckCircle size={32} style={{ color: "#c9a227" }} />
            </div>
            <p
              className="mt-4 font-dm text-sm"
              style={{ color: "rgba(201,162,39,0.7)" }}
            >
              Loading registration status...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="font-dm justify-center">
        {event && (
          <div
            className="relative mb-6 p-5 overflow-hidden"
            style={{
              background: "rgba(201,162,39,0.05)",
              border: "1px solid rgba(201,162,39,0.2)",
            }}
          >
            <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden">
              <div
                className="absolute top-0 right-0 w-0 h-0"
                style={{
                  borderStyle: "solid",
                  borderWidth: "0 32px 32px 0",
                  borderColor:
                    "transparent rgba(201,162,39,0.25) transparent transparent",
                }}
              />
            </div>
            <div className="flex items-start gap-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background:
                    "radial-gradient(circle at 40% 40%, #1a2d4a, #0a1525)",
                  border: "1px solid rgba(201,162,39,0.3)",
                }}
              >
                <Calendar size={16} style={{ color: "#c9a227" }} />
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="font-dm text-[9px] tracking-[0.3em] uppercase mb-1"
                  style={{ color: "rgba(201,162,39,0.5)" }}
                >
                  Registering for
                </div>
                <h3 className="font-playfair font-bold text-white text-lg leading-tight mb-2 truncate">
                  {event.title}
                </h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {event.date && (
                    <span
                      className="flex items-center gap-1.5 font-dm text-[10px] tracking-wider"
                      style={{ color: "rgba(201,162,39,0.6)" }}
                    >
                      <Calendar size={10} /> {event.date}
                    </span>
                  )}
                  {event.location && (
                    <span
                      className="flex items-center gap-1.5 font-dm text-[10px] tracking-wider"
                      style={{ color: "rgba(201,162,39,0.6)" }}
                    >
                      <MapPin size={10} /> {event.location}
                    </span>
                  )}
                  {event.time && (
                    <span
                      className="flex items-center gap-1.5 font-dm text-[10px] tracking-wider"
                      style={{ color: "rgba(201,162,39,0.6)" }}
                    >
                      <Users size={10} /> {event.time}
                    </span>
                  )}
                </div>

                {event?.maxParticipants && (
                  <div className="mt-3 pt-3 border-t border-[#c9a227]/20">
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="font-dm text-[9px] tracking-[0.2em] uppercase"
                        style={{ color: "rgba(201,162,39,0.6)" }}
                      >
                        Capacity
                      </span>
                      <span
                        className="font-dm text-[9px] font-bold"
                        style={{
                          color:
                            isClosed ||
                            registrationCount >= event.maxParticipants
                              ? "#ef4444"
                              : "#c9a227",
                        }}
                      >
                        {registrationCount}/{event.maxParticipants}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#c9a227]/10 rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-300"
                        style={{
                          width: `${(registrationCount / event.maxParticipants) * 100}%`,
                          background:
                            isClosed ||
                            registrationCount >= event.maxParticipants
                              ? "linear-gradient(90deg, #ef4444, #dc2626)"
                              : "linear-gradient(90deg, #c9a227, #a07c18)",
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {isClosed ? (
          <div
            className="relative p-8 backdrop-blur-xl"
            style={{
              background: "rgba(10,22,40,0.7)",
              border: "1px solid rgba(239,68,68,0.3)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
            }}
          >
            <div
              className="absolute top-0 left-8 right-8 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(239,68,68,0.4), transparent)",
              }}
            />

            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{
                    background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.3)",
                  }}
                >
                  <Lock size={24} style={{ color: "#ef4444" }} />
                </div>
              </div>

              <h2
                className="font-dm font-bold text-lg mb-2"
                style={{ color: "#ef4444" }}
              >
                Registration Closed
              </h2>

              <p
                className="font-dm text-[13px] leading-relaxed tracking-wide mb-3"
                style={{ color: "rgba(180,200,220,0.4)" }}
              >
                {registrationCount >= event?.maxParticipants
                  ? `This event has reached its maximum capacity of ${event?.maxParticipants} participants. No further registrations are being accepted at this time.`
                  : `Registration closed on ${new Date(
                      new Date(event?.eventDate).getTime() -
                        2 * 24 * 60 * 60 * 1000,
                    ).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })} (2 days before the event).`}
              </p>

              <div
                className="p-3 rounded-md mb-4"
                style={{
                  background: "rgba(239,68,68,0.05)",
                  border: "1px solid rgba(239,68,68,0.2)",
                }}
              >
                <p
                  className="font-dm text-[11px] tracking-wider"
                  style={{ color: "rgba(201,162,39,0.7)" }}
                >
                  Event Date:{" "}
                  <span style={{ color: "#c9a227", fontWeight: "bold" }}>
                    {new Date(event?.eventDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </p>
              </div>

              <button
                type="button"
                className="mb-2 inline-flex items-center justify-center gap-2 font-dm text-[10px] font-bold tracking-[0.24em] uppercase py-3 px-5 transition-all duration-300 active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #1a2d4a, #0a1525)",
                  color: "#c9a227",
                  border: "1px solid rgba(201,162,39,0.45)",
                  clipPath:
                    "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                  boxShadow: "0 4px 18px rgba(0,0,0,0.35)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 8px 28px rgba(201,162,39,0.28)";
                  e.currentTarget.style.filter = "brightness(1.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 4px 18px rgba(0,0,0,0.35)";
                  e.currentTarget.style.filter = "none";
                }}
                onClick={() => sendmail()}
              >
                Request To Join <ArrowRight size={12} />
              </button>

              <p
                className="font-dm text-[11px] tracking-wide"
                style={{ color: "rgba(201,162,39,0.5)" }}
              >
                Please check back later for upcoming events
              </p>
            </div>
          </div>
        ) : (
          <div
            className="relative p-8 backdrop-blur-xl"
            style={{
              background: "rgba(10,22,40,0.7)",
              border: "1px solid rgba(201,162,39,0.12)",
              boxShadow:
                "0 24px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(201,162,39,0.08)",
            }}
          >
            <div
              className="absolute top-0 left-8 right-8 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(201,162,39,0.4), transparent)",
              }}
            />

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="TG Number" icon={<Hash size={14} />}>
                  <input
                    name="tgNumber"
                    value={user?.username || form.tgNumber}
                    onChange={handleChange}
                    onFocus={() => setFocused("tgNumber")}
                    onBlur={() => setFocused("")}
                    placeholder="TG/21/XXX"
                    className={`${inputBase} border ${fieldBorder("tgNumber")}`}
                    required
                  />
                </Field>

                <Field label="Batch" icon={<BookOpen size={14} />}>
                  <select
                    name="batch"
                    value={user?.batch || form.batch}
                    onChange={handleChange}
                    onFocus={() => setFocused("batch")}
                    onBlur={() => setFocused("")}
                    className={`${inputBase} border ${fieldBorder("batch")} appearance-none cursor-pointer`}
                    required
                  >
                    <option value="" disabled>
                      Select...
                    </option>
                    {BATCHES.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Full Name" icon={<User size={14} />}>
                <input
                  name="name"
                  value={user?.fullname || form.name}
                  onChange={handleChange}
                  onFocus={() => setFocused("name")}
                  onBlur={() => setFocused("")}
                  placeholder="e.g. Kavindu Perera"
                  className={`${inputBase} border ${fieldBorder("name")}`}
                  required
                />
              </Field>

              <Field label="Department" icon={<Building2 size={14} />}>
                <select
                  name="department"
                  value={user?.department || form.department}
                  onChange={handleChange}
                  onFocus={() => setFocused("department")}
                  onBlur={() => setFocused("")}
                  className={`${inputBase} border ${fieldBorder("department")} appearance-none cursor-pointer`}
                  required
                >
                  <option value="" disabled>
                    Select department...
                  </option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Email" icon={<Mail size={14} />}>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused("")}
                    placeholder="you@ruh.ac.lk"
                    className={`${inputBase} border ${fieldBorder("email")}`}
                    required
                  />
                </Field>

                <Field label="Telephone" icon={<Phone size={14} />}>
                  <input
                    type="tel"
                    name="tel"
                    value={form.tel}
                    onChange={handleChange}
                    onFocus={() => setFocused("tel")}
                    onBlur={() => setFocused("")}
                    placeholder="+94 7X XXX XXXX"
                    className={`${inputBase} border ${fieldBorder("tel")}`}
                    required
                  />
                </Field>
              </div>

              <div className="py-1">
                <div
                  className="h-px"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(201,162,39,0.15), transparent)",
                  }}
                />
              </div>

              <p
                className="font-dm text-[10px] leading-relaxed tracking-wide text-center"
                style={{ color: "rgba(180,200,220,0.3)" }}
              >
                By registering, your details will be shared with the event
                organiser for coordination purposes.
              </p>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-3 font-dm text-[11px] font-bold tracking-[0.28em] uppercase py-4 transition-all duration-300 active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #c9a227, #a07c18)",
                  color: "#0a1525",
                  clipPath:
                    "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
                  boxShadow: "0 4px 20px rgba(201,162,39,0.3)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 8px 30px rgba(201,162,39,0.5)";
                  e.currentTarget.style.filter = "brightness(1.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 4px 20px rgba(201,162,39,0.3)";
                  e.currentTarget.style.filter = "none";
                }}
              >
                Confirm Registration <ArrowRight size={14} />
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}

function Field({ label, icon, children }) {
  return (
    <div className="space-y-1.5">
      <label
        className="flex items-center gap-1.5 font-dm text-[10px] font-bold tracking-[0.25em] uppercase"
        style={{ color: "#c9a227" }}
      >
        {icon} {label}
      </label>
      <div className="relative">
        <div
          className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "rgba(201,162,39,0.4)" }}
        >
          {icon}
        </div>
        {children}
      </div>
    </div>
  );
}

export default RegisterForm;
