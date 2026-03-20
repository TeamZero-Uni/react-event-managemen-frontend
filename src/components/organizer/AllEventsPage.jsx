import React, { useState, useEffect } from 'react';
import { getAllEvents } from '../../api/api';

export default function AllEventsPage() {
  const [events, setEvents] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. Define the fetch function
    const fetchEvents = async () => {
      try {
        // Note: Depending on your Axios setup, you might need await getAllEvents().data
        const data = await getAllEvents(); 
        setEvents(data);
      } catch (err) {
        setError("Failed to load events");
      } finally {
        setLoading(false);
      }
    };

    // 2. Call the fetch function safely inside the useEffect
    fetchEvents();
  }, []);

  // 3. Loading check
  if (isLoading) {
    return <div className="w-full h-screen flex items-center justify-center text-xl">Loading events... ⏳</div>;
  }

  // 4. Error check
  if (error) {
    return <div className="w-full h-screen flex items-center justify-center text-red-500 text-xl">{error}</div>;
  }

  // 5. The Main UI (Now safely inside the component function)
  return (
    <div className="w-full min-h-screen p-8 text-black bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-center">All Events</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.length === 0 ? (
          <p className="col-span-3 text-center text-gray-500">No events found.</p>
        ) : (
          events.map((event) => (
            /* IMPORTANT: If your Spring Boot database uses 'event_id' instead of 'id', 
               change 'event.id' to 'event.event_id' below! 
            */
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