import React, { useState } from 'react';
import { useEvents } from '../../hook/useEvents';
import Modal from './Modal';

export default function AllEventsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  // NEW: State for filters
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [venueFilter, setVenueFilter] = useState("ALL");

  const { events, loading, error } = useEvents(); 

  if (loading) {
    return <div className="w-full h-screen flex items-center justify-center text-accent text-xl bg-primary">Loading events... ⏳</div>;
  }

  if (error) {
    return <div className="w-full h-screen flex items-center justify-center text-red-400 text-xl bg-primary">{error}</div>;
  }

  // NEW: Extract unique statuses and venues dynamically from the data
  const uniqueStatuses = [...new Set(events.map(e => e.status).filter(Boolean))];
  const uniqueVenues = [...new Set(events.map(e => e.venue?.placeName).filter(Boolean))];

  // NEW: Filter the events before mapping them
  const filteredEvents = events.filter(event => {
    const matchStatus = statusFilter === "ALL" || event.status === statusFilter;
    const matchVenue = venueFilter === "ALL" || event.venue?.placeName === venueFilter;
    return matchStatus && matchVenue;
  });

  return (
  <>
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      event={selectedEvent} // for demo purposes, showing details of the selected event
      className="max-w-2xl"
    ></Modal>

    <div className="w-full min-h-screen p-8 text-white bg-primary">
      <h1 className="text-3xl font-bold mb-6 text-secondary border-b border-secondary/20 pb-4">All Events</h1>
      
      {/* NEW: Filter UI Dropdowns */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2 bg-primary border border-secondary/40 text-white rounded-lg focus:outline-none focus:border-accent"
        >
          <option value="ALL">All Statuses</option>
          {uniqueStatuses.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>

        <select 
          value={venueFilter} 
          onChange={(e) => setVenueFilter(e.target.value)}
          className="p-2 bg-primary border border-secondary/40 text-white rounded-lg focus:outline-none focus:border-accent"
        >
          <option value="ALL">All Venues</option>
          {uniqueVenues.map(venue => (
            <option key={venue} value={venue}>{venue}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* CHANGED: Map over filteredEvents instead of events */}
        {filteredEvents.length === 0 ? (
          <p className="col-span-3 text-center text-gray-400">No events found.</p>
        ) : (
          filteredEvents.map((event) => {
            const imageUrl = event.posterUrl || event.poster_url;
            return (
              <div key={event.event_id || event.id} className="border border-secondary/40 p-5 rounded-xl shadow-lg bg-primary hover:border-accent transition-colors group flex flex-col">
                
                {imageUrl ? (
                  <img 
                    src={imageUrl} 
                    alt={`${event.title} poster`} 
                    className="w-full h-48 object-cover rounded-lg mb-4 bg-gray-800"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/600x400/1e1e1e/888888?text=Image+Unavailable';
                    }}
                  />
                ) : (
                  <div className="w-full h-48 flex items-center justify-center rounded-lg mb-4 bg-secondary/10 border border-secondary/20 text-white/50 text-sm">
                    No Image Provided
                  </div>
                )}
                <h2 className="text-xl font-semibold mb-3 text-accent">{event.title}</h2>
                
                <div className="space-y-2 flex-grow pb-[9px]">
                  <p className="text-white/70 flex justify-between">
                    <span className="text-secondary/80">Type:</span> {event.type || 'N/A'}
                  </p>
                  {/* Added these just to show the filter data visually on the card */}
                  <p className="text-white/70 flex justify-between">
                    <span className="text-secondary/80">Status:</span> {event.status || 'N/A'}
                  </p>
                  <p className="text-white/70 flex justify-between">
                    <span className="text-secondary/80">Venue:</span> {event.venue?.placeName || 'N/A'}
                  </p>
                </div>
                
                <button 
                  onClick={() => { 
                    setSelectedEvent(event); 
                    setIsOpen(true);
                    console.log("Selected Event:", event);
                  }}
                  className="mt-auto w-full py-2 bg-secondary text-primary font-bold rounded-lg hover:bg-accent transition-colors"
                >
                  View Details
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  </>
  );
}