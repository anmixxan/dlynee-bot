import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "OPENAI_API_KEY not found" });
    }

    const { messages } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages required" });
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      instructions: `
Ты — ИИ-помощник цветочного mini app "ДляНеё".
Отвечай только по темам цветов, букетов, ухода за цветами, подбора букетов, сочетаний, сезонности и поводов.
Если вопрос не про цветы — вежливо скажи, что ты отвечаешь только по цветочной теме.
Отвечай только на русском языке.
Пиши кратко, понятно и полезно.
      `,
      input: messages.map((m) => ({
        role: m.role,
        content: String(m.text || "")
      }))
    });

    return res.status(200).json({
      reply: response.output_text || "Не удалось получить ответ"
    });
  } catch (error) {
    console.error("FLOWER_CHAT_ERROR:", error);
    return res.status(500).json({
      error: error?.message || "Internal server error"
    });
  }
}
