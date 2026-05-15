import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { api } from "../lib/api";

function View_worker_application() {
  const navigate = useNavigate();
  const location = useLocation();
  const { jobId, slotDate: preSelectedDate, slotTime: preSelectedTime } =
    location.state || {};
  const token = localStorage.getItem("token");

  const [slotDate, setSlotDate] = useState(preSelectedDate || "");
  const [slotTime, setSlotTime] = useState(preSelectedTime || "");
  const [jobData, setJobData] = useState(null);
  const [workerData, setWorkerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hireLoading, setHireLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const timeSlots = [
    "9 AM to 12 PM",
    "12 PM to 3 PM",
    "3 PM to 6 PM",
    "6 PM to 9 PM",
  ];

  useEffect(() => {
    if (!jobId) {
      setLoading(false);
      return;
    }

    const fetchWorkerApplication = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/worker/particular_worker_detail/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setJobData(res.data.appData || null);
        setWorkerData(res.data.userData || null);
      } catch (err) {
        toast.error("Failed to load worker application");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkerApplication();
  }, [jobId, token]);

  const hireWorker = async () => {
    if (!jobId) {
      toast.error("Invalid worker application");
      return;
    }

    if (!slotDate || !slotTime) {
      toast.error("Please select date and slot");
      return;
    }

    setHireLoading(true);
    try {
      await api.post(
        "/api/booking/create",
        { jobId, slotDate, slotTime },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Job request sent to worker");
      setTimeout(() => {
        navigate("/pending_requests");
      }, 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Worker is not available on this slot");
    } finally {
      setHireLoading(false);
    }
  };

  if (!jobId) {
    return (
      <div className="page-container py-10">
        <div className="glass-card-soft mx-auto max-w-3xl p-6 text-center">
          <h2 className="text-2xl font-bold text-white">No worker selected</h2>
          <p className="mt-2 text-slate-300">Please choose a worker from home first.</p>
          <Link className="neo-button mt-5 inline-flex" to="/">
            Back to Home
          </Link>
        </div>
        <ToastContainer position="top-right" autoClose={1000} />
      </div>
    );
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={1000} />
      <div className="page-container py-4">
        <div className="page-hero mb-6">
          <span className="section-kicker">Worker application</span>
          <h1 className="section-title mt-3">Review and hire worker</h1>
          <p className="mt-2 text-slate-300">Confirm date and slot, then send the job request.</p>
        </div>

        {loading ? (
          <div className="glass-card-soft p-8 text-center text-slate-200">Loading worker details...</div>
        ) : (
          <>
            <div className="glass-card-soft mb-6 p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="stat-badge">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Worker</p>
                  <p className="mt-1 text-lg text-white">{workerData?.fullName || "Unknown"}</p>
                </div>
                <div className="stat-badge">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Service</p>
                  <p className="mt-1 text-lg text-white">{jobData?.job || "N/A"}</p>
                </div>
                <div className="stat-badge md:col-span-2">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Application details</p>
                  <p className="mt-1 text-slate-200">{jobData?.jobDescription || "No description provided"}</p>
                </div>
              </div>
            </div>

            <div className="glass-card-soft mb-6 p-6">
              <h3 className="text-lg font-bold text-white">Select Date and Slot</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                    Date
                  </label>
                  <input
                    type="date"
                    min={today}
                    value={slotDate}
                    onChange={(e) => setSlotDate(e.target.value)}
                    className="neo-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                    Time Slot
                  </label>
                  <select
                    value={slotTime}
                    onChange={(e) => setSlotTime(e.target.value)}
                    className="neo-input"
                  >
                    <option value="">Select slot...</option>
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="neo-button" onClick={hireWorker} disabled={hireLoading}>
                {hireLoading ? "Sending request..." : "Hire"}
              </button>
              <Link className="neo-button-secondary" to="/">
                Back
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default View_worker_application;
