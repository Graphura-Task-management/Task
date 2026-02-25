import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accessKey, setAccessKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showAccessKey, setShowAccessKey] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setLoading(true);

    try {
      const result = await login({
        email,
        password,
        accessKey: accessKey || undefined,
      });

      if (result.success) {
        toast.success(`Welcome back, ${result.user.name}!`);

        switch (result.user.role) {
          case "admin":
            navigate("/admin");
            break;
          case "leader":
            navigate("/leader");
            break;
          case "employee":
            navigate("/employee");
            break;
          default:
            navigate("/");
        }
      } else {
        toast.error(result.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EEF2EF] px-4 sm:px-6">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-[0_32px_80px_rgba(13,36,38,0.18)] overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* LEFT PANEL */}
          <div className="hidden lg:flex bg-gradient-to-br from-[#1F5E5A] to-[#235857] px-10 xl:px-14 py-12 xl:py-14 flex-col justify-between">
            <div>
              <p className="text-xs tracking-widest text-white/60 uppercase">
                Task Management System
              </p>
              <h2 className="mt-6 text-2xl font-semibold text-white">
                Secure workspace access
              </h2>
              <p className="mt-3 text-sm text-white/75 max-w-sm leading-relaxed">
                Access your organization workspace to manage assigned tasks,
                deadlines, and execution flow based on your role.
              </p>
            </div>

            <div className="relative flex justify-center items-center py-10">
              <div className="absolute w-[420px] h-[260px] rounded-3xl bg-gradient-to-br from-[#3B8A7F]/40 to-[#235857]/40 blur-3xl opacity-70" />
              <div className="relative rounded-2xl p-3 bg-white/10 backdrop-blur-md shadow-[0_30px_80px_rgba(0,0,0,0.35)] transition-transform duration-300 hover:-translate-y-1">
                <img
                  src="/image/login.png"
                  alt="Task planning overview"
                  className="w-[300px] xl:w-[320px] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.45)]"
                />
              </div>
            </div>

            <ul className="space-y-3 text-sm text-white/85">
              <li>✓ Role-based access control</li>
              <li>✓ Controlled task visibility</li>
              <li>✓ Deadline-driven execution</li>
              <li>✓ Organization-managed access</li>
            </ul>
          </div>

          {/* RIGHT PANEL */}
          <div className="px-6 sm:px-10 lg:px-14 py-10 sm:py-14 flex flex-col justify-center bg-[#FBFCFB]">
            <div className="max-w-md w-full mx-auto">
              <h1 className="text-xl sm:text-2xl font-semibold text-[#0D2426]">
                Sign in
              </h1>
              <p className="mt-2 text-sm text-[#6D8B8C]">
                Use your organization credentials to continue
              </p>

              <div className="mt-8 space-y-5">
                <Field label="Email address">
                  <Input
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </Field>

                <Field label="Password">
                  <PasswordInput
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    show={showPassword}
                    onToggle={() => setShowPassword((v) => !v)}
                    disabled={loading}
                  />
                </Field>

                <Field label="Access key">
                  <PasswordInput
                    value={accessKey}
                    onChange={(e) => setAccessKey(e.target.value)}
                    show={showAccessKey}
                    onToggle={() => setShowAccessKey((v) => !v)}
                    placeholder="Provided by your organization"
                    disabled={loading}
                  />
                </Field>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full mt-4 py-3 rounded-xl bg-[#235857] text-white text-sm font-medium hover:bg-[#1F6F68] focus:ring-4 focus:ring-[#235857]/30 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {loading ? "Signing in..." : "Continue"}
                </button>

                {/* MOVED HERE */}
                <div className="text-center">
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-[#235857] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <div className="mt-8 text-center">
                <p className="text-xs text-[#6D8B8C]">
                  New to Graphura?
                  <Link
                    to="/signup"
                    className="ml-1 text-[#235857] font-medium hover:underline"
                  >
                    Create workspace
                  </Link>
                </p>
                <p className="mt-3 text-[11px] text-[#9AAFB0]">
                  Access is managed by your organization administrator
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#4F6F73] mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({ placeholder, value, onChange, disabled }) {
  return (
    <input
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="w-full px-4 py-3 rounded-xl border border-[#D3D9D4] text-sm focus:border-[#3B8A7F] focus:ring-4 focus:ring-[#3B8A7F]/20 disabled:opacity-50 disabled:cursor-not-allowed outline-none transition"
    />
  );
}

function PasswordInput({
  value,
  onChange,
  show,
  onToggle,
  placeholder,
  disabled,
}) {
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        placeholder={placeholder || "Enter value"}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full px-4 py-3 pr-12 rounded-xl border border-[#D3D9D4] text-sm focus:border-[#3B8A7F] focus:ring-4 focus:ring-[#3B8A7F]/20 disabled:opacity-50 disabled:cursor-not-allowed outline-none transition"
      />
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6D8B8C] hover:text-[#235857] disabled:opacity-50"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
