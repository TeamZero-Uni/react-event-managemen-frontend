import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, CheckCircle2, Clock3, XCircle, Plus, Bell, Users } from 'lucide-react';
import { useEvents } from '../../hook/useEvents';
import { useAuth } from '../../hook/useAuth';

const FILTER_ALL = 'ALL';
const FILTER_APPROVED = 'APPROVED';
const FILTER_PENDING = 'PENDING';
const FILTER_REJECTED = 'REJECTED';
const FILTER_CANCELED = 'CANCELED';
const FILTER_UPCOMING = 'UPCOMING';

const normalizeStatus = (s) => String(s ?? '').trim().toUpperCase();
const isApproved = (s) => {
  const n = normalizeStatus(s);
  return n === 'APPROVED' || n === 'ACCEPTED' || n === 'ACCEPT';
};
const isPending = (s) => normalizeStatus(s) === 'PENDING';
const isCanceled = (s) => {
  const n = normalizeStatus(s);
  return n === 'CANCELED' || n === 'CANCELLED';
};
const isRejected = (s) => {
  const n = normalizeStatus(s);
  return n === 'REJECTED' || n === 'REJECT' || n === 'DECLINED' || n === 'DENIED';
};

const parseEventDate = (event) => {
  const raw = event?.eventDate ?? event?.event_date ?? event?.date;
  if (!raw) return null;
  const d = new Date(raw);
  if (!Number.isNaN(d.getTime())) return d;
  const fallback = new Date(`${raw}T00:00:00`);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
};

