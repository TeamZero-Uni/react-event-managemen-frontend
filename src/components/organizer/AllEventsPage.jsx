import React, { useState, useRef, useEffect } from 'react';
import { useEvents } from '../../hook/useEvents';
import Modal from './Modal';
import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react';

// NEW: Custom Calendar Picker Component — replaces the ugly default date input
function CalendarPicker({ dateFilter, setDateFilter, bookedDates }) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const pickerRef = useRef(null);

  // Close calendar when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Go to previous month
  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  // Go to next month
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  // Build the day grid for current view month
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const totalDays = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const today = new Date().toISOString().slice(0, 10);

  const monthNames = ['January','February','March','April','May','June',
                      'July','August','September','October','November','December'];
  const dayNames = ['Su','Mo','Tu','We','Th','Fr','Sa'];

  // When a day is clicked — set the date filter and close
  const handleDayClick = (day) => {
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    setDateFilter(`${viewYear}-${mm}-${dd}`);
    setIsOpen(false);
  };

  // Format the selected date nicely for the button label
  const formatLabel = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  return (
    <div className="relative" ref={pickerRef}>

      {/* Calendar trigger button */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsOpen(o => !o)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors text-sm font-medium
            ${dateFilter
              ? 'border-accent text-accent bg-accent/10'
              : 'border-secondary/40 text-white/70 hover:border-accent hover:text-accent bg-primary'
            }`}
        >
          <Calendar size={15} />
          {dateFilter ? formatLabel(dateFilter) : 'Pick a Date'}
        </button>

        {/* Clear button — only shows when a date is selected */}
        {dateFilter && (
          <button
            onClick={() => setDateFilter('')}
            className="p-1.5 rounded-lg border border-secondary/40 text-secondary hover:text-red-400 hover:border-red-400/40 transition-colors"
            title="Clear date"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Calendar dropdown popup */}
      {isOpen && (
        <div className="absolute top-11 left-0 z-50 bg-[#0d1a2d] border border-secondary/30 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] p-4 w-72">

          {/* Month navigation header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg hover:bg-white/10 text-secondary hover:text-accent transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-white font-semibold text-sm">
              {monthNames[viewMonth]} {viewYear}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg hover:bg-white/10 text-secondary hover:text-accent transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Day name headers */}
          <div className="grid grid-cols-7 mb-2">
            {dayNames.map(d => (
              <div key={d} className="text-center text-xs text-secondary/60 font-medium py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-y-1">

            {/* Empty cells before the first day */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* Actual day cells */}
            {Array.from({ length: totalDays }).map((_, i) => {
              const day = i + 1;
              const mm = String(viewMonth + 1).padStart(2, '0');
              const dd = String(day).padStart(2, '0');
              const dateStr = `${viewYear}-${mm}-${dd}`;

              // Check if this day has events (busy)
              const isBusy = bookedDates.includes(dateStr);
              // Check if this is today
              const isToday = dateStr === today;
              // Check if this is the selected date
              const isSelected = dateStr === dateFilter;

              return (
                <button
                  key={day}
                  onClick={() => handleDayClick(day)}
                  className={`
                    relative w-8 h-8 mx-auto rounded-lg text-xs font-medium transition-all duration-150
                    ${isSelected
                      ? 'bg-accent text-primary font-bold shadow-lg shadow-accent/30'           // Selected — gold
                      : isBusy
                        ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30'  // Busy — red
                        : 'text-white/80 hover:bg-white/10 hover:text-accent'                   // Free — normal
                    }
                  `}
                >
                  {day}
                  {/* Today indicator dot */}
                  {isToday && !isSelected && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend at the bottom */}
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/10 text-xs text-white/50">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-red-500/40 border border-red-500/30" /> Busy
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-accent" /> Selected
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-accent" /> Today
            </span>
          </div>
        </div>
      )}
    </div>
  );
}


export default function AllEventsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  // Existing filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [venueFilter, setVenueFilter] = useState("ALL");

  // Date filter state
  const [dateFilter, setDateFilter] = useState('');

  const { events, loading, error } = useEvents(); 

  if (loading) {
    return <div className="w-full h-screen flex items-center justify-center text-accent text-xl bg-primary">Loading events... ⏳</div>;
  }

  if (error) {
    return <div className="w-full h-screen flex items-center justify-center text-red-400 text-xl bg-primary">{error}</div>;
  }

  // Existing: Extract unique statuses and venues dynamically from the data
  const uniqueStatuses = [...new Set(events.map(e => e.status).filter(Boolean))];
  const uniqueVenues = [...new Set(events.map(e => e.venue?.placeName).filter(Boolean))];

  // Extract all event dates that are already booked
  const bookedDates = [...new Set(
    events
      .map(e => e.eventDate ? e.eventDate.slice(0, 10) : null)
      .filter(Boolean)
  )];

  // Check if the selected date is already booked
  const isSelectedDateBooked = dateFilter && bookedDates.includes(dateFilter);

  // Count how many events are on the selected date
  const eventsOnSelectedDate = dateFilter
    ? events.filter(e => e.eventDate && e.eventDate.slice(0, 10) === dateFilter)
    : [];

  // Filter events — includes date filter
  const filteredEvents = events.filter(event => {
    const matchSearch = (event.title || '').toLowerCase().includes(searchTerm.trim().toLowerCase());
    const matchStatus = statusFilter === "ALL" || event.status === statusFilter;
    const matchVenue = venueFilter === "ALL" || event.venue?.placeName === venueFilter;
    const matchDate = !dateFilter || (event.eventDate && event.eventDate.slice(0, 10) === dateFilter);
    return matchSearch && matchStatus && matchVenue && matchDate;
  });

  return (
  <>
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      event={selectedEvent}
      className="max-w-2xl"
    ></Modal>

    <div className="w-full min-h-screen p-8 text-white bg-primary">
      <div className="mb-6 pb-4 border-b border-secondary/20 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold text-secondary">All Events</h1>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by event name..."
          className="p-2 bg-primary border border-secondary/40 text-white rounded-lg focus:outline-none focus:border-accent w-full md:w-64"
        />
      </div>
      
      {/* Existing: Filter UI Dropdowns + NEW: Beautiful Calendar Picker */}
      <div className="flex flex-col md:flex-row gap-4 mb-4 items-start md:items-center">
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

        {/* NEW: Beautiful custom calendar picker replaces ugly default date input */}
        <CalendarPicker
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          bookedDates={bookedDates}
        />
      </div>

      {/* Date availability status banner */}
      {dateFilter && (
        <div className={`mb-6 p-4 rounded-xl border flex flex-col md:flex-row md:items-center md:justify-between gap-2 ${
          isSelectedDateBooked
            ? 'bg-red-500/10 border-red-500/30 text-red-300'
            : 'bg-green-500/10 border-green-500/30 text-green-300'
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{isSelectedDateBooked ? '🔴' : '🟢'}</span>
            <div>
              <p className="font-semibold text-base">
                {new Date(dateFilter + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                })}
              </p>
              <p className="text-sm opacity-80">
                {isSelectedDateBooked
                  ? `${eventsOnSelectedDate.length} event(s) already scheduled — this day is busy`
                  : 'No events scheduled — this day is free ✅'
                }
              </p>
            </div>
          </div>

          {/* Show event names on busy date */}
          {isSelectedDateBooked && (
            <div className="text-sm opacity-80 md:text-right">
              <p className="font-medium mb-1">Events on this day:</p>
              <ul className="space-y-0.5">
                {eventsOnSelectedDate.map(e => (
                  <li key={e.event_id || e.id}>• {e.title}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.length === 0 ? (
          <p className="col-span-3 text-center text-gray-400">
            {dateFilter ? `No events found on this date.` : 'No events found.'}
          </p>
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
                
                <div className="space-y-2 grow pb-[9px]">
                  <p className="text-white/70 flex justify-between">
                    <span className="text-secondary/80">Status:</span> {event.status || 'N/A'}
                  </p>
                  <p className="text-white/70 flex justify-between">
                    <span className="text-secondary/80">Venue:</span> {event.venue?.placeName || 'N/A'}
                  </p>
                  {/* Show event date on each card */}
                  <p className="text-white/70 flex justify-between">
                    <span className="text-secondary/80">Date:</span>
                    {event.eventDate
                      ? new Date(event.eventDate + 'T00:00:00').toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric'
                        })
                      : 'N/A'
                    }
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