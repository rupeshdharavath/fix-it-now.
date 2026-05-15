import { Link } from "react-router-dom";
import { isLoggedIn } from "../utils/authUtils";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { api } from "../lib/api";

function Home() {
  const loggedIn = isLoggedIn();
  const token = localStorage.getItem("token");
  const user_role = localStorage.getItem("role");
  const CLIENT_HOME_FILTERS_KEY = "client_home_filters";

  const defaultClientFilters = {
    slotDate: "",
    slotTime: "",
    search: "",
    dateTimeSelected: false,
  };

  const readClientFilters = () => {
    try {
      const raw = localStorage.getItem(CLIENT_HOME_FILTERS_KEY);
      if (!raw) return defaultClientFilters;

      const parsed = JSON.parse(raw);
      const todayISO = new Date().toISOString().split("T")[0];
      const hasValidDate = parsed?.slotDate && parsed.slotDate >= todayISO;

      if (!hasValidDate) return defaultClientFilters;

      return {
        slotDate: parsed?.slotDate || "",
        slotTime: parsed?.slotTime || "",
        search: parsed?.search || "",
        dateTimeSelected: Boolean(
          parsed?.dateTimeSelected && parsed?.slotDate && parsed?.slotTime
        ),
      };
    } catch (err) {
      return defaultClientFilters;
    }
  };

  const initialClientFilters =
    user_role === "client" ? readClientFilters() : defaultClientFilters;

  const [pendingRequests,setPendingRequests]=useState([]);
  const [appData, setAppData] = useState([]);
  const [userData, setUserData] = useState(null);
  const [search, setSearch] = useState(initialClientFilters.search);
  const [workerjob, setworkerjob] = useState([]);
  const [searchQuery,setSearchQuery]=useState("");
  
  // Date and time filter for clients
  const [slotDate, setSlotDate] = useState(initialClientFilters.slotDate);
  const [slotTime, setSlotTime] = useState(initialClientFilters.slotTime);
  const [dateTimeSelected, setDateTimeSelected] = useState(initialClientFilters.dateTimeSelected);
  
  const timeSlots = [
    "9 AM to 12 PM",
    "12 PM to 3 PM",
    "3 PM to 6 PM",
    "6 PM to 9 PM",
  ];
  
  const today = new Date().toISOString().split('T')[0];
  
  const handleDateTimeFilter = async (e) => {
    e.preventDefault();
    if (slotDate && slotTime) {
      setDateTimeSelected(true);
      await fetchAvailableWorkers(slotDate, slotTime, search);
    }
  };
  
  const resetDateTimeFilter = () => {
    setSlotDate("");
    setSlotTime("");
    setDateTimeSelected(false);
    setSearch("");
    setworkerjob([]);
  };

  const activeWorkerJobs = (appData || []).filter(
    (app) => app.jobAccepted === true && app.jobRejected === false
  );

  const pendingApprovalCount = (pendingRequests || []).length;
  const activeWorkersCount = (workerjob || []).filter((job) => job.userId?.isActive === true).length;

  const quickLinks = {
    worker: [
      ["My Applications", "/pending_worker_jobs"],
      ["Rejected Applications", "/rejected_worker_jobs"],
      ["Pending Offers", "/job_offers"],
      ["Confirmed Jobs", "/Accept_job_offers"],
      ["Declined Offers", "/rejected_job_offers"],
      ["Completed Work", "/completed_jobs"],
    ],
    client: [
      ["Hired Workers", "/recruited"],
      ["Pending Approvals", "/pending_requests"],
      ["Rate Workers", "/write_review"],
    ],
    admin: [
      ["Job Approvals", "/"],
      ["Approved Jobs", "/accepted_applications"],
      ["Rejected Jobs", "/rejected_applications"],
      ["All Workers", "/workers_info"],
      ["All Clients", "/clients_info"],
      ["User Management", "/admin_management"],
      ["Approve Hiring", "/allot_worker"],
      ["Complaint Reports", "/admin_complaints"],
    ],
  };

  const renderQuickLink = ([label, to]) => (
    <Link key={to} to={to} className="neo-button-secondary text-sm">
      {label}
    </Link>
  );

  const display_applyed_jobs = async () => {
    try {
      const res = await api.get("/api/worker/display_accepted_jobs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserData(res.data.userData || null);
      setAppData(res.data.appData || []);
    } catch (err) {
      alert(err.message);
    }
  };

  const delete_job_worker = async(appId)=>{
    try{
      const res=await api.delete(`/api/worker/delete_job_worker/${appId}`,{
        headers:{Authorization:`Bearer ${token}`}
      })
      display_applyed_jobs();
    }catch(err){
    }
  }

  const fetchAvailableWorkers = async (selectedDate, selectedTime, searchTerm = "") => {
    try {
      const res = await api.get("/api/worker/get_available_workers", {
        params: {
          slotDate: selectedDate,
          slotTime: selectedTime,
          search: searchTerm,
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      setworkerjob(res.data.workerjob || []);
    } catch (err) {
      setworkerjob([]);
    }
  };

  const search_for_jobs = async (query) => {
    if (!dateTimeSelected || !slotDate || !slotTime) {
      return;
    }
    await fetchAvailableWorkers(slotDate, slotTime, query || "");
  };

  const display_pending_jobs = async(e)=>{
    try{
      const res=await api.get("/api/admin/display_pending_jobs",{
        headers:{Authorization:`Bearer ${token}`}
      });
      setPendingRequests(res.data.pendingRequests || []);
    }catch(err){
    }
  }

  async function Accept_job_application(requestId){
    try{
      const res=await api.post('/api/admin/accept_application',{requestId},{
        headers:{Authorization:`Bearer ${token}`}
      })
      toast.success("Application approved");
      setTimeout(()=>{
        display_pending_jobs();
      },500);
    }catch(err){
    }
  }

  async function reject_job_application(requestId) {
    try{
      const res=await api.post('/api/admin/reject_application',{requestId},{
        headers:{Authorization:`Bearer ${token}`}
      })
      toast.success("Application rejected");
      setTimeout(()=>{
        display_pending_jobs();
      },500);
    }catch(err){
    }
  }

  const search_bar = async (query) => {
    if (!query) {
      display_pending_jobs();
      return;
    }
    try {
      const res = await api.get("/api/admin/search_job_pending", {
        params: { searchQuery: query },
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingRequests(res.data.getAcceptedWorkers || []);
    } catch (err) {
      setPendingRequests([]);
    }
  };
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      search_bar(searchQuery.toLowerCase());
    }, 200); 
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);
  

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      search_for_jobs(search);
    }, 150);
    return () => clearTimeout(delayDebounce);
  }, [search, dateTimeSelected, slotDate, slotTime]);

  useEffect(() => {
    if (user_role !== "client") return;

    localStorage.setItem(
      CLIENT_HOME_FILTERS_KEY,
      JSON.stringify({
        slotDate,
        slotTime,
        search,
        dateTimeSelected,
      })
    );
  }, [user_role, slotDate, slotTime, search, dateTimeSelected]);

  useEffect(() => {
    if (user_role === "worker") display_applyed_jobs();
    else if (user_role === "admin") display_pending_jobs();
  }, []);

  const renderJobCard = (job, index) => (
    <div className="glass-card-soft overflow-hidden p-0" key={job._id || index}>
      <div className="relative h-44 overflow-hidden bg-slate-900/60">
        <img
          src={job.userId?.profilePic || "/bg.webp"}
          alt={job.userId?.fullName || "worker"}
          className="h-full w-full object-cover transition duration-500 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
        <div className="absolute bottom-3 left-3 rounded-full bg-black/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100 backdrop-blur-md">
          {job.job || "Service"}
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Worker</p>
            <h3 className="text-xl font-bold text-white">{job.userId?.fullName || "Unknown"}</h3>
          </div>
          <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
            Active
          </span>
        </div>

        <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-300">
          {job.jobDescription || "No description provided for this service yet."}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-200">
          <div className="stat-badge">
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Location</p>
            <p className="mt-1">{job.userId?.district || "N/A"}</p>
          </div>
          <div className="stat-badge">
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Status</p>
            <p className="mt-1">Available for selected slot</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            className="neo-button flex-1 min-w-[120px]"
            state={{ jobId: job._id, slotDate, slotTime }}
            to="/view_worker_application"
          >
            Hire now
          </Link>
          <Link
            className="neo-button-secondary flex-1 min-w-[120px]"
            state={{ userId: job.userId._id,show_review:true }}
            to="/user_profile"
          >
            View profile
          </Link>
        </div>
      </div>
    </div>
  );

  const renderPendingCard = (requests, index) => (
    <div className="glass-card-soft p-5" key={requests._id || index}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Applicant</p>
          <Link
            to='/user_profile'
            state={{userId:requests.userId._id,show_review:false }}
            className="text-xl font-bold text-white hover:text-cyan-200"
          >
            {requests.userId.fullName}
          </Link>
        </div>
        <span className="rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-200">
          Pending
        </span>
      </div>

      <p className="mt-4 text-sm uppercase tracking-[0.2em] text-slate-400">Job</p>
      <p className="text-lg font-semibold text-white">{requests.job}</p>

      <div className="mt-5 flex flex-wrap gap-3">
        <button className="neo-button flex-1 min-w-[120px]" onClick={()=>Accept_job_application(requests._id)}>
          Accept
        </button>
        <button className="neo-button-danger flex-1 min-w-[120px]" onClick={()=>reject_job_application(requests._id)}>
          Reject
        </button>
      </div>
    </div>
  );

  return (
    <>
      {!loggedIn ? (
        <div className="page-container flex min-h-[calc(100vh-8rem)] items-center justify-center py-10">
          <div className="glass-card-soft max-w-md p-8 text-center">
            <p className="section-kicker mx-auto w-fit">Authentication required</p>
            <h2 className="mt-4 text-3xl font-black text-white">Please login first</h2>
            <p className="mt-3 text-slate-300">Your dashboard, jobs, and bookings will appear here once you're signed in.</p>
            <Link to="/login" className="neo-button mt-6 inline-flex">
              Go to login
            </Link>
          </div>
        </div>
      ) : user_role === "worker" ? (
        <div className="page-container py-4">
          <div className="page-hero mb-6">
            <span className="section-kicker">Worker dashboard</span>
            <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="section-title">Applied & accepted jobs</h1>
                <p className="mt-2 text-slate-300">Track the jobs you’ve applied for and the ones already approved.</p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="stat-badge text-center">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Applied</div>
                  <div className="text-2xl font-black text-white">{(appData || []).length}</div>
                </div>
                <div className="stat-badge text-center">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Accepted</div>
                  <div className="text-2xl font-black text-emerald-300">{activeWorkerJobs.length}</div>
                </div>
                <div className="stat-badge text-center sm:col-span-1">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Profile</div>
                  <div className="text-2xl font-black text-cyan-300">{userData?.fullName || "You"}</div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {quickLinks.worker.map(renderQuickLink)}
            </div>
          </div>

          <div className="mt-8 mb-6">
            <Link
              to="/apply_for_job"
              className="neo-button inline-flex items-center gap-2 px-6 py-3 text-lg font-bold"
            >
              <span>➕</span>
              <span>Post a New Service</span>
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {activeWorkerJobs.length > 0 ? (
              activeWorkerJobs.map((app, index) => (
                <div className="glass-card-soft p-5" key={app._id || index}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Applied job</p>
                      <h3 className="text-2xl font-bold text-white">{app.job}</h3>
                    </div>
                    <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                      Accepted
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="stat-badge">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Worker</p>
                      <p className="mt-1 text-slate-100">{userData?.fullName || "—"}</p>
                    </div>
                    <div className="stat-badge">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Status</p>
                      <p className="mt-1 text-slate-100">Approved for work</p>
                    </div>
                  </div>

                  <div className="mt-5 flex justify-end">
                    <button className="neo-button-danger" onClick={()=>delete_job_worker(app._id)}>
                      Remove
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="glass-card-soft md:col-span-2 xl:col-span-3 p-8 text-center text-slate-300">
                No approved jobs yet. Keep applying and they’ll show up here.
              </div>
            )}
          </div>
        </div>
      ) : user_role === "client" ? (
        <div className="page-container py-4">
  <div className="page-hero mb-6">
    <span className="section-kicker">Client dashboard</span>

    <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 className="section-title">
          Choose a worker and book faster
        </h1>
        <p className="mt-2 text-slate-300">
          Select date & time first, then search workers by service.
        </p>
      </div>

      <div className="stat-badge text-center">
        <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
          Active workers
        </div>
        <div className="text-2xl font-black text-cyan-300">
          {activeWorkersCount}
        </div>
      </div>
    </div>

    <div className="mt-6 flex flex-wrap gap-3">
      {quickLinks.client.map(renderQuickLink)}
    </div>
  </div>

  {/* DATE & TIME FIRST */}
  <div className="glass-card-soft mb-6 p-6">
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span>📅</span> Select Booking Date & Time
        </h3>

        <p className="text-sm text-slate-400 mt-1">
          Pick your preferred slot before choosing a worker
        </p>
      </div>

      {dateTimeSelected && (
        <button
          onClick={resetDateTimeFilter}
          className="text-xs px-3 py-1 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-200 transition"
        >
          Reset
        </button>
      )}
    </div>

    <form
      onSubmit={handleDateTimeFilter}
      className="grid md:grid-cols-3 gap-4"
    >
      {/* DATE */}
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

      {/* TIME */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
          Time Slot
        </label>

        <select
          value={slotTime}
          onChange={(e) => setSlotTime(e.target.value)}
          className="neo-input"
        >
          <option value="">Select time...</option>

          {timeSlots.map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </select>
      </div>

      {/* BUTTON */}
      <div className="flex items-end">
        <button
          type="submit"
          disabled={!slotDate || !slotTime}
          className="neo-button w-full"
        >
          Search Available Workers
        </button>
      </div>
    </form>
  </div>

  {/* SEARCH BAR BELOW DATE/TIME */}
  {dateTimeSelected && (
    <div className="glass-card-soft mb-8 p-5">
      <label className="block text-sm font-semibold text-slate-300 mb-3">
        🔎 Search by Job Type
      </label>

      <input
        type="text"
        className="neo-input"
        placeholder="Electrician, Plumber, Carpenter..."
        value={search || ""}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  )}

  {/* WORKERS */}
  {!dateTimeSelected ? (
    <div className="glass-card-soft md:col-span-full p-8 text-center">
      <p className="text-slate-300 text-lg mb-2">
        Please select date & time first
      </p>

      <p className="text-slate-400 text-sm">
        Workers will appear after selecting booking slot
      </p>
    </div>
  ) : (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {(workerjob || []).length > 0 ? (
        (workerjob || [])
          .filter((job) => job.userId?.isActive === true)
          .map((job, index) => (
            <div key={job._id || index}>
              {renderJobCard(job, index)}
            </div>
          ))
      ) : (
        <div className="glass-card-soft md:col-span-2 xl:col-span-3 p-8 text-center text-slate-300">
              No workers available for this date and slot
        </div>
      )}
    </div>
  )}
</div>
      ) : (
        <div className="page-container py-4">
          <div className="page-hero mb-6">
            <span className="section-kicker">Admin dashboard</span>
            <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="section-title">Pending approvals</h1>
                <p className="mt-2 text-slate-300">Review and approve job applications in a cleaner card-based layout.</p>
              </div>
              <div className="stat-badge text-center">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Pending</div>
                <div className="text-2xl font-black text-amber-300">{pendingApprovalCount}</div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {quickLinks.admin.map(renderQuickLink)}
            </div>

            <div className="mt-5 flex justify-center">
              <input
                type="text"
                className="neo-input max-w-2xl"
                placeholder="Search applications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {pendingRequests?.length > 0 ? (
              pendingRequests.map((requests, index) => renderPendingCard(requests, index))
            ) : (
              <div className="glass-card-soft md:col-span-2 xl:col-span-3 p-8 text-center text-slate-300">
                No pending jobs available
              </div>
            )}
          </div>
        </div>
      )}
      <ToastContainer position="top-right" autoClose={700}/>
    </>
  );
}

export default Home;