const formatEventDate = (parsedDate) => {
  if (!parsedDate) return 'Date not set';
  return parsedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const formatTime = (time) => {
  if (!time) return 'N/A';
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

const getStatusTone = (status) => {
  if (isApproved(status)) return 'bg-green-500/15 border-green-500/30 text-green-200';
  if (isPending(status)) return 'bg-yellow-500/15 border-yellow-500/30 text-yellow-200';
  if (isCanceled(status)) return 'bg-orange-500/15 border-orange-500/30 text-orange-200';
  if (isRejected(status)) return 'bg-red-500/15 border-red-500/30 text-red-200';
  return 'bg-white/10 border-white/20 text-white/80';
};

const getEventImage = (event) =>
  event?.posterUrl || event?.poster_url || event?.imageUrl || event?.image_url || '';

const AnimatedCounter = ({ target, active }) => {
  const [value, setValue] = useState(0);
  const frameRef = useRef(null);

  useEffect(() => {
    if (active) return;
    if (frameRef.current) cancelAnimationFrame(frameRef.current);

    const duration = 1300;
    const startTime = performance.now();

    const animate = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, active]);

  return <>{value}</>;
};

export default function DashboardPage() {
  const { events, loading, error } = useEvents();
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState(FILTER_ALL);

  const currentUserId = user?.id ?? user?.userId ?? user?.user_id;
  const currentUserEmail = String(user?.email ?? '').trim().toLowerCase();
  const currentUsername = String(user?.username ?? '').trim().toLowerCase();

  const myEvents = useMemo(() => {
    return (events || []).filter((event) => {
      const creator = event?.createdBy || event?.created_by || event?.creator || event?.organizer || {};
      const creatorId =
        creator?.id ??
        creator?.userId ??
        creator?.user_id ??
        event?.createdById ??
        event?.created_by_id ??
        event?.organizerId ??
        event?.organizer_id ??
        event?.userId ??
        event?.user_id;

      const creatorEmail = String(creator?.email ?? event?.organizerEmail ?? '').trim().toLowerCase();
      const creatorUsername = String(creator?.username ?? event?.organizerUsername ?? '').trim().toLowerCase();

      if (currentUserId && creatorId) return String(currentUserId) === String(creatorId);
      if (currentUsername && creatorUsername) return currentUsername === creatorUsername;
      if (currentUserEmail && creatorEmail) return currentUserEmail === creatorEmail;
      return false;
    });
  }, [events, currentUserId, currentUsername, currentUserEmail]);

  const eventsWithDates = useMemo(() => {
    return myEvents.map((event) => ({
      ...event,
      _parsedDate: parseEventDate(event),
    }));
  }, [myEvents]);

  const sortedEvents = useMemo(() => {
    return [...eventsWithDates].sort((a, b) => {
      if (a._parsedDate && b._parsedDate) return a._parsedDate - b._parsedDate;
      if (a._parsedDate) return -1;
      if (b._parsedDate) return 1;
      return String(a?.title || '').localeCompare(String(b?.title || ''));
    });
  }, [eventsWithDates]);

  const counts = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let approved = 0;
    let pending = 0;
    let canceled = 0;
    let upcoming = 0;

    sortedEvents.forEach((event) => {
      const s = event?.status;
      if (isApproved(s)) approved++;
      else if (isPending(s)) pending++;
      else if (isCanceled(s)) canceled++;
      if (isApproved(s) && event._parsedDate && event._parsedDate >= today) upcoming++;
    });

    return { approved, pending, canceled, upcoming };
  }, [sortedEvents]);

  const filteredEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (activeFilter) {
      case FILTER_APPROVED:
        return sortedEvents.filter((e) => isApproved(e?.status));
      case FILTER_PENDING:
        return sortedEvents.filter((e) => isPending(e?.status));
      case FILTER_CANCELED:
        return sortedEvents.filter((e) => isCanceled(e?.status));
      case FILTER_REJECTED:
        return sortedEvents.filter((e) => isRejected(e?.status));
      case FILTER_UPCOMING:
        return sortedEvents.filter((e) => isApproved(e?.status) && e._parsedDate && e._parsedDate >= today);
      default:
        return sortedEvents;
    }
  }, [activeFilter, sortedEvents]);

  const activeFilterLabel = {
    [FILTER_ALL]: 'All My Events',
    [FILTER_APPROVED]: 'Approved Events',
    [FILTER_PENDING]: 'Pending Events',
    [FILTER_CANCELED]: 'Canceled Events',
    [FILTER_REJECTED]: 'Rejected Events',
    [FILTER_UPCOMING]: 'Upcoming Events',
  }[activeFilter];

  const activeFilterHint = activeFilter === FILTER_UPCOMING ? 'Nearest date first' : 'Click cards above to switch list';

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white/40">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-secondary border-t-transparent" />
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full min-h-full space-y-8 text-white relative">
      <div className="absolute top-0 right-0 p-4">
        <button
          type="button"
          className="relative p-2.5 rounded-lg border border-secondary/40 text-secondary hover:text-accent hover:border-accent transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent" />
        </button>
      </div>

      <div className="rounded-3xl border border-secondary/30 bg-Dashboard p-8 shadow-[0_12px_30px_rgba(0,0,0,0.25)]">
        <h1 className="text-4xl font-bold text-white mb-2">
          Welcome back, {user?.fullname || user?.name || user?.username || 'Organizer'}!
        </h1>
        <p className="text-secondary/90 text-xl mb-6">
          Manage your events and create new ones for the Faculty of Technology.
        </p>
        <Link
          to="/organizer/create-event"
          className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-secondary hover:bg-accent text-primary font-bold text-xl transition-colors"
        >
          <Plus size={20} />
          Create New Event
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/organizer/create-event"
          className="rounded-2xl border border-secondary/20 bg-primary/60 p-5 hover:border-secondary/50 hover:bg-secondary/10 transition-colors"
        >
          <Plus size={20} className="text-secondary" />
          <p className="mt-3 text-lg font-bold text-white">Create Event</p>
          <p className="mt-1 text-sm text-white/45">Start a new event request</p>
        </Link>
        <Link
          to="/organizer/my-events"
          className="rounded-2xl border border-secondary/20 bg-primary/60 p-5 hover:border-secondary/50 hover:bg-secondary/10 transition-colors"
        >
          <Calendar size={20} className="text-secondary" />
          <p className="mt-3 text-lg font-bold text-white">My Events</p>
          <p className="mt-1 text-sm text-white/45">Review and edit your events</p>
        </Link>
        <Link
          to="/organizer/generate-report"
          className="rounded-2xl border border-secondary/20 bg-primary/60 p-5 hover:border-secondary/50 hover:bg-secondary/10 transition-colors"
        >
          <Users size={20} className="text-secondary" />
          <p className="mt-3 text-lg font-bold text-white">Generate Report</p>
          <p className="mt-1 text-sm text-white/45">Download event participation details</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5">
        {[
          {
            filter: FILTER_ALL,
            icon: <Calendar className="text-secondary" size={28} />,
            iconBg: 'bg-secondary/10 border-secondary/30',
            label: 'My Events',
            labelColor: 'text-secondary/80',
            count: <AnimatedCounter target={sortedEvents.length} active={loading} />,
            countColor: 'text-white',
            activeBorder: 'border-secondary/60 ring-1 ring-secondary/60 bg-primary',
            inactiveBorder: 'border-secondary/20 bg-primary',
          },
          {
            filter: FILTER_APPROVED,
            icon: <CheckCircle2 className="text-green-300" size={28} />,
            iconBg: 'bg-green-500/20 border-green-500/35',
            label: 'Approved',
            labelColor: 'text-green-200',
            count: <AnimatedCounter target={counts.approved} active={loading} />,
            countColor: 'text-green-100',
            activeBorder: 'border-green-400/70 ring-1 ring-green-400/70 bg-green-500/15',
            inactiveBorder: 'border-green-500/30 bg-green-500/10',
          },
          {
            filter: FILTER_PENDING,
            icon: <Clock3 className="text-yellow-300" size={28} />,
            iconBg: 'bg-yellow-500/20 border-yellow-500/35',
            label: 'Pending',
            labelColor: 'text-yellow-200',
            count: <AnimatedCounter target={counts.pending} active={loading} />,
            countColor: 'text-yellow-100',
            activeBorder: 'border-yellow-300/80 ring-1 ring-yellow-300/70 bg-yellow-500/15',
            inactiveBorder: 'border-yellow-500/35 bg-yellow-500/10',
          },
          {
            filter: FILTER_CANCELED,
            icon: <XCircle className="text-orange-300" size={28} />,
            iconBg: 'bg-orange-500/20 border-orange-500/35',
            label: 'Canceled',
            labelColor: 'text-orange-200',
            count: <AnimatedCounter target={counts.canceled} active={loading} />,
            countColor: 'text-orange-100',
            activeBorder: 'border-orange-400/70 ring-1 ring-orange-400/70 bg-orange-500/15',
            inactiveBorder: 'border-orange-500/35 bg-orange-500/10',
          },
          {
            filter: FILTER_UPCOMING,
            icon: <Calendar className="text-sky-300" size={28} />,
            iconBg: 'bg-sky-500/20 border-sky-500/35',
            label: 'Upcoming',
            labelColor: 'text-sky-200',
            count: <AnimatedCounter target={counts.upcoming} active={loading} />,
            countColor: 'text-sky-100',
            activeBorder: 'border-sky-400/70 ring-1 ring-sky-400/70 bg-sky-500/15',
            inactiveBorder: 'border-sky-500/35 bg-sky-500/10',
          },
        ].map(({ filter, icon, iconBg, label, labelColor, count, countColor, activeBorder, inactiveBorder }) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActiveFilter(filter)}
            className={`rounded-2xl border p-6 flex items-center gap-4 text-left transition-all hover:-translate-y-0.5 ${
              activeFilter === filter ? activeBorder : inactiveBorder
            }`}
          >
            <div className={`h-14 w-14 rounded-2xl border flex items-center justify-center ${iconBg}`}>{icon}</div>
            <div>
              <p className={`text-sm ${labelColor}`}>{label}</p>
              <p className={`text-4xl leading-none font-bold mt-1 ${countColor}`}>{count}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-secondary/25 bg-Dashboard p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-white">{activeFilterLabel}</h2>
            <p className="text-xs tracking-wider uppercase text-white/45">{activeFilterHint}</p>
          </div>
          <span className="rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1 text-xs font-bold text-secondary">
            {filteredEvents.length} Events
          </span>
        </div>

        {filteredEvents.length === 0 ? (
          <p className="rounded-xl border border-dashed border-white/15 bg-primary/40 px-4 py-8 text-center text-sm text-white/45">
            No events found for this category.
          </p>
        ) : (
          <div className="space-y-3">
            {filteredEvents.map((event) => (
              <div key={event?.event_id || event?.id} className="rounded-xl border border-white/10 bg-primary/50 p-3">
                <div className="flex items-start gap-3">
                  {getEventImage(event) ? (
                    <img
                      src={getEventImage(event)}
                      alt={`${event?.title || 'Event'} poster`}
                      className="h-20 w-32 rounded-lg border border-white/10 object-cover bg-white/5 shrink-0"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="h-20 w-32 rounded-lg border border-dashed border-white/15 bg-white/5 flex items-center justify-center text-[10px] text-white/40 shrink-0">
                      No Image
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold text-white">{event?.title || 'Untitled Event'}</h3>
                        <p className="mt-1 text-xs text-white/50">Event ID: {event?.event_id || event?.id || 'N/A'}</p>
                      </div>
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${getStatusTone(
                          event?.status
                        )}`}
                      >
                        {event?.status || 'UNKNOWN'}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-white/70 sm:grid-cols-2 lg:grid-cols-4">
                      <p>
                        <span className="text-white/40">Date: </span>
                        {formatEventDate(event._parsedDate)}
                      </p>
                      <p>
                        <span className="text-white/40">Venue: </span>
                        {event?.venue?.placeName || event?.venueName || 'N/A'}
                      </p>
                      <p>
                        <span className="text-white/40">Time: </span>
                        {formatTime(event?.startTime || event?.eventTime || event?.time)}
                      </p>
                      <p className="inline-flex items-center gap-1.5">
                        <Users size={14} className="text-white/40" />
                        <span className="text-white/40">Capacity: </span>
                        {event?.maxParticipants ?? event?.participantLimit ?? event?.capacity ?? 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
