import express from "express"
import {createChat,getChats} from '../controllers/chatControllers.js'
import { authMiddleware } from "../middleware/authMiddleware.js"
const router= express.Router()

router.post('/new-chat',authMiddleware ,createChat)
router.get('/chats',authMiddleware ,getChats)
export default router