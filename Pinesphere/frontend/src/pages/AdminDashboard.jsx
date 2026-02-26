import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";
import {
  MdAdd,
  MdDelete,
  MdEdit,
  MdEvent,
  MdConfirmationNumber,
  MdAttachMoney,
  MdPeople,
} from "react-icons/md";

export default function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [tab, setTab] = useState("events");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [evRes, bkRes, stRes] = await Promise.all([
        api.get("/events/"),
        api.get("/admin/bookings"),
        api.get("/admin/stats"),
      ]);
      setEvents(evRes.data);
      setBookings(bkRes.data);
      setStats(stRes.data);
    } catch (err) {
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const deleteEvent = async (id) => {
    if (!confirm("Delete this event? All associated bookings will also be removed.")) return;
    try {
      await api.delete(`/admin/events/${id}`);
      toast.success("Event deleted");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Delete failed");
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <Link
          to="/admin/create-event"
          className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors shadow-md"
        >
          <MdAdd className="text-lg" />
          Create Event
        </Link>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<MdEvent className="text-blue-500" />}
            label="Total Events"
            value={stats.total_events}
            bg="bg-blue-50"
          />
          <StatCard
            icon={<MdConfirmationNumber className="text-green-500" />}
            label="Total Bookings"
            value={stats.total_bookings}
            bg="bg-green-50"
          />
          <StatCard
            icon={<MdAttachMoney className="text-yellow-500" />}
            label="Total Revenue"
            value={`₹${stats.total_revenue?.toLocaleString("en-IN") || 0}`}
            bg="bg-yellow-50"
          />
          <StatCard
            icon={<MdPeople className="text-purple-500" />}
            label="Seats Sold"
            value={stats.total_seats_sold || 0}
            bg="bg-purple-50"
          />
        </div>
      )}

      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit mb-6">
        <button
          onClick={() => setTab("events")}
          className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === "events" ? "bg-white shadow text-gray-800" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Events ({events.length})
        </button>
        <button
          onClick={() => setTab("bookings")}
          className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === "bookings" ? "bg-white shadow text-gray-800" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          All Bookings ({bookings.length})
        </button>
      </div>

      {tab === "events" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">Event</th>
                  <th className="text-left px-5 py-3 font-medium">Category</th>
                  <th className="text-left px-5 py-3 font-medium">Venue</th>
                  <th className="text-left px-5 py-3 font-medium">Date</th>
                  <th className="text-center px-5 py-3 font-medium">Seats</th>
                  <th className="text-right px-5 py-3 font-medium">Price</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {events.map((ev) => (
                  <tr key={ev.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-800">{ev.title}</td>
                    <td className="px-5 py-3 text-gray-500 capitalize">{ev.category}</td>
                    <td className="px-5 py-3 text-gray-500">{ev.venue}</td>
                    <td className="px-5 py-3 text-gray-500">
                      {new Date(ev.event_date).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="text-green-600 font-medium">{ev.available_seats}</span>
                      <span className="text-gray-400"> / {ev.total_seats}</span>
                    </td>
                    <td className="px-5 py-3 text-right font-medium">₹{ev.price}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <Link
                          to={`/admin/create-event?edit=${ev.id}`}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <MdEdit />
                        </Link>
                        <button
                          onClick={() => deleteEvent(ev.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <MdDelete />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "bookings" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">ID</th>
                  <th className="text-left px-5 py-3 font-medium">Event</th>
                  <th className="text-left px-5 py-3 font-medium">User</th>
                  <th className="text-left px-5 py-3 font-medium">Seats</th>
                  <th className="text-right px-5 py-3 font-medium">Total</th>
                  <th className="text-center px-5 py-3 font-medium">Status</th>
                  <th className="text-left px-5 py-3 font-medium">Booked On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-400">#{b.id}</td>
                    <td className="px-5 py-3 font-medium text-gray-800">{b.event_title}</td>
                    <td className="px-5 py-3 text-gray-500">{b.user_email || `User #${b.user_id}`}</td>
                    <td className="px-5 py-3 text-gray-500">{b.seats}</td>
                    <td className="px-5 py-3 text-right font-medium">₹{b.total_price?.toLocaleString("en-IN")}</td>
                    <td className="px-5 py-3 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          b.status === "confirmed"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {new Date(b.created_at).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, bg }) {
  return (
    <div className={`${bg} rounded-xl p-5`}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}
