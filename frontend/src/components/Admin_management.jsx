import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { toast } from "react-toastify";

function Admin_management() {
  const token = localStorage.getItem("token");
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name-asc");
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (roleFilter !== "all") {
        params.role = roleFilter;
      }
      const res = await api.get("/api/admin/all_users", {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data.users || []);
      setFilteredUsers(res.data.users || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch users");
      toast.error("Error loading users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, [roleFilter]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get("/api/admin/analytics", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAnalytics(res.data.metrics || null);
      } catch (err) {
        setAnalytics(null);
      }
    };

    fetchAnalytics();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(users);
    } else {
      const lower = searchTerm.toLowerCase();
      const filtered = users.filter(
        (user) =>
          user.email?.toLowerCase().includes(lower) ||
          user.fullName?.toLowerCase().includes(lower) ||
          user.mobileNum?.toLowerCase().includes(lower)
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const displayedUsers = [...filteredUsers].sort((a, b) => {
    if (sortBy === "name-desc") return (b.fullName || "").localeCompare(a.fullName || "");
    if (sortBy === "email-asc") return (a.email || "").localeCompare(b.email || "");
    if (sortBy === "email-desc") return (b.email || "").localeCompare(a.email || "");
    return (a.fullName || "").localeCompare(b.fullName || "");
  });

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await api.post(
        `/api/admin/toggle_user_status/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`User ${currentStatus ? "deactivated" : "activated"} successfully`);
      fetchAllUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update user status");
    }
  };

  if (loading)
    return (
      <div className="page-container py-20 text-center text-slate-200">
        Loading users...
      </div>
    );

  const activeCount = users.filter((u) => u.isActive).length;
  const inactiveCount = users.filter((u) => !u.isActive).length;

  return (
    <div className="page-container py-4">
      <div className="page-hero mb-6">
        <span className="section-kicker">Admin control</span>
        <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="section-title">Account management</h1>
            <p className="mt-2 text-slate-300">
              Manage user accounts, activate or deactivate access.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="stat-badge text-center">
              <div className="text-xs uppercase tracking-[0.2em] text-emerald-400">
                Active
              </div>
              <div className="text-2xl font-black text-emerald-300">{activeCount}</div>
            </div>
            <div className="stat-badge text-center">
              <div className="text-xs uppercase tracking-[0.2em] text-rose-400">
                Inactive
              </div>
              <div className="text-2xl font-black text-rose-300">{inactiveCount}</div>
            </div>
          </div>
        </div>
      </div>

      {analytics ? (
        <div className="mb-6 grid gap-3 md:grid-cols-4">
          <div className="stat-badge text-center"><div className="text-xs uppercase tracking-[0.2em] text-slate-400">Bookings</div><div className="text-2xl font-black text-cyan-300">{analytics.totalBookings}</div></div>
          <div className="stat-badge text-center"><div className="text-xs uppercase tracking-[0.2em] text-slate-400">Accepted</div><div className="text-2xl font-black text-emerald-300">{analytics.acceptedJobs}</div></div>
          <div className="stat-badge text-center"><div className="text-xs uppercase tracking-[0.2em] text-slate-400">Completed</div><div className="text-2xl font-black text-indigo-300">{analytics.completedJobs}</div></div>
          <div className="stat-badge text-center"><div className="text-xs uppercase tracking-[0.2em] text-slate-400">Complaints</div><div className="text-2xl font-black text-rose-300">{analytics.complaints}</div></div>
        </div>
      ) : null}

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end">
        <div className="flex-1">
          <input
            type="text"
            className="neo-input w-full"
            placeholder="🔍 Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {["all", "client", "worker"].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`neo-button px-4 py-2 text-sm capitalize ${
                roleFilter === role
                  ? "bg-cyan-500/20 text-cyan-300"
                  : "bg-slate-700/30 text-slate-300 hover:bg-slate-700/50"
              }`}
            >
              {role === "all" ? "All Users" : role === "client" ? "Clients" : "Workers"}
            </button>
          ))}
        </div>
        <div>
          <select className="neo-input min-w-[180px]" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="email-asc">Email A-Z</option>
            <option value="email-desc">Email Z-A</option>
          </select>
        </div>
      </div>

      {displayedUsers.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
          {displayedUsers.map((user) => (
            <div
              key={user._id}
              className="glass-card-soft flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex items-center gap-4">
                <img
                  src={
                    user.profilePic ||
                    "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                  }
                  alt={user.fullName}
                  className="h-16 w-16 rounded-full border-2 border-cyan-400/50 object-cover"
                />
                <div>
                  <h3 className="text-lg font-bold text-white">{user.fullName}</h3>
                  <p className="text-sm text-slate-300">{user.email}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {user.mobileNum} · {user.role === "client" ? "👤 Client" : "🔧 Worker"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    user.isActive
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                      : "bg-rose-500/20 text-rose-300 border border-rose-400/30"
                  }`}>
                    {user.isActive ? "✓ Active" : "✗ Inactive"}
                  </div>
                </div>

                <button
                  onClick={() => toggleUserStatus(user._id, user.isActive)}
                  className={`neo-button px-4 py-2 text-sm font-semibold ${
                    user.isActive
                      ? "bg-rose-500/20 text-rose-300 hover:bg-rose-500/30"
                      : "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                  }`}
                >
                  {user.isActive ? "Deactivate" : "Activate"}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card-soft p-8 text-center text-slate-300">
          No users found matching your criteria
        </div>
      )}
    </div>
  );
}

export default Admin_management;
