import { useState } from "react";
import { ArrowLeft, Mail, ShieldCheck, KeyRound, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import { authService } from "../api/authApi";

export default function ForgetPassword() {

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ================= STEP 1 =================
  const handleSendOTP = async (e) => {
    e.preventDefault();

    if (!formData.email) {
      toast.error("Email is required");
      return;
    }

    setLoading(true);

    try {
      await authService.forgotPassword(formData.email);
      toast.success("OTP sent to your email");
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ================= STEP 2 (REAL OTP VERIFY) =================

const handleVerifyOTP = async (e) => {
  e.preventDefault();

  if (formData.otp.length !== 6) {
    toast.error("Enter valid 6-digit OTP");
    return;
  }

  setLoading(true);

  try {
    await authService.verifyOTP({
      email: formData.email,
      otp: formData.otp,
    });

    toast.success("OTP Verified");
    setStep(3);

  } catch (err) {
    toast.error(err.response?.data?.message || "Invalid or expired OTP");
  } finally {
    setLoading(false);
  }
};

  // ================= STEP 3 =================
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (formData.password.length < 6)
      return toast.error("Password must be at least 6 characters");

    if (formData.password !== formData.confirmPassword)
      return toast.error("Passwords do not match");

    setLoading(true);

    try {
      await authService.resetPassword({
  email: formData.email,
  password: formData.password,
});

      toast.success("Password updated successfully!");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);

    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EEF2EF] px-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">

        {/* LEFT */}
        <div className="hidden lg:flex bg-[#235857] p-12 flex-col justify-between text-white">
          <div>
            <h2 className="text-3xl font-bold mb-4">
              {step === 1 && "Forgot Password?"}
              {step === 2 && "Verification"}
              {step === 3 && "Secure Account"}
            </h2>
            <p className="text-white/70">
              {step === 1 && "Provide your email to receive a verification code."}
              {step === 2 && `Enter the OTP sent to ${formData.email}.`}
              {step === 3 && "Create a strong new password."}
            </p>
          </div>

          <div className="flex justify-center">
            <div className="p-8 bg-white/10 rounded-full">
              {step === 1 && <Mail size={80} />}
              {step === 2 && <ShieldCheck size={80} />}
              {step === 3 && <KeyRound size={80} />}
            </div>
          </div>

          <p className="text-xs text-white/40">© 2026 Graphura Task Management</p>
        </div>

        {/* RIGHT */}
        <div className="p-8 sm:p-16 flex flex-col justify-center">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : window.history.back()}
            className="flex items-center text-sm text-gray-500 hover:text-[#235857] mb-8 transition"
          >
            <ArrowLeft size={16} className="mr-2" /> Back
          </button>

          <div className="max-w-sm w-full mx-auto">

            {step === 1 && (
              <FormWrapper title="Reset Password" sub="Enter your email" onSubmit={handleSendOTP}>
                <InputField
                  label="Email Address"
                  icon={<Mail size={18} />}
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                />
                <SubmitButton text="Send OTP" loading={loading} />
              </FormWrapper>
            )}

            {step === 2 && (
              <FormWrapper title="Enter OTP" sub={`Code sent to ${formData.email}`} onSubmit={handleVerifyOTP}>
                <InputField
                  label="6-Digit OTP"
                  icon={<KeyRound size={18} />}
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  placeholder="000000"
                  center
                />
                <SubmitButton text="Verify OTP" loading={loading} />
              </FormWrapper>
            )}

            {step === 3 && (
              <FormWrapper title="New Password" sub="Set your new password" onSubmit={handleResetPassword}>
                <InputField
                  label="New Password"
                  icon={<Lock size={18} />}
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  togglePassword={() => setShowPassword(!showPassword)}
                  showPassword={showPassword}
                />
                <InputField
                  label="Confirm Password"
                  icon={<ShieldCheck size={18} />}
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
                <SubmitButton text="Reset Password" loading={loading} />
              </FormWrapper>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- COMPONENTS ---------- */

function FormWrapper({ title, sub, onSubmit, children }) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-500 text-sm">{sub}</p>
      </div>
      {children}
    </form>
  );
}

function InputField({ label, icon, type, name, value, onChange, placeholder, center, togglePassword, showPassword }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </span>
        <input
          required
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#3B8A7F]/10 focus:border-[#3B8A7F] outline-none transition-all ${
            center ? "text-center tracking-widest font-bold" : ""
          }`}
        />
        {togglePassword && (
          <button
            type="button"
            onClick={togglePassword}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
}

function SubmitButton({ text, loading }) {
  return (
    <button
      disabled={loading}
      type="submit"
      className="w-full py-3.5 bg-[#235857] hover:bg-[#1a4342] text-white rounded-xl font-semibold shadow-lg transition-all disabled:opacity-70"
    >
      {loading ? "Please wait..." : text}
    </button>
  );
}