import React, { useState, useEffect } from 'react';
import { getAllEvents } from '../../api/api';

export default function AllEventsPage() {
  const [events, setEvents] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getAllEvents(); 
        // ✅ FIXED: handles plain array, { data: [] }, or { content: [] }
        setEvents(Array.isArray(data) ? data : data.data || data.content || []);
      } catch (err) {
        setError("Failed to load events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (isLoading) {
    return <div className="w-full h-screen flex items-center justify-center text-xl">Loading events... ⏳</div>;
  }

  if (error) {
    return <div className="w-full h-screen flex items-center justify-center text-red-500 text-xl">{error}</div>;
  }

  return (
    <div className="w-full min-h-screen p-8 text-black bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-center">All Events</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.length === 0 ? (
          <p className="col-span-3 text-center text-gray-500">No events found.</p>
        ) : (
          events.map((event) => (
            <div key={event.event_id || event.id} className="border p-4 rounded-lg shadow-md bg-white">
              <h2 className="text-xl font-semibold mb-2">{event.title}</h2>
              <p className="text-gray-600">Type: {event.type}</p>
              <p className="text-gray-500 text-sm mt-2">Event ID: {event.event_id || event.id}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}