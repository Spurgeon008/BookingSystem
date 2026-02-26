import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";
import { MdCloudUpload, MdDelete } from "react-icons/md";

export default function AdminCreateEvent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const isEdit = !!editId;

  const [form, setForm] = useState({
    title: "",
    description: "",
    venue: "",
    price: "",
    poster_url: "",
    rows: "",
    seats_per_row: "",
    event_date: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      setFetching(true);
      api
        .get(`/events/${editId}`)
        .then(({ data }) => {
          setForm({
            title: data.title || "",
            description: data.description || "",
            venue: data.venue || "",
            price: data.price?.toString() || "",
            poster_url: data.poster_url || "",
            rows: data.rows?.toString() || "",
            seats_per_row: data.seats_per_row?.toString() || "",
            event_date: data.event_date ? data.event_date.slice(0, 16) : "",
          });
          if (data.poster_url) setPosterPreview(data.poster_url);
        })
        .catch(() => toast.error("Failed to load event"))
        .finally(() => setFetching(false));
    }
  }, [editId, isEdit]);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handlePosterSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["jpg", "jpeg"].includes(ext)) {
      toast.error("Only JPG/JPEG files are allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5MB");
      return;
    }
    setPosterFile(file);
    setPosterPreview(URL.createObjectURL(file));
  };

  const removePoster = () => {
    setPosterFile(null);
    setPosterPreview("");
    setForm({ ...form, poster_url: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.venue || !form.price || !form.event_date) {
      toast.error("Please fill in all required fields");
      return;
    }

    const payloadBase = {
      title: form.title,
      description: form.description,
      venue: form.venue,
      price: parseFloat(form.price),
      event_date: new Date(form.event_date).toISOString(),
    };

    if (!isEdit) {
      if (!form.rows || !form.seats_per_row) {
        toast.error("Rows and seats per row are required for new events");
        return;
      }
      payloadBase.rows = parseInt(form.rows);
      payloadBase.seats_per_row = parseInt(form.seats_per_row);
    }

    setLoading(true);
    try {
      let posterUrl = form.poster_url || null;

      if (posterFile) {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", posterFile);
        const uploadRes = await api.post("/admin/upload-poster", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        posterUrl = uploadRes.data.poster_url;
        setUploading(false);
      }

      const payload = {
        ...payloadBase,
        poster_url: posterUrl,
      };

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
        {isEdit ? "Edit Movie" : "Create New Movie"}
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
            placeholder="Brief description of the movie"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Venue / Theatre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.venue}
            onChange={update("venue")}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
            placeholder="e.g. PVR Cinemas, Forum Mall"
          />
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
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Movie Poster (JPG/JPEG)</label>
          {posterPreview ? (
            <div className="relative w-full max-w-xs">
              <img
                src={posterPreview}
                alt="Poster preview"
                className="w-full h-64 object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={removePoster}
                className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-md"
              >
                <MdDelete className="text-lg" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-red-400 hover:bg-red-50 transition-colors">
              <MdCloudUpload className="text-4xl text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">Click to upload poster</span>
              <span className="text-xs text-gray-400 mt-1">JPG or JPEG only (max 5MB)</span>
              <input
                type="file"
                accept=".jpg,.jpeg"
                onChange={handlePosterSelect}
                className="hidden"
              />
            </label>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (uploading ? "Uploading poster…" : "Saving…") : isEdit ? "Update Movie" : "Create Movie"}
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
