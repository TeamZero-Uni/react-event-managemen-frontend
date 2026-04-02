import React from 'react';
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
          events.map((event) => {
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
                
                <div className="space-y-2 flex-grow">
                  <p className="text-white/70 flex justify-between">
                    <span className="text-secondary/80">Type:</span> {event.type || 'N/A'}
                  </p>
                  <p className="text-white/50 text-xs mt-4 flex justify-between italic">
                    <span>ID:</span> {event.event_id || event.id}
                  </p>
                </div>
                
                <button className="mt-auto w-full py-2 bg-secondary text-primary font-bold rounded-lg hover:bg-accent transition-colors">
                  View Details
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}