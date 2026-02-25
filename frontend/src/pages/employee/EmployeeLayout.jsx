import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../../components/employee/Sidebar";
import Topbar from "../../components/employee/Topbar";

export default function EmployeeLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main
        className="flex-1 min-h-screen bg-[#F6F9F9]
                       md:ml-64"
      >
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
