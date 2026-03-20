import React from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import DashboardPage from '../components/organizer/DashboardPage'
import MyEventsPage from '../components/organizer/MyEventsPage'
import ParticipantsPage from '../components/organizer/ParticipantsPage'
import AllEventsPage from '../components/organizer/AllEventsPage'
import VenuesPage from '../components/organizer/VenuesPage'
import { LuClipboardList, LuUsers } from 'react-icons/lu'
import { BsBoxes } from 'react-icons/bs'
import { MdOutlineRateReview, MdOutlineDashboard, MdOutlineEvent, MdOutlineEventNote } from 'react-icons/md'
import { FiMapPin } from "react-icons/fi"

function OrganizerProfile() {
  return (
    <div className="flex h-screen w-full bg-gray-50 font-sans overflow-hidden">
      
      {/* Sidebar Navigation */}
      <div className="w-[280px] bg-white shadow-lg flex flex-col z-10">
        
        {/* Logo Section */}
        <div className="h-20 flex items-center px-6 border-b border-gray-100">
          <img src="/logo.jpg"  className="h-10 w-10 object-contain mr-3" />
          <h1 className="text-xl font-bold text-gray-800">Organizer</h1>
        </div>

        {/* Links Section */}
        <div className="flex flex-col gap-2 p-4 mt-2 text-black">
          <Link to="/organizer" className="flex items-center px-4 py-3 text-gray-600 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 font-medium">
            <MdOutlineDashboard className="text-xl mr-3" /> Dashboard
          </Link>
          <Link to="/organizer/my-events" className="flex items-center px-4 py-3 text-gray-600 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 font-medium">
            <MdOutlineEvent className="text-xl mr-3" /> My Events
          </Link>
          <Link to="/organizer/allEvents" className="flex items-center px-4 py-3 text-gray-600 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 font-medium">
            <MdOutlineEventNote className="text-xl mr-3" /> All Events
          </Link>
          <Link to="/organizer/participants" className="flex items-center px-4 py-3 text-gray-600 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 font-medium">
            <LuUsers className="text-xl mr-3" /> Participants
          </Link>
          <Link to="/organizer/venues" className="flex items-center px-4 py-3 text-gray-600 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 font-medium">
            <FiMapPin className="text-xl mr-3" /> Venues
          </Link>
        </div>

      </div>

      {/* Main Content Area */}
      <div className="flex-1 h-full overflow-y-auto p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 h-full w-full p-6 overflow-y-auto">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/my-events" element={<MyEventsPage />} />
            <Route path="/allEvents" element={<AllEventsPage />} />
            <Route path="/participants" element={<ParticipantsPage />} />
            <Route path="/venues" element={<VenuesPage />} />
          </Routes>
        </div>
      </div>

    </div>
  )
}

export default OrganizerProfile