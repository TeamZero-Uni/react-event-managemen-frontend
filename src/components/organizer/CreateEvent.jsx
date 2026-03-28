import React from 'react';

export default function CreateEvent() {
  const handleCancel = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-300 p-4">
      
      {/* Form container now has a light background (white) */}
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl border-t-4 border-secondary">
        
        {/* Title changed back to primary color for readability on light background */}
        <h2 className="text-2xl font-bold text-primary mb-6 text-center">Create New Event</h2>
        
        <form className="flex flex-col gap-5">
          {/* Title */}
          <div className="flex flex-col gap-1">
            <label htmlFor="title" className="text-sm font-semibold text-primary">Event Title</label>
            <input type="text" id="title" name="title" placeholder="Enter event title" required 
                   className="p-3 border border-gray-300 rounded text-primary bg-white focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary transition-all" />
          </div>

          {/* Event Type */}
          <div className="flex flex-col gap-1">
            <label htmlFor="type" className="text-sm font-semibold text-primary">Event Type</label>
            <select id="type" name="type" defaultValue="" required
                    className="p-3 border border-gray-300 rounded text-primary bg-white focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary transition-all">
              <option value="" disabled>Select a type...</option>
              <option value="CONFERENCE">Conference</option>
              <option value="FESTIVAL">Festival</option>
              <option value="MEETUP">Meetup</option>
              <option value="SEMINAR">Seminar</option>
              <option value="WORKSHOP">Workshop</option>
            </select>
          </div>

          {/* Date & Times */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex flex-col gap-1 flex-1">
              <label htmlFor="event_date" className="text-sm font-semibold text-primary">Date</label>
              <input type="date" id="event_date" name="event_date" required 
                     className="p-3 border border-gray-300 rounded text-primary bg-white focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary transition-all" />
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label htmlFor="start_time" className="text-sm font-semibold text-primary">Start Time</label>
              <input type="time" id="start_time" name="start_time" required 
                     className="p-3 border border-gray-300 rounded text-primary bg-white focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary transition-all" />
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label htmlFor="end_time" className="text-sm font-semibold text-primary">End Time</label>
              <input type="time" id="end_time" name="end_time" required 
                     className="p-3 border border-gray-300 rounded text-primary bg-white focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary transition-all" />
            </div>
          </div>

          {/* Venue & Participants */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Venue Dropdown (Replaced Number Input) */}
            <div className="flex flex-col gap-1 flex-1">
              <label htmlFor="venue_id" className="text-sm font-semibold text-primary">Venue</label>
              <select id="venue_id" name="venue_id" defaultValue="" required 
                     className="p-3 border border-gray-300 rounded text-primary bg-white focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary transition-all">
                <option value="" disabled>Select a venue...</option>
                {/* The values here would be the actual venue_id from your database */}
                <option value="1">Main Auditorium</option>
                <option value="2">Grand Convention Hall</option>
                <option value="3">Tech Hub Center</option>
                <option value="4">Open Air Pavilion</option>
              </select>
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label htmlFor="max_participants" className="text-sm font-semibold text-primary">Max Participants</label>
              <input type="number" id="max_participants" name="max_participants" placeholder="e.g. 500" required 
                     className="p-3 border border-gray-300 rounded text-primary bg-white focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary transition-all" />
            </div>
          </div>

          {/* Poster Image Upload */}
          <div className="flex flex-col gap-1">
            <label htmlFor="poster_file" className="text-sm font-semibold text-primary">Upload Poster Image</label>
            <input type="file" id="poster_file" name="poster_file" accept="image/*"
                   className="p-3 border border-gray-300 rounded text-primary bg-white focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary transition-all 
                              file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-primary hover:file:bg-accent cursor-pointer" />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1">
            <label htmlFor="description" className="text-sm font-semibold text-primary">Description</label>
            <textarea id="description" name="description" rows="4" placeholder="Tell us about the event..." required
                      className="p-3 border border-gray-300 rounded text-primary bg-white focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary transition-all"></textarea>
          </div>

          {/* Hidden Field for Status */}
          <input type="hidden" name="status" value="PENDING" />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <button 
              type="submit" 
              className="w-full sm:w-2/3 bg-secondary hover:bg-accent text-primary font-bold text-lg py-3 rounded transition-colors duration-200 active:scale-[0.98]">
              Create Event
            </button>
            <button 
              type="button" 
              onClick={handleCancel}
              className="w-full sm:w-1/3 bg-transparent border-2 border-secondary text-secondary hover:bg-secondary hover:text-primary font-bold text-lg py-3 rounded transition-colors duration-200 active:scale-[0.98]">
              Cancel
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
}