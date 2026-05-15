import mongoose from "mongoose";

const workerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
     email:{
        type:String,
        required:true
    },
    job:{
        type:String,
        required:true,
        trim:true
    },
    jobDescription: {
      type: String,
      required: true,
      trim: true,
    },
    jobAccepted:{
      type:Boolean,
      default:false
    },
    jobRejected:{
      type:Boolean,
      default:false
    }
  },
  { timestamps: true }
);

const Worker = mongoose.model("Worker", workerSchema);
export default Worker;
