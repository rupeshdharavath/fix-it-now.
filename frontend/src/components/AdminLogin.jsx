import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { api } from "../lib/api";

function AdminLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Fixed admin credentials
  const ADMIN_EMAIL = "admin123@gmail.com";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Call backend admin login endpoint
      const res = await api.post("/api/admin/login", {
        password: password
      });

      // Set admin session in localStorage with token from backend
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);
      localStorage.setItem("user_email", res.data.user.email);
      localStorage.setItem("user_name", res.data.user.fullName);
      
      toast.success("Admin login successful! 🎉");
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      console.error(err);
      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Invalid admin password");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container flex min-h-[calc(100vh-8rem)] items-center justify-center py-10">
      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="page-hero hidden flex-col justify-between overflow-hidden p-8 lg:flex">
          <div>
            <span className="section-kicker">🔐 Admin Access</span>
            <h1 className="section-title mt-4 text-4xl">Manage applications, approve jobs, and monitor the platform.</h1>
            <p className="mt-4 max-w-xl text-slate-300">
              Admin panel for reviewing job applications, approving workers, managing bookings, and maintaining the Fix It Now platform.
            </p>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-3 text-sm text-slate-200">
            <div className="stat-badge">Review apps</div>
            <div className="stat-badge">Approve workers</div>
            <div className="stat-badge">Manage system</div>
          </div>
        </div>

        <div className="glass-card enter-up mx-auto w-full max-w-md p-6 sm:p-8">
          <h3 className="section-title text-center text-3xl">Admin Login</h3>
          <p className="mt-2 text-center text-sm text-slate-400">Secret admin access</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">Email</label>
              <input
                type="email"
                className="neo-input bg-slate-700/30"
                value={ADMIN_EMAIL}
                disabled
                readOnly
              />
              <p className="mt-1 text-xs text-slate-400">Fixed admin email</p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">Password</label>
              <input
                type="password"
                className="neo-input"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p className="mt-1 text-xs text-slate-400">Admin password only</p>
            </div>

            <button 
              type="submit" 
              className="neo-button w-full"
              disabled={loading}
            >
              {loading ? "Authenticating..." : "Admin Login"}
            </button>
          </form>

          <div className="mt-6 rounded-xl border border-amber-400/20 bg-amber-500/5 px-4 py-3 text-xs text-amber-200">
            <p className="font-semibold">⚠️ Secret Route</p>
            <p className="mt-1">This page is for authorized administrators only. Unauthorized access is prohibited.</p>
          </div>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={700} />
    </div>
  );
}

export default AdminLogin;
