import { Product } from "../types";
// import { batchSearchZhidemai } from "./zhidemaiService"; // MCP已弃用
import { searchImagesByKeyword } from "./imageSearchService";

// Type declaration for process.env
declare const process: {
  env: {
    // ZHIDEMAI_API_KEY?: string;
  }
};

// Mock数据生成函数（当MCP不可用时使用）
const SOURCES: ('京东' | '天猫' | '淘宝')[] = ['京东', '天猫', '淘宝'];
const getRandomSource = () => SOURCES[Math.floor(Math.random() * SOURCES.length)];

const generateMockProducts = (keywords: string[], minPrice: number, maxPrice: number): Product[] => {
  const products: Product[] = [];

  keywords.forEach((keyword, index) => {
    const count = Math.random() > 0.5 ? 2 : 1;
    
    for (let i = 0; i < count; i++) {
      let price = Math.floor(Math.random() * (maxPrice - minPrice + 1)) + minPrice;
      if (Math.random() > 0.8) price = Math.floor(price * 1.1);

      products.push({
        id: `mock_${index}_${i}_${Date.now()}`,
        title: `${keyword} - ${['限量版', '礼盒装', '2024新款', '高颜值'][Math.floor(Math.random() * 4)]}`,
        price: price,
        imageUrl: `https://picsum.photos/400/300?random=${Math.floor(Math.random() * 1000) + index + i}`,
        source: getRandomSource(),
        link: 'https://www.jd.com',
        tags: Math.random() > 0.5 ? ['包邮', '次日达'] : ['高性价比'],
        keywords: keyword
      });
    }
  });

  return products.sort(() => Math.random() - 0.5);
};

/**
 * 根据关键词搜索商品
 * 默认使用图片搜索，失败时降级为Mock数据
 * MCP已弃用
 */
export const searchProductsByKeywords = async (
  keywords: string[], 
  minPrice: number, 
  maxPrice: number
): Promise<Product[]> => {
  // MCP已弃用，直接使用图片搜索
  // if (hasApiKey) {
  //   try {
  //     console.log('🔍 正在调用值得买MCP搜索真实商品数据...');
  //     const products = await batchSearchZhidemai(keywords, minPrice, maxPrice);
  //     
  //     if (products.length > 0) {
  //       console.log(`✅ 成功获取 ${products.length} 件真实商品`);
  //       // 根据预算过滤
  //       const filteredProducts = products.filter(p => {
  //         // 允许20%的预算溢出
  //         return p.price >= minPrice * 0.8 && p.price <= maxPrice * 1.2;
  //       });
  //       return filteredProducts.length > 0 ? filteredProducts : products.slice(0, 12);
  //     }
  //     
  //     console.warn('⚠️ MCP返回空结果，使用兜底方案');
  //   } catch (error) {
  //     console.error('❌ MCP调用失败，降级使用兜底方案:', error);
  //   }
  // } else {
  //   console.log('ℹ️ 未配置ZHIDEMAI_API_KEY，使用图片兜底/模拟数据');
  // }

  // Step 1: 图片搜索（默认方案）
  try {
    console.log('🖼️ 正在使用图片搜索获取商品...');
    const imageResults = await Promise.all(
      keywords.map((kw) => searchImagesByKeyword(kw, minPrice, maxPrice))
    );
    const flatImages = imageResults.flat();
    if (flatImages.length > 0) {
      console.log(`✅ 图片搜索获取 ${flatImages.length} 条结果`);
      return flatImages;
    }
  } catch (error) {
    console.error('❌ 图片搜索失败:', error);
  }

  // Step 2: 最终兜底 - 使用Mock数据
  console.log('⚠️ 图片搜索无结果，使用Mock数据');
  return generateMockProducts(keywords, minPrice, maxPrice);
};
