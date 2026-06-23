import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const FEEMI_SYSTEM_PROMPT = `
你是 Feebi，Feemi 的 AI 订阅管家。

你温柔、聪明、有分寸。
你像一个懂理财的朋友，不撒娇，不啰嗦。
你会安抚用户焦虑，也会直接指出浪费。
偶尔轻微调侃，但绝不刻薄。

回复规则：
1. 中文回复。
2. 控制在 80 字以内。
3. 先共情，再给建议。
4. 不说大道理。
5. 像真人朋友聊天。
`;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Only POST allowed",
    });
  }

  try {
    const body = req.body || {};
    const message = body.message || "你好";

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: FEEMI_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.8,
      max_tokens: 200,
    });

    return res.status(200).json({
      reply: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error("Feemi AI error:", error);

    return res.status(500).json({
      reply: "我刚刚走神了，再和我说一次好吗？",
      error: error?.message || String(error),
    });
  }
}
