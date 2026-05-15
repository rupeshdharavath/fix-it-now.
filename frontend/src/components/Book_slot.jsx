import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";

function Book_slot() {
  const navigate=useNavigate();
  const location = useLocation();
  const jobId = location.state?.jobId || "";
  const bookingId = location.state?.bookingId || "";
  const initialSlotDate = location.state?.initialSlotDate || "";
  const initialSlotTime = location.state?.initialSlotTime || "";
  const token = localStorage.getItem("token");

  const [slotDate, setSlotDate] = useState(initialSlotDate);
  const [slotTime, setSlotTime] = useState(initialSlotTime);

  const timeSlots = ["9 A.M - 12 A.M", "12 A.M - 3 P.M", "3 P.M - 6 P.M", "6 P.M - 9 P.M"];
  const isReschedule = Boolean(bookingId);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!slotDate || !slotTime) {
      toast.warn("Please select both date and time slot");
      return;
    }

    try {
      if (isReschedule) {
        await axios.put(
          `http://localhost:3000/api/booking/reschedule/${bookingId}`,
          { slotDate, slotTime },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Booking rescheduled successfully!");
      } else {
        await axios.post(
          "http://localhost:3000/api/booking/create",
          { jobId, slotDate, slotTime },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Slot booked successfully!");
      }
      setTimeout(()=>{
        navigate('/pending_requests');
      },1500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to save booking");
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-lg p-4">
            <h3 className="text-center mb-4">{isReschedule ? "Reschedule Slot" : "Select Slot"}</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Select Date</label>
               <input
                type="date"
                className="form-control"
                value={slotDate}
                onChange={(e) => setSlotDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]} 
              />

              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Select Time Slot</label>
                <select
                  className="form-select"
                  value={slotTime}
                  onChange={(e) => setSlotTime(e.target.value)}
                >
                  <option value="">-- Select Time Slot --</option>
                  {timeSlots.map((slot, index) => (
                    <option key={index} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-center">
                  <button type="submit" className="btn btn-success w-50 shadow-sm">
                    {isReschedule ? "Reschedule" : "Book Slot"}
                </button>
              </div>
            </form>
          </div>
        </div>
    </div>
    <ToastContainer position="top-right" autoClose={1000}/>
    </div>
  )
}
export default Book_slot;
