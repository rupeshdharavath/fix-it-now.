import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";

function Recruited() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("date-desc");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const token = localStorage.getItem("token");

  const fetch_all_jobs_recruited_by_client = async () => {
    try {
      const res = await api.get("/api/booking/get_recruited_staff", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFormData(res.data.formData || []);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch_all_jobs_recruited_by_client();
  }, []);

  const recruitedList = (formData || []).filter(
    (form) => form.jobAcceptedByWorker === true && form.jobRejectedByWorker === false
  );

  const visibleRecruited = recruitedList
    .filter((form) => {
      if (statusFilter === "all") return true;
      if (statusFilter === "completed") return Boolean(form.jobCompleted);
      return !form.jobCompleted;
    })
    .sort((a, b) => {
      if (sortBy === "date-asc") return new Date(a.slotDate) - new Date(b.slotDate);
      if (sortBy === "name-asc") return (a.workerId?.fullName || "").localeCompare(b.workerId?.fullName || "");
      return new Date(b.slotDate) - new Date(a.slotDate);
    });

  const completedCount = recruitedList.filter((form) => form.jobCompleted).length;

  const formatDate = (value) => {
    if (!value) return "N/A";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString();
  };

  const requestReschedule = (form) => {
    navigate("/book_slot", {
      state: {
        bookingId: form._id,
        jobId: form.jobId?._id,
        initialSlotDate: form.slotDate ? new Date(form.slotDate).toISOString().split("T")[0] : "",
        initialSlotTime: form.slotTime,
      },
    });
  };

  const cancelBooking = async (form) => {
    try {
      const reason = window.prompt("Reason for cancellation") || "";
      if (!reason.trim()) {
        alert("Please provide a reason before sending the cancellation request.");
        return;
      }
      await api.put(
        `/api/booking/cancel/${form._id}`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Cancellation request sent to admin.");
      fetch_all_jobs_recruited_by_client();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const downloadReceipt = (form) => {
    const receipt = [
      "Fix It Now Receipt",
      `Booking ID: ${form._id}`,
      `Worker: ${form.workerId?.fullName || "N/A"}`,
      `Worker email: ${form.workerId?.email || "N/A"}`,
      `Worker phone: ${form.workerId?.mobileNum || "N/A"}`,
      `Service: ${form.jobId?.job || "N/A"}`,
      `Date: ${form.slotDate ? new Date(form.slotDate).toLocaleDateString() : "N/A"}`,
      `Time: ${form.slotTime || "N/A"}`,
      `Status: ${form.status || (form.jobCompleted ? "completed" : "active")}`,
    ].join("\n");
    const blob = new Blob([receipt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `receipt-${form._id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const closeDetails = () => setSelectedBooking(null);

  return (
    <div className="page-container py-4">
      <div className="page-hero mb-6">
        <span className="section-kicker">Client dashboard</span>
        <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="section-title">Recruited workers</h1>
            <p className="mt-2 text-slate-300">Manage accepted workers and add reviews after service.</p>
          </div>
          <div className="stat-badge text-center">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Accepted</div>
            <div className="text-2xl font-black text-emerald-300">{recruitedList.length}</div>
          </div>
          <div className="stat-badge text-center">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Review Eligible</div>
            <div className="text-2xl font-black text-cyan-300">{completedCount}</div>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {["all", "active", "completed"].map((status) => (
            <button key={status} className={`neo-button px-4 py-2 text-sm capitalize ${statusFilter === status ? "bg-cyan-500/20 text-cyan-300" : "bg-slate-700/30 text-slate-300"}`} onClick={() => setStatusFilter(status)}>
              {status}
            </button>
          ))}
        </div>
        <select className="neo-input md:w-56" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="date-desc">Newest first</option>
          <option value="date-asc">Oldest first</option>
          <option value="name-asc">Worker name A-Z</option>
        </select>
      </div>

      {loading ? (
        <div className="glass-card-soft p-8 text-center text-slate-300">Loading recruited workers...</div>
      ) : visibleRecruited.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleRecruited.map((form, index) => (
            <div
              key={form._id || index}
              className={`glass-card-soft p-5 ${form.workerId?.isActive === false ? "opacity-60" : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Worker</p>
                  <Link
                    to="/user_profile"
                    state={{ userId: form.workerId?._id, show_review: true }}
                    className="text-xl font-bold text-white hover:text-cyan-200"
                  >
                    {form.workerId?.fullName || "Unknown"}
                  </Link>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    form.workerId?.isActive === false
                      ? "border border-slate-300/20 bg-slate-500/10 text-slate-300"
                      : form.jobCompleted
                      ? "border border-cyan-400/20 bg-cyan-500/10 text-cyan-200"
                      : "border border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
                  }`}
                >
                  {form.workerId?.isActive === false
                    ? "Deactivated"
                    : form.jobCompleted
                    ? "Completed"
                    : "Accepted"}
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="stat-badge sm:col-span-2">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Service</p>
                  <p className="mt-1 text-lg text-white">{form.jobId?.job || "N/A"}</p>
                </div>
                <div className="stat-badge">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Slot date</p>
                  <p className="mt-1 text-slate-100">{formatDate(form.slotDate)}</p>
                </div>
                <div className="stat-badge">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Slot time</p>
                  <p className="mt-1 text-slate-100">{form.slotTime || "N/A"}</p>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  className="neo-button inline-flex items-center justify-center px-5 py-3"
                  onClick={() => setSelectedBooking(form)}
                >
                  View More
                </button>
                <span className="text-sm text-slate-400">
                  {form.cancelRequestStatus === "pending"
                    ? "Cancellation pending"
                    : form.jobCompleted
                    ? "Completed job"
                    : "Active booking"}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card-soft p-8 text-center text-slate-300">No recruited workers yet.</div>
      )}

      {selectedBooking ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-8 backdrop-blur-sm">
          <div className="glass-card-soft relative w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl shadow-black/40">
            <button
              type="button"
              className="absolute right-4 top-4 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-200 hover:bg-white/10"
              onClick={closeDetails}
            >
              Close
            </button>

            <div className="pr-16">
              <span className="section-kicker">View more</span>
              <h2 className="mt-3 text-3xl font-black text-white">Recruited worker details</h2>
              <p className="mt-2 text-slate-300">Review the booking and use the actions below without crowding the card.</p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="stat-badge sm:col-span-2">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Worker</p>
                <p className="mt-1 text-lg text-white">{selectedBooking.workerId?.fullName || "Unknown"}</p>
              </div>
              <div className="stat-badge">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Email</p>
                <p className="mt-1 break-words text-slate-100">{selectedBooking.workerId?.email || "N/A"}</p>
              </div>
              <div className="stat-badge">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Phone</p>
                <p className="mt-1 text-slate-100">{selectedBooking.workerId?.mobileNum || "N/A"}</p>
              </div>
              <div className="stat-badge sm:col-span-2">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Service</p>
                <p className="mt-1 text-slate-100">{selectedBooking.jobId?.job || "N/A"}</p>
              </div>
              <div className="stat-badge">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Slot date</p>
                <p className="mt-1 text-slate-100">{formatDate(selectedBooking.slotDate)}</p>
              </div>
              <div className="stat-badge">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Slot time</p>
                <p className="mt-1 text-slate-100">{selectedBooking.slotTime || "N/A"}</p>
              </div>
              <div className="stat-badge sm:col-span-2">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Status</p>
                <p className="mt-1 text-slate-100">
                  {selectedBooking.cancelRequestStatus === "pending"
                    ? "Cancellation request pending admin approval"
                    : selectedBooking.jobCompleted
                    ? "Completed and ready for review"
                    : "Accepted and in progress"}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {selectedBooking.jobCompleted ? (
                <Link to="/write_review" state={{ bookingId: selectedBooking._id }} className="neo-button inline-flex items-center justify-center px-5 py-3 text-center">
                  Add Review
                </Link>
              ) : (
                <button className="neo-button-secondary px-5 py-3" type="button" disabled>
                  Review after completion
                </button>
              )}
              <button className="neo-button-secondary px-5 py-3" type="button" onClick={() => requestReschedule(selectedBooking)}>
                Reschedule
              </button>
              <button
                className="neo-button-secondary px-5 py-3"
                type="button"
                onClick={() => cancelBooking(selectedBooking)}
                disabled={selectedBooking.cancelRequestStatus === "pending"}
              >
                {selectedBooking.cancelRequestStatus === "pending" ? "Cancellation Pending" : "Request Cancel"}
              </button>
              <a className="neo-button-secondary inline-flex items-center justify-center px-5 py-3 text-center" href={`mailto:${selectedBooking.workerId?.email || ""}`}>
                Contact Worker
              </a>
              <button className="neo-button-secondary px-5 py-3 sm:col-span-2" type="button" onClick={() => downloadReceipt(selectedBooking)}>
                Download Receipt
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default Recruited;
