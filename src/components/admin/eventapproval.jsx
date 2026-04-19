import React, { useState, useEffect } from 'react'
import { FaClock, FaCheck, FaTimes } from 'react-icons/fa'
import { getAllEvents } from '../../api/api'



const getListFromResponse = (data) => {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.data?.content)) return data.data.content
  if (Array.isArray(data?.data?.events)) return data.data.events
  return []
}

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

const getStatusLabel = (status) => {
  const normalizedStatus = normalizeStatus(status)

  if (normalizedStatus === 'ACCEPTED') return 'Approved'
  if (normalizedStatus === 'REJECTED') return 'Rejected'
  if (normalizedStatus === 'PENDING') return 'Pending Review'
  return 'Pending Review'
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
  PENDING: 'bg-[#6d4630] text-[#ff9f1a] border-[#ff9f1a]/20',
}




export default function EventApproval() {
  const [events, setEvents] = useState([])
  const [eventsPendingApproval, setEventsPendingApproval] = useState(0)
  const [totalApprovedEvents, setTotalApprovedEvents] = useState(0)
  const [eventsRejected, setEventsRejected] = useState(0) 
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('PENDING')

  const updateCounts = (eventsList) => {
    const pendingCount = eventsList.filter((event) => {
      const status = normalizeStatus(event?.status)
      return status === 'PENDING' || status === 'PENDING_APPROVAL'
    }).length

    const approvedCount = eventsList.filter(
      (event) => normalizeStatus(event?.status) === 'ACCEPTED'
    ).length

    const rejectedCount = eventsList.filter(
      (event) => normalizeStatus(event?.status) === 'REJECTED'
    ).length

    setEventsPendingApproval(pendingCount)
    setTotalApprovedEvents(approvedCount)
    setEventsRejected(rejectedCount)
  }
        




  useEffect(() => {
    const fetchEventStatusCounts = async () => {
      try {
        setLoading(true)
        setLoadError('')
        const data = await getAllEvents()
        const eventsList = getListFromResponse(data)

        updateCounts(eventsList)
        setEvents(eventsList)
      } catch (error) {
        setLoadError('Failed to load events. Please try again.')
        console.error('Failed to fetch event status counts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEventStatusCounts()
  }, [])

  const handleDecision = (eventId, nextStatus) => {
    setEvents((prevEvents) => {
      const updatedEvents = prevEvents.map((event) => {
        const currentId = event?.event_id || event?.id
        if (currentId === eventId) {
          return { ...event, status: nextStatus }
        }
        return event
      })

      updateCounts(updatedEvents)
      return updatedEvents
    })
  }

  const stats = [
    {
      title: 'Pending',
      value: eventsPendingApproval.toString(),
      category: 'PENDING',
      icon: FaClock,
      iconBg: 'bg-[#7a4b22]',
      iconColor: 'text-[#ff9f1a]',
    },
    {
      title: 'Approved',
      value: totalApprovedEvents.toString(),
      category: 'ACCEPTED',
      icon: FaCheck,
      iconBg: 'bg-[#0f5b4e]',
      iconColor: 'text-[#15d28f]',
    },
    {
      title: 'Rejected',
      value: eventsRejected.toString(),
      category: 'REJECTED',
      icon: FaTimes,
      iconBg: 'bg-[#59315d]',
      iconColor: 'text-[#ff5c7a]',
    },
  ]

  const filteredEvents = events.filter((event) => {
    const status = normalizeStatus(event?.status)

    if (selectedCategory === 'PENDING') {
      return status === 'PENDING' || status === 'PENDING_APPROVAL'
    }

    return status === selectedCategory
  })

  const formatSubmittedDate = (event) => {
    const submittedValue = event?.submittedAt || event?.createdAt || event?.submitted_on || event?.created_on
    return formatDate(submittedValue)
  }

  const formatEventDate = (event) => {
    return formatDate(event?.eventDate || event?.event_date || event?.date)
  }

  return (
    <section className="w-full max-w-7xl rounded-2xl bg-[#081a31] px-4 py-5 text-white sm:px-6 md:px-8 md:py-7">
      <div className="mb-6">
        <h1 className="font-serif text-[26px] font-bold leading-none text-white sm:text-[30px] md:text-[36px]">
          Event Approvals
        </h1>
        <p className="mt-3 text-sm text-white/65 sm:text-[15px] md:text-[16px]">
          Review and approve pending event requests
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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

      {loading && (
        <div className="mt-6 rounded-xl border border-white/10 bg-[#0d2544] px-5 py-8 text-center text-white/55">
          Loading events...
        </div>
      )}

      {!loading && loadError && (
        <div className="mt-6 rounded-xl border border-rose-400/20 bg-rose-500/10 px-5 py-8 text-center text-rose-200">
          {loadError}
        </div>
      )}

      {!loading && !loadError && (
        <div className="mt-6 space-y-4">
          {filteredEvents.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-[#0d2544] px-5 py-8 text-center text-white/55">
              No {selectedCategory === 'ACCEPTED' ? 'approved' : selectedCategory === 'REJECTED' ? 'rejected' : 'pending'} events found
            </div>
          ) : (
            filteredEvents.map((event) => {
              const status = normalizeStatus(event?.status)
              const statusClass = statusStyles[status] ?? statusStyles.PENDING
              const eventId = event?.event_id || event?.id

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
                            onClick={() => handleDecision(eventId, 'ACCEPTED')}
                            className="w-full rounded-xl bg-emerald-500 px-5 py-3 text-base font-semibold text-white transition-colors hover:bg-emerald-600 sm:w-auto"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDecision(eventId, 'REJECTED')}
                            className="w-full rounded-xl bg-rose-500 px-5 py-3 text-base font-semibold text-white transition-colors hover:bg-rose-600 sm:w-auto"
                          >
                            Reject
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
    </section>
  )
}
