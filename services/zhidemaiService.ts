import { Product } from "../types";

// Type declaration for process.env in Vite
declare const process: {
  env: {
    ZHIDEMAI_API_KEY?: string;
  }
};

// 值得买API返回的商品数据格式（根据新API文档）
interface ZhidemaiProduct {
  title: string;
  url: string;
  focus_pic_url: string;
  price: string; // 如 "¥6998.0"
  price_1: string; // 如 "6998.0元"
  mall_id: number;
  mall_name: string;
  prom_info: string[]; // 促销信息数组
  comment_cnt: number;
  sales_cnt: number;
  keyword: string;
  index: number;
  es_recall_cnt: number;
  data_type: number;
}

// API响应格式
interface ZhidemaiApiResponse {
  data: ZhidemaiProduct[][]; // 二维数组，每个关键词对应一个数组
  error_code: number;
  error_msg: string;
}

// 商城ID映射（根据文档示例，247是天猫，8645是拼多多等）
const MALL_ID_MAP: Record<number, '京东' | '天猫' | '淘宝'> = {
  183: '京东',
  247: '天猫',
  243: '淘宝',
};

// 将商城名称/ID映射到应用内格式
const mapSource = (mallId?: number, mallName?: string): '京东' | '天猫' | '淘宝' => {
  if (mallId && MALL_ID_MAP[mallId]) {
    return MALL_ID_MAP[mallId];
  }
  if (mallName) {
    if (mallName.includes('京东')) return '京东';
    if (mallName.includes('天猫')) return '天猫';
    if (mallName.includes('拼多多')) return '淘宝'; // 拼多多映射到淘宝
  }
  return '淘宝';
};

// 将API返回的数据转换为应用内的Product格式
const transformProduct = (item: ZhidemaiProduct, keyword: string, index: number): Product => {
  // 解析价格：优先使用 price_1（纯数字），否则从 price 中提取
  let price = 0;
  if (item.price_1) {
    // "6998.0元" -> 提取数字
    const priceMatch = item.price_1.match(/[\d.]+/);
    if (priceMatch) {
      price = parseFloat(priceMatch[0]);
    }
  } else if (item.price) {
    // "¥6998.0" -> 提取数字
    const priceMatch = item.price.replace(/[^\d.]/g, '').match(/[\d.]+/);
    if (priceMatch) {
      price = parseFloat(priceMatch[0]);
    }
  }

  // 处理图片URL
  let imageUrl = item.focus_pic_url || '';
  if (!imageUrl) {
    imageUrl = `https://picsum.photos/400/300?random=${Date.now() + index}`;
  }
  // 确保https
  if (imageUrl.startsWith('//')) {
    imageUrl = `https:${imageUrl}`;
  }

  // 处理商品链接
  let link = item.url || '#';
  if (link.startsWith('//')) {
    link = `https:${link}`;
  }

  // 处理标签：使用 prom_info（促销信息数组）
  const tags = item.prom_info && item.prom_info.length > 0 
    ? item.prom_info.slice(0, 2) 
    : ['精选好价'];

  return {
    id: `zdm_${keyword}_${index}_${Date.now()}`,
    title: item.title || `${keyword} 精选商品`,
    price: price,
    imageUrl: imageUrl,
    source: mapSource(item.mall_id, item.mall_name),
    link: link,
    tags: tags,
    keywords: keyword || item.keyword || ''
  };
};

/**
 * 通过 REST API 调用值得买商品检索
 * 文档：https://openapi.smzdm.com/v1/agent/search/list
 */
