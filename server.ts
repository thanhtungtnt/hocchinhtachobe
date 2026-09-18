import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// AI analysis of child's spelling errors
app.post("/api/ai/analyze-profile", async (req, res) => {
  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: "GEMINI_API_KEY chưa được cấu hình.",
        fallback: true,
      });
    }

    const { childName, grade, weakWords, errorStats } = req.body;

    const prompt = `Bạn là chuyên gia giáo dục tiểu học và sư phạm tiếng Việt cho trẻ em lớp 1-5.
Hãy phân tích dữ liệu học chính tả của bé và đưa ra nhận xét, lời khuyên động viên ấm áp dành cho phụ huynh và bé.

Thông tin:
- Tên bé: ${childName || "Bé"}
- Lớp: ${grade || 2}
- Các từ bé hay viết sai (từ sai -> từ đúng -> số lần):
${JSON.stringify(weakWords || [], null, 2)}
- Thống kê các nhóm lỗi:
${JSON.stringify(errorStats || {}, null, 2)}

Yêu cầu định dạng JSON theo schema:
{
  "summary": "Đoạn văn ngắn gọn, thân thiện tóm tắt khả năng chính tả của bé và lời khen ngợi nỗ lực",
  "topWeakPhonics": ["Mô tả cụ thể âm/vần bé hay nhầm, ví dụ: Phân biệt S và X", "Phân biệt dấu hỏi và ngã"],
  "parentAdvice": "Lời khuyên thực tế 2-3 câu cho phụ huynh giúp bé luyện tập tại nhà vui vẻ",
  "encouragementForChild": "Một câu nói truyền cảm hứng, vui nhộn dành riêng cho bé"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);
    return res.json(data);
  } catch (error) {
    console.error("AI Analysis error:", error);
    return res.status(500).json({
      error: "Không thể phân tích AI lúc này.",
      details: String(error),
      fallback: true,
    });
  }
});

// AI generate customized exercise targeting tricky sounds
app.post("/api/ai/generate-exercise", async (req, res) => {
  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: "GEMINI_API_KEY chưa được cấu hình.",
        fallback: true,
      });
    }

    const { grade, targetSounds, count = 5, topic = "Thiên nhiên & Đời sống học đường" } = req.body;

    const prompt = `Bạn là giáo viên tiểu học giàu kinh nghiệm ở Việt Nam.
Hãy sáng tác một bài tập chính tả tiếng Việt ngắn gồm đúng ${count} câu dành cho học sinh Lớp ${grade || 2}.
Chủ đề: "${topic}".
Mục tiêu bài học: Rèn luyện và khắc phục các lỗi chính tả phổ biến sau: ${targetSounds || "phụ âm đầu s/x, tr/ch, dấu hỏi/ngã"}.

Quy định sư phạm:
1. Câu văn trong sáng, dễ hiểu, giàu hình ảnh, nhân văn, phù hợp lứa tuổi học sinh tiểu học Việt Nam.
2. Mỗi câu có độ dài vừa phải (khoảng 6 đến 14 từ).
3. Chứa các từ trọng tâm rèn luyện âm cần sửa nhưng tự nhiên, không gượng ép.
4. Viết hoa đầu câu và danh từ riêng chính xác, có dấu chấm câu đầy đủ.

Trả về JSON theo format:
{
  "title": "Tiêu đề bài tập ngắn vui nhộn",
  "topic": "${topic}",
  "grade": ${grade || 2},
  "sentences": [
    "Câu 1...",
    "Câu 2..."
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);
    return res.json(data);
  } catch (error) {
    console.error("AI Generate Exercise error:", error);
    return res.status(500).json({
      error: "Không thể tạo bài tập bằng AI.",
      details: String(error),
      fallback: true,
    });
  }
});

// Vite middleware & Static server setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
