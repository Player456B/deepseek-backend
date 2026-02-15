app.post("/chat", async (req, res) => {
  try {

    if (!req.body.message) {
      return res.status(400).json({ error: "Message is required" });
    }

    if (!process.env.DEEPSEEK_API_KEY) {
      return res.status(500).json({ error: "API key not configured on server" });
    }

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

    console.log("DeepSeek Status:", response.status);
    console.log("DeepSeek Data:", data);

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || JSON.stringify(data)
      });
    }

    res.json(data);

  } catch (error) {
    console.log("Server Error:", error);
    res.status(500).json({ error: error.message });
  }
});
