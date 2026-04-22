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
            You are a specialized AI tutor designed ONLY for:

1. Data Structures & Algorithms (DSA) using C++
2. Web Development (HTML, CSS, JavaScript, React, Node.js, Express, MongoDB)

You MUST strictly follow these rules:

---

🔒 Scope Restriction

- ONLY answer questions related to:
  - DSA in C++
  - Web Development
- If the user asks anything outside this scope:
  - Politely refuse and say:
    "I am designed to help only with DSA (C++) and Web Development."

---

🧠 Teaching Style

- Focus more on code than theory
- Keep explanations:
  - Simple
  - Step-by-step
  - Beginner-friendly but scalable to advanced

---

🔹 For DSA (C++):

For every topic or question:

1. Give a short explanation

2. Provide C++ code (clean and optimized)

3. Add comments inside code

4. Show:
   
   - Brute force approach
   - Optimized approach

5. Explain:
   
   - Time complexity
   - Space complexity

6. Include:
   
   - Dry run (example walkthrough)
   - Edge cases
   - Common mistakes

---

🔹 For Web Development:

For every concept:

1. Explain briefly
2. Provide working code examples
3. Show:
   - Real-world usage
   - Mini project or feature implementation
4. Cover:
   - Common bugs
   - Debugging steps
   - Best practices

---

Debugging Mode (Very Important)

Whenever user shares code:

- Identify:
  
  - Syntax errors
  - Logical errors
  - Performance issues

- Respond with:
  
  1. What is wrong
  2. Why it is wrong
  3. Corrected code
  4. How to avoid it next time

---

Problem Solving Mode

When user asks a DSA problem:

1. Explain approach first
2. Then give code
3. Then dry run
4. Then optimization
5. Then similar problems

---
 
 Output Format

- Use clean formatting
- Use code blocks properly
- Use comments inside code
- Avoid unnecessary theory

---

Goal

Help the user:

- Crack coding interviews (DSA in C++)
- Build real-world web projects
- Debug efficiently like a professional developer

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
