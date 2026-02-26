import { Link } from "react-router-dom";
import { MdOutlineMovie, MdDirectionsBus, MdTheaterComedy, MdMusicNote } from "react-icons/md";

const categoryIcons = {
  movie: <MdOutlineMovie className="text-red-400 text-xl" />,
  bus: <MdDirectionsBus className="text-blue-400 text-xl" />,
  show: <MdTheaterComedy className="text-purple-400 text-xl" />,
  concert: <MdMusicNote className="text-pink-400 text-xl" />,
};

const categoryColors = {
  movie: "bg-red-50 text-red-600",
  bus: "bg-blue-50 text-blue-600",
  show: "bg-purple-50 text-purple-600",
  concert: "bg-pink-50 text-pink-600",
};

export default function EventCard({ event }) {
  const date = new Date(event.event_date);
  const day = date.toLocaleDateString("en-IN", { day: "numeric" });
  const month = date.toLocaleDateString("en-IN", { month: "short" });
  const time = date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const seatsLeft = event.available_seats;
  const totalSeats = event.total_seats;
  const fillPercent = ((totalSeats - seatsLeft) / totalSeats) * 100;

  return (
    <Link
      to={`/events/${event.id}`}
      className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-0.5"
    >
      <div className="h-1.5 bg-gradient-to-r from-red-500 to-pink-500" />

      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${categoryColors[event.category] || "bg-gray-50 text-gray-600"}`}>
            {categoryIcons[event.category] || null}
            {event.category}
          </span>
          <span className="text-lg font-bold text-gray-800">₹{event.price}</span>
        </div>

        <h3 className="text-lg font-semibold text-gray-800 group-hover:text-red-600 transition-colors line-clamp-1">
          {event.title}
        </h3>

        <p className="text-sm text-gray-500 mt-1">{event.venue}</p>

        <div className="flex items-center gap-3 mt-3 text-sm">
          <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
            <span className="font-bold text-gray-700">{day}</span>
            <span className="text-gray-500">{month}</span>
          </div>
          <span className="text-gray-400">{time}</span>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{seatsLeft} seats left</span>
            <span>{totalSeats} total</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                fillPercent > 80 ? "bg-red-500" : fillPercent > 50 ? "bg-yellow-500" : "bg-green-500"
              }`}
              style={{ width: `${fillPercent}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
