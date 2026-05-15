import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

function Pending_worker_jobs() {
  const [appData, setAppData] = useState([]);
  const [userData, setUserData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const token = localStorage.getItem("token");

  const display_applyed_jobs = async () => {
    try {
      const res = await api.get("/api/worker/display_accepted_jobs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserData(res.data.userData || null);
      setAppData(res.data.appData || []);
    } catch (err) {
      alert(err.message);
    }
  };

  const delete_application = async (appId) => {
    try {
      const res = await api.delete(`/api/worker/delete_application/${appId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      display_applyed_jobs();
    } catch (err) {
    }
  };

  useEffect(() => {
    display_applyed_jobs();
  }, []);

  const pendingJobs = (appData || []).filter((app) => app.jobAccepted === false && app.jobRejected === false);

  const visibleJobs = (appData || [])
    .filter((app) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchLower ||
        app.job?.toLowerCase().includes(searchLower) ||
        userData?.fullName?.toLowerCase().includes(searchLower);
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "pending"
          ? app.jobAccepted === false && app.jobRejected === false
          : app.jobRejected === true;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "date-asc") return new Date(a.createdAt) - new Date(b.createdAt);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  return (
    <div className="page-container py-4">
      <div className="page-hero mb-6">
        <span className="section-kicker">Worker tools</span>
        <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="section-title">Applied jobs</h1>
            <p className="mt-2 text-slate-300">These are the jobs you�ve submitted and are waiting for admin review.</p>
          </div>
          <div className="stat-badge text-center">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Pending</div>
            <div className="text-2xl font-black text-amber-300">{pendingJobs.length}</div>
          </div>
        </div>
      </div>

      <div className="mt-8 mb-6">
        <Link
          to="/apply_for_job"
          className="neo-button inline-flex items-center gap-2 px-6 py-3 text-lg font-bold"
        >
          <span>➕</span>
          <span>Post a New Service</span>
        </Link>
      </div>

      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <input
          type="text"
          className="neo-input md:w-96"
          placeholder="Search applications by job name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          {["all", "pending", "rejected"].map((status) => (
            <button key={status} className={`neo-button px-4 py-2 text-sm capitalize ${statusFilter === status ? "bg-cyan-500/20 text-cyan-300" : "bg-slate-700/30 text-slate-300"}`} onClick={() => setStatusFilter(status)}>
              {status}
            </button>
          ))}
        </div>
        <select className="neo-input md:w-48" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="date-desc">Newest first</option>
          <option value="date-asc">Oldest first</option>
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleJobs.length > 0 ? (
          visibleJobs.map((app, index) => (
            <div className="glass-card-soft p-5" key={app._id || index}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Applicant</p>
                  <h3 className="text-2xl font-bold text-white">{userData?.fullName || "You"}</h3>
                </div>
                <span className="rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-200">Pending</span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="stat-badge">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Job</p>
                  <p className="mt-1 text-slate-100">{app.job}</p>
                </div>
                <div className="stat-badge">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Status</p>
                  <p className="mt-1 text-slate-100">Awaiting admin review</p>
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <button className="neo-button-danger" onClick={() => delete_application(app._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="glass-card-soft md:col-span-2 xl:col-span-3 p-8 text-center text-slate-300">
            NO JOBS AVAILABLE
          </div>
        )}
      </div>
    </div>
  );
}

export default Pending_worker_jobs;
