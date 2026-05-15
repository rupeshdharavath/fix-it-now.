import { useEffect, useState } from "react";
import { api } from "../lib/api";

function Rejected_worker_jobs() {
  const [appData, setAppData] = useState([]);
  const [userData, setUserData] = useState(null);
  const token = localStorage.getItem("token");

  const display_applyed_jobs = async () => {
    try {
      const res = await api.get("/api/worker/display_accepted_jobs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserData(res.data.userData);
      setAppData(res.data.appData);
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

  const rejectedJobs = appData.filter((app) => app.jobAccepted === false && app.jobRejected === true);

  return (
    <div className="page-container py-4">
      <div className="page-hero mb-6">
        <span className="section-kicker">Worker tools</span>
        <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="section-title">Rejected jobs</h1>
            <p className="mt-2 text-slate-300">Jobs that were not approved by admin are listed here.</p>
          </div>
          <div className="stat-badge text-center">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Rejected</div>
            <div className="text-2xl font-black text-rose-300">{rejectedJobs.length}</div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rejectedJobs.length > 0 ? (
          rejectedJobs.map((app, index) => (
            <div className="glass-card-soft p-5" key={app._id || index}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Applicant</p>
                  <h3 className="text-2xl font-bold text-white">{userData?.fullName || "You"}</h3>
                </div>
                <span className="rounded-full border border-rose-400/20 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-200">Rejected</span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="stat-badge">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Job</p>
                  <p className="mt-1 text-slate-100">{app.job}</p>
                </div>
                <div className="stat-badge">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Status</p>
                  <p className="mt-1 text-slate-100">Rejected by admin</p>
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

export default Rejected_worker_jobs;
