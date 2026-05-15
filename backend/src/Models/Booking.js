import mongoose from "mongoose";

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
    },
    note: {
      type: String,
      default: "",
    },
    actorRole: {
      type: String,
      default: "system",
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const bookingSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
      required: true,
    },
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    review:{
      type:String,
      default:"",
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "cancelled", "rescheduled", "completed"],
      default: "pending",
    },
    statusHistory: [statusHistorySchema],
    cancelReason: {
      type: String,
      default: "",
    },
    cancelRequestStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
    },
    cancelRequestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    cancelRequestedByRole: {
      type: String,
      default: "",
    },
    cancelRequestedByName: {
      type: String,
      default: "",
    },
    cancelRequestedAt: {
      type: Date,
    },
    cancelReviewedByRole: {
      type: String,
      default: "",
    },
    cancelReviewedByName: {
      type: String,
      default: "",
    },
    cancelReviewedAt: {
      type: Date,
    },
    cancelReviewReason: {
      type: String,
      default: "",
    },
    jobCompleted:{
      type:Boolean,
    },
    jobAcceptedByWorker:{
      type:Boolean,
    },
    jobRejectedByWorker:{
      type:Boolean,
    },
    rating:{
      type:Number,
      min:1,
      max:5,
    },
    slotDate: {
      type: Date,
      required: true,
    },
    slotTime: {
      type: String,
      required: true,
    },
    rescheduleHistory: [
      {
        slotDate: { type: Date },
        slotTime: { type: String },
        actorRole: { type: String, default: "system" },
        actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
