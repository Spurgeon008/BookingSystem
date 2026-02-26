import { useState, useEffect } from "react";
import api from "../api/axios";
import { MdEventSeat, MdCalendarToday, MdLocationOn } from "react-icons/md";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get("/bookings/my");
        setBookings(data);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Bookings</h1>

      {bookings.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <MdEventSeat className="text-5xl mx-auto mb-3" />
          <p className="text-xl">No bookings yet</p>
          <p className="text-sm mt-1">Browse events and book your first ticket!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => {
            const date = new Date(b.event_date);
            const statusColor =
              b.status === "confirmed"
                ? "bg-green-100 text-green-700"
                : b.status === "cancelled"
                ? "bg-red-100 text-red-700"
                : "bg-yellow-100 text-yellow-700";

            return (
              <div
                key={b.id}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-800">{b.event_title}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                        {b.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <MdCalendarToday className="text-gray-400" />
                        {date.toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <MdLocationOn className="text-gray-400" />
                        {b.venue}
                      </span>
                      <span className="flex items-center gap-1">
                        <MdEventSeat className="text-gray-400" />
                        {b.seats} ({b.num_seats} seat{b.num_seats > 1 ? "s" : ""})
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xl font-bold text-gray-800">
                      ₹{b.total_price?.toLocaleString("en-IN")}
                    </div>
                    <div className="text-xs text-gray-400">
                      Booked {new Date(b.created_at).toLocaleDateString("en-IN")}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
