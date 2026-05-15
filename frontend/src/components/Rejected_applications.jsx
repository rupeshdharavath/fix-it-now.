import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { api } from "../lib/api";

function Rejected_applications() {
  const token = localStorage.getItem("token");
  const [searchQuery, setSearchQuery] = useState("");
  const [getRejectedWorkers, setgetRejectedWorkers] = useState([]);

  const display_rejected_applications = async () => {
    try {
      const res = await api.get("/api/admin/rejected_applications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setgetRejectedWorkers(res.data.getRejectedWorkers || []);
    } catch (err) {
    }
  };

  const accept_job_application = async (requestId) => {
    try {
      await api.post(
        "/api/admin/accept_application",
        { requestId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("JOB application accepted");
      display_rejected_applications();
    } catch (err) {
    }
  };

  const search_bar = async (query) => {
    if (!query) {
      display_rejected_applications();
      return;
    }
    try {
      const res = await api.get("/api/admin/search_job_rejected", {
        params: { searchQuery: query },
        headers: { Authorization: `Bearer ${token}` },
      });
      setgetRejectedWorkers(res.data.getAcceptedWorkers || []);
    } catch (err) {
      setgetRejectedWorkers([]);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      search_bar(searchQuery.toLowerCase());
    }, 200);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  useEffect(() => {
    display_rejected_applications();
  }, []);

  return (
    <div className="page-container py-4">
      <div className="page-hero mb-6">
        <span className="section-kicker">Admin tools</span>
        <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="section-title">Rejected applications</h1>
            <p className="mt-2 text-slate-300">Revisit rejected entries and change the decision if needed.</p>
          </div>
          <div className="stat-badge text-center">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Rejected</div>
            <div className="text-2xl font-black text-rose-300">{getRejectedWorkers.length}</div>
          </div>
        </div>

        <div className="mt-5 flex justify-center">
          <input
            type="text"
            className="neo-input max-w-2xl"
            placeholder="Search applications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {getRejectedWorkers.length > 0 ? (
          getRejectedWorkers.map((requests, index) => (
            <div className="glass-card-soft p-5" key={requests._id || index}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Applicant</p>
                  <Link to="/user_profile" state={{ userId: requests.userId._id, show_review: false }} className="text-xl font-bold text-white hover:text-cyan-200">
                    {requests.userId.fullName}
                  </Link>
                </div>
                <span className="rounded-full border border-rose-400/20 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-200">Rejected</span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="stat-badge sm:col-span-2"><p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Job</p><p className="mt-1 text-slate-100">{requests.job}</p></div>
                <div className="stat-badge sm:col-span-2"><p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Profile</p><p className="mt-1 text-slate-100">Tap the name to open profile</p></div>
              </div>

              <div className="mt-5 flex justify-end">
                <button className="neo-button" onClick={() => accept_job_application(requests._id)}>
                  Accept
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="glass-card-soft md:col-span-2 xl:col-span-3 p-8 text-center text-slate-300">NO JOBS AVAILABLE</div>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={1000} />
    </div>
  );
}

export default Rejected_applications;