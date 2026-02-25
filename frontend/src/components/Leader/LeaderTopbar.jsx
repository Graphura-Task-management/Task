import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Menu,
  Plus,
  Check,
  X,
  RefreshCcw,
  ClipboardList,
  Users,
  FolderKanban,
} from "lucide-react";
import AssignTaskModal from "./AssignTaskModal";
import { useAuth } from "../../context/AuthContext";
import { notificationService } from "../../api/notificationsApi";
import { toast } from "react-toastify";

export default function LeaderTopbar({ onMenuClick }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
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
      clearInterval(interval);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [user, isNotificationOpen]);

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
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  const handleClearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await handleMarkAsRead(notification._id, {
        stopPropagation: () => {},
      });
    }

    switch (notification.type) {
      case "task_status_updated":
      case "task_completed":
        navigate("/leader/tasks");
        break;
      case "team_member_added":
        navigate("/leader/team");
        break;
      case "project_assigned":
        navigate("/leader");
        break;
      default:
        break;
    }

    setIsNotificationOpen(false);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "task_status_updated":
        return <RefreshCcw size={18} className="text-blue-600" />;
      case "task_completed":
        return <Check size={18} className="text-emerald-600" />;
      case "team_member_added":
        return <Users size={18} className="text-purple-600" />;
      case "project_assigned":
        return <FolderKanban size={18} className="text-orange-600" />;
      default:
        return <ClipboardList size={18} className="text-gray-500" />;
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

  const handleProfileClick = () => {
    navigate("/leader/settings");
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-[#D3D9D4] px-4 md:px-6 flex items-center justify-between sticky top-0 z-[50]">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 text-[#235857] md:hidden hover:bg-[#F4F8F8] rounded-xl"
          >
            <Menu size={20} />
          </button>

          <div>
            <p className="text-sm font-semibold text-[#0D2426]">
              Leader Dashboard
            </p>
            <p className="text-xs text-[#6D8B8C]">Lead. Inspire. Deliver.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#235857] text-white rounded-xl font-semibold text-xs hover:bg-[#1a4342]"
          >
            <Plus size={16} />
            Assign Task
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => {
                setIsNotificationOpen(!isNotificationOpen);
                if (!isNotificationOpen) fetchNotifications();
              }}
              className={`w-10 h-10 rounded-xl flex items-center justify-center relative ${
                isNotificationOpen
                  ? "bg-[#235857] text-white"
                  : "bg-[#F4F8F8] text-[#235857]"
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
                {/* Header */}
                <div className="px-4 py-3 border-b flex justify-between items-center bg-[#F4F8F8]">
                  <span className="text-sm font-bold">
                    Notifications {unreadCount > 0 && `(${unreadCount})`}
                  </span>

                  {notifications.length > 0 && (
                    <button
                      onClick={handleClearAll}
                      className="text-xs text-red-500 flex items-center gap-1 hover:underline"
                    >
                      <X size={12} />
                      Clear all
                    </button>
                  )}
                </div>

                {/* List */}
                <div className="max-h-[420px] overflow-y-auto">
                  {loadingNotifications ? (
                    <div className="px-4 py-10 text-center">
                      <div className="w-8 h-8 border-4 border-[#235857] border-t-transparent rounded-full animate-spin mx-auto" />
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
                        {getNotificationIcon(notification.type)}

                        <div className="flex-1">
                          <p className="text-xs font-medium">
                            {notification.message}
                          </p>

                          <p className="text-[10px] text-[#6D8B8C] mt-1">
                            {formatTimeAgo(notification.createdAt)}
                          </p>
                        </div>

                        {!notification.read && (
                          <button
                            onClick={(e) =>
                              handleMarkAsRead(notification._id, e)
                            }
                            className="p-1 hover:bg-gray-200 rounded-full"
                          >
                            <Check size={14} />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Bottom */}
                {notifications.length > 0 && unreadCount > 0 && (
                  <div className="px-4 py-2 border-t bg-[#F4F8F8]">
                    <button
                      onClick={handleMarkAllAsRead}
                      className="w-full text-xs text-[#235857] font-semibold hover:underline"
                    >
                      Mark all as read
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleProfileClick}
            className="flex items-center gap-2"
          >
            <div className="hidden md:block text-right">
              <p className="text-sm font-semibold">{name || "Leader"}</p>
              <p className="text-xs text-gray-500">Team Lead</p>
            </div>

            <div className="w-9 h-9 rounded-full bg-[#235857] text-white flex items-center justify-center font-semibold text-sm">
              {name?.charAt(0) || "L"}
            </div>
          </button>
        </div>
      </header>

      <AssignTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
