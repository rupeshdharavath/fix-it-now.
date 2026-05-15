import mongoose from "mongoose";

const userSchema=new mongoose.Schema({
    fullName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    mobileNum:{
        type:String,
    },
    password:{
        type:String,
        required:true
    },
    role:{
          type: String,
          enum: ["client", "worker", "admin"], 
          default: "client" 
    },
    Street:{
        type:String,
        default:""
    },
    mandal:{
        type:String,
        default:""
    },
    district:{
        type:String,
        default:""
    },
    state:{
        type:String,
        default:""
    },
    country:{
        type:String,
        default:""
    },
    pinCode:{
        type:String,
        default:""
    },
    isActive: {
        type: Boolean, 
        default: true 
    }, 
    profilePic:{
        type:String,
        default:""
    }
},{timestamps:true}
);

const User=mongoose.model("User",userSchema);

export default User;