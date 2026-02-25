import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// --- Layouts ---
import EmployeeLayout from "./pages/employee/EmployeeLayout";
import LeaderLayout from "./pages/leader/LeaderLayout";
import AdminLayout from "./pages/admin/AdminLayout";

// --- Public Pages ---
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Forgetpassword from "./pages/Forgetpassword";
import ResetPassword from "./pages/ResetPassword"; //  ADDED

// --- Protected Route Component ---
import ProtectedRoute from "./components/common/ProtectedRoute";

// --- Employee Pages ---
import Dashboard from "./pages/employee/Dashboard";
import Tasks from "./pages/employee/Tasks";
import TaskDetails from "./pages/employee/TaskDetails";
import Teams from "./pages/employee/Teams";
import Calendar from "./pages/employee/Calendar";
import Settings from "./pages/employee/Settings";

// --- Leader Pages ---
import LeaderDashboard from "./pages/leader/LeaderDashboard";
import TeamInfo from "./pages/leader/TeamInfo";
import LeaderProjects from "./pages/leader/LeaderProjects";
import LeaderTasks from "./pages/leader/LeaderTasks";
import LeaderCalendar from "./pages/leader/LeaderCalendar";
import LeaderSettings from "./pages/leader/LeaderSettings";

// --- Admin Pages ---
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProjects from "./pages/admin/AdminProjects";
import CreateAdmin from "./pages/admin/CreateAdmin";
import BilingReports from "./pages/admin/BilingReports";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminCalender from "./pages/admin/Calender";
import Leaders from "./pages/admin/Leaders";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />

        <Routes>
          {/* ================= PUBLIC ROUTES ================= */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<Forgetpassword />} />

          {/*  ADDED RESET PASSWORD ROUTE */}
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* ================= EMPLOYEE PANEL ================= */}
          <Route
            path="/employee"
            element={
              <ProtectedRoute roles={["employee"]}>
                <EmployeeLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="tasks/:taskId" element={<TaskDetails />} />
            <Route path="teams" element={<Teams />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* ================= LEADER PANEL ================= */}
          <Route
            path="/leader"
            element={
              <ProtectedRoute roles={["leader"]}>
                <LeaderLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<LeaderDashboard />} />
            <Route path="projects" element={<LeaderProjects />} />
            <Route path="tasks" element={<LeaderTasks />} />
            <Route path="teams" element={<TeamInfo />} />
            <Route path="calendar" element={<LeaderCalendar />} />
            <Route path="settings" element={<LeaderSettings />} />
          </Route>

          {/* ================= ADMIN PANEL ================= */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="create" element={<CreateAdmin />} />
            <Route path="reports" element={<BilingReports />} />
            <Route path="adminsetting" element={<AdminSettings />} />
            <Route path="leaders" element={<Leaders />} />
            <Route path="leaders/:id" element={<Leaders />} />
            <Route path="admincalender" element={<AdminCalender />} />
          </Route>

          {/* ================= UNAUTHORIZED PAGE ================= */}
          <Route
            path="/unauthorized"
            element={
              <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-800 mb-4">
                    403 - Unauthorized
                  </h1>
                  <p className="text-gray-600 mb-6">
                    You don't have permission to access this page.
                  </p>
                  <a
                    href="/login"
                    className="px-6 py-3 bg-[#235857] text-white rounded-lg hover:bg-[#1F6F68]"
                  >
                    Go to Login
                  </a>
                </div>
              </div>
            }
          />

          {/* ================= FALLBACK ROUTE ================= */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
