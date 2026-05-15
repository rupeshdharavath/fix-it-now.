import Booking from "../Models/Booking.js";
import Notification from "../Models/Notification.js";
import Worker from "../Models/Worker.js";

const appendHistory = async (booking, status, note, actorRole, actorId) => {
  // Only set the booking.status if the provided status is one of the
  // allowed enum values on the Booking model. Some history entries use
  // internal-only markers (eg. "cancel_requested") which should be
  // recorded in the timeline but must not be written to the `status`
  // field because it has a limited enum on the schema.
  try {
    const allowed = Booking.schema.path("status")?.enumValues || ["pending", "accepted", "rejected", "cancelled", "rescheduled", "completed"];
    if (allowed.includes(status)) {
      booking.status = status;
    }
  } catch (e) {
    // fallback: do not overwrite booking.status if something goes wrong
  }

  booking.statusHistory.push({ status, note, actorRole, actorId });
  await booking.save();
};

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

const sendAdminNotification = async (booking, title, message, meta = {}) => {
  await Notification.create({
    recipientRole: "admin",
    title,
    message,
    type: meta.type || "booking",
    bookingId: booking._id,
    meta,
  });
};

const getDisplayName = (user) => user?.fullName || user?.email || "Unknown user";

export const create = async (req, res) => {
  try {
    const { jobId, slotDate, slotTime } = req.body;
    const clientId = req.user._id;
    const worker = await Worker.findById(jobId);
    if (!worker) return res.status(404).json({ message: "Worker not found" });
    const workerId = worker.userId;
    if (!jobId || !slotDate || !slotTime) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const job_already_booked = await Booking.findOne({workerId,slotDate,slotTime});
    if (job_already_booked) {
      return res.status(400).json({ message: "Slot already booked by someone else" });
    }
    const book_job = new Booking({
      jobId,
      workerId,
      clientId,
      slotDate,
      slotTime,
      jobCompleted:false,
      jobAcceptedByWorker:false,
      jobRejectedByWorker:false,
      status: "pending",
      statusHistory: [{ status: "pending", note: "Booking created", actorRole: "client", actorId: clientId }],
    });
    await book_job.save();
    await sendBookingNotifications(
      book_job,
      "New booking request",
      `A new booking request was created for ${book_job.slotDate?.toLocaleDateString?.() || "your service"}.`
    );
    return res.status(201).json({ message: "Slot booked successfully", book_job });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const get_recruited_staff = async (req, res) => {
  try {
    const clientId = req.user._id;
    if (!clientId) {
      return res.status(400).json({ message: "Invalid client" });
    }
    const fetch_recruited_list = await Booking.find({ clientId })
      .populate("workerId", "fullName email mobileNum profilePic Street mandal district state country pinCode isActive") 
      .populate("jobId","job")
      .sort({createdAt:-1}); 
    if (fetch_recruited_list.length > 0) {
      return res
        .status(200)
        .json({ message: "Fetched successfully", formData: fetch_recruited_list });
    }
    return res.status(200).json({ message: "List is empty", FormData: [] });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

export const get_job_offer = async (req, res) => {
  try {
    const workerId = req.user._id;

    if (!workerId) {
      return res.status(400).json({ message: "Worker ID missing" });
    }

    const jobOffers = await Booking.find({ workerId ,jobCompleted:false })
      .populate("clientId", "fullName email mobileNum profilePic Street mandal district state country pinCode")
      .populate("jobId", "job");

    if (!jobOffers || jobOffers.length === 0) {
      return res.status(404).json({ message: "No job offers found" });
    }

    return res.status(200).json({ jobOffers });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const accept_job=async(req,res)=>{
  try{
    const {bookingId}=req.params;
    if(!bookingId){
      return res.status(404).json({message:"try again"});
    }
    const get_job_info=await Booking.findById({_id:bookingId});
    if (!get_job_info) {
      return res.status(404).json({ message: "Booking not found" });
    }
    get_job_info.jobAcceptedByWorker=true;
    get_job_info.jobRejectedByWorker=false;
    await appendHistory(get_job_info, "accepted", "Worker accepted the booking", req.user?.role || "worker", req.user?._id);
    await sendBookingNotifications(get_job_info, "Booking accepted", "Your booking has been accepted by the worker.");
    return res.status(200).json({message:"job Accepted"});
  }catch(err){
    return res.status(500).json({message:err.message});
  }
};

export const reject_job=async(req,res)=>{
  try{
    const {bookingId}=req.params;
    if(!bookingId){
      return res.status(404).json({message:"try again"});
    }
    const get_job_info=await Booking.findById({_id:bookingId});
    if (!get_job_info) {
      return res.status(404).json({ message: "Booking not found" });
    }
    get_job_info.jobAcceptedByWorker=false;
    get_job_info.jobRejectedByWorker=true;
    await appendHistory(get_job_info, "rejected", "Worker rejected the booking", req.user?.role || "worker", req.user?._id);
    await sendBookingNotifications(get_job_info, "Booking rejected", "Your booking has been rejected by the worker.");
    return res.status(200).json({message:"job Accepted"});
  }catch(err){
    return res.status(500).json({message:err.message});
  }
};

export const cancel_booking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason = "" } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const isOwner = String(booking.clientId) === String(req.user?._id) || String(booking.workerId) === String(req.user?._id);
    if (!isOwner && !req.user?.isAdmin) {
      return res.status(403).json({ message: "Not allowed to cancel this booking" });
    }

    if (booking.jobCompleted) {
      return res.status(400).json({ message: "Completed bookings cannot be cancelled" });
    }

    if (booking.cancelRequestStatus === "pending") {
      return res.status(400).json({ message: "A cancellation request is already pending" });
    }

    const requesterRole = req.user?.role || (req.user?.isAdmin ? "admin" : "system");
    const requesterName = getDisplayName(req.user);

    booking.cancelReason = reason;
    booking.cancelRequestStatus = "pending";
    booking.cancelRequestedBy = req.user?._id;
    booking.cancelRequestedByRole = requesterRole;
    booking.cancelRequestedByName = requesterName;
    booking.cancelRequestedAt = new Date();
    booking.cancelReviewedByRole = "";
    booking.cancelReviewedByName = "";
    booking.cancelReviewedAt = undefined;
    booking.cancelReviewReason = "";

    await appendHistory(
      booking,
      "cancel_requested",
      `${requesterName} requested cancellation${reason ? `: ${reason}` : ""}`,
      requesterRole,
      req.user?._id
    );

    await sendBookingNotifications(
      booking,
      "Cancellation request pending",
      `${requesterName} requested to cancel this booking${reason ? `.
Reason: ${reason}` : "."}`,
      "cancel_request"
    );

    await sendAdminNotification(booking, "Cancellation request submitted", `${requesterName} requested cancellation for booking #${booking._id}${reason ? `.` : "."}`, {
      type: "cancel_request",
      bookingId: booking._id,
      requestedByRole: requesterRole,
      requestedByName: requesterName,
      requestedById: req.user?._id || null,
      reason,
      slotDate: booking.slotDate,
      slotTime: booking.slotTime,
      service: booking.jobId,
    });

    return res.status(200).json({ message: "Cancellation request sent to admin", booking });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const reschedule_booking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { slotDate, slotTime } = req.body;

    if (!slotDate || !slotTime) {
      return res.status(400).json({ message: "slotDate and slotTime are required" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const isOwner = String(booking.clientId) === String(req.user?._id) || String(booking.workerId) === String(req.user?._id);
    if (!isOwner && !req.user?.isAdmin) {
      return res.status(403).json({ message: "Not allowed to reschedule this booking" });
    }

    const selectedDate = new Date(slotDate);
    if (Number.isNaN(selectedDate.getTime())) {
      return res.status(400).json({ message: "Invalid slotDate" });
    }

    const conflict = await Booking.findOne({
      _id: { $ne: bookingId },
      workerId: booking.workerId,
      slotDate: selectedDate,
      slotTime,
      jobCompleted: false,
      jobRejectedByWorker: false,
      status: { $nin: ["cancelled"] },
    });

    if (conflict) {
      return res.status(400).json({ message: "Selected slot is already booked" });
    }

    booking.rescheduleHistory.push({
      slotDate: selectedDate,
      slotTime,
      actorRole: req.user?.role || "system",
      actorId: req.user?._id,
    });
    booking.slotDate = selectedDate;
    booking.slotTime = slotTime;
    await appendHistory(booking, "rescheduled", "Booking rescheduled", req.user?.role || "system", req.user?._id);
    await sendBookingNotifications(booking, "Booking rescheduled", `The booking was rescheduled to ${selectedDate.toLocaleDateString()} at ${slotTime}.`);

    return res.status(200).json({ message: "Booking rescheduled successfully", booking });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const delete_application=async(req,res)=>{
  try{
    const {booking_id}=req.params;
    if(!booking_id){
      return res.status(404).json({message:"please try later"});
    }
    const deleted=await Booking.findByIdAndDelete(booking_id);
    if(deleted){
      return res.status(200).json({message:"deleted succesfully"});
    }
    return res.status(404).json({message:"problem while deleting"});
  }catch(err){
    return res.status(500).json({message:err.message});
  }
};


export const get_completed_jobs=async(req,res)=>{
  try{
    const workerId=req.user._id;
    if(!workerId){
      return res.status(404).json({message:"unable to fetch details"});
    }
    const jobOffers = await Booking.find({ workerId:workerId,jobCompleted:true })
      .populate("clientId", "fullName email mobileNum profilePic Street mandal district state country pinCode")
      .populate("jobId", "job");
      if(jobOffers.length===0){
        return res.status(200).json({message:"no data found",jobOffers:[]});
      }
      return res.status(200).json({jobOffers});
  }catch(err)
  {
    return res.status(500).json({message:err.message});
  }
}

export const update_completed_jobs = async (req, res) => {
  try {
    const now = new Date();

    const dueBookings = await Booking.find({ jobCompleted: false, slotDate: { $lt: now } });

    for (const booking of dueBookings) {
      booking.jobCompleted = true;
      booking.status = "completed";
      booking.statusHistory.push({
        status: "completed",
        note: "Job auto-marked as completed",
        actorRole: "system",
      });
      await booking.save();
    }

    if (res) {
      return res.status(200).json({
        message: "Updated old jobs",
        result: { modifiedCount: dueBookings.length },
      });
    }
    return { modifiedCount: dueBookings.length };
  } catch (err) {
    console.error("❌ Error updating jobs:", err.message);

    if (res) {
      return res.status(500).json({ message: err.message });
    }
    throw err; 
  }
};

export const get_booking_timeline = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId)
      .populate("clientId", "fullName email mobileNum profilePic Street mandal district state country pinCode")
      .populate("workerId", "fullName email mobileNum profilePic Street mandal district state country pinCode")
      .populate("jobId", "job");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const isOwner = String(booking.clientId?._id || booking.clientId) === String(req.user?._id) || String(booking.workerId?._id || booking.workerId) === String(req.user?._id);
    if (!isOwner && !req.user?.isAdmin) {
      return res.status(403).json({ message: "Not allowed to view this booking" });
    }

    return res.status(200).json({ booking });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

