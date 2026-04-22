import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { createNotification, getAllRegistrations, getALlstudent, getAllUsers } from '../../api/api';
import { useAuth } from '../../hook/useAuth';
import { useEvents } from '../../hook/useEvents';

/** * HELPER FUNCTIONS
 * Placed outside to ensure they aren't re-allocated on every render.
 */
const yearTabs = ['All Years', 'Year 1', 'Year 2', 'Year 3', 'Year 4'];

const getEventKey = (event) => String(event?.event_id ?? event?.eventId ?? event?.id ?? '');
const isAcceptedEvent = (event) => {
  const status = String(event?.status ?? '').trim().toUpperCase();
  return ['ACCEPT', 'ACCEPTED', 'APPROVED'].includes(status);
};

const getRegistrationEventKey = (reg) => String(reg?.event_id ?? reg?.eventId ?? reg?.event?.event_id ?? reg?.event?.eventId ?? reg?.event?.id ?? '');
const getRegistrationUserKey = (reg) => String(reg?.user_id ?? reg?.userId ?? reg?.user?.userId ?? reg?.user?.user_id ?? reg?.user?.id ?? '');
const getEntityUserKey = (ent) => String(ent?.userId ?? ent?.user_id ?? ent?.id ?? '');

const DEPARTMENT_OPTIONS = [
  { key: 'IT', label: 'IT' },
  { key: 'ET', label: 'ET' },
  { key: 'BST', label: 'BST' },
];

const departmentLabelByKey = Object.fromEntries(
  DEPARTMENT_OPTIONS.map((dept) => [dept.key, dept.label]),
);

const mapDepartmentKey = (dept) => {
  if (!dept) return 'N/A';
  const d = String(dept).toUpperCase().trim();

  // ✅ Exact matches first
  if (d === 'ICT' || d === 'IT') return 'IT';
  if (d === 'ET') return 'ET';
  if (d === 'BST') return 'BST';

  // ✅ Fallback for full names
  if (d.includes('INFORMATION') || d.includes('COMMUNICATION')) return 'IT';
  if (d.includes('ENGINEERING')) return 'ET';
  if (d.includes('BIOSYSTEM') || d.includes('BUSINESS')) return 'BST';

  return dept; // unknown — show as-is
};

/**
 * IMPROVED YEAR LOGIC
 * Correctly identifies year from various input strings
 */
const getYearFromYearOrBatch = (yearField, batchField) => {
  const combined = `${yearField ?? ''} ${batchField ?? ''}`.toLowerCase();
  
  if (combined.includes('1st') || combined.includes('year 1') || /\b1\b/.test(combined)) return 'Year 1';
  if (combined.includes('2nd') || combined.includes('year 2') || /\b2\b/.test(combined)) return 'Year 2';
  if (combined.includes('3rd') || combined.includes('year 3') || /\b3\b/.test(combined)) return 'Year 3';
  if (combined.includes('4th') || combined.includes('year 4') || /\b4\b/.test(combined)) return 'Year 4';

  // Fallback: Check for admission year (e.g., 2022)
  const yearMatch = combined.match(/\b(20\d{2})\b/);
  if (yearMatch) {
    const diff = new Date().getFullYear() - Number(yearMatch[1]) + 1;
    if (diff >= 1 && diff <= 4) return `Year ${diff}`;
  }

  return 'N/A';
};

const getInitials = (name) => {
  if (!name || name === 'Unknown') return '?';
  const parts = name.trim().split(' ');
  return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0][0].toUpperCase();
};

const avatarColor = (name) => {
  const colors = ['bg-violet-500/20 text-violet-300', 'bg-sky-500/20 text-sky-300', 'bg-emerald-500/20 text-emerald-300', 'bg-amber-500/20 text-amber-300'];
  return colors[(name?.charCodeAt(0) || 0) % colors.length];
};

const deptBadgeColor = (d) => ({
  'IT': 'bg-sky-500/15 text-sky-300 border-sky-500/20',
  'ET': 'bg-violet-500/15 text-violet-300 border-violet-500/20',
  'BST': 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20'
}[d] || 'bg-white/8 text-white/60 border-white/10');