export const searchZhidemai = async (
  keyword: string,
  minPrice?: number,
  maxPrice?: number
): Promise<Product[]> => {
  const apiKey = process.env.ZHIDEMAI_API_KEY;

  if (!apiKey) {
    console.warn("Missing ZHIDEMAI_API_KEY");
    return [];
  }

  try {
    console.log(`🔍 值得买API搜索: ${keyword}`);

    // 根据新API文档，使用 POST 请求，参数只需要 keyword
    const response = await fetch("/api/zhidemai/v1/agent/search/list", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        keyword: keyword
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API request failed: ${response.status} - ${errText}`);
    }

    const data: ZhidemaiApiResponse = await response.json();
    console.log('📦 API原始响应:', data);

    // 检查错误码
    if (data.error_code && data.error_code !== 0) {
      console.warn(`❌ API Error: ${data.error_msg} (Code: ${data.error_code})`);
      return [];
    }

    // 解析返回数据：data 是二维数组，每个关键词对应一个数组
    // 对于单个关键词，data[0] 就是该关键词的结果数组
    const products: Product[] = [];
    
    if (data.data && Array.isArray(data.data) && data.data.length > 0) {
      // 取第一个数组（对应当前关键词）
      const productList = data.data[0];
      
      if (Array.isArray(productList)) {
        productList.forEach((item, idx) => {
          if (item.title && item.url) {
            products.push(transformProduct(item, keyword, idx));
          }
        });
      }
    }

    console.log(`✅ 解析到 ${products.length} 件商品`);
    return products;

  } catch (error) {
    console.error(`❌ 值得买API搜索失败 "${keyword}":`, error);
    return [];
  }
};

/**
 * 批量搜索多个关键词
 * 根据新API文档，可以一次性传入多个关键词（用逗号分隔），也可以分别调用
 * 这里采用一次性调用多个关键词的方式，更高效
 */
export const batchSearchZhidemai = async (
  keywords: string[],
  minPrice?: number,
  maxPrice?: number
): Promise<Product[]> => {
  const apiKey = process.env.ZHIDEMAI_API_KEY;

  if (!apiKey) {
    console.warn("Missing ZHIDEMAI_API_KEY");
    return [];
  }

  if (keywords.length === 0) {
    return [];
  }

  try {
    // 根据API文档，多个关键词用英文逗号分隔
    const keywordString = keywords.join(',');
    console.log(`🔍 值得买API批量搜索: ${keywordString}`);

    const response = await fetch("/api/zhidemai/v1/agent/search/list", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        keyword: keywordString
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API request failed: ${response.status} - ${errText}`);
    }

    const data: ZhidemaiApiResponse = await response.json();
    console.log('📦 API批量搜索响应:', data);

    // 检查错误码
    if (data.error_code && data.error_code !== 0) {
      console.warn(`❌ API Error: ${data.error_msg} (Code: ${data.error_code})`);
      return [];
    }

    // 解析返回数据：data 是二维数组，每个关键词对应一个数组
    const allProducts: Product[] = [];
    
    if (data.data && Array.isArray(data.data)) {
      data.data.forEach((productList, keywordIndex) => {
        if (Array.isArray(productList)) {
          const keyword = keywords[keywordIndex] || '';
          productList.forEach((item, idx) => {
            if (item.title && item.url) {
              allProducts.push(transformProduct(item, keyword, idx));
            }
          });
        }
      });
    }

    // 去重
    const uniqueProducts: Product[] = [];
    const seenTitles = new Set<string>();

    for (const product of allProducts) {
      const normalizedTitle = product.title.slice(0, 30);
      if (!seenTitles.has(normalizedTitle)) {
        seenTitles.add(normalizedTitle);
        uniqueProducts.push(product);
      }
    }

    console.log(`✅ 批量搜索解析到 ${uniqueProducts.length} 件商品`);
    return uniqueProducts.sort(() => Math.random() - 0.5);

  } catch (error) {
    console.error(`❌ 值得买API批量搜索失败:`, error);
    // 降级：如果批量搜索失败，尝试单个搜索
    console.log('⚠️ 批量搜索失败，降级为单个关键词搜索...');
    const results = await Promise.all(
      keywords.map(keyword => searchZhidemai(keyword, minPrice, maxPrice))
    );
    return results.flat().sort(() => Math.random() - 0.5);
  }
};
