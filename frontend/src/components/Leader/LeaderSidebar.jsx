import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Briefcase, CheckSquare, Users, CalendarDays, Settings, LogOut, X } from "lucide-react";
import logo from "/image/logo.png";

const menuItems = [
  { name: "Dashboard", path: "/leader", icon: LayoutDashboard, end: true },
  { name: "Projects", path: "/leader/projects", icon: Briefcase, end: false },
  { name: "Tasks", path: "/leader/tasks", icon: CheckSquare, end: false },
  { name: "Teams", path: "/leader/teams", icon: Users, end: false },
  { name: "Calendar", path: "/leader/calendar", icon: CalendarDays, end: false },
  { name: "Settings", path: "/leader/settings", icon: Settings, end: false },
];

export default function LeaderSidebar({ isOpen, closeMobileMenu }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* MOBILE OVERLAY */}
      <div 
        className={`fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={closeMobileMenu}
      />

      <aside 
        className={`fixed left-0 top-0 z-[70] w-64 h-full bg-[#EAF4F3] border-r border-[#D7E7E5] flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 shadow-xl md:shadow-none`}
      >
        {/* LOGO SECTION */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#D7E7E5] shrink-0">
          <img src={logo} alt="Graphura" className="h-8 object-contain" />
          <button onClick={closeMobileMenu} className="md:hidden p-2 text-[#355E5A] hover:bg-[#DDF0ED] rounded-lg">
            <X size={20}/>
          </button>
        </div>

        {/* NAV LINKS SECTION */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.end}
              onClick={closeMobileMenu}
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                ${isActive ? "bg-[#1F6F68] text-white shadow-md" : "text-[#355E5A] hover:bg-[#DDF0ED]"}`
              }
            >
              <item.icon size={18} /> <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* ORIGINAL LOGOUT BUTTON SECTION */}
        <div className="p-4 border-t border-[#D7E7E5] shrink-0 bg-[#EAF4F3]">
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors group"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" /> 
            <span>Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}