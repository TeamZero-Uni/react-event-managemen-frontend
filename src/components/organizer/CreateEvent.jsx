import React, { useState } from 'react';
import { createEvent } from '../../api/api.js';  // ✅ changed — import createEvent from api.js
import { uploadFile } from '../../utils/mediaUpload.js';            // ✅ changed — use api.js instead of axios directly

export default function CreateEvent() {
  const [eventTitle, setEventTitle] = useState('');
  const [eventType, setEventType] = useState('');
  const [eventDate, setEventDate] = useState('pending');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [venueId, setVenueId] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [description, setDescription] = useState('');
  const [posterFile, setPosterFile] = useState(null);
  const [preview, setPreview] = useState(null);

  // ✅ file handler with preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPosterFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // ✅ remove/clear file handler
  const handleRemoveFile = () => {
    setPosterFile(null);
    setPreview(null);
    document.getElementById('poster_file').value = '';
  };

  // ✅ UPDATED handleSubmit — now uploads to Supabase then sends to backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!posterFile) {
      alert("Please select a poster image!");
      return;
    }

    try {
      // ✅ Step 1 — upload image to Supabase Storage
      const imageUrl = await uploadFile(posterFile);
      console.log("Image URL:", imageUrl);

      // ✅ Step 2 — get token from localStorage
      const token = localStorage.getItem("token");

      // ✅ Step 3 — send all data to Spring Boot backend
      await createEvent(
        {
          eventTitle: eventTitle,
          eventType: eventType,
          eventDate: eventDate,
          startTime: startTime,
          endTime: endTime,
          venueId: venueId,
          maxParticipants: maxParticipants,
          description: description,
          posterUrl: imageUrl,  // ✅ URL from Supabase
          status: "PENDING"
        },
        token
      );

      toast.success("Event created successfully!");

    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to create event!");
    }
  };

  const handleCancel = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-300 p-4">

      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl border-t-4 border-secondary">

        <h2 className="text-2xl font-bold text-primary mb-6 text-center">Create New Event</h2>

        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>

          {/* Title */}
          <div className="flex flex-col gap-1">
            <label htmlFor="title" className="text-sm font-semibold text-primary">Event Title</label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="Enter event title"
              required
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              className="p-3 border border-gray-300 rounded text-primary bg-white focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary transition-all"
            />
          </div>

          {/* Event Type */}
          <div className="flex flex-col gap-1">
            <label htmlFor="type" className="text-sm font-semibold text-primary">Event Type</label>
            <select
              id="type"
              name="type"
              required
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="p-3 border border-gray-300 rounded text-primary bg-white focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary transition-all"
            >
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
              <input
                type="date"
                id="event_date"
                name="event_date"
                required
                value={eventDate === 'pending' ? '' : eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="p-3 border border-gray-300 rounded text-primary bg-white focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary transition-all"
              />
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label htmlFor="start_time" className="text-sm font-semibold text-primary">Start Time</label>
              <input
                type="time"
                id="start_time"
                name="start_time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="p-3 border border-gray-300 rounded text-primary bg-white focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary transition-all"
              />
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label htmlFor="end_time" className="text-sm font-semibold text-primary">End Time</label>
              <input
                type="time"
                id="end_time"
                name="end_time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="p-3 border border-gray-300 rounded text-primary bg-white focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary transition-all"
              />
            </div>
          </div>

          {/* Venue & Participants */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex flex-col gap-1 flex-1">
              <label htmlFor="venue_id" className="text-sm font-semibold text-primary">Venue</label>
              <select
                id="venue_id"
                name="venue_id"
                required
                value={venueId}
                onChange={(e) => setVenueId(e.target.value)}
                className="p-3 border border-gray-300 rounded text-primary bg-white focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary transition-all"
              >
                <option value="" disabled>Select a venue...</option>
                <option value="1">Main Auditorium</option>
                <option value="2">Grand Convention Hall</option>
                <option value="3">Tech Hub Center</option>
                <option value="4">Open Air Pavilion</option>
              </select>
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label htmlFor="max_participants" className="text-sm font-semibold text-primary">Max Participants</label>
              <input
                type="number"
                id="max_participants"
                name="max_participants"
                placeholder="e.g. 500"
                required
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
                className="p-3 border border-gray-300 rounded text-primary bg-white focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary transition-all"
              />
            </div>
          </div>

          {/* Poster Image Upload */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-primary">Upload Poster Image</label>

            {!posterFile && (
              <input
                type="file"
                id="poster_file"
                name="poster_file"
                accept="image/*"
                onChange={handleFileChange}
                className="p-3 border border-gray-300 rounded text-primary bg-white focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary transition-all file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-primary hover:file:bg-accent cursor-pointer"
              />
            )}

            {posterFile && (
              <div className="mt-2 border border-gray-300 rounded p-3 flex flex-col gap-2">
                <img
                  src={preview}
                  alt="Poster Preview"
                  className="w-full h-48 object-cover rounded border border-gray-200"
                />
                <p className="text-sm text-green-700 font-medium">
                  ✅ {posterFile.name} ({(posterFile.size / 1024).toFixed(1)} KB)
                </p>
                <div className="flex gap-2">
                  <label
                    htmlFor="poster_file_change"
                    className="flex-1 text-center cursor-pointer bg-secondary text-primary font-semibold text-sm py-2 px-4 rounded hover:bg-accent transition-colors">
                    📷 Change Photo
                  </label>
                  <input
                    type="file"
                    id="poster_file_change"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="flex-1 bg-red-100 text-red-600 font-semibold text-sm py-2 px-4 rounded hover:bg-red-200 transition-colors">
                    🗑️ Remove Photo
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1">
            <label htmlFor="description" className="text-sm font-semibold text-primary">Description</label>
            <textarea
              id="description"
              name="description"
              rows="4"
              placeholder="Tell us about the event..."
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="p-3 border border-gray-300 rounded text-primary bg-white focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary transition-all"
            />
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