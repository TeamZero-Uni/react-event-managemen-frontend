import React, { useEffect, useMemo, useState } from 'react'
import { Search, Plus, Award, Mail, Trash2 } from 'lucide-react'
import { getAllEvents, getAllUsers, getOrganizerDetails, getOrganizersCount } from '../../api/api'

const BASE_CATEGORY_OPTIONS = [
  'All Categories',
  'Academic Society',
  'Sports',
  'Technical',
  'Cultural',
]

const getListFromResponse = (data) => {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.content)) return data.content
  if (Array.isArray(data?.users)) return data.users
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.data?.content)) return data.data.content
  if (Array.isArray(data?.data?.users)) return data.data.users
  if (Array.isArray(data?.data?.data)) return data.data.data
  return []
}

const isOrganizerUser = (user) => {
  const directRole = String(user?.role || user?.userRole || user?.user_type || user?.userType || '').toUpperCase()
  if (directRole === 'ORGANIZER' || directRole === 'ROLE_ORGANIZER') return true

  const roles = Array.isArray(user?.roles) ? user.roles : []
  return roles.some((roleItem) => {
    if (typeof roleItem === 'string') {
      const normalized = roleItem.toUpperCase()
      return normalized === 'ORGANIZER' || normalized === 'ROLE_ORGANIZER'
    }

    if (roleItem && typeof roleItem === 'object') {
      const normalized = String(roleItem?.name || roleItem?.role || roleItem?.authority || '').toUpperCase()
      return normalized === 'ORGANIZER' || normalized === 'ROLE_ORGANIZER'
    }

    return false
  })
}

const getOrganizerName = (organizer) => {
  return (
    organizer?.fullname ||
    organizer?.fullName ||
    organizer?.name ||
    organizer?.contactName ||
    'Unnamed Organizer'
  )
}

const getClubName = (organizer) => {
  const clubName = organizer?.clubName || organizer?.club_name || ''

  const organizerName = getOrganizerName(organizer)
  if (!clubName || String(clubName).trim() === String(organizerName).trim()) {
    return 'N/A'
  }

  return clubName
}

const getOrganizerEmail = (organizer) => {
  return organizer?.email || organizer?.contactEmail || organizer?.mail || 'N/A'
}

const getOrganizerUserId = (organizer) => {
  return organizer?.userId || organizer?.user_id || organizer?.user?.userId || organizer?.id || null
}

const getEventOrganizerUserId = (event) => {
  return (
    event?.createdBy?.userId ||
    event?.createdBy?.user_id ||
    event?.createdBy?.id ||
    event?.organizer?.userId ||
    event?.organizer?.user_id ||
    event?.organizerId ||
    event?.organizer_id ||
    event?.userId ||
    event?.user_id ||
    null
  )
}

const getEventsOrganizedCount = (organizer) => {
  const directCount = organizer?.eventsOrganizedCount ?? organizer?.organizedEventsCount ?? organizer?.eventCount
  if (Number.isFinite(Number(directCount))) return Number(directCount)

  if (Array.isArray(organizer?.events)) return organizer.events.length
  if (Array.isArray(organizer?.organizedEvents)) return organizer.organizedEvents.length

  return 0
}

