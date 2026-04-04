import React from 'react';
import { Link } from 'react-router-dom';


export default function MyEventsPage() {
  return (
    <div className="w-full min-h-screen p-8 text-white bg-primary">
      
      <div className="flex items-center justify-between mb-8 border-b border-secondary/20 pb-4">
        <h1 className="text-3xl font-bold text-secondary">My Events</h1>
        <Link to="/organizer/create-event" className="flex items-center gap-2 bg-secondary hover:bg-accent text-white font-semibold px-5 py-3 rounded-xl transition-colors">
          + Create New Event
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <p className="col-span-3 text-center text-gray-400">No events found.</p>
      </div>
    </div>
  );
}