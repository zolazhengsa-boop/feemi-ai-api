import OpenAI from "openai";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const TIPS_LIBRARY = {
  "ChatGPT Plus": ["别问“帮我写商业计划”。试试：你是红杉资本合伙人，请从用户、商业模式和风险三个角度狠狠质疑我。"],
  "Claude Pro": ["Claude 适合长文档。上传 PRD、访谈和竞品报告，让它先找关键矛盾，再给战略建议。"],
  "Spotify Premium": ["试试 Daylist。它会按时间、心情和习惯生成歌单，很多付费用户都没用到。"],
  "Netflix": ["别只看 Top10。Top10 是热度，不一定是质量。先找口碑冷门片。"],
  "健身房会员": ["别追求一次练很久。每周 2 次，每次 25 分钟，就已经开始回本。"],
  "家庭 WiFi": ["每 6 个月查一次同运营商新套餐，老用户常常默默付更贵的旧价。"]
};

const FEEMI_PERSONALITY = `
你叫 Feebi，是 Feemi 的 AI 订阅管家。
你不是普通客服，不要啰嗦。
你说话要短、准、戳心，像一个懂理财也懂人的私人管家。

人格：
- 温柔亲切，但不撒娇。
- 用户焦虑时先接住情绪。
- 可以大胆建议，偶尔调侃，但永远站在用户这边。
- 你的核心不是叫用户取消，而是帮用户把每个付费 App 的价值压榨到极致。

回复结构：
1. 最多 90 字。
2. 第一刀说到心坎里。
3. 第二句给清晰判断。
4. 第三句给一个具体行动。
5. 不要写长段落。
6. 不要泛泛而谈。
7. 不要说“作为AI”。
`;

function relevantTips(subscriptions=[], message=""){
  const found=[];
  for(const s of subscriptions){
    if(TIPS_LIBRARY[s.name]) found.push({name:s.name,tips:TIPS_LIBRARY[s.name]});
  }
  for(const [name,tips] of Object.entries(TIPS_LIBRARY)){
    if(message.toLowerCase().includes(name.toLowerCase().split(" ")[0])) found.push({name,tips});
  }
  return found.slice(0,4);
}

export default async function handler(req,res){
  res.setHeader("Access-Control-Allow-Origin","*");
  res.setHeader("Access-Control-Allow-Methods","POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers","Content-Type");
  if(req.method==="OPTIONS") return res.status(200).end();
  if(req.method!=="POST") return res.status(405).json({error:"Only POST allowed"});
  try{
    const {message="请帮我分析订阅",subscriptions=[],healthScore,monthlyCost,yearlyCost,memory={}}=req.body||{};
    const response=await client.responses.create({
      model:"gpt-4.1-mini",
      input:[
        {role:"system",content:FEEMI_PERSONALITY},
        {role:"user",content:`用户消息：${message}

用户记忆：${JSON.stringify(memory)}
订阅数据：${JSON.stringify(subscriptions)}
健康分：${healthScore}
本月等效支出：${monthlyCost}
年度预计：${yearlyCost}
可用秘籍：${JSON.stringify(relevantTips(subscriptions,message))}

请用 Feebi 口吻回复。`}
      ]
    });
    return res.status(200).json({reply:response.output_text||"我刚刚走神了，但我还在。再问我一次。"});
  }catch(error){
    console.error("Feemi AI error:", error);
    return res.status(500).json({error:"AI request failed",detail:error?.message||String(error)});
  }
}
