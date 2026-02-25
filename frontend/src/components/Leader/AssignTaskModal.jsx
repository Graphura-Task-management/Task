// =============================================
// components/Leader/AssignTaskModal.jsx - WITH PROJECT-SPECIFIC TEAM MEMBERS
// =============================================

import React, { useState, useEffect } from "react";
import { X, ListTodo, Calendar as CalendarIcon, Check, AlignLeft, Briefcase, Users, Mic, MicOff } from "lucide-react";
import { toast } from "react-toastify";
import { createTask } from "../../api/taskApi";
import { getMyProjects } from "../../api/projectApi";

export default function AssignTaskModal({ isOpen, onClose }) {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [projectTeamMembers, setProjectTeamMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchProjects();
      
      // Set default start date to today
      const today = new Date().toISOString().split('T')[0];
      setStartDate(today);
    }
  }, [isOpen]);

  // Fetch projects when modal opens
  const fetchProjects = async () => {
    try {
      const projectsResponse = await getMyProjects();
      setProjects(projectsResponse.projects || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to load projects");
    }
  };

  // Update team members when project is selected
  useEffect(() => {
    if (selectedProject) {
      const project = projects.find(p => p._id === selectedProject);
      if (project && project.teamMembers) {
        setProjectTeamMembers(project.teamMembers);
        // Clear previously selected members
        setSelectedMembers([]);
      } else {
        setProjectTeamMembers([]);
        setSelectedMembers([]);
      }
    } else {
      setProjectTeamMembers([]);
      setSelectedMembers([]);
    }
  }, [selectedProject, projects]);

  // Voice Recognition Setup
  const startSpeechToText = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Your browser does not support voice recognition. Please try Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setDescription((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      toast.error("Voice recognition error. Please try again.");
    };

    recognition.start();
  };

  const toggleMemberSelection = (memberId) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId) 
        : [...prev, memberId]
    );
  };

  const handleSelectAllMembers = () => {
    if (selectedMembers.length === projectTeamMembers.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(projectTeamMembers.map(m => m._id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const formData = new FormData(e.target);
    const title = formData.get("taskTitle");

    if (!selectedProject) {
      toast.error("Please select a project");
      return;
    }

    if (selectedMembers.length === 0) {
      toast.error("Please assign at least one team member");
      return;
    }

    if (!selectedDate) {
      toast.error("Please select a due date");
      return;
    }

    setLoading(true);

    try {
      const taskData = {
        title,
        description,
        project: selectedProject,
        assignedTo: selectedMembers,
        startDate: startDate || new Date().toISOString(),
        dueDate: selectedDate,
        priority,
        status: 'pending'
      };

      console.log('Creating task:', taskData);
      const response = await createTask(taskData);

      if (response.success) {
        toast.success("Task created and assigned successfully!");
        
        // Reset form
        resetForm();
        
        // Close modal
        onClose();

        // Trigger refresh in parent component
        window.dispatchEvent(new Event("taskCreated"));
        window.location.href = "/leader";
      }
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error(error.response?.data?.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedProject("");
    setProjectTeamMembers([]);
    setSelectedMembers([]);
    setSelectedDate("");
    setStartDate(new Date().toISOString().split('T')[0]);
    setDescription("");
    setPriority("medium");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#0D2426]/80 z-[100] flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl flex flex-col overflow-hidden max-h-[90vh] sm:max-h-[95vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#D3D9D4] flex justify-between items-center bg-[#F4F8F8]">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#0D2426]">Task Assignment Form</h2>
            <p className="text-[#6D8B8C] text-[10px] sm:text-xs uppercase tracking-wider font-medium">Deploy New Project Task</p>
          </div>
          <button 
            onClick={() => {
              resetForm();
              onClose();
            }}
            disabled={loading}
            className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full text-[#6D8B8C] transition-all shadow-sm bg-white disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-8 custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            
            {/* Task Title */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#2D8A83] uppercase flex items-center gap-2 tracking-widest">
                <ListTodo size={14} /> Task Title
              </label>
              <input 
                required 
                name="taskTitle" 
                disabled={loading}
                className="w-full bg-[#F9FAFA] border border-[#D3D9D4] rounded-2xl py-3 px-4 text-sm outline-none focus:ring-4 focus:ring-[#2D8A83]/10 focus:border-[#2D8A83] transition-all disabled:opacity-50" 
                placeholder="What needs to be done?" 
              />
            </div>

            {/* Project Selection */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#2D8A83] uppercase flex items-center gap-2 tracking-widest">
                <Briefcase size={14} /> Select Project
              </label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                required
                disabled={loading}
                className="w-full bg-[#F9FAFA] border border-[#D3D9D4] rounded-2xl py-3 px-4 text-sm outline-none focus:ring-4 focus:ring-[#2D8A83]/10 focus:border-[#2D8A83] transition-all disabled:opacity-50"
              >
                <option value="">Choose a project...</option>
                {projects.map(project => (
                  <option key={project._id} value={project._id}>
                    {project.name} - {project.domain}
                  </option>
                ))}
              </select>
              {projects.length === 0 && (
                <p className="text-xs text-amber-600">No projects available. Please create a project first.</p>
              )}
              {selectedProject && projectTeamMembers.length === 0 && (
                <p className="text-xs text-amber-600">No team members in this project. Please add team members first.</p>
              )}
            </div>

            {/* Description with Voice Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold text-[#2D8A83] uppercase flex items-center gap-2 tracking-widest">
                  <AlignLeft size={14} /> Description
                </label>
                <button 
                  type="button"
                  onClick={startSpeechToText}
                  disabled={loading}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold transition-all disabled:opacity-50 ${
                    isListening 
                      ? "bg-red-100 text-red-600 animate-pulse" 
                      : "bg-[#2D8A83]/10 text-[#2D8A83] hover:bg-[#2D8A83]/20"
                  }`}
                >
                  {isListening ? <MicOff size={12} /> : <Mic size={12} />}
                  {isListening ? "Listening..." : "Voice Input"}
                </button>
              </div>
              <textarea 
                name="description" 
                rows="3" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                className="w-full bg-[#F9FAFA] border border-[#D3D9D4] rounded-2xl py-3 px-4 text-sm outline-none focus:ring-4 focus:ring-[#2D8A83]/10 focus:border-[#2D8A83] resize-none disabled:opacity-50" 
                placeholder="Provide detailed instructions..."
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Start Date */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#2D8A83] uppercase flex items-center gap-2 tracking-widest">
                  <CalendarIcon size={14} /> Start Date
                </label>
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={loading}
                  className="w-full bg-[#F9FAFA] border border-[#D3D9D4] rounded-2xl py-3 px-4 text-sm outline-none focus:border-[#2D8A83] disabled:opacity-50" 
                />
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#2D8A83] uppercase flex items-center gap-2 tracking-widest">
                  <CalendarIcon size={14} /> Due Date
                </label>
                <input 
                  required 
                  type="date" 
                  value={selectedDate} 
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={startDate}
                  disabled={loading}
                  className="w-full bg-[#F9FAFA] border border-[#D3D9D4] rounded-2xl py-3 px-4 text-sm outline-none focus:border-[#2D8A83] disabled:opacity-50" 
                />
              </div>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#2D8A83] uppercase tracking-widest">
                Priority Level
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['low', 'medium', 'high', 'urgent'].map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    disabled={loading}
                    className={`py-2.5 rounded-xl text-xs font-bold uppercase transition-all disabled:opacity-50 ${
                      priority === p
                        ? 'bg-[#2D8A83] text-white shadow-md'
                        : 'bg-[#F4F8F8] text-[#6D8B8C] hover:bg-[#2D8A83]/10'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Team Members from Selected Project */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold text-[#2D8A83] uppercase flex items-center gap-2 tracking-widest">
                  <Users size={14} /> Assign Team Members
                  {selectedProject && projectTeamMembers.length > 0 && (
                    <span className="text-[#6D8B8C] normal-case font-normal">
                      ({selectedMembers.length}/{projectTeamMembers.length} selected)
                    </span>
                  )}
                </label>
                {projectTeamMembers.length > 0 && (
                  <button 
                    type="button" 
                    onClick={handleSelectAllMembers}
                    disabled={loading}
                    className="text-[10px] font-bold text-[#2D8A83] hover:underline disabled:opacity-50"
                  >
                    {selectedMembers.length === projectTeamMembers.length ? "Deselect All" : "Select All"}
                  </button>
                )}
              </div>

              <div className="p-4 bg-[#F4F8F8] rounded-2xl border border-[#D3D9D4] min-h-[120px] max-h-64 overflow-y-auto">
                {!selectedProject ? (
                  <div className="flex items-center justify-center h-24 text-center">
                    <p className="text-xs text-[#6D8B8C]">Please select a project first</p>
                  </div>
                ) : projectTeamMembers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-24 text-center">
                    <Users size={32} className="text-[#D3D9D4] mb-2" />
                    <p className="text-xs text-[#6D8B8C] font-medium">No team members in this project</p>
                    <p className="text-[10px] text-[#6D8B8C] mt-1">Add team members to the project first</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {projectTeamMembers.map(member => (
                      <label 
                        key={member._id} 
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                          selectedMembers.includes(member._id) 
                            ? "bg-white border-[#2D8A83] shadow-md" 
                            : "bg-transparent border-transparent hover:bg-white/60 hover:border-[#D3D9D4]"
                        }`}
                      >
                        <input 
                          type="checkbox" 
                          className="sr-only" 
                          checked={selectedMembers.includes(member._id)} 
                          onChange={() => toggleMemberSelection(member._id)}
                          disabled={loading}
                        />
                        <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                          selectedMembers.includes(member._id) 
                            ? "bg-[#2D8A83] border-[#2D8A83]" 
                            : "bg-white border-[#D3D9D4]"
                        }`}>
                          {selectedMembers.includes(member._id) && (
                            <Check size={12} className="text-white" strokeWidth={4} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-semibold text-[#0D2426] block truncate">
                            {member.name}
                          </span>
                          <span className="text-[9px] text-[#6D8B8C] truncate block">
                            {member.domain || member.email}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading || projects.length === 0 || !selectedProject || projectTeamMembers.length === 0}
              className="w-full py-4 bg-[#1F6F68] hover:bg-[#16524d] text-white rounded-2xl font-bold text-sm shadow-xl shadow-[#1F6F68]/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating Task...
                </>
              ) : (
                "Confirm & Deploy Task"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}