import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { api } from "../lib/api";

function Pending_requests() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("date-desc");
  const [statusFilter, setStatusFilter] = useState("all");
  const token = localStorage.getItem("token");

  const fetch_all_jobs_recruited_by_client = async () => {
    try {
      const res = await api.get("/api/booking/get_recruited_staff", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFormData(res.data.formData || []);
    } catch (err) {
      toast.error("Unable to load pending requests");
    } finally {
      setLoading(false);
    }
  };

  const delete_pending_app = async (booking_id) => {
    try {
      await api.delete(`/api/booking/delete_application/${booking_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Request cancelled");
      fetch_all_jobs_recruited_by_client();
    } catch (err) {
      toast.error("Unable to cancel request");
    }
  };

  const reschedule_pending_app = (booking) => {
    navigate("/book_slot", {
      state: {
        bookingId: booking._id,
        jobId: booking.jobId?._id,
        initialSlotDate: booking.slotDate ? new Date(booking.slotDate).toISOString().split("T")[0] : "",
        initialSlotTime: booking.slotTime,
      },
    });
  };

  useEffect(() => {
    fetch_all_jobs_recruited_by_client();
  }, []);

  const pendingList = (formData || []).filter(
    (form) => form.jobAcceptedByWorker === false || form.jobRejectedByWorker === true
  );

  const visiblePending = [...pendingList]
    .filter((form) => {
      if (statusFilter === "all") return true;
      if (statusFilter === "pending") return form.jobAcceptedByWorker === false && form.jobRejectedByWorker === false;
      return form.jobRejectedByWorker === true;
    })
    .sort((a, b) => {
      if (sortBy === "date-asc") return new Date(a.slotDate) - new Date(b.slotDate);
      return new Date(b.slotDate) - new Date(a.slotDate);
    });

  return (
    <div className="page-container py-4">
      <div className="page-hero mb-6">
        <span className="section-kicker">Client dashboard</span>
        <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="section-title">Pending requests</h1>
            <p className="mt-2 text-slate-300">Track requests waiting on worker response and cancel if needed.</p>
          </div>
          <div className="stat-badge text-center">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Pending</div>
            <div className="text-2xl font-black text-amber-300">{pendingList.length}</div>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {["all", "pending", "rejected"].map((status) => (
            <button
              key={status}
              className={`neo-button px-4 py-2 text-sm capitalize ${statusFilter === status ? "bg-cyan-500/20 text-cyan-300" : "bg-slate-700/30 text-slate-300"}`}
              onClick={() => setStatusFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>
        <select className="neo-input md:w-56" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="date-desc">Newest first</option>
          <option value="date-asc">Oldest first</option>
        </select>
      </div>

      {loading ? (
        <div className="glass-card-soft p-8 text-center text-slate-300">Loading pending requests...</div>
      ) : visiblePending.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visiblePending.map((form, index) => (
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
                    form.jobRejectedByWorker
                      ? "border border-rose-400/20 bg-rose-500/10 text-rose-200"
                      : "border border-amber-400/20 bg-amber-500/10 text-amber-200"
                  }`}
                >
                  {form.jobRejectedByWorker ? "Rejected" : "Pending"}
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="stat-badge sm:col-span-2">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Service</p>
                  <p className="mt-1 text-lg text-white">{form.jobId?.job || "N/A"}</p>
                </div>
                <div className="stat-badge">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Slot date</p>
                  <p className="mt-1 text-slate-100">{new Date(form.slotDate).toLocaleDateString()}</p>
                </div>
                <div className="stat-badge">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Slot time</p>
                  <p className="mt-1 text-slate-100">{form.slotTime}</p>
                </div>
              </div>

              <div className="mt-5 flex gap-3">
                <button className="neo-button-danger w-full" onClick={() => delete_pending_app(form._id)}>
                  Cancel Request
                </button>
                <button className="neo-button w-full" onClick={() => reschedule_pending_app(form)}>
                  Reschedule
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card-soft p-8 text-center text-slate-300">
          No pending applications right now.
        </div>
      )}

      <ToastContainer position="top-right" autoClose={1000} />
    </div>
  );
}

export default Pending_requests;
