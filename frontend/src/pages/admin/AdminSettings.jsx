import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { updateUser } from "../../api/userApi";
import { User, Bell, Camera, Settings, ShieldAlert } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

const AdminSettings = () => {
  const { user } = useAuth();

  const [profileImage, setProfileImage] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [systemDomain, setSystemDomain] = useState("");

  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    reminder: true,
  });

  useEffect(() => {
    if (user) {
      setFullName(user.name || "");
      setEmail(user.email || "");
      setSystemDomain(user.domain || "");
    }
  }, [user]);

  useEffect(() => {
    const savedImage = localStorage.getItem("adminProfileImage");
    if (savedImage) setProfileImage(savedImage);
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(reader.result);
      localStorage.setItem("adminProfileImage", reader.result);
      toast.success("Profile picture updated!");
    };
    reader.readAsDataURL(file);
  };

  const toggleNotification = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const saveProfile = async () => {
    if (!fullName.trim()) {
      toast.error("Please enter your full name");
      return;
    }

    try {
      await updateUser({ name: fullName });
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const saveNotifications = () => {
    localStorage.setItem("notifications", JSON.stringify(notifications));
    toast.success("Notification preferences saved");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <Settings size={24} className="text-[#1f6f68]" />
        <div>
          <h2 className="text-2xl font-bold text-[#0D2426]">Settings</h2>
          <p className="text-[#6D8B8C] mt-1 text-sm">
            Manage account and system preferences
          </p>
        </div>
      </div>

      {/* ACCOUNT INFORMATION */}
      <section className="bg-white rounded-3xl border-l-4 border-[#1F6F68] shadow-sm overflow-hidden">
        <div className="p-5 flex items-center gap-2">
          <User size={18} className="text-[#235857]" />
          <h3 className="text-[#1F6F68]">Account Information</h3>
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-[#235857] overflow-hidden flex items-center justify-center text-white text-3xl font-black border-4 border-white shadow-md">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase() || "AU"
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-2 bg-[#235857] text-white rounded-full cursor-pointer hover:scale-110 transition shadow-lg border-2 border-white">
                <Camera size={16} />
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            </div>
            <p className="mt-2 text-xs text-[#6D8B8C] tracking-tighter">
              Click camera icon to change profile picture
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="text-xs text-[#6D8B8C] ml-1">Full Name</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="mt-1 w-full rounded-xl border px-4 py-2 text-sm bg-gray-50 focus:bg-white focus:border-[#235857] focus:ring-2 focus:ring-[#235857]/20 outline-none transition"
              />
            </div>

            <div>
              <label className="text-xs text-[#6D8B8C] ml-1">Email Address</label>
              <input
                value={email}
                disabled
                className="mt-1 w-full rounded-xl border px-4 py-2 text-sm bg-gray-100 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-[#6D8B8C]">Email cannot be changed</p>
            </div>

            <div>
              <label className="text-xs text-[#6D8B8C] ml-1">System Domain</label>
              <input
                value={systemDomain || "Not Assigned"}
                disabled
                className="mt-1 w-full rounded-xl border px-4 py-2 text-sm bg-gray-100 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-[#6D8B8C]">Domain cannot be changed</p>
            </div>
          </div>

          <button
            onClick={saveProfile}
            className="mt-5 px-5 py-2 rounded-xl bg-[#1F6F68] text-white text-sm font-medium hover:bg-[#235857] transition"
          >
            Update Profile
          </button>
        </div>
      </section>

      {/* NOTIFICATIONS */}
      <section className="bg-white rounded-3xl border-l-4 border-[#1F6F68] shadow-sm overflow-hidden">
        <div className="p-5 flex items-center gap-2">
          <Bell size={18} className="text-[#1F6F68]" />
          <h3 className="text-[#1F6F68]">Notifications</h3>
        </div>

        <div className="p-6 space-y-4">
          {[
            { key: "email", label: "Email Notifications", desc: "Receive updates via email" },
            { key: "push", label: "Push Notifications", desc: "Browser push notifications" },
            { key: "reminder", label: "Task Reminders", desc: "Get reminders for upcoming deadlines" },
          ].map(({ key, label, desc }) => (
            <div
              key={key}
              className="flex items-center justify-between p-4 rounded-2xl bg-[#F4F8F8] border-2 border-transparent hover:border-[#235857]/20 transition"
            >
              <div>
                <p className="text-sm font-medium text-[#0D2426]">{label}</p>
                <p className="text-xs text-[#6D8B8C] mt-1">{desc}</p>
              </div>
              <div
                onClick={() => toggleNotification(key)}
                className={`w-14 h-7 rounded-full cursor-pointer flex items-center px-1 transition duration-300 ${
                  notifications[key] ? "bg-[#235857]" : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${
                    notifications[key] ? "translate-x-7" : ""
                  }`}
                />
              </div>
            </div>
          ))}

          <button
            onClick={saveNotifications}
            className="mt-5 px-5 py-2 rounded-xl bg-[#1F6F68] text-white text-sm font-medium hover:bg-[#235857] transition"
          >
            Save Preferences
          </button>
        </div>
      </section>

      {/* SECURITY */}
      <section className="bg-white rounded-3xl border-l-4 border-[#1F6F68] shadow-sm overflow-hidden mb-8">
        <div className="p-5 flex items-center gap-2">
          <ShieldAlert size={18} className="text-[#1F6F68]" />
          <h3 className="text-[#1F6F68]">Security</h3>
        </div>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-2xl bg-[#F4F8F8] border-2 border-transparent hover:border-[#235857]/20 transition gap-4">
            <div>
              <p className="text-sm font-medium text-[#0D2426]">Password Management</p>
              <p className="text-xs text-[#6D8B8C] mt-1">
                Need to change your password? You will be redirected to the secure reset page.
              </p>
            </div>
            <Link
              to="/forgot-password"
              className="px-6 py-2.5 rounded-xl bg-white border border-[#D3D9D4] text-[#235857] text-xs font-semibold hover:bg-[#EEF4F3] hover:border-[#235857] transition shadow-sm"
            >
              Reset Password
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminSettings;