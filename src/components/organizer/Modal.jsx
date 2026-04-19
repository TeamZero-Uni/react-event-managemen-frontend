export default function Modal({ isOpen, onClose, event }) {
  if (!isOpen) return null;

  // 🔧 replace this with real data later
  const registeredCount = 42; 
  const maxCapacityRaw = event?.maxParticipants ?? event?.max_participants;
  const maxCapacity = Number(maxCapacityRaw);
  const hasMaxCapacity = Number.isFinite(maxCapacity) && maxCapacity > 0;
  const venueCapacityRaw = event?.venue?.capacity ?? event?.capacity;
  const venueCapacity = Number(venueCapacityRaw);
  const hasVenueCapacity = Number.isFinite(venueCapacity) && venueCapacity > 0;
  const fillPercentage = hasMaxCapacity
    ? Math.min((registeredCount / maxCapacity) * 100, 100)
    : 0;

  const formatTime = (timeValue) => {
    if (!timeValue) return 'N/A';
    const [hh, mm] = String(timeValue).split(':');
    const hours = Number(hh);
    const minutes = Number(mm);

    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
      return String(timeValue);
    }

    const suffix = hours >= 12 ? 'pm' : 'am';
    const displayHour = hours % 12 || 12;
    return `${displayHour}.${String(minutes).padStart(2, '0')} ${suffix}`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-primary border border-secondary/40 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-accent">{event?.title}</h2>
          <button onClick={onClose} className="text-white/50 hover:text-white text-2xl">✕</button>
        </div>

        {/* Image + Title + Status + Type */}
        <div className="flex gap-4 mb-4">
          {event?.posterUrl ? (
            <img
              src={event.posterUrl}
              alt={event.title}
              className="w-32 h-32 object-cover rounded-lg shrink-0"
            />
          ) : (
            <div className="w-32 h-32 flex items-center justify-center rounded-lg bg-secondary/10 text-white/50 text-xs shrink-0">
              No Image
            </div>
          )}

          <div className="flex flex-col justify-center gap-2">
            <h3 className="text-white font-semibold text-lg">{event?.title}</h3>
            <span className={`px-4 py-1.5 rounded-full font-bold text-xs tracking-widest uppercase border w-fit
              ${event?.status === 'PENDING'  ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' :
                event?.status === 'APPROVED' ? 'bg-green-500/20  text-green-400  border-green-500/40'  :
                                               'bg-red-500/20    text-red-400    border-red-500/40'}`}>
              ● {event?.status}
            </span>
            <p className="text-secondary/80 text-sm">{event?.type}</p>
          </div>
        </div>

        {/* Description */}
        <div className="mb-4 p-3 bg-secondary/10 rounded-lg">
          <p className="text-secondary/80 text-xs uppercase tracking-widest mb-1">Description</p>
          <p className="text-white/80 text-sm">{event?.description || 'N/A'}</p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 bg-secondary/10 rounded-lg">
            <p className="text-secondary/80 text-xs uppercase tracking-widest mb-1">Event Date</p>
            <p className="text-white font-medium">{event?.eventDate || 'N/A'}</p>
          </div>
          <div className="p-3 bg-secondary/10 rounded-lg">
            <p className="text-secondary/80 text-xs uppercase tracking-widest mb-1">Time</p>
            <p className="text-white font-medium">{formatTime(event?.startTime)} → {formatTime(event?.endTime)}</p>
          </div>
          <div className="p-3 bg-secondary/10 rounded-lg">
            <p className="text-secondary/80 text-xs uppercase tracking-widest mb-1">Max Capacity</p>
            <p className="text-white font-medium">{hasMaxCapacity ? maxCapacity : 'N/A'}</p>
          </div>
          <div className="p-3 bg-secondary/10 rounded-lg">
            <p className="text-secondary/80 text-xs uppercase tracking-widest mb-1">Budget</p>
            <p className="text-white font-medium">{event?.budget ?? 'N/A'}</p>
          </div>
        </div>

        {/* Venue + Capacity Highlight */}
        <div className="mb-4 p-4 bg-secondary/10 rounded-lg border border-secondary/20">
          <p className="text-secondary/80 text-xs uppercase tracking-widest mb-3">Venue</p>
          <p className="text-white font-bold text-base">{event?.venue?.placeName || 'N/A'}</p>

          <div className="mt-3 pt-3 border-t border-secondary/20 grid grid-cols-2 gap-3">

            {/* Max Capacity */}
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-center">
              <p className="text-blue-400 text-xs uppercase tracking-widest mb-1">Max Capacity</p>
              <p className="text-blue-300 font-bold text-2xl">{hasMaxCapacity ? maxCapacity : '—'}</p>
              <p className="text-blue-400/60 text-xs mt-1">event limit</p>
            </div>

            {/* Registered - placeholder */}
            <div className="p-3 bg-accent/10 border border-accent/30 rounded-lg text-center">
              <p className="text-accent text-xs uppercase tracking-widest mb-1">Registered</p>
              <p className="text-accent font-bold text-2xl">{registeredCount}</p>
              <p className="text-accent/60 text-xs mt-1">members joined</p>
            </div>

          </div>

          <div className="mt-3 pt-3 border-t border-secondary/20 text-xs text-white/65 flex items-center justify-between">
            <span className="uppercase tracking-wide text-secondary/70">Venue Capacity</span>
            <span className="font-semibold text-white/80">{hasVenueCapacity ? venueCapacity : 'N/A'}</span>
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-white/50 mb-1">
              <span>Filling up</span>
              <span>{registeredCount} / {hasMaxCapacity ? maxCapacity : '—'}</span>
            </div>
            <div className="w-full bg-secondary/20 rounded-full h-2">
              <div
                className="bg-accent h-2 rounded-full transition-all"
                style={{ width: `${fillPercentage}%` }}>
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-secondary/60 text-xs uppercase tracking-wide">Availability</span>
            <span className={event?.venue?.isAvailable ? 'text-green-400 font-semibold text-sm' : 'text-red-400 font-semibold text-sm'}>
              {event?.venue?.isAvailable ? '✓ Available' : '✗ Unavailable'}
            </span>
          </div>
        </div>

        {/* Created By */}
        <div className="mb-4 p-4 bg-secondary/10 rounded-lg border border-secondary/20">
          <p className="text-secondary/80 text-xs uppercase tracking-widest mb-3">Created By</p>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-accent font-bold text-lg shrink-0">
              {event?.createdBy?.fullname?.charAt(0)}
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-white font-bold text-base leading-tight">{event?.createdBy?.fullname}</p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-secondary/20">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-secondary/60 w-16 text-xs uppercase tracking-wide">Email</span>
              <span className="text-white/80">{event?.createdBy?.email}</span>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-2 bg-secondary text-primary font-bold rounded-lg hover:bg-accent transition-colors">
          Close
        </button>

      </div>
    </div>
  );
}