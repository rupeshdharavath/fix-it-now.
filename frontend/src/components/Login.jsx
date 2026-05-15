import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/api/auth/login", formData);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);
      localStorage.setItem("user_email", res.data.user.email);
      localStorage.setItem("user_name", res.data.user.fullName);
      setSuccess(`Welcome ${res.data.user.fullName}`);
      setTimeout(() => {
        navigate("/");
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="page-container flex min-h-[calc(100vh-8rem)] items-center justify-center py-10">
      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="page-hero hidden flex-col justify-between overflow-hidden p-8 lg:flex">
          <div>
            <span className="section-kicker">Welcome back</span>
            <h1 className="section-title mt-4 text-4xl">Manage bookings, jobs, and reviews in one place.</h1>
            <p className="mt-4 max-w-xl text-slate-300">
              Sign in to jump into your personalized dashboard, track requests,
              and keep your home service workflow flowing smoothly.
            </p>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-3 text-sm text-slate-200">
            <div className="stat-badge">Fast booking</div>
            <div className="stat-badge">Live updates</div>
            <div className="stat-badge">Clean workflow</div>
          </div>
        </div>

        <div className="glass-card enter-up mx-auto w-full max-w-md p-6 sm:p-8">
        <h3 className="section-title text-center text-3xl">Login</h3>

        {error && <div className="mt-4 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{error}</div>}
        {success && <div className="mt-4 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">{success}</div>}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Email</label>
            <input
              type="email"
              className="neo-input"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Password</label>
            <input
              type="password"
              className="neo-input"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Role</label>
            <select
              className="neo-select"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="" disabled>
                Select role
              </option>
              <option value="worker">Worker</option>
              <option value="client">Client</option>
            </select>

          </div>
          <button type="submit" className="neo-button w-full">
            Login
          </button>
        </form>
        <div className="mt-5 text-center text-sm text-slate-300">
          Don’t have an account? <a href="/signup" className="font-semibold text-cyan-300">Sign up</a>
        </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
