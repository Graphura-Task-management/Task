import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  Plus,
  BarChart2,
  Users,
  Calendar,
  Settings,
  LogOut,
  X
} from "lucide-react";

import Logo from "../../../public/image/logo.png";

const menu = [
  { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { name: "Projects", path: "/admin/projects", icon: FolderKanban },
  { name: "Create", path: "/admin/create", icon: Plus },
  // { name: "Billing & Reports", path: "/admin/reports", icon: BarChart2 },
  { name: "Leaders", path: "/admin/leaders", icon: Users },
  { name: "Calendar", path: "/admin/admincalender", icon: Calendar },
  { name: "Settings", path: "/admin/adminsetting", icon: Settings },
];

const AdminSidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login");
  };

  return (
    <aside
      className={`
        fixed top-0 left-0 z-40 h-screen w-64
        bg-[#EAF4F3] border-r border-[#D7E7E5]
        flex flex-col transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}
    >
      {/* Logo + Close (mobile) */}
      <div className="h-16 flex items-center px-6 border-b border-[#D7E7E5] shrink-0">
        <img
          src={Logo}
          alt="Logo"
          className="h-9 object-contain"
        />

        {/* Close button (mobile) */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute right-4 lg:hidden text-[#355E5A]"
        >
          <X size={22} />
        </button>
      </div>

      {/* Menu + Logout */}
     
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {menu.map((item, i) => (
            <NavLink
              key={i}
              to={item.path}
              end
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition
                ${
                  isActive
                    ? "bg-[#235857] text-white shadow-lg shadow-[#235857]/20 translate-x-1"
                    : "text-[#355E5A] hover:bg-[#DDF0ED] hover:translate-x-1"
                }`
              }
            >
              <item.icon size={18} />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-[#D7E7E5] shrink-0">
          <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full
            px-4 py-3 rounded-xl
            text-sm font-medium text-[#8B3A3A]
            hover:bg-red-50 transition"
        >
          <LogOut size={20} />
          Log Out
        </button>
        </div>
      
    </aside>
  );
};

export default AdminSidebar;
