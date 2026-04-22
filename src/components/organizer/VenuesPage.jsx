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

const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';

const buildReport = (event, participants) => {
  const W = { sr: 3, name: 18, email: 22, dept: 12 };
  const line = '='.repeat(70);
  const thin = '-'.repeat(70);
  const header = [
    'EVENT REPORT',
    `Generated: ${new Date().toLocaleString()}`,
    '',
    line,
    'EVENT DETAILS',
    line,
    `Event Name:  ${event.title}`,
    `Date:        ${formatDate(event.eventDate ?? event.event_date)}`,
    `Time:        ${event.startTime} – ${event.endTime}`,
    `Venue:       ${event.venue?.placeName ?? event.venueName ?? 'N/A'}`,
    `Status:      ${event.status?.toUpperCase()}`,
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

  return `${header}\n${rows}`;
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
          name: u?.fullname ?? s?.fullname ?? 'Unknown',
          email: u?.email ?? s?.email ?? 'N/A',
          department: u?.department ?? s?.department ?? 'N/A',
        });
      }
    }
    return results;
  }, [selectedEventId, registrations, userMap, stuMap]);

  const fillRate = selectedEvent?.maxParticipants
    ? Math.round((participants.length / selectedEvent.maxParticipants) * 100)
    : 0;

  const handleDownload = async () => {
    if (!selectedEvent) {
      toast.error('Please select an event');
      return;
    }
    try {
      setGenerating(true);
      await new Promise((res) => setTimeout(res, 600));
      downloadDoc(buildReport(selectedEvent, participants), selectedEvent.title);
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

          {selectedEvent && participants.length > 0 && (
            <div className="pt-2">
              <p className="text-xs font-bold uppercase tracking-wider text-white/40 mb-3">Participant Preview</p>
              <div className="bg-primary/20 border border-white/5 rounded-2xl overflow-hidden">
                {participants.slice(0, 3).map((p, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 border-b border-white/5 last:border-0">
                    <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center shrink-0 text-secondary">
                      <User size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{p.name}</p>
                      <p className="text-xs text-white/40 truncate">{p.email}</p>
                    </div>
                    <div className="px-2 py-1 bg-white/5 rounded-md">
                      <p className="text-[10px] text-white/60 uppercase tracking-wide">{p.department || 'N/A'}</p>
                    </div>
                  </div>
                ))}
                {participants.length > 3 && (
                  <div className="p-2 text-center bg-primary/30">
                    <p className="text-xs text-white/40">+ {participants.length - 3} more participants included in document</p>
                  </div>
                )}
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
