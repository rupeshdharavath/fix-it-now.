import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { toast } from "react-toastify";

function Admin_complaints() {
  const token = localStorage.getItem("token");
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState(null);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/admin/complaints", {
        params: statusFilter !== "all" ? { status: statusFilter } : {},
        headers: { Authorization: `Bearer ${token}` },
      });
      setComplaints(res.data.complaints || []);
      setFilteredComplaints(res.data.complaints || []);
    } catch (err) {
      toast.error("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter]);

  const resolveComplaint = async (workerId, complaintIndex, action) => {
    try {
      await api.post(
        "/api/admin/resolve_complaint",
        { workerId, complaintIndex, action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Complaint ${action === 'dismiss' ? 'dismissed' : 'resolved'}`);
      fetchComplaints();
    } catch (err) {
      toast.error("Failed to resolve complaint");
    }
  };

  if (loading) {
    return (
      <div className="page-container py-20 text-center text-slate-200">
        Loading complaints...
      </div>
    );
  }

  const pendingCount = complaints.filter((c) => c.status === "pending").length;
  const resolvedCount = complaints.filter((c) => c.status === "resolved").length;
  const dismissedCount = complaints.filter((c) => c.status === "dismissed").length;

  return (
    <div className="page-container py-4">
      <div className="page-hero mb-6">
        <span className="section-kicker">Admin oversight</span>
        <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="section-title">Worker complaints</h1>
            <p className="mt-2 text-slate-300">
              Review and manage complaints filed by clients against workers.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="stat-badge text-center">
              <div className="text-xs uppercase tracking-[0.2em] text-amber-400">Pending</div>
              <div className="text-2xl font-black text-amber-300">{pendingCount}</div>
            </div>
            <div className="stat-badge text-center">
              <div className="text-xs uppercase tracking-[0.2em] text-emerald-400">
                Resolved
              </div>
              <div className="text-2xl font-black text-emerald-300">{resolvedCount}</div>
            </div>
            <div className="stat-badge text-center">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Dismissed</div>
              <div className="text-2xl font-black text-slate-300">{dismissedCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="mb-6 flex gap-2">
        {["all", "pending", "resolved", "dismissed"].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`neo-button px-4 py-2 text-sm capitalize ${
              statusFilter === status
                ? "bg-cyan-500/20 text-cyan-300"
                : "bg-slate-700/30 text-slate-300 hover:bg-slate-700/50"
            }`}
          >
            {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {complaints.length > 0 ? (
        <div className="space-y-4">
          {complaints.map((complaint, idx) => (
            <div
              key={idx}
              className="glass-card-soft overflow-hidden border border-white/5"
            >
              <div
                onClick={() =>
                  setExpandedIndex(expandedIndex === idx ? null : idx)
                }
                className="cursor-pointer select-none p-5 transition-colors hover:bg-white/5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-white">
                        {complaint.workerName}
                      </h3>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          complaint.status === "pending"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-400/30"
                            : complaint.status === "resolved"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                            : "bg-slate-500/20 text-slate-300 border border-slate-400/30"
                        }`}
                      >
                        {complaint.status.charAt(0).toUpperCase() +
                          complaint.status.slice(1)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-300">
                      <span className="font-semibold text-slate-200">Reason:</span> {complaint.reason}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Filed by {complaint.clientId} on{" "}
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-2xl">
                    {expandedIndex === idx ? "▼" : "▶"}
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedIndex === idx && (
                <div className="border-t border-white/10 bg-white/2 p-5">
                  <div className="mb-4 space-y-3">
                    <div className="stat-badge">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                        Worker Email
                      </p>
                      <p className="mt-1 break-all text-sm text-slate-100">
                        {complaint.workerEmail}
                      </p>
                    </div>
                    <div className="stat-badge">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                        Description
                      </p>
                      <p className="mt-1 text-sm text-slate-100">
                        {complaint.description || "No additional details provided"}
                      </p>
                    </div>
                  </div>

                  {complaint.status === "pending" && (
                    <div className="flex gap-3 pt-4 border-t border-white/10">
                      <button
                        onClick={() =>
                          resolveComplaint(complaint.workerId, 0, "resolve")
                        }
                        className="neo-button flex-1 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                      >
                        ✓ Resolve Issue
                      </button>
                      <button
                        onClick={() =>
                          resolveComplaint(complaint.workerId, 0, "dismiss")
                        }
                        className="neo-button flex-1 bg-slate-500/20 text-slate-300 hover:bg-slate-500/30"
                      >
                        ✗ Dismiss
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card-soft p-8 text-center text-slate-300">
          {statusFilter === "pending"
            ? "No pending complaints"
            : `No ${statusFilter} complaints`}
        </div>
      )}
    </div>
  );
}

export default Admin_complaints;
