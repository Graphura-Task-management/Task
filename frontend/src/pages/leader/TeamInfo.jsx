import { useState, useEffect } from "react";
import { 
  UserPlus, 
  Trash2, 
  Mail, 
  ChevronDown,
  X,
  User,
  Briefcase,
  FolderOpen
} from "lucide-react";
import { toast } from "react-toastify";
import { getMyTeam, deleteUser } from "../../api/userApi";
import { addTeamMember, getMyProjects, removeTeamMember } from "../../api/projectApi";

const DOMAINS = [
  "All Domains",
  "Sales & Marketing",
  "Data & AI Intelligence",
  "Human Resources",
  "Social Media Management",
  "Graphic Design",
  "Digital Marketing",
  "Video Editing",
  "Full Stack Development",
  "MERN Stack Development",
  "Email and Outreaching",
  "Content Writing",
  "Content Creator",
  "UI/UX Designing",
  "Front-end Developer",
  "Back-end Developer",
];


export default function LeaderTeams() {
  const [members, setMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All Domains");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState("");

  useEffect(() => {
    fetchTeamMembers();
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setProjectsLoading(true);
      const response = await getMyProjects();
      console.log('Projects:', response);
      
      // Extract projects array from response
      const projectsList = response.projects || response || [];
      setProjects(projectsList);
      
      // Set first project as default if available
      if (projectsList.length > 0) {
        setSelectedProject(projectsList[0]._id);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setProjectsLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const response = await getMyTeam();
      
      const transformedMembers = (response.teamMembers || []).map(member => ({
        id: member._id,
        name: member.name,
        role: member.role || 'Team Member',
        domain: member.domain || 'General',
        status: determineStatus(member),
        initials: getInitials(member.name),
        email: member.email,
        userId: member._id
      }));

      setMembers(transformedMembers);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const determineStatus = (member) => {
    return member.isActive ? "In progress" : "Pending";
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

  const deleteMember = async (memberId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName} from your team?`)) {
      return;
    }

    try {
      // await deleteUser(memberId);
    const response = await removeTeamMember(memberId);
    console.log(response);
    if(response.success){
      setMembers(prev => prev.filter(m => m.id !== memberId));

      toast.success(`${memberName} removed successfully`);


    }
    } catch (error) {
      console.error('Error deleting member:', error);
      toast.error('Failed to remove team member');
      await fetchTeamMembers();
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    const memberData = {
      name: formData.get("name"),
      domain: formData.get("domain"),
      email: formData.get("email"),
      projectId: formData.get("projectId") 
    };

    // Validate project selection
    if (!memberData.projectId) {
      toast.error('Please select a project');
      return;
    }

    try {
      console.log('Adding member:', memberData);
      const response = await addTeamMember(memberData);
      
      if (response.success) {
        toast.success(`${memberData.name} added successfully to the team`);
        setIsModalOpen(false);
        
        // Refresh team members and projects
        await fetchTeamMembers();
        await fetchProjects();
        
        // Reset form
        e.target.reset();
        setSelectedProject(projects.length > 0 ? projects[0]._id : "");
      }
    } catch (err) {
      console.error('Error adding member:', err);
      const errorMessage = err.response?.data?.message || 'Failed to add team member';
      toast.error(errorMessage);
    }
  };

  const filteredMembers = activeFilter === "All Domains" 
    ? members 
    : members.filter(m => m.domain === activeFilter);

  // Get project name by ID
  const getProjectName = (projectId) => {
    const project = projects.find(p => p._id === projectId);
    return project ? project.name : 'Unknown Project';
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-500">
      
      {/* HEADING */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl font-semibold text-[#0D2426]">Team Resource Oversight</h1>
          <p className="text-xs text-[#6D8B8C]">Manage personnel allocation and monitor active member status</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-[10px] font-bold text-[#6D8B8C] uppercase tracking-widest">Team Size</p>
            <p className="text-lg font-semibold text-[#235857]">{members.length}</p>
          </div>
          <div className="text-center border-l border-[#D3D9D4] pl-4">
            <p className="text-[10px] font-bold text-[#6D8B8C] uppercase tracking-widest">Active</p>
            <p className="text-lg font-semibold text-[#235857]">
              {members.filter(m => m.status === "In progress").length}
            </p>
          </div>
          <div className="text-center border-l border-[#D3D9D4] pl-4">
            <p className="text-[10px] font-bold text-[#6D8B8C] uppercase tracking-widest">Projects</p>
            <p className="text-lg font-semibold text-[#235857]">{projects.length}</p>
          </div>
        </div>
      </div>

      {/* LOADING STATE */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#235857] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-[#6D8B8C]">Loading team members...</p>
          </div>
        </div>
      ) : (
        <>
          {/* FILTER & ACTION BAR */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3 rounded-2xl border border-[#D3D9D4] shadow-sm">
            <div className="relative w-full sm:w-64 group">
              <select 
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
                className="w-full appearance-none bg-[#F4F8F8] border border-[#D3D9D4] text-[#0D2426] text-xs font-semibold py-2.5 pl-4 pr-10 rounded-xl cursor-pointer outline-none focus:border-[#235857] transition-all"
              >
                {DOMAINS.map(domain => (
                  <option key={domain} value={domain}>{domain}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6D8B8C] pointer-events-none group-hover:text-[#235857] transition-colors" />
            </div>
            
            <button 
              onClick={() => setIsModalOpen(true)}
              disabled={projects.length === 0}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-[#235857] text-white rounded-xl text-sm font-semibold hover:bg-[#1a4443] transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              title={projects.length === 0 ? "Create a project first" : "Add team member"}
            >
              <UserPlus size={16} />
              Add Member
            </button>
          </div>

          {/* NO PROJECTS WARNING */}
          {projects.length === 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
              <FolderOpen size={32} className="mx-auto text-amber-600 mb-3" />
              <p className="text-sm font-semibold text-amber-900 mb-1">No Projects Available</p>
              <p className="text-xs text-amber-700">Create a project first before adding team members.</p>
            </div>
          )}

          {/* TEAM GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.length === 0 ? (
              <div className="col-span-full text-center py-12 text-[#6D8B8C] text-sm">
                {activeFilter === "All Domains" 
                  ? "No team members found. Add team members to get started."
                  : `No team members found in ${activeFilter} domain.`
                }
              </div>
            ) : (
              filteredMembers.map((member) => (
                <div key={member.id} className="bg-white p-5 rounded-2xl border border-[#D3D9D4] shadow-sm hover:border-[#235857]/30 transition-all group relative overflow-hidden">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-[#F4F8F8] text-[#235857] flex items-center justify-center font-semibold text-lg border border-[#D3D9D4]">
                        {member.initials}
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#0D2426] text-sm sm:text-base leading-tight">{member.name}</h3>
                        <p className="text-[10px] font-semibold text-[#235857] uppercase tracking-wider mt-0.5">{member.domain}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteMember(member.id, member.name)}
                      className="p-2 text-[#6D8B8C] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remove team member"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="mt-6 flex items-center justify-between pt-4 border-t border-[#F4F8F8]">
                    <div className="flex items-center gap-1.5 text-[#6D8B8C]">
                      <Mail size={12} />
                      <span className="text-[11px] font-medium truncate max-w-[150px]">{member.email}</span>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter ${
                      member.status === "Completed" ? "bg-emerald-50 text-emerald-600" : 
                      member.status === "In progress" ? "bg-blue-50 text-blue-600" :
                      "bg-amber-50 text-amber-600"
                    }`}>
                      {member.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* ADD MEMBER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0D2426]/30 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[2rem] p-6 sm:p-10 shadow-2xl border border-[#D3D9D4] relative overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#EAF4F3] rounded-full -mr-16 -mt-16 opacity-50" />
            
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute right-6 top-6 text-[#6D8B8C] hover:text-[#0D2426] p-2 hover:bg-[#F4F8F8] rounded-full transition-all z-10"
            >
              <X size={20} />
            </button>
            
            <div className="mb-8 relative">
              <div className="w-12 h-12 bg-[#235857] text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-[#235857]/20">
                <UserPlus size={24} />
              </div>
              <h2 className="text-xl font-semibold text-[#0D2426]">Add Team Member</h2>
              <p className="text-xs text-[#6D8B8C] mt-1">Assign a new member to your project</p>
            </div>

            {projectsLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-[#235857] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-[#6D8B8C]">Loading projects...</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-xs text-amber-700 font-medium">
                  <strong>Notice:</strong> You need to create a project first before adding team members.
                </p>
              </div>
            ) : (
              <form onSubmit={handleAddMember} className="space-y-5 relative">
                
                {/* PROJECT SELECTION - FIRST */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#6D8B8C] uppercase tracking-widest ml-1 flex items-center gap-1.5">
                    <FolderOpen size={10} /> Select Project
                  </label>
                  <div className="relative">
                    <select 
                      name="projectId"
                      value={selectedProject}
                      onChange={(e) => setSelectedProject(e.target.value)}
                      required
                      className="w-full appearance-none rounded-xl border-2 border-[#235857] px-4 py-3 text-sm bg-[#EAF4F3] outline-none focus:border-[#1a4443] focus:bg-white transition-all cursor-pointer font-semibold text-[#0D2426]"
                    >
                      <option value="">-- Choose a Project --</option>
                      {projects.map(project => (
                        <option key={project._id} value={project._id}>
                          {project.name} ({project.domain}) - {new Date(project.deadline).toLocaleDateString()}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#235857] pointer-events-none" />
                  </div>
                  {selectedProject && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs text-blue-700">
                        <strong>Project:</strong> {getProjectName(selectedProject)}
                      </p>
                    </div>
                  )}
                </div>

                <div className="border-t border-[#D3D9D4] pt-5">
                  <p className="text-xs font-bold text-[#6D8B8C] uppercase tracking-widest mb-4">Member Details</p>
                  
                  {/* MEMBER NAME */}
                  <div className="space-y-1.5 mb-5">
                    <label className="text-[10px] font-bold text-[#6D8B8C] uppercase tracking-widest ml-1 flex items-center gap-1.5">
                      <User size={10} /> Full Name
                    </label>
                    <input 
                      name="name" 
                      required 
                      placeholder="e.g. Robert Fox" 
                      className="w-full rounded-xl border border-[#D3D9D4] px-4 py-3 text-sm bg-[#F4F8F8] outline-none focus:border-[#235857] focus:bg-white transition-all" 
                    />
                  </div>

                  {/* EMAIL */}
                  <div className="space-y-1.5 mb-5">
                    <label className="text-[10px] font-bold text-[#6D8B8C] uppercase tracking-widest ml-1 flex items-center gap-1.5">
                      <Mail size={10} /> Email Address
                    </label>
                    <input 
                      name="email" 
                      type="email"
                      required
                      placeholder="robert.fox@org.com" 
                      className="w-full rounded-xl border border-[#D3D9D4] px-4 py-3 text-sm bg-[#F4F8F8] outline-none focus:border-[#235857] focus:bg-white transition-all" 
                    />
                  </div>
                  
                  {/* DOMAIN */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#6D8B8C] uppercase tracking-widest ml-1 flex items-center gap-1.5">
                      <Briefcase size={10} /> Domain Assignment
                    </label>
                    <div className="relative">
                      <select 
                        name="domain"
                        required
                        className="w-full appearance-none rounded-xl border border-[#D3D9D4] px-4 py-3 text-sm bg-[#F4F8F8] outline-none focus:border-[#235857] focus:bg-white transition-all cursor-pointer"
                      >
                        <option value="">-- Select Domain --</option>
                        {DOMAINS.filter(d => d !== "All Domains").map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6D8B8C] pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 text-[#6D8B8C] text-sm font-semibold hover:bg-[#F4F8F8] rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] py-3 bg-[#235857] text-white rounded-xl text-sm font-semibold shadow-lg hover:bg-[#1a4443] transition-all active:scale-95"
                  >
                    Add to Team
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}