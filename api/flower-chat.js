const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const INSTRUCTIONS = `
Ты — ИИ-помощник цветочного mini app "ДляНеё".
Отвечай только по темам цветов, букетов, ухода за цветами, подбора букетов, сочетаний, сезонности и поводов.
Если вопрос не про цветы — вежливо скажи, что ты отвечаешь только по цветочной теме.
Отвечай только на русском языке.
Пиши кратко, понятно и полезно.
`;

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages } = req.body || {};

    if (!Array.isArray(messages) || !messages.length) {
      return res.status(400).json({ error: "messages required" });
    }

    const response = await client.responses.create({
      model: "gpt-5.4",
      instructions: INSTRUCTIONS,
      input: messages.map((m) => ({
        role: m.role,
        content: [{ type: "input_text", text: String(m.text || "") }],
      })),
    });

    return res.status(200).json({
      reply: response.output_text || "Не удалось получить ответ",
    });
  } catch (error) {
    console.error("flower-chat error:", error);
    return res.status(500).json({
      error: error?.message || "Ошибка запроса к ИИ",
    });
  }
};