const normalizeCategory = (value) => {
  const raw = String(value || '').trim().toLowerCase()
  if (!raw) return ''
  if (raw.includes('sport')) return 'Sports'
  if (raw.includes('tech') || raw.includes('it')) return 'Technical'
  if (raw.includes('cultur') || raw.includes('art') || raw.includes('music') || raw.includes('drama')) return 'Cultural'
  if (raw.includes('academ') || raw.includes('society')) return 'Academic Society'

  return raw
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

const getCategoryLabel = (organizer) => {
  const categoryField =
    organizer?.category ||
    organizer?.societyType ||
    organizer?.organizationType ||
    organizer?.domain ||
    organizer?.specialization ||
    ''

  const normalizedCategory = normalizeCategory(categoryField)
  if (normalizedCategory) return normalizedCategory

  const name = getOrganizerName(organizer).toLowerCase()
  const combined = `${categoryField} ${name}`.toLowerCase()

  if (combined.includes('sport')) return 'Sports'
  if (combined.includes('tech') || combined.includes('it')) return 'Technical'
  if (combined.includes('cultur') || combined.includes('art') || combined.includes('music') || combined.includes('drama')) return 'Cultural'
  return 'Academic Society'
}

export default function OrganizerManagement() {
  const [organizers, setOrganizers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')

  useEffect(() => {
    const fetchOrganizers = async () => {
      try {
        setLoading(true)
        setError('')

        const [usersResult, organizerDetailsResult, organizersResult, eventsResult] = await Promise.allSettled([
          getAllUsers(),
          getOrganizerDetails(),
          getOrganizersCount(),
          getAllEvents(),
        ])

        const usersList = usersResult.status === 'fulfilled'
          ? getListFromResponse(usersResult.value)
          : []
        const usersOrganizers = usersList.filter((user) => isOrganizerUser(user))
        const usersByUserId = new Map(
          usersList
            .map((user) => [String(getOrganizerUserId(user)), user])
            .filter(([userId]) => userId && userId !== 'null' && userId !== 'undefined')
        )

        const organizerDetailsList = organizerDetailsResult.status === 'fulfilled'
          ? getListFromResponse(organizerDetailsResult.value)
          : []

        const organizersList = organizersResult.status === 'fulfilled'
          ? getListFromResponse(organizersResult.value)
          : []

        const eventsList = eventsResult.status === 'fulfilled'
          ? getListFromResponse(eventsResult.value)
          : []
        const eventCountByUserId = eventsList.reduce((acc, event) => {
          const organizerUserId = getEventOrganizerUserId(event)
          const key = String(organizerUserId)
          if (!organizerUserId || key === 'null' || key === 'undefined') {
            return acc
          }

          acc.set(key, (acc.get(key) || 0) + 1)
          return acc
        }, new Map())

        let organizerList = []

        // Primary source: organizers/all (organizer details with club_name).
        if (organizerDetailsList.length > 0) {
          organizerList = organizerDetailsList.map((detail) => {
            const matchedUser = usersByUserId.get(String(getOrganizerUserId(detail)))
            const resolvedUserId = detail?.userId || detail?.user_id || matchedUser?.userId || matchedUser?.user_id || null
            return {
              ...matchedUser,
              ...detail,
              userId: resolvedUserId,
              clubName: detail?.clubName || detail?.club_name || '',
              eventsOrganizedCount: eventCountByUserId.get(String(resolvedUserId)) || 0,
            }
          })
        } else if (usersOrganizers.length > 0 && organizersList.length > 0) {
          const organizersByUserId = new Map(
            organizersList
              .map((organizer) => [String(getOrganizerUserId(organizer)), organizer])
              .filter(([userId]) => userId && userId !== 'null' && userId !== 'undefined')
          )

          organizerList = usersOrganizers.map((userOrganizer) => {
            const matchedOrganizer = organizersByUserId.get(String(getOrganizerUserId(userOrganizer)))
            const merged = matchedOrganizer ? { ...userOrganizer, ...matchedOrganizer } : userOrganizer
            const mergedUserId = getOrganizerUserId(merged)
            return {
              ...merged,
              eventsOrganizedCount: eventCountByUserId.get(String(mergedUserId)) || 0,
            }
          })
        } else {
          const baseOrganizers = usersOrganizers.length > 0 ? usersOrganizers : organizersList
          organizerList = baseOrganizers.map((organizer) => {
            const organizerUserId = getOrganizerUserId(organizer)
            return {
              ...organizer,
              eventsOrganizedCount: eventCountByUserId.get(String(organizerUserId)) || 0,
            }
          })
        }

        setOrganizers(organizerList)
      } catch (fetchError) {
        console.error('Failed to load organizers:', fetchError)
        setError('Failed to load organizers. Please try again.')
        setOrganizers([])
      } finally {
        setLoading(false)
      }
    }

    fetchOrganizers()
  }, [])

  const filteredOrganizers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    return organizers.filter((organizer) => {
      const name = getOrganizerName(organizer).toLowerCase()
      const clubName = getClubName(organizer).toLowerCase()
      const email = getOrganizerEmail(organizer).toLowerCase()
      const category = getCategoryLabel(organizer)
      const normalizedCategory = category.toLowerCase()

      const matchesSearch =
        query.length === 0 ||
        name.includes(query) ||
        clubName.includes(query) ||
        email.includes(query) ||
        normalizedCategory.includes(query)
      const matchesCategory = selectedCategory === 'All Categories' || category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [organizers, searchTerm, selectedCategory])

  const categoryOptions = useMemo(() => {
    const discovered = organizers
      .map((organizer) => getCategoryLabel(organizer))
      .filter(Boolean)

    const merged = new Set([...BASE_CATEGORY_OPTIONS, ...discovered])
    return Array.from(merged)
  }, [organizers])

  return (
    <section className="w-full max-w-7xl rounded-2xl bg-[#081a31] px-4 py-5 text-white sm:px-6 md:px-8 md:py-7">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-serif text-[26px] font-bold leading-none text-white sm:text-[30px] md:text-[40px]">
            Organizer Management
          </h1>
          <p className="mt-3 text-sm text-white/65 sm:text-[15px] md:text-[16px]">
            Manage event organizers and societies
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-[#d7b430] px-5 py-3 text-base font-semibold text-[#081a31] transition-colors hover:bg-[#e4c553]"
        >
          <Plus size={18} />
          Add Organizer
        </button>
      </div>

      <div className="rounded-xl border border-white/14 bg-[#0e2a4a] p-4">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
          <div className="relative">
            <Search size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/45" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search organizers..."
              className="w-full rounded-xl border border-white/25 bg-[#081f3b] py-3 pl-12 pr-4 text-lg text-white placeholder:text-white/45 outline-none transition-colors focus:border-[#d7b430]"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-[#d7b430] bg-[#081f3b] px-4 py-3 text-lg text-white outline-none focus:border-[#e4c553]"
          >
            {categoryOptions.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="mt-6 rounded-xl border border-white/10 bg-[#0d2544] px-5 py-8 text-center text-white/55">
          Loading organizers...
        </div>
      )}

      {!loading && error && (
        <div className="mt-6 rounded-xl border border-rose-400/20 bg-rose-500/10 px-5 py-8 text-center text-rose-200">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredOrganizers.length === 0 ? (
            <div className="col-span-full rounded-xl border border-white/10 bg-[#0d2544] px-5 py-8 text-center text-white/55">
              No organizers found
            </div>
          ) : (
            filteredOrganizers.map((organizer) => {
              const organizerId = organizer?.id || organizer?.user_id || organizer?.organizer_id || getOrganizerName(organizer)
              const clubName = getClubName(organizer)
              const eventCount = getEventsOrganizedCount(organizer)
              const email = getOrganizerEmail(organizer)

              return (
                <article
                  key={organizerId}
                  className="rounded-2xl border border-white/10 bg-[#0d2544] p-5 shadow-[0_14px_35px_rgba(0,0,0,0.24)]"
                >
                  <div className="mb-3 flex items-start gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#324e54] text-[#d7b430]">
                      <Award size={20} />
                    </div>
                  </div>

                  <div>
                    <h3 className="mt-1 line-clamp-2 text-xl font-semibold text-white">{getOrganizerName(organizer)}</h3>
                    <p className="mt-1 line-clamp-2 text-base text-white/70">{clubName}</p>
                  </div>

                  <p className="mt-2 flex items-center gap-2 text-sm text-white/75">
                    <Mail size={16} className="text-white/55" />
                    <span className="line-clamp-1">{email}</span>
                  </p>

                  <div className="mt-3 rounded-xl bg-[#0b213d] px-4 py-3">
                    <p className="text-sm text-white/70">Events Organized</p>
                    <p className="mt-0.5 text-2xl font-semibold text-[#f3c94d]">{eventCount}</p>
                  </div>

                  <div className="mt-3 flex items-center justify-start gap-3">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-lg border border-rose-400/40 px-3 py-1.5 text-xs font-medium text-rose-300 transition-colors hover:bg-rose-500/10"
                    >
                      <Trash2 size={13} />
                      Delete
                    </button>
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
