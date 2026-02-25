// =============================================
// pages/admin/AdminProjects.jsx - WITH API
// =============================================

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllProjects } from "../../api/projectApi";
import { toast } from "react-toastify";

export default function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await getAllProjects();
      setProjects(response.projects || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const isLate = (project) => {
    return project.status !== "completed" && new Date(project.deadline) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#235857] mx-auto"></div>
          <p className="mt-4 text-[#6b8f8b]">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700">
      {/* PAGE HEADING */}
      <div className="mb-12">
        <h1 className="text-3xl font-bold mb-2 text-[#0D2426]">
          Projects <span className="">Overview</span>
        </h1>
        <p className="text-[#6D8B8C] mb-5">
          {projects.length} projects in total
        </p>
      </div>

      {/* PROJECT GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
        {projects.map((project) => {
          // You can calculate progress based on tasks if needed
          const progress = project.progress || 0;

          return (
            <div
              key={project._id}
              className="bg-white rounded-3xl p-7
              border border-[#d7ebe9]
              shadow-[0_25px_45px_-20px_rgba(35,88,87,0.3)]
              hover:-translate-y-1 hover:shadow-[0_35px_55px_-20px_rgba(35,88,87,0.4)]
              transition-all duration-300 cursor-pointer"
              // onClick={() => navigate(`/admin/projects/${project._id}`)}
            >
              {/* HEADER */}
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-extrabold text-[#235857] leading-tight">
                  {project.name || "Untitled Project"}
                </h3>

                <span
                  className={`px-4 py-1 rounded-full text-[11px] font-bold uppercase ${
                    project.status === "completed"
                      ? "bg-[#dff1ef] text-[#235857]"
                      : project.status === "active"
                      ? "bg-[#fef3c7] text-[#92400e]"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {project.status || "Pending"}
                </span>
              </div>

              {/* DESCRIPTION */}
              <p className="text-sm text-[#6b8f8b] leading-relaxed mb-6 line-clamp-2">
                {project.description || "Project execution and delivery pipeline."}
              </p>

              

              {/* META INFO */}
              <div className="space-y-3 text-sm border-t border-[#d7ebe9] pt-5">
                <div className="flex justify-between">
                  <span className="text-[#6b8f8b]">Domain</span>
                  <span className="font-semibold text-[#235857]">
                    {project.domain || "-"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-[#6b8f8b]">Lead</span>
                  <span className="font-semibold text-[#235857]">
                    {project.leader?.name || "-"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-[#6b8f8b]">Deadline</span>
                  <span
                    className={`font-bold ${
                      isLate(project) ? "text-rose-500" : "text-[#235857]"
                    }`}
                  >
                    {project.deadline 
                      ? new Date(project.deadline).toLocaleDateString()
                      : "-"
                    }
                  </span>
                </div>

                <div className="flex justify-between text-xs italic text-[#6b8f8b]">
                  <span>Created</span>
                  <span>
                    {project.createdAt 
                      ? new Date(project.createdAt).toLocaleDateString()
                      : "-"
                    }
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* EMPTY STATE */}
      {projects.length === 0 && (
        <div className="text-center py-28 bg-white rounded-3xl border border-dashed border-[#d7ebe9] mt-20">
          <p className="text-[#235857] font-extrabold text-xl">
            No projects yet
          </p>
          <p className="text-[#6b8f8b] mt-2">
            Create projects from the admin panel to see them here.
          </p>
          <button
            onClick={() => navigate("/admin/create")}
            className="mt-6 px-6 py-3 bg-[#235857] text-white rounded-xl font-semibold hover:bg-[#1c4a48] transition"
          >
            Create First Project
          </button>
        </div>
      )}
    </div>
  );
}