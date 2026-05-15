import express from "express";
import { protectRoute } from "../middlewear/protectRoute.js";
import { get_my_notifications, mark_all_notifications_read, mark_notification_read } from "../controller/notification.controller.js";

const router = express.Router();

router.get("/my", protectRoute, get_my_notifications);
router.put("/read/:notificationId", protectRoute, mark_notification_read);
router.put("/read-all", protectRoute, mark_all_notifications_read);

export default router;