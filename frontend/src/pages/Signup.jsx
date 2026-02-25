import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../api/authApi";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";

export default function Signup() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showAccessKey, setShowAccessKey] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    domain: "",
    accessKey: "",
    reportingTo: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.role) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.role === 'admin' && !formData.accessKey) {
      toast.error("Access key is required for admin role");
      return;
    }

    if (formData.role === 'leader' && (!formData.accessKey || !formData.domain)) {
      toast.error("Access key and domain are required for leader role");
      return;
    }

    if (formData.role === 'employee' && !formData.domain) {
      toast.error("Domain is required for employee role");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        domain: formData.domain || undefined,
        accessKey: formData.accessKey || undefined,
        reportingTo: formData.reportingTo || undefined
      };

      const response = await authService.register(payload);

      if (response.success) {
        toast.success("Account created successfully! Please login.");
        navigate('/login');
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EEF2EF] flex items-center justify-center px-4 sm:px-6">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-[0_40px_120px_rgba(13,36,38,0.22)] overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* LEFT */}
          <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-[#1E4F4C] via-[#235857] to-[#3B8A7F] px-12 py-14 text-white">
            <div className="text-xs tracking-widest text-white/60 uppercase">
              Task Management System
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="group relative my-8 rounded-3xl bg-white/10 backdrop-blur-xl p-4 shadow-[0_30px_70px_rgba(0,0,0,0.35)] transition-transform duration-500 hover:scale-[1.04]">
                <img
                  src="/image/signup.png"
                  alt="Workspace setup"
                  className="rounded-2xl max-w-[280px] xl:max-w-[320px] transition-transform duration-500 group-hover:rotate-1"
                />
              </div>

              <div className="max-w-md mx-auto">
                <h2 className="text-2xl xl:text-[26px] font-semibold leading-snug">
                  Create your organization workspace
                </h2>
                <p className="mt-3 text-sm text-white/75 leading-relaxed">
                  Structured access and role-based execution, designed for
                  professional teams.
                </p>
              </div>
            </div>

            <div />
          </div>

          {/* RIGHT */}
          <div className="bg-[#FBFCFB] flex items-center">
            <div className="w-full max-w-md mx-auto px-6 sm:px-10 lg:px-12 py-10 sm:py-12">
              <div className="mb-7">
                <h1 className="text-2xl sm:text-[28px] font-semibold text-[#0D2426]">
                  Create your account
                </h1>
                <p className="mt-1 text-sm text-[#6D8B8C]">
                  Set up access to your organization workspace
                </p>
              </div>

              <div className="space-y-4">
                <Field label="Full name">
                  <Input
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </Field>

                <Field label="Email address">
                  <Input
                    name="email"
                    type="email"
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </Field>

                <Field label="Password">
                  <div className="relative">
                    <Input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={loading}
                      className="pr-12"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6D8B8C] hover:text-[#235857]"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Role">
                    <Select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      disabled={loading}
                    >
                      <option value="">Select role</option>
                      <option value="employee">Employee</option>
                      <option value="leader">Team Leader</option>
                      <option value="admin">Admin</option>
                    </Select>
                  </Field>

                  <Field label="Domain">
                    <Select
                      name="domain"
                      value={formData.domain}
                      onChange={handleChange}
                      disabled={loading}
                    >
                      <option value="">Select Domain</option>

                      <option value="Sales & Marketing">
                        Sales & Marketing
                      </option>
                      <option value="Data & AI Intelligence">
                        Data & AI Intelligence
                      </option>
                      <option value="Human Resources">Human Resources</option>
                      <option value="Social Media Management">
                        Social Media Management
                      </option>
                      <option value="Graphic Design">Graphic Design</option>
                      <option value="Digital Marketing">
                        Digital Marketing
                      </option>
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
                      <option value="Front-end Developer">
                        Front-end Developer
                      </option>
                      <option value="Back-end Developer">
                        Back-end Developer
                      </option>
                    </Select>
                  </Field>
                </div>

                <Field label="Access key">
                  <div className="relative">
                    <Input
                      name="accessKey"
                      type={showAccessKey ? "text" : "password"}
                      placeholder="Provided by your organization"
                      value={formData.accessKey}
                      onChange={handleChange}
                      disabled={loading}
                      className="pr-12"
                    />

                    <button
                      type="button"
                      onClick={() => setShowAccessKey(!showAccessKey)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6D8B8C] hover:text-[#235857]"
                    >
                      {showAccessKey ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <p className="mt-1 text-xs text-[#6D8B8C]">
                    Required for create account
                  </p>
                </Field>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full mt-4 py-3 rounded-xl bg-[#235857] text-white font-medium text-sm hover:bg-[#2F6F68] focus:outline-none focus:ring-4 focus:ring-[#235857]/30 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {loading ? "Creating account..." : "Create account"}
                </button>
              </div>

              <div className="mt-5 text-center">
                <p className="text-xs text-[#6D8B8C]">
                  Already have an account?
                  <Link
                    to="/login"
                    className="ml-1 text-[#235857] font-medium hover:underline"
                  >
                    Sign in
                  </Link>
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

function Input({
  type = "text",
  name,
  placeholder,
  value,
  onChange,
  disabled,
  className = "",
}) {
  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`w-full px-4 py-3 rounded-xl bg-white border border-[#D3D9D4] text-sm text-[#0D2426] placeholder:text-[#9FB1B2] focus:border-[#3B8A7F] focus:ring-4 focus:ring-[#3B8A7F]/20 disabled:opacity-50 disabled:cursor-not-allowed outline-none transition ${className}`}
    />
  );
}

function Select({ name, value, onChange, disabled, children }) {
  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="w-full px-4 py-3 rounded-xl bg-white border border-[#D3D9D4] text-sm text-[#0D2426] focus:border-[#3B8A7F] focus:ring-4 focus:ring-[#3B8A7F]/20 disabled:opacity-50 disabled:cursor-not-allowed outline-none transition"
    >
      {children}
    </select>
  );
}