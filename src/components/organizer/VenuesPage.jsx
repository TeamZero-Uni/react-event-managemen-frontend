import React, { useEffect, useMemo, useState } from 'react';
import {
  Download,
  Users,
  ChevronDown,
  Calendar,
  Loader2,
  TrendingUp,
  User,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useEvents } from '../../hook/useEvents';
import { useAuth } from '../../hook/useAuth';
import { getAllRegistrations, getALlstudent, getAllUsers } from '../../api/api';

const getEventId = (e) => e?.event_id ?? e?.id ?? e?.eventId;
const getRegistrationEventId = (r) => r?.event_id ?? r?.eventId ?? r?.event?.event_id ?? r?.event?.id;
const getRegistrationUserId = (r) => r?.user_id ?? r?.userId ?? r?.user?.id;
const normalizeStatus = (status) => String(status ?? '').trim().toUpperCase();

const getEventStatusLabel = (status) => {
  const normalized = normalizeStatus(status);
  if (normalized === 'ACCEPTED' || normalized === 'APPROVED' || normalized === 'ACCEPT') return 'Accepted';
  if (normalized === 'PENDING') return 'Pending';
  if (normalized === 'REJECTED' || normalized === 'DECLINED') return 'Rejected';
  return normalized || 'N/A';
};

const getDepartmentLabel = (department) => {
  const value = String(department ?? '').trim();
  const upper = value.toUpperCase();
  if (!value) return 'N/A';
  if (upper.includes('INFORMATION') || upper.includes('ICT') || upper === 'IT') return 'IT';
  if (upper.includes('ENGINEERING') || upper === 'ET') return 'ET';
  if (upper.includes('BUSINESS') || upper === 'BST') return 'BST';
  return value;
};

const getYearLabel = (yearValue, batchValue) => {
  const combined = `${yearValue ?? ''} ${batchValue ?? ''}`.toLowerCase();
  if (combined.includes('1st') || combined.includes('year 1') || /\b1\b/.test(combined)) return 'Year 1';
  if (combined.includes('2nd') || combined.includes('year 2') || /\b2\b/.test(combined)) return 'Year 2';
  if (combined.includes('3rd') || combined.includes('year 3') || /\b3\b/.test(combined)) return 'Year 3';
  if (combined.includes('4th') || combined.includes('year 4') || /\b4\b/.test(combined)) return 'Year 4';

  const admissionYear = combined.match(/\b(20\d{2})\b/);
  if (admissionYear) {
    const diff = new Date().getFullYear() - Number(admissionYear[1]) + 1;
    if (diff >= 1 && diff <= 4) return `Year ${diff}`;
  }

  return 'N/A';
};

const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';

const formatDateTime = (value) => {
  if (!value) return 'N/A';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 'N/A' : parsed.toLocaleString();
};

