import mongoose  from "mongoose"

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    otp:{
        type:String,
        required:true
    },
    otpExpires:{
        type:Date,
        required:true
    },
    isVerified:{
        type:Boolean,
        default:false
    }
},{timestamps:true})

const User=mongoose.model("User",userSchema)
export default User