import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { api } from "../lib/api";

function Job_offers() {
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
  const accept_job = async (bookingId) => {
    try {
      const res = await api.put(
        `/api/booking/accept_job/${bookingId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.message);
      get_job_offers();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };
  const reject_job = async (bookingId) => {
    try {
      const res = await api.put(
        `/api/booking/reject_job/${bookingId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.error("application rejected");
      get_job_offers();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  useEffect(() => {
    get_job_offers();
  }, []);
  const pendingOffers = jobOffers.filter(
    (offer) => offer.jobRejectedByWorker === false && offer.jobAcceptedByWorker === false
  );

  const formatAddress = (client) => {
    if (!client) return "No address available";

    const parts = [client.Street, client.mandal, client.district, client.state, client.country, client.pinCode].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "No address available";
  };

  return (
    <div className="page-container py-4">
      <div className="page-hero mb-6">
        <span className="section-kicker">Worker tools</span>
        <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="section-title">Pending job offers</h1>
            <p className="mt-2 text-slate-300">Review each offer and respond with one tap.</p>
          </div>
          <div className="stat-badge text-center">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Offers</div>
            <div className="text-2xl font-black text-cyan-300">{pendingOffers.length}</div>
          </div>
        </div>
      </div>

      {pendingOffers.length > 0 ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {pendingOffers.map((offer) => (
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

                <span className="rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-200">
                  Pending
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="stat-badge sm:col-span-2">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Job</p>
                  <p className="mt-1 text-lg text-white">{offer.jobId?.job || "Loading..."}</p>
                </div>
                <div className="stat-badge sm:col-span-2">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Address</p>
                  <p className="mt-1 text-slate-100">
                    {offer.clientId?.Street}, {offer.clientId?.mandal}, {offer.clientId?.district}, {offer.clientId?.state}, {offer.clientId?.country}, {offer.clientId?.pinCode}
                  </p>
                </div>
                <div className="stat-badge">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Slot date</p>
                  <p className="mt-1 text-slate-100">{new Date(offer.slotDate).toLocaleDateString()}</p>
                </div>
                <div className="stat-badge">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Slot time</p>
                  <p className="mt-1 text-slate-100">{offer.slotTime}</p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button className="neo-button flex-1 min-w-[120px]" onClick={() => accept_job(offer._id)}>
                  Accept
                </button>
                <button className="neo-button-danger flex-1 min-w-[120px]" onClick={() => reject_job(offer._id)}>
                  Reject
                </button>
              </div>

              <div className="mt-3 flex justify-end">
                <button className="text-sm font-semibold text-cyan-200 transition hover:text-cyan-100" onClick={() => setSelectedOffer(offer)}>
                  View Details
                </button>
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
              <h2 className="mt-3 text-3xl font-black text-white">Pending booking details</h2>
              <p className="mt-2 text-slate-300">Review the client and slot before accepting or rejecting.</p>
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
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Slot</p>
                <p className="mt-1 text-slate-100">
                  {selectedOffer.slotDate ? new Date(selectedOffer.slotDate).toLocaleDateString() : "N/A"} {selectedOffer.slotTime ? `• ${selectedOffer.slotTime}` : ""}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <ToastContainer position="top-right" autoClose={1500} />
    </div>
  );
}

export default Job_offers;
