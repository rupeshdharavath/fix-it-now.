import Booking from "../Models/Booking.js";

export const fetch_details = async (req, res) => {
  const { bookingId } = req.query;
  try {
    if (!bookingId) {
      return res.status(400).json({ message: "Booking ID is required" });
    }

    const worker_details = await Booking.findById(bookingId)
      .populate("jobId", "job")
      .populate("workerId","fullName");

    if (!worker_details) {
      return res.status(404).json({ message: "No booking found for this ID" });
    }

    return res.status(200).json({ worker_details });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


export const create =async(req,res)=>{
    try{
        const {bookingId,rating,comment}=req.body;
        const clientId = req.user?._id;

        if (!bookingId || !rating || !comment) {
          return res.status(400).json({ message: "Booking, rating and comment are required" });
        }

        const review_created=await Booking.findById(bookingId);
        if(!review_created){
            return res.status(402).json({message:"failed to add review"});
        }

        if (String(review_created.clientId) !== String(clientId)) {
          return res.status(403).json({ message: "You can review only your own bookings" });
        }

        if (!review_created.jobAcceptedByWorker || review_created.jobRejectedByWorker) {
          return res.status(400).json({ message: "Review allowed only for accepted bookings" });
        }

        if (!review_created.jobCompleted) {
          return res.status(400).json({ message: "Review allowed only after job completion" });
        }

        if (review_created.review && review_created.review.trim()) {
          return res.status(400).json({ message: "Review already submitted for this booking" });
        }

        review_created.review=comment;
        review_created.rating=rating;
        await review_created.save();
        return res.status(200).json({message:"review uploaded succesfully"});
    }catch(err){
        return res.status(500).json({message:err.message});
    }
};

export const get_review_overview=async(req,res)=>{
    try{
        const userId=req.user._id;
        if(!userId){
            return res.status(404).json({message:"no valid id present"});
        }
        const all_reviews = await Booking.find({
          $or: [
            { workerId: userId, review: { $exists: true,$nin: [null, ""] } },
            { clientId: userId, review: { $exists: true,$nin: [null, ""] } }
          ]
        })
        .select("_id review rating")
        .populate("clientId", "fullName")
        .populate("workerId","fullName")
        .populate("jobId","job")
        .sort({ updatedAt: -1 });
        if(all_reviews.length>0){
            return res.status(200).json({all_reviews});
        }
        return res.status(200).json({all_reviews:[]});
    }catch(err){
        return res.status(500).json({message:err.message});
    }
};


export const deleteReview = async (req, res) => {
  try {
    const { bookingId } = req.params;  
    if (!bookingId) return res.status(404).json({ message: "Booking not found" });

    const updated = await Booking.findByIdAndUpdate(
      bookingId,
      { review: null,rating:0 },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Booking not found" });

    return res.status(200).json({ message: "Review cleared successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
