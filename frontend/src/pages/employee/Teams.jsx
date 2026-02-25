import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getMyProjects } from "../../api/projectApi";
import { Loader2, Users, Briefcase, Calendar } from "lucide-react";

const statusStyles = {
  active: "bg-emerald-100 text-emerald-700",
  completed: "bg-blue-100 text-blue-700",
  "on-hold": "bg-amber-100 text-amber-700",
};

export default function Team() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showAllMembers, setShowAllMembers] = useState(false);


  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await getMyProjects();
      
      if (response.success && response.projects) {
        setProjects(response.projects);
        // Auto-select first project if available
        if (response.projects.length > 0) {
          setSelectedProject(response.projects[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#235857] mx-auto mb-4" />
          <p className="text-sm text-[#6D8B8C]">Loading team information...</p>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="min-h-screen bg-[#D3D9D4]/30 p-4 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0D2426] mb-2">
          Team overview
        </h1>
        <p className="text-[#6D8B8C] mb-8">
          View team members and their current projects.
        </p>
        
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <Users size={48} className="mx-auto text-[#D3D9D4] mb-4" />
          <h3 className="text-xl font-bold text-[#0D2426] mb-2">No Projects Found</h3>
          <p className="text-[#6D8B8C]">You don't have any projects yet. Create a project to see your team.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#D3D9D4]/30 p-4 sm:p-8">
      {/* ================= HEADER ================= */}
      <h1 className="text-2xl sm:text-3xl font-bold text-[#0D2426] mb-2">
        Team overview
      </h1>
      <p className="text-[#6D8B8C] mb-8 sm:mb-10">
        View team members and their current projects.
      </p>

      {/* ================= PROJECT SELECTOR ================= */}
      {projects.length > 1 && (
        <div className="mb-8">
          <label className="text-sm font-bold text-[#6D8B8C] uppercase tracking-wider mb-3 block">
            Select Project
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <button
                key={project._id}
                onClick={() => setSelectedProject(project)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  selectedProject?._id === project._id
                    ? "border-[#235857] bg-[#EAF4F3] shadow-md"
                    : "border-[#D3D9D4] bg-white hover:border-[#3B8A7F]"
                }`}
              >
                <h3 className="font-bold text-[#0D2426] mb-1">
                  {project.name}
                </h3>
                <p className="text-xs text-[#6D8B8C]">{project.domain}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Users size={12} className="text-[#6D8B8C]" />
                  <span className="text-xs text-[#6D8B8C]">
                    {project.teamMembers?.length || 0} members
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedProject && (
        <>
          {/* ================= PROJECT INFO ================= */}
          <div className="mb-12">
            <div className="bg-gradient-to-r from-[#235857] to-[#3B8A7F] rounded-2xl p-6 sm:p-8 text-white shadow-lg">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Briefcase size={24} />
                    <h2 className="text-2xl sm:text-3xl font-bold">
                      {selectedProject.name}
                    </h2>
                  </div>
                  <p className="text-[#D3D9D4] mb-4">
                    {selectedProject.description || "No description available"}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-white/20 rounded-full">
                        {selectedProject.domain}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>
                        Deadline: {formatDate(selectedProject.deadline)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          selectedProject.status === "active"
                            ? "bg-emerald-500 text-white"
                            : selectedProject.status === "completed"
                              ? "bg-blue-500 text-white"
                              : "bg-amber-500 text-white"
                        }`}
                      >
                        {selectedProject.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">
                    {selectedProject.teamMembers?.length || 0}
                  </div>
                  <div className="text-sm text-[#D3D9D4]">Team Members</div>
                </div>
              </div>
            </div>
          </div>

          {/* ================= PROJECT LEADER ================= */}
          {selectedProject.leader && (
            <div className="mb-12">
              <h2 className="text-lg font-semibold text-[#235857] mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-[#235857] rounded-full" />
                Project Leader
              </h2>

              <div
                className="bg-white rounded-2xl shadow-md p-5 sm:p-6
                           transition-all duration-300
                           hover:shadow-lg hover:-translate-y-1
                           border border-transparent hover:border-[#3B8A7F]"
              >
                <span
                  className="inline-block mb-3 text-xs px-3 py-1 rounded-full
                             bg-[#235857] text-white font-bold"
                >
                  LEADER
                </span>

                <div
                  className="flex flex-col lg:flex-row items-center lg:items-start
                            justify-between gap-6"
                >
                  <div className="text-center lg:text-left">
                    <h3 className="text-xl sm:text-2xl font-bold text-[#0D2426]">
                      {selectedProject.leader.name}
                    </h3>

                    <p className="text-sm text-[#6D8B8C] mt-1">
                      {selectedProject.leader.domain || "Project Leader"}
                    </p>

                    <p className="text-sm text-[#6D8B8C] mt-2">
                      {selectedProject.leader.email}
                    </p>
                  </div>

                  <div
                    className="h-28 w-28 sm:h-36 sm:w-36 rounded-2xl bg-[#235857]
                             flex items-center justify-center
                             text-white text-2xl sm:text-3xl font-bold
                             transition-transform duration-300
                             hover:scale-105 shadow-lg"
                  >
                    {getInitials(selectedProject.leader.name)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TEAM MEMBERS ================= */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[#235857] flex items-center gap-2">
                <span className="w-1 h-6 bg-[#3B8A7F] rounded-full" />
                Team Members ({selectedProject.teamMembers?.length || 0})
              </h2>

              {selectedProject.teamMembers?.length > 4 && (
                <button
                  onClick={() => setShowAllMembers(!showAllMembers)}
                  className="text-sm font-semibold text-[#235857] hover:underline"
                >
                  {showAllMembers ? "Show Less" : "View All"}
                </button>
              )}
            </div>

            {!selectedProject.teamMembers ||
            selectedProject.teamMembers.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                <Users size={48} className="mx-auto text-[#D3D9D4] mb-4" />
                <h3 className="text-lg font-bold text-[#0D2426] mb-2">
                  No Team Members
                </h3>
                <p className="text-[#6D8B8C]">
                  This project doesn't have any team members yet. Add members to
                  get started.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {(showAllMembers
                  ? selectedProject.teamMembers
                  : selectedProject.teamMembers.slice(0, 4)
                ).map((member) => (
                  <div
                    key={member._id}
                    className="bg-white rounded-2xl shadow-sm p-5
                               transition-all duration-300
                               hover:shadow-lg hover:-translate-y-1
                               border border-transparent hover:border-[#3B8A7F]"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div
                        className="h-12 w-12 rounded-full bg-[#3B8A7F]
                                   text-white flex items-center justify-center
                                   font-semibold text-sm transition-transform duration-300
                                   hover:scale-105 shadow-md"
                      >
                        {getInitials(member.name)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#0D2426] truncate">
                          {member.name}
                        </p>
                        <p className="text-xs text-[#6D8B8C] truncate">
                          {member.domain || "Team Member"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs text-[#6D8B8C] flex items-center gap-2">
                        <span className="font-medium">Email:</span>
                        <span className="truncate">{member.email}</span>
                      </div>

                      {/* Status badge - can be enhanced based on task completion */}
                      <span className="inline-block text-xs px-3 py-1 rounded-full bg-[#3B8A7F]/15 text-[#235857] font-medium">
                        Active Member
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ================= PROJECT STATS ================= */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-[#D3D9D4]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-[#235857]/10 flex items-center justify-center text-[#235857]">
                  <Users size={20} />
                </div>
                <span className="text-sm text-[#6D8B8C] font-medium">
                  Team Size
                </span>
              </div>
              <p className="text-3xl font-bold text-[#0D2426]">
                {selectedProject.teamMembers?.length || 0}
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-[#D3D9D4]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-[#3B8A7F]/10 flex items-center justify-center text-[#3B8A7F]">
                  <Briefcase size={20} />
                </div>
                <span className="text-sm text-[#6D8B8C] font-medium">
                  Domain
                </span>
              </div>
              <p className="text-lg font-bold text-[#0D2426]">
                {selectedProject.domain}
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-[#D3D9D4]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                  <Calendar size={20} />
                </div>
                <span className="text-sm text-[#6D8B8C] font-medium">
                  Status
                </span>
              </div>
              <p className="text-lg font-bold text-[#0D2426] capitalize">
                {selectedProject.status}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}