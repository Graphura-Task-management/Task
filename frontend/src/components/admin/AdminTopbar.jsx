import { Menu } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

const pageTitles = {
  "/admin": {
    title: "Admin Dashboard",
    subtitle: "Overview of system activity",
  },
  "/admin/projects": {
    title: "Projects",
    subtitle: "Manage all ongoing projects",
  },
  "/admin/leaders": {
    title: "Leaders",
    subtitle: "Team leaders overview",
  },
  "/admin/reports": {
    title: "Reports",
    subtitle: "Insights & analytics",
  },
  "/admin/admincalender": {
    title: "Calendar",
    subtitle: "Schedule & deadlines",
  },
  "/admin/adminsetting": {
    title: "Settings",
    subtitle: "Manage account & preferences",
  },
};

const AdminTopbar = ({ setSidebarOpen }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [profileImage, setProfileImage] = useState(null);
  const [name, setName] = useState("");

  const page = pageTitles[pathname] || {
    title: "Admin Panel",
    subtitle: "Welcome back, Admin",
  };

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }

    const img = localStorage.getItem("adminProfileImage");
    if (img) setProfileImage(img);
  }, [user]);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#D7E7E5]">
      <div className="h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* LEFT */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-green-50"
          >
            <Menu size={22} className="text-[#235857]" />
          </button>

          <div>
            <p className="text-sm font-semibold text-[#0D2426]">{page.title}</p>
            <p className="text-xs text-gray-500">{page.subtitle}</p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* PROFILE -> DIRECT SETTINGS REDIRECT */}
          <div
            onClick={() => navigate("/admin/adminsetting")}
            className="flex items-center gap-3 pl-3 border-l border-green-200 cursor-pointer hover:bg-green-50 rounded-xl pr-2 py-1 transition"
          >
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-800">{name}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>

            <div className="w-9 h-9 rounded-full bg-[#235857] overflow-hidden flex items-center justify-center text-white text-xs font-black">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Admin"
                  className="w-full h-full object-cover"
                />
              ) : (
                name?.charAt(0) || "A"
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminTopbar;
