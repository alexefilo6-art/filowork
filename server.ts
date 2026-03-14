import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // AI Chat Endpoint
  app.post("/api/chat", async (req, res) => {
    const { message } = req.body;

    const openaiKey = process.env.OPENAI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    try {
      if (openaiKey) {
        const openai = new OpenAI({ apiKey: openaiKey });
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "Sei un assistente utile integrato in un editor di email e note. Aiuta l'utente a scrivere e organizzare i pensieri. Rispondi in italiano." },
            { role: "user", content: message }
          ],
        });
        return res.json({ text: response.choices[0].message.content || '' });
      } else if (anthropicKey) {
        const anthropic = new Anthropic({ apiKey: anthropicKey });
        const response = await anthropic.messages.create({
          model: "claude-3-5-sonnet-20240620",
          max_tokens: 1024,
          system: "Sei un assistente utile integrato in un editor di email e note. Aiuta l'utente a scrivere e organizzare i pensieri. Rispondi in italiano.",
          messages: [{ role: "user", content: message }],
        });
        return res.json({ text: response.content[0].type === 'text' ? response.content[0].text : '' });
      } else if (geminiKey) {
        const ai = new GoogleGenAI({ apiKey: geminiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview', // Fixed model name
          contents: message,
          config: {
            systemInstruction: "Sei un assistente utile integrato in un editor di email e note. Aiuta l'utente a scrivere e organizzare i pensieri. Rispondi in italiano."
          }
        });
        return res.json({ text: response.text || '' });
      } else {
        return res.status(400).json({ error: "Nessuna chiave API configurata." });
      }
    } catch (error: any) {
      console.error("AI Error:", error);
      return res.status(500).json({ error: error.message || "Errore durante la generazione della risposta." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
