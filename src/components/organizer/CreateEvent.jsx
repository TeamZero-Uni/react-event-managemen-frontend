import React, { useState } from "react";
import { createEvent } from "../../api/api.js"; // adjust path
import { uploadFile } from "../../utils/mediaUpload.js"; // adjust path
import toast from "react-hot-toast";

export default function CreateEvent() {
  const [eventTitle, setEventTitle] = useState("");
  const [eventType, setEventType] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [venueName, setVenueName] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [description, setDescription] = useState("");
  const [posterFile, setPosterFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPosterFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleRemoveFile = () => {
    setPosterFile(null);
    setPreview(null);
    const input = document.getElementById("poster_file");
    if (input) input.value = "";
  };

  const handleCancel = () => {
    window.history.back();
  };

  const resetForm = () => {
    setEventTitle("");
    setEventType("");
    setEventDate("");
    setStartTime("");
    setEndTime("");
    setVenueName("");
    setMaxParticipants("");
    setDescription("");
    setPosterFile(null);
    setPreview(null);
    const input = document.getElementById("poster_file");
    if (input) input.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const token = localStorage.getItem("Token");
      if (!token) {
        toast.error("Please login first.");
        return;
      }

      let posterUrl = "";
      if (posterFile) {
        posterUrl = await uploadFile(posterFile);
      }

      const eventData = {
        eventTitle: eventTitle.trim(),
        eventType,
        venueName,
        eventDate,
        startTime: `${startTime}:00`,
        endTime: `${endTime}:00`,
        maxParticipants: Number(maxParticipants),
        description: description.trim(),
        posterUrl,
        status: "PENDING"
      };

      const response = await createEvent(eventData, token);

      if (response.success) {
        // 1. Show the success toast alert
        toast.success(response.message || "Event created successfully");
        resetForm();
        
        // 2. Wait 1.5 seconds for the user to see the toast, then go back
        setTimeout(() => {
          // If you need a hard refresh of the previous page, using document.referrer is often safer 
          // than window.history.back() in standard JS, but history.back() matches your cancel button.
          if (document.referrer) {
             window.location.href = document.referrer; 
          } else {
             window.history.back();
          }
        }, 1500);

      } else {
        // Show error toast alert
        toast.error(response.message || "Failed to create event");
      }
    } catch (err) {
      // Catch and show server or network errors
      const msg =
        err?.response?.data?.message || err?.message || "Something went wrong";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-300 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl border-t-4 border-secondary">
        <h2 className="text-2xl font-bold text-primary mb-6 text-center">Create New Event</h2>

        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <label htmlFor="title" className="text-sm font-semibold text-primary">Event Title</label>
            <input
              type="text"
              id="title"
              placeholder="Enter event title"
              required
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              className="p-3 border border-gray-300 rounded text-primary bg-white focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary transition-all"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="type" className="text-sm font-semibold text-primary">Event Type</label>
            <select
              id="type"
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

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex flex-col gap-1">
              <label htmlFor="event_date" className="text-sm font-semibold text-primary">Date</label>
              <input
                type="date"
                id="event_date"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded text-primary bg-white focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary transition-all"
              />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <label htmlFor="start_time" className="text-sm font-semibold text-primary">Start Time</label>
              <input
                type="time"
                id="start_time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded text-primary bg-white focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary transition-all"
              />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <label htmlFor="end_time" className="text-sm font-semibold text-primary">End Time</label>
              <input
                type="time"
                id="end_time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded text-primary bg-white focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex flex-col gap-1">
              <label htmlFor="venue_name" className="text-sm font-semibold text-primary">Venue</label>
              <select
                id="venue_name"
                required
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded text-primary bg-white focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary transition-all"
              >
                <option value="" disabled>Select a venue...</option>
                <option value="Main Hall">Main Hall</option>
                <option value="Auditorium">Auditorium</option>
                <option value="Open Ground">Open Ground</option>
              </select>
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <label htmlFor="max_participants" className="text-sm font-semibold text-primary">Max Participants</label>
              <input
                type="number"
                id="max_participants"
                placeholder="e.g. 500"
                required
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded text-primary bg-white focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-primary">Upload Poster Image</label>
            {!posterFile ? (
              <input
                type="file"
                id="poster_file"
                accept="image/*"
                onChange={handleFileChange}
                className="p-3 border border-gray-300 rounded text-primary bg-white focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary transition-all file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-primary hover:file:bg-accent cursor-pointer"
              />
            ) : (
              <div className="border border-gray-300 rounded p-3">
                <img src={preview} alt="preview" className="w-full h-48 object-cover rounded" />
                <p className="text-sm text-green-700 mt-2">
                  {posterFile.name} ({(posterFile.size / 1024).toFixed(1)} KB)
                </p>
                <div className="flex gap-2 mt-3">
                  <label
                    htmlFor="poster_file_change"
                    className="flex-1 text-center cursor-pointer bg-secondary text-primary font-semibold py-2 px-4 rounded hover:bg-accent"
                  >
                    Change Photo
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
                    className="flex-1 bg-red-100 text-red-600 font-semibold py-2 px-4 rounded hover:bg-red-200"
                  >
                    Remove Photo
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="description" className="text-sm font-semibold text-primary">Description</label>
            <textarea
              id="description"
              rows="4"
              placeholder="Tell us about the event..."
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="p-3 border border-gray-300 rounded text-primary bg-white focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary transition-all"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-2/3 bg-secondary hover:bg-accent text-primary font-bold py-3 rounded transition-all active:scale-95 disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create Event"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="w-full sm:w-1/3 border-2 border-secondary text-secondary hover:bg-secondary hover:text-primary font-bold py-3 rounded transition-all active:scale-95"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}