import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { api } from "../lib/api";
import Report_worker_modal from "./Report_worker_modal";

const renderNumericRating = (rating) => {
  if (rating > 0) {
    return <span className="ml-1 font-bold text-emerald-300">{rating.toFixed(1)} / 5</span>;
  }
  return <span className="ml-1 text-slate-400">N/A</span>;
};

function User_profile() {
  const location = useLocation();
  const userId = location.state?.userId;
  const show_review = location.state?.show_review;
  const token = localStorage.getItem("token");
  const viewerRole = localStorage.getItem("role");
  const isAdminViewer = viewerRole === "admin";

  const [userData, setUserData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);
  
  const userRole = localStorage.getItem("role");
  const currentUserId = localStorage.getItem("user_id");

  // Check if current client has a completed booking with this worker
  const hasCompletedBooking = bookings.some(
    (booking) =>
      booking.jobCompleted === true &&
      booking.jobAcceptedByWorker === true &&
      booking.jobRejectedByWorker === false
  );
  const deactivate_account = async (userId) => {
    try {
      await api.get(
        `/api/admin/deactivateAccount/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      getUserProfile();
    } catch (err) {
    }
  };
  const activate_account = async (userId) => {
    try {
      await api.get(
        `/api/admin/activateAccount/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      getUserProfile();
    } catch (err) {
    }
  };

  const getUserProfile = async () => {
    try {
      const res = await api.get(
        `/api/admin/view_user_profile/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUserData(res.data.userdata);
      setBookings(res.data.bookings || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) getUserProfile();
  }, [userId]);

  const isClient = userData?.role?.toLowerCase() === "client";
  const bookingsTitle = show_review
    ? `Reviews for ${userData?.fullName}`
    : isClient
    ? "Jobs Hired by Client"
    : "Jobs Accepted by Worker";

  const renderBookingEntry = (booking, index, showReviewMode) => {
    const clientData = booking.clientId;
    if (
      !(
        booking.jobAcceptedByWorker === true &&
        booking.jobRejectedByWorker === false
      )
    )
      return null;

    if (showReviewMode) {
      if (!booking.review || booking.review.trim() === "") return null;
      const jobRating = booking.rating || 0;
      return (
        <tr key={booking._id || index}>
          <td className="align-middle text-break">{booking.jobId?.job}</td>
          <td className="align-middle">{clientData?.fullName || "N/A"}</td>
          <td className="align-middle">{renderNumericRating(jobRating)}</td>
          <td className="align-middle text-sm text-slate-200 review-cell">
            {booking.review.substring(0, 80)}...
          </td>
        </tr>
      );
    }

    const otherParty = isClient ? booking.workerId : booking.clientId;
    const partyLabel = isClient ? "Hired Worker" : "Recruited By";
    const partyRole = isClient ? "Worker" : "Client";
    const partyIdLabel = isClient ? "Worker ID" : "Client ID";

    return (
      <div key={booking._id || index} className="glass-card-soft overflow-hidden p-0">
        <div className="border-b border-white/10 bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Job Service</p>
              <h3 className="mt-1 text-lg font-bold text-white">
                {booking.jobId?.job || "Service"}
              </h3>
            </div>
            <div className="stat-badge text-right">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Status</p>
              <p className="mt-1 text-sm font-bold text-emerald-300">Confirmed</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {otherParty ? (
            <>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-3">{partyLabel}</p>
                <div className="flex items-center gap-4 bg-white/2 rounded-lg p-3 border border-white/5">
                  <img
                    src={
                      otherParty.profilePic ||
                      "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                    }
                    alt={partyRole}
                    className="h-12 w-12 rounded-full border border-white/10 object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {otherParty.fullName}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{otherParty.email}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="stat-badge">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Job ID</p>
                  <p className="mt-1 text-xs font-mono text-slate-100 truncate">
                    {booking.jobId?._id}
                  </p>
                </div>
                <div className="stat-badge">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Booking ID</p>
                  <p className="mt-1 text-xs font-mono text-slate-100 truncate">
                    {booking._id}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Link
                  to="/booking_form"
                  state={{ jobId: booking.jobId?._id }}
                  className="neo-button-secondary text-xs flex-1 text-center"
                >
                  View Job Details
                </Link>
                <Link
                  to="/booking_form"
                  state={{ jobId: booking._id }}
                  className="neo-button-secondary text-xs flex-1 text-center"
                >
                  View Booking
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <p className="text-slate-400 text-sm">
                No {partyRole.toLowerCase()} information available for this booking.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="page-container py-4">
      {loading ? (
        <h3 className="py-20 text-center text-slate-200">Loading user profile...</h3>
      ) : error ? (
        <h3 className="py-20 text-center text-rose-300">{error}</h3>
      ) : !userData ? (
        <h3 className="py-20 text-center text-rose-300">No user data found</h3>
      ) : (
        <>
          <div className="page-hero mb-6 p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              {isAdminViewer &&
                (userData?.isActive ? (
                  <button
                    className="neo-button-danger text-sm"
                    onClick={() => deactivate_account(userData._id)}
                  >
                    Deactivate Account
                  </button>
                ) : (
                  <button
                    className="neo-button text-sm"
                    onClick={() => activate_account(userData._id)}
                  >
                    Activate Account
                  </button>
                ))}
              {userRole === "client" && userData?.role === "worker" && currentUserId !== userId && hasCompletedBooking && (
                <button
                  className="neo-button bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-sm"
                  onClick={() => setShowReportModal(true)}
                >
                  🚩 Report Worker
                </button>
              )}
              {userRole === "client" && userData?.role === "worker" && currentUserId !== userId && !hasCompletedBooking && (
                <div className="text-xs text-slate-400 italic">
                  Report available after job completion
                </div>
              )}
            </div>

            <div className="text-center">
              <img
                src={
                  userData.profilePic ||
                  "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                }
                alt="User"
                className="mx-auto mb-3 h-32 w-32 rounded-full border border-white/10 object-cover shadow-xl"
              />
              <div className="flex justify-center align-items-center">
                <h4 className="text-3xl font-bold text-white">{userData.fullName}</h4>
              </div>
              <h6 className="text-slate-300">ID: {userData._id}</h6>
              <p className="text-cyan-200">{userData.role}</p>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <div className="stat-badge"><span className="text-xs uppercase tracking-[0.2em] text-slate-400">Email</span><p className="mt-1 break-all text-slate-100">{userData.email}</p></div>
              <div className="stat-badge"><span className="text-xs uppercase tracking-[0.2em] text-slate-400">Phone</span><p className="mt-1 text-slate-100">{userData.mobileNum || "N/A"}</p></div>
              <div className="stat-badge sm:col-span-2 xl:col-span-1"><span className="text-xs uppercase tracking-[0.2em] text-slate-400">Address</span><p className="mt-1 text-slate-100">{userData.Street}, {userData.mandal}, {userData.district}, {userData.state}, {userData.country}</p></div>
            </div>
          </div>

          <h3 className="mb-4 text-2xl font-bold text-white">{bookingsTitle}</h3>
          {show_review ? (
            <div className="app-table table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th style={{ width: "15%" }}>Job Name</th>
                    <th style={{ width: "15%" }}>Client Name</th>
                    <th style={{ width: "10%" }}>Rating</th>
                    <th style={{ width: "60%" }}>Review</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.length > 0 ? (
                    bookings.map((booking, index) =>
                      renderBookingEntry(booking, index, show_review)
                    )
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center text-slate-300">
                        No reviews available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {bookings.length > 0 ? (
                bookings.map((booking, index) =>
                  renderBookingEntry(booking, index, show_review)
                )
              ) : (
                <h5 className="text-center text-slate-300">
                  {isClient
                    ? "No jobs have been hired yet"
                    : "No jobs accepted yet"}
                </h5>
              )}
            </div>
          )}
        </>
      )}
      
      {showReportModal && (
        <Report_worker_modal
          workerId={userData._id}
          workerName={userData.fullName}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
}

export default User_profile;
