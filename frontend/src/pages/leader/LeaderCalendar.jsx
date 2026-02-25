import { useEffect, useState } from "react";
import { getMyProjects } from "../../api/projectApi";
import { toast } from 'react-toastify';

import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  FolderKanban,
  Clock,
  User,
  Users,
  AlertCircle
} from "lucide-react";

export default function LeaderCalendar() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  
  // Set today as default selected date so it's visible on load
  const initialDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const [selectedDate, setSelectedDate] = useState(initialDateStr);
  
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch projects
      const projectsResponse = await getMyProjects();
      console.log('Projects Response:', projectsResponse);
      
      if (projectsResponse.success && projectsResponse.projects) {
        setProjects(projectsResponse.projects);
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const monthName = new Date(currentYear, currentMonth).toLocaleString("en-US", { month: "long" });

  const getLocalDateString = (day) =>
    `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  // Helper function to convert date to local date string (YYYY-MM-DD)
  const formatDateToLocal = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  // Check if project is overdue
  const isProjectOverdue = (deadline) => {
    const deadlineDate = new Date(deadline);
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    deadlineDate.setHours(0, 0, 0, 0);
    return deadlineDate < todayDate;
  };

  // Get all project deadlines for a date
  const getProjectDeadlinesForDate = (dateStr) => {
    const projectDeadlines = projects
      .filter((project) => formatDateToLocal(project.deadline) === dateStr)
      .map((project) => ({
        id: project._id,
        name: project.name,
        description: project.description,
        domain: project.domain,
        status: project.status,
        deadline: project.deadline,
        createdAt: project.createdAt,
        createdBy: project.createdBy,
        leader: project.leader,
        teamMembers: project.teamMembers || [],
        isOverdue: isProjectOverdue(project.deadline)
      }));
    
    return projectDeadlines;
  };

  // Check if a date has any project deadlines
  const hasProjectDeadlines = (dateStr) => {
    return projects.some((project) => formatDateToLocal(project.deadline) === dateStr);
  };

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else setCurrentMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else setCurrentMonth((m) => m + 1);
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pending':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'active':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-6 animate-in fade-in duration-500">
      
      {/* Heading */}
      <div className="pt-0 flex flex-col md:flex-row md:items-center justify-between pb-2">
        <div>
          <h1 className="text-xl font-semibold text-[#0D2426]">Project Monitoring Calendar</h1>
          <p className="text-xs text-[#6D8B8C]">Track project deadlines and team assignments</p>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between bg-white px-5 py-3 rounded-xl border border-[#D3D9D4] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-[#F4F8F8] rounded-lg text-[#235857]">
            <CalendarIcon size={18} />
          </div>
          <h2 className="text-base font-semibold text-[#0D2426]">
            {monthName} <span className="text-[#6D8B8C] font-normal">{currentYear}</span>
          </h2>
        </div>

        <div className="flex gap-1.5">
          <button onClick={prevMonth} className="p-1.5 rounded-lg bg-white hover:bg-[#F4F8F8] border border-[#D3D9D4] text-[#235857] transition-all">
            <ChevronLeft size={18} />
          </button>
          <button onClick={nextMonth} className="p-1.5 rounded-lg bg-white hover:bg-[#F4F8F8] border border-[#D3D9D4] text-[#235857] transition-all">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D3D9D4]">
        <div className="grid grid-cols-7 text-[10px] font-bold uppercase tracking-widest text-[#6D8B8C] mb-4">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="text-center">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {[...Array(firstDay)].map((_, i) => <div key={i} />)}
          {[...Array(daysInMonth)].map((_, index) => {
            const day = index + 1;
            const dateStr = getLocalDateString(day);
            const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
            const isSelected = selectedDate === dateStr;
            const hasDeadline = hasProjectDeadlines(dateStr);

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(dateStr)}
                className={`h-14 sm:h-16 rounded-xl border text-sm flex flex-col items-center justify-center relative transition-all
                  ${isToday && !isSelected ? "border-[#235857] bg-[#EAF4F3] text-[#235857] font-bold" : "border-transparent"}
                  ${isSelected ? "!bg-[#235857] !border-[#235857] !text-white shadow-md z-10" : "hover:bg-[#F4F8F8] text-[#0D2426]"}
                `}
              >
                <span className="text-sm font-semibold">{day}</span>
                {hasDeadline && (
                  <span className={`w-1 h-1 rounded-full mt-1 ${isSelected ? "bg-white" : "bg-[#235857]"}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Project Details View */}
      {selectedDate && (
        <div className="bg-[#F4F8F8]/50 rounded-2xl p-6 border border-[#D3D9D4] space-y-6 animate-in slide-in-from-bottom-2 duration-300">
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-[#235857] uppercase tracking-wider flex items-center gap-2">
              <FolderKanban size={16} /> 
              Project Deadlines - {new Date(selectedDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h4>
            
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-sm text-[#6D8B8C] italic">Loading projects...</p>
                </div>
              ) : getProjectDeadlinesForDate(selectedDate).length === 0 ? (
                <div className="text-center py-8 bg-white rounded-xl border border-[#D3D9D4]">
                  <FolderKanban size={32} className="mx-auto text-[#6D8B8C] mb-2" />
                  <p className="text-sm text-[#6D8B8C]">No project deadlines on this date.</p>
                </div>
              ) : (
                getProjectDeadlinesForDate(selectedDate).map((project) => (
                  <div 
                    key={project.id} 
                    className={`p-5 bg-white rounded-xl border-2 space-y-4 transition-all ${
                      project.isOverdue 
                        ? 'border-red-300 bg-red-50/50 shadow-red-100' 
                        : 'border-[#D3D9D4] hover:border-[#235857]/30'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-start gap-2">
                          {project.isOverdue && (
                            <AlertCircle size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
                          )}
                          <div>
                            <h3 className="text-lg font-bold text-[#0D2426]">{project.name}</h3>
                            <p className="text-xs text-[#6D8B8C] uppercase mt-1">{project.domain}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {project.status && (
                          <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${getStatusColor(project.status)}`}>
                            {project.status}
                          </span>
                        )}
                        {project.isOverdue && (
                          <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border bg-red-100 text-red-700 border-red-300">
                            OVERDUE
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    {project.description && (
                      <div className="bg-[#F4F8F8] p-3 rounded-lg">
                        <p className="text-xs text-[#0D2426] leading-relaxed">{project.description}</p>
                      </div>
                    )}

                    {/* Admin/Creator Info */}
                    {project.createdBy && (
                      <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-[#EAF4F3] to-white rounded-lg border border-[#D3D9D4]/50">
                        <div className="p-2 bg-white rounded-lg border border-[#D3D9D4]">
                          <User size={16} className="text-[#235857]" />
                        </div>
                        <div>
                          <p className="text-[9px] text-[#6D8B8C] uppercase font-semibold tracking-wide">Assigned By (Admin)</p>
                          <p className="text-sm font-semibold text-[#0D2426] mt-0.5">{project.createdBy.name}</p>
                          <p className="text-xs text-[#6D8B8C] mt-0.5">{project.createdBy.email}</p>
                        </div>
                      </div>
                    )}

                    {/* Team Members */}
                    <div className="border-t border-[#D3D9D4] pt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Users size={14} className="text-[#235857]" />
                        <p className="text-[9px] text-[#6D8B8C] uppercase font-semibold tracking-wide">
                          Team Members ({project.teamMembers.length})
                        </p>
                      </div>
                      
                      {project.teamMembers.length === 0 ? (
                        <div className="text-center py-3 bg-[#F4F8F8] rounded-lg">
                          <p className="text-xs text-[#6D8B8C] italic">No team members assigned yet</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {project.teamMembers.map((member, idx) => (
                            <div 
                              key={idx} 
                              className="flex items-center gap-2 p-2.5 bg-white rounded-lg border border-[#D3D9D4] hover:border-[#235857]/30 transition-colors"
                            >
                              <div className="w-8 h-8 rounded-full bg-[#235857] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-[#0D2426] truncate">
                                  {member.name || 'Team Member'}
                                </p>
                                {member.email && (
                                  <p className="text-[10px] text-[#6D8B8C] truncate">{member.email}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer - Timestamps */}
                    <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-[#D3D9D4]">
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} className="text-[#6D8B8C]" />
                        <span className="text-[10px] text-[#6D8B8C]">
                          Created: {new Date(project.createdAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} className={project.isOverdue ? "text-red-600" : "text-[#6D8B8C]"} />
                        <span className={`text-[10px] ${project.isOverdue ? "text-red-600 font-semibold" : "text-[#6D8B8C]"}`}>
                          Deadline: {new Date(project.deadline).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}