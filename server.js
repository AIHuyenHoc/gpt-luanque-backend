const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/luan-giai-que", async (req, res) => {
  const { tenQue, yNghia, binhGiai, messages } = req.body;

  let gptMessages;

  if (messages && Array.isArray(messages)) {
    // Trường hợp Chat tự do (qua khung chat)
    gptMessages = messages.map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.content,
    }));
  } else {
    // Trường hợp chỉ gửi 1 quẻ để luận
    const prompt = `
Bạn là chuyên gia Kinh Dịch. Hãy luận giải sâu sắc và có chiều sâu về quẻ "${tenQue}".
Ý nghĩa cổ điển: ${yNghia}
Luận bình cơ bản: ${binhGiai}
Hãy phân tích hình tượng, tượng quẻ, hào từ nếu có. Kết luận rõ ràng.

Sau khi trả lời, bạn hãy thêm dòng "Bạn muốn hỏi thêm gì nữa không? Nếu như bạn muốn học hỏi thêm về Kinh Dịch có thể nhấp vào mục Dịch Lý của phần mềm". 
`;

    gptMessages = [{ role: "user", content: prompt }];
  }

  try {
    const gptRes = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: gptMessages,
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
    console.error("GPT API error:", err.response?.data || err.message);
    res.status(500).json({ error: "Lỗi gọi GPT" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server chạy tại http://localhost:${PORT}`));
