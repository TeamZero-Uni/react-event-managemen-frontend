import React, { useEffect, useState } from 'react'
import { FaUsers, FaUserTie, FaHourglassHalf, FaTrophy } from 'react-icons/fa'
import { getAllEvents, getAllUsers, getStudentsCount, getOrganizersCount } from '../../api/api'


// Stat Card Component

const StatCard = ({ Icon, title, number }) => {
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-amber-400 rounded-lg p-4 flex flex-col items-center gap-3 hover:shadow-lg hover:shadow-amber-400/20 transition-all duration-300 hover:-translate-y-1 cursor-pointer text-center">
      <div className="bg-amber-400 rounded-full p-3">
        <Icon className="text-xl text-slate-900" />
      </div>
      <div>
        <h3 className="text-2xl font-semibold text-amber-400 m-0 leading-tight">{number}</h3>
        <p className="text-gray-400 m-0 font-normal text-xs mt-0.5">{title}</p>
      </div>
    </div>
  )
}

export default function Admindashbord() {
  const [studentsCount, setStudentsCount] = useState(0)
  const [organizersCount, setOrganizersCount] = useState(0)
  const [eventsPendingApproval, setEventsPendingApproval] = useState(0)
  const [totalApprovedEvents, setTotalApprovedEvents] = useState(0)
  const [events, setEvents] = useState([])

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

  const isStudentUser = (user) => {
    const role = String(user?.role || user?.userRole || user?.user_type || user?.userType || '').toUpperCase()
    if (role === 'STUDENT' || role === 'ROLE_STUDENT') return true

    const roles = Array.isArray(user?.roles) ? user.roles : []
    return roles.some((roleItem) => {
      if (typeof roleItem === 'string') {
        const normalized = roleItem.toUpperCase()
        return normalized === 'STUDENT' || normalized === 'ROLE_STUDENT'
      }

      if (roleItem && typeof roleItem === 'object') {
        const normalized = String(roleItem?.name || roleItem?.role || roleItem?.authority || '').toUpperCase()
        return normalized === 'STUDENT' || normalized === 'ROLE_STUDENT'
      }

      return false
    })
  }

  const getCountFromResponse = (data) => {
    if (typeof data === 'number') return data
    if (typeof data?.data === 'number') return data.data
    if (typeof data?.count === 'number') return data.count
    if (typeof data?.total === 'number') return data.total
    if (typeof data?.data?.count === 'number') return data.data.count
    if (typeof data?.data?.total === 'number') return data.data.total

    return getListFromResponse(data).length
  }

  const getEventDateValue = (event) => {
    return event?.event_date || event?.eventDate || event?.date || null
  }

  const normalizeEventStatus = (status) => String(status ?? '').toUpperCase()

  const isApprovedEventStatus = (status) => {
    const normalized = normalizeEventStatus(status)
    return normalized === 'ACCEPTED' || normalized === 'APPROVED'
  }

  const getOrganizerName = (event) => {
    return (
      
      event?.createdBy?.fullname ||
      
      'N/A'
    )
  }

  const formatEventDate = (event) => {
    const rawDate = getEventDateValue(event)
    if (!rawDate) return 'N/A'

    const parsed = new Date(rawDate)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString('en-GB')
    }

    // If backend sends a non-ISO string, show it as-is instead of hiding it.
    return String(rawDate)
  }

  useEffect(() => { // Fetch students count
    const fetchStudentCount = async () => {
      try {
        const usersData = await getAllUsers()
        const usersList = getListFromResponse(usersData)
        const students = usersList.filter((user) => isStudentUser(user))
        setStudentsCount(students.length)
      } catch (error) {
        try {
          const data = await getStudentsCount()
          setStudentsCount(getCountFromResponse(data))
        } catch (fallbackError) {
          console.error('Failed to fetch students count:', fallbackError)
          setStudentsCount(0)
        }
      }
    }

    // Fetch organizers count
   
    const fetchOrganizerCount = async () => {
      try {
        const usersData = await getAllUsers()
        const usersList = getListFromResponse(usersData)
        const organizers = usersList.filter((user) => !isStudentUser(user))
        setOrganizersCount(organizers.length)
      } catch (error) {
        try {
          const data = await getOrganizersCount()
          setOrganizersCount(getCountFromResponse(data))
        } catch (fallbackError) {
          console.error('Failed to fetch organizers count:', fallbackError)
          setOrganizersCount(0)
        }
      }
    }

    const fetchEventStatusCounts = async () => { //event status counts
      try {
        const data = await getAllEvents()
        const events = getListFromResponse(data)

        const pendingCount = events.filter(
          (event) => event?.status === 'PENDING' || event?.status === 'PENDING_APPROVAL'
        ).length
        const approvedCount = events.filter(
          (event) => isApprovedEventStatus(event?.status)
        ).length

        setEventsPendingApproval(pendingCount)
        setTotalApprovedEvents(approvedCount)
        setEvents(events)
      } catch (error) {
        console.error('Failed to fetch event status counts:', error)
      }
    }


    fetchStudentCount()
    fetchOrganizerCount()
    fetchEventStatusCounts()
  }, [])

  return (
    <div className="p-8 min-h-screen bg-slate-950" >
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white m-0">Admin Dashboard</h1>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard 
          Icon={FaUsers} 
          title="Total Students" 
          number={studentsCount}
        />
        <StatCard 
          Icon={FaUserTie} 
          title="Total Organizers" 
          number={organizersCount}
        />
        <StatCard 
          Icon={FaHourglassHalf} 
          title="Events Pending Approval" 
          number={eventsPendingApproval}
        />
        <StatCard 
          Icon={FaTrophy} 
          title="Total Approved Events" 
          number={totalApprovedEvents}
        />
      </div>

      {/* Space for additional components */}
      <div className="mt-8">
        {/* Upcoming Events Section */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-amber-400/30 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Upcoming Events</h2>

          {events.filter((event) => isApprovedEventStatus(event?.status)).length === 0 ? (
            <p className="text-gray-400 text-center py-8">No events found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-amber-400/50">
                    <th className="text-left py-3 px-4 text-amber-400 font-semibold">Event Name</th>
                    <th className="text-left py-3 px-4 text-amber-400 font-semibold">Organizer</th>
                    <th className="text-left py-3 px-4 text-amber-400 font-semibold">Date</th>
                    <th className="text-left py-3 px-4 text-amber-400 font-semibold">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {events
                    .filter((event) => isApprovedEventStatus(event?.status))
                    .map((event) => (
                    <tr key={event.event_id || event.id} className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors">
                      <td className="py-3 px-4 text-amber-400">{event.title || 'Event Name'}</td>
                      <td className="py-3 px-4 text-white">{getOrganizerName(event)}</td>
                      <td className="py-3 px-4 text-white">{formatEventDate(event)}</td>
                      <td className="py-3 px-4 text-white">{event.type || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
