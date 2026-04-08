import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { useEvents } from '../../hook/useEvents';
import { useAuth } from '../../hook/useAuth';
import Modal from './Modal';


export default function MyEventsPage() {
  const { events, loading, error } = useEvents();
  const { user } = useAuth();
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [venueFilter, setVenueFilter] = useState('ALL');

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

  const uniqueStatuses = [...new Set(myEvents.map((event) => event.status).filter(Boolean))];
  const uniqueVenues = [...new Set(myEvents.map((event) => event.venue?.placeName).filter(Boolean))];

  const filteredEvents = myEvents.filter((event) => {
    const matchSearch = (event.title || '').toLowerCase().includes(searchTerm.trim().toLowerCase());
    const matchStatus = statusFilter === 'ALL' || event.status === statusFilter;
    const matchVenue = venueFilter === 'ALL' || event.venue?.placeName === venueFilter;
    return matchSearch && matchStatus && matchVenue;
  });

  if (loading) {
    return <div className="w-full h-screen flex items-center justify-center text-accent text-xl bg-primary">Loading events... ⏳</div>;
  }

  if (error) {
    return <div className="w-full h-screen flex items-center justify-center text-red-400 text-xl bg-primary">{error}</div>;
  }

  return (
    <div className="w-full min-h-screen p-8 text-white bg-primary">
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        event={selectedEvent}
      />
      
      <div className="mb-6 pb-4 border-b border-secondary/15 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold text-secondary">My Events</h1>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by event name..."
          className="p-2 bg-primary border border-secondary/40 text-white rounded-lg focus:outline-none focus:border-accent w-full md:w-64"
        />
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2 bg-primary border border-secondary/40 text-white rounded-lg focus:outline-none focus:border-accent"
        >
          <option value="ALL">All Statuses</option>
          {uniqueStatuses.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>

        <select
          value={venueFilter}
          onChange={(e) => setVenueFilter(e.target.value)}
          className="p-2 bg-primary border border-secondary/40 text-white rounded-lg focus:outline-none focus:border-accent"
        >
          <option value="ALL">All Venues</option>
          {uniqueVenues.map((venue) => (
            <option key={venue} value={venue}>{venue}</option>
          ))}
        </select>

        <div className="md:ml-auto">
          <Link to="/organizer/create-event" className="inline-flex items-center gap-2 bg-secondary hover:bg-accent text-primary font-semibold px-5 py-3 rounded-lg transition-colors shadow-sm">
            + Create New Event
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.length === 0 ? (
          <p className="col-span-3 text-center text-gray-400">No events created by you yet.</p>
        ) : (
          filteredEvents.map((event) => {
            const imageUrl = event.posterUrl || event.poster_url;
            return (
              <div key={event.event_id || event.id} className="border border-white/10 p-5 rounded-2xl bg-[#0d1a2d] shadow-[0_8px_30px_rgba(0,0,0,0.18)] hover:border-secondary/40 transition-all duration-200 group flex flex-col">
                
                {imageUrl ? (
                  <img 
                    src={imageUrl} 
                    alt={`${event.title} poster`} 
                    className="w-full h-48 object-cover rounded-xl mb-4 bg-gray-800"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/600x400/1e1e1e/888888?text=Image+Unavailable';
                    }}
                  />
                ) : (
                  <div className="w-full h-48 flex items-center justify-center rounded-xl mb-4 bg-white/5 border border-white/10 text-white/45 text-sm">
                    No Image Provided
                  </div>
                )}
                <h2 className="text-xl font-semibold mb-3 text-accent leading-snug">{event.title}</h2>
                
                <div className="space-y-2 grow pb-[9px] text-sm">
                  <p className="flex justify-between gap-4 text-white/75">
                    <span className="text-secondary/80 font-medium">Status</span> <span className="font-medium">{event.status || 'N/A'}</span>
                  </p>
                  <p className="flex justify-between gap-4 text-white/75">
                    <span className="text-secondary/80 font-medium">Venue</span> <span className="font-medium text-right">{event.venue?.placeName || 'N/A'}</span>
                  </p>
                </div>
                
                <div className="mt-auto grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => { 
                      setSelectedEvent(event); 
                      setIsViewOpen(true);
                    }}
                    className="py-2 bg-secondary text-primary font-semibold rounded-lg hover:bg-accent transition-colors shadow-sm"
                  >
                    View
                  </button>
                  <button 
                    className="py-2 border border-white/15 text-white font-semibold rounded-lg hover:bg-white/5 transition-colors"
                  >
                    Edit
                  </button>
                  <button 
                    className="py-2 bg-red-500/10 border border-red-500/30 text-red-300 font-semibold rounded-lg hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
                    aria-label="Delete event"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}