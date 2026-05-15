import User from "../Models/User.js";
import Worker from "../Models/Worker.js";
import Booking from "../Models/Booking.js";
import Notification from "../Models/Notification.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import "dotenv/config";

const sendBookingNotifications = async (booking, title, message, type = "booking") => {
  const recipients = [booking.clientId, booking.workerId].filter(Boolean);
  if (recipients.length === 0) return;

  await Notification.insertMany(
    recipients.map((recipientId) => ({
      recipientId,
      recipientRole: "user",
      title,
      message,
      type,
      bookingId: booking._id,
    }))
  );
};

const getActorName = (user) => user?.fullName || user?.email || "Admin";

// Admin login with fixed credentials
export const adminLogin = async (req, res) => {
  try {
    const { password } = req.body;
    
    const ADMIN_PASSWORD = "admin321";
    const ADMIN_EMAIL = "admin123@gmail.com";
    
    if (!password) {
      return res.status(400).json({ message: "Password required" });
    }
    
    if (password !== ADMIN_PASSWORD) {
      return res.status(400).json({ message: "Invalid admin password" });
    }
    
    // Create a special admin token with admin role
    const adminToken = jwt.sign(
      { isAdmin: true, email: ADMIN_EMAIL },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    
    return res.status(200).json({
      token: adminToken,
      user: {
        email: ADMIN_EMAIL,
        fullName: "Administrator",
        role: "admin"
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const display_pending_jobs = async(req,res)=>{
    try{
        const pendingRequests=await Worker.find({jobAccepted:false,jobRejected:false})
        .populate("userId","fullName");
        if(pendingRequests.length>0){
            return res.status(200).json({pendingRequests});
        }
        return res.status(200).json({message:"no pending requests"});
    }catch(err){
        return res.status(500).json({message:err.message});
    }
};


export const accept_application=async(req,res)=>{
    try{
        const {requestId}=req.body;
        const approved=await Worker.findById(requestId);
        if(!approved){
            return res.status(404).json({message:"failed to fetch details"});
        }
        approved.jobAccepted=true,
        approved.jobRejected=false
        await approved.save();
        return res.status(200).json({message:"job Application verififed"});
    }catch(err){
        return res.status(500).json({message:err.message});
    }
};

export const reject_application=async(req,res)=>{
    try{
        const {requestId}=req.body;
        const rejected=await Worker.findById(requestId);
        if(!rejected){
            return res.status(404).json({message:"failed to reject"});
        }
        rejected.jobAccepted=false,
        rejected.jobRejected=true
        await rejected.save();
        return res.status(200).json({message:"application rejecetd"})
    }catch(err){
        return res.status(500).json({message:err.message});
    }
};

export const accepted_applications = async(req,res)=>{
    try{
        const getAcceptedWorkers=await Worker.find({jobAccepted:true,jobRejected:false}).populate("userId","fullName");
        if(getAcceptedWorkers.length>0){
            return res.status(200).json({getAcceptedWorkers});
        }
        return res.status(200).json({message:"List is emoty"})
    }catch(err){
        return res.status(500).json({message:err.message});
    }
};

export const rejected_applications = async(req,res)=>{
    try{
        const getRejectedWorkers=await Worker.find({jobAccepted:false,jobRejected:true}).populate("userId","fullName");
        if(getRejectedWorkers.length>0){
            return res.status(200).json({getRejectedWorkers});
        }
        return res.status(200).json({message:"List is emoty"})
    }catch(err){
        return res.status(500).json({message:err.message});
    }
};


export const view_user_profile = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const userdata = await User.findById(userId);
    if (!userdata) {
      return res.status(404).json({ message: "No user found" });
    }
    const isClient = userdata.role?.toLowerCase() === 'client';
    const baseQuery = {
      $or: [
        { workerId: userId },
        { clientId: userId }
      ],
      jobAcceptedByWorker: true,
      jobRejectedByWorker: false,
    };
    const populateOptions = isClient
      ? [
          { path: "jobId", select: "job jobDescription" },
          { path: "workerId", select: "fullName email profilePic" }
        ]
      : [
          { path: "jobId", select: "job jobDescription" },
          { path: "clientId", select: "fullName email profilePic" }
        ];

    const bookings = await Booking.find(baseQuery)
      .populate(populateOptions)
      .lean();

    return res.status(200).json({
      message: "User profile fetched successfully",
      userdata,
      bookings: bookings.length > 0 ? bookings : [],
    });
  } catch (err) {
    console.error("Backend error in view_user_profile:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const search_job_accepted = async(req,res)=>{
    try{
        const {searchQuery}=req.query;
        if(!searchQuery){
            return res.status(202).json({message:"error"});
        }
        const getAcceptedWorkers=await Worker.find({
            job:{ $regex: `.*${searchQuery}.*`, $options: "i" } ,
            jobAccepted:true,
            jobRejected:false
        }).populate("userId","fullName");
        if(getAcceptedWorkers.length>0){
            return res.status(200).json({getAcceptedWorkers});
        }
        return res.status(200).json({message:"no match found",getAcceptedWorkers:[]})
    }catch(err){
        return res.status(500).json({message:err.message});
    }
};

export const  search_job_rejected= async(req,res)=>{
    try{
        const {searchQuery}=req.query;
        if(!searchQuery){
            return res.status(202).json({message:"error"});
        }
        const getAcceptedWorkers=await Worker.find({
            job:{ $regex: `.*${searchQuery}.*`, $options: "i" } ,
            jobAccepted:false,
            jobRejected:true
        }).populate("userId","fullName");
        if(getAcceptedWorkers.length>0){
            return res.status(200).json({getAcceptedWorkers});
        }
        return res.status(200).json({message:"no match found",getAcceptedWorkers:[]})
    }catch(err){
        return res.status(500).json({message:err.message});
    }
};

export const  search_job_pending= async(req,res)=>{
    try{
        const {searchQuery}=req.query;
        if(!searchQuery){
            return res.status(202).json({message:"error"});
        }
        const getAcceptedWorkers=await Worker.find({
            job:{ $regex: `.*${searchQuery}.*`, $options: "i" } ,
            jobAccepted:false,
            jobRejected:false
        }).populate("userId","fullName");
        if(getAcceptedWorkers.length>0){
            return res.status(200).json({getAcceptedWorkers});
        }
        return res.status(200).json({message:"no match found",getAcceptedWorkers:[]})
    }catch(err){
        return res.status(500).json({message:err.message});
    }
};

export const worker_info = async (req, res) => {
  try {
    const workerInfo = await User.find({ role: 'worker' });
    
    if (workerInfo.length === 0) {
      return res.status(200).json({ message: "No workers found" });
    }
    return res.status(200).json({ workerInfo });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const client_info = async (req, res) => {
  try {
    const workerInfo = await User.find({ role: 'client' });
    
    if (workerInfo.length === 0) {
      return res.status(200).json({ message: "No clients found" });
    }
    return res.status(200).json({ workerInfo });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


export const get_booking_form = async (req, res) => {
    try {
        const { jobId } = req.params;
        if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({ message: "Invalid or missing ID in the request path." });
        }

        let bookingdata;
        bookingdata = await Booking.findById(jobId)
            .populate("clientId", "fullName email Street mandal district state country pinCode")
            .populate("workerId", "fullName email Street mandal district state country pinCode")
            .populate("jobId", "job");
        if (!bookingdata) {
            const bookingInfo = await Booking.find({ jobId: jobId })
                .populate("clientId", "fullName email Street mandal district state country pinCode")
                .populate("workerId", "fullName email Street mandal district state country pinCode")
                .populate("jobId", "job");
            if (bookingInfo.length === 0) { 
                return res.status(404).json({ message: "No booking data found matching the provided ID." });
            }
            bookingdata = bookingInfo;
        }
        return res.status(200).json({ bookingdata });

    } catch (err) {
        console.error("Backend error in get_booking_form:", err);
        return res.status(500).json({ message: "Server error during booking retrieval.", error: err.message });
    }
};

export const deactivateAccount=async(req,res)=>{
    try{
        if (!req.user?.isAdmin) {
          return res.status(403).json({ message: "Only admin can deactivate accounts" });
        }
        const {userId}=req.params;
        const succesfull=await User.findById(userId);
          if (!succesfull.isActive) {
            return res.status(400).json({ message: "Account already deactivated" });
            }
        if(succesfull){
            succesfull.isActive=false;
            await succesfull.save();
            return res.status(200).json({message:"succesfull1"});
        }
        return res.status(404).json({message:"failed to fetch"});
    }catch(err){
        return res.status(500).json({message:err.message});
    }
};

export const activateAccount=async(req,res)=>{
    try{
        if (!req.user?.isAdmin) {
          return res.status(403).json({ message: "Only admin can activate accounts" });
        }
        const {userId}=req.params;
        const succesfull=await User.findById(userId);
          if (succesfull.isActive) {
            return res.status(400).json({ message: "Account is active" });
            }
        if(succesfull){
            succesfull.isActive=true;
            await succesfull.save();
            return res.status(200).json({message:"succesfull1"});
        }
        return res.status(404).json({message:"failed to fetch"});
    }catch(err){
        return res.status(500).json({message:err.message});
    }
};

export const allot_worker_to_client = async (req, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: "Only admin can approve hire requests" });
    }
    
    const { bookingId } = req.body;
    
    if (!bookingId) {
      return res.status(400).json({ message: "Booking ID is required" });
    }
    
    // Get the pending booking
    const booking = await Booking.findById(bookingId).populate("jobId", "job");
    
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    // Check if it's a pending request (worker hasn't responded yet)
    if (booking.jobAcceptedByWorker === true) {
      return res.status(400).json({ message: "Worker has already accepted this request" });
    }
    
    if (booking.jobRejectedByWorker === true) {
      return res.status(400).json({ message: "Worker has already rejected this request" });
    }
    
    // Approve the booking on behalf of the worker
    booking.jobAcceptedByWorker = true;
    booking.jobRejectedByWorker = false;
    booking.approvedByAdmin = true;
    booking.approvedByAdminAt = new Date();
    
    await booking.save();
    
    return res.status(200).json({ 
      message: "Hiring request approved successfully. Worker and client have been notified.",
      booking 
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const get_pending_hire_requests = async (req, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: "Only admin can view pending requests" });
    }
    
    // Get all pending bookings where worker hasn't responded
    const pendingRequests = await Booking.find({
      jobAcceptedByWorker: { $ne: true },
      jobRejectedByWorker: { $ne: true }
    })
    .populate("clientId", "fullName email profilePic")
    .populate("workerId", "fullName email profilePic role")
    .populate("jobId", "job jobDescription")
    .sort({ createdAt: -1 });
    
    return res.status(200).json({ 
      pendingRequests,
      count: pendingRequests.length
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const reject_hire_request = async (req, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: "Only admin can reject hire requests" });
    }
    
    const { bookingId } = req.body;
    
    if (!bookingId) {
      return res.status(400).json({ message: "Booking ID is required" });
    }
    
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    if (booking.jobAcceptedByWorker === true || booking.jobRejectedByWorker === true) {
      return res.status(400).json({ message: "This request has already been responded to" });
    }
    
    // Reject on behalf of worker
    booking.jobRejectedByWorker = true;
    booking.jobAcceptedByWorker = false;
    booking.rejectedByAdmin = true;
    booking.rejectedByAdminAt = new Date();
    
    await booking.save();
    
    return res.status(200).json({ 
      message: "Hiring request rejected. Client has been notified.",
      booking 
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const approve_cancel_request = async (req, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: "Only admin can approve cancellation requests" });
    }

    const { bookingId } = req.body;
    if (!bookingId) {
      return res.status(400).json({ message: "Booking ID is required" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.cancelRequestStatus !== "pending") {
      return res.status(400).json({ message: "No pending cancellation request found" });
    }

    booking.cancelRequestStatus = "approved";
    booking.cancelReviewedByRole = "admin";
    booking.cancelReviewedByName = getActorName(req.user);
    booking.cancelReviewedAt = new Date();
    booking.cancelReviewReason = "Cancellation approved by admin";
    booking.status = "cancelled";
    booking.jobAcceptedByWorker = false;
    booking.jobRejectedByWorker = true;

    booking.statusHistory.push({
      status: "cancelled",
      note: `Cancellation approved by ${getActorName(req.user)}`,
      actorRole: "admin",
    });
    await booking.save();

    await sendBookingNotifications(
      booking,
      "Cancellation approved",
      "The cancellation request for this booking was approved by admin.",
      "cancel_decision"
    );

    return res.status(200).json({ message: "Cancellation request approved", booking });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const reject_cancel_request = async (req, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: "Only admin can reject cancellation requests" });
    }

    const { bookingId } = req.body;
    if (!bookingId) {
      return res.status(400).json({ message: "Booking ID is required" });
    }

    const booking = await Booking.findById(bookingId).populate("jobId", "job");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.cancelRequestStatus !== "pending") {
      return res.status(400).json({ message: "No pending cancellation request found" });
    }

    booking.cancelRequestStatus = "rejected";
    booking.cancelReviewedByRole = "admin";
    booking.cancelReviewedByName = getActorName(req.user);
    booking.cancelReviewedAt = new Date();
    booking.cancelReviewReason = "Cancellation rejected by admin";

    booking.statusHistory.push({
      status: "cancel_rejected",
      note: `Cancellation rejected by ${getActorName(req.user)}`,
      actorRole: "admin",
    });
    await booking.save();

    await sendBookingNotifications(
      booking,
      "Cancellation rejected",
      "The cancellation request for this booking was rejected by admin and the job remains active.",
      "cancel_decision"
    );

    return res.status(200).json({ message: "Cancellation request rejected", booking });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const get_all_users = async (req, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: "Only admin can access this" });
    }
    
    const { role, search } = req.query;
    let query = {};
    
    if (role) {
      query.role = role;
    }
    
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { mobileNum: { $regex: search, $options: "i" } }
      ];
    }
    
    const users = await User.find(query).select('-password');
    
    return res.status(200).json({ users });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const toggle_user_status = async (req, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: "Only admin can toggle user status" });
    }
    
    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    user.isActive = !user.isActive;
    await user.save();
    
    return res.status(200).json({ 
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user 
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const report_worker = async (req, res) => {
  try {
    const { workerId, reason, description } = req.body;
    const clientId = req.user._id;
    
    if (!workerId || !reason) {
      return res.status(400).json({ message: "Worker ID and reason are required" });
    }
    
    // Check if user is a client
    const client = await User.findById(clientId);
    if (client.role !== 'client') {
      return res.status(403).json({ message: "Only clients can report workers" });
    }
    
    // Check if worker exists
    const worker = await User.findById(workerId);
    if (!worker || worker.role !== 'worker') {
      return res.status(404).json({ message: "Worker not found" });
    }

    // Verify client has a completed booking with this worker
    const completedBooking = await Booking.findOne({
      clientId,
      workerId,
      jobCompleted: true,
      jobAcceptedByWorker: true,
      jobRejectedByWorker: false
    });

    if (!completedBooking) {
      return res.status(403).json({ 
        message: "You can only report a worker after a completed booking. No completed jobs found with this worker." 
      });
    }
    
    // Store complaint
    const complaint = {
      clientId,
      reason,
      description,
      bookingId: completedBooking._id,
      status: 'pending',
      createdAt: new Date()
    };
    
    if (!worker.complaints) {
      worker.complaints = [];
    }

    // Prevent duplicate complaints about the same booking
    const existingComplaint = worker.complaints.find(
      (c) => c.bookingId?.toString() === completedBooking._id.toString()
    );

    if (existingComplaint) {
      return res.status(400).json({ 
        message: "You have already reported this worker for this booking" 
      });
    }

    worker.complaints.push(complaint);
    await worker.save();
    
    return res.status(201).json({ 
      message: "Complaint filed successfully. Admin will review it within 24-48 hours.",
      complaint 
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const get_complaints = async (req, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: "Only admin can view complaints" });
    }
    
    const { status } = req.query;
    let query = { complaints: { $exists: true, $ne: [] } };
    
    // Get workers with complaints
    let workers = await User.find(query).select('-password');
    
    // Filter and flatten complaints
    let complaints = [];
    workers.forEach(worker => {
      if (worker.complaints) {
        worker.complaints.forEach(complaint => {
          if (!status || complaint.status === status) {
            complaints.push({
              ...complaint,
              workerId: worker._id,
              workerName: worker.fullName,
              workerEmail: worker.email
            });
          }
        });
      }
    });
    
    return res.status(200).json({ complaints });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const resolve_complaint = async (req, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: "Only admin can resolve complaints" });
    }
    
    const { workerId, complaintIndex, action } = req.body;
    
    const worker = await User.findById(workerId);
    if (!worker || !worker.complaints || !worker.complaints[complaintIndex]) {
      return res.status(404).json({ message: "Complaint not found" });
    }
    
    worker.complaints[complaintIndex].status = action === 'dismiss' ? 'dismissed' : 'resolved';
    worker.complaints[complaintIndex].resolvedAt = new Date();
    
    await worker.save();
    
    return res.status(200).json({ 
      message: `Complaint ${action === 'dismiss' ? 'dismissed' : 'resolved'}`,
      complaint: worker.complaints[complaintIndex]
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const get_analytics = async (req, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: "Only admin can view analytics" });
    }

    const [totalBookings, acceptedJobs, completedJobs, _users, workers] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ jobAcceptedByWorker: true, jobRejectedByWorker: false }),
      Booking.countDocuments({ jobCompleted: true }),
      User.find({ role: "worker" }).lean(),
      Worker.find({ complaints: { $exists: true, $ne: [] } }).lean(),
    ]);

    const complaints = workers.reduce((count, worker) => count + (worker.complaints?.length || 0), 0);

    return res.status(200).json({
      metrics: {
        totalBookings,
        acceptedJobs,
        completedJobs,
        complaints,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};