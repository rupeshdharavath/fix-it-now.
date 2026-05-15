import Notification from "../Models/Notification.js";

export const get_my_notifications = async (req, res) => {
  try {
    const query = req.user?.isAdmin
      ? { recipientRole: "admin" }
      : { recipientId: req.user._id, recipientRole: { $ne: "admin" } };

    const notifications = await Notification.find(query)
      .populate({
        path: "bookingId",
        populate: [
          { path: "jobId", select: "job" },
          { path: "clientId", select: "fullName email mobileNum profilePic" },
          { path: "workerId", select: "fullName email mobileNum profilePic" },
        ],
      })
      .sort({ createdAt: -1 })
      .lean();

    const unreadCount = notifications.filter((notification) => !notification.read).length;

    return res.status(200).json({ notifications, unreadCount });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const mark_notification_read = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const query = req.user?.isAdmin
      ? { _id: notificationId, recipientRole: "admin" }
      : { _id: notificationId, recipientId: req.user._id, recipientRole: { $ne: "admin" } };
    const notification = await Notification.findOneAndUpdate(
      query,
      { $set: { read: true } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    return res.status(200).json({ notification });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const mark_all_notifications_read = async (req, res) => {
  try {
    const query = req.user?.isAdmin
      ? { recipientRole: "admin", read: false }
      : { recipientId: req.user._id, recipientRole: { $ne: "admin" }, read: false };

    await Notification.updateMany(query, { $set: { read: true } });

    return res.status(200).json({ message: "Notifications marked as read" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};