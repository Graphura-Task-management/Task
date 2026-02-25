import React, { useState, useEffect } from "react";
import {
  FileText,
  BarChart3,
  DollarSign,
  Download,
  Filter,
  Users,
} from "lucide-react";

import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Pie, Bar, Line } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
);

const BillingReports = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");

  // Load projects dynamically from localStorage
  useEffect(() => {
    const savedProjects = JSON.parse(localStorage.getItem("projects") || "[]");
    setProjects(savedProjects);
  }, []);

  /* ===== Chart Data (static for demo) ===== */
  const taskCompletionData = {
    labels: ["Completed", "In Progress", "Pending"],
    datasets: [
      {
        data: [4, 4, 2],
        backgroundColor: ["#235857", "#22bfba", "#ef4444"],
      },
    ],
  };

  const projectProgressData = {
    labels: projects
      .filter((p) => !selectedProject || p.projectName === selectedProject)
      .map((p) => p.projectName || "Unknown"),
    datasets: [
      {
        label: "Progress %",
        data: projects
          .filter((p) => !selectedProject || p.projectName === selectedProject)
          .map((p) => p.progress || 0),
        backgroundColor: "#235857",
      },
    ],
  };

  const monthlyTaskData = {
    labels: ["Jan"],
    datasets: [
      {
        label: "Tasks Completed",
        data: [4],
        borderColor: "#22bfba",
        backgroundColor: "#235857",
      },
    ],
  };

  const performanceDistributionData = {
    labels: ["Excellent", "Good", "Average", "Needs Improvement"],
    datasets: [
      {
        data: [0, 0, 7, 0],
        backgroundColor: ["#248E80", "#235857", "#22bfba", "#ef4444"],
      },
    ],
  };

  return (
    <div className="space-y-10 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2 text-[#0D2426]">
          Billing & Reporting
        </h1>
        <p className="text-[#6D8B8C] mb-8">
          Track project costs, generate reports, and analyze leader performance.
        </p>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <InfoCard
          icon={<FileText />}
          title="Employee Monthly Report"
          desc="Download detailed monthly task reports for any employee."
          button="Download Report"
        />
        <InfoCard
          icon={<BarChart3 />}
          title="Project Completion Summary"
          desc="Generate comprehensive project completion reports with timelines, budgets, and leader performance analysis."
          button="Download Summary"
        />
        <InfoCard
          icon={<DollarSign />}
          title="Financial Overview"
          desc="View project costs, billing information, and financial analytics across all projects and leaders."
          button="View Financial"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-6 border border-[#d7ebe9] ">
        <h2 className="text-sm font-bold text-[#235857] mb-4 uppercase tracking-wider flex items-center gap-2">
          <Filter size={20} /> Report Filters
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Employee */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">
              EMPLOYEE
            </label>
            <select
              className="input"
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
            >
              <option value="">All Employees</option>
              <option value="Sarah Johnson">Sarah Johnson</option>
              <option value="Alex Morgan">Alex Morgan</option>
            </select>
          </div>

          {/* Project */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">
              PROJECT
            </label>
            <select
              className="input"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
            >
              <option value="">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.projectName}>
                  {p.projectName}
                </option>
              ))}
            </select>
          </div>

          {/* Date From */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">
              DATE FROM
            </label>
            <input type="date" className="input" />
          </div>

          {/* Date To */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">
              DATE TO
            </label>
            <input type="date" className="input" />
          </div>

          {/* Apply Filter Button */}
          <div className="flex items-end">
            <button className="bg-[#235857] text-white rounded-lg px-4 py-2 w-full mb-1">
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="bg-white rounded-xl shadow p-6 border border-[#d7ebe9]">
        <h2 className="flex text-lg font-semibold text-[#235857] mb-6 items-center gap-2">
          <BarChart3 size={22} /> Leader Performance Analytics
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ChartCard title="Task Completion Rate">
            <Pie
              data={taskCompletionData}
              options={{ ...commonOptions, cutout: "65%" }}
            />
          </ChartCard>

          <ChartCard title="Project Progress">
            <Bar
              data={projectProgressData}
              options={{
                ...commonOptions,
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                  },
                },
              }}
            />
          </ChartCard>

          <ChartCard title="Monthly Task Trends">
            <Line
              data={monthlyTaskData}
              options={{
                ...commonOptions,
                scales: {
                  y: { beginAtZero: true },
                },
              }}
            />
          </ChartCard>

          <ChartCard title="Leader Performance Distribution">
            <Pie
              data={performanceDistributionData}
              options={{ ...commonOptions, cutout: "60%" }}
            />
          </ChartCard>
        </div>
      </div>

      {/* Leader Performance Table */}
      <div className="bg-white rounded-xl shadow p-4 md:p-6 border border-[#d7ebe9]">
        <h2 className="text-sm font-bold text-[#235857] mb-4 uppercase tracking-wider flex items-center gap-2">
          <Users size={22} /> Leader Performance Summary
        </h2>

        {/* 1. Wrap the table in an overflow-x-auto container */}
        <div className="overflow-x-auto border-t w-56 sm:w-full">
          {/* 2. Set a min-width to ensure the table is wider than the screen on mobile */}
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-[#eaf4f3]">
              <tr>
                {[
                  "Leader",
                  "Total Tasks",
                  "Completed",
                  "In Progress",
                  "Completion Rate",
                  "Avg. Time",
                  "Performance",
                ].map((h) => (
                  <th
                    key={h}
                    className="p-3 text-[#235857] font-bold text-xs md:text-sm"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-t hover:bg-gray-50 transition-colors">
                <td className="p-3 font-medium text-sm">Sarah Johnson</td>
                <td className="p-3 text-sm">10</td>
                <td className="p-3 text-sm">4</td>
                <td className="p-3 text-sm">4</td>
                <td className="p-3 text-sm">40%</td>
                <td className="p-3 text-sm">12h</td>
                <td className="p-3">
                  <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-semibold uppercase">
                    Average
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
          <button className="flex items-center justify-center p-3 gap-2 bg-[#235857] hover:bg-[#1a4241] text-white rounded-xl font-semibold text-sm transition-colors w-full sm:w-auto">
            <Download size={16} /> Export CSV
          </button>
          <button className="flex items-center justify-center p-3 gap-2 bg-[#235857] hover:bg-[#1a4241] text-white rounded-xl font-semibold text-sm transition-colors w-full sm:w-auto">
            <Download size={16} /> Export PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default BillingReports;

/* ===== Reusable Components ===== */
const InfoCard = ({ icon, title, desc, button }) => (
  <div className="bg-white p-7 rounded-3xl border border-[#d7ebe9] hover:translate-y-[-4px] transition">
    <div className="w-12 h-12 bg-[#eaf4f3] text-[#235857] rounded-xl flex items-center justify-center mb-5">
      {icon}
    </div>
    <h3 className="text-xl font-semibold mb-2 text-[#235857]">
      {title}
    </h3>
    <p className="text-sm mt-3 text-[#0D0D0D]/80 mb-2">{desc}</p>
    <button className="flex items-center gap-2 justify-center bg-[#235857] text-white rounded-lg px-4 py-2 w-full">
      {button}
    </button>
  </div>
);

const ChartCard = ({ title, children }) => (
  <div className="border rounded-xl p-4">
    <h4 className="font-semibold mb-4">{title}</h4>
    <div className="h-[260px] flex items-center justify-center">
      <div className="w-full h-full">{children}</div>
    </div>
  </div>
);

const commonOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
      align: "center",
      labels: { boxWidth: 16, padding: 15 },
    },
  },
};
