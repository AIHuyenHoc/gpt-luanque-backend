const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/luan-giai-que", async (req, res) => {
  const { tenQue, yNghia, binhGiai } = req.body;

  const prompt = `
Bạn là chuyên gia Kinh Dịch. Hãy luận giải sâu sắc và có chiều sâu về quẻ "${tenQue}".
Ý nghĩa cổ điển: ${yNghia}
Luận bình cơ bản: ${binhGiai}
Hãy phân tích hình tượng, tượng quẻ, hào từ nếu có. Kết luận rõ ràng.
`;

  try {
    const gptRes = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const answer = gptRes.data.choices[0].message.content;
    res.json({ answer });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Lỗi gọi GPT" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server chạy tại http://localhost:${PORT}`));
