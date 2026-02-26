import { useState, useEffect } from "react";
import api from "../api/axios";
import EventCard from "../components/EventCard";
import { MdOutlineMovie, MdDirectionsBus, MdTheaterComedy, MdMusicNote, MdGridView } from "react-icons/md";

const categories = [
  { key: "all", label: "All Events", icon: <MdGridView /> },
  { key: "movie", label: "Movies", icon: <MdOutlineMovie /> },
  { key: "concert", label: "Concerts", icon: <MdMusicNote /> },
  { key: "show", label: "Shows", icon: <MdTheaterComedy /> },
  { key: "bus", label: "Bus", icon: <MdDirectionsBus /> },
];

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await api.get("/events/");
        setEvents(data);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filtered = events.filter((e) => {
    const matchCat = filter === "all" || e.category === filter;
    const matchSearch =
      !search ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.venue.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800">
          Discover <span className="text-red-600">Events</span>
        </h1>
        <p className="text-gray-500 mt-2">Movies, concerts, shows & more — book your seats now</p>
      </div>

      <div className="mb-6">
      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search events or venues…"
          className="w-full max-w-lg mx-auto block px-5 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors shadow-sm"
        />
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-8">
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setFilter(cat.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === cat.key
                ? "bg-red-600 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat.icon}
            {cat.label}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl h-56 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-xl">No events found</p>
          <p className="text-sm mt-1">Try a different category or search term</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
