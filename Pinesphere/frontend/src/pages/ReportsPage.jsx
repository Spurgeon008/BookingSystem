import { useState, useEffect } from "react";
import api from "../api/axios";
import { MdBarChart, MdTrendingUp, MdPerson } from "react-icons/md";

export default function ReportsPage() {
  const [summary, setSummary] = useState(null);
  const [eventWise, setEventWise] = useState([]);
  const [history, setHistory] = useState([]);
  const [tab, setTab] = useState("summary");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [sumRes, ewRes, hisRes] = await Promise.all([
          api.get("/reports/summary"),
          api.get("/reports/event-wise"),
          api.get("/reports/my-history"),
        ]);
        setSummary(sumRes.data);
        setEventWise(ewRes.data);
        setHistory(hisRes.data);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Reports</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit mb-8">
        {[
          { key: "summary", label: "Summary", icon: <MdBarChart /> },
          { key: "events", label: "Event-wise", icon: <MdTrendingUp /> },
          { key: "history", label: "My History", icon: <MdPerson /> },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-5 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === t.key ? "bg-white shadow text-gray-800" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Summary Tab */}
      {tab === "summary" && summary && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-blue-700">{summary.total_bookings}</div>
              <div className="text-sm text-blue-500 mt-1">Total Bookings</div>
            </div>
            <div className="bg-green-50 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-green-700">{summary.total_events}</div>
              <div className="text-sm text-green-500 mt-1">Movies Available</div>
            </div>
            <div className="bg-yellow-50 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-yellow-700">
                ₹{summary.total_revenue?.toLocaleString("en-IN") || 0}
              </div>
              <div className="text-sm text-yellow-500 mt-1">Total Revenue</div>
            </div>
          </div>
        </div>
      )}

      {/* Event-Wise Tab */}
      {tab === "events" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {eventWise.length === 0 ? (
            <div className="text-center py-16 text-gray-400">No movie data available</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium">Event</th>
                    <th className="text-left px-5 py-3 font-medium">Venue</th>
                    <th className="text-center px-5 py-3 font-medium">Bookings</th>
                    <th className="text-right px-5 py-3 font-medium">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {eventWise.map((ev, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-800">{ev.event_title}</td>
                      <td className="px-5 py-3 text-gray-500">{ev.venue}</td>
                      <td className="px-5 py-3 text-center">{ev.booking_count}</td>
                      <td className="px-5 py-3 text-right font-medium">
                        ₹{ev.revenue?.toLocaleString("en-IN") || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* My History Tab */}
      {tab === "history" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {history.length === 0 ? (
            <div className="text-center py-16 text-gray-400">No booking history yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium">Event</th>
                    <th className="text-left px-5 py-3 font-medium">Venue</th>
                    <th className="text-left px-5 py-3 font-medium">Date</th>
                    <th className="text-center px-5 py-3 font-medium">Seats</th>
                    <th className="text-right px-5 py-3 font-medium">Total</th>
                    <th className="text-center px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {history.map((h, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-800">{h.event_title}</td>
                      <td className="px-5 py-3 text-gray-500">{h.venue}</td>
                      <td className="px-5 py-3 text-gray-500">
                        {new Date(h.event_date).toLocaleDateString("en-IN")}
                      </td>
                      <td className="px-5 py-3 text-center">{h.num_seats}</td>
                      <td className="px-5 py-3 text-right font-medium">
                        ₹{h.total_price?.toLocaleString("en-IN")}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            h.status === "confirmed"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {h.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
