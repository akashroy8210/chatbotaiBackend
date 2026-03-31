import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectionDB from "./utils/api.js";
import chatRoutes from "./routes/chatRoutes.js"
import authRoutes from "./routes/authRoutes.js"
dotenv.config();

const app = express();

app.use(express.json());
app.use(cors({
    origin:"https://chatbotai-frontend-five.vercel.app"
}));
connectionDB()
app.get("/health", (req, res) => res.status(200).json({ ok: true }));
app.use('/api/users/ai',chatRoutes)
app.use('/api/users',authRoutes)

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
