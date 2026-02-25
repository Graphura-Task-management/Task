// =============================================
// pages/admin/Leaders.jsx - WITH API
// =============================================

import React, { useState, useEffect } from "react";
import { Mail, Users, Briefcase, X } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { getAllLeaders, getLeaderDetails } from "../../api/userApi";
import { getAllProjects, addTeamMember } from "../../api/projectApi";

const Leaders = () => {
  const [openModal, setOpenModal] = useState(false);
  const [leaders, setLeaders] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedLeader, setSelectedLeader] = useState(null);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLeaders = leaders.filter((leader) => {
    const term = searchTerm.toLowerCase();

    return (
      leader.name?.toLowerCase().includes(term) ||
      leader.email?.toLowerCase().includes(term) ||
      leader.domain?.toLowerCase().includes(term)
    );
  });

  useEffect(() => {
    fetchLeaders();
    fetchProjects();
  }, []);

  const fetchLeaders = async () => {
    try {
      setLoading(true);
      const response = await getAllLeaders();
      setLeaders(response.leaders || []);
    } catch (error) {
      console.error("Error fetching leaders:", error);
      toast.error("Failed to load leaders");
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await getAllProjects();
      setProjects(response.projects || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const handleOpenModal = (leader) => {
    setSelectedLeader(leader);
    setOpenModal(true);
  };

  const handleAssignDomain = async () => {
    if (!selectedLeader || selectedProjects.length === 0) {
      toast.error("Please select at least one project");
      return;
    }

    try {
      // Here you would call API to assign projects to leader
      // For now, just show success message
      toast.success(`Assigned ${selectedProjects.length} projects to ${selectedLeader.name}`);
      setOpenModal(false);
      setSelectedProjects([]);
      fetchLeaders();
    } catch (error) {
      console.error("Error assigning projects:", error);
      toast.error("Failed to assign projects");
    }
  };

  const toggleProjectSelection = (projectId) => {
    setSelectedProjects(prev => 
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#235857] mx-auto"></div>
          <p className="mt-4 text-[#6b8f8b]">Loading leaders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      {/* Page Title */}
      {/* Page Title + Search */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-[#0D2426]">
            Leaders Directory
          </h1>
          <p className="text-[#6D8B8C]">
            View all leaders, their domains, and contact information. (
            {filteredLeaders.length} leaders)
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search by name, email, or domain..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#d7ebe9] bg-white text-sm focus:border-[#235857] focus:ring-2 focus:ring-[#235857]/20 outline-none transition"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6D8B8C]"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="8" cy="8" r="7" />
            <path d="M13 13l-3-3" />
          </svg>
        </div>
      </div>
      {/* Grid Wrapper for Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredLeaders.map((leader) => (
          <div
            key={leader._id}
            className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 border border-[#d7ebe9] hover:translate-y-[-4px] transition flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                {/* Logo / Initials */}
                <div className="w-20 h-20 sm:w-16 sm:h-16 rounded-2xl bg-[#235857] text-white flex items-center justify-center text-xl font-bold shadow-inner shrink-0">
                  {leader.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </div>

                {/* Name & Domains */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h2 className="text-xl font-bold text-gray-800">
                      {leader.name}
                    </h2>
                    <span className="bg-[#235857] text-white text-[10px] px-2 py-1 rounded-full uppercase tracking-wider">
                      Leader
                    </span>
                  </div>

                  <p className="text-sm mt-2 text-gray-600 leading-relaxed">
                    <span className="text-[#235857] font-medium">
                      {leader.domain}
                    </span>
                  </p>
                </div>
              </div>

              <hr className="my-5 border-gray-100" />

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-[#eaf4f3] rounded-xl p-3">
                  <Mail className="text-[#235857] shrink-0" size={18} />
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-500 uppercase font-bold">
                      Email
                    </p>
                    <p className="font-medium truncate">{leader.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-[#eaf4f3] rounded-xl p-3">
                  <Users className="text-[#235857] shrink-0" size={18} />
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold">
                      Teams
                    </p>
                    <p className="font-medium">
                      {leader.statistics?.teams || 0} Teams
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mt-4 mb-6">
                <div className="bg-[#f0f7f6] rounded-xl p-2 text-center">
                  <p className="text-lg font-bold text-[#235857]">
                    {leader.statistics?.totalTasks || 0}
                  </p>
                  <p className="text-[9px] text-gray-500 font-bold uppercase">
                    Tasks
                  </p>
                </div>
                <div className="bg-[#f0f7f6] rounded-xl p-2 text-center">
                  <p className="text-lg font-bold text-[#235857]">
                    {leader.statistics?.completedTasks || 0}
                  </p>
                  <p className="text-[9px] text-gray-500 font-bold uppercase">
                    Done
                  </p>
                </div>
                <div className="bg-[#f0f7f6] rounded-xl p-2 text-center">
                  <p className="text-lg font-bold text-[#235857]">
                    {leader.statistics?.staff || 0}
                  </p>
                  <p className="text-[9px] text-gray-500 font-bold uppercase">
                    Staff
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleOpenModal(leader)}
                className="w-full flex items-center justify-center gap-2 bg-[#235857] text-white py-3 rounded-xl font-medium hover:bg-[#1a3d3d] transition active:scale-[0.98]"
              >
                <Briefcase size={18} />
                Assign Projects
              </button>

              <a
                href={`mailto:${leader.email}`}
                className="w-full flex items-center justify-center gap-2 bg-white text-[#235857] border-2 border-[#235857] py-3 rounded-xl font-medium hover:bg-[#eaf4f3] transition"
              >
                <Mail size={18} />
                Contact Leader
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredLeaders.length === 0 && (
        <div className="text-center py-28 bg-white rounded-3xl border border-dashed border-[#d7ebe9]">
          <p className="text-[#235857] font-extrabold text-xl">
            No leaders found
          </p>
          <p className="text-[#6b8f8b] mt-2">
            Try adjusting your search or check back later.
          </p>
        </div>
      )}

      {/* Modal - Assign Projects */}
      {openModal && selectedLeader && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                Assign Projects to {selectedLeader.name}
              </h2>
              <button
                onClick={() => {
                  setOpenModal(false);
                  setSelectedProjects([]);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="overflow-y-auto flex-1 pr-2">
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3">
                  Available Projects:
                </label>

                <div className="space-y-3">
                  {projects
                    .filter((p) => p.leader?._id !== selectedLeader._id)
                    .map((project) => (
                      <label
                        key={project._id}
                        className="flex items-start gap-4 border border-gray-200 rounded-xl p-4 cursor-pointer hover:bg-gray-50 transition has-[:checked]:border-[#235857] has-[:checked]:bg-[#f0f7f6]"
                      >
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4 accent-[#235857]"
                          checked={selectedProjects.includes(project._id)}
                          onChange={() => toggleProjectSelection(project._id)}
                        />
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-800">
                            {project.name}
                          </h3>
                          <p className="text-xs text-gray-500 mb-1">
                            {project.description || "No description"}
                          </p>
                          <div className="flex gap-2 flex-wrap">
                            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-medium">
                              Domain: {project.domain}
                            </span>
                            {project.leader && (
                              <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded font-medium">
                                Current Leader: {project.leader.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </label>
                    ))}

                  {projects.filter((p) => p.leader?._id !== selectedLeader._id)
                    .length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-8">
                      No available projects to assign
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={() => {
                  setOpenModal(false);
                  setSelectedProjects([]);
                }}
                className="px-6 py-2.5 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignDomain}
                disabled={selectedProjects.length === 0}
                className="px-6 py-2.5 bg-[#235857] text-white rounded-xl font-medium hover:bg-[#1a3d3d] transition disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
              >
                Assign{" "}
                {selectedProjects.length > 0 && `(${selectedProjects.length})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaders;