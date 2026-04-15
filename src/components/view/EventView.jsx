import React from 'react';
import { Calendar, Clock, MapPin, Users, Mail, Building2, CheckCircle2, Timer, XCircle } from 'lucide-react';

const statusConfig = {
  ACCEPTED:  { label: 'Accepted',  style: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' },
  PENDING:   { label: 'Pending',   style: 'text-amber-400 bg-amber-400/10 border-amber-400/30'       },
  REJECTED:  { label: 'Rejected',  style: 'text-red-400 bg-red-400/10 border-red-400/30'             },
  CANCELLED: { label: 'Cancelled', style: 'text-slate-400 bg-slate-400/10 border-slate-400/30'       },
};

function Chip({ icon: Icon, label, value, accent }) {
  return (
    <div className={`flex items-center gap-2.5 p-2.5 rounded-sm border ${accent ?? 'bg-[#c9a227]/8 border-[#c9a227]/18'}`}>
      <Icon size={13} className="text-[#c9a227]/60 shrink-0" />
      <div className="min-w-0">
        <p className="text-[8px] tracking-[0.2em] uppercase text-slate-500 font-serif m-0">{label}</p>
        <p className="text-[11px] text-slate-200 font-serif truncate m-0">{value ?? '—'}</p>
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-2.5 mb-2.5">
      <span className="text-[8px] tracking-[0.28em] uppercase text-[#c9a227]/55 font-serif font-bold whitespace-nowrap">
        {children}
      </span>
      <div className="flex-1 h-px bg-[#c9a227]/18" />
    </div>
  );
}

function EventView({ event }) {
  const status = statusConfig[event?.status] ?? statusConfig.PENDING;
  const maxCapacity = event?.maxParticipants ?? event?.max_participants;
  const venueCapacity = event?.venue?.capacity ?? event?.capacity;

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatTime = (t) => {
    if (!t) return '—';
    const [hh, mm] = String(t).split(':');
    const hours = Number(hh);
    const minutes = Number(mm);

    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return t;

    const suffix = hours >= 12 ? 'pm' : 'am';
    const displayHour = hours % 12 || 12;
    return `${displayHour}.${String(minutes).padStart(2, '0')} ${suffix}`;
  };

  const duration = () => {
    if (!event?.startTime || !event?.endTime) return '—';
    const [sh, sm] = event.startTime.split(':').map(Number);
    const [eh, em] = event.endTime.split(':').map(Number);
    const diff = (eh * 60 + em) - (sh * 60 + sm);
    const hrs = Math.floor(diff / 60), mins = diff % 60;
    return hrs > 0 ? `${hrs}h${mins > 0 ? ` ${mins}m` : ''}` : `${mins}m`;
  };

  const initials = (name) =>
    name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() ?? '??';

  return (
    <div className="font-serif text-slate-300">

      <div className="relative -mx-6 -mt-5 mb-5 h-40 overflow-hidden">
        <img
          src={event?.posterUrl || 'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=900'}
          alt={event?.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-primary via-primary/50 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-r from-primary/30 to-transparent" />

        <div className="absolute top-3 left-4 flex gap-2">
          <span className="text-[8px] font-bold tracking-[0.2em] uppercase bg-primary/85 border border-[#c9a227]/25 text-[#c9a227] px-2.5 py-1">
            {event?.type}
          </span>
          <span className={`text-[8px] font-bold tracking-[0.15em] uppercase px-2.5 py-1 border rounded-sm ${status.style}`}>
            {status.label}
          </span>
        </div>

        <div className="absolute bottom-3 left-4 right-4">
          <h2 className="m-0 text-xl font-bold text-white tracking-wide leading-snug drop-shadow-lg line-clamp-2">
            {event?.title}
          </h2>
        </div>
      </div>

      {event?.description && (
        <p className="text-xs text-slate-400 leading-relaxed border-l-2 border-[#c9a227]/25 pl-3 mb-5">
          {event.description}
        </p>
      )}

      <div className="mb-4">
        <SectionLabel>Schedule</SectionLabel>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Chip icon={Calendar} label="Date"     value={formatDate(event?.eventDate)} />
          <Chip icon={Timer}    label="Duration" value={duration()} />
          <Chip icon={Clock}    label="Start"    value={formatTime(event?.startTime)} />
          <Chip icon={Clock}    label="End"      value={formatTime(event?.endTime)} />
        </div>
      </div>

      <div className="mb-4">
        <SectionLabel>Venue</SectionLabel>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <Chip icon={MapPin} label="Location"         value={event?.placeName} />
          <Chip
            icon={Users}
            label="Venue Capacity"
            value={venueCapacity ? `${venueCapacity} seats` : '—'}
          />
          <Chip
            icon={Users}
            label="Max Capacity"
            value={maxCapacity ? `${maxCapacity} seats` : '—'}
          />
        </div>
      </div>

      <div className="mb-4">
        <SectionLabel>Organizer</SectionLabel>
        <div className="flex items-center gap-3 bg-[#c9a227]/8 border border-[#c9a227]/18 rounded-sm p-3">
          <div className="w-10 h-10 rounded-full bg-[#c9a227]/15 border border-[#c9a227]/35 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-[#c9a227]">{initials(event?.fullname)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] text-slate-200 font-semibold mb-1 truncate">{event?.createdBy?.fullname ?? '—'}</p>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5">
              <span className="flex items-center gap-1 text-[9px] text-slate-500">
                <Building2 size={9} className="text-[#c9a227]/50" />
                {event?.createdBy?.department ?? '—'}
              </span>
              <span className="flex items-center gap-1 text-[9px] text-slate-500">
                <Mail size={9} className="text-[#c9a227]/50" />
                {event?.createdBy?.email ?? '—'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="h-px bg-linear-to-r from-transparent via-[#c9a227]/20 to-transparent mt-2 mb-2.5" />
      <p className="text-[8px] tracking-[0.2em] text-[#1e3a5f] uppercase text-center">
        University of Ruhuna · Faculty of Technology
      </p>
    </div>
  );
}

export default EventView;