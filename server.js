const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const fetch = require("node-fetch");

dotenv.config();
const app = express();

/* ✅ CORS Configuration */
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

/* ✅ Test Route */
app.get("/", (req, res) => {
  res.send("Server is working 🚀");
});

/* ✅ Chat Route */
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

    if (!response.ok) {
  console.log("DeepSeek Error Response:", data);

  return res.status(response.status).json({
    error: data.error ? data.error.message : JSON.stringify(data)
  });
}
    res.json(data);

  } catch (error) {
    console.log("Server Error:", error);
    res.status(500).json({ error: error.message });
});

/* ✅ Port Binding (Very Important for Render) */
app.listen(process.env.PORT || 3000, () => {
  console.log("Server running on port", process.env.PORT || 3000);
});
