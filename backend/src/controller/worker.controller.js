import Booking from "../Models/Booking.js";
import User from "../Models/User.js";
import Worker from "../Models/Worker.js";

export const createWorkerProfile = async (req, res) => {
  try {
    const { job, jobDescription } = req.body;

    const worker = new Worker({
      userId: req.user._id,
      email: req.user.email, 
      role: "worker",
      jobDescription,
      job,
      jobAccepted:"false",
      jobRejected:"false",
    });

    await worker.save();
    res.status(201).json({ message: "Worker profile created", worker });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create worker profile" });
  }
};

export const display_accepted_jobs =async(req,res)=>{
  try {
    const userData = req.user; 
    const appData = await Worker.find({ userId: userData._id});

    if (appData.length === 0) {
      return res.status(200).json({ message: "No applications found" });
    }
    return res.status(200).json({ userData, appData });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const get_all_workers =async(req,res)=>{
  try{
    const workerjob=await Worker.find({jobAccepted:true,jobRejected:false})
     .populate("userId","profilePic district fullName isActive"); 
    if(!workerjob.length>0){
      return res.status(200).json({message:"no jobs found"});
    }
    return res.status(200).json({workerjob});
  }
  catch(err){
    return res.status(500).json({message:err.message});
  }
};

export const get_available_workers = async (req, res) => {
  try {
    const { slotDate, slotTime, search = "" } = req.query;

    if (!slotDate || !slotTime) {
      return res.status(400).json({ message: "slotDate and slotTime are required" });
    }

    const selectedDate = new Date(slotDate);
    if (Number.isNaN(selectedDate.getTime())) {
      return res.status(400).json({ message: "Invalid slotDate" });
    }

    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const bookedWorkerProfiles = await Booking.find({
      slotTime,
      slotDate: { $gte: startOfDay, $lte: endOfDay },
      jobCompleted: false,
    }).distinct("jobId");

    const workerQuery = {
      jobAccepted: true,
      jobRejected: false,
      _id: { $nin: bookedWorkerProfiles },
    };

    if (search.trim()) {
      workerQuery.job = { $regex: `.*${search.trim()}.*`, $options: "i" };
    }

    const workerjob = await Worker.find(workerQuery).populate(
      "userId",
      "profilePic district fullName isActive"
    );

    return res.status(200).json({ workerjob });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


export const particular_worker_detail =async(req,res)=>{
  try{
      const {jobId}=req.params;
      const appData=await Worker.findOne({_id:jobId});
      if(!appData){
        return res.status(200).json({message:"no application found"})
      }
      const userData=await User.findOne({_id:appData.userId});
      if(!userData){
        return res.status(200).json({message:"invalid application"});
      }
      return res.status(200).json({appData,userData});
  }catch(err){
    return res.status(500).json({message:err.message});
  }
};

export const search_job = async (req, res) => {
  try {
    const { search } = req.params;
    if (!search) {
      return res.status(400).json({ message: "Search query is required" });
    }
    const workerjob = await Worker.find({
      job: { $regex: `.*${search}.*`, $options: "i" } ,jobAccepted:true,jobRejected:false
    }).populate("userId", "profilePic district fullName");

    if (workerjob.length === 0) {
      return res.status(404).json({ message: "No result found" });
    }
    return res.status(200).json({ workerjob });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};


export const delete_application=async(req,res)=>{
  try{
    const {appId}=req.params;
    if(!appId){
      return res.status(404).json({message:"failed to delete"});
    }
    const delete_app=await Worker.findByIdAndDelete(appId);
    if(delete_app){
      return res.status(200).json({message:"application deleted"});
    }
    return res.status(400).json({message:"failed to delete"})
  }catch(err){
    return res.status(500).json({message:err.message});
  }
};

export const delete_job_worker = async (req, res) => {
  try {
    const { appId } = req.params;
    if (!appId) {
      return res.status(400).json({ message: "Application ID is required" });
    }
    const ongoingJobs = await Booking.find({ jobId: appId, jobCompleted: false });
    if (ongoingJobs.length > 0) {
      return res.status(200).json({ message: "You have scheduled jobs. Unable to delete this application." });
    }
    const deletedApp = await Worker.findByIdAndDelete(appId);
    if (!deletedApp) {
      return res.status(404).json({ message: "Application not found" });
    }
    return res.status(200).json({ message: "Application deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};