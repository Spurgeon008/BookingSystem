import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";

const categoryOptions = ["movie", "concert", "show", "bus"];

export default function AdminCreateEvent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const isEdit = !!editId;

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "movie",
    venue: "",
    price: "",
    poster_url: "",
    rows: "",
    seats_per_row: "",
    event_date: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (isEdit) {
      setFetching(true);
      api
        .get(`/events/${editId}`)
        .then(({ data }) => {
          setForm({
            title: data.title || "",
            description: data.description || "",
            category: data.category || "movie",
            venue: data.venue || "",
            price: data.price?.toString() || "",
            poster_url: data.poster_url || "",
            rows: data.rows?.toString() || "",
            seats_per_row: data.seats_per_row?.toString() || "",
            event_date: data.event_date ? data.event_date.slice(0, 16) : "",
          });
        })
        .catch(() => toast.error("Failed to load event"))
        .finally(() => setFetching(false));
    }
  }, [editId, isEdit]);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.venue || !form.price || !form.event_date) {
      toast.error("Please fill in all required fields");
      return;
    }

    const payload = {
      title: form.title,
      description: form.description,
      category: form.category,
      venue: form.venue,
      price: parseFloat(form.price),
      poster_url: form.poster_url || null,
      event_date: new Date(form.event_date).toISOString(),
    };

    if (!isEdit) {
      if (!form.rows || !form.seats_per_row) {
        toast.error("Rows and seats per row are required for new events");
        return;
      }
      payload.rows = parseInt(form.rows);
      payload.seats_per_row = parseInt(form.seats_per_row);
    }

    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/admin/events/${editId}`, payload);
        toast.success("Event updated!");
      } else {
        await api.post("/admin/events", payload);
        toast.success("Event created!");
      }
      navigate("/admin");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const totalSeats = form.rows && form.seats_per_row ? parseInt(form.rows) * parseInt(form.seats_per_row) : 0;

  if (fetching) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-64 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        {isEdit ? "Edit Event" : "Create New Event"}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Event Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.title}
            onChange={update("title")}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
            placeholder="e.g. Avengers: Endgame"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
          <textarea
            value={form.description}
            onChange={update("description")}
            rows={3}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
            placeholder="Brief description of the event"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={form.category}
              onChange={update("category")}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none bg-white"
            >
              {categoryOptions.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Venue <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.venue}
              onChange={update("venue")}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              placeholder="e.g. PVR Cinemas, Forum Mall"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Price (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={update("price")}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              placeholder="250"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Event Date & Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={form.event_date}
              onChange={update("event_date")}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
            />
          </div>
        </div>

        {!isEdit && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Number of Rows (A-Z) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="26"
                value={form.rows}
                onChange={update("rows")}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                placeholder="10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Seats Per Row <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={form.seats_per_row}
                onChange={update("seats_per_row")}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                placeholder="15"
              />
            </div>
          </div>
        )}

        {!isEdit && totalSeats > 0 && (
          <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-600">
            Total capacity: <strong>{totalSeats}</strong> seats ({form.rows} rows × {form.seats_per_row} per row)
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Poster URL (optional)</label>
          <input
            type="url"
            value={form.poster_url}
            onChange={update("poster_url")}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
            placeholder="https://..."
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving…" : isEdit ? "Update Event" : "Create Event"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin")}
            className="px-6 py-2.5 border border-gray-300 text-gray-600 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
