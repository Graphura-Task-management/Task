import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getTaskById, updateTaskStatus } from "../../api/taskApi";

import {
  ArrowLeft,
  Calendar,
  User,
  Users,
  Briefcase,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function TaskDetails() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchTaskDetails();
  }, [taskId]);

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);

      const response = await getTaskById(taskId);

      if (response.success && response.task) {
        setTask(response.task);
      }
    } catch (error) {
      toast.error("Failed to load task");

      if (location.state?.task) {
        setTask(location.state.task);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdating(true);

      const response = await updateTaskStatus(taskId, newStatus);

      if (response.success) {
        toast.success("Status updated");
        setTask({ ...task, status: newStatus });
      }
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  const priorityStyles = {
    urgent: "bg-red-50 text-red-600 border-red-200",
    high: "bg-orange-50 text-orange-600 border-orange-200",
    medium: "bg-blue-50 text-blue-600 border-blue-200",
    low: "bg-emerald-50 text-emerald-600 border-emerald-200",
  };

  const statusStyles = {
    completed: "bg-emerald-600 text-white",
    "in-progress": "bg-blue-600 text-white",
    pending: "bg-amber-500 text-white",
  };

  /* ---------------- LOADING ---------------- */

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin w-10 h-10 text-[#235857]" />
      </div>
    );
  }

  /* ---------------- NOT FOUND ---------------- */

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <AlertCircle className="w-14 h-14 text-red-500" />
        <p className="text-lg font-semibold">Task not found</p>

        <button
          onClick={() => navigate("/employee/tasks")}
          className="px-6 py-2 bg-[#235857] text-white rounded-lg hover:bg-[#1a4443]"
        >
          Back to Tasks
        </button>
      </div>
    );
  }

  /* ---------------- MAIN UI ---------------- */

  return (
    <div className="min-h-screen bg-[#F7FAF9] px-6 py-8">
      <div className="max-w-5xl mx-auto">
        {/* BACK */}
        <button
          onClick={() => navigate("/employee/tasks")}
          className="flex items-center gap-2 text-[#235857] font-medium mb-6 hover:gap-3 transition-all"
        >
          <ArrowLeft size={18} />
          Back to tasks
        </button>

        {/* CARD */}
        <div
          className="
          bg-white
          rounded-3xl
          shadow-sm
          border border-[#E3ECEA]
          p-8
        "
        >
          {/* TITLE */}
          <h1 className="text-3xl font-bold text-[#0D2426] mb-4">
            {task.title}
          </h1>

          {/* BADGES */}
          <div className="flex flex-wrap gap-3 mb-8">
            <span className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F1F6F5] text-[#235857] font-medium">
              <Briefcase size={16} />
              {task.project?.name || "No project"}
            </span>

            <span
              className={`px-4 py-2 rounded-lg border font-medium ${
                priorityStyles[task.priority] || "bg-gray-50"
              }`}
            >
              Priority: {task.priority}
            </span>

            <span
              className={`px-4 py-2 rounded-lg font-semibold ${
                statusStyles[task.status]
              }`}
            >
              {task.status === "in-progress"
                ? "In Progress"
                : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
            </span>
          </div>

          {/* DESCRIPTION */}
          <div className="mb-8">
            <p className="text-xs font-semibold text-[#6D8B8C] uppercase mb-2">
              Description
            </p>

            <div className="bg-[#F4F8F8] rounded-xl p-5 text-[#0D2426] leading-relaxed">
              {task.description || "No description provided."}
            </div>
          </div>

          {/* DATES */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <InfoCard icon={<Calendar size={16} />} label="Start Date">
              {formatDate(task.startDate)}
            </InfoCard>

            <InfoCard icon={<Calendar size={16} />} label="Due Date">
              {formatDate(task.dueDate)}
            </InfoCard>
          </div>

          {/* ASSIGNED BY */}
          {task.assignedBy && (
            <UserCard
              title="Assigned By"
              icon={<User size={16} />}
              name={task.assignedBy.name}
              subtitle={task.assignedBy.email}
            />
          )}

          {/* ASSIGNED TO */}
          {task.assignedTo?.length > 0 && (
            <div className="mt-6">
              <p className="text-xs font-semibold text-[#6D8B8C] uppercase mb-3 flex items-center gap-2">
                <Users size={16} />
                Assigned To ({task.assignedTo.length})
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                {task.assignedTo.map((m, i) => (
                  <UserCard
                    key={i}
                    name={m.name}
                    subtitle={m.domain || m.email}
                  />
                ))}
              </div>
            </div>
          )}

          {/* STATUS UPDATE */}
          <div className="mt-10 pt-6 border-t border-[#E3ECEA]">
            <p className="text-xs font-semibold text-[#6D8B8C] uppercase mb-4">
              Quick Status Update
            </p>

            <div className="grid grid-cols-3 gap-3">
              {["pending", "in-progress", "completed"].map((status) => (
                <button
                  key={status}
                  disabled={task.status === status || updating}
                  onClick={() => handleStatusChange(status)}
                  className={`
                    py-3 rounded-xl font-medium transition-all
                    ${
                      task.status === status
                        ? "bg-[#235857] text-white"
                        : "bg-[#F4F8F8] hover:bg-[#E3ECEA]"
                    }
                  `}
                >
                  {updating && task.status !== status ? (
                    <Loader2 className="animate-spin mx-auto" size={18} />
                  ) : status === "in-progress" ? (
                    "In Progress"
                  ) : (
                    status.charAt(0).toUpperCase() + status.slice(1)
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- SMALL COMPONENTS ---------------- */

function InfoCard({ icon, label, children }) {
  return (
    <div className="bg-[#F4F8F8] rounded-xl p-5">
      <p className="text-xs font-semibold text-[#6D8B8C] uppercase mb-1 flex items-center gap-2">
        {icon}
        {label}
      </p>

      <p className="font-semibold text-[#0D2426]">{children}</p>
    </div>
  );
}

function UserCard({ title, icon, name, subtitle }) {
  return (
    <div className="bg-[#F4F8F8] rounded-xl p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-[#235857] text-white flex items-center justify-center font-bold">
        {name?.[0] || "A"}
      </div>

      <div>
        {title && (
          <p className="text-xs text-[#6D8B8C] uppercase flex items-center gap-1">
            {icon}
            {title}
          </p>
        )}

        <p className="font-semibold text-[#0D2426]">{name}</p>
        <p className="text-xs text-[#6D8B8C]">{subtitle}</p>
      </div>
    </div>
  );
}
