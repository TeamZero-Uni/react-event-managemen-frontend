import React from "react";
import { Link, Route, Routes, useNavigate } from "react-router-dom";

import { LuUsers, LuLogOut } from "react-icons/lu";
import {
  MdOutlineDashboard,
  MdOutlineEvent,
  MdOutlineEventNote,
} from "react-icons/md";

// Import your admin components
import Admindashbord from "../components/admin/Admindashbord";
import EventApproval from "../components/admin/eventapproval";
import OrganizerManagement from "../components/admin/organizermanagement";
import StudentManagement from "../components/admin/studentmanagement";

// Optional: useAuth hook for logout
import { useAuth } from "../hook/useAuth";

function AdminProfile() {
  const navigate = useNavigate();
  const { logoutUser } = useAuth(); // assuming your useAuth has logout function

  const handleLogout = () => {
    logoutUser(); // clear tokens / session
    navigate("/auth/login"); // redirect to login page
  };

  return (
    <div className="flex h-screen w-full bg-primary font-sans overflow-hidden">
      {/* Sidebar */}
      <div className="w-[280px] bg-primary border-r border-secondary/20 flex flex-col">
        {/* Logo */}
        <div className="h-20 flex items-center px-6 border-b border-secondary/20">
          <img
            src="/logo.jpg"
            className="h-10 w-10 object-contain mr-3 rounded-full border border-secondary"
          />
          <h1 className="text-xl font-bold text-secondary">Admin</h1>
        </div>

        {/* Links */}
        <div className="flex flex-col gap-2 p-4 mt-2 flex-1">
          <Link
            to="/admin"
            className="flex items-center px-4 py-3 text-white/80 hover:bg-secondary/10 rounded-lg"
          >
            <MdOutlineDashboard className="mr-3" /> Dashboard
          </Link>

          <Link
            to="/admin/event-approval"
            className="flex items-center px-4 py-3 text-white/80 hover:bg-secondary/10 rounded-lg"
          >
            <MdOutlineEvent className="mr-3" /> Events Approval
          </Link>

          <Link
            to="/admin/organizers"
            className="flex items-center px-4 py-3 text-white/80 hover:bg-secondary/10 rounded-lg"
          >
            <MdOutlineEventNote className="mr-3" /> Organizer Management
          </Link>

          <Link
            to="/admin/students"
            className="flex items-center px-4 py-3 text-white/80 hover:bg-secondary/10 rounded-lg"
          >
            <LuUsers className="mr-3" /> Student Management
          </Link>

          <div className="mt-auto flex flex-col gap-2">
            <button
              onClick={() => navigate("/home")}
              className="flex items-center px-4 py-3 text-secondary bg-secondary/10 hover:bg-secondary/20 rounded-lg transition-all duration-200 font-medium"
            >
              Home
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-3 mt-auto text-white/80 hover:bg-red-600 hover:text-white rounded-lg transition-all duration-200 font-medium"
            >
              <LuLogOut className="mr-3" /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="bg-primary border border-secondary/30 rounded-2xl p-6 h-full">
          <Routes>
            <Route path="/" index element={<Admindashbord />} />
            <Route path="/event-approval" element={<EventApproval />} />
            <Route path="/organizers" element={<OrganizerManagement />} />
            <Route path="/students" element={<StudentManagement />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default AdminProfile;
