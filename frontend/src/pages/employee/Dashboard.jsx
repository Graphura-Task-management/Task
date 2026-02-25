import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getMyTasks } from "../../api/taskApi";
import authService from "../../api/authApi";
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getStats(tasks) {
  return [
    {
      title: "Total tasks",
      value: tasks.pending.length + tasks.inProgress.length + tasks.completed.length,
      icon: ClipboardIcon,
    },
    {
      title: "In progress",
      value: tasks.inProgress.length,
      icon: ClockIcon,
    },
    {
      title: "Completed",
      value: tasks.completed.length,
      icon: CheckIcon,
    },
    {
      title: "Overdue",
      value: tasks.overdue.length,
      icon: AlertIcon,
    },
  ];
}

/* ---------- upcoming deadlines ---------- */
function getUpcomingDeadlines(tasks, limit = 3) {
  const today = new Date();
  
  // Get all tasks with due dates
  const allTasks = [...tasks.pending, ...tasks.inProgress];
  
  return allTasks
    .map((task) => ({
      ...task,
      date: new Date(task.dueDate),
    }))
    .filter((task) => task.date >= today)
    .sort((a, b) => a.date - b.date)
    .slice(0, limit);
}

/* ---------- component ---------- */
export default function Dashboard() {
  const [tasks, setTasks] = useState({
    pending: [],
    inProgress: [],
    completed: [],
    overdue: []
  });
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("User");

  const greeting = useMemo(getGreeting, []);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await getMyTasks();
      const Me = await authService.getMe();
      console.log(Me);
      // console.log(response);
      
      if (response.success && response.tasks && Me) {
        // Categorize tasks by status
        const categorizedTasks = categorizeTasks(response.tasks);
        setTasks(categorizedTasks);
        setUserName(Me.user.name);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const categorizeTasks = (taskList) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const categorized = {
      pending: [],
      inProgress: [],
      completed: [],
      overdue: []
    };

    taskList.forEach((task) => {
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      // Check if overdue
      if (task.status !== 'completed' && dueDate < today) {
        categorized.overdue.push(task);
      } else {
        // Categorize by status
        switch (task.status.toLowerCase()) {
          case 'pending':
            categorized.pending.push(task);
            break;
          case 'in-progress':
          case 'in progress':
            categorized.inProgress.push(task);
            break;
          case 'completed':
            categorized.completed.push(task);
            break;
          default:
            categorized.pending.push(task);
        }
      }
    });

    return categorized;
  };

  const stats = getStats(tasks);
  const deadlines = getUpcomingDeadlines(tasks);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#235857] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-[#6D8B8C]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ================= GREETING ================= */}
      <section
        className="rounded-3xl p-6 md:p-8
                          bg-gradient-to-r from-[#235857] to-[#3B8A7F]
                          text-white shadow-sm"
      >
        <h1 className="text-2xl md:text-3xl font-bold">
          {greeting}, <span className="text-[#D3D9D4]">{userName}</span>
        </h1>
        <p className="mt-2 text-sm md:text-base text-[#D3D9D4]">
          You have {tasks.inProgress.length} active{" "}
          {tasks.inProgress.length === 1 ? "task" : "tasks"} today.
        </p>
      </section>

      {/* ================= STATS ================= */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((s) => {
          const Icon = s.icon;

          return (
            <div
              key={s.title}
              className="bg-white rounded-2xl p-5 md:p-6
                         shadow-sm border border-[#D3D9D4]
                         flex items-center gap-4 transition
                         hover:shadow-md hover:border-[#3B8A7F]"
            >
              <div
                className="h-11 w-11 md:h-12 md:w-12 rounded-xl
                           bg-[#3B8A7F]/15
                           flex items-center justify-center
                           text-[#235857]"
              >
                <Icon />
              </div>

              <div>
                <p className="text-sm text-[#6D8B8C]">{s.title}</p>
                <p className="text-2xl md:text-3xl font-bold text-[#0D2426]">
                  {s.value}
                </p>
              </div>
            </div>
          );
        })}
      </section>

      {/* TASK BOARD */}
      <section>
        <h2 className="text-lg md:text-xl font-semibold text-[#0D2426] mb-4">
          Task board
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <BoardColumn
            title="Pending tasks"
            count={tasks.pending.length}
            navigate={navigate}
          >
            {tasks.pending.length === 0 ? (
              <EmptyState message="No pending tasks" />
            ) : (
              tasks.pending
                .slice(0, 2)
                .map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onClick={() => navigate("/employee/tasks")}
                  />
                ))
            )}
          </BoardColumn>

          <BoardColumn
            title="In progress"
            count={tasks.inProgress.length}
            navigate={navigate}
          >
            {tasks.inProgress.length === 0 ? (
              <EmptyState message="No tasks in progress" />
            ) : (
              tasks.inProgress
                .slice(0, 2)
                .map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onClick={() => navigate("/employee/tasks")}
                  />
                ))
            )}
          </BoardColumn>

          <BoardColumn
            title="Completed tasks"
            count={tasks.completed.length}
            navigate={navigate}
          >
            {tasks.completed.length === 0 ? (
              <EmptyState message="No completed tasks" />
            ) : (
              tasks.completed
                .slice(0, 2)
                .map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    completed
                    onClick={() => navigate("/employee/tasks")}
                  />
                ))
            )}
          </BoardColumn>
        </div>
      </section>

      {/* ================= OVERDUE TASKS (if any) ================= */}
      {tasks.overdue.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1 h-6 bg-red-500 rounded-full" />
            <h2 className="text-lg md:text-xl font-semibold text-red-600">
              Overdue tasks ({tasks.overdue.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.overdue.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                overdue
                onClick={() => navigate("/employee/tasks")}
              />
            ))}
          </div>
        </section>
      )}

      {/* ================= UPCOMING DEADLINES ================= */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2
            className="text-lg md:text-xl font-semibold text-[#0D2426]
                         flex items-center gap-2"
          >
            <span className="w-1 h-6 bg-[#235857] rounded-full" />
            Upcoming deadlines
          </h2>

          <button
            onClick={() => navigate("/employee/calendar")}
            className="text-sm px-4 py-2 rounded-lg
                       bg-[#D3D9D4]/60 text-[#235857]
                       hover:bg-[#3B8A7F]/20 self-start sm:self-auto
                       transition-all"
          >
            View all
          </button>
        </div>

        <div className="space-y-4">
          {deadlines.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
              <p className="text-[#6D8B8C]">No upcoming deadlines</p>
            </div>
          ) : (
            deadlines.map((task) => (
              <div
                key={task._id}
                className="flex flex-col sm:flex-row
                           bg-white rounded-2xl shadow-sm overflow-hidden
                           hover:shadow-md transition cursor-pointer"
                onClick={() => navigate("/employee/tasks")}
              >
                <div
                  className="sm:w-24 flex sm:flex-col
                             items-center justify-center
                             bg-[#235857] text-white
                             py-3 sm:py-0"
                >
                  <span className="text-xs font-semibold">
                    {task.date
                      .toLocaleString("en-US", { month: "short" })
                      .toUpperCase()}
                  </span>
                  <span className="text-xl sm:text-2xl font-bold">
                    {task.date.getDate()}
                  </span>
                </div>

                <div className="flex-1 px-4 md:px-6 py-4">
                  <p className="font-semibold text-[#0D2426]">{task.title}</p>
                  <p className="text-sm text-[#6D8B8C] mt-1">
                    {task.project?.name || "No project"} • Priority:{" "}
                    {task.priority}
                  </p>
                  {task.description && (
                    <p className="text-xs text-[#6D8B8C] mt-2 line-clamp-1">
                      {task.description}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

/* ---------- sub components ---------- */

function BoardColumn({ title, count, children, navigate }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 border border-[#D3D9D4]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[#235857]">{title}</h3>

        <div className="flex items-center gap-2">
          {count > 2 && (
            <button
              onClick={() => navigate("/employee/tasks")}
              className="text-xs font-semibold text-[#235857] hover:underline"
            >
              View all
            </button>
          )}

          <span className="text-xs font-bold text-[#6D8B8C] bg-[#F4F8F8] px-2 py-1 rounded-full">
            {count}
          </span>
        </div>
      </div>

      <div className="space-y-4">{children}</div>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="text-center py-8 text-[#6D8B8C] text-sm">
      <p>{message}</p>
    </div>
  );
}

function TaskCard({ task, completed, overdue, onClick }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return 'bg-red-100 text-red-700';
      case 'high':
        return 'bg-orange-100 text-orange-700';
      case 'medium':
        return 'bg-blue-100 text-blue-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-xl
                 border p-4 bg-white
                 shadow-sm transition-all duration-200
                 hover:shadow-md hover:-translate-y-[2px]
                 ${overdue 
                   ? 'border-red-300 hover:border-red-400' 
                   : 'border-[#D3D9D4] hover:border-[#3B8A7F]'
                 }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span
          className={`inline-block text-xs px-3 py-1 rounded-full ${
            overdue 
              ? 'bg-red-100 text-red-700' 
              : 'bg-[#D3D9D4]/60 text-[#235857]'
          }`}
        >
          {task.project?.name || 'No project'}
        </span>
        <span
          className={`text-[9px] font-bold px-2 py-1 rounded uppercase ${getPriorityColor(task.priority)}`}
        >
          {task.priority}
        </span>
      </div>

      <p
        className={`font-medium text-sm mb-2 ${
          completed
            ? "line-through text-[#6D8B8C]"
            : overdue
            ? "text-red-600"
            : "text-[#0D2426] hover:text-[#235857]"
        }`}
      >
        {task.title}
      </p>

      {task.description && (
        <p className="text-xs text-[#6D8B8C] mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-[#6D8B8C] pt-3 border-t border-[#F4F8F8]">
        <span className="flex items-center gap-1">
          {task.assignedTo && task.assignedTo.length > 0 ? (
            <>
              <span className="w-5 h-5 rounded-full bg-[#235857] text-white flex items-center justify-center text-[9px] font-bold">
                {task.assignedTo[0].name?.[0] || 'A'}
              </span>
              {task.assignedTo.length > 1 && (
                <span className="text-[9px]">+{task.assignedTo.length - 1}</span>
              )}
            </>
          ) : (
            <span>Unassigned</span>
          )}
        </span>
        <span className={overdue ? 'text-red-600 font-semibold' : ''}>
          {formatDate(task.dueDate)}
        </span>
      </div>
    </div>
  );
}

/* ---------- ICONS ---------- */

function ClipboardIcon() {
  return (
    <svg
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M9 4h6v2H9z" />
      <rect x="5" y="6" width="12" height="14" rx="2" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="11" cy="11" r="9" />
      <path d="M11 6v5l3 2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="11" cy="11" r="9" />
      <path d="M7 11l3 3 5-5" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="11" cy="11" r="9" />
      <path d="M11 6v6M11 16h.01" />
    </svg>
  );
}