import { useState } from "react";
import { api } from "../lib/api";
import { toast } from "react-toastify";

function Report_worker_modal({ workerId, workerName, onClose }) {
  const token = localStorage.getItem("token");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reasons = [
    "Unprofessional behavior",
    "Poor quality work",
    "Non-responsive/unavailable",
    "Inappropriate conduct",
    "Missed appointment",
    "Overcharging",
    "Other",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reason) {
      toast.error("Please select a reason");
      return;
    }

    try {
      setSubmitting(true);
      await api.post(
        "/api/admin/report_worker",
        { workerId, reason, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Complaint filed successfully. Admin will review it.");
      setReason("");
      setDescription("");
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to file complaint");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass-card-soft w-full max-w-md p-6 mx-4 max-h-[90vh] overflow-y-auto">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Report Worker</h2>
          <button
            onClick={onClose}
            className="text-xl text-slate-400 hover:text-slate-200"
          >
            ✕
          </button>
        </div>

        <p className="mb-4 text-sm text-slate-300">
          Report an issue with <span className="font-semibold">{workerName}</span> regarding a completed job. Our admin team
          will review your complaint carefully and take appropriate action.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Reason Selection */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Reason for Complaint *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="neo-input w-full"
            >
              <option value="">-- Select a reason --</option>
              {reasons.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Additional Details (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="neo-input w-full resize-none"
              rows="4"
              placeholder="Describe what happened in detail..."
            />
            <p className="mt-1 text-xs text-slate-400">
              {description.length}/500 characters
            </p>
          </div>

          {/* Info Box */}
          <div className="rounded-lg border border-cyan-400/20 bg-cyan-500/5 p-3">
            <p className="text-xs text-cyan-200">
              <span className="font-semibold">ℹ️ Note:</span> False reports may result in action
              against your account. Be truthful and specific.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="neo-button flex-1 bg-slate-700/30 text-slate-300 hover:bg-slate-700/50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !reason}
              className="neo-button flex-1 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Filing..." : "File Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Report_worker_modal;
