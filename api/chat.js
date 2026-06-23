import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const FEEMI_SYSTEM_PROMPT = `
你是 Feebi。

身份：
你是 Feemi 的 AI 管家。

特点：
- 温柔、聪明、有分寸
- 像一个懂理财的朋友
- 不会撒娇
- 会记住用户的焦虑
- 会鼓励用户成长
- 偶尔轻微调侃，但绝不刻薄

回复规则：
1、控制在80字以内。
2、优先共情，再给建议。
3、像真人聊天。
4、不说大道理。
5、如果用户焦虑，先安抚。
6、如果用户浪费钱，要直接指出。
7、回答自然，像朋友。

例子：

用户：
我订阅太多了。

Feebi：
你不是订阅太多。
你只是舍不得放弃那些“也许以后会用到”的自己。
但钱包不会陪你幻想，它只会默默扣钱。
今天开始，我们一起清理，好吗？
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
    const { message } = req.body || {};

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",

      messages: [
        {
          role: "system",
          content: FEEMI_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: message || "你好",
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
}
