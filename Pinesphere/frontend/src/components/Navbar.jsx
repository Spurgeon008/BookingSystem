import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import api from "../api/axios";
import { HiOutlineTicket, HiOutlineBell, HiOutlineChartBar } from "react-icons/hi";
import { MdOutlineMovie, MdAdminPanelSettings } from "react-icons/md";

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    api.get("/notifications/unread-count").then((r) => setUnreadCount(r.data.unread_count)).catch(() => {});
    const interval = setInterval(() => {
      api.get("/notifications/unread-count").then((r) => setUnreadCount(r.data.unread_count)).catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: "/", label: "Movies", icon: <MdOutlineMovie className="text-lg" /> },
    { to: "/my-bookings", label: "My Bookings", icon: <HiOutlineTicket className="text-lg" /> },
    { to: "/reports", label: "Reports", icon: <HiOutlineChartBar className="text-lg" /> },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-red-500 text-white w-9 h-9 rounded-lg flex items-center justify-center font-bold text-lg">T</div>
            <span className="font-bold text-xl text-gray-800 hidden sm:block">TicketBook</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.to)
                    ? "bg-red-50 text-red-600"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}

            {isAdmin && (
              <Link
                to="/admin"
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname.startsWith("/admin")
                    ? "bg-purple-50 text-purple-600"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <MdAdminPanelSettings className="text-lg" />
                Admin
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/notifications"
              className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <HiOutlineBell className="text-xl" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>

            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-semibold text-sm">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:block">{user?.name}</span>
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      {isAdmin && <span className="mt-1 inline-block text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Admin</span>}
                    </div>

                    <div className="md:hidden border-b border-gray-100 py-1">
                      {navLinks.map((link) => (
                        <Link
                          key={link.to}
                          to={link.to}
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          {link.icon}
                          {link.label}
                        </Link>
                      ))}
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-purple-600 hover:bg-gray-50"
                        >
                          <MdAdminPanelSettings />
                          Admin Panel
                        </Link>
                      )}
                    </div>

                    <button
                      onClick={() => { setMenuOpen(false); logout(); }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