export default function ParticipantsPage() {
  const { user } = useAuth();
  const { events, loading: eventsLoading, refetchEvents } = useEvents();
  const [registrations, setRegistrations] = useState([]);
  const [students, setStudents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [selectedYear, setSelectedYear] = useState('All Years');
  const [selectedDept, setSelectedDept] = useState('All');
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [notifyEventId, setNotifyEventId] = useState('');
  const [notifyMessage, setNotifyMessage] = useState('');
  const [notifyStatus, setNotifyStatus] = useState('idle');
  const [notifyError, setNotifyError] = useState('');

  const acceptedEvents = useMemo(() => events.filter(isAcceptedEvent), [events]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [regRes, stuRes, usrRes] = await Promise.allSettled([
        getAllRegistrations(),
        getALlstudent(),
        getAllUsers()
      ]);

      const usersData = usrRes.status === 'fulfilled' ? (usrRes.value.data ?? usrRes.value) : [];
      const studentsData = stuRes.status === 'fulfilled' ? (stuRes.value.data ?? stuRes.value) : [];

      setRegistrations(regRes.status === 'fulfilled' ? (regRes.value.data ?? regRes.value) : []);
      setStudents(studentsData);
      setUsers(usersData);
    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const handleRefresh = () => {
      fetchData();
      refetchEvents?.();
    };

    window.addEventListener('focus', handleRefresh);
    document.addEventListener('visibilitychange', handleRefresh);

    return () => {
      window.removeEventListener('focus', handleRefresh);
      document.removeEventListener('visibilitychange', handleRefresh);
    };
  }, [fetchData, refetchEvents]);

  useEffect(() => {
    if (acceptedEvents.length > 0 && selectedEventId === null) {
      setSelectedEventId(getEventKey(acceptedEvents[0]));
    }
  }, [acceptedEvents, selectedEventId]);

  useEffect(() => {
    if (!notifyEventId && acceptedEvents.length > 0) {
      setNotifyEventId(selectedEventId ?? getEventKey(acceptedEvents[0]));
    }
  }, [acceptedEvents, notifyEventId, selectedEventId]);

  // Optimization: Map lookups for O(1) retrieval
  const dataMaps = useMemo(() => {
    const studentMap = {};
    const userMap = {};
    students.forEach(s => { studentMap[getEntityUserKey(s)] = s; });
    users.forEach(u => { userMap[getEntityUserKey(u)] = u; });
    return { studentMap, userMap };
  }, [students, users]);

  const participants = useMemo(() => {
    if (!selectedEventId) return [];
    const { studentMap, userMap } = dataMaps;

    return registrations
      .filter(reg => getRegistrationEventKey(reg) === String(selectedEventId))
      .map(reg => {
        const uKey = getRegistrationUserKey(reg);
        const s = studentMap[uKey];
        const u = userMap[uKey];
        
        const name = u?.fullname ?? s?.fullname ?? u?.username ?? reg.username ?? 'Unknown';
        const departmentKey = mapDepartmentKey(s?.department ?? u?.department);
        const year = getYearFromYearOrBatch(s?.year ?? u?.year, s?.batch ?? u?.batch);

        return {
          key: reg.registrationId ?? reg.id ?? `${selectedEventId}-${uKey}`,
          studentName: name,
          username: u?.username ?? s?.username ?? reg.username ?? 'N/A',
          email: s?.email ?? u?.email ?? reg.email ?? 'N/A',
          departmentKey,
          year: year,
          registeredDate: (reg.registrationDate ?? reg.registration_date) 
            ? new Date(reg.registrationDate ?? reg.registration_date).toLocaleString() : 'N/A',
        };
      });
  }, [selectedEventId, registrations, dataMaps]);

  // Filtering for display
  const visibleParticipants = useMemo(() => {
    return participants.filter(p => 
      (selectedYear === 'All Years' || p.year === selectedYear) &&
      (selectedDept === 'All' || p.departmentKey === selectedDept)
    );
  }, [participants, selectedYear, selectedDept]);

  // Restored Percentage & Stats
  const registrationStats = useMemo(() => {
    const total = participants.length;
    const currentEvent = acceptedEvents.find(e => getEventKey(e) === String(selectedEventId));
    const max = currentEvent?.maxParticipants ?? 0;
    const percentage = max > 0 ? Math.min(Math.round((total / max) * 100), 100) : 0;
    
    const counts = { 'Year 1': 0, 'Year 2': 0, 'Year 3': 0, 'Year 4': 0 };
    const departmentCounts = { IT: 0, ET: 0, BST: 0 };
    participants.forEach(p => { if (counts[p.year] !== undefined) counts[p.year]++; });
    participants.forEach(p => {
      if (departmentCounts[p.departmentKey] !== undefined) departmentCounts[p.departmentKey]++;
    });
    const depts = ['All', ...new Set(participants.map(p => p.departmentKey).filter(d => d !== 'N/A'))];
    
    return { total, max, percentage, counts, departmentCounts, depts };
  }, [participants, selectedEventId, acceptedEvents]);

  const handleSendNotification = async () => {
    const message = notifyMessage.trim();
    const targetEventId = Number(notifyEventId || selectedEventId);

    if (!user?.userId || !Number.isFinite(targetEventId) || !message) return;

    try {
      setNotifyStatus('loading');
      setNotifyError('');

      const response = await createNotification({
        userId: user.userId,
        eventId: targetEventId,
        message,
      });

      toast.success(response?.message || 'Notification submitted!');
      setNotifyMessage('');
      setIsNotifyOpen(false);
      setNotifyStatus('success');
    } catch (error) {
      console.error(error);
      setNotifyStatus('error');
      setNotifyError('Failed to send notification to backend.');
      toast.error(error?.response?.data?.message || 'Failed to submit notification');
    }
  };

  if (loading || eventsLoading) return (
    <div className="flex min-h-screen items-center justify-center bg-primary text-white/40">
      <div className="animate-spin h-6 w-6 border-2 border-secondary border-t-transparent rounded-full mr-3" />
      Loading...
    </div>
  );

  return (
    <div className="min-h-screen bg-primary p-4 md:p-8 text-white font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Event Statistics</h1>
            <select 
              value={selectedEventId ?? ''} 
              onChange={e => setSelectedEventId(e.target.value)}
              className="bg-Dashboard border border-white/10 rounded-lg px-3 py-2 text-sm font-semibold outline-none focus:border-secondary transition"
            >
              {acceptedEvents.map(e => (
                <option key={getEventKey(e)} value={getEventKey(e)} className="bg-gray-900">
                  {e.title ?? e.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:justify-end">
            <div className="bg-Dashboard p-1 rounded-xl border border-white/10 flex">
              {yearTabs.map(tab => (
                <button 
                  key={tab} 
                  onClick={() => setSelectedYear(tab)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedYear === tab ? 'bg-secondary text-primary shadow-lg' : 'text-white/50 hover:text-white'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <select 
              value={selectedDept} 
              onChange={e => setSelectedDept(e.target.value)}
              className="bg-Dashboard border border-white/10 rounded-xl px-4 py-1.5 text-xs font-bold outline-none cursor-pointer"
            >
              {registrationStats.depts.map((d) => (
                <option key={d} value={d} className="bg-gray-900">
                  {d === 'All' ? 'All Depts' : departmentLabelByKey[d] ?? d}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setIsNotifyOpen(true)}
              className="group relative overflow-hidden rounded-xl border border-secondary/40 bg-linear-to-r from-secondary via-secondary/90 to-amber-300 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-primary shadow-[0_8px_22px_rgba(201,162,39,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(201,162,39,0.38)] active:translate-y-0"
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/35 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <span className="relative z-10">Notify</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-secondary/10 border border-secondary/20 p-4 rounded-2xl relative overflow-hidden">
            <p className="text-[10px] font-black uppercase text-secondary/70">Total Registered</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold">{registrationStats.total}</p>
              <p className="text-sm text-white/30">/ {registrationStats.max || '∞'}</p>
            </div>
            <div className="absolute top-4 right-4 bg-secondary text-primary text-[10px] font-black px-2 py-0.5 rounded-full">
              {registrationStats.percentage}%
            </div>
          </div>
          {Object.entries(registrationStats.counts).map(([year, count]) => (
            <div key={year} className="bg-Dashboard border border-white/5 p-4 rounded-2xl">
              <p className="text-[10px] font-black uppercase text-white/30">{year}</p>
              <p className="text-2xl font-bold">{count}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { key: 'IT', label: 'IT' },
            { key: 'ET', label: 'ET' },
            { key: 'BST', label: 'BST' },
          ].map((item) => (
            <div key={item.key} className="rounded-2xl border border-white/5 bg-Dashboard px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30">{item.label}</p>
              <p className="mt-1 text-2xl font-bold text-white">
                {registrationStats.departmentCounts[item.key] ?? 0}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-white/10 bg-Dashboard p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-white/90 tracking-wide">Department Distribution</h2>
            <span className="text-[10px] uppercase tracking-wider text-white/35">Selected event</span>
          </div>

          <div className="space-y-4">
            {[
              { key: 'IT', label: 'IT', color: 'bg-sky-400' },
              { key: 'ET', label: 'ET', color: 'bg-violet-400' },
              { key: 'BST', label: 'BST', color: 'bg-emerald-400' },
            ].map((item) => {
              const count = registrationStats.departmentCounts[item.key] ?? 0;
              const percent = registrationStats.total > 0 ? (count / registrationStats.total) * 100 : 0;

              return (
                <div key={item.key} className="grid grid-cols-[100px_1fr_64px] items-center gap-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-white/40">{item.label}</p>
                  <div className="h-3 overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full ${item.color} transition-all duration-500`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <p className="text-right text-sm font-bold text-white/80">{count}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-Dashboard border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-[10px] uppercase font-black tracking-widest text-white/40">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Username</th>
                  <th className="px-6 py-4">Contact </th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Year</th>
                  <th className="px-6 py-4">Reg.Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {visibleParticipants.map(p => (
                  <tr key={p.key} className="hover:bg-white/2 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-xs ${avatarColor(p.studentName)} shadow-sm`}>
                          {getInitials(p.studentName)}
                        </div>
                        <p className="font-bold text-sm leading-none">{p.studentName}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-white/60 font-semibold uppercase tracking-wide">
                      {p.username}
                    </td>
                    <td className="px-6 py-4 text-sm text-white/60 font-medium">{p.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-black border ${deptBadgeColor(p.departmentKey)}`}>
                        {departmentLabelByKey[p.departmentKey] ?? p.departmentKey}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-white/80">{p.year}</td>
                    <td className="px-6 py-4 text-[11px] text-white/30">{p.registeredDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {visibleParticipants.length === 0 && (
              <div className="py-24 text-center">
                <p className="text-white/20 font-bold italic uppercase tracking-widest">No Participants Found</p>
              </div>
            )}
          </div>
        </div>

        {isNotifyOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-Dashboard p-5 shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white">Send Notification</h2>
                  <p className="text-sm text-white/40">Choose an event and write a custom message.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNotifyOpen(false)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-white/60 transition hover:bg-white/10 hover:text-white"
                >
                  Close
                </button>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-white/40">Event</label>
                  <select
                    value={notifyEventId || selectedEventId || ''}
                    onChange={(e) => setNotifyEventId(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-primary px-4 py-3 text-sm font-semibold text-white outline-none focus:border-secondary"
                  >
                    {acceptedEvents.map((event) => (
                      <option key={getEventKey(event)} value={getEventKey(event)} className="bg-gray-900">
                        {event.title ?? event.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-white/40">Message</label>
                  <textarea
                    value={notifyMessage}
                    onChange={(e) => setNotifyMessage(e.target.value)}
                    rows={4}
                    placeholder="Write a custom notification message..."
                    className="w-full rounded-xl border border-white/10 bg-primary px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-secondary"
                  />
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsNotifyOpen(false)}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white/60 transition hover:bg-white/10 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSendNotification}
                    disabled={notifyStatus === 'loading'}
                    className="rounded-xl bg-secondary px-4 py-2 text-sm font-bold text-primary transition hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {notifyStatus === 'loading' ? 'Sending...' : 'Send Message'}
                  </button>
                </div>

                {notifyStatus === 'error' && (
                  <p className="mt-4 text-sm font-medium text-red-300">{notifyError}</p>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}