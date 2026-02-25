import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Clock, Target, CheckCircle2, TrendingUp, Calendar, 
  AlertTriangle, Users, MessageSquare, Zap, Info, ShieldCheck, Edit3
} from "lucide-react";
import { toast } from "react-toastify";
import { getMyProjects, updateProject } from "../../api/projectApi";
import { getMyTasks } from "../../api/taskApi";

export default function LeaderProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for Editing
  const [editingProject, setEditingProject] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const projectsResponse = await getMyProjects();
      setProjects(projectsResponse.projects || []);
      const tasksResponse = await getMyTasks();
      setTasks(tasksResponse.tasks || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProject = async () => {
    try {
      await updateProject(editingProject._id, editingProject);
      toast.success("Project updated successfully");
      setEditingProject(null);
      fetchData();
    } catch (error) {
      toast.error("Failed to update project");
    }
  };

  // Stats calculation
  const ongoing = tasks.filter(t => t.status === 'in-progress').length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const total = tasks.length;
  const avgProgress = total > 0 ? Math.round((completed / total) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#235857]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-[#F6F6F8] min-h-screen pb-24 font-sans">
      
      {/* HEADER SECTION */}
      <div className="pt-0 flex flex-col md:flex-row md:items-center justify-between pb-2">
        <div>
          <h1 className="text-xl font-semibold text-[#0D2426]">Project Monitoring Summary</h1>
          <p className="text-xs text-[#6D8B8C]">Comprehensive oversight of organizational delivery and risk</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#235857] bg-[#EAF4F3] px-3 py-1 rounded-full uppercase tracking-wider">
            <ShieldCheck size={12} /> Live System Active
          </span>
        </div>
      </div>

      {/* PORTFOLIO PERFORMANCE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3 bg-white p-6 rounded-3xl border border-[#D3D9D4] shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-[#0D2426] flex items-center gap-2">
              <TrendingUp size={18} className="text-[#235857]" /> Portfolio Performance
            </h3>
          </div>
          <div className="flex items-end gap-4 mb-2">
            <span className="text-4xl font-bold text-[#0D2426]">{avgProgress}%</span>
            <span className="text-sm text-[#235857] font-medium mb-1">Efficiency Rate</span>
          </div>
          <div className="w-full h-3 bg-[#F0F7F6] rounded-full overflow-hidden mb-6">
            <div className="h-full bg-[#235857] rounded-full transition-all duration-1000" style={{ width: `${avgProgress}%` }} />
          </div>
          <div className="grid grid-cols-3 gap-4 border-t border-[#F4F8F8] pt-6">
            <div>
              <p className="text-[10px] uppercase font-bold text-[#6D8B8C] tracking-wider">Active Tasks</p>
              <p className="text-lg font-semibold text-[#0D2426]">{ongoing}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-[#6D8B8C] tracking-wider">Completed</p>
              <p className="text-lg font-semibold text-[#0D2426]">{completed}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-[#6D8B8C] tracking-wider">Total Tasks</p>
              <p className="text-lg font-semibold text-[#0D2426]">{total}</p>
            </div>
          </div>
        </div>
      </div>

      {/* PROJECT PORTFOLIO */}
      <div className="bg-white p-6 rounded-3xl border border-[#D3D9D4] shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Target size={20} className="text-[#235857]" />
            <h3 className="font-semibold text-[#0D2426]">Active Projects</h3>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">No projects assigned</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {projects.map((project) => {
              const projectTasks = tasks.filter(t => t.project?._id === project._id);
              const projectCompleted = projectTasks.filter(t => t.status === 'completed').length;
              const projectProgress = projectTasks.length > 0 ? Math.round((projectCompleted / projectTasks.length) * 100) : 0;

              return (
                <div 
                  key={project._id}
                  className="group relative p-5 bg-gradient-to-br from-[#FBFBFC] to-[#F4F8F8] rounded-2xl border-2 border-[#E8EEEE] hover:border-[#235857] transition-all cursor-pointer"
                  // UPDATED: Now clicking the card triggers the edit modal instead of navigation
                  onClick={() => {
                    setEditingProject({
                      ...project,
                      deadline: project.deadline?.split("T")[0]
                    });
                  }}
                >
                  <div className="absolute top-4 right-4 p-2 bg-white rounded-xl text-[#235857] opacity-0 group-hover:opacity-100 transition-opacity border border-[#D3D9D4] shadow-sm">
                    <Edit3 size={14} />
                  </div>

                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="font-bold text-[#0D2426] text-base mb-1">{project.name}</h4>
                      <p className="text-xs text-[#6D8B8C] line-clamp-2">{project.description}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EAF4F3] text-[#235857] rounded-lg text-[11px] font-semibold mb-3">
                      <Zap size={12} /> {project.domain}
                    </span>
                    <div className="h-2 bg-white rounded-full overflow-hidden border border-[#E8EEEE]">
                      <div className="h-full bg-[#235857]" style={{ width: `${projectProgress}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 border border-blue-200">
                    <Calendar size={14} className="text-blue-600" />
                    <div className="flex-1">
                      <p className="text-[9px] uppercase font-bold text-blue-600 mb-0.5">Deadline</p>
                      <p className="text-xs font-bold text-blue-900">{new Date(project.deadline).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {editingProject && (
        <div className="fixed inset-0 bg-[#0D2426]/70 backdrop-blur-sm flex items-center justify-center z-[150] p-4">
          <div className="bg-white p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-[#0D2426] mb-6">Edit Project Details</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-[#6D8B8C] uppercase ml-1">Project Name</label>
                <input
                  className="w-full p-4 bg-[#F4F8F8] border border-[#D3D9D4] rounded-2xl outline-none focus:border-[#235857]"
                  value={editingProject.name}
                  onChange={(e) => setEditingProject({...editingProject, name: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#6D8B8C] uppercase ml-1">Description</label>
                <textarea
                  className="w-full p-4 bg-[#F4F8F8] border border-[#D3D9D4] rounded-2xl outline-none focus:border-[#235857] min-h-[100px]"
                  value={editingProject.description}
                  onChange={(e) => setEditingProject({...editingProject, description: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#6D8B8C] uppercase ml-1">Deadline</label>
                <input
                  type="date"
                  className="w-full p-4 bg-[#F4F8F8] border border-[#D3D9D4] rounded-2xl outline-none focus:border-[#235857]"
                  value={editingProject.deadline}
                  onChange={(e) => setEditingProject({...editingProject, deadline: e.target.value})}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setEditingProject(null)} 
                  className="flex-1 py-4 border border-[#D3D9D4] rounded-2xl font-bold text-[#6D8B8C]"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpdateProject} 
                  className="flex-1 py-4 bg-[#235857] text-white rounded-2xl font-bold shadow-lg shadow-[#235857]/20"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
