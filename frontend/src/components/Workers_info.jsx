import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../lib/api";

function Workers_info() {
  const token = localStorage.getItem("token");
  const [workerInfo, setWorkerInfo] = useState([]);
  const [filteredWorkers, setFilteredWorkers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name-asc");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const get_all_worker_info = async () => {
    try {
      const res = await api.get("/api/admin/worker_info", {
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
          worker.fullName?.toLowerCase().includes(lower)||
          worker._id?.toLowerCase().includes(lower)
      );
      setFilteredWorkers(filtered);
    }
  }, [searchTerm, workerInfo]);

  const visibleWorkers = [...filteredWorkers].sort((a, b) => {
    if (sortBy === "name-desc") return (b.fullName || "").localeCompare(a.fullName || "");
    if (sortBy === "email-asc") return (a.email || "").localeCompare(b.email || "");
    if (sortBy === "email-desc") return (b.email || "").localeCompare(a.email || "");
    return (a.fullName || "").localeCompare(b.fullName || "");
  });
  if (loading) return <h3 className="text-center mt-4">Loading worker info...</h3>;
  if (error) return <h3 className="text-center mt-4 text-danger">{error}</h3>;
  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">All Workers</h2>
      <div className="d-flex justify-content-center">
        <input
          type="text"
          className="form-control w-50 shadow-lg mb-4"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="d-flex justify-content-center mb-4">
        <select className="form-select w-50 shadow-lg" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="name-asc">Sort by name A-Z</option>
          <option value="name-desc">Sort by name Z-A</option>
          <option value="email-asc">Sort by email A-Z</option>
          <option value="email-desc">Sort by email Z-A</option>
        </select>
      </div>
      <div className="row">
        {visibleWorkers.length > 0 ? (
          visibleWorkers.map((worker, index) => (
            <div className="col-md-4 mb-4" key={worker._id || index}>
              <div className="card shadow-lg border-0 h-100">
                <div className="card-body text-center">
                  <img
                    src={
                      worker.profilePic ||
                      "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                    }
                    alt="Worker"
                    className="rounded-circle mb-3"
                    style={{ width: "100px", height: "100px", objectFit: "cover" }}
                  />
                  <h5 className="card-title">{worker.fullName}</h5>
                  <p className="card-text text-muted">{worker.role}</p>
                  <p className="mb-1">
                    <strong>Email:</strong> {worker.email}
                  </p>
                  <p className="mb-1">
                    <strong>Phone:</strong> {worker.mobileNum}
                  </p>
                  <Link to='/user_profile' state={{ userId: worker._id,show_review:false }} className="fs-5 fw-bold" style={{ textDecoration: "none" }}>View Details..</Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <h4 className="text-center">No matching workers found</h4>
        )}
      </div>
    </div>
  );
}

export default Workers_info;
