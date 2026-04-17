import React, { useEffect, useMemo, useState } from 'react';
import { getAllRegistrations, getALlstudent, getAllUsers } from '../../api/api';
import { useEvents } from '../../hook/useEvents';

const yearTabs = ['All Years', 'Year 1', 'Year 2', 'Year 3', 'Year 4'];

const getEventKey = (event) => String(event?.event_id ?? event?.eventId ?? event?.id ?? '');
const isAcceptedEvent = (event) => {
  const status = String(event?.status ?? '').trim().toUpperCase();
  return status === 'ACCEPT' || status === 'ACCEPTED' || status === 'APPROVED';
};
const getRegistrationEventKey = (registration) =>
  String(
    registration?.event_id ??
      registration?.eventId ??
      registration?.event?.event_id ??
      registration?.event?.eventId ??
      registration?.event?.id ??
      '',
  );
const getRegistrationUserKey = (registration) =>
  String(
    registration?.user_id ??
      registration?.userId ??
      registration?.user?.userId ??
      registration?.user?.user_id ??
      registration?.user?.id ??
      '',
  );
const getEntityUserKey = (entity) => String(entity?.userId ?? entity?.user_id ?? entity?.id ?? '');

const getYearFromYearOrBatch = (year, batch) => {
  const yearText = String(year ?? '').trim();
  if (yearText) {
    const lower = yearText.toLowerCase();
    const yearNumber = yearText.match(/\d+/)?.[0];
    if (lower.startsWith('year') && yearNumber) return `Year ${yearNumber}`;
    if (yearNumber) {
      const n = Number(yearNumber);
      if (Number.isFinite(n) && n >= 1 && n <= 4) return `Year ${n}`;
    }
  }
  const batchText = String(batch ?? '').trim();
  if (!batchText) return 'N/A';
  const directYear = batchText.match(/(?:year|y)\s*([1-4])|\b([1-4])\b/i);
  const directNum = directYear?.[1] ?? directYear?.[2];
  if (directNum) return `Year ${directNum}`;
  const yearMatch = batchText.match(/\b(20\d{2}|\d{2})\b/);
  if (yearMatch) {
    const raw = yearMatch[1];
    const admissionYear = raw.length === 2 ? 2000 + Number(raw) : Number(raw);
    if (Number.isFinite(admissionYear)) {
      const diff = new Date().getFullYear() - admissionYear + 1;
      if (diff >= 1 && diff <= 4) return `Year ${diff}`;
    }
  }
  return 'N/A';
};

const mapDepartment = (dept) => {
  if (!dept) return 'N/A';
  const d = dept.toUpperCase();
  if (d.includes('INFORMATION') || d.includes('ICT') || d === 'IT') return 'IT';
  if (d.includes('ENGINEERING') || d === 'ET') return 'ET';
  if (d.includes('BUSINESS') || d === 'BST') return 'BST';
  return dept;
};

// Avatar initials from name
const getInitials = (name) => {
  if (!name || name === 'Unknown') return '?';
  const parts = name.trim().split(' ');
  return parts.length >= 2
    ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    : parts[0][0].toUpperCase();
};

// Soft color per initial for avatar bg
const avatarColor = (name) => {
  const colors = [
    'bg-violet-500/20 text-violet-300',
    'bg-sky-500/20 text-sky-300',
    'bg-emerald-500/20 text-emerald-300',
    'bg-amber-500/20 text-amber-300',
    'bg-rose-500/20 text-rose-300',
    'bg-indigo-500/20 text-indigo-300',
  ];
  const code = (name ?? '').charCodeAt(0) || 0;
  return colors[code % colors.length];
};

const deptBadgeColor = (dept) => {
  if (dept === 'IT')  return 'bg-sky-500/15 text-sky-300 border-sky-500/20';
  if (dept === 'ET')  return 'bg-violet-500/15 text-violet-300 border-violet-500/20';
  if (dept === 'BST') return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20';
  return 'bg-white/8 text-white/60 border-white/10';
};

