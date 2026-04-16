import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, CheckCircle2, Clock3, XCircle, Plus } from 'lucide-react';
import { useEvents } from '../../hook/useEvents';
import { useAuth } from '../../hook/useAuth';

const isApproved = (status) => {
  const normalized = String(status || '').toUpperCase();
  return normalized === 'APPROVED' || normalized === 'ACCEPTED';
};

const isPending = (status) => String(status || '').toUpperCase() === 'PENDING';

const isRejected = (status) => {
  const normalized = String(status || '').toUpperCase();
  return normalized === 'REJECTED' || normalized === 'DECLINED' || normalized === 'CANCELLED';
};

export default function DashboardPage() {
  const { events, loading, error } = useEvents();
  const { user } = useAuth();

  const currentUserId = user?.id || user?.userId || user?.user_id;

  const myEvents = useMemo(() => {
    return (events || []).filter((event) => {
      const creator = event?.createdBy || {};
      const creatorId = creator?.id || creator?.userId || creator?.user_id;

      if (currentUserId && creatorId) {
        return String(currentUserId) === String(creatorId);
      }

      if (user?.username && creator?.username) {
        return user.username === creator.username;
      }

      if (user?.email && creator?.email) {
        return user.email === creator.email;
      }

      return false;
    });
  }, [events, currentUserId, user?.username, user?.email]);

  const approvedCount = myEvents.filter((event) => isApproved(event?.status)).length;
  const pendingCount = myEvents.filter((event) => isPending(event?.status)).length;
  const rejectedCount = myEvents.filter((event) => isRejected(event?.status)).length;

  const [animatedCounts, setAnimatedCounts] = useState({
    myEvents: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });

  useEffect(() => {
    if (loading) return;

    const target = {
      myEvents: myEvents.length,
      approved: approvedCount,
      pending: pendingCount,
      rejected: rejectedCount,
    };

    const duration = 1300;
    const startTime = performance.now();
    let frameId;

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setAnimatedCounts({
        myEvents: Math.round(target.myEvents * eased),
        approved: Math.round(target.approved * eased),
        pending: Math.round(target.pending * eased),
        rejected: Math.round(target.rejected * eased),
      });

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [loading, myEvents.length, approvedCount, pendingCount, rejectedCount]);

  if (loading) {
    return <div className="w-full h-full flex items-center justify-center text-accent text-xl">Loading dashboard... ⏳</div>;
  }

  if (error) {
    return <div className="w-full h-full flex items-center justify-center text-red-400 text-xl">{error}</div>;
  }

  return (
    <div className="w-full min-h-full space-y-8 text-white">
      <div className="rounded-3xl border border-secondary/30 bg-Dashboard p-8 shadow-[0_12px_30px_rgba(0,0,0,0.25)]">
        <h1 className="text-4xl font-bold text-white mb-2">Welcome back, {user?.fullname || user?.name || user?.username || 'Organizer'}!</h1>
        <p className="text-secondary/90 text-xl mb-6">Manage your events and create new ones for the Faculty of Technology.</p>

        <Link
          to="/organizer/create-event"
          className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-secondary hover:bg-accent text-primary font-bold text-xl transition-colors"
        >
          <Plus size={20} />
          Create New Event
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <div className="rounded-2xl border border-secondary/20 bg-primary p-6 flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-secondary/10 border border-secondary/30 flex items-center justify-center">
            <Calendar className="text-secondary" size={28} />
          </div>
          <div>
            <p className="text-secondary/80 text-sm">My Events</p>
            <p className="text-4xl leading-none font-bold text-white mt-1">{animatedCounts.myEvents}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-6 flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-green-500/20 border border-green-500/35 flex items-center justify-center">
            <CheckCircle2 className="text-green-300" size={28} />
          </div>
          <div>
            <p className="text-green-200 text-sm">Approved</p>
            <p className="text-4xl leading-none font-bold text-green-100 mt-1">{animatedCounts.approved}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-yellow-500/35 bg-yellow-500/10 p-6 flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-yellow-500/20 border border-yellow-500/35 flex items-center justify-center">
            <Clock3 className="text-yellow-300" size={28} />
          </div>
          <div>
            <p className="text-yellow-200 text-sm">Pending</p>
            <p className="text-4xl leading-none font-bold text-yellow-100 mt-1">{animatedCounts.pending}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-red-500/35 bg-red-500/10 p-6 flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-red-500/20 border border-red-500/35 flex items-center justify-center">
            <XCircle className="text-red-300" size={28} />
          </div>
          <div>
            <p className="text-red-200 text-sm">Rejected</p>
            <p className="text-4xl leading-none font-bold text-red-100 mt-1">{animatedCounts.rejected}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
