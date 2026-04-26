import React, { useState, useEffect, useMemo } from 'react'
import { FaClock, FaCheck, FaTimes } from 'react-icons/fa'
import { useEvents } from '../../hook/useEvents'
import { updateEvent } from '../../api/api'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1/'

const getEventImage = (event) => {
  const rawImage = event?.posterUrl || event?.image || event?.imageUrl || event?.poster_url || event?.thumbnailUrl

  if (!rawImage) {
    return 'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=900'
  }

  if (/^https?:\/\//i.test(rawImage)) {
    return rawImage
  }

  const origin = new URL(apiBaseUrl).origin
  return `${origin}/${String(rawImage).replace(/^\/+/, '')}`
}

const formatDate = (value, options = {}) => {
  if (!value) return '—'

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return String(value)

  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  })
}

const normalizeStatus = (status) => String(status ?? 'PENDING').toUpperCase()

const isPendingStatus = (status) => {
  const normalizedStatus = normalizeStatus(status)
  return normalizedStatus === 'PENDING'
}

const isApprovedStatus = (status) => {
  const normalizedStatus = normalizeStatus(status)
  return normalizedStatus === 'ACCEPTED'
}

const isRejectedStatus = (status) => {
  const normalizedStatus = normalizeStatus(status)
  return normalizedStatus === 'REJECTED' || normalizedStatus === 'CANCELED'
}

const getStatusLabel = (status) => {
  const normalizedStatus = normalizeStatus(status)

  if (normalizedStatus === 'COMPLETED') return 'Completed'
  if (isApprovedStatus(normalizedStatus)) return 'Approved'
  if (isRejectedStatus(normalizedStatus)) return 'Rejected'
  if (isPendingStatus(normalizedStatus)) return 'Pending Review'
  return String(status ?? 'Unknown')
}

const getVenueLabel = (event) => {
  const venue = event?.venue

  if (typeof venue === 'string') return venue
  if (venue && typeof venue === 'object') {
    return venue?.placeName || venue?.name || venue?.venueName || venue?.title 
  }

  return event?.placeName || event?.venueName || event?.venue_name 
}

const statusStyles = {
  ACCEPTED: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/25',
  REJECTED: 'bg-rose-500/15 text-rose-300 border-rose-400/25',
  CANCELED: 'bg-rose-500/15 text-rose-300 border-rose-400/25',
  COMPLETED: 'bg-sky-500/15 text-sky-300 border-sky-400/25',
  PENDING: 'bg-[#6d4630] text-[#ff9f1a] border-[#ff9f1a]/20',
}