const formatTime = (time) => {
  if (!time) return 'N/A';
  const [hours, minutes] = String(time).split(':');
  const hourNumber = Number(hours);
  if (Number.isNaN(hourNumber)) return String(time);
  const ampm = hourNumber >= 12 ? 'PM' : 'AM';
  const hour12 = hourNumber % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

const buildReport = (event, participants, stats, organizerName) => {
  const W = { sr: 3, name: 18, email: 22, dept: 12 };
  const line = '='.repeat(70);
  const thin = '-'.repeat(70);
  const deptSummary = Object.entries(stats.departmentCounts)
    .map(([dept, count]) => `${dept}: ${count}`)
    .join(' | ');
  const yearSummary = Object.entries(stats.yearCounts)
    .map(([year, count]) => `${year}: ${count}`)
    .join(' | ');
  const header = [
    'EVENT REPORT',
    `Generated: ${new Date().toLocaleString()}`,
    '',
    line,
    'EVENT DETAILS',
    line,
    `Organizer:   ${organizerName || 'N/A'}`,
    `Event Name:  ${event.title}`,
    `Event Type:  ${event.eventType || 'N/A'}`,
    `Date:        ${formatDate(event.eventDate ?? event.event_date)}`,
    `Time:        ${formatTime(event.startTime)} – ${formatTime(event.endTime)}`,
    `Venue:       ${event.venue?.placeName ?? event.venueName ?? 'N/A'}`,
    `Status:      ${getEventStatusLabel(event.status)}`,
    `Budget:      ${event.budget ?? 'N/A'}`,
    `Capacity:    ${event.maxParticipants ?? 'N/A'}`,
    `Filled:      ${stats.fillRate}%`,
    '',
    line,
    'ATTENDANCE SUMMARY',
    line,
    `Registered:  ${stats.totalRegistered}`,
    `Remaining:   ${stats.remainingSeats}`,
    `Dept Split:  ${deptSummary || 'N/A'}`,
    `Year Split:  ${yearSummary || 'N/A'}`,
    '',
    line,
    `PARTICIPANTS (${participants.length})`,
    line,
    `${'SR'.padEnd(W.sr)} | ${'Name'.padEnd(W.name)} | ${'Email'.padEnd(W.email)} | ${'Dept'.padEnd(W.dept)}`,
    thin,
  ].join('\n');

  const rows = participants
    .map((p, i) =>
      [
        String(i + 1).padEnd(W.sr),
        (p.name || 'Unknown').substring(0, W.name).padEnd(W.name),
        (p.email || 'N/A').substring(0, W.email).padEnd(W.email),
        (p.department || 'N/A').substring(0, W.dept).padEnd(W.dept),
      ].join(' | ')
    )
    .join('\n');

  const footer = [
    '',
    line,
    'REPORT NOTES',
    line,
    'Accepted events only are included in this report.',
    'Use this document for attendance review, follow-up, and approval tracking.',
  ].join('\n');

  return `${header}\n${rows}${footer}`;
};

const downloadDoc = (content, title) => {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(title || 'Event').replace(/\s+/g, '_')}_Report.doc`;
  a.click();
  URL.revokeObjectURL(url);
};

export default function VenuesPage() {
  const { user } = useAuth();
  const { events, loading: eventsLoading } = useEvents();

  const [selectedEventId, setSelectedEventId] = useState('');
  const [generating, setGenerating] = useState(false);
  const [registrations, setRegistrations] = useState([]);
  const [students, setStudents] = useState([]);
  const [userList, setUserList] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  const currentUserIdStr = useMemo(() => String(user?.id ?? user?.userId ?? user?.user_id), [user]);

  const myEvents = useMemo(() => {
    if (!events) return [];
    return events.filter((e) => {
      const c = e?.createdBy ?? {};
      return currentUserIdStr === String(c?.id ?? c?.userId ?? c?.user_id);
    });
  }, [events, currentUserIdStr]);

  const selectedEvent = useMemo(() => {
    if (!myEvents.length || !selectedEventId) return null;
    const targetId = String(selectedEventId);
    return myEvents.find((e) => String(getEventId(e)) === targetId) ?? null;
  }, [myEvents, selectedEventId]);

  useEffect(() => {
    if (myEvents.length > 0 && !selectedEventId) {
      setSelectedEventId(String(getEventId(myEvents[0])));
    }
  }, [myEvents, selectedEventId]);

  useEffect(() => {
    let isMounted = true;
    setDataLoading(true);

    Promise.allSettled([getAllRegistrations(), getALlstudent(), getAllUsers()]).then(([reg, stu, usr]) => {
      if (!isMounted) return;

      const extractData = (res) =>
        res.status === 'fulfilled' ? (Array.isArray(res.value) ? res.value : res.value?.data ?? []) : [];

      setRegistrations(extractData(reg));
      setStudents(extractData(stu));
      setUserList(extractData(usr));
      setDataLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const userMap = useMemo(() => {
    const map = {};
    for (let i = 0; i < userList.length; i++) {
      const u = userList[i];
      map[u?.userId ?? u?.user_id ?? u?.id] = u;
    }
    return map;
  }, [userList]);

  const stuMap = useMemo(() => {
    const map = {};
    for (let i = 0; i < students.length; i++) {
      const s = students[i];
      map[s?.userId ?? s?.user_id ?? s?.id] = s;
    }
    return map;
  }, [students]);

  const participants = useMemo(() => {
    if (!selectedEventId || registrations.length === 0) return [];

    const targetEventId = String(selectedEventId);
    const results = [];

    for (let i = 0; i < registrations.length; i++) {
      const r = registrations[i];
      if (String(getRegistrationEventId(r)) === targetEventId) {
        const uid = getRegistrationUserId(r);
        const u = userMap[uid];
        const s = stuMap[uid];

        results.push({
          id: r?.registrationId ?? r?.id ?? `${targetEventId}-${uid ?? i}`,
          name: u?.fullname ?? s?.fullname ?? 'Unknown',
          username: u?.username ?? s?.username ?? 'N/A',
          email: u?.email ?? s?.email ?? 'N/A',
          department: getDepartmentLabel(u?.department ?? s?.department),
          year: getYearLabel(u?.year ?? s?.year, u?.batch ?? s?.batch),
          registeredAt: formatDateTime(r?.registrationDate ?? r?.registration_date),
        });
      }
    }
    return results;
  }, [selectedEventId, registrations, userMap, stuMap]);

  const stats = useMemo(() => {
    const totalRegistered = participants.length;
    const maxParticipants = Number(selectedEvent?.maxParticipants ?? 0);
    const remainingSeats = maxParticipants > 0 ? Math.max(maxParticipants - totalRegistered, 0) : 0;
    const fillRate = maxParticipants > 0 ? Math.min(Math.round((totalRegistered / maxParticipants) * 100), 100) : 0;

    const departmentCounts = { IT: 0, ET: 0, BST: 0, 'N/A': 0 };
    const yearCounts = { 'Year 1': 0, 'Year 2': 0, 'Year 3': 0, 'Year 4': 0, 'N/A': 0 };

    participants.forEach((participant) => {
      departmentCounts[participant.department] = (departmentCounts[participant.department] ?? 0) + 1;
      yearCounts[participant.year] = (yearCounts[participant.year] ?? 0) + 1;
    });

    return {
      totalRegistered,
      remainingSeats,
      fillRate,
      departmentCounts,
      yearCounts,
    };
  }, [participants, selectedEvent]);

  const fillRate = stats.fillRate;

  const handleDownload = async () => {
    if (!selectedEvent) {
      toast.error('Please select an event');
      return;
    }
    try {
      setGenerating(true);
      await new Promise((res) => setTimeout(res, 600));
      const organizerName = user?.fullname || user?.name || user?.username || 'N/A';
      downloadDoc(buildReport(selectedEvent, participants, stats, organizerName), selectedEvent.title);
      toast.success('Report downloaded successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const isLoading = eventsLoading || dataLoading;

  return (
    <div className="w-full min-h-screen bg-primary p-4 md:p-8 text-white flex justify-center">
      <div className="w-full max-w-3xl space-y-8">
        <div className="flex items-center justify-center border-b border-white/10 pb-6 text-center w-full">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Generate Report</h1>
          </div>
        </div>

        <div className="bg-Dashboard border border-white/10 shadow-2xl shadow-black/20 rounded-3xl p-6 md:p-8 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -z-10 pointer-events-none transform translate-x-1/2 -translate-y-1/2" />

          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-white/50">Select Your Event</label>
            <div className="relative group">
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                disabled={!myEvents.length || isLoading}
                className="w-full appearance-none bg-primary/40 border border-white/10 hover:border-white/20 rounded-2xl px-5 py-4 pr-12 text-white text-base focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {isLoading ? (
                  <option value="">Loading events...</option>
                ) : myEvents.length === 0 ? (
                  <option value="">No events found</option>
                ) : (
                  <>
                    <option value="" disabled>
                      Choose an event…
                    </option>
                    {myEvents.map((e) => (
                      <option key={getEventId(e)} value={String(getEventId(e))}>
                        {e?.title || 'Untitled Event'}
                      </option>
                    ))}
                  </>
                )}
              </select>
              <ChevronDown
                size={18}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 group-hover:text-white/70 transition-colors pointer-events-none"
              />
            </div>
          </div>

          <div className="bg-primary/30 border border-white/5 rounded-2xl p-4 flex items-center gap-3">
            <User size={16} className="text-secondary/70" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/50">Organizer</p>
              <p className="text-base font-medium text-white">{user?.fullname || user?.name || user?.username || 'N/A'}</p>
            </div>
          </div>

          {selectedEvent && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-primary/30 border border-white/5 rounded-2xl p-4 flex flex-col justify-center transition hover:bg-primary/40">
                <div className="flex items-center gap-2 text-white/40 mb-2">
                  <Calendar size={14} />
                  <p className="text-xs font-semibold uppercase tracking-wider">Date</p>
                </div>
                <p className="text-base font-medium text-white truncate">{formatDate(selectedEvent.eventDate ?? selectedEvent.event_date)}</p>
              </div>

              <div className="bg-primary/30 border border-white/5 rounded-2xl p-4 flex flex-col justify-center transition hover:bg-primary/40">
                <div className="flex items-center gap-2 text-white/40 mb-2">
                  <Users size={14} />
                  <p className="text-xs font-semibold uppercase tracking-wider">Registered</p>
                </div>
                <p className="text-2xl font-bold text-white flex items-baseline gap-1">
                  {participants.length}
                  <span className="text-white/30 font-medium text-sm">/ {selectedEvent.maxParticipants ?? '∞'}</span>
                </p>
              </div>

              <div className="bg-primary/30 border border-white/5 rounded-2xl p-4 flex flex-col justify-center transition hover:bg-primary/40">
                <div className="flex items-center gap-2 text-white/40 mb-2">
                  <TrendingUp size={14} />
                  <p className="text-xs font-semibold uppercase tracking-wider">Capacity</p>
                </div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-lg font-bold text-white">{fillRate}%</p>
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-secondary transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min(fillRate, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {selectedEvent && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-white/10 bg-primary/35 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/35">Registered</p>
                <p className="mt-2 text-2xl font-bold text-white">{stats.totalRegistered}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-primary/35 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/35">Capacity</p>
                <p className="mt-2 text-2xl font-bold text-white">{selectedEvent.maxParticipants ?? 'N/A'}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-primary/35 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/35">Remaining</p>
                <p className="mt-2 text-2xl font-bold text-white">{stats.remainingSeats}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-primary/35 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/35">Fill Rate</p>
                <p className="mt-2 text-2xl font-bold text-white">{stats.fillRate}%</p>
              </div>
            </div>
          )}

          {selectedEvent && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-primary/25 p-5">
                <div className="flex items-center gap-2 mb-4 text-secondary">
                  <TrendingUp size={16} />
                  <h3 className="text-sm font-bold uppercase tracking-widest">Department breakdown</h3>
                </div>
                <div className="space-y-3">
                  {Object.entries(stats.departmentCounts).map(([department, count]) => {
                    const percent = stats.totalRegistered > 0 ? Math.round((count / stats.totalRegistered) * 100) : 0;
                    return (
                      <div key={department} className="space-y-1">
                        <div className="flex items-center justify-between text-xs uppercase tracking-wider text-white/50">
                          <span>{department}</span>
                          <span>{count}</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                          <div className="h-full rounded-full bg-secondary" style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-primary/25 p-5">
                <div className="flex items-center gap-2 mb-4 text-secondary">
                  <TrendingUp size={16} />
                  <h3 className="text-sm font-bold uppercase tracking-widest">Year breakdown</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(stats.yearCounts).map(([year, count]) => (
                    <div key={year} className="rounded-xl border border-white/10 bg-white/5 px-3 py-3">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">{year}</p>
                      <p className="mt-1 text-xl font-bold text-white">{count}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedEvent && participants.length > 0 && (
            <div className="pt-2">
              <p className="text-xs font-bold uppercase tracking-wider text-white/40 mb-3">Participant Preview</p>
              <div className="bg-primary/20 border border-white/5 rounded-2xl overflow-hidden">
                <div className="grid grid-cols-[1.5fr_1fr_1fr_0.8fr_0.8fr] gap-3 px-4 py-3 border-b border-white/10 text-[10px] uppercase tracking-[0.2em] text-white/35">
                  <span>Name</span>
                  <span>Username</span>
                  <span>Email</span>
                  <span>Dept</span>
                  <span>Year</span>
                </div>
                {participants.slice(0, 5).map((p) => (
                  <div key={p.id} className="grid grid-cols-[1.5fr_1fr_1fr_0.8fr_0.8fr] gap-3 px-4 py-3 border-b border-white/5 last:border-0 text-sm items-center">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center shrink-0 text-secondary">
                        <User size={14} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-white truncate">{p.name}</p>
                        <p className="text-[11px] text-white/35 truncate">{p.registeredAt}</p>
                      </div>
                    </div>
                    <p className="text-white/70 truncate">{p.username}</p>
                    <p className="text-white/50 truncate">{p.email}</p>
                    <span className="text-secondary text-xs font-bold uppercase tracking-wider">{p.department}</span>
                    <span className="text-white/70 text-xs font-bold uppercase tracking-wider">{p.year}</span>
                  </div>
                ))}
                {participants.length > 3 && (
                  <div className="p-2 text-center bg-primary/30">
                    <p className="text-xs text-white/40">+ {participants.length - 5} more participants included in document</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedEvent && participants.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-primary/20 p-5">
              <div className="flex items-center gap-2 mb-4 text-secondary">
                <Users size={16} />
                <h3 className="text-sm font-bold uppercase tracking-widest">Participant list snapshot</h3>
              </div>
              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/5 text-white/40 uppercase text-[10px] tracking-[0.2em]">
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Username</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Department</th>
                      <th className="px-4 py-3">Year</th>
                      <th className="px-4 py-3">Registered</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {participants.slice(0, 10).map((participant) => (
                      <tr key={participant.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 text-white">{participant.name}</td>
                        <td className="px-4 py-3 text-white/70">{participant.username}</td>
                        <td className="px-4 py-3 text-white/60">{participant.email}</td>
                        <td className="px-4 py-3 text-secondary font-semibold">{participant.department}</td>
                        <td className="px-4 py-3 text-white/70">{participant.year}</td>
                        <td className="px-4 py-3 text-white/45">{participant.registeredAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-white/10">
            <button
              onClick={handleDownload}
              disabled={generating || isLoading || !selectedEventId || participants.length === 0}
              className="group relative w-full flex items-center justify-center gap-2 bg-secondary hover:bg-accent text-primary font-bold py-4 px-6 rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-secondary/20 focus:ring-4 focus:ring-secondary/30 focus:outline-none overflow-hidden"
            >
              <div className="absolute inset-0 w-full h-full bg-white/20 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-out pointer-events-none" />

              {generating ? (
                <>
                  <Loader2 size={20} className="animate-spin relative z-10" />
                  <span className="relative z-10">Compiling Report...</span>
                </>
              ) : (
                <>
                  <Download size={20} className="relative z-10 group-hover:-translate-y-0.5 transition-transform duration-200" />
                  <span className="relative z-10">Download Document</span>
                </>
              )}
            </button>

            {participants.length === 0 && selectedEvent && !isLoading && (
              <p className="text-xs text-center text-red-400/80 mt-4 font-medium">
                Cannot generate report: No participants registered for this event yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
