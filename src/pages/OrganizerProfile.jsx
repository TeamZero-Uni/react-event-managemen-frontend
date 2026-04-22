import React from 'react'
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import DashboardPage from '../components/organizer/DashboardPage'
import MyEventsPage from '../components/organizer/MyEventsPage'
import ParticipantsPage from '../components/organizer/ParticipantsPage'
import AllEventsPage from '../components/organizer/AllEventsPage'
import VenuesPage from '../components/organizer/VenuesPage'
import { useAuth } from '../hook/useAuth'
import { LuUsers } from 'react-icons/lu'
import { MdOutlineDashboard, MdOutlineEvent, MdOutlineEventNote, MdHome } from 'react-icons/md'
import { FiBarChart2 } from "react-icons/fi"
import { MdLogout } from 'react-icons/md'
import CreateEvent from '../components/organizer/CreateEvent'
import EditEvent from '../components/organizer/EditEvent'

function OrganizerProfile() {
  const { logoutUser } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: '/organizer', label: 'Dashboard', icon: MdOutlineDashboard, end: true },
    { to: '/organizer/my-events', label: 'My Events', icon: MdOutlineEvent },
    { to: '/organizer/allEvents', label: 'All Events', icon: MdOutlineEventNote },
    { to: '/organizer/participants', label: 'Participants', icon: LuUsers },
    { to: '/organizer/generate-report', label: 'Generate Report', icon: FiBarChart2 },
    { to: '/organizer/create-event', label: 'Create Event', icon: MdOutlineEvent },
  ];

  const navLinkClass = ({ isActive }) =>
    `group flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-200 font-semibold tracking-wide ${
      isActive
        ? 'bg-secondary/12 border-secondary/35 text-secondary shadow-[inset_0_0_0_1px_rgba(201,162,39,0.08)]'
        : 'border-transparent text-white/80 hover:bg-white/5 hover:border-white/10 hover:text-white'
    }`;

  const handleLogout = async () => {
    try {
      await logoutUser();
    } finally {
      navigate('/home', { replace: true });
    }
  };

  return (
    <div className="flex h-screen w-full bg-primary font-sans overflow-hidden">
      
      {/* Sidebar Navigation */}
      <div className="w-64 bg-linear-to-b from-[#041a38] to-[#03132b] border-r border-secondary/20 flex flex-col z-10 shadow-[6px_0_26px_rgba(0,0,0,0.18)]">
        
        {/* Logo Section */}
        <div className="h-24 flex items-center px-6 border-b border-secondary/20">
          <img src="/logo.jpg" className="h-12 w-12 object-contain mr-3 rounded-full border border-secondary/70 shadow-[0_0_0_3px_rgba(201,162,39,0.12)]" />
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">Panel</p>
            <h1 className="text-[28px] leading-none font-bold text-secondary">Organizer</h1>
          </div>
        </div>

        {/* Links Section */}
        <div className="flex-1 flex flex-col justify-center px-4 py-5">
          <div className="space-y-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={navLinkClass}
                >
                  <Icon className="text-xl shrink-0" />
                  <span className="text-[18px] leading-none">{item.label}</span>
                </NavLink>
              );
            })}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 mt-auto border-t border-secondary/20 space-y-2 bg-primary/25">
          <NavLink
            to="/home"
            className={navLinkClass}
          >
            <MdHome className="text-xl shrink-0" />
            <span className="text-[18px] leading-none">Home</span>
          </NavLink>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-red-400 rounded-xl border border-red-500/20 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/35 transition-all duration-200 font-semibold tracking-wide"
          >
            <MdLogout className="text-xl shrink-0" />
            <span className="text-[18px] leading-none">Logout</span>
          </button>
        </div>

      </div>

      {/* Main Content Area */}
      <div className="flex-1 h-full overflow-y-auto p-6">
        <div className="bg-primary rounded-2xl shadow-xl border border-secondary/30 h-full w-full p-6 overflow-y-auto">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/my-events" element={<MyEventsPage />} />
            <Route path="/allEvents" element={<AllEventsPage />} />
            <Route path="/participants" element={<ParticipantsPage />} />
            <Route path="/generate-report" element={<VenuesPage />} />
            <Route path="/create-event" element={<CreateEvent />} />
            <Route path="/edit-event" element={<EditEvent />} />
          </Routes>
        </div>
      </div>

    </div>
  )
}

export default OrganizerProfile