import Chat from "../models/chatModel.js"
import "dotenv/config"
import { GoogleGenAI } from "@google/genai"
import User from "../models/userModel.js"
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
})

export const createChat = async (req, res) => {
    try {
        let chat;
        const { userMessage, chatId } = req.body
        const userId = req.user._id
        if (chatId) {
            chat = await Chat.findOne({ _id: chatId, userId })
        } else {
            chat = new Chat({
                userId: req.user._id,
                title: userMessage.slice(0, 20),
                messages: []
            })
        }
        chat.messages.push({
            role: "user",
            content: userMessage
        })
        const history = chat.messages.map((m) => m.content).join("\n")

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Answer in clean markdown with headings, bullet points and spacing.\n User question: ${userMessage}`
        })
        const replyText = response.text || "no response generated"
        chat.messages.push({
            role: "assistant",
            content: replyText
        })
        await chat.save()
        res.status(200).json({
            success: true,
            reply: replyText,
            chatId: chat._id,
            messages: chat.messages
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const getChats=async (req,res)=>{
    try{
        const userId=req.user._id
        const chats=await Chat.find({userId})
        res.status(200).json({
            success:true,
            chats
        })
    }catch(error){
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}
