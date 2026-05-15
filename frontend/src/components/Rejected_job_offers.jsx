import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import { api } from "../lib/api";

function Rejected_job_offers() {
  const token = localStorage.getItem("token");
  const [jobOffers, setJobOffers] = useState([]);
  const get_job_offers = async () => {
    try {
      const res = await api.get("/api/booking/get_job_offer", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobOffers(res.data.jobOffers);
    } catch (err) {
    }
  };
  useEffect(() => {
    get_job_offers();
  }, []);

  const rejectedOffers = jobOffers.filter(
    (offer) => offer.jobRejectedByWorker === true && offer.jobAcceptedByWorker === false
  );

  return (
    <div className="page-container py-4">
      <div className="page-hero mb-6">
        <span className="section-kicker">Worker tools</span>
        <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="section-title">Rejected job offers</h1>
            <p className="mt-2 text-slate-300">Offers you declined are archived here for reference.</p>
          </div>
          <div className="stat-badge text-center">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Rejected</div>
            <div className="text-2xl font-black text-rose-300">{rejectedOffers.length}</div>
          </div>
        </div>
      </div>

      {rejectedOffers.length > 0 ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {rejectedOffers.map((offer) => (
            <div key={offer._id} className="glass-card-soft p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={offer.clientId?.profilePic || "/vite.svg"}
                    alt="profile"
                    className="h-14 w-14 rounded-2xl object-cover ring-1 ring-white/10"
                  />
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Client</p>
                    <strong className="text-lg text-white">{offer.clientId?.fullName || "Loading..."}</strong>
                  </div>
                </div>
                <span className="rounded-full border border-rose-400/20 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-200">Rejected</span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="stat-badge sm:col-span-2"><p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Job</p><p className="mt-1 text-lg text-white">{offer.jobId?.job || "Loading..."}</p></div>
                <div className="stat-badge sm:col-span-2"><p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Address</p><p className="mt-1 text-slate-100">{offer.clientId?.Street}, {offer.clientId?.mandal}, {offer.clientId?.district}, {offer.clientId?.state}, {offer.clientId?.country}, {offer.clientId?.pinCode}</p></div>
                <div className="stat-badge"><p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Date</p><p className="mt-1 text-slate-100">{new Date(offer.slotDate).toLocaleDateString()}</p></div>
                <div className="stat-badge"><p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Time</p><p className="mt-1 text-slate-100">{offer.slotTime}</p></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card-soft p-8 text-center text-slate-300">No job offers found</div>
      )}
      <ToastContainer position="top-right" autoClose={1500} />
    </div>
  );
}

export default Rejected_job_offers;
