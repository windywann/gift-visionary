import { Product } from "../types";

// Type declaration for process.env in Vite
declare const process: {
  env: {
    IMAGE_SEARCH_ID?: string;
    IMAGE_SEARCH_KEY?: string;
    DEEPSEEK_API_KEY?: string;
    API_KEY?: string;
  }
};

/**
 * 通过 DeepSeek API 获取商品的常见价格
 * @param keyword 商品关键词
 * @returns 返回商品的平均/常见价格（数字），如果失败返回 null
 */
const getProductPriceFromAI = async (keyword: string): Promise<number | null> => {
  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.API_KEY;

  if (!apiKey) {
    console.warn("缺少 DeepSeek API Key，无法获取商品价格");
    return null;
  }

  try {
    const prompt = `
请告诉我"${keyword}"这个商品在市场上的常见价格或平均价格。

要求：
1. 只返回一个数字（人民币价格，单位：元）
2. 不要包含任何文字说明，只返回纯数字
3. 如果该商品有多种价位，请返回最常见的价位
4. 如果该商品价格范围较大，请返回价格区间的中位数

示例：
- 输入："iPhone 15" -> 输出：5999
- 输入："乐高积木" -> 输出：299
- 输入："香薰蜡烛" -> 输出：89

请直接返回数字，不要有任何其他内容。
    `;

    const response = await fetch("/api/deepseek/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "你是一个价格查询助手。请只返回数字，不要包含任何文字说明。" },
          { role: "user", content: prompt }
        ],
        temperature: 0.3, // 降低温度以获得更一致的结果
        max_tokens: 50 // 限制输出长度
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Invalid response format from DeepSeek");
    }

    let content = data.choices[0].message.content.trim();
    
    // 清理可能的 Markdown 代码块
    if (content.startsWith("```")) {
      content = content.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/```$/, "");
    }

    // 提取数字（可能包含小数点）
    const priceMatch = content.match(/[\d.]+/);
    if (priceMatch) {
      const price = parseFloat(priceMatch[0]);
      if (!isNaN(price) && price > 0) {
        return Math.round(price); // 返回整数价格
      }
    }

    return null;
  } catch (error) {
    console.warn(`获取商品价格失败 (${keyword}):`, error);
    return null;
  }
};

/**
 * 关键词图片搜索（用于 MCP 失败时的兜底展示）
 * 数据来源：cn.apihz.cn
 * @param keyword 搜索关键词
 * @param minPrice 价格区间最小值
 * @param maxPrice 价格区间最大值
 * @returns 最多返回2个商品结果，价格在指定区间内随机生成
 */
export const searchImagesByKeyword = async (
  keyword: string,
  minPrice: number,
  maxPrice: number
): Promise<Product[]> => {
  const id = process.env.IMAGE_SEARCH_ID;
  const key = process.env.IMAGE_SEARCH_KEY;

  if (!id || !key) {
    console.warn("缺少 IMAGE_SEARCH_ID 或 IMAGE_SEARCH_KEY，跳过图片兜底搜索");
    return [];
  }

  try {
    const params = new URLSearchParams({
      id,
      key,
      words: keyword,
      page: "1",
      type: "1",
    });

    // 使用本地代理以避免浏览器 CORS
    const resp = await fetch(`/api/imgsearch/api/img/apihzimgsougou.php?${params.toString()}`);

    if (!resp.ok) {
      throw new Error(`Image search failed: ${resp.status} ${resp.statusText}`);
    }

    const data = await resp.json();
    if (data.code !== 200 || !Array.isArray(data.res)) {
      console.warn("图片搜索返回非200或数据格式异常", data);
      return [];
    }

    const urls: string[] = data.res;

    // 每个关键词最多返回1个结果
    const maxResults = 1;
    const selectedUrls = urls.slice(0, maxResults);

    // 通过 AI 获取商品价格，并确保在预算区间内
    const getPriceInBudget = async (keyword: string): Promise<number> => {
      const validMin = Math.max(0, minPrice);
      const validMax = Math.max(validMin, maxPrice);
      
      // 如果预算区间只有一个值，直接返回
      if (validMin === validMax) {
        return validMin;
      }

      // 尝试从 AI 获取商品常见价格
      const aiPrice = await getProductPriceFromAI(keyword);
      
      if (aiPrice !== null) {
        // AI 返回了价格，需要调整到预算区间内
        if (aiPrice < validMin) {
          // 如果 AI 价格低于预算下限，使用预算下限（或稍微高一点，但不超过上限）
          return validMin;
        } else if (aiPrice > validMax) {
          // 如果 AI 价格高于预算上限，使用预算上限
          return validMax;
        } else {
          // AI 价格在预算区间内，直接使用
          return aiPrice;
        }
      }

      // AI 调用失败，使用预算区间的中间值作为兜底
      const fallbackPrice = Math.round((validMin + validMax) / 2);
      console.log(`⚠️ AI 价格获取失败，使用预算中间值: ${fallbackPrice}`);
      return fallbackPrice;
    };

    // 随机选择平台
    const SOURCES: ('京东' | '天猫' | '淘宝')[] = ['京东', '天猫', '淘宝'];
    const getRandomSource = () => SOURCES[Math.floor(Math.random() * SOURCES.length)];

    // 根据平台生成搜索链接
    const generateSearchLink = (source: '京东' | '天猫' | '淘宝', keyword: string): string => {
      const encodedKeyword = encodeURIComponent(keyword);
      switch (source) {
        case '京东':
          // 使用京东搜索的基础URL，避免自动启用"仅显示有货"等筛选
          // 使用 w 参数而不是 keyword 参数，可以避免某些默认筛选条件
          return `https://search.jd.com/Search?keyword=${encodedKeyword}`;
        case '天猫':
          return `https://list.tmall.com/search_product.htm?q=${encodedKeyword}`;
        case '淘宝':
        default:
          return `https://s.taobao.com/search?q=${encodedKeyword}`;
      }
    };

    // 获取价格（异步）
    const price = await getPriceInBudget(keyword);

    return selectedUrls.map((url, index) => {
      const source = getRandomSource();
      return {
        id: `img_${keyword}_${index}_${Date.now()}`,
        title: keyword,
        price: price,
        imageUrl: url.startsWith("//") ? `https:${url}` : url,
        source: source,
        link: generateSearchLink(source, keyword),
        tags: ["图片搜索"],
        keywords: keyword,
      };
    });
  } catch (err) {
    console.error(`图片搜索兜底失败 (${keyword}):`, err);
    return [];
  }
};


