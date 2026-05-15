import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { toast } from "react-toastify";

function Allot_worker() {
  const token = localStorage.getItem("token");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/admin/pending_hire_requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(res.data.pendingRequests || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load pending requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const approveRequest = async (bookingId) => {
    try {
      setActionLoading(bookingId);
      await api.post(
        "/api/admin/approve_hire_request",
        { bookingId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Hire request approved! Worker and client notified.");
      fetchPendingRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve request");
    } finally {
      setActionLoading(null);
    }
  };

  const rejectRequest = async (bookingId) => {
    try {
      setActionLoading(bookingId);
      await api.post(
        "/api/admin/reject_hire_request",
        { bookingId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Hire request rejected. Client notified.");
      fetchPendingRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject request");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="page-container py-20 text-center text-slate-200">
        Loading pending hire requests...
      </div>
    );
  }

  return (
    <div className="page-container py-4">
      <div className="page-hero mb-6">
        <span className="section-kicker">Admin tools</span>
        <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="section-title">Pending hire requests</h1>
            <p className="mt-2 text-slate-300">
              Review and approve/reject hiring requests from clients when workers don't respond.
            </p>
          </div>
          <div className="stat-badge text-center">
            <div className="text-xs uppercase tracking-[0.2em] text-amber-400">Pending</div>
            <div className="text-2xl font-black text-amber-300">{requests.length}</div>
          </div>
        </div>
      </div>

      {requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request._id} className="glass-card-soft overflow-hidden p-0">
              <div className="grid gap-4 p-6 lg:grid-cols-[1fr_1fr_auto]">
                {/* Client Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <img
                      src={
                        request.clientId?.profilePic ||
                        "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                      }
                      alt={request.clientId?.fullName}
                      className="h-14 w-14 rounded-full border-2 border-cyan-400/50 object-cover"
                    />
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Client</p>
                      <h3 className="text-lg font-bold text-white">
                        {request.clientId?.fullName}
                      </h3>
                      <p className="text-sm text-slate-300">{request.clientId?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Worker & Job Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <img
                      src={
                        request.workerId?.profilePic ||
                        "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                      }
                      alt={request.workerId?.fullName}
                      className="h-14 w-14 rounded-full border-2 border-indigo-400/50 object-cover"
                    />
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        Worker (No response)
                      </p>
                      <h3 className="text-lg font-bold text-white">
                        {request.workerId?.fullName}
                      </h3>
                      <p className="text-sm text-slate-300">{request.workerId?.email}</p>
                    </div>
                  </div>

                  <div className="stat-badge mt-2">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Job</p>
                    <p className="mt-1 text-sm text-slate-100">{request.jobId?.job}</p>
                  </div>
                </div>

                {/* Booking Details & Actions */}
                <div className="flex flex-col gap-3 lg:items-end">
                  <div className="space-y-2 text-right text-sm">
                    <div className="stat-badge text-right">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                        Date
                      </p>
                      <p className="mt-1 text-slate-100">
                        {new Date(request.slotDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="stat-badge text-right">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                        Time
                      </p>
                      <p className="mt-1 text-slate-100">{request.slotTime}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
                    <button
                      onClick={() => approveRequest(request._id)}
                      disabled={actionLoading === request._id}
                      className="neo-button bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 disabled:opacity-50 whitespace-nowrap"
                    >
                      {actionLoading === request._id ? "Approving..." : "Approve"}
                    </button>
                    <button
                      onClick={() => rejectRequest(request._id)}
                      disabled={actionLoading === request._id}
                      className="neo-button bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 disabled:opacity-50 whitespace-nowrap"
                    >
                      {actionLoading === request._id ? "Rejecting..." : "Reject"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 bg-white/2 px-6 py-3">
                <p className="text-xs text-slate-400">
                  Requested on {new Date(request.createdAt).toLocaleDateString()} at{" "}
                  {new Date(request.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card-soft p-12 text-center">
          <p className="text-lg font-semibold text-white mb-2">No pending hire requests</p>
          <p className="text-slate-300">
            All hiring requests have been responded to by workers. Great job keeping things up to date!
          </p>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-8 glass-card-soft border border-cyan-400/20 bg-cyan-500/5 p-6">
        <h3 className="mb-3 text-lg font-bold text-cyan-300">How it works</h3>
        <ul className="space-y-2 text-sm text-slate-300">
          <li>
            ✓ <span className="font-semibold">Client hires a worker</span> → Booking request created
          </li>
          <li>
            ✓ <span className="font-semibold">Worker sees in Job Offers</span> → Can accept or reject
          </li>
          <li>
            ✓ <span className="font-semibold">No response after time</span> → Appears in this queue
          </li>
          <li>
            ✓ <span className="font-semibold">Admin approves on behalf</span> → Booking confirmed, both notified
          </li>
          <li>
            ✓ <span className="font-semibold">Or admin rejects</span> → Request cancelled, client notified
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Allot_worker;
