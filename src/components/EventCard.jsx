import { useState } from "react";
import { Calendar, MapPin, Clock, ArrowRight, Eye } from "lucide-react";
import Modal from "./model/Modal";
import RegisterForm from "./RegisterForm";
import EventView from "./view/EventView";
import { useAuth } from "../hook/useAuth";
import { useNavigate } from "react-router-dom";

function EventCard({ event }) {
  const [modal, setModal] = useState(null);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const formatTime = (timeValue) => {
    if (!timeValue) return "—";
    const [hh, mm] = String(timeValue).split(":");
    const hours = Number(hh);
    const minutes = Number(mm);

    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
      return String(timeValue);
    }

    const suffix = hours >= 12 ? "pm" : "am";
    const displayHour = hours % 12 || 12;
    return `${displayHour}.${String(minutes).padStart(2, "0")} ${suffix}`;
  };

  const closeModal = () => setModal(null);

  const handleSubmit = (event) => {
    if (!isAuthenticated) {
      navigate("/auth/login");
      return;
    }
    setModal({ type: "register-event", event });
  };

  return (
    <>
      <div className="group relative bg-[#0d1f3c]/40 border border-[#c9a227]/20 rounded-sm overflow-hidden backdrop-blur-md transition-all duration-500 hover:border-[#c9a227]/50 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.4),0_0_20px_rgba(201,162,39,0.1)]">
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={
              event.posterUrl ||
              "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1000"
            }
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />

          <div className="absolute inset-0 bg-[#c9a227]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute inset-0 bg-linear-to-t from-[#0d1f3c] via-transparent to-transparent" />

          <div className="absolute top-3 right-3 bg-primary/80 backdrop-blur-md border border-[#c9a227]/30 px-2 py-1 rounded-sm">
            <span className="text-[9px] text-[#c9a227] font-bold uppercase tracking-[0.2em]">
              {event.type}
            </span>
          </div>
        </div>

        <div className="h-1 w-full bg-linear-to-r from-transparent via-[#c9a227] to-transparent opacity-30 group-hover:opacity-100 transition-opacity" />

        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-[#c9a227]" />
            <p className="text-[#c9a227] text-[10px] font-bold tracking-[0.2em] uppercase">
              {event.eventDate}
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-serif font-bold text-white tracking-wide group-hover:text-[#c9a227] transition-colors line-clamp-1">
              {event.title}
            </h3>

            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed h-8">
              {event.description}
            </p>
          </div>

          <div className="pt-2 space-y-2 border-t border-[#c9a227]/10">
            <div className="flex items-center gap-2 text-slate-400">
              <Clock size={14} className="text-[#c9a227]/60" />
              <span className="text-[10px] uppercase tracking-wider">
                {formatTime(event.startTime)}
                {event.endTime ? ` - ${formatTime(event.endTime)}` : ""}
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-400">
              <MapPin size={14} className="text-[#c9a227]/60" />
              <span className="text-[10px] uppercase tracking-wider line-clamp-1">
                {event.venue.placeName}
              </span>
            </div>
          </div>

          <div className="flex gap-2 mt-2">
            {event.type !== "FESTIVAL" &&
              user?.role !== "ORGANIZER" &&
              user?.role !== "ADMIN" && (
                <button
                  onClick={() => handleSubmit(event)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 text-[10px] font-bold tracking-[0.2em] text-[#c9a227] border border-[#c9a227]/30 rounded-sm transition-all hover:bg-[#c9a227] hover:text-[#0a1525]"
                >
                  REGISTER NOW <ArrowRight size={12} />
                </button>
              )}

            <button
              onClick={() => setModal({ type: "view-event", event })}
              className={`${
                event.type !== "FESTIVAL" &&
                user?.role !== "ORGANIZER" &&
                user?.role !== "ADMIN"
                  ? "px-3"
                  : "flex-1"
              } flex items-center justify-center gap-2 py-2.5 text-[10px] font-bold tracking-[0.2em] text-slate-400 border border-slate-700/50 rounded-sm transition-all hover:border-[#c9a227]/30 hover:text-[#c9a227]`}
            >
              <Eye size={12} />

              {(event.type === "FESTIVAL" ||
                user?.role === "ORGANIZER" ||
                user?.role === "ADMIN") && (
                <span className="tracking-[0.2em]">VIEW DETAILS</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {modal?.type === "register-event" && (
        <Modal title="Event Registration" onClose={closeModal}>
          <RegisterForm event={modal.event} onClose={closeModal} />
        </Modal>
      )}

      {modal?.type === "view-event" && (
        <Modal title="Event Details" onClose={closeModal}>
          <EventView event={modal.event} />
        </Modal>
      )}
    </>
  );
}

export default EventCard;
