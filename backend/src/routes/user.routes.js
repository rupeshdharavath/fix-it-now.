import express from "express";
import { getProfile, updateProfile } from "../controller/user.controller.js";
import { protectRoute } from "../middlewear/protectRoute.js";
import { upload } from "../lib/cloudinary.js";

const router = express.Router();
router.get("/profile", protectRoute, getProfile);
router.put("/update", protectRoute, upload.single("profilePic"), updateProfile);

export default router;
