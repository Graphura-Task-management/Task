import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getAllProjects } from "../../api/projectApi";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  FolderKanban,
  StickyNote,
  Clock,
  User,
  Users,
  AlertCircle,
} from "lucide-react";

export default function AdminCalendar() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const initialDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const [selectedDate, setSelectedDate] = useState(initialDateStr);

  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
    loadNotes();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await getAllProjects();
      if (response.success && response.projects) {
        setProjects(response.projects);
      }
    } catch (error) {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const loadNotes = () => {
    const savedNotes = localStorage.getItem("adminCalendarNotes");
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  };

  const saveNotes = (updatedNotes) => {
    localStorage.setItem("adminCalendarNotes", JSON.stringify(updatedNotes));
  };

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const monthName = new Date(currentYear, currentMonth).toLocaleString(
    "en-US",
    { month: "long" },
  );

  const getLocalDateString = (day) =>
    `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const formatDateToLocal = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const isProjectOverdue = (deadline, status) => {
    if (status?.toLowerCase() === "completed") return false;
    const deadlineDate = new Date(deadline);
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    deadlineDate.setHours(0, 0, 0, 0);
    return deadlineDate < todayDate;
  };

  const getProjectDeadlinesForDate = (dateStr) => {
    return projects
      .filter(
        (project) =>
          project.deadline && formatDateToLocal(project.deadline) === dateStr,
      )
      .map((project) => ({
        id: project._id,
        name: project.name,
        description: project.description,
        domain: project.domain,
        status: project.status,
        deadline: project.deadline,
        leader: project.leader,
        teamMembers: project.teamMembers || [],
        createdAt: project.createdAt,
        isOverdue: isProjectOverdue(project.deadline, project.status),
      }));
  };

  const hasDeadlines = (dateStr) => {
    return projects.some(
      (project) =>
        project.deadline && formatDateToLocal(project.deadline) === dateStr,
    );
  };

  const getNotesForDate = (dateStr) => notes.filter((n) => n.date === dateStr);

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

  const addNote = () => {
    if (!noteText.trim() || !selectedDate) return;
    const updatedNotes = [
      ...notes,
      { id: Date.now(), date: selectedDate, text: noteText },
    ];
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
    setNoteText("");
  };

  const deleteNote = (noteId) => {
    const updatedNotes = notes.filter((n) => n.id !== noteId);
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-700 border-green-200";
      case "active":
      case "in-progress":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="w-full px-6 lg:px-8 pt-6 pb-10 space-y-6 animate-in fade-in duration-500">
      {/* Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0D2426]">
            Project Monitoring Calendar
          </h1>
          <p className="text-sm text-[#6D8B8C]">
            Comprehensive oversight of all projects and deadlines
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-[#D3D9D4] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#F4F8F8] rounded-lg text-[#235857]">
            <CalendarIcon size={18} />
          </div>
          <h2 className="text-lg font-semibold text-[#0D2426]">
            {monthName}{" "}
            <span className="text-[#6D8B8C] font-normal">{currentYear}</span>
          </h2>
        </div>

        <div className="flex gap-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg hover:bg-[#F4F8F8] border border-[#D3D9D4]"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg hover:bg-[#F4F8F8] border border-[#D3D9D4]"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#D3D9D4]">
        <div className="grid grid-cols-7 text-xs font-bold uppercase tracking-wider text-[#6D8B8C] mb-4">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="text-center">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-3">
          {[...Array(firstDay)].map((_, i) => (
            <div key={i} />
          ))}

          {[...Array(daysInMonth)].map((_, index) => {
            const day = index + 1;
            const dateStr = getLocalDateString(day);
            const isToday =
              day === today.getDate() &&
              currentMonth === today.getMonth() &&
              currentYear === today.getFullYear();
            const isSelected = selectedDate === dateStr;

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(dateStr)}
                className={`h-16 sm:h-20 rounded-xl border text-sm flex flex-col items-center justify-center transition-all
                ${
                  isSelected
                    ? "bg-[#235857] text-white shadow-md border-[#235857]"
                    : isToday
                      ? "border-[#235857] bg-[#EAF4F3] text-[#235857] font-bold"
                      : "hover:bg-[#F4F8F8]"
                }`}
              >
                {day}
                {hasDeadlines(dateStr) && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full mt-1 ${isSelected ? "bg-white" : "bg-[#235857]"}`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Detailed Section */}
      {selectedDate && (
        <div className="bg-[#F4F8F8]/50 rounded-2xl p-6 border border-[#D3D9D4] space-y-6">
          <h4 className="text-sm font-bold text-[#235857] uppercase tracking-wider flex items-center gap-2">
            <FolderKanban size={16} />
            Project Deadlines — {new Date(selectedDate).toDateString()}
          </h4>

          {loading ? (
            <p className="text-sm text-[#6D8B8C]">Loading projects...</p>
          ) : getProjectDeadlinesForDate(selectedDate).length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl border">
              No project deadlines on this date.
            </div>
          ) : (
            getProjectDeadlinesForDate(selectedDate).map((project) => (
              <div
                key={project.id}
                className="p-6 bg-white rounded-xl border space-y-4"
              >
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-lg font-bold">{project.name}</h3>
                    <p className="text-xs text-[#6D8B8C]">{project.domain}</p>
                  </div>

                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusColor(project.status)}`}
                  >
                    {project.status}
                  </span>
                </div>

                {project.leader && (
                  <div className="flex items-center gap-2 text-sm">
                    <User size={14} /> {project.leader.name}
                  </div>
                )}

                <div className="flex gap-4 text-xs text-[#6D8B8C]">
                  <span>
                    Created: {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                  <span>
                    Deadline: {new Date(project.deadline).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}

          {/* Notes */}
          <div>
            <h4 className="text-xs font-bold uppercase mb-2 flex gap-2 items-center">
              <StickyNote size={14} /> Personal Notes
            </h4>

            {getNotesForDate(selectedDate).map((n) => (
              <div
                key={n.id}
                className="bg-white p-3 rounded-lg border mb-2 flex justify-between"
              >
                <p className="text-xs">{n.text}</p>
                <button
                  onClick={() => deleteNote(n.id)}
                  className="text-red-500 text-xs"
                >
                  X
                </button>
              </div>
            ))}

            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={3}
              placeholder="Add note..."
              className="w-full border rounded-lg p-2 text-xs"
            />

            <button
              onClick={addNote}
              className="mt-2 w-full py-2 bg-[#235857] text-white rounded-lg text-xs font-semibold"
            >
              Add Note
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
