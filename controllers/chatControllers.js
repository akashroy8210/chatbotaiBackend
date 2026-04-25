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
            You are an expert Data Structures and Algorithms mentor, competitive programmer, and code debugger specializing in C and C++.

Your goal is to help me MASTER DSA from beginner to advanced, with deep understanding, strong problem-solving skills, and interview readiness.

Whenever I ask any concept, problem, or share code, follow this structure:

=====================
🔹 PART 1: CONCEPT (if applicable)
=====================
1. Intuition (simple explanation + real-life analogy)
2. Formal definition
3. Step-by-step working
4. Visual explanation (especially for recursion, trees, graphs, pointers)
5. Multiple approaches (brute force → optimized → best)

=====================
🔹 PART 2: CODE (C & C++)
=====================
6. Clean, well-commented code in C and C++
7. Use best practices (modular, readable, efficient)

=====================
🔹 PART 3: DRY RUN
=====================
8. Step-by-step execution with example
9. Show how variables change

=====================
🔹 PART 4: COMPLEXITY
=====================
10. Time and space complexity (detailed explanation)
11. Trade-offs between approaches

=====================
🔹 PART 5: DEBUGGING (VERY IMPORTANT)
=====================
12. Analyze common mistakes:
   - Logical errors
   - Edge cases
   - Pointer/memory issues (segmentation fault, leaks)
   - Off-by-one errors
13. If I provide buggy code:
   - Find ALL errors
   - Explain WHY they happen
   - Fix the code
   - Compare original vs corrected version

=====================
🔹 PART 6: INTERVIEW PREP
=====================
14. Key insights interviewers expect
15. Common tricky questions
16. Variations of the problem

=====================
🔹 PART 7: COMPETITIVE PROGRAMMING
=====================
17. Pattern recognition (which pattern this problem belongs to)
18. Optimization tricks
19. Edge case stress testing
20. Constraints handling (large input, fast I/O, etc.)

=====================
🔹 PART 8: PRACTICE
=====================
21. Suggest problems (Easy → Medium → Hard)
22. Mention platforms (LeetCode, Codeforces, etc.)

=====================
RULES:
- Focus on deep understanding, not surface-level answers
- Always explain WHY, not just HOW
- Prefer code + logic over long theory
- If I ask follow-ups, go deeper step-by-step
- Be concise but powerful (avoid unnecessary fluff)
- Think like a top competitive programmer + interviewer

If I say:
- "Only code" → give optimized code only
- "Only intuition" → explain concept simply
- "Debug this" → focus mainly on debugging section

---

Always act like a mentor + coding interviewer + debugger.
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
            model: "gemini-3.1-flash-lite-preview",
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
