import React, { useState, useEffect } from "react";
import { 
  Users, Briefcase, Clock, Activity, TrendingUp, 
  CheckCircle, MessageSquare, ChevronRight, MoreVertical, 
  AlertCircle, ShieldCheck
} from 'lucide-react';
import { useNavigate } from "react-router-dom"; // Added for navigation
import { toast } from "react-toastify";
import { getMyTasks } from "../../api/taskApi";
import { getMyProjects } from "../../api/projectApi";
import { getMyTeam } from "../../api/userApi";

export default function LeaderDashboard() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Initialize navigation

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch leader's tasks
      const tasksResponse = await getMyTasks();
      setTasks(tasksResponse.tasks || []);

      // Fetch leader's projects
      const projectsResponse = await getMyProjects();
      setProjects(projectsResponse.projects || []);

      // Fetch team members
      const teamResponse = await getMyTeam();
      setTeamMembers(teamResponse.teamMembers || []);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const upcomingDeadlines = tasks.filter(t => {
    const daysUntilDue = Math.ceil((new Date(t.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    return daysUntilDue <= 7 && daysUntilDue >= 0;
  }).length;

  const stats = [
    { label: "Active Projects", val: projects.length, icon: Briefcase, color: "text-[#1F6F68]", bg: "bg-[#EAF4F3]" },
    { label: "Pending Approval", val: pendingTasks, icon: AlertCircle, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Sprint Velocity", val: "24.5", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Upcoming Deadlines", val: upcomingDeadlines, icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
  ];

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
    <div className="min-h-screen bg-[#F8FAFB] p-4 md:p-8 space-y-6 font-sans text-gray-800 antialiased">
      
      {/* 1. STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-[#dbdce6] shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center`}>
              <stat.icon size={22} />
            </div>
            <div>
              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">{stat.label}</p>
              <p className="text-xl font-semibold text-gray-900">{stat.val}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 2. TASK APPROVAL TABLE */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-[#dbdce6] shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <ShieldCheck size={18} className="text-[#1F6F68]" /> Task Approval Queue
              </h3>
              <span className="text-xs text-gray-500">{pendingTasks} pending</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 text-[10px] uppercase tracking-widest text-gray-400 font-medium">
                  <tr>
                    <th className="px-6 py-4">Task Details</th>
                    <th className="px-6 py-4">Assignee</th>
                    <th className="px-6 py-4">Deadline</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {tasks.filter(t => t.status === 'pending').slice(0, 5).map((task) => (
                    <tr key={task._id} className="hover:bg-gray-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-800">{task.title}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{task.project?.name || 'No project'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {task.assignedTo && task.assignedTo.length > 0 ? (
                            <>
                              <div className="w-6 h-6 rounded-full bg-[#1F6F68] text-white text-[8px] flex items-center justify-center font-bold">
                                {task.assignedTo[0].name.charAt(0)}
                              </div>
                              <span className="text-xs text-gray-600 font-medium">{task.assignedTo[0].name}</span>
                            </>
                          ) : (
                            <span className="text-xs text-gray-400">Unassigned</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500 font-medium">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => navigate("/leader/tasks")} // Update: Redirects to Leader Tasks
                          className="px-3 py-1.5 bg-[#1F6F68] text-white text-[10px] font-bold rounded-lg hover:bg-[#16524d] transition-all"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {tasks.filter(t => t.status === 'pending').length === 0 && (
              <div className="p-8 text-center text-gray-400 text-sm">
                No pending tasks
              </div>
            )}
          </div>

          {/* 3. RECENT ACTIVITY */}
          <div className="bg-white p-6 rounded-xl border border-[#dbdce6] shadow-sm">
            <h3 className="text-sm font-semibold mb-6 flex items-center gap-2">
              <Activity size={18} className="text-[#1F6F68]" /> Recent Team Activity
            </h3>
            <div className="space-y-6">
              {tasks.slice(0, 3).map((task, idx) => (
                <div key={idx} className="flex gap-4 relative">
                  {idx !== 2 && <div className="absolute left-4 top-8 bottom-0 w-px bg-gray-100"></div>}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    task.status === 'completed' ? 'bg-[#EAF4F3] text-[#1F6F68]' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {task.status === 'completed' ? <CheckCircle size={14} /> : <MessageSquare size={14} />}
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      <span className="font-semibold text-gray-900">{task.assignedTo?.[0]?.name || 'Someone'}</span>
                      {" "}{task.status === 'completed' ? 'completed' : 'updated'} {task.title}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase font-medium tracking-tight">
                      {new Date(task.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
              {tasks.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No recent activity</p>
              )}
            </div>
          </div>
        </div>

        {/* 4. TEAM WORKLOAD & INSIGHTS */}
        <div className="space-y-6">
          {/* Team Workload */}
          <div className="bg-white p-6 rounded-xl border border-[#dbdce6] shadow-sm">
            <h3 className="text-sm font-semibold mb-6 flex items-center justify-between">
              Team Workload
              <span className="text-[10px] font-medium text-[#1F6F68] bg-[#EAF4F3] px-2 py-0.5 rounded">Live</span>
            </h3>
            <div className="space-y-5">
              {teamMembers.slice(0, 3).map((member, i) => {
                // Calculate load based on assigned tasks
                const memberTasks = tasks.filter(t => 
                  t.assignedTo?.some(a => a._id === member._id)
                );
                const load = Math.min((memberTasks.length / 10) * 100, 100); // Max 10 tasks = 100%

                return (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-gray-600">{member.name}</span>
                      <span className={load > 80 ? "text-red-500" : "text-[#1F6F68]"}>
                        {Math.round(load)}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${load > 80 ? 'bg-red-500' : 'bg-[#1F6F68]'}`} 
                        style={{ width: `${load}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
              {teamMembers.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No team members</p>
              )}
            </div>
          </div>

          {/* Sprint Progress Chart */}
          <div className="bg-white p-6 rounded-xl border border-[#dbdce6] shadow-sm">
            <h3 className="text-sm font-semibold mb-6 flex items-center gap-2">
              <TrendingUp size={18} className="text-[#1F6F68]" /> Sprint Progress
            </h3>
            <div className="h-40 w-full flex items-end gap-2 px-1">
              {[40, 60, 55, 85, 95, 70, 90].map((h, i) => (
                <div 
                  key={i} 
                  className="flex-1 bg-[#1F6F68]/10 rounded-t-sm hover:bg-[#1F6F68] transition-all duration-300 relative group cursor-pointer" 
                  style={{ height: `${h}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[8px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {h}%
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
