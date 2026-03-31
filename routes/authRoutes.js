import  express from "express";
import {loginUser, signupUser,verifyOtp} from '../controllers/UserControllers.js'
const router=express.Router()

router.post('/signup' ,signupUser)
router.post('/verify-otp',verifyOtp)
router.post('/login',loginUser)
export default router