import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

function Accepted_applications() {
  const token = localStorage.getItem("token");
  const [getAcceptedWorkers, setgetAcceptedWorkers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const display_accepted_applications = async () => {
    try {
      const res = await api.get("/api/admin/accepted_applications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setgetAcceptedWorkers(res.data.getAcceptedWorkers || []);
    } catch (err) {
    }
  };

  const reject_job_application = async (requestId) => {
    try {
      await api.post(
        "/api/admin/reject_application",
        { requestId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Application rejected");
      setTimeout(() => {
        display_accepted_applications();
      }, 400);
    } catch (err) {
    }
  };

  const search_bar = async (query) => {
    if (!query) {
      display_accepted_applications();
      return;
    }
    try {
      const res = await api.get("/api/admin/search_job_accepted", {
        params: { searchQuery: query },
        headers: { Authorization: `Bearer ${token}` },
      });
      setgetAcceptedWorkers(res.data.getAcceptedWorkers || []);
    } catch (err) {
      setgetAcceptedWorkers([]);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      search_bar(searchQuery.toLowerCase());
    }, 200);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  useEffect(() => {
    display_accepted_applications();
  }, []);

  return (
    <div className="page-container py-4">
      <div className="page-hero mb-6">
        <span className="section-kicker">Admin tools</span>
        <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="section-title">Accepted applications</h1>
            <p className="mt-2 text-slate-300">Review approved workers and change status if needed.</p>
          </div>
          <div className="stat-badge text-center">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Accepted</div>
            <div className="text-2xl font-black text-emerald-300">{getAcceptedWorkers.length}</div>
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
        {getAcceptedWorkers.length > 0 ? (
          getAcceptedWorkers.map((requests, index) => (
            <div className="glass-card-soft p-5" key={requests._id || index}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Applicant</p>
                  <Link to="/user_profile" state={{ userId: requests.userId._id, show_review: false }} className="text-xl font-bold text-white hover:text-cyan-200">
                    {requests.userId.fullName}
                  </Link>
                </div>
                <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">Accepted</span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="stat-badge sm:col-span-2"><p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Job</p><p className="mt-1 text-slate-100">{requests.job}</p></div>
                <div className="stat-badge sm:col-span-2"><p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Profile</p><p className="mt-1 text-slate-100">Tap the name to open profile</p></div>
              </div>

              <div className="mt-5 flex gap-3">
                <Link 
                  to="/view_worker_application" 
                  state={{ jobId: requests._id }}
                  className="neo-button flex-1 text-center"
                >
                  Book Now
                </Link>
                <button className="neo-button-danger" onClick={() => reject_job_application(requests._id)}>
                  Reject
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

export default Accepted_applications;
