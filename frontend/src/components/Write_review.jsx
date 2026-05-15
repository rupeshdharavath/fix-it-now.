import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { ToastContainer,toast } from "react-toastify";
import { api } from "../lib/api";

function Write_review() {
  const location = useLocation();
  const navigate=useNavigate();
  const token = localStorage.getItem("token");
  const { bookingId } = location.state || {};
  const [worker_details, setWorker_details] = useState(null);

  const [rating, setRating] = useState(0);  
  const [comment, setComment] = useState("");

  const fetch_worker_details_for_review = async () => {
    try {
      const res = await api.get("/api/reviews/fetch_details", {
        params: { bookingId },
        headers: { Authorization: `Bearer ${token}` },
      });
      setWorker_details(res.data.worker_details);
    } catch (err) {
    }
  };

  useEffect(() => {
    if (bookingId) fetch_worker_details_for_review();
  }, [bookingId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/api/reviews/create", {
        bookingId,
        rating,
        comment,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success("Review submitted successfully!");
      setTimeout(()=>{
        navigate('/recruited');
      },2000);
      setRating(0);
      setComment("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to submit review");
    }
  };

  return (
   <>
  <div className="container mt-5 d-flex justify-content-center">
    {worker_details ? (
      <div className="card p-4 shadow-lg w-75" style={{ borderRadius: "15px" }}>
        <h3 className="text-center mb-4">Write a Review</h3>

        <div className="mb-3">
          <p className="mb-1"><strong>Booking ID:</strong> {bookingId}</p>
          <p className="mb-1"><strong>Worker:</strong> {worker_details.workerId?.fullName}</p>
          <p className="mb-3"><strong>Job:</strong> {worker_details.jobId?.job}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="mb-2 d-block"><strong>Rate this worker:</strong></label>
          <div className="mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                onClick={() => setRating(star)}
                style={{
                  cursor: "pointer",
                  fontSize: "30px",
                  marginRight: "5px",
                  color: star <= rating ? "#FFD700" : "#ccc",
                  transition: "color 0.2s"
                }}
              >
                ★
              </span>
            ))}
          </div>
          <div className="mb-3">
            <label className="d-block mb-1"><strong>Your Review:</strong></label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows="4"
              className="neo-input"
              placeholder="Write your feedback..."
              required
              style={{ borderRadius: "10px" }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            style={{ borderRadius: "10px", padding: "10px", fontSize: "16px" }}
          >
            Submit Review
          </button>
        </form>
      </div>
    ) : (
      <p className="text-center mt-5">Loading worker details...</p>
    )}
    <ToastContainer position="top-right" autoClose={1000}/>
  </div>
</>

  );
}

export default Write_review;
