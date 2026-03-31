import mongoose from "mongoose"
import User from "../models/userModel.js"
import validator from "validator"
import otpGenerator from "otp-generator"
import nodemailer from "nodemailer"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
export const signupUser = async (req, res) => {
    try {
        const { name, email, password } = req.body
        if (!email || !name || !password) {
            return res.status(400).json({
                success: false,
                message: "Please fill all the fields"
            })
        }
        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email"
            })
        }
        if (!validator.isStrongPassword(password)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a strong password"
            })
        }
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            })
        }
        const otp = otpGenerator.generate(6, {
            digits: true,
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false
        })
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASS
            }
        })
        await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: "Account Verification",
            html: `
             <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 500px; background: #ffffff; margin: auto; padding: 20px; border-radius: 8px;">
          
          <h2 style="color: #333;">Verify Your Email</h2>
          
          <p style="color: #555;">
            Hello,
          </p>
          
          <p style="color: #555;">
            Your One-Time Password (OTP) for verification is:
          </p>

          <div style="font-size: 24px; font-weight: bold; color: #2d89ff; margin: 20px 0;">
            ${otp}
          </div>

          <p style="color: #555;">
            This OTP is valid for <b>5 minutes</b>. Please do not share it with anyone.
          </p>

          <hr />

          <p style="font-size: 12px; color: #999;">
            If you did not request this, please ignore this email.
          </p>

          <p style="font-size: 12px; color: #999;">
            © Visitor Pass System
          </p>
        </div>
      </div>
            `
        })

        const salt = await bcrypt.genSalt(10)
        const hashOtp = await bcrypt.hash(otp, salt)
        const hashPassword = await bcrypt.hash(password, salt)
        const user = await User.create({
            name,
            email,
            password: hashPassword,
            otp: hashOtp,
            otpExpires: new Date(Date.now() + 5 * 60 * 1000)
        })
        res.status(200).json({
            success: true,
            message: "User created successfully",
            user
        })

    } catch (error) {
        res.status(500).json({ error: "Internal server error" })
    }
}


export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Please fill all the fields"
            })
        }
        const user=await User.findOne({email})
        if(user.otpExpires<new Date()){
            return res.status(400).json({
                success: false,
                message: "OTP expired"
            })
        }
        const isMatch=await bcrypt.compare(otp,user.otp)
        if(!isMatch){
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            })
        }
        const token=await jwt.sign({id:user._id},process.env.SECRET,{expiresIn:"1h"})
        user.isVerified=true
        await user.save()

        res.status(200).json({
            success: true,
            message: "User verified successfully",
            data: user,
            token
        })
        
    }catch(error){
        res.status(500).json({ error: "Internal server error" })
    }
}

export const loginUser=async (req,res)=>{
    try{
        const {email,password}=req.body
        if(!email|| !password){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            })
        }
        const user=await User.findOne({email})
        if(!user){
            return res.status(400).json({
                success:false,
                message:"User doesnt exist Please Signup"
            })
        }
        if(!user.isVerified){
            return res.status(400).json({
                success:false,
                message:"User doesnt exist Please Signup"
            })
        }
        const isMatch=await bcrypt.compare(password,user.password)
        if(!isMatch){
            return res.status(400).json({
                success:false,
                message:"Incorrect Password"
            })
        }
        const token=await jwt.sign({id:user._id},process.env.SECRET,{expiresIn:"1h"})
        res.status(200).json({
            success:true,
            message:"User logged in successfully",
            data:user,
            token
        })
    }catch(error){
        res.status(500).json({ error: "Internal server error" })
    }
}