export default function EventApproval() {
  const { events: contextEvents = [], loading, error: loadError } = useEvents()
  const [events, setEvents] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('PENDING')
  const [updatingEventId, setUpdatingEventId] = useState(null)
  const [actionError, setActionError] = useState('')
        




  useEffect(() => {
    const eventsList = Array.isArray(contextEvents) ? contextEvents : []
    setEvents(eventsList)
  }, [contextEvents])

  const statusCounts = useMemo(() => {
    return events.reduce(
      (counts, event) => {
        const status = event?.status

        if (isPendingStatus(status)) counts.pending += 1
        else if (isApprovedStatus(status)) counts.approved += 1
        else if (isRejectedStatus(status)) counts.rejected += 1

        return counts
      },
      { pending: 0, approved: 0, rejected: 0 }
    )
  }, [events])

  const stats = [
    {
      title: 'Pending',
      value: statusCounts.pending.toString(),
      category: 'PENDING',
      icon: FaClock,
      iconBg: 'bg-[#7a4b22]',
      iconColor: 'text-[#ff9f1a]',
    },
    {
      title: 'Approved',
      value: statusCounts.approved.toString(),
      category: 'ACCEPTED',
      icon: FaCheck,
      iconBg: 'bg-[#0f5b4e]',
      iconColor: 'text-[#15d28f]',
    },
    {
      title: 'Rejected',
      value: statusCounts.rejected.toString(),
      category: 'CANCELED',
      icon: FaTimes,
      iconBg: 'bg-[#59315d]',
      iconColor: 'text-[#ff5c7a]',
    },
  ]

  const filteredEvents = events.filter((event) => {
    const status = normalizeStatus(event?.status)

    if (selectedCategory === 'PENDING') return isPendingStatus(status)
    if (selectedCategory === 'ACCEPTED') return isApprovedStatus(status)
    if (selectedCategory === 'CANCELED') return isRejectedStatus(status)

    return status === selectedCategory
  })

  const handleDecision = async (eventId, nextStatus) => {
    if (!eventId) return

    try {
      setActionError('')
      setUpdatingEventId(eventId)

      await updateEvent(eventId, { status: nextStatus })

      setEvents((prevEvents) => prevEvents.map((event) => {
        const currentId = event?.event_id || event?.id
        if (String(currentId) === String(eventId)) {
          return { ...event, status: nextStatus }
        }
        return event
      }))
    } catch (error) {
      console.error('Failed to update event status:', error)
      setActionError('Failed to update event status. Please try again.')
    } finally {
      setUpdatingEventId(null)
    }
  }

  const formatSubmittedDate = (event) => {
    const submittedValue = event?.submittedAt || event?.createdAt || event?.submitted_on || event?.created_on
    return formatDate(submittedValue)
  }

  const formatEventDate = (event) => {
    return formatDate(event?.eventDate || event?.event_date || event?.date)
  }

  return (
    <section className="flex h-full min-h-0 w-full max-w-7xl flex-col overflow-hidden rounded-2xl bg-[#081a31] px-4 py-5 text-white sm:px-6 md:px-8 md:py-7">
      <div className="mb-6 shrink-0">
        <h1 className="font-serif text-[26px] font-bold leading-none text-white sm:text-[30px] md:text-[36px]">
          Event Approvals
        </h1>
        <p className="mt-3 text-sm text-white/65 sm:text-[15px] md:text-[16px]">
          Review and approve pending event requests
        </p>
      </div>

      <div className="grid shrink-0 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map(({ title, value, category, icon: Icon, iconBg, iconColor }) => (
          <button
            type="button"
            key={title}
            onClick={() => setSelectedCategory(category)}
            className={`group flex min-h-[86px] items-center gap-4 rounded-xl border px-4 py-4 text-left shadow-[0_10px_24px_rgba(0,0,0,0.22)] transition-all duration-200 active:translate-y-0 sm:px-5 ${
              selectedCategory === category
                ? 'border-white/30 bg-[#1a3d66] ring-1 ring-white/25'
                : 'border-white/12 bg-[#102847] hover:-translate-y-0.5 hover:border-white/20 hover:bg-[#14365f] hover:shadow-[0_14px_30px_rgba(0,0,0,0.28)]'
            }`}
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-full ${iconBg} ring-1 ring-white/10 transition-transform duration-200 group-hover:scale-105`}>
              <Icon className={`text-[22px] ${iconColor}`} />
            </div>

            <div className="leading-tight">
              <div className="text-[24px] font-semibold text-white sm:text-[28px]">{value}</div>
              <div className="mt-1 text-[13px] font-medium text-white/72 group-hover:text-white/85 sm:text-[14px]">
                {title}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-6 min-h-0 flex-1 overflow-y-auto pr-1">
        {loading && (
          <div className="rounded-xl border border-white/10 bg-[#0d2544] px-5 py-8 text-center text-white/55">
            Loading events...
          </div>
        )}

        {!loading && loadError && (
          <div className="rounded-xl border border-rose-400/20 bg-rose-500/10 px-5 py-8 text-center text-rose-200">
            {loadError}
          </div>
        )}

        {!loading && !loadError && (
          <div className="space-y-4 pb-1">
            {filteredEvents.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-[#0d2544] px-5 py-8 text-center text-white/55">
                No {selectedCategory === 'ACCEPTED' ? 'approved' : selectedCategory === 'CANCELED' ? 'rejected' : 'pending'} events found

        {!loading && !loadError && actionError && (
          <div className="mt-6 rounded-xl border border-rose-400/20 bg-rose-500/10 px-5 py-4 text-center text-rose-200">
            {actionError}
          </div>
        )}
              </div>
            ) : (
              filteredEvents.map((event) => {
                const status = normalizeStatus(event?.status)
                const statusClass = statusStyles[status] ?? statusStyles.PENDING
                const eventId = event?.event_id || event?.id
                const isUpdating = String(updatingEventId) === String(eventId)

                return (
                  <article
                    key={event?.event_id || event?.id || event?.title}
                    className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d2544] shadow-[0_14px_35px_rgba(0,0,0,0.24)]"
                  >
                    <div className="p-4 sm:p-5 lg:p-6">
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                          <div className="min-w-0">
                            <h2 className="break-words text-xl font-bold text-white sm:text-2xl md:text-[28px]">
                              {event?.title || 'Untitled Event'}
                            </h2>
                            <p className="mt-2 break-words text-xs text-white/65 sm:text-sm">
                              by {event?.fullname || event?.organizer_name || event?.organizer || 'Organizer'}
                              <span className="mx-2 text-white/30">•</span>
                              Submitted on {formatSubmittedDate(event)}
                            </p>
                          </div>

                          <span className={`self-start rounded-full border px-3 py-1 text-xs font-semibold sm:px-4 sm:text-sm ${statusClass}`}>
                            {getStatusLabel(status)}
                          </span>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                          <div className="rounded-xl bg-[#081a31] px-4 py-3">
                            <p className="text-xs text-white/55">Event Date</p>
                            <p className="mt-1 text-base font-semibold text-white sm:text-lg">{formatEventDate(event)}</p>
                          </div>

                          <div className="rounded-xl bg-[#081a31] px-4 py-3">
                            <p className="text-xs text-white/55">Venue</p>
                            <p className="mt-1 line-clamp-1 text-base font-semibold text-white sm:text-lg">{getVenueLabel(event)}</p>
                          </div>

                          <div className="rounded-xl bg-[#081a31] px-4 py-3">
                            <p className="text-xs text-white/55">Expected Participants</p>
                            <p className="mt-1 text-base font-semibold text-white sm:text-lg">{event?.maxParticipants ?? '—'}</p>
                          </div>

                          <div className="rounded-xl bg-[#081a31] px-4 py-3">
                            <p className="text-xs text-white/55">Type</p>
                            <p className="mt-1 line-clamp-1 text-base font-semibold text-white sm:text-lg">{event?.type || '—'}</p>
                          </div>
                          
                          <div className="rounded-xl bg-[#081a31] px-4 py-3">
                            <p className="text-xs text-white/55">Start Time</p>
                            <p className="mt-1 line-clamp-1 text-base font-semibold text-white sm:text-lg">{event?.startTime || '—'}</p>
                          </div>

                          <div className="rounded-xl bg-[#081a31] px-4 py-3">
                            <p className="text-xs text-white/55">End Time</p>
                            <p className="mt-1 line-clamp-1 text-base font-semibold text-white sm:text-lg">{event?.endTime || '—'}</p>
                          </div> 

                           <div className="rounded-xl bg-[#081a31] px-4 py-3">
                            <p className="text-xs text-white/55">Budget</p>
                            <p className="mt-1 line-clamp-1 text-base font-semibold text-white sm:text-lg">{event?.budget || '—'}</p>
                          </div>

                        </div>

                        <div className="rounded-xl bg-[#081a31] px-4 py-4">
                          <p className="text-sm text-white/55">Description</p>
                          <p className="mt-2 text-sm leading-relaxed text-white/85">
                            {event?.description || 'No description available.'}
                          </p>
                        </div>

                        <div className="relative h-52 w-full overflow-hidden rounded-xl lg:h-64">
                          <img
                            src={getEventImage(event)}
                            alt={event?.title || 'Event poster'}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=900'
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#081a31] via-transparent to-transparent" />
                        </div>

                        {selectedCategory === 'PENDING' && (
                          <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:flex-wrap">
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleDecision(eventId, 'ACCEPTED')}
                              className="w-full rounded-xl bg-emerald-500 px-5 py-3 text-base font-semibold text-white transition-colors hover:bg-emerald-600 sm:w-auto"
                            >
                              {isUpdating ? 'Updating...' : 'Approve'}
                            </button>
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleDecision(eventId, 'CANCELED')}
                              className="w-full rounded-xl bg-rose-500 px-5 py-3 text-base font-semibold text-white transition-colors hover:bg-rose-600 sm:w-auto"
                            >
                              {isUpdating ? 'Updating...' : 'Reject'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                )
              })
            )}
          </div>
        )}
      </div>
    </section>
  )
}