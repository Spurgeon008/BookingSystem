import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import SeatMap from "../components/SeatMap";
import toast from "react-hot-toast";
import { MdCalendarToday, MdLocationOn, MdCategory, MdConfirmationNumber } from "react-icons/md";

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [seatData, setSeatData] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [booking, setBooking] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventRes = await api.get(`/events/${id}`);
        setEvent(eventRes.data);
        try {
          const seatRes = await api.get(`/events/${id}/seats`);
          setSeatData(seatRes.data);
        } catch {
          setSeatData({ booked_seats: [], locked_seats: [] });
          setSeatData({ booked_seats: [], locked_seats: [] });
        }
      } catch {
        toast.error("Failed to load event");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleBook = async () => {
    if (selectedSeats.length === 0) {
      toast.error("Please select at least one seat");
      return;
    }
    setBooking(true);
    try {
      await api.post("/bookings/", { event_id: parseInt(id), seats: selectedSeats });
      toast.success(`Booked ${selectedSeats.length} seat(s) successfully!`);
      navigate("/my-bookings");
    } catch (err) {
      const detail = err.response?.data?.detail || "Booking failed";
      toast.error(detail, { duration: 5000 });
      try {
      try {
        const [seatRes, eventRes] = await Promise.all([
          api.get(`/events/${id}/seats`),
          api.get(`/events/${id}`),
        ]);
        setSeatData(seatRes.data);
        setEvent(eventRes.data);
        // Remove only the seats that are now booked/locked, keep the rest selected
        const unavailable = new Set([...seatRes.data.booked_seats, ...seatRes.data.locked_seats]);
        setSelectedSeats((prev) => prev.filter((s) => !unavailable.has(s)));
      } catch {
        setSelectedSeats([]);
      }
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-64 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!event) return null;

  const date = new Date(event.event_date);
  const total = selectedSeats.length * event.price;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Event Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{event.title}</h1>
            <p className="text-gray-500 mt-2 max-w-xl">{event.description}</p>

            <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
              <span className="flex items-center gap-1.5">
                <MdCalendarToday className="text-red-500" />
                {date.toLocaleDateString("en-IN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}{" "}
                at {date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
              </span>
              <span className="flex items-center gap-1.5">
                <MdLocationOn className="text-red-500" />
                {event.venue}
              </span>
              <span className="flex items-center gap-1.5">
                <MdCategory className="text-red-500" />
                {event.category}
              </span>
              <span className="flex items-center gap-1.5">
                <MdConfirmationNumber className="text-red-500" />
                {event.available_seats} / {event.total_seats} seats available
              </span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-3xl font-bold text-gray-800">₹{event.price}</div>
            <div className="text-sm text-gray-500">per seat</div>
          </div>
        </div>
      </div>

      {/* Seat Selection */}
      {event.available_seats > 0 ? (
        <>
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Your Seats</h2>
            {seatData && (
              <SeatMap
                rows={event.rows}
                seatsPerRow={event.seats_per_row}
                bookedSeats={seatData.booked_seats}
                lockedSeats={seatData.locked_seats}
                selectedSeats={selectedSeats}
                onToggleSeat={(seat) => {
                  setSelectedSeats((prev) =>
                    prev.includes(seat) ? prev.filter((s) => s !== seat) : [...prev, seat]
                  );
                }}
                price={event.price}
              />
            )}
          </div>

          {/* Booking Footer */}
          {selectedSeats.length > 0 && (
            <div className="sticky bottom-0 bg-white border-t border-gray-200 shadow-lg rounded-t-xl p-4 -mx-4 px-8">
              <div className="max-w-5xl mx-auto flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-500">
                    {selectedSeats.length} seat{selectedSeats.length > 1 ? "s" : ""} selected
                  </span>
                  <div className="text-sm text-gray-400">
                    {[...selectedSeats].sort().join(", ")}
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Total</div>
                    <div className="text-2xl font-bold text-gray-800">₹{total.toLocaleString("en-IN")}</div>
                  </div>
                  <button
                    onClick={handleBook}
                    disabled={booking}
                    className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                  >
                    {booking ? "Booking…" : "Book Now"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <p className="text-red-600 text-lg font-semibold">This event is sold out!</p>
          <p className="text-red-400 text-sm mt-1">Check back later for cancellations</p>
        </div>
      )}
    </div>
  );
}
