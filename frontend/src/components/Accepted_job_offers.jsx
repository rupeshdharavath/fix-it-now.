import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import { api } from "../lib/api";

function Accept_job_offers() {
  const token = localStorage.getItem("token");
  const [jobOffers, setJobOffers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);
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

  const acceptedOffers = jobOffers.filter(
    (offer) => offer.jobRejectedByWorker === false && offer.jobAcceptedByWorker === true
  );

  const formatAddress = (client) => {
    if (!client) return "No address available";

    const parts = [client.Street, client.mandal, client.district, client.state, client.country, client.pinCode].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "No address available";
  };

  const cancelAcceptedJob = async (offer) => {
    try {
      const reason = window.prompt("Reason for cancellation") || "";
      if (!reason.trim()) {
        alert("Please provide a reason before sending the cancellation request.");
        return;
      }
      await api.put(
        `/api/booking/cancel/${offer._id}`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Cancellation request sent to admin.");
      setSelectedOffer(null);
      get_job_offers();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="page-container py-4">
      <div className="page-hero mb-6">
        <span className="section-kicker">Worker tools</span>
        <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="section-title">Accepted job offers</h1>
            <p className="mt-2 text-slate-300">Offers you’ve already accepted are shown here.</p>
          </div>
          <div className="stat-badge text-center">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Accepted</div>
            <div className="text-2xl font-black text-emerald-300">{acceptedOffers.length}</div>
          </div>
        </div>
      </div>

      {acceptedOffers.length > 0 ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {acceptedOffers.map((offer) => (
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
                <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                  {offer.cancelRequestStatus === "pending" ? "Cancellation Pending" : "Accepted"}
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="stat-badge sm:col-span-2">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Job</p>
                  <p className="mt-1 text-lg text-white">{offer.jobId?.job || "Loading..."}</p>
                </div>
                <div className="stat-badge sm:col-span-2">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Address</p>
                  <p className="mt-1 text-slate-100">{formatAddress(offer.clientId)}</p>
                </div>
                <div className="stat-badge">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Date</p>
                  <p className="mt-1 text-slate-100">{offer.slotDate ? new Date(offer.slotDate).toLocaleDateString() : "Loading..."}</p>
                </div>
                <div className="stat-badge">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Time</p>
                  <p className="mt-1 text-slate-100">{offer.slotTime || "Loading..."}</p>
                </div>
                <div className="stat-badge sm:col-span-2">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Cancellation status</p>
                  <p className="mt-1 text-slate-100">
                    {offer.cancelRequestStatus === "pending"
                      ? "Cancellation request pending admin approval"
                      : offer.cancelRequestStatus === "approved"
                      ? "Cancellation approved"
                      : offer.cancelRequestStatus === "rejected"
                      ? "Cancellation rejected"
                      : "No cancellation request yet"}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <div className="flex gap-2">
                  <button className="neo-button inline-flex items-center gap-2 px-5 py-3" onClick={() => setSelectedOffer(offer)}>
                    <span>View Details</span>
                  </button>
                  <a
                    className="neo-button-secondary inline-flex items-center gap-2 px-5 py-3"
                    href={`tel:${offer.clientId?.mobileNum || ""}`}
                  >
                    Call Client
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card-soft p-8 text-center text-slate-300">No job offers found</div>
      )}

      {selectedOffer ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-8 backdrop-blur-sm">
          <div className="glass-card-soft relative w-full max-w-2xl p-6 shadow-2xl shadow-black/40">
            <button
              type="button"
              className="absolute right-4 top-4 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-200 hover:bg-white/10"
              onClick={() => setSelectedOffer(null)}
            >
              Close
            </button>

            <div className="pr-16">
              <span className="section-kicker">View details</span>
              <h2 className="mt-3 text-3xl font-black text-white">Client booking details</h2>
              <p className="mt-2 text-slate-300">Everything the worker needs for the accepted job.</p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="stat-badge sm:col-span-2">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Client name</p>
                <p className="mt-1 text-lg text-white">{selectedOffer.clientId?.fullName || "N/A"}</p>
              </div>
              <div className="stat-badge">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Email</p>
                <p className="mt-1 text-slate-100 break-words">{selectedOffer.clientId?.email || "N/A"}</p>
              </div>
              <div className="stat-badge">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Phone</p>
                <p className="mt-1 text-slate-100">{selectedOffer.clientId?.mobileNum || "N/A"}</p>
              </div>
              <div className="stat-badge sm:col-span-2">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Address</p>
                <p className="mt-1 text-slate-100">{formatAddress(selectedOffer.clientId)}</p>
              </div>
              <div className="stat-badge">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Job</p>
                <p className="mt-1 text-slate-100">{selectedOffer.jobId?.job || "N/A"}</p>
              </div>
              <div className="stat-badge">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Accepted slot</p>
                <p className="mt-1 text-slate-100">
                  {selectedOffer.slotDate ? new Date(selectedOffer.slotDate).toLocaleDateString() : "N/A"} {selectedOffer.slotTime ? `• ${selectedOffer.slotTime}` : ""}
                </p>
              </div>
              <div className="sm:col-span-2 flex gap-3 pt-2">
                <button
                  className="neo-button-danger flex-1"
                  onClick={() => cancelAcceptedJob(selectedOffer)}
                  disabled={selectedOffer.cancelRequestStatus === "pending"}
                >
                  {selectedOffer.cancelRequestStatus === "pending" ? "Cancellation Pending" : "Request Cancel"}
                </button>
                <a className="neo-button-secondary flex-1 text-center" href={`mailto:${selectedOffer.clientId?.email || ""}`}>
                  Email Client
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <ToastContainer position="top-right" autoClose={1500} />
    </div>
  );
}

export default Accept_job_offers;
