import { useEffect, useState } from "react";
import { api } from "../lib/api";

function Notifications() {
  const token = localStorage.getItem("token");
  const isAdmin = localStorage.getItem("role") === "admin";
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/notifications/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markRead = async (notificationId, refresh = true) => {
    try {
      await api.put(
        `/api/notifications/read/${notificationId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) =>
          notification._id === notificationId ? { ...notification, read: true } : notification
        )
      );
      setUnreadCount((currentCount) => Math.max(0, currentCount - 1));
      window.dispatchEvent(new Event("notifications-updated"));
      if (refresh) {
        await fetchNotifications();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const markAllRead = async () => {
    try {
      await api.put(
        "/api/notifications/read-all",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
      window.dispatchEvent(new Event("notifications-updated"));
      await fetchNotifications();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const fetchBookingDetails = async (notification) => {
    const bookingId = notification?.bookingId?._id || notification?.bookingId;
    if (!bookingId) {
      setBookingDetails(null);
      setBookingLoading(false);
      return;
    }

    try {
      const bookingFromNotification = notification.bookingId;
      if (bookingFromNotification && typeof bookingFromNotification === "object" && bookingFromNotification._id) {
        setBookingDetails(bookingFromNotification);
        setBookingLoading(false);
        return;
      }

      const res = await api.get(`/api/booking/timeline/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookingDetails(res.data.booking || null);
    } catch (err) {
      setBookingDetails(null);
    } finally {
      setBookingLoading(false);
    }
  };

  const openNotification = async (notification) => {
    setSelectedNotification(notification);
    setBookingDetails(null);
    setBookingLoading(true);
    if (!notification.read) {
      markRead(notification._id, false);
    }
    await fetchBookingDetails(notification);
  };

  const closeDetails = () => {
    setSelectedNotification(null);
    setBookingDetails(null);
    setBookingLoading(false);
  };

  const approveCancellation = async () => {
    if (!bookingDetails?._id) return;
    try {
      setActionLoading("approve");
      await api.post(
        "/api/admin/approve_cancel_request",
        { bookingId: bookingDetails._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      window.dispatchEvent(new Event("notifications-updated"));
      closeDetails();
      fetchNotifications();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const rejectCancellation = async () => {
    if (!bookingDetails?._id) return;
    try {
      setActionLoading("reject");
      await api.post(
        "/api/admin/reject_cancel_request",
        { bookingId: bookingDetails._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      window.dispatchEvent(new Event("notifications-updated"));
      closeDetails();
      fetchNotifications();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const displayType = (notification) => {
    if (notification.type === "cancel_request") return "Cancellation request";
    if (notification.type === "cancel_decision") return "Cancellation update";
    return notification.type || "booking";
  };

  const formatDateTime = (value) => {
    if (!value) return "N/A";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "N/A" : date.toLocaleString();
  };

  return (
    <div className="page-container py-4">
      <div className="page-hero mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="section-kicker">Inbox</span>
          <div className="mt-3 flex items-center gap-3">
            <h1 className="section-title">Notifications</h1>
            {unreadCount > 0 ? (
              <span className="rounded-full border border-rose-400/30 bg-rose-500/15 px-3 py-1 text-xs font-semibold text-rose-200">
                {unreadCount} unread
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-slate-300">Status updates for bookings, cancellations, and decisions.</p>
        </div>
        <button className="neo-button-secondary" onClick={markAllRead} disabled={unreadCount === 0}>
          Mark all as read
        </button>
      </div>

      {loading ? (
        <div className="glass-card-soft p-8 text-center text-slate-300">Loading notifications...</div>
      ) : notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              onClick={() => openNotification(notification)}
              role="button"
              tabIndex={0}
              className={`glass-card-soft w-full p-5 text-left transition hover:scale-[1.01] hover:border-cyan-400/20 ${notification.read ? "opacity-75" : "border border-cyan-400/20"}`}
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{displayType(notification)}</p>
                    {!notification.read ? (
                      <span className="h-2.5 w-2.5 rounded-full bg-rose-400 shadow-[0_0_0_4px_rgba(244,63,94,0.15)]" />
                    ) : null}
                  </div>
                  <h3 className="mt-1 text-xl font-bold text-white">{notification.title}</h3>
                  <p className="mt-2 text-slate-300">{notification.message}</p>
                  <p className="mt-2 text-xs text-slate-500">{formatDateTime(notification.createdAt)}</p>
                </div>
                <div className="flex flex-col gap-2 md:items-end">
                  {!notification.read ? (
                    <button
                      type="button"
                      className="neo-button-secondary"
                      onClick={(event) => {
                        event.stopPropagation();
                        markRead(notification._id);
                      }}
                    >
                      Mark read
                    </button>
                  ) : (
                    <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                      Read
                    </span>
                  )}
                  <span className="text-xs text-slate-500">View details</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card-soft p-8 text-center text-slate-300">No notifications yet.</div>
      )}

      {selectedNotification ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-8 backdrop-blur-sm">
          <div className="glass-card-soft relative w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl shadow-black/40">
            <button
              type="button"
              className="absolute right-4 top-4 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-200 hover:bg-white/10"
              onClick={closeDetails}
            >
              Close
            </button>

            <div className="pr-16">
              <span className="section-kicker">Notification detail</span>
              <h2 className="mt-3 text-3xl font-black text-white">{selectedNotification.title}</h2>
              <p className="mt-2 text-slate-300">{selectedNotification.message}</p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="stat-badge sm:col-span-2">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Type</p>
                <p className="mt-1 text-lg text-white">{displayType(selectedNotification)}</p>
              </div>
              <div className="stat-badge">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Status</p>
                <p className="mt-1 text-slate-100">{selectedNotification.read ? "Read" : "Unread"}</p>
              </div>
              <div className="stat-badge">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Created</p>
                <p className="mt-1 text-slate-100">{formatDateTime(selectedNotification.createdAt)}</p>
              </div>
              <div className="stat-badge sm:col-span-2">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Notification meta</p>
                <p className="mt-1 text-slate-100">
                  {selectedNotification.meta?.requestedByName
                    ? `${selectedNotification.meta.requestedByName} requested this cancellation${selectedNotification.meta.reason ? ` because: ${selectedNotification.meta.reason}` : ""}`
                    : "Open this notification for the full booking context."}
                </p>
              </div>
            </div>

            {bookingLoading ? (
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 text-center text-slate-300">
                Loading booking details...
              </div>
            ) : bookingDetails ? (
              <>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="stat-badge sm:col-span-2">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Service</p>
                    <p className="mt-1 text-lg text-white">{bookingDetails.jobId?.job || "N/A"}</p>
                  </div>
                  <div className="stat-badge">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Client</p>
                    <p className="mt-1 text-slate-100">{bookingDetails.clientId?.fullName || "N/A"}</p>
                  </div>
                  <div className="stat-badge">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Worker</p>
                    <p className="mt-1 text-slate-100">{bookingDetails.workerId?.fullName || "N/A"}</p>
                  </div>
                  <div className="stat-badge">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Slot date</p>
                    <p className="mt-1 text-slate-100">{bookingDetails.slotDate ? new Date(bookingDetails.slotDate).toLocaleDateString() : "N/A"}</p>
                  </div>
                  <div className="stat-badge">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Slot time</p>
                    <p className="mt-1 text-slate-100">{bookingDetails.slotTime || "N/A"}</p>
                  </div>
                  <div className="stat-badge sm:col-span-2">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Cancellation reason</p>
                    <p className="mt-1 text-slate-100">{bookingDetails.cancelReason || "N/A"}</p>
                  </div>
                  <div className="stat-badge">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Requested by</p>
                    <p className="mt-1 text-slate-100">{bookingDetails.cancelRequestedByName || selectedNotification.meta?.requestedByName || "N/A"}</p>
                  </div>
                  <div className="stat-badge">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Requested role</p>
                    <p className="mt-1 text-slate-100">{bookingDetails.cancelRequestedByRole || selectedNotification.meta?.requestedByRole || "N/A"}</p>
                  </div>
                  <div className="stat-badge">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Request status</p>
                    <p className="mt-1 text-slate-100">{bookingDetails.cancelRequestStatus || "N/A"}</p>
                  </div>
                  <div className="stat-badge">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Reviewed by</p>
                    <p className="mt-1 text-slate-100">{bookingDetails.cancelReviewedByName || "N/A"}</p>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Status timeline</p>
                      <p className="mt-1 text-slate-300">Recent booking activity tied to this notification.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                        {bookingDetails.status || "pending"}
                      </span>
                      {bookingDetails.cancelRequestStatus === "pending" ? (
                        <span className="rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-200">
                          Pending admin decision
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    {(bookingDetails.statusHistory || []).slice(-4).map((entry, index) => (
                      <div key={`${bookingDetails._id}-history-${index}`} className="stat-badge">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-white capitalize">{entry.status}</p>
                          <p className="text-xs text-slate-400">{formatDateTime(entry.createdAt)}</p>
                        </div>
                        <p className="mt-1 text-sm text-slate-300">{entry.note || "Status update"}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : null}

            {isAdmin && bookingDetails?.cancelRequestStatus === "pending" && selectedNotification.type === "cancel_request" ? (
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  className="neo-button bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                  onClick={approveCancellation}
                  disabled={actionLoading !== null}
                >
                  {actionLoading === "approve" ? "Approving..." : "Approve Cancellation"}
                </button>
                <button
                  type="button"
                  className="neo-button-danger"
                  onClick={rejectCancellation}
                  disabled={actionLoading !== null}
                >
                  {actionLoading === "reject" ? "Rejecting..." : "Reject Cancellation"}
                </button>
              </div>
            ) : null}

            {!selectedNotification.read ? (
              <div className="mt-6 flex justify-end">
                <button type="button" className="neo-button-secondary" onClick={() => markRead(selectedNotification._id)}>
                  Mark read
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default Notifications;
