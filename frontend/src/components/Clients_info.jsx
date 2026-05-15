import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../lib/api";


function Clients_info(){

 const token = localStorage.getItem("token");
  const [workerInfo, setWorkerInfo] = useState([]);
  const [filteredWorkers, setFilteredWorkers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("name-asc");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const get_all_worker_info = async () => {
    try {
      const res = await api.get("/api/admin/client_info", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.workerInfo) {
        setWorkerInfo(res.data.workerInfo);
        setFilteredWorkers(res.data.workerInfo); 
      } else {
        setError(res.data.message || "No workers found");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    get_all_worker_info();
  }, []);
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredWorkers(workerInfo);
    } else {
      const lower = searchTerm.toLowerCase();
      const filtered = workerInfo.filter(
        (worker) =>
          worker.email?.toLowerCase().includes(lower) ||
          worker.fullName?.toLowerCase().includes(lower) ||
          worker._id?.toLowerCase().includes(lower)
      );
      setFilteredWorkers(filtered);
    }
  }, [searchTerm, workerInfo]);

  const visibleClients = [...filteredWorkers].sort((a, b) => {
    if (sortBy === "name-desc") return (b.fullName || "").localeCompare(a.fullName || "");
    if (sortBy === "email-asc") return (a.email || "").localeCompare(b.email || "");
    if (sortBy === "email-desc") return (b.email || "").localeCompare(a.email || "");
    return (a.fullName || "").localeCompare(b.fullName || "");
  });

  if (loading) return <div className="page-container py-20 text-center text-slate-200">Loading client info...</div>;
  if (error) return <div className="page-container py-10"><div className="glass-card-soft mx-auto max-w-2xl border border-rose-400/30 bg-rose-500/10 p-5 text-rose-100">{error}</div></div>;

  return (
    <div className="page-container py-4">
      <div className="page-hero mb-6">
        <span className="section-kicker">Admin panel</span>
        <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="section-title">All clients</h1>
            <p className="mt-2 text-slate-300">Manage and review client profiles and bookings.</p>
          </div>
          <div className="stat-badge text-center">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Total</div>
            <div className="text-2xl font-black text-emerald-300">{workerInfo.length}</div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <input
          type="text"
          className="neo-input w-full lg:w-96"
          placeholder="🔍 Search by name, email, or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="mb-6">
        <select className="neo-input w-full lg:w-96" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="name-asc">Sort by name A-Z</option>
          <option value="name-desc">Sort by name Z-A</option>
          <option value="email-asc">Sort by email A-Z</option>
          <option value="email-desc">Sort by email Z-A</option>
        </select>
      </div>

      {visibleClients.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleClients.map((worker, index) => (
            <div className="glass-card-soft overflow-hidden p-0" key={worker._id || index}>
              <div className="flex flex-col items-center bg-gradient-to-b from-slate-700/30 to-slate-800/20 p-6">
                <img
                  src={
                    worker.profilePic ||
                    "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                  }
                  alt={worker.fullName}
                  className="h-20 w-20 rounded-full border-2 border-emerald-400/50 object-cover"
                />
                <h3 className="mt-3 text-xl font-bold text-white">{worker.fullName}</h3>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mt-1">Client</p>
              </div>
              <div className="p-5">
                <div className="space-y-3">
                  <div className="stat-badge">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Email</p>
                    <p className="mt-1 break-all text-sm text-slate-100">{worker.email}</p>
                  </div>
                  <div className="stat-badge">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Phone</p>
                    <p className="mt-1 text-sm text-slate-100">{worker.mobileNum || "N/A"}</p>
                  </div>
                  <div className="stat-badge">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">ID</p>
                    <p className="mt-1 break-all text-xs text-slate-300">{worker._id}</p>
                  </div>
                </div>
                <Link to='/user_profile' state={{ userId: worker._id, show_review: false }} className="neo-button w-full mt-4 block text-center">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card-soft p-8 text-center text-slate-300">No matching clients found</div>
      )}
    </div>
    )
}
export default Clients_info;