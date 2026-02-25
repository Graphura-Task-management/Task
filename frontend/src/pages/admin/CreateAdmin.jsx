import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  createProject,
  getAllProjects,
  deleteProject,
  updateProject,
} from "../../api/projectApi";
import { getAllLeaders } from "../../api/userApi";

export default function CreateAdmin() {
  const [projects, setProjects] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [editingProject, setEditingProject] = useState(null);

  const [filteredLeaders, setFilteredLeaders] = useState([]);


  const [formData, setFormData] = useState({
    name: "",
    description: "",
    leader: "",
    domain: "",
    deadline: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const projectsResponse = await getAllProjects();
      setProjects(projectsResponse.projects || []);

      const leadersResponse = await getAllLeaders();
      setLeaders(leadersResponse.leaders || []);
    } catch {
      toast.error("Failed to load data");
    }
  };

 useEffect(() => {
  if (!formData.domain) {
    setFilteredLeaders([]);
    return;
  }

  const filtered = leaders.filter(
    (leader) => leader.domain === formData.domain
  );

  setFilteredLeaders(filtered);

}, [formData.domain, leaders]); //  leaders wapas add karo

  /* ================= CREATE ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

  if (
  !formData.name ||
  !formData.description ||   // YE LINE ADD KARO
  !formData.leader ||
  !formData.domain ||
  !formData.deadline
) {
  toast.error("Fill required fields");
  return;
}

    try {
      await createProject(formData);

      toast.success("Project created");

      setFormData({
        name: "",
        description: "",
        leader: "",
        domain: "",
        deadline: "",
      });

      fetchData();
    } catch {
      toast.error("Failed to create project");
    }
  };

  /* ================= DELETE ================= */

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project?")) return;

    try {
      await deleteProject(id);
      toast.success("Project deleted");
      fetchData();
    } catch {
      toast.error("Delete failed");
    }
  };

  /* ================= EDIT ================= */

  const openEdit = (project) => {
    setEditingProject({
      ...project,
      leader: project.leader?._id || "",
      deadline: project.deadline?.split("T")[0],
    });
  };

  const handleUpdate = async () => {
    try {
      await updateProject(editingProject._id, editingProject);

      toast.success("Project updated");
      setEditingProject(null);
      fetchData();
    } catch {
      toast.error("Update failed");
    }
  };

  return (
    <div className="animate-in fade-in duration-500 w-full max-w-full overflow-x-hidden">
      {/* HEADER */}
      <div className="mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0D2426]">
          Create Projects & Leaders
        </h1>
        <p className="text-[#6D8B8C]">
          Add and manage projects for your organization
        </p>
      </div>

      {/* CARD */}
      <div className="bg-white rounded-3xl border border-[#d7ebe9] p-5 sm:p-8 shadow-sm w-full">
        {/* CREATE */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold text-[#235857] mb-6">
            Create Project
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            <input
              placeholder="Project Name"
              className="input"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />

            <input
              placeholder="Description"
              className="input"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />

            <select
              className="input"
              value={formData.domain}
              onChange={(e) =>
                setFormData({ ...formData, domain: e.target.value })
              }
            >
              <option value="">Select Domain</option>

              <option value="Sales & Marketing">Sales & Marketing</option>
              <option value="Data & AI Intelligence">
                Data & AI Intelligence
              </option>
              <option value="Human Resources">Human Resources</option>
              <option value="Social Media Management">
                Social Media Management
              </option>
              <option value="Graphic Design">Graphic Design</option>
              <option value="Digital Marketing">Digital Marketing</option>
              <option value="Video Editing">Video Editing</option>
              <option value="Full Stack Development">
                Full Stack Development
              </option>


              <option value="MERN Stack Development">
                MERN Stack Development
              </option>
              <option value="Email and Outreaching">
                Email and Outreaching
              </option>
              <option value="Content Writing">Content Writing</option>
              <option value="Content Creator">Content Creator</option>
              <option value="UI/UX Designing">UI/UX Designing</option>
              <option value="Front-end Developer">Front-end Developer</option>
              <option value="Back-end Developer">Back-end Developer</option>
            </select>
  {/*  CHANGED: leaders ki jagah filteredLeaders use kiya */}
      <select
        className="input"
        value={formData.leader}
        disabled={!formData.domain} //  ADDED: Domain select nahi to disable
        onChange={(e) =>
          setFormData({ ...formData, leader: e.target.value })
        }
      >
        <option value="">Leader</option>

        {/*  CHANGED */}
        {filteredLeaders.map((l) => (
          <option key={l._id} value={l._id}>
            {l.name}
          </option>
        ))}
      </select>
            <input
              type="date"
              className="input"
              value={formData.deadline}
              onChange={(e) =>
                setFormData({ ...formData, deadline: e.target.value })
              }
            />

            <button
              onClick={handleSubmit}
              className="bg-[#235857] text-white rounded-xl font-semibold shadow-md hover:bg-[#1c4a48] transition h-[46px] w-full lg:w-auto"
            >
              Create
            </button>
          </div>
        </div>

        {/* ================= TABLE ================= */}

        <div>
          <h2 className="text-lg font-semibold text-[#235857] mb-6">
            Projects ({projects.length})
          </h2>

          <div className="w-full overflow-x-auto rounded-2xl border border-[#d7ebe9]">
            <table className="min-w-[700px] w-full border-collapse">
              {/* HEADER */}
              <thead className="bg-[#eef7f6]">
                <tr className="text-left">
                  <th className="px-6 py-4 text-xs font-bold tracking-wider text-[#235857]">
                    NAME
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-[#235857]">
                    DOMAIN
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-[#235857]">
                    LEADER
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-[#235857]">
                    DEADLINE
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-[#235857]">
                    STATUS
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-[#235857]">
                    ACTIONS
                  </th>
                </tr>
              </thead>

              {/* BODY */}
              <tbody className="divide-y divide-[#e6f1ef]">
                {projects.map((p) => (
                  <tr key={p._id} className="hover:bg-[#f6fbfa] transition">
                    <td className="px-6 py-5 font-semibold text-[#18413d]">
                      {p.name}
                    </td>

                    <td className="px-6 py-5 text-[#5f8a86]">{p.domain}</td>

                    <td className="px-6 py-5 text-[#5f8a86]">
                      {p.leader?.name || "—"}
                    </td>

                    <td className="px-6 py-5 font-medium text-rose-500">
                      {new Date(p.deadline).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-5">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                        {p.status}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-6 py-5">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => openEdit(p)}
                          className="px-4 py-1.5 rounded-lg text-xs font-semibold
                          bg-[#eaf4f3] text-[#235857]
                          hover:bg-[#dff1ef] transition"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(p._id)}
                          className="px-4 py-1.5 rounded-lg text-xs font-semibold
                          bg-red-50 text-red-600
                          hover:bg-red-100 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ================= EDIT MODAL ================= */}

      {editingProject && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 sm:p-8 rounded-2xl w-[90%] max-w-[500px] shadow-2xl">
            <h2 className="text-xl font-bold mb-6">Edit Project</h2>

            <div className="space-y-4">
              <input
                className="input w-full"
                value={editingProject.name}
                onChange={(e) =>
                  setEditingProject({
                    ...editingProject,
                    name: e.target.value,
                  })
                }
              />

              <input
                className="input w-full"
                value={editingProject.description}
                onChange={(e) =>
                  setEditingProject({
                    ...editingProject,
                    description: e.target.value,
                  })
                }
              />

              <select
                className="input w-full"
                value={editingProject.leader}
                onChange={(e) =>
                  setEditingProject({
                    ...editingProject,
                    leader: e.target.value,
                  })
                }
              >
                {leaders.map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.name}
                  </option>
                ))}
              </select>

              <input
                type="date"
                className="input w-full"
                value={editingProject.deadline}
                onChange={(e) =>
                  setEditingProject({
                    ...editingProject,
                    deadline: e.target.value,
                  })
                }
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditingProject(null)}
                className="px-4 py-2 rounded-lg bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={handleUpdate}
                className="px-4 py-2 rounded-lg bg-[#235857] text-white"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INPUT STYLE */}
      <style>{`
        .input {
          padding: 12px;
          border-radius: 12px;
          border: 1px solid #d7ebe9;
          background: #eaf4f3;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}
