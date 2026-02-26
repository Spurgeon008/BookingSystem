import { useState, useEffect } from "react";
import api from "../api/axios";
import { MdNotifications, MdCheckCircle, MdCircle } from "react-icons/md";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get("/notifications/");
        setNotifications(data);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch {
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Notifications</h1>

      {notifications.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <MdNotifications className="text-5xl mx-auto mb-3" />
          <p className="text-xl">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`rounded-xl border p-4 transition-colors cursor-pointer ${
                n.is_read
                  ? "bg-white border-gray-200"
                  : "bg-blue-50 border-blue-200 hover:bg-blue-100"
              }`}
              onClick={() => !n.is_read && markAsRead(n.id)}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {n.is_read ? (
                    <MdCheckCircle className="text-gray-300 text-lg" />
                  ) : (
                    <MdCircle className="text-blue-500 text-sm" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${n.is_read ? "text-gray-500" : "text-gray-800 font-medium"}`}>
                    {n.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(n.created_at).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
