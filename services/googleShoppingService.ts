import { Product } from "../types";

// Type declaration for process.env
declare const process: {
  env: {
    GOOGLE_SEARCH_API_KEY?: string;
    GOOGLE_SEARCH_API_HOST?: string;
  }
};

/**
 * Real-Time Product Search API 响应接口定义 
 * (基于实际 API 返回结构)
 */
interface RealTimeProductResult {
  product_id: string;
  product_title: string;
  product_photo: string;
  price: string; // e.g. "CHF 230.00" or "¥123.00"
  product_offer_page_url: string; // 商品链接
  product_rating?: number;
  product_num_reviews?: number;
  on_sale?: boolean;
}

/**
 * 将 API 数据转换为应用内的 Product 格式
 */
const transformProduct = (item: RealTimeProductResult, keyword: string, index: number): Product => {
  // 解析价格
  let price = 0;
  if (typeof item.price === 'string') {
    // 移除货币符号和逗号，提取数字
    const priceMatch = item.price.replace(/[^\d.]/g, '').match(/[\d.]+/);
    if (priceMatch) {
      price = parseFloat(priceMatch[0]);
    }
  }

  return {
    id: item.product_id || `rtp_${index}_${Date.now()}`,
    title: item.product_title,
    price: price,
    imageUrl: item.product_photo,
    source: '淘宝', // 暂时默认，或者根据 link 域名判断
    link: item.product_offer_page_url,
    tags: item.on_sale ? ['特价'] : [],
    keywords: keyword
  };
};

/**
 * 搜索 Real-Time Product Search
 */
export const searchGoogleShopping = async (keyword: string): Promise<Product[]> => {
  const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const apiHost = process.env.GOOGLE_SEARCH_API_HOST || 'real-time-product-search.p.rapidapi.com';
  
  if (!apiKey) {
    console.warn("⚠️ 未配置 GOOGLE_SEARCH_API_KEY，跳过搜索");
    return [];
  }

  try {
    console.log(`🔍 正在调用 Real-Time Product Search API 搜索: ${keyword}`);
    
    // 构建请求参数
    // country: 'CN' (中国) - 注意这里必须大写 CN
    // language: 'zh' (中文)
    const params = new URLSearchParams({
      q: keyword,
      country: 'CN', 
      language: 'zh',
      limit: '10' 
    });

    // 调用代理端点
    const response = await fetch(`/api/google/search?${params.toString()}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': apiHost,
      }
    });

    if (!response.ok) {
      throw new Error(`Product Search API request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('📦 API原始响应:', data); // Debug用
    
    // 解析返回数据 (适配 data.data.products 结构)
    let products: RealTimeProductResult[] = [];
    
    if (data.data && Array.isArray(data.data.products)) {
      products = data.data.products;
    } else if (data.data && Array.isArray(data.data)) {
      products = data.data;
    }

    console.log(`✅ Product Search 解析到 ${products.length} 个结果`);

    return products.map((p, idx) => transformProduct(p, keyword, idx));

  } catch (error) {
    console.error('❌ Product Search 搜索失败:', error);
    return [];
  }
};


/**
 * 批量搜索
 */
export const batchSearchGoogleShopping = async (
  keywords: string[]
): Promise<Product[]> => {
  // 并行请求，注意 RapidAPI 的并发限制 (Free tier 通常限制 1 QPS)
  // 这里为了安全，我们对关键词进行简单的串行或小批次处理，或者直接 Promise.all (如果关键词不多)
  
  // 暂时仅搜索前 3 个关键词，避免触发速率限制
  const searchKeywords = keywords.slice(0, 3);
  
  const results = await Promise.all(
    searchKeywords.map(keyword => searchGoogleShopping(keyword))
  );

  return results.flat().sort(() => Math.random() - 0.5);
};

