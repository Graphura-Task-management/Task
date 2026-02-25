import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Menu,
  Check,
  X,
  Briefcase,
  ClipboardList,
  Clock,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { notificationService } from "../../api/notificationsApi";
import { toast } from "react-toastify";

export default function Topbar({ onMenuClick }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(localStorage.getItem("profileAvatar"));

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const dropdownRef = useRef(null);

  /* ================= EFFECT ================= */

  useEffect(() => {
    const syncAvatar = () => setAvatar(localStorage.getItem("profileAvatar"));
    window.addEventListener("storage", syncAvatar);

    if (user) setName(user.name);

    fetchUnreadCount();

    const interval = setInterval(() => {
      fetchUnreadCount();
      if (isNotificationOpen) fetchNotifications();
    }, 30000);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("storage", syncAvatar);
      document.removeEventListener("mousedown", handleClickOutside);
      clearInterval(interval);
    };
  }, [user, isNotificationOpen]);

  /* ================= API ================= */

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const response = await notificationService.getNotifications({
        limit: 10,
        sort: "-createdAt",
      });

      if (response.success) {
        setNotifications(response.notifications || []);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationService.getUnreadCount();
      if (response.success) {
        setUnreadCount(response.unreadCount || 0);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  const handleMarkAsRead = async (notificationId, e) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(notificationId);

      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId ? { ...notif, read: true } : notif,
        ),
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();

      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true })),
      );

      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all as read");
    }
  };

  // FRONTEND ONLY CLEAR
  const handleClearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await handleMarkAsRead(notification._id, { stopPropagation: () => {} });
    }

    switch (notification.type) {
      case "task_assigned":
      case "task_updated":
        navigate("/employee/tasks");
        break;
      case "project_assigned":
        navigate("/employee");
        break;
      default:
        break;
    }

    setIsNotificationOpen(false);
  };

  /* ================= ICONS ================= */

  const getNotificationIcon = (type) => {
    switch (type) {
      case "task_assigned":
        return <ClipboardList size={18} className="text-blue-600" />;
      case "project_assigned":
        return <Briefcase size={18} className="text-purple-600" />;
      case "task_updated":
        return <Clock size={18} className="text-orange-500" />;
      case "deadline_reminder":
        return <Clock size={18} className="text-red-500" />;
      default:
        return <Bell size={18} className="text-gray-500" />;
    }
  };

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hrs ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return new Date(date).toLocaleDateString();
  };

  /* ================= UI ================= */

  return (
    <header className="h-16 bg-white border-b border-[#D3D9D4] px-4 md:px-6 flex items-center justify-between sticky top-0 z-50">
      {/* LEFT */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100"
        >
          <Menu />
        </button>

        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-[#0D2426]">
            Employee workspace
          </p>
          <p className="text-xs text-[#6D8B8C]">
            Manage your tasks and schedule
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => {
              setIsNotificationOpen(!isNotificationOpen);
              if (!isNotificationOpen) fetchNotifications();
            }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition relative ${
              isNotificationOpen
                ? "bg-[#235857] text-white"
                : "bg-[#F4F8F8] text-[#235857] hover:bg-[#D3D9D4]/60"
            }`}
          >
            <Bell size={18} />

            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {isNotificationOpen && (
            <div
              className="
    fixed sm:absolute
    top-16 sm:top-auto
    right-1/2 sm:right-0
    translate-x-1/2 sm:translate-x-0
    w-[95vw] max-w-[380px]
    sm:w-96
    mt-2 sm:mt-3
    bg-white
    rounded-2xl
    shadow-2xl
    border border-[#D3D9D4]
    overflow-hidden
    z-[60]
  "
            >
              {/* HEADER */}
              <div className="px-4 py-3 border-b flex justify-between items-center bg-[#F4F8F8]">
                <span className="text-sm font-bold truncate">
                  Notifications {unreadCount > 0 && `(${unreadCount})`}
                </span>

                {notifications.length > 0 && (
                  <div className="flex gap-3">
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-xs text-[#235857] flex items-center gap-1 hover:underline"
                      >
                        <Check size={12} />
                        Mark all read
                      </button>
                    )}

                    <button
                      onClick={handleClearAll}
                      className="text-xs text-red-500 flex items-center gap-1 hover:underline"
                    >
                      <X size={12} />
                      Clear all
                    </button>
                  </div>
                )}
              </div>

              {/* LIST */}
              <div className="max-h-[420px] overflow-y-auto">
                {loadingNotifications ? (
                  <div className="px-4 py-10 text-center">
                    <div className="w-8 h-8 border-4 border-[#235857] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="px-4 py-12 text-center text-[#6D8B8C]">
                    No notifications
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification._id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`px-4 py-3 flex gap-3 cursor-pointer hover:bg-[#F4F8F8] border-b ${
                        !notification.read ? "bg-blue-50/40" : ""
                      }`}
                    >
                      <div className="mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>

                      <div className="flex-1">
                        <p
                          className={`text-xs font-medium ${
                            !notification.read
                              ? "text-[#0D2426]"
                              : "text-[#6D8B8C]"
                          }`}
                        >
                          {notification.message}
                        </p>

                        <p className="text-[10px] text-[#6D8B8C] mt-1">
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                      </div>

                      {!notification.read && (
                        <button
                          onClick={(e) => handleMarkAsRead(notification._id, e)}
                          className="p-1 hover:bg-gray-200 rounded-full"
                        >
                          <Check size={14} className="text-[#235857]" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* PROFILE */}
        <button
          onClick={() => navigate("/employee/settings")}
          className="flex items-center gap-2"
        >
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium">{name || "Employee"}</p>
            <p className="text-xs text-gray-500">{user?.role || "Employee"}</p>
          </div>

          <div className="w-9 h-9 rounded-full bg-[#235857] text-white flex items-center justify-center overflow-hidden">
            {avatar ? (
              <img
                src={avatar}
                className="h-full w-full object-cover"
                alt="Profile"
              />
            ) : (
              name?.charAt(0) || "E"
            )}
          </div>
        </button>
      </div>
    </header>
  );
}
