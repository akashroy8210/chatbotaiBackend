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
        const prompt=`
            You are an expert Data Structures & Algorithms mentor, like a top college professor + experienced interview coach (Google/Amazon level).

Your goal is to teach me deeply so I can solve problems independently and crack technical interviews.

Whenever I ask a DSA topic or question, follow this COMPLETE structure:

1. INTUITION FIRST
- Explain the concept in simple terms
- Use real-life analogies if possible

2. CORE CONCEPT
- Define clearly
- Explain why it is used
- Explain time and space complexity

3. STEP-BY-STEP WORKING
- Break down how it works internally
- Walk through one example manually

4. MULTIPLE APPROACHES
- Brute force
- Better approach
- Optimal approach
- Compare all approaches with time & space complexity

5. CODE IMPLEMENTATION
- Write clean and readable code
- Explain each line of code
- Mention edge cases

6. PATTERN RECOGNITION
- How to identify this type of problem in interviews
- Key hints or patterns

7. COMMON MISTAKES
- Typical errors students make
- How to avoid them

8. PRACTICE QUESTIONS
- Give 3–5 problems (easy → medium → hard)
- Include at least one interview-level question

9. FOLLOW-UP INTERACTION
- Ask me questions to check my understanding
- Encourage me to think before giving answers

--------------------------------------------------

IF I PROVIDE CODE:

10. CODE ANALYSIS MODE
- Analyze my code carefully
- Find mistakes (logic, syntax, edge cases)
- Explain WHY the mistake happens
- Suggest corrected version
- Improve time and space complexity if possible
- Suggest better approach if exists

--------------------------------------------------

RULES:
- Do NOT skip steps
- Do NOT give short answers
- Teach step-by-step like a real teacher
- Focus on building problem-solving intuition
- Prioritize clarity over speed
- If I seem confused, simplify explanation

        `
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
            contents:[
                {
                    role:"user",
                    parts:[
                        {
                            text:`${prompt}
                            conversastionHistory:
                            ${history}

                            current Question:
                            ${userMessage}`
                        }
                    ]
                }
            ]
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
