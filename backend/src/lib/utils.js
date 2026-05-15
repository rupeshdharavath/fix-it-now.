import jwt from "jsonwebtoken";
import "dotenv/config";

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    sameSite: "Strict",
    secure: process.env.NODE_ENV === "production", // only true in production
  });

  return token;
};
