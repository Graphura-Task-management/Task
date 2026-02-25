import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getMyTasks, updateTaskStatus } from "../../api/taskApi";
import { Loader2, RefreshCw } from "lucide-react";

export default function Tasks() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState({
    pending: [],
    inProgress: [],
    completed: [],
  });

  const [loading, setLoading] = useState(true);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  /* ================= FETCH ================= */

  const fetchTasks = async () => {
    try {
      setLoading(true);

      const response = await getMyTasks();

      if (response?.success && response?.tasks) {
        setTasks(categorizeTasks(response.tasks));
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  /* ================= CATEGORIZE ================= */

  const categorizeTasks = (taskList) => {
    const categorized = {
      pending: [],
      inProgress: [],
      completed: [],
    };

    taskList.forEach((task) => {
      const status = task.status?.toLowerCase();

      if (status === "pending") categorized.pending.push(task);
      else if (status === "in-progress" || status === "in progress")
        categorized.inProgress.push(task);
      else if (status === "completed") categorized.completed.push(task);
    });

    return categorized;
  };

  /* ================= STATUS UPDATE ================= */

  const handleStatusChange = async (fromSection, taskId, newStatus) => {
    try {
      setUpdatingTaskId(taskId);

      // optimistic UI
      setTasks((prev) => {
        let movedTask;

        const updatedFrom = prev[fromSection].filter((task) => {
          if (task._id === taskId) {
            movedTask = { ...task, status: newStatus };
            return false;
          }
          return true;
        });

        const toSection =
          newStatus === "pending"
            ? "pending"
            : newStatus === "completed"
              ? "completed"
              : "inProgress";

        return {
          ...prev,
          [fromSection]: updatedFrom,
          [toSection]: [...prev[toSection], movedTask],
        };
      });

      const response = await updateTaskStatus(taskId, newStatus);

      if (response?.success) {
        toast.success("Task updated");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update task");
      fetchTasks(); // revert
    } finally {
      setUpdatingTaskId(null);
    }
  };

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-[#235857]" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 bg-[#F6FAFA] min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-[#0D2426]">Task overview</h1>
          <p className="text-[#6D8B8C]">
            Review and manage your assigned tasks.
          </p>
        </div>

        <button
          onClick={fetchTasks}
          className="
            flex items-center gap-2
            px-4 py-2.5
            bg-white
            border border-[#D3D9D4]
            rounded-xl
            hover:bg-[#F4F8F8]
            transition
          "
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <Section
        title="Pending tasks"
        color="border-[#235857]"
        tasks={tasks.pending}
        sectionKey="pending"
        navigate={navigate}
        updatingTaskId={updatingTaskId}
        onStatusChange={handleStatusChange}
      />

      <Section
        title="In progress"
        color="border-[#3B8A7F]"
        tasks={tasks.inProgress}
        sectionKey="inProgress"
        navigate={navigate}
        updatingTaskId={updatingTaskId}
        onStatusChange={handleStatusChange}
      />

      <Section
        title="Completed tasks"
        color="border-[#8CBDB3]"
        tasks={tasks.completed}
        sectionKey="completed"
        navigate={navigate}
        updatingTaskId={updatingTaskId}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}

/* ===================================================== */
/* ================= SECTION ============================ */
/* ===================================================== */

function Section({
  title,
  color,
  tasks,
  sectionKey,
  navigate,
  updatingTaskId,
  onStatusChange,
}) {
  return (
    <div
      className={`
        mb-10
        bg-white
        rounded-2xl
        p-6
        border-l-4
        ${color}
        shadow-sm
      `}
    >
      <div className="flex justify-between mb-6">
        <h2 className="text-xl font-semibold text-[#235857]">{title}</h2>

        <span className="bg-[#F4F8F8] px-3 py-1 rounded-full text-sm font-semibold text-[#6D8B8C]">
          {tasks.length}
        </span>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-12 text-[#6D8B8C]">
          No tasks in this section
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              sectionKey={sectionKey}
              navigate={navigate}
              isUpdating={updatingTaskId === task._id}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ===================================================== */
/* ================= TASK CARD ========================== */
/* ===================================================== */

function TaskCard({ task, sectionKey, navigate, isUpdating, onStatusChange }) {
  const [status, setStatus] = useState(
    task.status === "pending"
      ? "pending"
      : task.status === "completed"
        ? "completed"
        : "in-progress",
  );

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const priorityColor = {
    urgent: "bg-red-100 text-red-700",
    high: "bg-orange-100 text-orange-700",
    medium: "bg-blue-100 text-blue-700",
    low: "bg-green-100 text-green-700",
  };

  return (
    <div
      className="
        rounded-xl
        border border-[#E2E8E8]
        p-5
        hover:shadow-md
        transition
        bg-white
      "
    >
      {/* TITLE */}
      <div className="flex justify-between mb-2">
        <h3 className="font-semibold text-lg text-[#0D2426]">{task.title}</h3>

        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            priorityColor[task.priority?.toLowerCase()] || "bg-gray-100"
          }`}
        >
          {task.priority}
        </span>
      </div>

      <p className="text-sm text-[#6D8B8C] mb-3">
        {task.project?.name || "No project"}
      </p>

      {task.description && (
        <p className="text-sm text-[#0D2426]/80 line-clamp-2 mb-4">
          {task.description}
        </p>
      )}

      <div className="flex justify-between text-sm text-[#6D8B8C] mb-4">
        <span>Start: {formatDate(task.startDate)}</span>
        <span>Due: {formatDate(task.dueDate)}</span>
      </div>

      {/* ACTIONS */}
      <div className="flex gap-2">
        <button
          onClick={() =>
            navigate(`/employee/tasks/${task._id}`, {
              state: { task },
            })
          }
          className="
            flex-1
            bg-[#235857]
            hover:bg-[#1B4442]
            text-white
            py-2
            rounded-lg
            font-medium
            transition
          "
        >
          View details
        </button>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="
            border
            rounded-lg
            px-2
            outline-none
            focus:border-[#235857]
          "
        >
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        <button
          disabled={isUpdating}
          onClick={() => onStatusChange(sectionKey, task._id, status)}
          className="
            px-4
            bg-[#3B8A7F]
            text-white
            rounded-lg
            hover:bg-[#2F6F66]
            disabled:opacity-50
            flex items-center
            justify-center
          "
        >
          {isUpdating ? (
            <Loader2 className="animate-spin w-4 h-4" />
          ) : (
            <RefreshCw size={16} />
          )}
        </button>
      </div>
    </div>
  );
}
window.dispatchEvent(new Event("task-updated"));
