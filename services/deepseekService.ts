import { GiftRequest, AiKeywordResponse } from "../types";

// Polyfill type definition for process to avoid linter errors in Vite environment
declare const process: {
  env: {
    DEEPSEEK_API_KEY?: string;
    API_KEY?: string;
  }
};

export const generateGiftKeywords = async (request: GiftRequest): Promise<AiKeywordResponse> => {
  // Try to get the key from specific env var, fallback to generic API_KEY
  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.API_KEY;

  if (!apiKey) {
      console.error("Missing DeepSeek API Key");
      return {
          keywords: ["高档巧克力", "精美香薰", "定制马克杯", "拍立得", "乐高"],
          reasoning: "请先配置 DeepSeek API Key 才能使用 AI 推荐功能哦！"
      };
  }

  // 根据预算范围给出价位提示
  const avgBudget = (request.budgetMin + request.budgetMax) / 2;
  let priceGuidance = '';
  if (avgBudget < 100) {
    priceGuidance = '预算较低（100元以内），请推荐实用小物、创意文具、小饰品、零食礼盒等平价商品';
  } else if (avgBudget < 300) {
    priceGuidance = '预算中等（100-300元），请推荐品牌化妆品、小家电、书籍、香薰、茶具等中档商品';
  } else if (avgBudget < 1000) {
    priceGuidance = '预算较高（300-1000元），请推荐品牌护肤品、电子产品、品牌服饰、精品摆件等中高端商品';
  } else {
    priceGuidance = '预算较高（1000元以上），请推荐高端品牌商品、数码产品、奢侈品、定制礼品等高端商品';
  }

  const prompt = `
你是一位贴心的送礼顾问，请根据以下信息为用户推荐礼物。

【送礼对象信息】
- 昵称：${request.nickname}
- 关系：${request.relation}
- 性别：${request.gender === 'male' ? '男' : request.gender === 'female' ? '女' : '未指定'}
- 送礼场合：${request.occasion}
- 预算范围：${request.budgetMin} - ${request.budgetMax} 元（平均约 ${Math.round(avgBudget)} 元）
- 兴趣爱好：${request.interests.join('、') || '未填写'}
- 备注信息：${request.remarks || '无'}

【重要要求 - 预算匹配】
${priceGuidance}
**关键约束**：你生成的所有关键词对应的商品，其市场价格必须符合预算范围 ${request.budgetMin}-${request.budgetMax} 元。
- 如果预算较低（<100元），不要推荐"戴森吹风机"、"SK-II神仙水"等高价商品
- 如果预算较高（>1000元），不要推荐"定制马克杯"、"小饰品"等低价商品
- 确保每个关键词搜索出的商品价格都在预算区间内

【任务要求】
1. 根据以上信息，生成 5-8 个具体的、可以直接在电商平台搜索的礼物关键词
2. 关键词必须是中文，每个关键词控制在10个字以内
3. 避免"礼物"、"礼品"等笼统词汇，要具体到产品名，如"乐高花束"、"雅诗兰黛小棕瓶"、"小米手环8"
4. **每个关键词必须对应符合预算价位的商品**，确保搜索结果的价格在 ${request.budgetMin}-${request.budgetMax} 元范围内
5. 同时提供一句温暖治愈的推荐理由（30字左右）

请严格按以下 JSON 格式输出：
{
  "keywords": ["关键词1", "关键词2", ...],
  "reasoning": "推荐理由"
}
  `;

  try {
    // Use local proxy to avoid CORS issues
    const response = await fetch("/api/deepseek/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "你是一个专业的送礼顾问助手，擅长根据用户需求推荐合适的礼物。请始终使用中文回复，并严格按照要求的 JSON 格式输出。" },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7
      })
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API Request failed: ${response.status} ${response.statusText} - ${errText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error("Invalid response format from DeepSeek");
    }

    let content = data.choices[0].message.content;
    
    // Clean up potential Markdown code blocks (e.g. ```json ... ```)
    if (content.startsWith("```")) {
        content = content.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/```$/, "");
    }

    return JSON.parse(content) as AiKeywordResponse;

  } catch (error) {
    console.error("DeepSeek API Generation Error:", error);
    // Fallback if AI fails
    return {
      keywords: ["高档巧克力", "精美香薰", "定制马克杯", "拍立得", "乐高"],
      reasoning: "AI 似乎在思考人生（网络或 Key 异常），但我为您挑选了一些经典的通用好礼！"
    };
  }
};

