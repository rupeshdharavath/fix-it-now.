import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { api } from "../lib/api";
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

function Booking_form() {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const jobId = location.state?.jobId;
  
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const get_booking_form = async () => {
    if (!jobId) {
      setError("No Job ID provided to fetch booking data.");
      setLoading(false);
      return;
    }

    try {
      const res = await api.get(`/api/admin/get_booking_form/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data.bookingdata;
      
      if (Array.isArray(data)) {
          setBookings(data);
      } else if (data) {
          setBookings([data]);
      } else {
          setError("No booking data found.");
      }
      
    } catch (err) {
      console.error("API Error:", err);
      setError(err.response?.data?.message || err.message || "Failed to fetch booking details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    get_booking_form();
  }, [jobId]); 

  if (loading) return <div className="page-container py-20 text-center text-slate-200">Loading booking details...</div>;
  if (error) return <div className="page-container py-10"><div className="glass-card-soft mx-auto max-w-2xl border border-rose-400/30 bg-rose-500/10 p-5 text-rose-100">Error: {error}</div></div>;
  if (bookings.length === 0) return <div className="page-container py-20 text-center text-slate-300">No accepted bookings found for this job ID.</div>;

  const renderBookingDetails = (booking, index) => {
    const jobName = booking.jobId?.job || "N/A";
    const clientName = booking.clientId?.fullName || "N/A";
    const workerName = booking.workerId?.fullName || "N/A";
    const slotDate = formatDate(booking.slotDate);
    const slotTime = booking.slotTime || "N/A";
    const timeline = buildTimeline(booking);

    return (
      <div className="glass-card-soft mb-4 p-5" key={booking._id || index}>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <span className="section-kicker">Booking details</span>
            <h3 className="mt-2 text-2xl font-bold text-white">#{index + 1} · {jobName}</h3>
          </div>
          <span className="neo-button-secondary text-sm">{slotDate}</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="stat-badge"><span className="text-xs uppercase tracking-[0.2em] text-slate-400">Client</span><p className="mt-1 text-lg text-white">{clientName}</p></div>
          <div className="stat-badge"><span className="text-xs uppercase tracking-[0.2em] text-slate-400">Worker</span><p className="mt-1 text-lg text-white">{workerName}</p></div>
          <div className="stat-badge"><span className="text-xs uppercase tracking-[0.2em] text-slate-400">Client email</span><p className="mt-1 break-all text-slate-100">{booking.clientId?.email || "N/A"}</p></div>
          <div className="stat-badge"><span className="text-xs uppercase tracking-[0.2em] text-slate-400">Worker email</span><p className="mt-1 break-all text-slate-100">{booking.workerId?.email || "N/A"}</p></div>
          <div className="stat-badge md:col-span-2"><span className="text-xs uppercase tracking-[0.2em] text-slate-400">Client address</span><p className="mt-1 text-slate-100">{booking.clientId?.Street}, {booking.clientId?.mandal}, {booking.clientId?.district}, {booking.clientId?.state}, {booking.clientId?.country}, {booking.clientId?.pinCode}</p></div>
          <div className="stat-badge md:col-span-2"><span className="text-xs uppercase tracking-[0.2em] text-slate-400">Worker address</span><p className="mt-1 text-slate-100">{booking.workerId?.Street}, {booking.workerId?.mandal}, {booking.workerId?.district}, {booking.workerId?.state}, {booking.workerId?.country}, {booking.workerId?.pinCode}</p></div>
          <div className="stat-badge"><span className="text-xs uppercase tracking-[0.2em] text-slate-400">Time slot</span><p className="mt-1 text-slate-100">{slotTime}</p></div>
          <div className="stat-badge"><span className="text-xs uppercase tracking-[0.2em] text-slate-400">Booking ID</span><p className="mt-1 break-all text-slate-100">{booking._id}</p></div>
        </div>

        <div className="mt-6 border-t border-white/10 pt-4">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-lg font-semibold text-white">Status timeline</h4>
            <button className="neo-button-secondary text-sm" onClick={() => exportReceipt(booking)}>
              Export Receipt
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {timeline.map((entry, timelineIndex) => (
              <div key={`${booking._id}-timeline-${timelineIndex}`} className="stat-badge">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-white capitalize">{entry.status}</p>
                  <p className="text-xs text-slate-400">{formatDate(entry.createdAt)}</p>
                </div>
                <p className="mt-1 text-sm text-slate-300">{entry.note || "Status update"}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="page-container py-4">
      <div className="page-hero mb-8">
        <span className="section-kicker">Booking info</span>
        <h2 className="section-title mt-3">Booking Information</h2>
        <p className="mt-2 text-slate-300">Review the accepted booking details in a clean, readable layout.</p>
      </div>
      <div className="mx-auto max-w-4xl">
          {bookings.map(renderBookingDetails)}
      </div>
    </div>
  );
}

function buildTimeline(booking) {
  if (Array.isArray(booking.statusHistory) && booking.statusHistory.length > 0) {
    return booking.statusHistory;
  }

  const fallback = [{ status: booking.status || "pending", note: "Current booking status", createdAt: booking.createdAt }];
  if (booking.jobAcceptedByWorker) fallback.push({ status: "accepted", note: "Worker accepted the booking", createdAt: booking.updatedAt || booking.createdAt });
  if (booking.jobRejectedByWorker) fallback.push({ status: "rejected", note: "Worker rejected the booking", createdAt: booking.updatedAt || booking.createdAt });
  if (booking.jobCompleted) fallback.push({ status: "completed", note: "Booking completed", createdAt: booking.updatedAt || booking.createdAt });
  return fallback;
}

function exportReceipt(booking) {
  const receipt = [
    "Fix It Now Booking Receipt",
    `Booking ID: ${booking._id}`,
    `Client: ${booking.clientId?.fullName || "N/A"}`,
    `Worker: ${booking.workerId?.fullName || "N/A"}`,
    `Service: ${booking.jobId?.job || "N/A"}`,
    `Date: ${booking.slotDate ? formatDate(booking.slotDate) : "N/A"}`,
    `Time: ${booking.slotTime || "N/A"}`,
    `Status: ${booking.status || "pending"}`,
  ].join("\n");
  const blob = new Blob([receipt], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `booking-receipt-${booking._id}.txt`;
  link.click();
  URL.revokeObjectURL(url);
}

export default Booking_form;