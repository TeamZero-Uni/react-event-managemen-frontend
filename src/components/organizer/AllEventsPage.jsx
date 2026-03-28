  import React, { useState, useEffect } from 'react';
  import { useEvents } from '../../hook/useEvents';

  export default function AllEventsPage() {
const { events, loading, error } = useEvents();   


   

    if (loading) {
      return <div className="w-full h-screen flex items-center justify-center text-accent text-xl bg-primary">Loading events... ⏳</div>;
    }

    if (error) {
      return <div className="w-full h-screen flex items-center justify-center text-red-400 text-xl bg-primary">{error}</div>;
    }

    return (
      <div className="w-full min-h-screen p-8 text-white bg-primary">
        <h1 className="text-3xl font-bold mb-8 text-secondary border-b border-secondary/20 pb-4">All Events</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.length === 0 ? (
            <p className="col-span-3 text-center text-gray-400">No events found.</p>
          ) : (
            events.map((event) => (
              <div key={event.event_id || event.id} className="border border-secondary/40 p-5 rounded-xl shadow-lg bg-primary hover:border-accent transition-colors group">
                <h2 className="text-xl font-semibold mb-3 text-accent">{event.title}</h2>
                <div className="space-y-2">
                  <p className="text-white/70 flex justify-between">
                    <span className="text-secondary/80">Type:</span> {event.type}
                  </p>
                  <p className="text-white/50 text-xs mt-4 flex justify-between italic">
                    <span>ID:</span> {event.event_id || event.id}
                  </p>
                </div>
                <button className="mt-4 w-full py-2 bg-secondary text-primary font-bold rounded-lg hover:bg-accent transition-colors">
                  View Details
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }