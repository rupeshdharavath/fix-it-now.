import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

function Signup(){
  const navigate=useNavigate();
  const [formData, setFormData] = useState({
    fullName:"",
    email: "",
    password: "",
    role: "client",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const res = await api.post("/api/auth/signup", formData);
      setSuccess("Signup successful!");
      setTimeout(()=>{
        navigate("/login");
      },1200);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong!");
    }
  };

  return (
    <div className="page-container flex min-h-[calc(100vh-8rem)] items-center justify-center py-10">
      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="page-hero hidden flex-col justify-between p-8 lg:flex">
          <div>
            <span className="section-kicker">Get started</span>
            <h1 className="section-title mt-4 text-4xl">Join the smarter way to manage home services.</h1>
            <p className="mt-4 max-w-xl text-slate-300">
              Create your account to book, apply, review, and manage jobs with a cleaner, faster workflow.
            </p>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-3 text-sm text-slate-200">
            <div className="stat-badge">Simple signup</div>
            <div className="stat-badge">Role-based access</div>
            <div className="stat-badge">Better workflow</div>
          </div>
        </div>

        <div className="glass-card enter-up mx-auto w-full max-w-md p-6 sm:p-8">
          <h3 className="section-title text-center text-3xl">Sign up</h3>

          {error && <div className="mt-4 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{error}</div>}
          {success && <div className="mt-4 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">{success}</div>}

          <form onSubmit={handleSignUp} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">Full name</label>
              <input
                type="text"
                className="neo-input"
                name="fullName"
                placeholder="Enter your name"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>
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
                placeholder="Create a strong password"
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
                <option value="worker">Worker</option>
                <option value="client">Client</option>
              </select>
            </div>
            <button type="submit" className="neo-button w-full">
              Sign up
            </button>
          </form>
          <div className="mt-5 text-center text-sm text-slate-300">
            already have an account? <a href="/login" className="font-semibold text-cyan-300">login</a>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Signup;