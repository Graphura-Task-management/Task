import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  CalendarDays,
  Settings,
  LogOut,
  X,
} from "lucide-react";

import logo from "/image/logo.png";

const menu = [
  { name: "Dashboard", path: "/employee", icon: LayoutDashboard },
  { name: "Tasks", path: "/employee/tasks", icon: CheckSquare },
  { name: "Teams", path: "/employee/teams", icon: Users },
  { name: "Calendar", path: "/employee/calendar", icon: CalendarDays },
  { name: "Settings", path: "/employee/settings", icon: Settings },
];

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* MOBILE OVERLAY */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen w-64
          bg-white border-r border-[#E4EFEE]
          flex flex-col
          transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* HEADER */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#EEF3F2]">
          <img src={logo} alt="Graphura" className="h-8 object-contain" />

          <button
            onClick={onClose}
            className="md:hidden p-2 rounded-lg hover:bg-[#F4F8F8]"
          >
            <X size={18} />
          </button>
        </div>

        {/* MENU */}
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
          {menu.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === "/employee"}
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                  
                  ${
                    isActive
                      ? "bg-[#235857] text-white shadow-sm"
                      : "text-[#355E5A] hover:bg-[#F4F8F8]"
                  }`
                }
              >
                <Icon
                  size={18}
                  className="transition-transform group-hover:scale-110"
                />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* LOGOUT */}
        <div className="px-4 py-4 border-t border-[#EEF3F2]">
          <button
            onClick={handleLogout}
            className="
              flex items-center gap-3 w-full px-4 py-3 rounded-xl
              text-sm font-medium
              text-[#7A2E2E]
              hover:bg-red-50
              transition
            "
          >
            <LogOut size={18} />
            Log Out
          </button>
        </div>
      </aside>
    </>
  );
}
