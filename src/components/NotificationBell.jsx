import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Bell, CheckCircle2, Circle, X, 
  Info, Calendar as CalendarIcon, Clock, ShieldCheck 
} from 'lucide-react';
import { getMyNotifications, markNotificationAsRead } from '../api/api';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  
  const dropdownRef = useRef(null);

  // Fetch notifications from the backend
  const fetchNotifications = async () => {
    try {
      const res = await getMyNotifications();
      if (res.success && res.data) {
        setNotifications(res.data);
      }
    } catch (error) {
      console.error("Failed to load notifications", error);
    }
  };

  // Initial fetch and set interval for auto-refresh
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); 
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle clicking a specific notification
  const handleNotificationClick = async (notif) => {
    setSelectedNotification(notif);
    setIsSidebarOpen(true);
    setIsOpen(false);

    // If unread, mark as read in the backend and update local state
    if (!notif.isRead) {
      try {
        await markNotificationAsRead(notif.id);
        setNotifications(notifications.map(n => 
          n.id === notif.id ? { ...n, isRead: true } : n
        ));
      } catch (error) {
        console.error("Failed to mark as read", error);
      }
    }
  };

  // Calculate unread notifications count
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Bell Icon Button */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 text-[#c9a227] hover:bg-[#c9a227]/10 rounded-full transition-all"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-lg animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-80 bg-[#060e1a] border border-[#c9a227]/20 rounded-md shadow-[0_0_20px_rgba(0,0,0,0.5)] z-50 overflow-hidden">
            <div className="bg-[#0a1628] border-b border-[#c9a227]/10 px-4 py-3 flex justify-between items-center">
              <h3 className="text-[#c9a227] font-bold text-xs uppercase tracking-widest">Notifications</h3>
              <span className="text-slate-400 text-[10px]">{unreadCount} New</span>
            </div>
            
            <div className="max-h-[300px] overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    onClick={() => handleNotificationClick(notif)} 
                    className={`px-4 py-4 border-b border-[#c9a227]/5 hover:bg-[#0a1628] transition-all cursor-pointer flex gap-3 ${!notif.isRead ? 'bg-[#c9a227]/5' : ''}`}
                  >
                    <div className="mt-0.5">
                      {!notif.isRead ? (
                        <Circle size={10} className="text-red-400 fill-red-400 animate-pulse" />
                      ) : (
                        <CheckCircle2 size={12} className="text-slate-600" />
                      )}
                    </div>
                    <div>
                      <p className={`text-sm ${!notif.isRead ? 'text-white font-medium' : 'text-slate-400'}`}>
                        {notif.message.length > 50 ? notif.message.substring(0, 50) + '...' : notif.message}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-slate-500 text-xs">
                  No notifications right now.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Render the Sidebar using React Portal to ensure it covers the entire screen */}
      {createPortal(
        <>
          {/* Background Blur Overlay */}
          <div 
            className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
            onClick={() => setIsSidebarOpen(false)}
          />

          {/* Slide-out Sidebar Panel */}
          <div 
            className={`fixed top-0 right-0 h-full w-80 md:w-96 bg-[#060e1a] border-l border-[#c9a227]/20 z-[9999] shadow-[[-20px_0_40px_rgba(0,0,0,0.8)]] transform transition-transform duration-300 ease-in-out ${
              isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#c9a227]/10 bg-[#0a1628]">
              <h2 className="text-[#c9a227] font-serif font-bold tracking-[0.2em] uppercase text-xs">
                Notification Details
              </h2>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Sidebar Content */}
            {selectedNotification && (
              <div className="p-6 space-y-8">
                {/* Main Message Section */}
                <div className="flex items-start gap-4">
                  <div className="mt-1 p-2 bg-[#c9a227]/10 border border-[#c9a227]/30 rounded-full">
                    <Info size={20} className="text-[#c9a227]" />
                  </div>
                  <div>
                    <p className="text-white text-base leading-relaxed">
                      {selectedNotification.message}
                    </p>
                    {/* Date and Time Details */}
                    <div className="flex items-center gap-4 mt-4 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                      <span className="flex items-center gap-1.5">
                        <CalendarIcon size={12} className="text-[#c9a227]" />
                        {new Date(selectedNotification.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1.5 border-l border-slate-700 pl-4">
                        <Clock size={12} className="text-[#c9a227]" />
                        {new Date(selectedNotification.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Decorative Premium Footer Widget */}
                <div className="mt-8 pt-6 border-t border-[#c9a227]/10">
                  <div className="flex items-center gap-4 bg-gradient-to-r from-[#c9a227]/10 to-transparent p-4 rounded-r-xl border-l-2 border-[#c9a227]">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#060e1a] border border-[#c9a227]/30 shadow-[0_0_10px_rgba(201,162,39,0.2)]">
                      <ShieldCheck size={14} className="text-[#c9a227]" />
                    </div>
                    <div>
                      <p className="text-[#c9a227] text-[10px] font-bold uppercase tracking-[0.2em]">System Verified</p>
                      <p className="text-slate-500 text-[9px] uppercase tracking-widest mt-1">Official FOT EMS Notification</p>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        </>,
        document.body
      )}
    </>
  );
};

export default NotificationBell;