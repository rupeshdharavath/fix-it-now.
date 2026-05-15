import User from "../Models/User.js";
import { cloudinary, upload } from "../lib/cloudinary.js";


// GET Profile
export const getProfile = async (req, res) => {
  try {
    res.json(req.user); // user attached by protectRoute
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

// UPDATE Profile
export const updateProfile = async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Handle profile picture upload
    if (req.file) {
      updateData.profilePic = req.file.path; // Cloudinary URL

      // Optional: delete old profile pic
      if (req.user.profilePic) {
        const publicId = req.user.profilePic.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`uploads/${publicId}`);
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true }
    ).select("-password"); // exclude password

    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
};
