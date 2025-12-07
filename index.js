import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const ai = new GoogleGenAI({ apikey: process.env.GEMINI_API_KEY });
const GEMINI_MODEL = "gemini-2.5-flash";

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

const PORT = 3000;
app.listen(PORT, () => console.log(`Server ready on http://localhost:3000`));

app.post("/api/chat", async (req, res) => {
  try {
    const { conversation } = req.body;

    if (!Array.isArray(conversation)) {
      throw new Error("conversation must be an array!");
    }

    const persona = {
      role: "user",
      parts: [
        {
          text: "[INSTRUKSI]: Jawab semua pertanyaan dalam bahasa Indonesia. Anda adalah seorang ahli Google Gemini AI. Berikan jawaban yang detail, akurat, dan berfokus pada fitur, kemampuan, dan penggunaan Google Gemini AI. Jika pertanyaan tidak terkait dengan Gemini AI, dengan sopan arahkan pengguna untuk bertanya tentang Gemini AI.",
        },
      ],
    };

    const contents = [
      persona,
      ...conversation.map(({ role, content }) => ({
        role,
        parts: [{ text: content }],
      })),
    ];

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
    });

    const output = response.candidates[0].content.parts[0].text;

    res.status(200).json({ result: output });
  } catch (e) {
    console.error(e);
    res.status(500).json({ result: e.message });
  }
});
