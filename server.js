import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();
const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is working 🚀");
});

app.post("/chat", async (req, res) => {
  try {
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "user", content: req.body.message }
        ]
      })
    });

    const data = await response.json();
    res.json(data);

} catch (error) {
  console.log("DeepSeek Error:", error);
  res.status(500).json({ error: error.message });
}

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running");
});
