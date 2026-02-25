import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  CheckCircle,
  Users,
  BarChart3,
  Plus,
  FileText,
  Calendar,
  Settings,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import { getDashboardStats } from "../../api/userApi";
import { getAllProjects } from "../../api/projectApi";
import { getAllLeaders } from "../../api/userApi";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalLeaders: 0,
    avgProgress: 0,
    lateProjects: 0,
  });
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const statsResponse = await getDashboardStats();
      setStats(statsResponse.stats);

      const projectsResponse = await getAllProjects();
      setProjects(projectsResponse.projects || []);

      const leadersResponse = await getAllLeaders();
      setLeaders(leadersResponse.leaders || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter((p) => {
    if (filter === "all") return true;
    if (filter === "active") return p.status === "active";
    if (filter === "completed") return p.status === "completed";
    return true;
  });

  // ✅ SAFE CLICK HANDLER
  const handleProjectClick = (projectId) => {
    // jab tak detail page nahi hai — projects list pe bhejo
    navigate("/admin/projects");

    // future ready:
    // navigate(`/admin/projects/${projectId}`)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#235857] mx-auto"></div>
          <p className="mt-4 text-[#6b8f8b]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 sm:gap-6">
        <StatCard
          title="Total Projects"
          value={stats.totalProjects}
          icon={<LayoutGrid />}
        />
        <StatCard
          title="Active"
          value={stats.activeProjects}
          icon={<CheckCircle />}
        />
        <StatCard
          title="Completed"
          value={stats.completedProjects}
          icon={<CheckCircle />}
        />
        <StatCard title="Leaders" value={stats.totalLeaders} icon={<Users />} />
        <StatCard
          title="Late Projects"
          value={stats.lateProjects}
          icon={<AlertCircle />}
        />
        <StatCard
          title="Avg Progress"
          value={`${stats.avgProgress}%`}
          icon={<BarChart3 />}
        />
      </div>

      {/* QUICK ACTIONS */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#d7ebe9]">
        <h2 className="text-xl font-semibold text-[#0D2426] mb-4">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-4 sm:gap-6">
          <ActionBtn
            label="New Project"
            onClick={() => navigate("/admin/create")}
            icon={<Plus />}
          />
          <ActionBtn
            label="All Projects"
            onClick={() => navigate("/admin/projects")}
            icon={<LayoutGrid />}
          />
          <ActionBtn
            label="View Leaders"
            icon={<Users />}
            onClick={() => navigate("/admin/leaders")}
          />
          <ActionBtn
            label="Billing & Reports"
            icon={<FileText />}
            onClick={() => navigate("/admin/reports")}
          />
          <ActionBtn
            label="Calendar"
            icon={<Calendar />}
            onClick={() => navigate("/admin/admincalender")}
          />
          <ActionBtn
            label="Settings"
            icon={<Settings />}
            onClick={() => navigate("/admin/adminsetting")}
          />
        </div>
      </div>

      {/* PROJECTS */}
      <div className="bg-white p-6 rounded-3xl border border-[#d7ebe9]">
        <h2 className="text-xl font-semibold text-[#0D2426] mb-4">Projects</h2>

        <div className="flex flex-wrap gap-3 mb-4">
          {["all", "active", "completed"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1 rounded-xl font-bold uppercase text-xs tracking-widest transition ${
                filter === f
                  ? "bg-[#235857] text-white"
                  : "bg-[#eaf4f3] text-[#235857] hover:bg-[#dff1ef]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {filteredProjects.length === 0 ? (
          <p className="text-[#6b8f8b] text-sm">No projects found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredProjects.map((p) => {
              const progress = p.progress || 0;
              const isLate =
                new Date(p.deadline) < new Date() && p.status !== "completed";

              return (
                <div
                  key={p._id}
                  onClick={() => handleProjectClick(p._id)}
                  className="p-5 bg-[#eaf4f3] rounded-2xl hover:bg-[#dff1ef] hover:scale-[1.02] transition cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-[#235857]">{p.name}</h3>

                    <span
                      className={`text-xs px-2 py-1 rounded-full font-bold ${
                        p.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : p.status === "active"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>

                  <p className="text-xs text-[#6b8f8b] mb-2">
                    Lead: {p.leader?.name || "Not assigned"}
                  </p>

                  <div className="h-2 bg-white rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-[#235857]"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-xs font-semibold">
                    <span>{progress}%</span>
                    <span
                      className={isLate ? "text-rose-500" : "text-[#235857]"}
                    >
                      {new Date(p.deadline).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* LEADERS */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#d7ebe9]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-[#0D2426]">
            Leaders Overview
          </h2>
          <button
            onClick={() => navigate("/admin/leaders")}
            className="text-sm text-[#235857] hover:underline font-medium"
          >
            View All
          </button>
        </div>

        {leaders.length === 0 ? (
          <p className="text-[#6b8f8b] text-sm">No leaders assigned.</p>
        ) : (
          <div className="space-y-4">
            {leaders.slice(0, 5).map((l) => (
              <div
                key={l._id}
                onClick={() => navigate(`/admin/leaders/${l._id}`)}
                className="flex justify-between items-center p-4 bg-[#eaf4f3] rounded-2xl hover:bg-[#dff1ef] transition cursor-pointer"
              >
                <div>
                  <h4 className="font-bold text-[#235857]">{l.name}</h4>
                  <p className="text-xs text-[#6b8f8b]">
                    {l.domain} · {l.statistics?.totalTasks || 0} tasks ·{" "}
                    {l.statistics?.staff || 0} staff
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* COMPONENTS */

const StatCard = ({ title, value, icon }) => (
  <div
    className="
    bg-white
    rounded-3xl
    border border-[#d7ebe9]
    aspect-square
    flex flex-col
    justify-center
    items-center
    text-center
    p-4 sm:p-6
    hover:-translate-y-1
    transition
  "
  >
    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#eaf4f3] text-[#235857] rounded-xl flex items-center justify-center mb-3">
      {icon}
    </div>

    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#6b8f8b]">
      {title}
    </p>

    <h3 className="text-xl sm:text-3xl font-black text-[#235857] mt-1">
      {value}
    </h3>
  </div>
);

const ActionBtn = ({ label, icon, onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center p-5 bg-white border border-[#d7ebe9] rounded-2xl hover:bg-[#eaf4f3] transition"
  >
    <div className="p-3 rounded-xl text-[#235857]">{icon}</div>
    <span className="text-sm font-semibold text-[#235857]">{label}</span>
  </button>
);

export default AdminDashboard;