const yearBadgeColor = (year) => {
  if (year === 'Year 1') return 'bg-amber-500/15 text-amber-300';
  if (year === 'Year 2') return 'bg-sky-500/15 text-sky-300';
  if (year === 'Year 3') return 'bg-violet-500/15 text-violet-300';
  if (year === 'Year 4') return 'bg-rose-500/15 text-rose-300';
  return 'bg-white/8 text-white/50';
};

const getEventMaxParticipants = (event) => {
  const raw = event?.maxParticipants ?? event?.max_participants;
  if (raw == null || raw === '') return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
};

export default function ParticipantsPage() {
  const { events, loading: eventsLoading } = useEvents();
  const acceptedEvents = useMemo(() => events.filter(isAcceptedEvent), [events]);

  const [registrations, setRegistrations] = useState([]);
  const [students, setStudents]           = useState([]);
  const [users, setUsers]                 = useState([]);
  const [loading, setLoading]             = useState(true);

  const [selectedEventId, setSelectedEventId] = useState(null);
  const [selectedYear, setSelectedYear]       = useState('All Years');
  const [selectedDept, setSelectedDept]       = useState('All');

  useEffect(() => {
    if (acceptedEvents.length > 0 && selectedEventId === null) {
      setSelectedEventId(getEventKey(acceptedEvents[0]));
    }
  }, [acceptedEvents, selectedEventId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [regRes, stuRes] = await Promise.all([
          getAllRegistrations(),
          getALlstudent(),
        ]);
        const regData = regRes.data ?? regRes;
        const stuData = stuRes.data ?? stuRes;
        setRegistrations(Array.isArray(regData) ? regData : []);
        setStudents(Array.isArray(stuData) ? stuData : []);
        try {
          const usrRes  = await getAllUsers();
          const usrData = usrRes.data ?? usrRes;
          setUsers(Array.isArray(usrData) ? usrData : []);
        } catch {
          console.warn('Users endpoint not accessible');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const selectedEvent = useMemo(
    () => acceptedEvents.find((e) => getEventKey(e) === String(selectedEventId)) || null,
    [acceptedEvents, selectedEventId],
  );

  const participants = useMemo(() => {
    if (!selectedEventId) return [];
    return registrations
      .filter((reg) => getRegistrationEventKey(reg) === String(selectedEventId))
      .map((reg) => {
        const regUserKey = getRegistrationUserKey(reg);
        const student = students.find((s) => getEntityUserKey(s) === regUserKey);
        const user    = users.find((u) => getEntityUserKey(u) === regUserKey);
        return {
          key:            reg.registrationId ?? reg.id ?? `${selectedEventId}-${regUserKey}`,
          studentName:    student?.fullname ?? user?.fullname ?? user?.username ?? reg.username ?? 'Unknown',
          email:          student?.email ?? user?.email ?? reg.email ?? 'N/A',
          department:     mapDepartment(student?.department ?? user?.department),
          batch:          student?.batch ?? user?.batch ?? 'N/A',
          year:           getYearFromYearOrBatch(student?.year ?? user?.year, student?.batch ?? user?.batch),
          registeredDate: (reg.registrationDate ?? reg.registration_date)
            ? new Date(reg.registrationDate ?? reg.registration_date).toLocaleString()
            : 'N/A',
        };
      });
  }, [selectedEventId, registrations, students, users]);

  const departmentOptions = useMemo(() => {
    const depts = participants.map((p) => p.department).filter((d) => d && d !== 'N/A');
    return ['All', ...new Set(depts)];
  }, [participants]);

  const visibleParticipants = useMemo(() => {
    return participants.filter((p) => {
      const yearMatch = selectedYear === 'All Years' || p.year === selectedYear;
      const deptMatch = selectedDept === 'All' || p.department === selectedDept;
      return yearMatch && deptMatch;
    });
  }, [participants, selectedYear, selectedDept]);

  const yearCounts = useMemo(() => {
    const counts = { 'Year 1': 0, 'Year 2': 0, 'Year 3': 0, 'Year 4': 0 };
    participants.forEach((p) => { if (counts[p.year] !== undefined) counts[p.year]++; });
    return counts;
  }, [participants]);

  const eventParticipationStats = useMemo(() => {
    const registrationCountByEvent = registrations.reduce((acc, reg) => {
      const key = getRegistrationEventKey(reg);
      if (!key) return acc;
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

    return acceptedEvents.map((event) => {
      const eventKey = getEventKey(event);
      const registered = registrationCountByEvent[eventKey] ?? 0;
      const max = getEventMaxParticipants(event);
      const percentage = max ? Math.min((registered / max) * 100, 100) : 0;

      return {
        key: eventKey,
        title: event?.title ?? event?.name ?? 'Untitled Event',
        type: event?.type ?? 'EVENT',
        registered,
        max,
        percentage,
      };
    });
  }, [acceptedEvents, registrations]);

  if (loading || eventsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-primary">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-secondary/20 border-t-secondary" />
          <p className="text-sm text-white/40">Loading participants...</p>
        </div>
      </div>
    );
  }

  if (acceptedEvents.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-primary px-6">
        <p className="text-sm text-white/50">No accepted events available.</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-primary px-4 py-6 sm:px-6 lg:px-8 text-white">
      <div className="mx-auto max-w-7xl space-y-4">

        {/* ── Page Title ── */}
       

        {/* ── Top Bar: Event Selector + Stats ── */}
        {selectedEvent && (
          <div className="rounded-2xl border border-secondary/20 bg-Dashboard p-4 shadow-[0_8px_24px_rgba(0,0,0,0.2)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              {/* Event Selector */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 border border-secondary/20 text-secondary">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-white/35 mb-0.5">
                    Selected Event
                  </p>
                  <select
                    value={selectedEventId ?? ''}
                    onChange={(e) => {
                      setSelectedEventId(e.target.value);
                      setSelectedYear('All Years');
                      setSelectedDept('All');
                    }}
                    className="bg-transparent text-sm font-semibold text-white outline-none cursor-pointer border-none max-w-xs truncate"
                  >
                    {acceptedEvents.map((event) => (
                      <option key={getEventKey(event)} value={getEventKey(event)} className="bg-gray-900">
                        {event.title ?? event.name ?? 'Untitled Event'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/8 px-3 py-2">
                  <div className="h-2 w-2 rounded-full bg-secondary" />
                  <span className="text-xs font-semibold text-white/70">
                    {participants.length} Registered
                  </span>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/8 px-3 py-2">
                  <div className="h-2 w-2 rounded-full bg-white/30" />
                  <span className="text-xs font-semibold text-white/70">
                    Max {selectedEvent.maxParticipants ?? selectedEvent.max_participants ?? '∞'}
                  </span>
                </div>
                <div className="rounded-xl bg-secondary/10 border border-secondary/20 px-3 py-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                    {selectedEvent.type ?? 'EVENT'}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            {selectedEvent.maxParticipants && (
              <div className="mt-3">
                <div className="h-1.5 w-full rounded-full bg-white/8 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-secondary transition-all duration-500"
                    style={{ width: `${Math.min((participants.length / selectedEvent.maxParticipants) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── All Events Participation ── */}
        <div className="rounded-2xl border border-secondary/15 bg-Dashboard p-4 shadow-[0_8px_24px_rgba(0,0,0,0.2)]">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white/90 tracking-wide">All Events Participation</h2>
          </div>

          {eventParticipationStats.length === 0 ? (
            <p className="text-sm text-white/35">No events available.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {eventParticipationStats.map((item) => {
                const isSelected = item.key === String(selectedEventId ?? '');
                return (
                  <div
                    key={item.key}
                    className={`rounded-xl border p-3 transition-colors ${
                      isSelected
                        ? 'border-secondary/35 bg-secondary/10'
                        : 'border-white/10 bg-white/2 hover:border-secondary/25'
                    }`}
                  >
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">{item.title}</p>
                        <p className="mt-0.5 text-[10px] uppercase tracking-widest text-white/35">{item.type}</p>
                      </div>
                      <p className="text-xs font-bold text-secondary">{item.max ? `${item.percentage.toFixed(1)}%` : 'N/A'}</p>
                    </div>

                    <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-secondary transition-all duration-500"
                        style={{ width: `${item.max ? item.percentage : 0}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/55">Registered: <span className="font-semibold text-white/80">{item.registered}</span></span>
                      <span className="text-white/55">Max: <span className="font-semibold text-white/80">{item.max ?? '∞'}</span></span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Year Count Cards ── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {yearTabs.slice(1).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setSelectedYear(selectedYear === tab ? 'All Years' : tab)}
              className={`rounded-2xl border p-4 text-center transition-all duration-200 cursor-pointer ${
                selectedYear === tab
                  ? 'border-secondary/40 bg-secondary/10 shadow-[0_0_20px_rgba(0,0,0,0.15)]'
                  : 'border-white/8 bg-Dashboard hover:border-secondary/20 hover:bg-white/5'
              }`}
            >
              <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${
                selectedYear === tab ? 'text-secondary' : 'text-white/35'
              }`}>
                {tab}
              </p>
              <p className={`text-2xl font-bold ${
                selectedYear === tab ? 'text-secondary' : 'text-white'
              }`}>
                {yearCounts[tab]}
              </p>
              <p className="text-[10px] text-white/30 mt-1">students</p>
            </button>
          ))}
        </div>

        {/* ── Filter Row ── */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Year Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {yearTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setSelectedYear(tab)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  selectedYear === tab
                    ? 'bg-secondary text-primary'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="h-5 w-px bg-white/10 mx-1" />

          {/* Department Select */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">
              Dept
            </span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="h-8 rounded-lg border border-white/10 bg-white/5 px-2.5 text-xs font-semibold text-white outline-none transition focus:border-secondary/40 cursor-pointer"
            >
              {departmentOptions.map((dept) => (
                <option key={dept} value={dept} className="bg-gray-900">
                  {dept === 'All' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
          </div>

          {/* Result count */}
          <div className="ml-auto text-xs text-white/30 font-medium">
            Showing {visibleParticipants.length} of {participants.length}
          </div>
        </div>

        {/* ── Main Table Card ── */}
        <div className="overflow-hidden rounded-2xl border border-secondary/15 bg-Dashboard shadow-[0_12px_30px_rgba(0,0,0,0.25)]">
          <div className="overflow-x-auto">
            {visibleParticipants.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-white/30">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/8">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <p className="text-sm font-semibold text-white/40">No participants found</p>
                <p className="mt-1 text-xs text-white/25">Try changing the event, year or department filter</p>
              </div>
            ) : (
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-white/8">
                    <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-white/35">
                      Student
                    </th>
                    <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-white/35">
                      Email
                    </th>
                    <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-white/35">
                      Dept
                    </th>
                    <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-white/35">
                      Year
                    </th>
                    <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-white/35">
                      Registered
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visibleParticipants.map((participant, index) => (
                    <tr
                      key={participant.key ?? index}
                      className="border-b border-white/5 hover:bg-white/3 transition-colors"
                    >
                      {/* Student Name with Avatar */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${avatarColor(participant.studentName)}`}>
                            {getInitials(participant.studentName)}
                          </div>
                          <span className="font-semibold text-white text-sm">
                            {participant.studentName}
                          </span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-5 py-4 text-sm text-white/50">
                        {participant.email}
                      </td>

                      {/* Department */}
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-lg border px-2.5 py-1 text-xs font-bold ${deptBadgeColor(participant.department)}`}>
                          {participant.department}
                        </span>
                      </td>

                      {/* Year */}
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-bold ${yearBadgeColor(participant.year)}`}>
                          {participant.year}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-xs text-white/40">
                        {participant.registeredDate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}